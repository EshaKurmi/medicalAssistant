from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from logger import logger
import os

def load_documents(data_path: str = None):
    # Auto path detect karo
    if data_path is None:
        base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        data_path = os.path.join(base, "data", "medical_docs")
    
    logger.info(f"Loading documents from: {data_path}")

    loader = PyPDFDirectoryLoader(data_path)
    documents = loader.load()

    logger.info(f"Total pages loaded: {len(documents)}")

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=100
    )

    chunks = splitter.split_documents(documents)
    logger.info(f"Total chunks created: {len(chunks)}")

    return chunks