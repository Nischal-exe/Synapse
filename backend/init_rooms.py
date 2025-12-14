from app.database import engine, Base, SessionLocal
from app.models import Room
from sqlalchemy.orm import Session

# Create tables if they don't exist (includes new rooms table)
Base.metadata.create_all(bind=engine)

def init_rooms():
    session = SessionLocal()
    
    rooms_data = [
        {"name": "10th Exams", "description": "Discussion for 10th grade board exams"},
        {"name": "12th Exams", "description": "Discussion for 12th grade board exams"},
        {"name": "JEE Mains", "description": "Joint Entrance Examination Mains"},
        {"name": "JEE Advance", "description": "Joint Entrance Examination Advanced"},
        {"name": "CAT", "description": "Common Admission Test for MBA"},
        {"name": "GATE", "description": "Graduate Aptitude Test in Engineering"},
        {"name": "NIMCET", "description": "NIT MCA Common Entrance Test"},
    ]
    
    print("Initializing rooms...")
    for data in rooms_data:
        existing_room = session.query(Room).filter(Room.name == data["name"]).first()
        if not existing_room:
            room = Room(name=data["name"], description=data["description"])
            session.add(room)
            print(f"Added room: {data['name']}")
        else:
            print(f"Room already exists: {data['name']}")
            
    session.commit()
    session.close()
    print("Room initialization complete.")

if __name__ == "__main__":
    init_rooms()
