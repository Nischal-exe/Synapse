from fastapi import FastAPI
from .database import engine, Base
from .routers import auth

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Synapse API")

app.include_router(auth.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Synapse API"}
