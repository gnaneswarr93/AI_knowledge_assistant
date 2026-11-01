from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    name: str
    department: Optional[str] = "General Operations"

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str
    role: str
    employeeId: str
    avatarUrl: Optional[str] = None
    joinedDate: str
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
