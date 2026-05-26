from fastapi import FastAPI

app = FastAPI()


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