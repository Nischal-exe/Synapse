import time

class MockRedis:
    def __init__(self):
        self.store = {}
        self.expires = {}

    def setex(self, name, time_sec, value):
        self.store[name] = value
        self.expires[name] = time.time() + time_sec
        return True

    def get(self, name):
        if self._is_expired(name):
            return None
        return self.store.get(name)

    def delete(self, name):
        self.store.pop(name, None)
        self.expires.pop(name, None)
        return 1

    def exists(self, name):
        return not self._is_expired(name)

    def ttl(self, name):
        if name not in self.store:
            return -2
        expiry = self.expires.get(name)
        if expiry is None:
            return -1
        remaining = int(expiry - time.time())
        return max(0, remaining) if remaining >= 0 else -2

    def _is_expired(self, name):
        if name not in self.store:
            return True
        expiry = self.expires.get(name)
        if expiry and time.time() > expiry:
            self.delete(name)
            return True
        return False

print("WARNING: Using Mock Redis (In-Memory)")
redis_client = MockRedis()
