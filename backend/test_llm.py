import asyncio
from app.core.config import settings
from app.services.rag_service import RagService

async def main():
    print(f'GEMINI: {settings.GEMINI_API_KEY}')
    rag = RagService(None)
    print(f'LLM: {rag.llm}')

asyncio.run(main())
