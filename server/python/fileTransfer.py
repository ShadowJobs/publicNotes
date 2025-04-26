import os
from flask import request, jsonify, send_file, g, Response
from flask import Blueprint
from werkzeug.utils import secure_filename
import uuid
from db.models import User, UploadedFile
from db.mysqlCon import Session
import functools
from db.redisCon import redis_client
import json
import redis
import re

filetransRouter = Blueprint("filetrans", __name__, url_prefix="/file-trans")



def redis_cache(key_pattern, timeout=300):
    def decorator(f):
        @functools.wraps(f)
        def decorated_function(*args, **kwargs):
            rdb = redis_client()
            path = request.args.get("path", 7)
            redis_key = key_pattern.format(path)
            cached_stats = rdb.get(redis_key)
            
            if cached_stats is not None:
                return jsonify(code=0, msg="success", data=json.loads(cached_stats))

            # 调用实际的视图函数
            response = f(*args, **kwargs)
            
            # 处理返回值 - 确保我们能正确获取data
            if hasattr(response, 'json'):
                data = response.json.get("data")
                # 把结果存储到Redis
                rdb.set(redis_key, json.dumps(data), ex=timeout)
            
            return response
        return decorated_function
    return decorator

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@filetransRouter.route("/avatar/upload", methods=['POST'])
def upload_avatar():
    if 'file' not in request.files:
        return jsonify({"status": "error", "msg": "No file part"}), 400
    file = request.files['file']
    user_id = request.form.get('user_id')
    if file.filename == '':
        return jsonify({"status": "error", "msg": "No selected file"}), 400
    # 文件大小不能超过2M
    # if len(file.read()) > 2 * 1024 * 1024: #这种方法有问题，因为file.read()会把文件读取完，指针移动到了文件末尾
    #     return jsonify({"status": "error", "msg": "File size too large"}), 400
    # 检查文件大小
    file.seek(0, os.SEEK_END)
    file_size = file.tell()
    file.seek(0)  # 重置文件指针到开头
    
    if file_size > 2 * 1024 * 1024:  # 2MB
        return jsonify({"status": "error", "msg": "File size too large"}), 400
    
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        # 使用UUID作为文件名以避免冲突
        unique_filename = f"{uuid.uuid4()}_{filename}"
        AVATAR_FOLDER = os.path.join(UPLOAD_FOLDER, "avatar")
        if not os.path.exists(AVATAR_FOLDER):
            os.makedirs(AVATAR_FOLDER)
        file_path = os.path.join(AVATAR_FOLDER, unique_filename)
        User.delete_old_avatar(user_id)
        file.save(file_path)
        User.update_avatar(user_id, file_path)
        return jsonify({"status": "success", "msg": "Avatar uploaded successfully"}), 200
    return jsonify({"status": "error", "msg": "File type not allowed"}), 400

@filetransRouter.route("/avatar/<int:user_id>", methods=['GET'])
def get_avatar(user_id):
    session = Session()
    avatar = session.query(User).filter_by(id=user_id).first()
    session.close()
    
    if avatar:
        if not os.path.exists(avatar.avatar_path):
            return jsonify({"status": "error", "msg": "Avatar not found"}), 404
        return send_file(avatar.avatar_path, mimetype='image/jpeg')
    else:
        return jsonify({"status": "error", "msg": "Avatar not found"}), 404
    
def merge_chunks(file_md5, filename, chunk_num,dir):
    # 合并文件分片
    with open(os.path.join(dir, file_md5+"_"+filename), 'wb') as destination:
        size = 0
        for i in range(chunk_num):
            chunk_path = os.path.join(dir, f"{filename}_{file_md5}_{i}")
            with open(chunk_path, 'rb') as source:
                d = source.read()
                destination.write(d)
                size += len(d)
            os.remove(chunk_path)  # 删除已合并的分片
        return size

