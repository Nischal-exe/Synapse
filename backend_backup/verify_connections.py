import os
import sys
import redis
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

print("--- DIAGNOSTICS START ---")

# Check Redis
redis_host = os.getenv("REDIS_HOST", "localhost")
redis_port = int(os.getenv("REDIS_PORT", 6379))
redis_password = os.getenv("REDIS_PASSWORD", None)

print(f"Checking Redis at {redis_host}:{redis_port}...")
try:
    r = redis.Redis(host=redis_host, port=redis_port, password=redis_password, socket_connect_timeout=2)
    r.ping()
    print("Redis: OK")
except Exception as e:
    print(f"Redis: FAILED - {e}")

# Check DB
db_url = os.getenv("DATABASE_URL")
if not db_url:
    print("DATABASE_URL not set in .env")
else:
    print(f"Checking Database...") # Intentionally not printing URL to avoid secret leak in logs
    try:
        engine = create_engine(db_url)
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("Database: OK")
    except Exception as e:
        print(f"Database: FAILED - {e}")

print("--- DIAGNOSTICS END ---")
