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

origins = []
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    origins.append(frontend_url)
else:
    # Fallback for local dev if absolutely needed, or leave empty for strict prod
    origins.append("http://localhost:5173") 

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
