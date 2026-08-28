from fastapi import APIRouter
from app.api.patients import router as patients_router
from app.api.prescriptions import router as prescriptions_router
from app.api.medications import router as medications_router

api_router = APIRouter()
api_router.include_router(patients_router, prefix="/patients", tags=["Patients"])
api_router.include_router(prescriptions_router, prefix="/prescriptions", tags=["Prescriptions"])
api_router.include_router(medications_router, prefix="", tags=["Medications & Adherence"])
