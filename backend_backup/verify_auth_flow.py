import requests
import time
from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

# Load Env
load_dotenv(dotenv_path="p:\\Synapse\\.env")

BASE_URL = "http://localhost:8001"
DB_URL = os.getenv("DATABASE_URL")

email = "test_auth_fix@example.com"
username = "test_auth_fix"
password = "TestPassword123"

def get_otp_from_db(email):
    engine = create_engine(DB_URL)
    with engine.connect() as conn:
        result = conn.execute(text(f"SELECT otp FROM users WHERE email = '{email}'"))
        row = result.fetchone()
        if row:
            return row[0]
    return None

def verify_flow():
    print(f"1. Attempting Signup for {email}...")
    signup_payload = {
        "email": email,
        "username": username,
        "password": password,
        "full_name": "Test User",
        "date_of_birth": "2000-01-01"
    }
    
    # Clean up first
    try:
        engine = create_engine(DB_URL)
        with engine.connect() as conn:
            conn.execute(text(f"DELETE FROM users WHERE email = '{email}'"))
            conn.commit()
    except:
        pass

    try:
        resp = requests.post(f"{BASE_URL}/auth/signup", json=signup_payload)
        if resp.status_code == 200:
            print("Signup Success!")
        elif resp.status_code == 400 and "already registered" in resp.text:
            print("User already exists, continuing...")
        else:
            print(f"Signup Failed: {resp.status_code} {resp.text}")
            return
            
        print("2. Fetching OTP from DB...")
        time.sleep(1) # Wait for db write
        otp = get_otp_from_db(email)
        print(f"OTP Found: {otp}")
        
        if not otp:
            print("OTP not found in DB! FAILED.")
            return

        print("3. Verifying OTP...")
        verify_payload = {"email": email, "otp": otp}
        resp = requests.post(f"{BASE_URL}/auth/verify", json=verify_payload)
        if resp.status_code == 200:
            print("Verification Success!")
        else:
            print(f"Verification Failed: {resp.status_code} {resp.text}")
            return

        print("4. logging in...")
        login_payload = {"username": username, "password": password}
        resp = requests.post(f"{BASE_URL}/auth/login", json=login_payload)
        if resp.status_code == 200:
            print("Login Success!")
            token = resp.json().get("access_token")
            print(f"Token received: {token[:10]}...")
        else:
            print(f"Login Failed: {resp.status_code} {resp.text}")
            return
            
        print("--- FULL FLOW VERIFIED ---")

    except Exception as e:
        print(f"Exception during verification: {e}")

if __name__ == "__main__":
    verify_flow()
