from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas, database, crud
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

@router.delete("/me", status_code=204)
def delete_user_me(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    crud.delete_user_cascade(db, current_user)
    return None

@router.delete("/{user_id}", status_code=204)
def delete_user_by_admin(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(auth_utils.get_current_moderator)
):
    """
    Allow admins/moderators to delete a user by ID.
    """
    user_to_delete = db.query(models.User).filter(models.User.id == user_id).first()
    if not user_to_delete:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Prevent deleting self via this endpoint (not strictly necessary but good practice)
    if user_to_delete.id == current_admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself via admin endpoint")

    # Prevent moderators from deleting admins
    if not auth_utils.has_permission(current_admin.id, "delete_any_user", db): # Check if super admin
        # Fallback check if permission granular system isn't fully set up for "delete_admin"
        # Check target user role
        target_role = db.query(models.UserRoles).filter(models.UserRoles.user_id == user_to_delete.id).first()
        if target_role:
            role_obj = db.query(models.Roles).filter(models.Roles.id == target_role.role_id).first()
            if role_obj and role_obj.role_name == 'admin':
                 raise HTTPException(status_code=403, detail="Moderators cannot delete Admins")

    crud.delete_user_cascade(db, user_to_delete)
    return None
