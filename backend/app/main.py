from fastapi import FastAPI
from .database import engine, Base
from .routers import auth, rooms, users, posts, likes, comments # , activity

# Create database tables
# Create database tables
Base.metadata.create_all(bind=engine)

# Manual Migration Check (Temporary for Supabase support)
from sqlalchemy import text
from sqlalchemy.exc import ProgrammingError
with engine.connect() as connection:
    connection.commit() # Ensure autocommit mode or transaction start
    try:
        # Check if column exists
        connection.execute(text("SELECT supabase_id FROM users LIMIT 1"))
    except ProgrammingError:
        connection.rollback()
        print("Migrating DB: Adding supabase_id column to users table...")
        with engine.begin() as migration_txn:
             migration_txn.execute(text("ALTER TABLE users ADD COLUMN supabase_id VARCHAR(255) UNIQUE;"))
             migration_txn.execute(text("CREATE INDEX ix_users_supabase_id ON users (supabase_id);"))
             # Also make password nullable
             migration_txn.execute(text("ALTER TABLE users ALTER COLUMN hashed_password DROP NOT NULL;"))
        print("Migration complete.")

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Synapse API")

import os
from dotenv import load_dotenv

load_dotenv()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    # Handle potentially multiple URLs and strip trailing slashes
    for url in frontend_url.split(","):
        clean_url = url.strip().rstrip("/")
        if clean_url:
            origins.append(clean_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(rooms.router)
app.include_router(posts.router)
# app.include_router(posts.router)
app.include_router(users.router)
app.include_router(likes.router)
app.include_router(comments.router)
# app.include_router(activity.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Synapse API"}
