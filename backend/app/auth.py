import os
from dotenv import load_dotenv
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import JWTError, jwt
from typing import Optional

load_dotenv()

# SECRET_KEY should be in an environment variable in production
# SECRET_KEY should be in an environment variable in production
SECRET_KEY = os.getenv("SUPABASE_JWT_SECRET", "xYyzKYHGHMPszvHKl1pEtwszZorVrKYdon3Sq3lN1rAvwAClAUBAqCD1eBibZyZZMgPMZ3GCxbHNbKKDTv1J6w==")
ALGORITHM = "HS256"

# Deprecated password utils (Supabase handles this)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
def verify_password(plain_password, hashed_password): return True
def get_password_hash(password): return "managed_by_supabase"
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None): return "managed_by_supabase"

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from . import database, schemas
from . import crud 

# Supabase provides the bearer token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not token:
        raise credentials_exception

    try:
        # Verify Supabase Token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM], options={"verify_aud": False})
        supabase_uid: str = payload.get("sub")
        email: str = payload.get("email")
        user_metadata = payload.get("user_metadata", {})
        
        if supabase_uid is None:
            raise credentials_exception
            
    except JWTError as e:
        print(f"JWT Verification Failed: {e}")
        raise credentials_exception

    # Check if user exists in our DB
    user = db.query(crud.models.User).filter(crud.models.User.supabase_id == supabase_uid).first()
    
    # Auto-linking / Provisioning
    if not user:
        # Check by email first (Legacy migration)
        if email:
            user = db.query(crud.models.User).filter(crud.models.User.email == email).first()
        
        if user:
            # Link existing
            if not user.supabase_id:
                user.supabase_id = supabase_uid
                user.is_verified = True
                db.commit()
                db.refresh(user)
        else:
            # Create New User (Just-in-Time Provisioning)
            # We need username. If not in metadata, we might error or generate one?
            username = user_metadata.get("username")
            if not username:
                # Fallback if username missing in metadata (should not happen if frontend sends it)
                username = email.split("@")[0]
                
            full_name = user_metadata.get("full_name")
            
            date_of_birth = user_metadata.get("date_of_birth")

            # Attempt creation with retries for username uniqueness
            import random
            for attempt in range(3):
                try:
                    new_user = crud.models.User(
                        username=username,
                        email=email,
                        full_name=full_name,
                        date_of_birth=date_of_birth,
                        supabase_id=supabase_uid,
                        is_verified=True, # Confirmed by token existence
                        hashed_password="managed_by_supabase"
                    )
                    db.add(new_user)
                    db.commit()
                    db.refresh(new_user)
                    user = new_user
                    break # Success
                except Exception as exc:
                    db.rollback()
                    # If this was possibly a race condition on EMAIL, check if user exists now
                    existing_user = db.query(crud.models.User).filter(crud.models.User.email == email).first()
                    if existing_user:
                        user = existing_user
                        break
                    
                    # If it was likely a USERNAME collision, modify username and retry
                    if attempt < 2:
                        base_name = user_metadata.get("username", email.split("@")[0])
                        username = f"{base_name}{random.randint(1000, 9999)}"
                        continue
                    
                    # If all attempts fail
                    print(f"Auto-provisioning failed after retries: {exc}")
                    raise HTTPException(status_code=400, detail="User creation failed (likely duplicate username).")

    if user is None:
        raise HTTPException(status_code=401, detail="User profile could not be loaded.")
        
    return user

def get_supabase_identity(token: str = Depends(oauth2_scheme)):
    """
    Verifies the token and returns the Supabase User ID and Email.
    Does NOT check if the user exists in the local DB.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM], options={"verify_aud": False})
        uid: str = payload.get("sub")
        email: str = payload.get("email")
        if uid is None:
            raise credentials_exception
        return {"supabase_id": uid, "email": email}
    except JWTError:
        raise credentials_exception