@filetransRouter.route("/bigfile/upload-chunk", methods=['POST'])
def upload_chunk():
    if 'file' not in request.files:
        return jsonify({"status": "error", "msg": "No file part"}), 400

    user_id = request.form.get('user_id')
    # 一个用户最多上传10个文件
    session = Session()
    uploaded_files = session.query(UploadedFile).filter_by(user_id=user_id).all()
    if len(uploaded_files) >= 10:
        return jsonify({"status": "error", "msg": "Too many files uploaded", "code": 11}), 200

    file = request.files['file']
    md5 = request.form.get('md5')
    index = int(request.form.get('index'))
    chunk_num = int(request.form.get('chunk_num')) # 一个分片5M
    # 大于500M的禁止上传
    if chunk_num > 100:
        return jsonify({"status": "error", "msg": "File size too large","code":10}),200
    rdb = redis_client()
    print(f"index: {index}, chunk_num: {chunk_num}")

    if file.filename == '':
        return jsonify({"status": "error", "msg": "No selected file"}), 400
    
    filename = secure_filename(file.filename)
    unique_filename = f"{filename}_{md5}_{index}"
    UPLOAD_BIGFILE_FOLDER = os.path.join(UPLOAD_FOLDER, "bigfile")
    if not os.path.exists(UPLOAD_BIGFILE_FOLDER):
        os.makedirs(UPLOAD_BIGFILE_FOLDER)
    file_path = os.path.join(UPLOAD_BIGFILE_FOLDER, unique_filename)
        # 检查redis里是否已经有了这个文件,以及这个分片是否已经上传过
        # redis里的格式为 md5_filename:{
        #   finished: 0/1,
        #   chunks: [0, 1, 0, 0, 0, 0, 0, 0, 0, 0]
        # }
    uploaded_file_key = f"{md5}_{filename}"

    with rdb.pipeline() as pipe:
        while True:
            try:
                # 监视键，准备执行事务
                pipe.watch(uploaded_file_key)

                # 读取当前上传文件的状态或初始化一个新状态
                uploadedFile_str = pipe.get(uploaded_file_key)
                if uploadedFile_str:
                    uploadedFile = json.loads(uploadedFile_str)
                else:
                    uploadedFile = {"finished": 0, "chunks": [0] * chunk_num}
                    pipe.set(uploaded_file_key, json.dumps(uploadedFile))
                    pipe.set(f"last_upload_info_{user_id}", uploaded_file_key)

                # 检查文件是否已完成或分片是否已存在
                if uploadedFile.get("finished") == 1:
                    return jsonify({"status": "error", "msg": "File already exists", "code": 2, "finished": 1}), 200
                if uploadedFile.get("chunks")[index] == 1:
                    return jsonify({"status": "error", "msg": "Chunk already exists", "code": 3, "chunkFinished": 1}), 200
                # 开始事务
                pipe.multi()
                uploadedFile['chunks'][index] = 1
                all_chunks_uploaded = all(x == 1 for x in uploadedFile['chunks'])
                if all_chunks_uploaded:
                    uploadedFile['finished'] = 1
                pipe.set(uploaded_file_key, json.dumps(uploadedFile))
                response = pipe.execute()
                if response:
                    file.save(file_path)
                break
            except redis.WatchError:
                print(f"WatchError,index: {index},file: {filename}")
                # 如果发生WatchError，则继续循环重试
                continue

    if uploadedFile['finished'] == 1:
        sz=merge_chunks(md5, filename, chunk_num, UPLOAD_BIGFILE_FOLDER)
        session = Session()
        uploaded_file = UploadedFile(user_id=user_id, filename=filename, md5=md5, chunk_num=chunk_num, size=sz)
        session.add(uploaded_file)
        session.commit()
        session.close()

        return jsonify({"status": "success", "msg": "File uploaded and merged successfully", "finished": 1}), 200
    else:
        return jsonify({"status": "success", "msg": "Chunk uploaded successfully"}), 200

# 获取文件的所有分片的下载情况
@filetransRouter.route("/bigfile/slice", methods=['GET'])
def get_slice():
    rdb = redis_client()
    md5 = request.args.get("md5")
    filename = request.args.get("filename")
    uploaded_file_key = f"{md5}_{filename}"
    uploadedFile = rdb.get(uploaded_file_key)
    if not uploadedFile:
        return jsonify({"status": "error", "msg": "File not found"}), 404
    return jsonify({"status": "success", "data": json.loads(uploadedFile)}), 200


