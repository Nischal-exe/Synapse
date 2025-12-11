from sqlalchemy import Column, Integer, String, Boolean
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    date_of_birth = Column(String) # Keeping as String for simplicity in serialization, or Date if preferred
    hashed_password = Column(String)
    is_verified = Column(Boolean, default=False)
    refresh_token = Column(String, nullable=True) # Optional: if we want to store it in DB too, but flow says Redis. 
                                                  # Actually, flow says "Store Refresh Token in Redis". 
                                                  # Usually we don't strictly need it in DB if Redis is the source of truth for valid refresh tokens, 
                                                  # but keeping it in DB is fine too. 
                                                  # However, the diagram specifically points to Redis for Refresh Token. 
                                                  # I'll stick to is_verified only here to follow the diagram strictly unless needed.
                                                  # Wait, standard practice: verify match with stored token.
                                                  # I'll just add is_verified for now.
