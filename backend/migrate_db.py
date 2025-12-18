import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Add current dir to path to import app if needed, though we just need env here
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("DATABASE_URL not found!")
    sys.exit(1)

def migrate():
    print(f"Migrating database...")
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        # Check if column exists to avoid errors (SQLite/Postgres specific syntax might vary, keeping it generic with try/catch or just simple ALTER)
        # Simple ALTER TABLE ADD COLUMN IF NOT EXISTS is widely supported but SQLite has limited support
        # We'll just try to add and ignore "duplicate column" errors for simplicity in this dev script
        
        commands = [
            "ALTER TABLE users ADD COLUMN otp VARCHAR",
            "ALTER TABLE users ADD COLUMN otp_expiry TIMESTAMP",
            # refresh_token might already verify, but ensure it's there? Model had it commented out mostly, or purely not in DB.
            # The model file edit added it. So we need to add it to DB.
            "ALTER TABLE users ADD COLUMN refresh_token VARCHAR" 
        ]
        
        for cmd in commands:
            try:
                conn.execute(text(cmd))
                print(f"Executed: {cmd}")
            except Exception as e:
                # If it fails, likely column exists. 
                print(f"Skipped (likely exists): {cmd} | Error: {e}")
                
        conn.commit()
    print("Migration complete.")

if __name__ == "__main__":
    migrate()
