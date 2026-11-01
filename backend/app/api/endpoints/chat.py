from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List
from datetime import datetime
from app.models.chat_attachment import ChatAttachment

from fastapi import UploadFile, File
from app.models.document import Document, DocumentChunk
from app.models.chat_attachment import ChatAttachment
from app.services.doc_parser import DocumentParser
from app.services.embedding import EmbeddingProvider

from app.core.database import get_db
from app.models.chat import Conversation, ChatMessage
from app.models.user import User
from app.schemas.chat import ConversationResponse, ChatMessageResponse, SendMessageRequest, RegenerateRequest, FeedbackRequest, DetailedFeedbackRequest
from app.api.dependencies import get_current_user
from app.services.rag_service import RagService

from app.models.document import Document

from pathlib import Path
from uuid import UUID
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy import select
router = APIRouter()

@router.get("/conversations", response_model=List[ConversationResponse])
async def get_conversations(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(
        select(Conversation)
        .where(Conversation.user_id == current_user.id)
        .options(selectinload(Conversation.messages))
        .order_by(Conversation.lastUpdated.desc())
    )
    return result.scalars().all()



@router.post("/conversations", response_model=ConversationResponse)
async def create_conversation(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conv = Conversation(
        user_id=current_user.id,
        title="New Conversation",
    )

    db.add(conv)
    await db.commit()
    await db.refresh(conv)

    return ConversationResponse(
        id=conv.id,
        title=conv.title,
        lastUpdated=conv.lastUpdated,
        messages=[],
    )


@router.post("/conversations/{conv_id}/messages", response_model=ChatMessageResponse)
async def send_message(conv_id: str, req: SendMessageRequest, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Conversation).where(Conversation.id == conv_id, Conversation.user_id == current_user.id))
    conv = result.scalars().first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
        
    user_msg = ChatMessage(
        conversation_id=conv.id,
        sender="user",
        content=req.content,
        timestamp=datetime.utcnow().strftime("%H:%M")
    )
    db.add(user_msg)
  
    from app.models.chat_attachment import ChatAttachment
    
    

    attachment_result = await db.execute(
    select(ChatAttachment.document_id).where(
        ChatAttachment.conversation_id == conv_id
    )
)

    attached_document_ids = list(attachment_result.scalars().all())
    rag_service = RagService(db)
    if attached_document_ids:
        rag_result = await rag_service.process_query(
            req.content,
            document_ids=attached_document_ids,
        )
    else:
        rag_result = await rag_service.process_query(req.content)


    assistant_msg = ChatMessage(
        conversation_id=conv.id,
        sender="assistant",
        content=rag_result["answer"],
        timestamp=datetime.utcnow().strftime("%H:%M"),
        answerMode=req.answerMode,
        confidence="High" if rag_result["sources"] else "Low",
        sources=rag_result["sources"],
        processingSteps=rag_result["steps"]
    )
    db.add(assistant_msg)
    
    if conv.title == "New Conversation":
        conv.title = req.content[:30] + "..."
    conv.lastUpdated = datetime.utcnow().isoformat()
    
    await db.commit()
    await db.refresh(assistant_msg)
    return assistant_msg

@router.post("/conversations/{conv_id}/messages/{msg_id}/feedback")
async def submit_feedback(conv_id: str, msg_id: str, req: FeedbackRequest, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(ChatMessage).where(ChatMessage.id == msg_id, ChatMessage.conversation_id == conv_id))
    msg = result.scalars().first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    msg.feedback = req.feedback
    await db.commit()
    return {"success": True}

@router.post("/conversations/{conv_id}/messages/{msg_id}/detailed-feedback")
async def submit_detailed_feedback(conv_id: str, msg_id: str, req: DetailedFeedbackRequest, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(ChatMessage).where(ChatMessage.id == msg_id, ChatMessage.conversation_id == conv_id))
    msg = result.scalars().first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    msg.feedback = req.detailedFeedback.rating
    msg.detailedFeedback = req.detailedFeedback.model_dump()
    await db.commit()
    return {"success": True}


@router.post("/conversations/{conv_id}/attachments")
async def upload_chat_attachment(
    conv_id: str,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Confirm that this conversation belongs to the current user.
    result = await db.execute(
        select(Conversation).where(
            Conversation.id == conv_id,
            Conversation.user_id == current_user.id,
        )
    )
    conv = result.scalars().first()

    if not conv:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found",
        )

    filename = (file.filename or "").strip()
    if not filename:
        raise HTTPException(status_code=400, detail="Filename is required")

    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    supported_types = {
        "pdf": "PDF",
        "docx": "DOCX",
        "doc": "DOCX",
        "txt": "TXT",
        "csv": "CSV",
    }

    if ext not in supported_types:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Upload PDF, DOCX, TXT, or CSV.",
        )

    # Read with a size limit to avoid unbounded uploads.
    max_size = 20 * 1024 * 1024
    content = await file.read(max_size + 1)

    if not content:
        raise HTTPException(status_code=400, detail="The file is empty")

    if len(content) > max_size:
        raise HTTPException(
            status_code=413,
            detail="File size must not exceed 20 MB",
        )

    parser = DocumentParser()
    embedder = EmbeddingProvider()
    doc_type = supported_types[ext]

    new_doc = None

    try:
        file_path = await parser.save_file(filename, content)

        # Register in the shared enterprise document library.
        new_doc = Document(
            name=filename,
            type=doc_type,
            department="Operations",
            size=f"{len(content)} bytes",
            uploadedBy=current_user.name,
            status="Processing",
        )
        db.add(new_doc)
        await db.flush()

        pages = parser.extract_text(file_path, doc_type)
        chunks = parser.chunk_text(pages)

        if not chunks:
            raise ValueError(
                "No readable text was found in the uploaded document"
            )

        texts = [chunk["text"] for chunk in chunks]
        embeddings = embedder.embed_texts(texts)

        if len(embeddings) != len(chunks):
            raise ValueError("Embedding count does not match chunk count")

        db_chunks = []
        for i, chunk in enumerate(chunks):
            db_chunks.append(
                DocumentChunk(
                    document_id=new_doc.id,
                    chunkIndex=i,
                    text=chunk["text"],
                    tokenCount=chunk["tokenCount"],
                    embeddingDimension=3072,
                    embedding=embeddings[i],
                    page=chunk.get("page"),
                )
            )

        db.add_all(db_chunks)
        await db.flush()

        # Link the indexed document to this conversation.
        db.add(
            ChatAttachment(
                conversation_id=conv.id,
                document_id=new_doc.id,
            )
        )

        new_doc.status = "Indexed"
        new_doc.chunksCount = len(db_chunks)
        new_doc.previewSnippet = chunks[0]["text"][:500]
        conv.lastUpdated = datetime.utcnow().isoformat()

        await db.commit()
        await db.refresh(new_doc)

        return {
            "id": new_doc.id,
            "name": new_doc.name,
            "type": new_doc.type,
            "department": new_doc.department,
            "size": new_doc.size,
            "status": new_doc.status,
            "chunksCount": new_doc.chunksCount,
            "conversationId": conv.id,
        }

    except HTTPException:
        await db.rollback()
        raise
    except Exception:
        await db.rollback()
        import logging
        logging.exception("Chat attachment upload/indexing failed")
        raise HTTPException(
            status_code=500,
            detail="The document could not be processed. Check the backend logs.",
        )
    finally:
        await file.close()
