from pydantic import BaseModel
from typing import Optional, List

class DocumentChunk(BaseModel):
    id: str
    chunkIndex: int
    text: str
    tokenCount: int
    embeddingDimension: int
    page: Optional[int] = None
    section: Optional[str] = None

    class Config:
        from_attributes = True

class DocumentResponse(BaseModel):
    id: str
    name: str
    type: str
    department: str
    size: str
    status: str
    updatedAt: str
    chunksCount: Optional[int] = 0
    uploadedBy: Optional[str] = None
    description: Optional[str] = None
    previewSnippet: Optional[str] = None
    sampleChunks: Optional[List[DocumentChunk]] = None

    class Config:
        from_attributes = True
