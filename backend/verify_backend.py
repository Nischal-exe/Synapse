import requests
import sys
import time

BASE_URL = "http://127.0.0.1:8000"

def verify():
    print("Starting backend verification...")
    
    # Unique user checking
    username = f"verify_{int(time.time())}"
    email = f"{username}@example.com"
    password = "password123"
    
    # 1. Signup
    print(f"1. Attempting Signup ({username})...")
    try:
        resp = requests.post(f"{BASE_URL}/auth/signup", json={
            "username": username,
            "email": email,
            "password": password
        })
        if resp.status_code != 200:
            print(f"Signup failed: {resp.status_code} {resp.text}")
            sys.exit(1)
        print("Signup successful.")
    except Exception as e:
        print(f"Signup Exception: {e}")
        sys.exit(1)
    
    # 2. Login
    print("2. Attempting Login...")
    resp = requests.post(f"{BASE_URL}/auth/login", json={
        "username": username,
        "password": password
    })
    if resp.status_code != 200:
        print(f"Login failed: {resp.status_code} {resp.text}")
        sys.exit(1)
    token = resp.json()["access_token"]
    print("Login successful.")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # 3. Get Rooms
    print("3. Fetching Rooms...")
    resp = requests.get(f"{BASE_URL}/rooms/", headers=headers)
    if resp.status_code != 200:
        print(f"Get Rooms failed: {resp.status_code} {resp.text}")
        sys.exit(1)
    rooms = resp.json()
    if not rooms:
        print("No rooms found!")
        sys.exit(1)
    print(f"Found {len(rooms)} rooms.")
    
    # 4. Join Room
    room_id = rooms[0]['id']
    print(f"4. Joining Room {room_id}...")
    resp = requests.post(f"{BASE_URL}/rooms/{room_id}/join", headers=headers)
    if resp.status_code != 200:
        print(f"Join Room failed: {resp.status_code} {resp.text}")
        sys.exit(1)
    print("Joined room successfully.")
    
    print("\nALL CHECKS PASSED.")

if __name__ == "__main__":
    verify()
