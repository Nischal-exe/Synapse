import sys
import os

# Ensure backend directory is in python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import Base, engine, SessionLocal
from app.models import Room, User
from app.auth import get_password_hash

def init_db():
    print("Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    
    print("Creating all tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    print("Seeding rooms...")
    rooms = [
        {"name": "JEE Mains", "description": "Discuss JEE Mains preparation, tips, and doubts."},
        {"name": "JEE Advance", "description": "Advanced level discussions for JEE aspirants."},
        {"name": "NEET", "description": "Medical entrance exam preparation community."},
        {"name": "General Programming", "description": "Code, bugs, and coffee. Discuss anything tech."},
        {"name": "Class 10th", "description": "Board exam prep for 10th graders."},
        {"name": "Class 12th", "description": "Board exam prep for 12th graders."},
    ]
    
    for r_data in rooms:
        room = Room(name=r_data["name"], description=r_data["description"])
        db.add(room)
    
    db.commit()
    print("Database seeded successfully!")
    db.close()

if __name__ == "__main__":
    init_db()
