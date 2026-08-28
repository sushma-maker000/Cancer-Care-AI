from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.models.models import Patient, Medication
from app.schemas.chat_schemas import ChatRequest, ChatResponse, ChatSource
from app.services.chat_service import process_chat_message

router = APIRouter()


@router.post("", response_model=ChatResponse)
def chat(request: ChatRequest, db: Session = Depends(get_db)):
    """
    CancerCare AI Chatbot (§12)
    Supports: medication questions, symptoms, cancer education, nutrition, adherence coaching.
    Safety triage runs deterministically BEFORE any LLM call.
    """
    patient = db.query(Patient).filter(Patient.id == request.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail=f"Patient #{request.patient_id} not found.")

    # Get patient's active medications for context
    medications = db.query(Medication).filter(
        Medication.patient_id == request.patient_id,
        Medication.is_active == True,
    ).all()
    med_names = [m.name for m in medications]

    # Convert chat history
    history = []
    if request.chat_history:
        for msg in request.chat_history:
            history.append({"role": msg.role, "content": msg.content})

    result = process_chat_message(
        user_message=request.message,
        patient_medications=med_names,
        chat_history=history,
        language=request.language or patient.preferred_language,
    )

    return ChatResponse(
        response=result["response"],
        triage_level=result["triage_level"],
        intent=result["intent"],
        sources=[ChatSource(**s) for s in result["sources"]],
        is_emergency=result["triage_level"] == "red_flag",
    )
