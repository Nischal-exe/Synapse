import sys
import os
from sqlalchemy.orm import Session

# Add the current directory to sys.path so we can import app
sys.path.append(os.getcwd())

from app.database import SessionLocal
from app import models

def delete_user(user_id):
    db: Session = SessionLocal()
    try:
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if not user:
            print(f"User with ID {user_id} not found.")
            return

        print(f"Deleting user: {user.username} (ID: {user.id})")

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
        print("User deleted successfully.")
    except Exception as e:
        print(f"Error deleting user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    delete_user(2)
