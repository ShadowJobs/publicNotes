# from openai import OpenAI
# api_key=""
# client = OpenAI(api_key=api_key)

# completion = client.chat.completions.create(
#   model="gpt-3.5-turbo",
#   messages=[
#     {"role": "system", "content": "You are a poetic assistant, skilled in explaining complex programming concepts with creative flair."},
#     {"role": "user", "content": "Compose a poem that explains the concept of recursion in programming."}
#   ]
# )
# print(completion.choices[0].message)


import datetime
import os
import threading
import time
import uuid

from scripts.detect_time_out import detect_schedule_entry

from flask import request, g
from flask_compress import Compress
from flask_cors import *
import logging

from apps import app
from tools.schedulers import DailyScheduler

from contenttype import contentTypeRouter
from documentApi import documentRouter
from errorStatistic import errStatisticRouter
from fileTransfer import filetransRouter

from db.models import ApiLog
from tools.token_checker import token_checker

CORS(app)
compress = Compress()

@app.route("/gpt")
def gpt():
    return "欢迎来到我的GPT服务！"

@app.route("/")
def main():
    return "欢迎来到我的Python服务！"

def run_https():
    app.run(host="0.0.0.0", port=5003, ssl_context="adhoc")


def run_http(default_port=5003, debug=False):
    app.run(host="0.0.0.0", port=default_port, debug=debug)



def init():
    logging.info('app init')
    compress.init_app(app)

    logging.info('app begin to register blueprint')

    # app.add_url_rule("/gpt", "gpt", gpt) 另一种写法
    # app.add_url_rule("/", "main", main)
    app.register_blueprint(contentTypeRouter)
    app.register_blueprint(documentRouter)
    app.register_blueprint(errStatisticRouter)
    app.register_blueprint(filetransRouter)

    scheduler_method()

    logging.info('app end to register blueprint')


def get_mac_address():
    mac_address = uuid.UUID(int=uuid.getnode()).hex[-12:].upper()
    mac_address = '-'.join([mac_address[i:i + 2] for i in range(0, 11, 2)])
    return mac_address


def scheduler_method():
    logging.info('app run thread name - {} ...'.format(threading.current_thread().name))

    def detect_job_timeout_scheduler_with_app_context():
        with app.app_context():
            detect_schedule_entry()

    detect_job_timeout_scheduler = DailyScheduler()
    detect_job_timeout_scheduler.start(detect_job_timeout_scheduler_with_app_context, hour=15, minute=0, second=0)

    detect_job_timeout_scheduler1 = DailyScheduler()
    detect_job_timeout_scheduler1.start(detect_job_timeout_scheduler_with_app_context, hour=21, minute=0, second=0)

logging.info('start app')
init()




@app.before_request
def before_app_request():
    api_name = request.url

    token_checker(force=True)()
    g.start = time.time()
    g.start_date_time = datetime.datetime.now()

    logging.info("----------------------------------------------------")
    logging.info("URL : " + api_name)
    logging.info("HTTP_METHOD : " + request.method)


@app.after_request
def after_app_request(response):
    """If some exceptions raised in business code, this function will not be invoked when flask app running in python entry.py.
    Otherwise, if flask app running with gunicorn, this function still will be invoked.
    This behavior happened with gunicorn is different from the docstring of  `@after_request`.
    """
    api_name = request.path
    host = request.host

    now_time = time.time()
    execute_ms = (now_time - g.start) * 1000
    status = response.status_code
    succeed = True

    if status >= 500:
        succeed = False

    if hasattr(g, "user"):
        user = g.user
    else:
        user = None
    ApiLog.insert_api_log(api_name, host, g.start_date_time, execute_ms, succeed, user)

    logging.info("SPEND TIME : {} ms".format(execute_ms))
    logging.info("----------------------------------------------------")
    return response


@app.errorhandler(Exception)
def handle_exception(e):
    from werkzeug.exceptions import HTTPException
    from flask import jsonify

    if isinstance(e, HTTPException) and e.code < 500:
        return e

    import traceback
    api_name = request.path

    tb = traceback.format_exc()
    logging.error(f"Api {api_name} error happened, error traceback: \n {tb}")
    response = jsonify({'error': str(e)})
    response.status_code = 500

    return response

# flask调试启动时的入口，可以在此处进行一些初始化操作
# @app.cli.show_server_banner
# def show_server_banner(env, debug, *args, **kwargs):
#     if env.get('WERKZEUG_RUN_MAIN') != 'true':
#         logging.info("Start app...")
#         # 注意：这里不需要调用 run_http，因为 Flask 已经在运行服务器
#         # 您可以在这里进行其他初始化操作

# 这里也是判断是否是通过flask调试启动的
if os.environ.get('FLASK_RUN_FROM_CLI') == 'true':
    logging.info("Start app...")
    # 执行需要在应用启动时运行的代码
    # 注意：不要在这里调用 run_http，因为 Flask CLI 会处理服务器的运行


if __name__ == "__main__":
    logging.info("Start app...")
    port = 5003
    debug = os.environ.get("APP_DEBUG", False)
    run_http(port, debug=debug)
