from flask import request, jsonify
from flask import Blueprint
import json

contentTypeRouter = Blueprint("contenttype",__name__,url_prefix="/ct")
@contentTypeRouter.route("/content-type", methods=['GET', 'POST'])
def applicationJson():
    if request.method == 'POST':
        try:
            contentType=request.headers.get('Content-Type')
            urlParams=request.args.to_dict()
            data={}
            # if(contentType=='application/json'): #这种写法不好，因为1，有些请求头的值是application/json;charset=UTF-8，2，有点header是小写的，3，有些请求的body部分不是有效的json
            if(request.is_json): #is_json包含了application/json和text/json,application/json;charset=UTF-8;boundary=xxx等等，并且body部分是有效的json
                data = request.get_json()
                return jsonify({"body":data,'urlParams':urlParams})
            elif(contentType=='application/x-www-form-urlencoded'):
                data = request.form.to_dict()
                data_str = list(data.keys())[0]
                data = json.loads(data_str)
            elif(contentType=='multipart/form-data'):
                data = request.form.to_dict()
                data = json.loads(request.data.decode())
            elif(contentType=='text/plain'):
                data = json.loads(request.data.decode())
            else:
                data = request.data
            return jsonify({"body":data,'urlParams':urlParams})
        except Exception as e:
            print(e)
            return jsonify({"msg": "error",'code':0})
    elif request.method == 'GET':
        return jsonify({"msg": "GET request received"})