from sqlalchemy import Column, Integer, String, Boolean, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship, backref
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    date_of_birth = Column(String)
    hashed_password = Column(String)
    is_verified = Column(Boolean, default=False)
    refresh_token = Column(String, nullable=True)

    posts = relationship("Post", back_populates="owner")
    comments = relationship("Comment", back_populates="owner")
    saved_posts = relationship("SavedPost", back_populates="user")
    liked_posts = relationship("PostLike", back_populates="user")
    joined_rooms = relationship("Room", secondary="room_members", back_populates="members")
    messages = relationship("ChatMessage", back_populates="owner")

class RoomMember(Base):
    __tablename__ = "room_members"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    room_id = Column(Integer, ForeignKey("rooms.id"), primary_key=True)
    joined_at = Column(DateTime(timezone=True), server_default=func.now())

class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String)

    posts = relationship("Post", back_populates="room")
    members = relationship("User", secondary="room_members", back_populates="joined_rooms")
    messages = relationship("ChatMessage", back_populates="room")

class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    content = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    owner_id = Column(Integer, ForeignKey("users.id"))
    room_id = Column(Integer, ForeignKey("rooms.id"))

    owner = relationship("User", back_populates="posts")
    room = relationship("Room", back_populates="posts")
    comments = relationship("Comment", back_populates="post")
    saved_by = relationship("SavedPost", back_populates="post")
    likes = relationship("PostLike", back_populates="post")

class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    owner_id = Column(Integer, ForeignKey("users.id"))
    post_id = Column(Integer, ForeignKey("posts.id"))

    owner = relationship("User", back_populates="comments")
    post = relationship("Post", back_populates="comments")
    
    parent_id = Column(Integer, ForeignKey("comments.id"), nullable=True)
    replies = relationship("Comment", backref=backref("parent", remote_side=[id]))

class SavedPost(Base):
    __tablename__ = "saved_posts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    post_id = Column(Integer, ForeignKey("posts.id"))

    user = relationship("User", back_populates="saved_posts")
    post = relationship("Post", back_populates="saved_by")

class PostLike(Base):
    __tablename__ = "post_likes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    post_id = Column(Integer, ForeignKey("posts.id"))

    user = relationship("User", back_populates="liked_posts")
    post = relationship("Post", back_populates="likes")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user_id = Column(Integer, ForeignKey("users.id"))
    room_id = Column(Integer, ForeignKey("rooms.id"))

    owner = relationship("User", back_populates="messages")
    room = relationship("Room", back_populates="messages")
