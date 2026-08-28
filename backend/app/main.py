import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.db.database import Base, engine
from app.api import api_router

load_dotenv()

# Initialize DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CancerCare AI — Backend API",
    description="Intelligent cancer medication adherence, safety triage & patient-support assistant.",
    version="1.0.0",
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
