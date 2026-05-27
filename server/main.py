from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from rag.chain import get_rag_chain  # ✅
from logger import logger            # ✅

app = FastAPI(title="Medical Assistant API")

# CORS — frontend se connect hone ke liye
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Production mein apna domain dalna
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Singleton chain — sirf ek baar load hoga
rag_chain = None

class ChatRequest(BaseModel):
    query: str

@app.on_event("startup")
async def startup_event():
    global rag_chain
    logger.info("Server start ho raha hai — RAG chain load ho rahi hai...")
    try:
        rag_chain = get_rag_chain()
        logger.info("RAG chain ready!")
    except Exception as e:
        logger.error(f"Chain load nahi hui: {e}")

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
        return {"answer": "Server abhi ready nahi hai, thodi der mein try karo."}
    try:
        logger.info(f"Query: {data.query}")
        answer = rag_chain.invoke(data.query)
        return {"answer": answer}
    except Exception as e:
        logger.error(f"Error: {e}")
        return {"answer": "Kuch problem aa gayi, dobara try karo."}