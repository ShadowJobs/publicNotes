from flask import jsonify, request, g
import requests
import json
import os, sys
import logging

from db.redisCon import redis_client
from tools.cache import LRUMemCache

current_path = os.path.join(os.path.abspath(os.path.dirname(__file__)))
base_path = os.path.dirname(current_path)
sys.path.append(base_path)
print(base_path)

import settings


def internal_checker():
    ret = token_checker(force=True)()
    if ret is not None:
        g.user = "internal_default"
        g.token = None


def token_checker(force=True):
    def __token_checker():
        token = request.headers.get("Authorization")
        user = get_user_name_by_token(token)
        g.user = user
        if user is not None:
            g.token = token
        else:
            if settings.AUTH_REQUIRED and force:
                return jsonify(code=-1, message='invalid token')
            else:
                g.user = "no_auth_default"
                g.token = None
                return

    return __token_checker


USER_TOKEN_CACHE = LRUMemCache(max_size=1024)
USER_TOKEN_CACHE_LIFE = 5


def get_user_name_by_token(token):
    if token is None:
        return None
    logging.info(f"Query token: {token}")
    user = USER_TOKEN_CACHE.get(token)
    if user is not None:
        logging.info(f"Get user from cache, result {user}")
        return user
    user = _get_user_name_by_token(token)
    if user is not None:
        USER_TOKEN_CACHE.put(token, user)
    return user


def _get_user_name_by_token(token):
    rdb = redis_client()
    username = rdb.get(token)
    return username


def grant_user_auth(old_user, new_name):
    url = "%s/auth/api/v1/user/grant?old_user=%s&new_name=%s" % (settings.AUTH_SERVICE, old_user, new_name)
    res = requests.get(url)
    data = json.loads(res.content.decode())
    if data.get("code") != 0:
        return False
    return True


def check_user_by_name(user_name):
    url = "%s/auth/api/v1/user/check_user_by_name?user_name=%s" % (settings.AUTH_SERVICE, user_name)
    res = requests.get(url)
    data = json.loads(res.content.decode())
    if data.get("code") != 0:
        return False
    return True