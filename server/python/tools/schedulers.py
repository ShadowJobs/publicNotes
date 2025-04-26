import logging
import time
from typing import Any, Union

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.schedulers.blocking import BlockingScheduler
from pytz import UTC
import pytz


class BaseScheduler(object):
    def __init__(self):
        self.scheduler = None

    def shutdown(self, wait=True):
        if self.scheduler is not None:
            self.scheduler.shutdown(wait=wait)

    @staticmethod
    def get_scheduler(is_block, timez):
        if is_block:
            scheduler = BlockingScheduler(timezone=timez)
        else:
            scheduler = BackgroundScheduler(timezone=timez)
        return scheduler


class DailyScheduler(BaseScheduler):
    def start(self, func, hour, minute, second=0, is_block=False):
        timez: Union[UTC, Any] = pytz.timezone('Asia/Shanghai')
        self.scheduler = self.get_scheduler(is_block, timez)
        self.scheduler.add_job(func, 'cron', hour=hour, minute=minute, second=second)
        self.scheduler.start()


class HourlyScheduler(BaseScheduler):
    def start(self, func, minute, second=0, is_block=False):
        timez: Union[UTC, Any] = pytz.timezone('Asia/Shanghai')
        self.scheduler = self.get_scheduler(is_block, timez)
        self.scheduler.add_job(func, 'cron', minute=minute, second=second)
        self.scheduler.start()


class MinuteScheduler(BaseScheduler):
    def start(self, func, second, is_block=False):
        timez: Union[UTC, Any] = pytz.timezone('Asia/Shanghai')
        self.scheduler = self.get_scheduler(is_block, timez)
        self.scheduler.add_job(func, 'cron',  second=second)
        self.scheduler.start()


class IntervalScheduler(BaseScheduler):
    def start(self, func, second, is_block=False):
        timez: Union[UTC, Any] = pytz.timezone('Asia/Shanghai')
        self.scheduler = self.get_scheduler(is_block, timez)
        self.scheduler.add_job(func, 'interval', seconds=second)
        self.scheduler.start()


if __name__ == '__main__':
    def fun():
        logging.info("tiger")
        time.sleep(5)

    scheduler = IntervalScheduler()
    scheduler.start(fun, second=6)

    time.sleep(500)
