import os
import sys
# Add current dir to sys.path so we can import 'app'
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load env from parent
load_dotenv(os.path.join(current_dir, '..', '.env'))

from app.models import User
from app.redis_client import redis_client

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")
if not SQLALCHEMY_DATABASE_URL:
    print("Error: DATABASE_URL not found")
    sys.exit(1)

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

target_email = "abhi@example.com"
u = db.query(User).filter(User.email == target_email).first()
if u:
    db.delete(u)
    db.commit()
    print(f"User {target_email} deleted from DB.")
else:
    print(f"User {target_email} not found in DB.")

# Clear related Redis keys
redis_client.delete(f"otp:{target_email}")
redis_client.delete(f"refresh:{target_email}")
print("Redis keys cleared.")

db.close()