@router.post(
    "/conversations/{conversation_id}/attachments",
)
async def upload_chat_attachment(
    conversation_id: UUID,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # 1. Validate the extension.
    allowed_extensions = {".pdf", ".doc", ".docx", ".txt", ".csv"}
    extension = Path(file.filename or "").suffix.lower()

    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Supported formats: PDF, DOC, DOCX, TXT, CSV.",
        )

    # 2. Enforce the same 20 MB limit as the frontend.
    max_size = 20 * 1024 * 1024
    content = await file.read()

    if not content:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is empty.",
        )

    if len(content) > max_size:
        raise HTTPException(
            status_code=413,
            detail="The maximum file size is 20 MB.",
        )

    # 3. Verify that the conversation belongs to the signed-in user.
    conversation_result = await db.execute(
        select(Conversation).where(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user.id,
        )
    )
    conversation = conversation_result.scalar_one_or_none()

    if conversation is None:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found.",
        )

    # 4. Ingest the document using your existing documents.py logic.
    #
    # IMPORTANT:
    # Move/reuse the existing ingestion logic from documents.py here.
    # It must create the Document row and its DocumentChunk rows,
    # including valid embeddings.
    #
    # Do not leave this section as a placeholder in your final code.

    # Example expected result after ingestion:
    # document = the newly created, indexed Document ORM object

    # 5. Link the newly indexed document to this conversation.
    attachment = ChatAttachment(
        conversation_id=conversation_id,
        document_id=document.id,
    )

    db.add(attachment)
    await db.commit()

    return {
        "conversation_id": str(conversation_id),
        "document_id": str(document.id),
        "filename": document.name,
        "status": document.status,
        "chunks_count": document.chunks_count,
    }