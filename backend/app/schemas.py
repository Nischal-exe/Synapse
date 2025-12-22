from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: Optional[str] = None
    date_of_birth: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserProfileSync(BaseModel):
    username: str
    full_name: Optional[str] = None
    date_of_birth: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

class User(UserBase):
    id: int
    is_active: bool = True

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserVerify(BaseModel):
    email: EmailStr
    otp: str

class PostBase(BaseModel):
    title: str
    content: str
    room_id: int

class PostCreate(PostBase):
    pass

class PostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None

class Post(PostBase):
    id: int
    created_at: datetime
    owner_id: int
    owner: User
    # comments: List["Comment"] = [] 

    class Config:
        from_attributes = True

class RoomBase(BaseModel):
    name: str
    description: Optional[str] = None

class RoomCreate(RoomBase):
    pass

class Room(RoomBase):
    id: int

    class Config:
        from_attributes = True

class CommentBase(BaseModel):
    content: str
    post_id: int # Explicitly keeping post_id in base for now
    parent_id: Optional[int] = None

class CommentCreate(CommentBase):
    pass

class Comment(CommentBase):
    id: int
    created_at: datetime
    owner_id: int
    owner: User
    replies: List["Comment"] = []

    class Config:
        from_attributes = True

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetVerify(BaseModel):
    email: EmailStr
    otp: str

class PasswordResetConfirm(BaseModel):
    email: EmailStr
    otp: str
    new_password: str

class ChatMessageBase(BaseModel):
    content: str
    room_id: int

    @validator('content')
    def content_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('Message content cannot be empty')
        return v

class ChatMessageCreate(ChatMessageBase):
    pass

class ChatMessage(ChatMessageBase):
    id: int
    created_at: datetime
    user_id: int
    owner: User

    class Config:
        from_attributes = True
