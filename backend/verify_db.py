import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

print(f"Testing connection to: {DATABASE_URL}")

try:
    engine = create_engine(DATABASE_URL)
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        print("Connection successful!")
        
        # Check if users table exists
        try:
            result = connection.execute(text("SELECT count(*) FROM users"))
            print(f"Users table exists. Row count: {result.fetchone()[0]}")
        except Exception as e:
            print("Users table likely does not exist. Attempting to create tables...")
            from app import models
            from app.database import Base
            Base.metadata.create_all(bind=engine)
            print("Tables created.")
except SQLAlchemyError as e:
    print(f"Connection failed: {e}")
except Exception as e:
    print(f"An error occurred: {e}")
