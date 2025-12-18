import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models import Room

db = SessionLocal()
rooms = db.query(Room).all()
print("Available Rooms:")
for r in rooms:
    print(f"- {r.name}")
db.close()
