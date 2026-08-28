from fastapi import APIRouter
from app.api.patients import router as patients_router
from app.api.prescriptions import router as prescriptions_router
from app.api.medications import router as medications_router
from app.api.chat import router as chat_router
from app.api.caregiver import router as caregiver_router

api_router = APIRouter()
api_router.include_router(patients_router, prefix="/patients", tags=["Patients"])
api_router.include_router(prescriptions_router, prefix="/prescriptions", tags=["Prescriptions"])
api_router.include_router(medications_router, prefix="", tags=["Medications & Adherence"])
api_router.include_router(chat_router, prefix="/chat", tags=["AI Chatbot & Safety"])
api_router.include_router(caregiver_router, prefix="/caregiver", tags=["Caregiver Escalation"])
