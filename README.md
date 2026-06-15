# RAG Chatbot — Full-Stack (MERN + AI)

An upgraded version of my chatbot project: upload documents (txt/pdf/docx),
then ask questions answered using ONLY your documents (Retrieval-Augmented
Generation), with user login and chat history.

## Architecture

```
[React frontend]  --HTTP-->  [Node + Express backend]  --HTTP-->  [Python FastAPI AI service]
   login/chat UI            JWT auth + API gateway              chunking + embeddings + RAG
                                     |                                      |
                                     +-------------- MongoDB ---------------+
                                          (users, document chunks, chats)
```

**Why two backends?** The AI/RAG logic lives in Python (sentence-transformers,
AI21). MERN's backend is Node. So Python runs as a separate microservice that
Node calls. This is a clean, real-world separation — and a strong interview point.

## Tech stack
- **Frontend:** React
- **Backend:** Node + Express, JWT auth, bcrypt
- **AI service:** Python, FastAPI, sentence-transformers, AI21 (jamba-large)
- **Database:** MongoDB
- **RAG:** document chunking + vector similarity retrieval + LLM answer

## Setup

### 0. Prerequisites
- Node.js, Python 3.x, MongoDB running locally
- An AI21 API key

### 1. AI service (Python)
```bash
cd ai-service
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
echo "AI21_API_KEY=your_key_here" > .env
echo "MONGO_URI=mongodb://localhost:27017" >> .env
uvicorn main:app --reload --port 8000
```

### 2. Backend (Node)
```bash
cd backend
npm install
cp .env.example .env        # then edit JWT_SECRET
node server.js
```

### 3. Frontend (React)
```bash
npm create vite@latest frontend-app -- --template react
# copy the files from frontend/src/ into frontend-app/src/
cd frontend-app && npm install axios && npm run dev
```

## How to use
1. Sign up / log in.
2. Upload a document (e.g. doc1.txt / doc2.txt).
3. Ask a question — the bot answers from your document and shows the source file.

## What improved vs the original scripts
- Proper **chunking** of documents (was: whole-file embeddings).
- Embeddings computed **once at upload** (was: re-encoded on every question).
- **Real RAG answers** from the LLM (was: truncated raw text).
- Added **React frontend**, **JWT auth**, and a clean **API gateway**.
- Per-user document isolation (each user only queries their own files).
