from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database
from .. import auth as auth_utils

router = APIRouter(
    prefix="/posts",
    tags=["comments"]
)

get_db = database.get_db

@router.get("/{post_id}/comments", response_model=List[schemas.Comment])
def read_comments(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    comments = db.query(models.Comment).filter(models.Comment.post_id == post_id).order_by(models.Comment.created_at.asc()).all()
    return comments

@router.post("/{post_id}/comments", response_model=schemas.Comment)
def create_comment(
    post_id: int,
    comment: schemas.CommentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.PermissionChecker("create_comment"))
):

    # Ensure post exists
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
        
    new_comment = models.Comment(
        content=comment.content,
        post_id=post_id,
        parent_id=comment.parent_id,
        owner_id=current_user.id
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    return new_comment
@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # Check if user is owner OR has admin/mod permissions
    is_owner = comment.owner_id == current_user.id
    if not is_owner:
        if not auth_utils.has_permission(current_user.id, "delete_any_comment", db):
             raise HTTPException(status_code=403, detail="Not authorized to delete this comment")

    db.delete(comment)
    db.commit()
    return None

@router.put("/comments/{comment_id}", response_model=schemas.Comment)
def update_comment(
    comment_id: int,
    comment_update: schemas.CommentUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
        
    if comment.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this comment")
        
    comment.content = comment_update.content
    db.commit()
    db.refresh(comment)
    return comment
