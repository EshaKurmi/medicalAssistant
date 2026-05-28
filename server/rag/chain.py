from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from rag.embeddings import load_vector_store
from logger import logger
import os

MEDICAL_PROMPT = """You are MediBot — a warm, knowledgeable AI medical assistant.

IMPORTANT RULES:
- If the context has relevant information, use it
- If context doesn't have the answer, use YOUR OWN medical knowledge to help
- For vague questions like "I have pain", ask follow-up: "Kahan dard hai? Kitne time se?"
- Always be helpful — never say "I don't have information"
- Give practical advice, first aid tips, when to see doctor
- Be warm and conversational in Hinglish or English
- Keep answers 3-5 lines

Context from medical database:
{context}

Question: {question}

Answer:"""

_chain = None

def get_rag_chain():
    global _chain
    if _chain is not None:
        logger.info("Chain already loaded — reuse kar raha hoon")
        return _chain

    logger.info("RAG chain ban rahi hai...")
    db = load_vector_store()
    retriever = db.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 3}
    )

    llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0.3,
    api_key=os.getenv("GROQ_API_KEY"),
    max_tokens=1024  # 512 se 1024 kiya
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