from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database
from .. import auth as auth_utils

router = APIRouter(
    prefix="/rooms",
    tags=["rooms"]
)

get_db = database.get_db

@router.get("/", response_model=List[schemas.Room])
def read_rooms(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    rooms = db.query(models.Room).offset(skip).limit(limit).all()
    return rooms

@router.post("/", response_model=schemas.Room)
def create_room(
    room: schemas.RoomCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    # Only allow if room doesn't exist
    db_room = db.query(models.Room).filter(models.Room.name == room.name).first()
    if db_room:
        raise HTTPException(status_code=400, detail="Room already registered")
    new_room = models.Room(name=room.name, description=room.description)
    db.add(new_room)
    db.commit()
    db.refresh(new_room)
    return new_room

@router.post("/{room_id}/join")
def join_room(
    room_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    room = db.query(models.Room).filter(models.Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    # Check if already joined
    is_member = db.query(models.RoomMember).filter(
        models.RoomMember.user_id == current_user.id,
        models.RoomMember.room_id == room_id
    ).first()

    if is_member:
        # If already a member, toggle off (Leave)
        db.delete(is_member)
        db.commit()
        return {"message": f"Left room {room.name}", "joined": False}
    else:
        # Join
        new_member = models.RoomMember(user_id=current_user.id, room_id=room_id)
        db.add(new_member)
        db.commit()
        return {"message": f"Joined room {room.name}", "joined": True}
