
import os
import sys
from datetime import datetime, timedelta
from jose import jwt
from dotenv import load_dotenv

load_dotenv()

# Match the settings in app/auth.py
SECRET_KEY = os.getenv("SUPABASE_JWT_SECRET", "xYyzKYHGHMPszvHKl1pEtwszZorVrKYdon3Sq3lN1rAvwAClAUBAqCD1eBibZyZZMgPMZ3GCxbHNbKKDTv1J6w==")
ALGORITHM = "HS256"

def generate_token(username, email, sub="test-uuid-123"):
    payload = {
        "sub": sub,
        "email": email,
        "user_metadata": {
            "username": username
        },
        "exp": datetime.utcnow() + timedelta(days=1)
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python generate_test_token.py <username> <email>")
    else:
        u = sys.argv[1]
        e = sys.argv[2]
        token = generate_token(u, e)
        print("\n--- GENERATED TEST TOKEN ---")
        print(token)
        print("--- END TOKEN ---\n")
        print("Use this in your Authorization header: Bearer " + token)
