from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import models, schemas, database
from .. import auth as auth_utils

router = APIRouter(
    prefix="/posts",
    tags=["posts"]
)

get_db = database.get_db

from sqlalchemy import or_

@router.get("/", response_model=List[schemas.Post])
def get_posts(
    room_id: Optional[int] = None,
    search: Optional[str] = None,
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    query = db.query(models.Post)
    if room_id:
        query = query.filter(models.Post.room_id == room_id)
    
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                models.Post.title.ilike(search_filter),
                models.Post.content.ilike(search_filter)
            )
        )
        
    return query.order_by(models.Post.created_at.desc()).offset(skip).limit(limit).all()

@router.post("/", response_model=schemas.Post)
def create_post(
    post: schemas.PostCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.PermissionChecker("create_post"))
):
    new_post = models.Post(**post.dict(), owner_id=current_user.id)
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    return new_post

@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
        
    # Check if user is owner OR has admin/mod permissions
    is_owner = post.owner_id == current_user.id
    if not is_owner:
        if not auth_utils.has_permission(current_user.id, "delete_any_post", db):
             raise HTTPException(status_code=403, detail="Not authorized to delete this post")

    db.delete(post)
    db.commit()
    return None

@router.put("/{post_id}", response_model=schemas.Post)
def update_post(
    post_id: int,
    post_update: schemas.PostUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if post.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this post")
        
    if post_update.title is not None:
        post.title = post_update.title
    if post_update.content is not None:
        post.content = post_update.content
        
    db.commit()
    db.refresh(post)
    return post

@router.get("/{post_id}", response_model=schemas.Post)
def get_post(
    post_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post
