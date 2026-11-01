# Enterprise AI Knowledge Assistant - Backend Architecture

## 1. Backend Architecture

The backend will be built using a modern Python stack centered around FastAPI, ensuring high performance, asynchronous request handling, and strong type safety (via Pydantic).

- **API Layer**: FastAPI for REST APIs with JWT-based authentication.
- **Database**: PostgreSQL for application data (Users, Conversations, Messages, Documents).
- **Vector Database**: `pgvector` extension in PostgreSQL to store and query document embeddings.
- **ORM**: SQLAlchemy 2.0 (async) with Alembic for migrations.
- **AI / LLM Integration**: LangChain or LlamaIndex for RAG pipelines, interfacing with an embedding model (e.g., OpenAI `text-embedding-3-small` or local HuggingFace) and an LLM (e.g., GPT-4o or Claude 3.5).
- **Multi-Agent Orchestration**: LangGraph or a custom multi-agent routing system to handle query categorization, retrieval, re-ranking, and response synthesis.

## 2. API Endpoint List

### Auth & Users (`/api/auth`, `/api/users`)
- `POST /api/auth/login`: Authenticate and return JWT token.
- `POST /api/auth/signup`: Register a new user.
- `POST /api/auth/logout`: Clear session.
- `GET /api/users/me`: Get current user profile.
- `PUT /api/users/me`: Update user profile.
- `PUT /api/users/me/password`: Change password.
- `GET /api/users/preferences`: Get user preferences.
- `PUT /api/users/preferences`: Update user preferences.
- `POST /api/auth/switch-role`: (Dev/Admin) Switch active role.

### Chat & Conversations (`/api/chat`)
- `GET /api/chat/conversations`: List all user conversations.
- `GET /api/chat/conversations/{id}`: Get a specific conversation.
- `DELETE /api/chat/conversations/{id}`: Delete a conversation.
- `POST /api/chat/conversations/{id}/messages`: Send a message and trigger RAG pipeline.
- `POST /api/chat/conversations/{id}/messages/{msg_id}/regenerate`: Regenerate a response.
- `POST /api/chat/conversations/{id}/messages/{msg_id}/feedback`: Submit simple feedback.
- `POST /api/chat/conversations/{id}/messages/{msg_id}/detailed-feedback`: Submit detailed feedback.

### Documents (`/api/documents`)
- `GET /api/documents`: List documents (with search/filters).
- `POST /api/documents`: Upload a document (extract, embed, index).
- `DELETE /api/documents/{id}`: Delete a document.
- `POST /api/documents/{id}/reindex`: Reindex a document.
- `GET /api/documents/{id}/status`: Get processing status.

### System & Admin (`/api/system`)
- `GET /api/system/stats`: Get admin statistics (users, docs, queries, vectors).
- `GET /api/system/status`: Get system health, latency, DB status.
- `GET /api/system/session`: Get current active session details.

## 3. Request/Response Models

- **User**: `id`, `name`, `email`, `role`, `department`, `employeeId`, `avatarUrl`, `joinedDate`
- **Conversation**: `id`, `title`, `lastUpdated`, `messages` (list)
- **ChatMessage**: `id`, `sender`, `content`, `timestamp`, `sources`, `confidence`, `processingSteps`, `feedback`, `detailedFeedback`, `answerMode`, etc.
- **Document**: `id`, `name`, `type`, `department`, `size`, `status`, `updatedAt`, `chunksCount`
- **DocumentChunk**: `id`, `document_id`, `text`, `embedding` (vector), `metadata`
- **AdminStats**: `totalDocuments`, `totalUsers`, `totalQueries`, `indexedPercentage`, `vectorEmbeddingsCount`
- **SystemStatus**: `status`, `latencyMs`, `vectorDbStatus`, `vectorDbRecords`, `embeddingModel`, `agentsActive`, `lastSync`

## 4. Authentication Flow

1. **Signup/Login**: Client sends credentials to `/api/auth/login` or `signup`.
2. **Token Generation**: FastAPI verifies/hashes passwords (bcrypt) and generates an access token (JWT).
3. **Session Management**: The frontend stores the token (usually in memory/localStorage or HttpOnly cookie) and attaches it as a `Bearer` token in the `Authorization` header for subsequent requests.
4. **RBAC**: Middleware/Depends in FastAPI decodes the token, attaches the user object to the request, and enforces roles (e.g., `ADMIN` required for system stats).

## 5. RAG Architecture

1. **Ingestion**: 
   - Files uploaded via FastAPI.
   - Parsed by document loaders (PDFPlumber, Docx2txt, etc.).
   - Text is split into chunks using a semantic text splitter.
2. **Embedding**: 
   - Each chunk is embedded using a chosen embedding model.
3. **Storage**: 
   - Inserted into PostgreSQL table using `pgvector` (`VECTOR(1536)`).
4. **Retrieval**: 
   - User query is embedded.
   - Vector similarity search (HNSW/IVFFlat index on pgvector) finds top-K chunks.
   - Filtering applied (e.g., based on document department or access control).
5. **Generation**: 
   - Context is injected into the LLM prompt.
   - LLM generates response with citations (`SourceReference`).

## 6. Multi-Agent Architecture

The query processing pipeline uses specialized agents:
- **Router Agent**: Analyzes user query to determine if it needs RAG, summarization, or general chat.
- **Retrieval Agent**: Formulates optimal vector DB queries and fetches context.
- **Re-Rank Agent**: Scores retrieved chunks for relevance to filter out noise.
- **Synthesis/Grounding Agent**: Constructs the final answer strictly grounded in the provided context, outputting a structured response including confidence scores and follow-up questions.

## 7. PostgreSQL + pgvector Data Model

- **Users Table**: id, email, password_hash, name, role, department, employee_id
- **Conversations Table**: id, user_id, title, last_updated
- **Messages Table**: id, conversation_id, sender, content, timestamp, sources (JSON), feedback (JSON), metadata
- **Documents Table**: id, name, type, department, size, status, chunks_count
- **DocumentChunks Table**: id, document_id, chunk_index, text, token_count, embedding (VECTOR type)

## 8. Folder Structure

```
backend/
├── app/
│   ├── main.py
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   ├── database.py
│   ├── models/ (SQLAlchemy models)
│   │   ├── user.py
│   │   ├── chat.py
│   │   ├── document.py
│   ├── schemas/ (Pydantic schemas)
│   │   ├── user.py
│   │   ├── chat.py
│   │   ├── document.py
│   ├── api/
│   │   ├── dependencies.py
│   │   ├── endpoints/
│   │   │   ├── auth.py
│   │   │   ├── chat.py
│   │   │   ├── documents.py
│   │   │   ├── system.py
│   ├── services/
│   │   ├── rag_service.py
│   │   ├── multi_agent.py
│   │   ├── doc_parser.py
├── requirements.txt
├── .env
```

## 9. Environment Variables Required

```env
# Server
PORT=8000
ENVIRONMENT=development

# Database
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/enterprise_ai

# Security
SECRET_KEY=your_super_secret_jwt_key
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# AI/LLM Models
OPENAI_API_KEY=sk-...
EMBEDDING_MODEL=text-embedding-3-small
LLM_MODEL=gpt-4o
```
