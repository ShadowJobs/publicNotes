from flask import request, jsonify, current_app, Blueprint
import requests
from urllib.parse import quote
import os

from api.UserApi import admin_required
from fileTransfer import redis_cache
# 从环境变量获取
TOKEN = os.getenv('GITHUB_TOKEN')
documentRouter = Blueprint("document",__name__,url_prefix="/doc")
@documentRouter.route("/file/<path:filename>", methods=['GET', 'POST'])
def getFileContent(filename):
    print(request.method)
    print(request.view_args)
    print(request)
    if request.method == 'POST':
        return jsonify({"msg": "POST request received"})
    elif request.method == 'GET':
        with open("./documents/"+filename, "r") as f:
            data = f.read()
        return jsonify({"data":data})
    
# 获取'./documents/'目录下的所有文件名
@documentRouter.route("/file-list", methods=['GET'])
def fileList():
    import os
    files = os.listdir("./documents/")
    return jsonify({"data":files})


def get_github_tree(owner, repo, token, path=''):
    """递归获取目录结构（适配2024年最新API）"""
    url = f"https://api.github.com/repos/{quote(owner)}/{quote(repo)}/contents/{quote(path)}"
    
    headers = {
        "Authorization": f"Bearer {token}",  # 最新标准认证方式
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",  # 必须指定API版本
        "User-Agent": "MyGitHubViewer/1.0"  # GitHub强制要求
    }
    
    try:
        response = requests.get(url, headers=headers)
        
        # 增强错误处理
        if response.status_code == 404:
            raise Exception(f"路径不存在: {path}")
        elif response.status_code == 403:
            raise Exception("API速率限制已用尽")
        elif response.status_code != 200:
            raise Exception(f"API请求失败: {response.text}")
            
        items = response.json()
        tree = []
        
        # 处理分页（最新API默认返回最多100条）
        while 'next' in response.links:
            response = requests.get(response.links['next']['url'], headers=headers)
            items.extend(response.json())

        for item in items:
            if item["type"] == "dir":
                node = {
                    "name": item["name"],
                    "path": item["path"],
                    "type": "dir",
                    "children": get_github_tree(owner, repo, token, item["path"])
                }
            else:
                node = {
                    "name": item["name"],
                    "path": item["path"],
                    "type": "file",
                    "size": item["size"],
                    "url": item["html_url"],  # 新增浏览器访问地址
                    "raw_url": item.get("download_url") or item["html_url"] + "?raw=true"
                }
            tree.append(node)
            
        return tree
        
    except Exception as e:
        print(f"[DEBUG] 请求失败: {str(e)}")
        return None

# @redis_cache(key_pattern="github_file_list_{}", timeout=3600)  # 缓存一小时-----这里如果加上缓存会绕过权限验证
@documentRouter.route("/github-file-list", methods=['GET'])
@admin_required
def githubFileList():
    token = TOKEN
    owner = "ShadowJobs"
    repo = "live"
    
    # 验证仓库存在性
    validate_url = f"https://api.github.com/repos/{owner}/{repo}"
    try:
        validate_res = requests.get(
            validate_url,
            headers={
                "Authorization": f"Bearer {token}",
                "User-Agent": "MyGitHubViewer/1.0"
            }
        )
        if validate_res.status_code == 404:
            return jsonify({"error": "仓库不存在或无权访问"}), 404
    except:
        pass
        
    # 获取目录结构
    tree = get_github_tree(owner, repo, token)
    
    if tree is None:
        return jsonify({
            "success": False,
            "error": "请检查：1.Token权限(repo权限) 2.仓库是否私有 3.路径是否存在"
        }), 500
        
    return jsonify({
        "success": True,
        "data": {
            "repo": f"{owner}/{repo}",
            "tree": tree
        }
    })

@documentRouter.route("/github-file-content", methods=['GET'])
@redis_cache(key_pattern="github_file_content_{}", timeout=3600)  # 缓存一小时
@admin_required
def githubFileContent():
    """
    官方文档要求参数：
    - path: 文件路径 (required)
    - ref: 分支/commit SHA (optional)
    """
    # 验证必要参数
    file_path = request.args.get('path')
    if not file_path:
        return jsonify({
            "message": "Missing required parameter 'path'",
            "documentation_url": "https://docs.github.com/rest/repos/contents#get-repository-content"
        }), 400

    token = TOKEN  # 从环境变量获取
    owner = "ShadowJobs"
    repo = "live"
    ref = request.args.get('ref', 'master')  # 默认main分支

    # 构造官方API请求
    encoded_path = quote(file_path.strip('/'))
    api_url = f"https://api.github.com/repos/{owner}/{repo}/contents/{encoded_path}"

    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github.raw",  # 直接获取原始内容
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "LiveFileViewer/1.0"
    }

    params = {"ref": ref} if ref else {}

    try:
        # 遵守GitHub API速率限制
        response = requests.get(api_url, headers=headers, params=params, timeout=10)
        
        # 处理标准API响应
        if response.status_code == 200:
            return response.content, {
                'Content-Type': response.headers.get('Content-Type', 'text/plain'),
                'X-RateLimit-Limit': response.headers.get('X-RateLimit-Limit'),
                'X-RateLimit-Remaining': response.headers.get('X-RateLimit-Remaining')
            }
            
        elif response.status_code == 404:
            return jsonify({
                "message": "Not Found",
                "documentation_url": "https://docs.github.com/rest/repos/contents#get-repository-content"
            }), 404
            
        elif response.status_code == 403:
            return jsonify({
                "message": "API rate limit exceeded",
                "rate_limit": response.headers.get('X-RateLimit-Limit'),
                "retry_after": response.headers.get('Retry-After')
            }), 429
            
        else:
            return jsonify({
                "message": "Unexpected error",
                "status_code": response.status_code,
                "response": response.text[:200]  # 限制错误信息长度
            }), 500

    except requests.Timeout:
        return jsonify({
            "message": "GitHub API request timeout",
            "documentation_url": "https://docs.github.com/rest/overview/resources-in-the-rest-api#timeouts"
        }), 504
        
    except Exception as e:
        return jsonify({
            "message": "Internal server error",
            "error": str(e)
        }), 500