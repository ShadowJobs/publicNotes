# -*- coding: utf-8 -*-

import logging

import uuid
import threading

from db.redisCon import redis_client
from db.redis_lock import RedisLock

from sqlalchemy import and_, update
import datetime

rdb = redis_client()

TIME_OUT_REDIS_KEY = "time_out_redis_key"


def get_mac_address():
    mac_address = uuid.UUID(int=uuid.getnode()).hex[-12:].upper()
    mac_address = '-'.join([mac_address[i:i + 2] for i in range(0, 11, 2)])
    return mac_address


def detect_job_timeout():
    forty_eight_hours_ago = datetime.datetime.now() - datetime.timedelta(hours=48)


def detect_schedule_entry():
    mac_address = get_mac_address()
    thread_name = threading.currentThread().name
    mac_address = "{}-{}".format(mac_address, thread_name)
    logging.info("mac_address : {}".format(mac_address))
    get_lock = RedisLock.acquire_lock(rdb, TIME_OUT_REDIS_KEY)
    if get_lock:
        try:
            logging.info("detect_job_timeout started..")
            detect_job_timeout()
            logging.info("detect_job_timeout finished..")
        finally:
            RedisLock.release_lock(rdb, TIME_OUT_REDIS_KEY, get_lock)
    else:
        logging.info("{} didn't get lock so stop_thread....".format(thread_name))
        return


if __name__ == '__main__':
    detect_schedule_entry()