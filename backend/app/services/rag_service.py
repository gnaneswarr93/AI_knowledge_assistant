from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import text
from app.models.document import DocumentChunk, Document
from app.services.embedding import EmbeddingProvider
from langchain_openai import ChatOpenAI
from app.core.config import settings
import json
import asyncio
from sqlalchemy import select, or_
import time



class RagService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.embedder = EmbeddingProvider()
        api_key = settings.OPENAI_API_KEY.strip() if settings.OPENAI_API_KEY else ""
        gemini_key = settings.GEMINI_API_KEY.strip() if hasattr(settings, "GEMINI_API_KEY") and settings.GEMINI_API_KEY else ""
        
        if gemini_key:
           from langchain_google_genai import ChatGoogleGenerativeAI

           self.llm = ChatGoogleGenerativeAI(
               google_api_key=gemini_key,
                model="gemini-3.5-flash-lite",
                timeout=30,
                max_retries=0,
            )
        elif api_key and "your-openai" not in api_key.lower() and not api_key.startswith("sk-..."):
            self.llm = ChatOpenAI(
                openai_api_key=api_key,
                model="gpt-4o",
                timeout=30,
                max_retries=0,
            )
        else:
            self.llm = None
    
    async def retrieve_context(
        self,
        query: str,
        top_k: int = 5,
        document_ids: List[str] | None = None,
    ) -> List[Dict[str, Any]]:
        # Generate query embedding
        start = time.perf_counter()
        query_vector = await self.embedder.aembed_query(query)

        print(
            f"[PERF] Query embedding: "
            f"{time.perf_counter() - start:.2f}s"
        )

        # Search only the specified documents when document_ids is provided.
        retrieval_start = time.perf_counter()

        distance = DocumentChunk.embedding.cosine_distance(
        query_vector
).label("distance")

        stmt = (
    select(DocumentChunk, Document, distance)
    .join(Document)
)

        if document_ids is not None:
            if not document_ids:
                return []

            stmt = stmt.where(DocumentChunk.document_id.in_(document_ids))

        stmt = stmt.order_by(distance).limit(top_k)

        result = await self.db.execute(stmt)
        chunks_docs = result.all()

        print(
            f"[PERF] Vector retrieval: "
            f"{time.perf_counter() - retrieval_start:.2f}s"
        )

        context_items = []

        for chunk, doc, cosine_distance in chunks_docs:
            similarity = max(
                0.0,
                min(1.0, 1.0 - float(cosine_distance))
            )

            context_items.append({
                "chunk_id": chunk.id,
                "text": chunk.text,
                "page": chunk.page,
                "document_name": doc.name,
                "similarity_score": round(similarity, 4),
            })

        return context_items

    # async def retrieve_context(
    #     self, query: str, top_k: int = 5
    # ) -> List[Dict[str, Any]]:
    #     # 1. Generate the query embedding asynchronously
    #     start = time.perf_counter()
    #     query_vector = await self.embedder.aembed_query(query)

    #     print(
    #         f"[PERF] Query embedding: "
    #         f"{time.perf_counter() - start:.2f}s"
    #     )

    #     # 2. Search PostgreSQL using cosine distance
    #     retrieval_start = time.perf_counter()

    #     distance = DocumentChunk.embedding.cosine_distance(
    #         query_vector
    #     ).label("distance")

    #     stmt = (
    #         select(DocumentChunk, Document, distance)
    #         .join(Document)
    #         .order_by(distance)
    #         .limit(top_k)
    #     )

    #     result = await self.db.execute(stmt)
    #     chunks_docs = result.all()

    #     print(
    #         f"[PERF] Vector retrieval: "
    #         f"{time.perf_counter() - retrieval_start:.2f}s"
    #     )

    #     # 3. Return retrieved chunks with calculated scores
    #     context_items = []

    #     for chunk, doc, cosine_distance in chunks_docs:
    #         similarity = max(0.0, min(1.0, 1.0 - float(cosine_distance)))

    #         context_items.append({
    #             "chunk_id": chunk.id,
    #             "text": chunk.text,
    #             "page": chunk.page,
    #             "document_name": doc.name,
    #             "similarity_score": round(similarity, 4),
    #         })

    #     return context_items

    # async def retrieve_context(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
    #     query_vector = self.embedder.embed_query(query)
        
    #     # pgvector uses `<->` for L2 distance, `<#>` for negative inner product, `<=>` for cosine distance
    #     # We'll use cosine distance: <=> 
    #     stmt = select(DocumentChunk, Document).join(Document).order_by(
    #         DocumentChunk.embedding.cosine_distance(query_vector)
    #     ).limit(top_k)
        
    #     result = await self.db.execute(stmt)
    #     chunks_docs = result.all()
        
    #     context_items = []
    #     for chunk, doc in chunks_docs:
    #         context_items.append({
    #             "chunk_id": chunk.id,
    #             "text": chunk.text,
    #             "page": chunk.page,
    #             "document_name": doc.name,
    #             "similarity_score": 0.95 # Mocked score since we need pgvector syntax to extract distance, omitted for brevity
    #         })
            
    #     return context_items
    async def generate_response(self,query: str,context: List[Dict[str, Any]],) -> Dict[str, Any]:
        start = time.perf_counter()

        if not context:
            return {
                "answer": (
                    "I couldn't find sufficient information in the "
                    "available enterprise knowledge base to answer this question."
                ),
                "sources": [],
            }

        # Keep the top 3 retrieved chunks to reduce prompt size.
        selected_context = context[:3]

        context_str = "\n\n".join(
            f"Source: {c['document_name']} (Page {c['page']})\n{c['text'][:2500]}"
            for c in selected_context
        )

        
        prompt = f"""You are an Enterprise AI Knowledge Assistant.

Your task is to answer the user's question using only the authorized context
provided below.

ACCURACY RULES:
- Do not invent facts, numbers, dates, or conclusions.
- If the context does not support the answer, say:
  "I couldn't find sufficient information in the available enterprise knowledge base."
- Preserve the meaning and accuracy of the source documents.
- Clearly distinguish reported facts from projections or expectations.

FORMATTING RULES:
- Return the answer in valid Markdown.
- Start with a direct answer or a short executive summary when appropriate.
- Use ## headings for major sections in longer answers.
- Use ### headings for subsections when necessary.
- Use bullet points for related facts and numbered lists for sequential steps.
- Use Markdown tables for financial figures, comparisons, and structured data.
- Bold important figures, key terms, and conclusions.
- Keep paragraphs short and readable.
- For simple questions, answer directly without unnecessary headings.
- Do not add irrelevant sections or repeat the same information.
- Do not output HTML or explain your formatting choices.

CONTEXT:
{context_str}

QUESTION:
{query}

Provide a clear, well-structured answer appropriate to the question.
"""


        if self.llm:
            try:
                llm_start = time.perf_counter()

                response = await asyncio.wait_for(
                    self.llm.ainvoke(prompt),
                    timeout=30,
                )

                print(
                    f"[PERF] LLM generation: "
                    f"{time.perf_counter() - llm_start:.2f}s"
                )

                raw = response.content

                if isinstance(raw, list):
                    answer = "\n".join(
                        item.get("text", str(item))
                        if isinstance(item, dict)
                        else str(item)
                        for item in raw
                    )
                else:
                    answer = str(raw)

            except asyncio.TimeoutError:
                answer = (
                    "Answer generation timed out. Please try again. "
                    "The request took too long to complete."
                )
            except Exception:
                import logging
                logging.exception("LLM generation failed")
                answer = (
                    "The AI service is temporarily unavailable. "
                    "Please try again shortly."
                )
        else:
            answer = (
                "The language model is not configured. "
                "Please configure the LLM provider."
            )

        sources = [
            {
                "documentName": c["document_name"],
                "page": c["page"],
                "chunkId": c["chunk_id"],
                "relevanceScore": c["similarity_score"],
            }
            for c in selected_context
        ]

        print(
            f"[PERF] generate_response total: "
            f"{time.perf_counter() - start:.2f}s"
        )

        return {
            "answer": answer,
            "sources": sources,
        }

