from fastapi import FastAPI
from .database import engine, Base
from .routers import auth, rooms, users, posts, likes, comments # , activity

# Create database tables
Base.metadata.create_all(bind=engine)

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Synapse API")

import os
from dotenv import load_dotenv

load_dotenv()

origins = [
    "http://localhost:5173", "http://localhost:3000", "http://localhost:5174", "http://localhost:5175",
    "http://localhost:5176", "http://localhost:5177", "http://localhost:5178",
    "http://127.0.0.1:5173", "http://127.0.0.1:5174", "http://127.0.0.1:5175",
    "http://127.0.0.1:5176", "http://127.0.0.1:5177", "http://127.0.0.1:5178"
]

frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    origins.append(frontend_url)

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
