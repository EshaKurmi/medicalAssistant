from langchain_huggingface import HuggingFaceEmbeddings
from langchain_pinecone import PineconeVectorStore
from server.rag.loader import load_documents
from server.logger import logger
from pinecone import Pinecone, ServerlessSpec
import os

def get_embedding_function():
    logger.info("Loading embedding model...")
    return HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

def get_pinecone_client():
    pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
    index_name = os.getenv("PINECONE_INDEX", "medical-assistant")
    return pc, index_name

def build_vector_store():
    logger.info("Building Pinecone vector store...")

    docs = load_documents()

    if not docs:
        logger.error("Koi document nahi mila!")
        raise ValueError("No documents found in medical_docs folder")

    embedding = get_embedding_function()
    pc, index_name = get_pinecone_client()

    existing = [i.name for i in pc.list_indexes()]
    if index_name not in existing:
        logger.info(f"Index bana raha hoon...")
        pc.create_index(
            name=index_name,
            dimension=384,
            metric="cosine",
            spec=ServerlessSpec(cloud="aws", region="us-east-1")
        )

    logger.info("Documents Pinecone mein upload ho rahe hain...")
    db = PineconeVectorStore.from_documents(
        documents=docs,
        embedding=embedding,
        index_name=index_name
    )

    logger.info("Pinecone vector store ready!")
    return db

def load_vector_store():
    logger.info("Pinecone vector store load ho raha hai...")
    embedding = get_embedding_function()
    _, index_name = get_pinecone_client()

    return PineconeVectorStore(
        index_name=index_name,
        embedding=embedding
    )