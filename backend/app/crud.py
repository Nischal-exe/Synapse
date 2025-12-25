from sqlalchemy.orm import Session
from . import models, schemas, auth

def get_user(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        email=user.email, 
        username=user.username, 
        full_name=user.full_name,
        date_of_birth=user.date_of_birth,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def delete_user_cascade(db: Session, user: models.User):
    """
    Deletes a user and all associated data in the correct order to avoid Foreign Key constraints.
    """
    # Delete UserRoles
    db.query(models.UserRoles).filter(models.UserRoles.user_id == user.id).delete()
    
    # Delete Room Memberships
    db.query(models.RoomMember).filter(models.RoomMember.user_id == user.id).delete()
    
    # Delete Likes
    db.query(models.PostLike).filter(models.PostLike.user_id == user.id).delete()
    
    # Delete Saved Posts
    db.query(models.SavedPost).filter(models.SavedPost.user_id == user.id).delete()
    
    # Delete Chat Messages
    db.query(models.ChatMessage).filter(models.ChatMessage.user_id == user.id).delete()
    
    # Delete Comments
    db.query(models.Comment).filter(models.Comment.owner_id == user.id).delete()
    
    # Delete Posts (and their related data)
    user_post_ids = db.query(models.Post.id).filter(models.Post.owner_id == user.id).all()
    user_post_ids = [p[0] for p in user_post_ids]
    
    if user_post_ids:
        # Delete comments on users posts
        db.query(models.Comment).filter(models.Comment.post_id.in_(user_post_ids)).delete(synchronize_session=False)
        # Delete likes on users posts
        db.query(models.PostLike).filter(models.PostLike.post_id.in_(user_post_ids)).delete(synchronize_session=False)
        # Delete saved entries of users posts
        db.query(models.SavedPost).filter(models.SavedPost.post_id.in_(user_post_ids)).delete(synchronize_session=False)
        
    db.query(models.Post).filter(models.Post.owner_id == user.id).delete(synchronize_session=False)

    # Finally delete the user
    db.delete(user)
    db.commit()
