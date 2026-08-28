import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.db.database import Base, engine
from app.api import api_router

load_dotenv()

# Initialize DB tables
Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: init RAG index and background scheduler. Shutdown: stop scheduler."""
    # Pre-initialize ChromaDB RAG collection on startup
    try:
        from app.rag.retriever import get_rag_collection
        get_rag_collection()
    except Exception as e:
        print(f"[RAG INIT WARNING] {e}")

    # Start background escalation scheduler
    try:
        from app.services.scheduler_service import start_scheduler
        start_scheduler()
    except Exception as e:
        print(f"[SCHEDULER WARNING] {e}")

    yield

    # Shutdown
    try:
        from app.services.scheduler_service import stop_scheduler
        stop_scheduler()
    except Exception:
        pass

app = FastAPI(
    title="CancerCare AI — Backend API",
    description="Intelligent cancer medication adherence, safety triage & patient-support assistant.",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS for Vite React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production / hackathon demo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include central API router
app.include_router(api_router, prefix="/api")


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "CancerCare AI API",
        "version": "1.0.0",
        "safety_mode": "Deterministic Guardrails Active"
    }


if __name__ == "__main__":
    import uvicorn
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host=host, port=port, reload=True)
