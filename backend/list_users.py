
import sys
import os

# Add the current directory to sys.path so we can import app
sys.path.append(os.getcwd())

from app.database import SessionLocal
from app.models import User

def list_users():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        print(f"{'ID':<5} {'Username':<20} {'Email':<30} {'Full Name'}")
        print("-" * 75)
        for user in users:
            print(f"{user.id:<5} {user.username:<20} {user.email:<30} {user.full_name}")
    finally:
        db.close()

if __name__ == "__main__":
    list_users()
