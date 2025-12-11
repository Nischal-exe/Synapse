from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from .. import schemas, crud, database, auth, utils, email_utils
from ..redis_client import redis_client
import uuid

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

@router.post("/signup", response_model=schemas.User)
async def signup(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = crud.get_user(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    db_email = crud.get_user_by_email(db, email=user.email)
    if db_email:
        if db_email.is_verified:
            raise HTTPException(status_code=400, detail="Email already registered")
        else:
            # Update user details on retry
            db_email.hashed_password = auth.get_password_hash(user.password)
            db_email.full_name = user.full_name
            db_email.date_of_birth = user.date_of_birth
            db_email.username = user.username
            db.commit()
            db.refresh(db_email)

            # Resend OTP
            otp = utils.generate_otp()
            redis_client.setex(f"otp:{user.email}", 300, otp)
            await email_utils.send_otp_email(user.email, otp)
            return db_email

    # New User
    new_user = crud.create_user(db=db, user=user)
    otp = utils.generate_otp()
    redis_client.setex(f"otp:{user.email}", 300, otp)
    await email_utils.send_otp_email(user.email, otp)
    return new_user

@router.post("/verify")  # removed response_model=schemas.Token to allow dict
def verify_otp(verify_data: schemas.UserVerify, db: Session = Depends(database.get_db)):
    # Check Redis
    stored_otp = redis_client.get(f"otp:{verify_data.email}")
    if not stored_otp or stored_otp != verify_data.otp:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    
    # Update DB
    user = crud.get_user_by_email(db, email=verify_data.email)
    if not user:
        raise HTTPException(status_code=400, detail="User not found")
    
    user.is_verified = True
    db.commit()
    db.refresh(user)

    # We do NOT generate tokens here anymore. User must login explicitly.
    
    return {"message": "Email verified successfully"}

@router.post("/login", response_model=schemas.Token)
def login(user_credentials: schemas.UserLogin, db: Session = Depends(database.get_db)):
    user = crud.get_user(db, username=user_credentials.username)
    if not user or not auth.verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_verified:
        raise HTTPException(status_code=400, detail="Email not verified")

    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    # Refresh Token
    refresh_token = str(uuid.uuid4())
    redis_client.setex(f"refresh:{user.email}", auth.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60, refresh_token)

    return {
        "access_token": access_token, 
        "refresh_token": refresh_token, 
        "token_type": "bearer"
    }
