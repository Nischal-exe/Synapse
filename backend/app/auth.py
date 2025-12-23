import os
from dotenv import load_dotenv
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import JWTError, jwt
from typing import Optional

load_dotenv()

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
from . import database, schemas, models

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
    user = db.query(models.User).filter(models.User.supabase_id == supabase_uid).first()
    
    # Auto-linking / Provisioning
    if not user:
        # Check by email first (Legacy migration)
        if email:
            user = db.query(models.User).filter(models.User.email == email).first()
        
        if user:
            # Link existing
            if not user.supabase_id:
                user.supabase_id = supabase_uid
                user.is_verified = True
                db.commit()
                db.refresh(user)
        else:
            # Create New User (Just-in-Time Provisioning)
            username = user_metadata.get("username")
            if not username:
                username = email.split("@")[0]
                
            full_name = user_metadata.get("full_name")
            date_of_birth = user_metadata.get("date_of_birth")

            # Attempt creation with retries for username uniqueness
            import random
            for attempt in range(3):
                try:
                    new_user = models.User(
                        username=username,
                        email=email,
                        full_name=full_name,
                        date_of_birth=date_of_birth,
                        supabase_id=supabase_uid,
                        is_verified=True,
                        hashed_password="managed_by_supabase"
                    )
                    db.add(new_user)
                    db.flush()

                    # Assign 'normal_user' role
                    normal_role = db.query(models.Roles).filter(models.Roles.role_name == "normal_user").first()
                    if normal_role:
                        user_role = models.UserRoles(user_id=new_user.id, role_id=normal_role.id)
                        db.add(user_role)
                    
                    db.commit()
                    db.refresh(new_user)
                    user = new_user
                    break # Success
                except Exception as exc:
                    db.rollback()
                    existing_user = db.query(models.User).filter(models.User.email == email).first()
                    if existing_user:
                        user = existing_user
                        break
                    
                    if attempt < 2:
                        base_name = user_metadata.get("username", email.split("@")[0])
                        username = f"{base_name}{random.randint(1000, 9999)}"
                        continue
                    
                    print(f"Auto-provisioning failed after retries: {exc}")
                    raise HTTPException(status_code=400, detail="User creation failed (likely duplicate username).")

    if user is None:
        raise HTTPException(status_code=401, detail="User profile could not be loaded.")
        
    return user

def get_supabase_identity(token: str = Depends(oauth2_scheme)):
    """
    Verifies the token and returns the Supabase User ID and Email.
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

def has_permission(user_id: int, permission_name: str, db: Session):
    """
    Checks if a user has a specific permission.
    """
    # Join User -> UserRoles -> Roles -> RolePermissions -> Permission
    permission = db.query(models.Permission)\
        .join(models.RolePermissions, models.RolePermissions.permission_id == models.Permission.id)\
        .join(models.Roles, models.Roles.id == models.RolePermissions.role_id)\
        .join(models.UserRoles, models.UserRoles.role_id == models.Roles.id)\
        .filter(models.UserRoles.user_id == user_id)\
        .filter(models.Permission.permission_name == permission_name)\
        .first()
    
    return permission is not None

class PermissionChecker:
    def __init__(self, required_permission: str):
        self.required_permission = required_permission

    def __call__(self, current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
        if not has_permission(current_user.id, self.required_permission, db):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Missing required permission: {self.required_permission}"
            )
        return current_user

def get_current_moderator(current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    """
    Dependency to check if the user is a moderator or admin.
    Checks for 'delete_any_post' permission which is assigned to admins.
    """
    if not has_permission(current_user.id, "delete_any_post", db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Moderator privileges required"
        )
    return current_user
