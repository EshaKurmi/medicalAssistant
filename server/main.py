from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from rag.chain import get_rag_chain
from logger import logger
import asyncio

app = FastAPI(title="Medical Assistant API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

rag_chain = None

class ChatRequest(BaseModel):
    query: str

@app.get("/")
def home():
    return {"message": "Medical Assistant Running", "status": "ok"}

@app.get("/health")
def health():
    return {"status": "healthy", "chain_loaded": rag_chain is not None}

@app.post("/chat")
async def chat(data: ChatRequest):
    global rag_chain
    if rag_chain is None:
        logger.info("Chain load ho rahi hai...")
        rag_chain = get_rag_chain()
    try:
        logger.info(f"Query: {data.query}")
        answer = rag_chain.invoke(data.query)
        return {"answer": answer}
    except Exception as e:
        logger.error(f"Error: {e}")
        return {"answer": "Kuch problem aa gayi, dobara try karo."}