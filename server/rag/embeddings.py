from langchain_huggingface import HuggingFaceEmbeddings
from langchain_pinecone import PineconeVectorStore
from logger import logger
from pinecone import Pinecone
import os

_embedding = None

def get_embedding_function():
    global _embedding
    if _embedding is not None:
        return _embedding

    logger.info("Embedding model load ho raha hai...")
    _embedding = HuggingFaceEmbeddings(
        model_name="sentence-transformers/paraphrase-MiniLM-L3-v2",
        model_kwargs={"device": "cpu"},
        encode_kwargs={
            "batch_size": 1,
            "normalize_embeddings": True
        }
    )
    logger.info("Embedding model ready!")
    return _embedding

def load_vector_store():
    logger.info("Pinecone se connect ho raha hoon...")
    embedding = get_embedding_function()
    pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
    index_name = os.getenv("PINECONE_INDEX", "medical-assistant")
    return PineconeVectorStore(
        index_name=index_name,
        embedding=embedding
    )