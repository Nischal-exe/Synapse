from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database
from .. import auth as auth_utils
from ..redis_client import redis_client

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
    current_user: models.User = Depends(auth_utils.PermissionChecker("manage_rooms"))
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
        new_member = models.RoomMember(user_id=current_user.id, room_id=room_id)
        db.add(new_member)
        db.commit()
        return {"message": f"Joined room {room.name}", "joined": True}

@router.get("/{room_id}/messages", response_model=List[schemas.ChatMessage])
def get_messages(
    room_id: int,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    messages = db.query(models.ChatMessage).filter(
        models.ChatMessage.room_id == room_id
    ).order_by(models.ChatMessage.created_at.desc()).limit(limit).all()
    
    return messages[::-1] # Return in chronological order (oldest first) for chat UI

@router.post("/{room_id}/messages", response_model=schemas.ChatMessage)
def send_message(
    room_id: int,
    message: schemas.ChatMessageCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.PermissionChecker("chat"))
):

    # 0. Validate content
    if not message.content or not message.content.strip():
        raise HTTPException(status_code=400, detail="Message content cannot be empty")

    # 1. Verify membership
    is_member = db.query(models.RoomMember).filter(
        models.RoomMember.user_id == current_user.id,
        models.RoomMember.room_id == room_id
    ).first()
    if not is_member:
        raise HTTPException(status_code=403, detail="Must join room to send messages")

    # 2. Rate Limiting (1 second)
    rate_limit_key = f"chat_rate:{current_user.id}:{room_id}"
    if redis_client.exists(rate_limit_key):
        ttl = redis_client.ttl(rate_limit_key)
        raise HTTPException(
            status_code=429, 
            detail=f"Please wait {ttl}s before sending another message"
        )

    # 3. Create Message
    new_message = models.ChatMessage(
        content=message.content.strip(),
        room_id=room_id,
        user_id=current_user.id
    )
    db.add(new_message)
    db.commit()
    db.refresh(new_message)

    # 4. Set Rate Limit
    redis_client.setex(rate_limit_key, 1, "1") # 1 second expiry

    return new_message
@router.delete("/messages/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_message(
    message_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.PermissionChecker("delete_any_message"))
):
    message = db.query(models.ChatMessage).filter(models.ChatMessage.id == message_id).first()
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    db.delete(message)
    db.commit()
    return None
@router.delete("/{room_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_room(
    room_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.PermissionChecker("manage_rooms"))
):
    room = db.query(models.Room).filter(models.Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    # Optional: Delete related members/messages if not handled by DB CASCADE
    # For now, let's assume standard SQLAlchemy session delete
    db.delete(room)
    db.commit()
    return None

from fastapi import WebSocket, WebSocketDisconnect
from ..websockets import manager
import json

@router.websocket("/{room_id}/ws")
async def websocket_endpoint(
    websocket: WebSocket, 
    room_id: int, 
    token: str,
    db: Session = Depends(get_db)
):
    # Authenticate User
    print(f"WS: Attempting connection for room {room_id}")
    try:
        user = auth_utils.get_user_from_token(token, db)
        if not user:
             print("WS: Authentication failed - User not found or token invalid")
             await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
             return
        print(f"WS: Authenticated user: {user.username}")
    except Exception as e:
        print(f"WS: Auth Exception: {e}")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    # Check Membership
    is_member = db.query(models.RoomMember).filter(
        models.RoomMember.user_id == user.id,
        models.RoomMember.room_id == room_id
    ).first()
    
    if not is_member:
        print(f"WS: User {user.username} is not a member of room {room_id}")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Not a member")
        return

    print("WS: Connection accepted, connecting to manager...")
    await manager.connect(websocket, room_id)
    print("WS: Connected!")
    try:
        while True:
            data = await websocket.receive_text()
            # Expecting data to be just message content string or JSON?
            # Let's assume sending just the content string for simplicity or parse JSON if complex
            # If client sends JSON like {content: "hi"}, parse it.
            
            content = data
            try:
                msg_data = json.loads(data)
                if 'content' in msg_data:
                    content = msg_data['content']
            except:
                pass # Treat as raw string
            
            if not content.strip():
                continue

            # Basic Persistence
            # Note: Heavy DB ops in async loop can block. Ideally use `await run_in_threadpool`.
            # For this scale, direct sync DB call is 'okay' but 'async db' is better.
            # We'll do a quick sync save.
            
            new_msg = models.ChatMessage(
                content=content,
                room_id=room_id,
                user_id=user.id
            )
            db.add(new_msg)
            db.commit()
            db.refresh(new_msg)
            
            # Construct response schema
            response = {
                "id": new_msg.id,
                "content": new_msg.content,
                "created_at": new_msg.created_at.isoformat(),
                "user_id": user.id,
                "owner": {
                    "username": user.username,
                    "id": user.id
                }
            }
            
            await manager.broadcast(response, room_id)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id)
    except Exception as e:
        print(f"WS Error: {e}")
        manager.disconnect(websocket, room_id)
