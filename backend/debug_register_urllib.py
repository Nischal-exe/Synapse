
import urllib.request
import json
import random

BASE_URL = "http://localhost:8001"

rand_id = random.randint(10000, 99999)
data = {
    "username": f"debug_urllib_{rand_id}",
    "email": f"debug_urllib_{rand_id}@example.com",
    "password": "DebugPassword123!",
    "full_name": "Debug Urllib User"
}

json_data = json.dumps(data).encode('utf-8')
headers = {'Content-Type': 'application/json'}

req = urllib.request.Request(f"{BASE_URL}/auth/signup", data=json_data, headers=headers)

print(f"Sending request to {BASE_URL}/auth/signup...")
try:
    with urllib.request.urlopen(req) as response:
        print(f"Status: {response.status}")
        print(f"Response: {response.read().decode('utf-8')}")
except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code}")
    print(f"Response: {e.read().decode('utf-8')}")
except Exception as e:
    print(f"Connection Error: {e}")
