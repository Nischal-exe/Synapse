import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Fix for some PaaS that provide "postgres://" instead of "postgresql://"
if SQLALCHEMY_DATABASE_URL and SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Ensure SSL mode for production (Neon requires it)
if SQLALCHEMY_DATABASE_URL and "sslmode" not in SQLALCHEMY_DATABASE_URL and "localhost" not in SQLALCHEMY_DATABASE_URL and "sqlite" not in SQLALCHEMY_DATABASE_URL:
    SQLALCHEMY_DATABASE_URL += "?sslmode=require"

if SQLALCHEMY_DATABASE_URL and "sqlite" in SQLALCHEMY_DATABASE_URL:
    print(f"Database Config: Using SQLite")
    connect_args = {"check_same_thread": False}
else:
    print(f"Database Config: Using PostgreSQL/NeonDB")

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
