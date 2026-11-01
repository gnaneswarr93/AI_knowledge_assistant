from pydantic import BaseModel
from typing import List, Optional, Any

class SourceReference(BaseModel):
    documentName: str
    page: Optional[int] = None
    section: Optional[str] = None
    relevanceScore: Optional[float] = None
    excerpt: Optional[str] = None
    chunkId: Optional[str] = None
    tokenCount: Optional[int] = None

class AgentStep(BaseModel):
    id: str
    label: str
    agentName: str
    status: str
    durationMs: Optional[int] = None
    description: Optional[str] = None

class DetailedFeedback(BaseModel):
    rating: str
    tags: List[str]
    comment: Optional[str] = None
    timestamp: str

class ChatMessageBase(BaseModel):
    id: str
    sender: str
    content: str
    timestamp: str
    sources: Optional[List[SourceReference]] = None
    confidence: Optional[str] = None
    processingSteps: Optional[List[AgentStep]] = None
    feedback: Optional[str] = None
    detailedFeedback: Optional[DetailedFeedback] = None
    isRegenerated: Optional[bool] = False
    answerMode: Optional[str] = None
    followUpQuestions: Optional[List[str]] = None
    executionTimeMs: Optional[int] = None

class ChatMessageResponse(ChatMessageBase):
    class Config:
        from_attributes = True

class ConversationResponse(BaseModel):
    id: str
    title: str
    lastUpdated: str
    messages: List[ChatMessageResponse] = []

    class Config:
        from_attributes = True

class SendMessageRequest(BaseModel):
    content: str
    answerMode: str = "Concise"

class RegenerateRequest(BaseModel):
    answerMode: str = "Concise"

class FeedbackRequest(BaseModel):
    feedback: str

class DetailedFeedbackRequest(BaseModel):
    detailedFeedback: DetailedFeedback
