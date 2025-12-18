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
            # db_email.is_verified = True # Auto-verify removed
            db.commit()
            db.refresh(db_email)

            # Resend OTP
            otp = utils.generate_otp()
            print(f"DEBUG OTP for {user.email}: {otp}")
            redis_client.setex(f"otp:{user.email}", 300, otp)
            await email_utils.send_otp_email(user.email, otp)
            return db_email

    # New User
    new_user = crud.create_user(db=db, user=user)
    # new_user.is_verified = True # Auto-verify removed
    db.commit()
    otp = utils.generate_otp()
    print(f"DEBUG OTP for {user.email}: {otp}")
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

@router.post("/forgot-password")
async def forgot_password(request: schemas.PasswordResetRequest, db: Session = Depends(database.get_db)):
    user = crud.get_user_by_email(db, email=request.email)
    if not user:
        # We return 200 even if user not found to prevent email enumeration, 
        # but for debugging let's be explicit or handle it silently.
        # For this stage, let's return 404 to help the user debug.
        raise HTTPException(status_code=404, detail="User with this email does not exist")

    otp = utils.generate_otp()
    print(f"DEBUG RESET OTP for {request.email}: {otp}")
    redis_client.setex(f"reset_otp:{request.email}", 300, otp)
    
    # We can reuse the OTP email function or create a new one. 
    # For now, reusing the existing one is fine as the message is generic "Verification Code".
    await email_utils.send_otp_email(request.email, otp)
    
    return {"message": "Password reset OTP sent to email"}

@router.post("/verify-reset-otp")
def verify_reset_otp(verify_data: schemas.PasswordResetVerify):
    stored_otp = redis_client.get(f"reset_otp:{verify_data.email}")
    if not stored_otp or stored_otp != verify_data.otp:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    
    return {"message": "OTP verified successfully"}

@router.post("/reset-password")
def reset_password(confirm_data: schemas.PasswordResetConfirm, db: Session = Depends(database.get_db)):
    # 1. Verify OTP again to be sure
    stored_otp = redis_client.get(f"reset_otp:{confirm_data.email}")
    if not stored_otp or stored_otp != confirm_data.otp:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    
    # 2. Check Password Complexity (1 digit, 1 uppercase)
    import re
    if not re.search(r"\d", confirm_data.new_password):
        raise HTTPException(status_code=400, detail="Password must contain at least one number")
    if not re.search(r"[A-Z]", confirm_data.new_password):
        raise HTTPException(status_code=400, detail="Password must contain at least one uppercase letter")
    
    # 3. Update Password
    user = crud.get_user_by_email(db, email=confirm_data.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.hashed_password = auth.get_password_hash(confirm_data.new_password)
    db.commit()
    
    # 4. Cleanup
    redis_client.delete(f"reset_otp:{confirm_data.email}")
    
    return {"message": "Password has been reset successfully"}
