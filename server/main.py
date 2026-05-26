from fastapi import FastAPI
import logging

app = FastAPI()

logger = logging.getLogger(__name__)


@app.on_event("startup")
async def startup_event():
    try:
        logger.info("Application started")

        # IMPORTANT:
        # startup pe heavy indexing mat chalao

        logger.info("Skipping vector build")

    except Exception as e:
        logger.error(str(e))


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