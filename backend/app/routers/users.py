from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas, database
from .. import auth as auth_utils

router = APIRouter(
    prefix="/users",
    tags=["users"]
)

get_db = database.get_db

@router.get("/me", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(auth_utils.get_current_user)):
    return current_user

@router.get("/me/sidebar")
def get_sidebar_data(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    # Return list of joined rooms
    return {
        "joined_rooms": [
            {
                "id": room.id,
                "name": room.name
            } for room in current_user.joined_rooms
        ]
    }
