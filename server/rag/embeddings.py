from langchain_huggingface import HuggingFaceEmbeddings
from langchain_pinecone import PineconeVectorStore
from logger import logger
from pinecone import Pinecone, ServerlessSpec
import os

# Singleton embedding — sirf ek baar load hoga
_embedding = None

def get_embedding_function():
    global _embedding
    if _embedding is not None:
        return _embedding

    logger.info("Embedding model load ho raha hai...")
    _embedding = HuggingFaceEmbeddings(
        model_name="sentence-transformers/paraphrase-MiniLM-L3-v2",  # Sabse chhota model
        model_kwargs={"device": "cpu"},
        encode_kwargs={"batch_size": 4}  # 8 se 4 kiya — memory bachao
    )
    logger.info("Embedding model ready!")
    return _embedding

def get_pinecone_client():
    pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
    index_name = os.getenv("PINECONE_INDEX", "medical-assistant")
    return pc, index_name

def build_vector_store():
    """Sirf ek baar chalana — PDF se Pinecone mein data upload karta hai"""
    from server.rag.loader import load_documents
    logger.info("Vector store build ho raha hai...")
    docs = load_documents()
    if not docs:
        raise ValueError("Koi document nahi mila medical_docs folder mein!")

    embedding = get_embedding_function()
    pc, index_name = get_pinecone_client()

    existing = [i.name for i in pc.list_indexes()]
    if index_name not in existing:
        logger.info("Pinecone index bana raha hoon...")
        pc.create_index(
            name=index_name,
            dimension=384,
            metric="cosine",
            spec=ServerlessSpec(cloud="aws", region="us-east-1")
        )

    db = PineconeVectorStore.from_documents(
        documents=docs,
        embedding=embedding,
        index_name=index_name
    )
    logger.info("Vector store ready!")
    return db

def load_vector_store():
    """Server start pe — Pinecone se connect karta hai (no PDF loading)"""
    logger.info("Pinecone se connect ho raha hoon...")
    embedding = get_embedding_function()
    _, index_name = get_pinecone_client()
    return PineconeVectorStore(
        index_name=index_name,
        embedding=embedding
    )