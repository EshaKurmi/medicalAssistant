from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from server.middlewares.exception_handlers import catch_exception_middleware
from server.routes.chat import router
from server.rag.embeddings import build_vector_store
from server.routes import chat as chat_module
from server.rag.chain import get_rag_chain
from server.logger import logger
from pinecone import Pinecone
import os

app = FastAPI(
    title="Medical Assistant API",
    description="RAG-based Medical Q&A system powered by Groq",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.middleware("http")(catch_exception_middleware)
app.include_router(router)

@app.on_event("startup")
async def startup_event():
    logger.info("Server starting up...")

    pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
    index_name = os.getenv("PINECONE_INDEX", "medical-assistant")
    existing = [i.name for i in pc.list_indexes()]

    if index_name not in existing:
        logger.info("Pinecone index nahi mila — building...")
        build_vector_store()
    else:
        stats = pc.Index(index_name).describe_index_stats()
        total_vectors = stats.get("total_vector_count", 0)
        if total_vectors == 0:
            logger.info("Index empty hai — documents upload ho rahe hain...")
            build_vector_store()
        else:
            logger.info(f"Pinecone ready — {total_vectors} vectors found!")

    chat_module.rag_chain = get_rag_chain()
    logger.info("Server is ready! 🏥")

@app.get("/")
async def root():
    return {"message": "Medical Assistant API is running 🏥"}