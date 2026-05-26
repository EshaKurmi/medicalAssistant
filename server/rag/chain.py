from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from server.rag.embeddings import load_vector_store
from server.logger import logger
import os

MEDICAL_PROMPT = """You are an expert medical assistant.
Use ONLY the following context to answer the question.
If the answer is not in the context, say "I don't have enough information about this."
Never make up or guess medical information — it can be dangerous.

Context:
{context}

Question: {question}

Answer:"""

def get_rag_chain():
    logger.info("Setting up RAG chain with Groq...")

    db = load_vector_store()
    retriever = db.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 5}
    )

    llm = ChatGroq(
        model="llama-3.3-70b-versatile",
        temperature=0.2,
        api_key=os.getenv("GROQ_API_KEY")
    )

    prompt = ChatPromptTemplate.from_template(MEDICAL_PROMPT)

    chain = (
        {"context": retriever, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )

    logger.info("RAG chain is ready!")
    return chain