@filetransRouter.route("/bigfile/lastuploadinfo", methods=['GET'])
def last_upload_info():
    try:
        rdb = redis_client()
        if rdb is None:
            raise Exception("Unable to connect to Redis")

        user_id = request.args.get("user_id")
        lastkey = rdb.get(f"last_upload_info_{user_id}")
        
        if lastkey:
            lastinfo = rdb.get(lastkey)
            if lastinfo:
                return jsonify({"status": "success", "data": json.loads(lastinfo)}), 200
            else:
                return jsonify({"status": "error", "msg": "Last info not found"}), 404
        else:
            return jsonify({"status": "success", "msg": "File not found", "code":1,"data":None}), 200
    except Exception as e:
        return jsonify({"status": "error", "msg": str(e)}), 500


@filetransRouter.route("/bigfile/uploaded-list", methods=['GET'])
def uploaded_list():
    session = Session()
    user_id = request.args.get("user_id")
    uploaded_files = session.query(UploadedFile).filter_by(user_id=user_id).all()
    session.close()
    data = []
    for file in uploaded_files:
        data.append({"filename": file.filename, "md5": file.md5, "chunk_num": file.chunk_num, 
                     "upload_time": file.upload_time,"id":file.id,"size":file.size})
    return jsonify({"status": "success", "data": data, "code":1}), 200

@filetransRouter.route("/bigfile/download/<int:file_id>", methods=['GET'])
def download_file(file_id):
    session = Session()
    uploaded_file = session.query(UploadedFile).filter_by(id=file_id).first()
    session.close()
    
    if not uploaded_file:
        return jsonify({"status": "error", "msg": "File not found"}), 404
    
    file_path = os.path.join(UPLOAD_FOLDER, "bigfile", f"{uploaded_file.md5}_{uploaded_file.filename}")
    file_size = os.path.getsize(file_path)
    
    range_header = request.headers.get('Range', None)
    if range_header:
        byte1, byte2 = 0, None
        match = re.search(r'bytes=(\d+)-(\d*)', range_header)
        groups = match.groups()

        if groups[0]:
            byte1 = int(groups[0])
        if groups[1]:
            byte2 = int(groups[1])

        if byte2 is None or byte2 >= file_size:
            byte2 = file_size - 1
        
        length = byte2 - byte1 + 1

        def generate():
            with open(file_path, 'rb') as f:
                f.seek(byte1)
                data = f.read(length)
                yield data

        resp = Response(generate(), 206, mimetype='application/octet-stream',
                        content_type='application/octet-stream', direct_passthrough=True)
        resp.headers.add('Content-Range', f'bytes {byte1}-{byte2}/{file_size}')
        resp.headers.add('Accept-Ranges', 'bytes')
        resp.headers.add('Content-Length', str(length))
        resp.headers.add('Content-Disposition', f'attachment; filename="{uploaded_file.filename}"')
        return resp

    else:
        return send_file(file_path, as_attachment=True, attachment_filename=uploaded_file.filename)


@filetransRouter.route("/bigfile/<int:file_id>", methods=['DELETE'])
def delete_bigfile(file_id):
    session = Session()
    uploaded_file = session.query(UploadedFile).filter_by(id=file_id).first()
    if not uploaded_file:
        return jsonify({"status": "error", "msg": "File not found"}), 404
    session.delete(uploaded_file)
    session.commit()
    session.close()

    rdb = redis_client()
    uploaded_file_key = f"{uploaded_file.md5}_{uploaded_file.filename}"
    rdb.delete(uploaded_file_key)
    rdb.delete(f"last_upload_info_{uploaded_file.user_id}")
    file_path = os.path.join(UPLOAD_FOLDER, "bigfile", f"{uploaded_file.md5}_{uploaded_file.filename}")
    os.remove(file_path)
    return jsonify({"status": "success", "msg": "File deleted successfully","code":1}), 200