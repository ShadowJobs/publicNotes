# -*- encoding: utf-8 -*-

import math
import time
import uuid

import redis

from db.redisCon import redis_client

DETECT_SERVER_EXPIRE_TIME=5
WAIT_RES_KEY='wait_res_key'

class RedisLock:
    @staticmethod
    def acquire_lock(cli, lock_name,
                     lock_timeout=DETECT_SERVER_EXPIRE_TIME):
        """获取锁
        @param cli:   Redis实例
        @param lock_name:   锁名称
        @param acquire_timeout: 客户端获取锁的超时时间（秒）, 默认3s
        @param lock_timeout: 锁过期时间（秒）, 超过这个时间锁会自动释放, 默认2s
        """
        lock_name = f"lock:{lock_name}"
        identifier = str(uuid.uuid4())
        lock_timeout = math.ceil(lock_timeout)

        # 如果不存在当前锁, 则进行加锁并设置过期时间, 返回锁唯一标识
        if cli.set(lock_name, identifier, ex=lock_timeout, nx=True):  # 一条命令实现, 保证原子性
            return identifier
        # 如果锁存在但是没有失效时间, 则进行设置, 避免出现死锁
        elif cli.ttl(lock_name) == -1:
            cli.expire(lock_name, lock_timeout)

        # 客户端在超时时间内没有获取到锁, 返回False
        return None

    @staticmethod
    def release_lock(cli, lock_name, identifier):
        """释放锁
        @param cli: Redis实例
        @param lock_name:   锁名称
        @param identifier:  锁标识
        """
        with cli.pipeline() as pipe:
            lock_name = f"lock:{lock_name}"
            while True:
                try:
                    pipe.watch(lock_name)
                    lock_id = pipe.get(lock_name)
                    str_lock_id = str(lock_id, encoding="utf-8")
                    if lock_id and str_lock_id == identifier:
                        pipe.multi()
                        pipe.delete(lock_name)
                        pipe.execute()  # 执行EXEC命令后自动执行UNWATCH （DISCARD同理）
                        return True
                    pipe.unwatch()  # 没有参数
                    break
                except redis.WatchError:
                    pass
            return False

    @staticmethod
    def expire_lock(cli, lock_name, expire_time):
        lock_name = f"lock:{lock_name}"
        cli.expire(lock_name, expire_time)


def release_lock(rdb_cli):
    rdb_cli.expire(WAIT_RES_KEY, 2)
    print(rdb_cli.ttl(WAIT_RES_KEY))


if __name__ == '__main__':
    rdb = redis_client()
    RedisLock.expire_lock(rdb, WAIT_RES_KEY, 2)

    get_lock = RedisLock.acquire_lock(rdb, WAIT_RES_KEY)
    if get_lock:
        print("Successfully schedule wait_sim_result_one_time on : mac_address : {}")
        time.sleep(1)
        RedisLock.release_lock(rdb, WAIT_RES_KEY, get_lock)
        print("release_lock")

    get_lock = RedisLock.acquire_lock(rdb, WAIT_RES_KEY)
    if get_lock:
        print("Successfully schedule wait_sim_result_one_time on : mac_address : {}")
        time.sleep(1)
        RedisLock.release_lock(rdb, WAIT_RES_KEY, get_lock)
        print("release_lock")

    print("tiger")
