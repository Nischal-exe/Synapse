from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import User
from app.database import Base
import os
from dotenv import load_dotenv

load_dotenv()

# Get DB URL from env
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def check_users():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        print(f"Total users found: {len(users)}")
        for user in users:
            print(f"User: {user.username}, Email: {user.email}, Verified: {user.is_verified}")
    finally:
        db.close()

if __name__ == "__main__":
    check_users()