#     async def generate_response(self, query: str, context: List[Dict[str, Any]]) -> Dict[str, Any]:
#         if not context:
#             return {
#                 "answer": "I couldn't find sufficient information in the available enterprise knowledge base to answer this question.",
#                 "sources": []
#             }
            
#         context_str = "\n\n".join([f"Source: {c['document_name']} (Page {c['page']})\n{c['text']}" for c in context])
        
#         prompt = f"""
# You are an Enterprise AI Knowledge Assistant. Use the following authorized context to answer the user's query.
# If the information is not present in the context, say "I couldn't find sufficient information...".
# Do not hallucinate.

# Context:
# {context_str}

# Query: {query}
# """
        
#         if self.llm:
#             try:
#                 response = await self.llm.ainvoke(prompt)
#                 raw = response.content
#                 # Gemini may return a list of content blocks like [{'type':'text','text':'...'}]
#                 if isinstance(raw, list):
#                     answer = "\n".join(
#                         item.get("text", str(item)) if isinstance(item, dict) else str(item)
#                         for item in raw
#                     )
#                 else:
#                     answer = str(raw)
#             except Exception as e:
#                 import traceback
#                 traceback.print_exc()
#                 answer = f"LLM call failed: {str(e)}\n\nFalling back to context summary for: {query}\nContext used: {len(context)} chunks."
#         else:
#             answer = f"According to available enterprise knowledge... (Simulated LLM response for: {query})\nContext used: {len(context)} chunks."
            
