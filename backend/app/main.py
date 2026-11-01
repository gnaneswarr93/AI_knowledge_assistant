from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import auth, chat, documents
from app.core.database import engine, Base
from app.core.config import settings
from app.models.chat_attachment import ChatAttachment

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(documents.router, prefix="/api/documents", tags=["documents"])

@app.on_event("startup")
async def startup_event():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.get("/api/system/status")
async def system_status():
    return {
        "status": "Operational",
        "latencyMs": 22,
        "vectorDbStatus": "Online",
        "vectorDbRecords": 15420,
        "embeddingModel": "text-embedding-3-small",
        "agentsActive": 5,
        "lastSync": "Just now"
    }

@app.get("/api/system/stats")
async def system_stats():
    return {
        "totalDocuments": 142,
        "totalUsers": 89,
        "totalQueries": 4521,
        "indexedPercentage": 100,
        "vectorEmbeddingsCount": 15420
    }

@app.get("/api/system/session")
async def system_session():
    return {
        "sessionId": "SES-LIVE",
        "loginTime": "Just now",
        "ipAddress": "127.0.0.1",
        "networkLocation": "Local",
        "encryption": "TLS 1.3",
        "tokenExpiry": "12 hours remaining"
    }

