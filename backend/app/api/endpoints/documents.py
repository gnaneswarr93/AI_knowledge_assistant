from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
import asyncio

from app.core.database import get_db
from app.models.document import Document, DocumentChunk
from app.models.user import User
from app.schemas.document import DocumentResponse
from app.api.dependencies import get_current_user
from app.services.doc_parser import DocumentParser
from app.services.embedding import EmbeddingProvider

router = APIRouter()

@router.get("", response_model=List[DocumentResponse])
async def get_documents(
    typeFilter: str = "All",
    departmentFilter: str = "All",
    query: str = "",
    db: AsyncSession = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    stmt = select(Document)
    if typeFilter != "All":
        stmt = stmt.where(Document.type == typeFilter)
    if departmentFilter != "All":
        stmt = stmt.where(Document.department == departmentFilter)
        
    result = await db.execute(stmt)
    docs = result.scalars().all()
    
    if query:
        docs = [d for d in docs if query.lower() in d.name.lower() or query.lower() in d.department.lower()]
        
    return docs

@router.post("", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    department: str = "Operations",
    db: AsyncSession = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    ext = file.filename.split('.')[-1].upper()
    doc_type = "PDF"
    if ext in ["DOCX", "DOC"]: doc_type = "DOCX"
    if ext == "TXT": doc_type = "TXT"
    if ext == "CSV": doc_type = "CSV"
    
    parser = DocumentParser()
    embedder = EmbeddingProvider()
    
    content = await file.read()
    file_path = await parser.save_file(file.filename, content)
    
    new_doc = Document(
        name=file.filename,
        type=doc_type,
        department=department,
        size=f"{len(content)} bytes",
        uploadedBy=current_user.name,
        status="Processing"
    )
    db.add(new_doc)
    await db.commit()
    await db.refresh(new_doc)
    
    # Process document synchronously for MVP (should be background task in production)
    try:
        pages = parser.extract_text(file_path, doc_type)
        chunks = parser.chunk_text(pages)
        
        texts = [c["text"] for c in chunks]
        embeddings = embedder.embed_texts(texts)
        
        db_chunks = []
        for i, chunk in enumerate(chunks):
            db_chunk = DocumentChunk(
                document_id=new_doc.id,
                chunkIndex=i,
                text=chunk["text"],
                tokenCount=chunk["tokenCount"],
                embeddingDimension=3072,
                embedding=embeddings[i],
                page=chunk["page"]
            )
            db_chunks.append(db_chunk)
            
        db.add_all(db_chunks)
        new_doc.status = "Indexed"
        new_doc.chunksCount = len(db_chunks)
        await db.commit()
        await db.refresh(new_doc)
    except Exception as e:
        import traceback
        err = traceback.format_exc()
        new_doc.status = "Failed"
        await db.commit()
        raise HTTPException(status_code=500, detail=str(err))
        
    return new_doc

@router.delete("/{doc_id}")
async def delete_document(doc_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    # result = await db.execute(select(Document).where(Document.id == doc_id))
    # doc = result.scalars().first()
    # if doc:
    #     await db.delete(doc)
    #     await db.commit()
    # return {"success": True}
    result = await db.execute(
    select(Document).where(
        Document.id == doc_id,
        Document.uploadedBy == current_user.name,
    )
)
    doc = result.scalars().first()

    if not doc:
        raise HTTPException(
            status_code=404,
            detail="Document not found or you are not authorized to delete it",
        )

    await db.delete(doc)
    await db.commit()

    return {"success": True}