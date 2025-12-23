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

@router.get("/", response_model=List[schemas.Post])
def get_posts(
    room_id: Optional[int] = None,
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    query = db.query(models.Post)
    if room_id:
        query = query.filter(models.Post.room_id == room_id)
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
    current_user: models.User = Depends(auth_utils.PermissionChecker("delete_any_post"))
):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    db.delete(post)
    db.commit()
    return None


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
