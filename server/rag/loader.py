from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from server.logger import logger

def load_documents(data_path: str = "server/data/medical_docs"):
    logger.info(f"Loading documents from: {data_path}")

    loader = PyPDFDirectoryLoader(data_path)
    documents = loader.load()

    logger.info(f"Total pages loaded: {len(documents)}")

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )

    chunks = splitter.split_documents(documents)
    logger.info(f"Total chunks created: {len(chunks)}")

    return chunks