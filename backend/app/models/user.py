from sqlalchemy import Column, String, DateTime
from app.core.database import Base
import uuid
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True, default=lambda: f"user-{uuid.uuid4().hex[:8]}")
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, default="EMPLOYEE")
    department = Column(String, default="General Operations")
    employeeId = Column(String)
    avatarUrl = Column(String, nullable=True)
    joinedDate = Column(String, default=lambda: datetime.utcnow().strftime("%B %Y"))
