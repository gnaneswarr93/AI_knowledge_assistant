from sqlalchemy import Column, String, Float, Integer, ForeignKey, Boolean, JSON, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime
import uuid

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String, primary_key=True, index=True, default=lambda: f"conv-{uuid.uuid4().hex[:8]}")
    user_id = Column(String, ForeignKey("users.id"))
    title = Column(String, nullable=False)
    lastUpdated = Column(String, default=lambda: datetime.utcnow().isoformat())

    messages = relationship("ChatMessage", back_populates="conversation", cascade="all, delete-orphan")

class ChatMessage(Base):
    __tablename__ = "messages"

    id = Column(String, primary_key=True, index=True, default=lambda: f"msg-{uuid.uuid4().hex[:8]}")
    conversation_id = Column(String, ForeignKey("conversations.id"))
    sender = Column(String, nullable=False)
    content = Column(String, nullable=False)
    timestamp = Column(String, default=lambda: datetime.utcnow().isoformat())
    
    # JSON fields to store complex frontend types
    sources = Column(JSON, nullable=True)
    confidence = Column(String, nullable=True)
    processingSteps = Column(JSON, nullable=True)
    feedback = Column(String, nullable=True)
    detailedFeedback = Column(JSON, nullable=True)
    isRegenerated = Column(Boolean, default=False)
    answerMode = Column(String, nullable=True)
    followUpQuestions = Column(JSON, nullable=True)
    executionTimeMs = Column(Integer, nullable=True)

    conversation = relationship("Conversation", back_populates="messages")
