import os
import uuid
import pdfplumber
from docx import Document as DocxDocument
from typing import List, Dict

class DocumentParser:
    def __init__(self, upload_dir: str = "uploads"):
        self.upload_dir = upload_dir
        os.makedirs(self.upload_dir, exist_ok=True)
        
    async def save_file(self, filename: str, content: bytes) -> str:
        file_path = os.path.join(self.upload_dir, f"{uuid.uuid4().hex}_{filename}")
        with open(file_path, "wb") as f:
            f.write(content)
        return file_path

    def extract_text(self, file_path: str, doc_type: str) -> List[Dict]:
        """
        Returns a list of chunks/pages. Each dict has 'text', 'page'
        """
        doc_type = doc_type.upper()
        chunks = []
        if doc_type == "PDF":
            with pdfplumber.open(file_path) as pdf:
                for i, page in enumerate(pdf.pages):
                    text = page.extract_text()
                    if text:
                        chunks.append({"text": text, "page": i + 1})
        elif doc_type in ["DOCX", "DOC"]:
            doc = DocxDocument(file_path)
            full_text = "\n".join([para.text for para in doc.paragraphs if para.text.strip()])
            # We don't have pages for DOCX inherently in python-docx, treat as single chunk
            chunks.append({"text": full_text, "page": 1})
        elif doc_type == "TXT" or doc_type == "CSV":
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                chunks.append({"text": f.read(), "page": 1})
        else:
            raise ValueError(f"Unsupported document type: {doc_type}")
            
        return chunks
        
    def chunk_text(self, extracted_pages: List[Dict], chunk_size: int = 1000, chunk_overlap: int = 200) -> List[Dict]:
        """
        Basic character-level chunking that preserves page metadata.
        Uses langchain's RecursiveCharacterTextSplitter.
        """
        from langchain_text_splitters import RecursiveCharacterTextSplitter
        
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=["\n\n", "\n", " ", ""]
        )
        
        final_chunks = []
        for page_data in extracted_pages:
            splits = splitter.split_text(page_data["text"])
            for split in splits:
                final_chunks.append({
                    "text": split,
                    "page": page_data["page"],
                    "tokenCount": len(split.split()) # Rough estimate
                })
                
        return final_chunks
