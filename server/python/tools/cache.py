import threading
from datetime import datetime, timedelta


class LRUMemCache(object):
    DEFAULT_LIFE = 5*60

    def __init__(self, max_size: int = 128):
        self._max_size = max_size
        self._cache = dict()
        self._tts = dict()
        self._lock = threading.Lock()

    def get(self, key):
        if key not in self._cache:
            return None
        exp_time = self._tts[key]
        if datetime.now() >= exp_time:
            self.evict(key)
            return None
        return self._cache[key]

    def evict(self, key):
        self._cache.pop(key, None)
        self._tts.pop(key, None)

    def put(self, key, value, life: int = DEFAULT_LIFE):
        if life <= 0:
            life = LRUMemCache.DEFAULT_LIFE
        exp_time = datetime.now() + timedelta(seconds=life)
        self._cache[key] = value
        self._tts[key] = exp_time

        if len(self._cache) > self._max_size:
            self._clean()

    def _clean(self):
        self._lock.acquire()
        try:
            if len(self._cache) <= self._max_size:
                return
            no_exp_items = []
            now = datetime.now()
            # remove expired items
            # copy to avoid modification
            copy = self._tts.copy()
            for key, tts in copy.items():
                if now >= tts:
                    self.evict(key)
                else:
                    no_exp_items.append([key, tts])
            if len(self._cache) <= self._max_size:
                return
            # remove nearly expired items
            no_exp_items.sort(key=lambda x: x[1])
            for i in range(0, len(self._cache) - self._max_size):
                self.evict(no_exp_items[i][0])
        finally:
            self._lock.release()