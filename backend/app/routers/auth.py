from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import schemas, crud, database, auth

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

@router.post("/sync", response_model=schemas.User)
def sync_user_profile(
    profile: schemas.UserProfileSync,
    identity: dict = Depends(auth.get_supabase_identity),
    db: Session = Depends(database.get_db)
):
    """
    Syncs the Supabase user with the local database.
    Creates a new user record if one doesn't exist, linking it via supabase_id.
    """
    supabase_uid = identity["supabase_id"]
    email = identity["email"]
    
    # 1. Check if user already exists by supabase_id
    user = db.query(crud.models.User).filter(crud.models.User.supabase_id == supabase_uid).first()
    if user:
        return user
    
    # 2. Check if username is taken
    if crud.get_user(db, username=profile.username):
        raise HTTPException(status_code=400, detail="Username already taken")

    # 3. Check for existing user by email (Auto-Linking Strategy)
    # This handles cases where a user existed in the system before Supabase migration
    existing_user_by_email = crud.get_user_by_email(db, email=email)
    
    if existing_user_by_email:
        if existing_user_by_email.supabase_id and existing_user_by_email.supabase_id != supabase_uid:
            # Should be impossible if email is unique in Supabase and DB, 
            # unless Supabase verified a different email that matches DB email.
            raise HTTPException(status_code=400, detail="Email already linked to another account")
        
        # Link the existing user
        existing_user_by_email.supabase_id = supabase_uid
        existing_user_by_email.is_verified = True
        
        # Optionally update fields derived from the sync request if they are empty in DB
        if not existing_user_by_email.full_name and profile.full_name:
            existing_user_by_email.full_name = profile.full_name
            
        db.commit()
        db.refresh(existing_user_by_email)
        return existing_user_by_email

    # 4. Create New User
    new_user = crud.models.User(
        username=profile.username,
        email=email,
        full_name=profile.full_name,
        date_of_birth=profile.date_of_birth,
        supabase_id=supabase_uid,
        is_verified=True,
        hashed_password=None # Password managed by Supabase
    )
    
    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user
    except Exception as e:
        print(f"Error creating user: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create user profile")