#         sources = [{
#             "documentName": c["document_name"],
#             "page": c["page"],
#             "chunkId": c["chunk_id"],
#             "relevanceScore": c["similarity_score"]
#         } for c in context]
        
#         return {
#             "answer": answer,
#             "sources": sources
#         }
    
    async def process_query(
    self,
    query: str,
    document_ids: List[str] | None = None,
) -> Dict[str, Any]:
        import time

        start = time.perf_counter()

        context = await self.retrieve_context(
    query,
    document_ids=document_ids,
)

        retrieval_done = time.perf_counter()
        print(
            f"[PERF] Total retrieval stage: "
            f"{retrieval_done - start:.2f}s"
        )

        result = await self.generate_response(query, context)

        print(
            f"[PERF] Answer generation: "
            f"{time.perf_counter() - retrieval_done:.2f}s"
        )
        print(
            f"[PERF] Total RAG processing: "
            f"{time.perf_counter() - start:.2f}s"
        )

        result["steps"] = [
            {
                "id": "s1",
                "label": "Query Analysis",
                "agentName": "QueryAgent",
                "status": "completed",
            },
            {
                "id": "s2",
                "label": "Vector Retrieval",
                "agentName": "RetrievalAgent",
                "status": "completed",
            },
            {
                "id": "s3",
                "label": "Synthesis & Grounding",
                "agentName": "ResponseAgent",
                "status": "completed",
            },
        ]

        return result
    
    # async def process_query(self, query: str) -> Dict[str, Any]:
    #     """Multi-agent orchestration simulator"""
    #     # 1. Query Agent (Parse intent)
    #     # 2. Retrieval Agent
    #     context = await self.retrieve_context(query)
    #     # 3. Knowledge/Response Agent
    #     result = await self.generate_response(query, context)
        
    #     result["steps"] = [
    #         {"id": "s1", "label": "Query Analysis", "agentName": "QueryAgent", "status": "completed"},
    #         {"id": "s2", "label": "Vector Retrieval", "agentName": "RetrievalAgent", "status": "completed"},
    #         {"id": "s3", "label": "Synthesis & Grounding", "agentName": "ResponseAgent", "status": "completed"}
    #     ]
    #     return result
