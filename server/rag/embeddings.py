from langchain_huggingface import HuggingFaceEndpointEmbeddings
from langchain_pinecone import PineconeVectorStore
from logger import logger
from pinecone import Pinecone, ServerlessSpec
import os

_embedding = None

def get_embedding_function():
    global _embedding
    if _embedding is not None:
        return _embedding

    logger.info("HuggingFace API se embedding load ho rahi hai...")
    _embedding = HuggingFaceEndpointEmbeddings(
        model="sentence-transformers/paraphrase-MiniLM-L3-v2",
        huggingfacehub_api_token=os.getenv("HF_API_TOKEN")
    )
    logger.info("Embedding ready!")
    return _embedding

def get_pinecone_client():
    pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
    index_name = os.getenv("PINECONE_INDEX", "medical-assistant")
    return pc, index_name

def build_vector_store():
    """PDFs se Pinecone me data upload karta hai"""
    from rag.loader import load_documents
    logger.info("Vector store build ho raha hai...")
    docs = load_documents()
    if not docs:
        raise ValueError("Koi document nahi mila!")

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
    """Server start pe Pinecone se connect karta hai"""
    logger.info("Pinecone se connect ho raha hoon...")
    embedding = get_embedding_function()
    _, index_name = get_pinecone_client()
    return PineconeVectorStore(
        index_name=index_name,
        embedding=embedding
    )