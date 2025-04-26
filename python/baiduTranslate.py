
import requests
import random
import json
from hashlib import md5
appid = 'appid'
appkey = 'appKey'
endpoint = 'http://api.fanyi.baidu.com'
path = '/api/trans/vip/translate'
url = endpoint + path

def make_md5(s, encoding='utf-8'):
    return md5(s.encode(encoding)).hexdigest()
def baiduTranslate(query,from_lang='zh',to_lang='en'):
    # query = '你好，我是程序员ShadowJobs.\n欢迎访问.'
    salt = random.randint(32768, 65536)
    sign = make_md5(appid + query + str(salt) + appkey)
    headers = {'Content-Type': 'application/x-www-form-urlencoded'}
    payload = {'appid': appid, 'q': query, 'from': from_lang, 'to': to_lang, 'salt': salt, 'sign': sign}
    r = requests.post(url, params=payload, headers=headers)
    result = r.json()
    print(json.dumps(result, indent=4, ensure_ascii=False))
    return result

if __name__ == '__main__':
    baiduTranslate('你好，我是程序员ShadowJobs.\n欢迎访问.')
