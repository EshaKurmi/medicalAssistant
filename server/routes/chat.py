from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from server.logger import logger

router = APIRouter(prefix="/api", tags=["Medical Chat"])

rag_chain = None

class ChatRequest(BaseModel):
    question: str

class ChatResponse(BaseModel):
    question: str
    answer: str

@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    global rag_chain

    if not req.question.strip():
        raise HTTPException(
            status_code=400,
            detail="Question empty nahi ho sakta!"
        )

    logger.info(f"Question: {req.question}")
    answer = rag_chain.invoke(req.question)
    logger.info("Answer generated successfully")

    return ChatResponse(question=req.question, answer=answer)

@router.get("/health")
async def health_check():
    return {
        "status": "running",
        "model": "llama3-8b-8192",
        "vector_db": "pinecone"
    }