from langchain_openai import OpenAIEmbeddings
from typing import List
from app.core.config import settings

class EmbeddingProvider:
    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY.strip() if settings.OPENAI_API_KEY else ""
        self.gemini_key = settings.GEMINI_API_KEY.strip() if hasattr(settings, "GEMINI_API_KEY") and settings.GEMINI_API_KEY else ""
        
        if self.gemini_key:
            from langchain_google_genai import GoogleGenerativeAIEmbeddings
            self.model = GoogleGenerativeAIEmbeddings(google_api_key=self.gemini_key, model="models/gemini-embedding-001")
        elif self.api_key and "your-openai" not in self.api_key.lower() and not self.api_key.startswith("sk-..."):
            self.model = OpenAIEmbeddings(openai_api_key=self.api_key, model="text-embedding-3-small")
        else:
            self.model = None

    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        if not self.model:
            import random
            return [[random.uniform(0.1, 0.9) for _ in range(1536)] for _ in texts]
        return self.model.embed_documents(texts)
        
    def embed_query(self, query: str) -> List[float]:
        if not self.model:
            import random
            return [random.uniform(0.1, 0.9) for _ in range(1536)]
        return self.model.embed_query(query)
    
    async def aembed_query(self, query: str) -> List[float]:
        if not self.model:
            raise RuntimeError("No embedding model is configured.")

        return await self.model.aembed_query(query)

