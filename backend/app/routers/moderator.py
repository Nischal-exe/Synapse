from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import models, schemas, database
from .. import auth as auth_utils

router = APIRouter(
    prefix="/moderator",
    tags=["moderator"]
)

get_db = database.get_db

@router.get("/posts", response_model=List[schemas.Post])
def get_all_posts_for_moderation(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_mod: models.User = Depends(auth_utils.get_current_moderator)
):
    """
    Get all posts across all rooms for moderation.
    Only accessible by moderators and admins.
    """
    posts = db.query(models.Post).order_by(models.Post.created_at.desc()).offset(skip).limit(limit).all()
    return posts

@router.delete("/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post_as_moderator(
    post_id: int,
    db: Session = Depends(get_db),
    current_mod: models.User = Depends(auth_utils.get_current_moderator)
):
    """
    Delete any post by ID.
    Only accessible by moderators and admins.
    """
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    db.delete(post)
    db.commit()
    return None
