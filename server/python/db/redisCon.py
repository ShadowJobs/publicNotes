import redis
rdb = None
def redis_client():
    global rdb
    try:
        if rdb is None:
            rdb = redis.Redis(host="127.0.0.1", port=6379, password="difyai123456")
        return rdb
    except redis.RedisError as e:
        print(f"Redis error: {e}")
        # 这里可以处理错误，也可以重试连接，或者返回None
        return None