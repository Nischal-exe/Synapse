import time
import os
import redis
from dotenv import load_dotenv

load_dotenv()

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

# Initialize actual Redis if URL is provided
redis_url = os.getenv("REDIS_URL")
if redis_url:
    try:
        redis_client = redis.from_url(redis_url, decode_responses=True)
        # Test connection
        redis_client.ping()
        print(f"Connected to Redis at {redis_url[:15]}...")
    except Exception as e:
        print(f"Failed to connect to Redis: {e}. Falling back to MockRedis.")
        redis_client = MockRedis()
else:
    print("WARNING: REDIS_URL not found. Using MockRedis (In-Memory)")
    redis_client = MockRedis()
