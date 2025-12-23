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
def read_users_me(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    # Fetch role manually to ensure it's returned
    role_name = "normal_user"
    user_role = db.query(models.UserRoles).filter(models.UserRoles.user_id == current_user.id).first()
    if user_role:
        role_obj = db.query(models.Roles).filter(models.Roles.id == user_role.role_id).first()
        if role_obj:
            role_name = role_obj.role_name
    
    # Create schema response manually or let Pydantic handle it if model has mapped property
    # But since User model doesn't have a direct 'role' column (it has a relationship), we map it here
    user_data = schemas.User.from_orm(current_user)
    user_data.role = role_name
    return user_data

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
