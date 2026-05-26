from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class ChatRequest(BaseModel):
    query: str


@app.on_event("startup")
async def startup_event():
    print("Server started")


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

    user_message = data.query

    # Temporary response
    return {
        "answer": f"You asked: {user_message}"
    }