from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class ChatRequest(BaseModel):
    query: str


@app.get("/")
def home():
    return {
        "message": "Medical Assistant Running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


@app.post("/chat")
async def chat(data: ChatRequest):

    return {
        "answer": f"You asked: {data.query}"
    }