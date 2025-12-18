
import requests
import json
import random

BASE_URL = "http://localhost:8001"

# Randomize to avoid collision
rand_id = random.randint(1000, 9999)
payload = {
    "username": f"debug_user_{rand_id}",
    "email": f"debug_user_{rand_id}@example.com",
    "password": "DebugPassword123!",
    "full_name": "Debug User"
}

print(f"Attempting signup with: {payload['username']}")

try:
    resp = requests.post(f"{BASE_URL}/auth/signup", json=payload)
    print(f"Status: {resp.status_code}")
    try:
        print(f"Response: {json.dumps(resp.json(), indent=2)}")
    except:
        print(f"Raw Response: {resp.text}")
except Exception as e:
    print(f"CONNECTION ERROR: {e}")
