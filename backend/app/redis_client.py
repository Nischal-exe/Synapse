class MockRedis:
    def __init__(self):
        self.store = {}

    def setex(self, name, time, value):
        # Ignore time for mock, or implement simplified expiry if needed. 
        # For dev, just storing is fine.
        self.store[name] = value
        return True

    def get(self, name):
        return self.store.get(name)

    def delete(self, name):
        if name in self.store:
            del self.store[name]
        return 1

    def exists(self, name):
        return name in self.store

    def ttl(self, name):
        # Always return 30 for mock if exists, else -2
        return 30 if name in self.store else -2

print("WARNING: Using Mock Redis (In-Memory)")
redis_client = MockRedis()
