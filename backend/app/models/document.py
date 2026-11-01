from sqlalchemy import Column, String, Integer, ForeignKey, JSON
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
from app.core.database import Base
from datetime import datetime
import uuid

class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, index=True, default=lambda: f"doc-{uuid.uuid4().hex[:8]}")
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    department = Column(String, nullable=False)
    size = Column(String, nullable=False)
    status = Column(String, default="Indexed")
    updatedAt = Column(String, default=lambda: datetime.utcnow().strftime("Just now"))
    chunksCount = Column(Integer, default=0)
    uploadedBy = Column(String, nullable=True)
    description = Column(String, nullable=True)
    previewSnippet = Column(String, nullable=True)
    
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")

class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(String, primary_key=True, index=True, default=lambda: f"chk-{uuid.uuid4().hex[:8]}")
    document_id = Column(String, ForeignKey("documents.id"))
    chunkIndex = Column(Integer)
    text = Column(String, nullable=False)
    tokenCount = Column(Integer)
    embeddingDimension = Column(Integer, default=3072)
    embedding = Column(Vector(3072))
    page = Column(Integer, nullable=True)
    section = Column(String, nullable=True)

    document = relationship("Document", back_populates="chunks")
