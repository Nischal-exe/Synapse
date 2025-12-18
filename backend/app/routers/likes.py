from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import models, schemas, database
from .. import auth as auth_utils

router = APIRouter(
    prefix="/posts",
    tags=["likes"]
)

get_db = database.get_db

@router.post("/{post_id}/like")
def toggle_like(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    like_query = db.query(models.PostLike).filter(
        models.PostLike.post_id == post_id,
        models.PostLike.user_id == current_user.id
    )
    found_like = like_query.first()
    
    if found_like:
        db.delete(found_like)
        db.commit()
        return {"message": "Unliked", "liked": False}
    else:
        new_like = models.PostLike(post_id=post_id, user_id=current_user.id)
        db.add(new_like)
        db.commit()
        return {"message": "Liked", "liked": True}

@router.get("/{post_id}/likes")
def get_likes(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    # Return count and if current user liked
    count = db.query(models.PostLike).filter(models.PostLike.post_id == post_id).count()
    is_liked = db.query(models.PostLike).filter(
        models.PostLike.post_id == post_id,
        models.PostLike.user_id == current_user.id
    ).first() is not None
    
    return {"count": count, "is_liked": is_liked}
