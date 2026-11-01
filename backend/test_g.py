
import asyncio
import time

from app.core.config import settings
from langchain_google_genai import ChatGoogleGenerativeAI


async def main():
    llm = ChatGoogleGenerativeAI(
        google_api_key=settings.GEMINI_API_KEY,
        model="gemini-3.5-flash-lite",
        timeout=60,
        max_retries=0,
    )

    start = time.perf_counter()

    response = await llm.ainvoke(
        "Reply in one sentence: What is an enterprise knowledge assistant?"
    )

    print("Response:", response.content)
    print(f"Time: {time.perf_counter() - start:.2f} seconds")


asyncio.run(main())
