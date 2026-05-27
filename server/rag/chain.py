from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from rag.embeddings import load_vector_store
from logger import logger
import os

MEDICAL_PROMPT = """You are an expert medical assistant.
Use ONLY the following context to answer the question.
If the answer is not in the context, say "I don't have enough information about this topic in my current database."
Never make up or guess medical information — it can be dangerous.
Be concise, clear, and helpful. If suggesting to see a doctor, always mention it politely.

Context:
{context}

Question: {question}

Answer:"""

# Singleton — sirf ek baar banegi
_chain = None

def get_rag_chain():
    global _chain
    if _chain is not None:
        logger.info("Chain already loaded — reuse kar raha hoon")
        return _chain

    logger.info("RAG chain pehli baar ban rahi hai...")

    db = load_vector_store()
    retriever = db.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 3}  # 5 se 3 kiya — memory bachao
    )

    llm = ChatGroq(
        model="llama-3.3-70b-versatile",
        temperature=0.2,
        api_key=os.getenv("GROQ_API_KEY"),
        max_tokens=512  # Response limit — memory bachao
    )

    prompt = ChatPromptTemplate.from_template(MEDICAL_PROMPT)

    _chain = (
        {"context": retriever, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )

    logger.info("RAG chain ready!")
    return _chain