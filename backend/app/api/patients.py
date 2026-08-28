from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.models import Patient
from app.schemas.patient_schemas import PatientCreate, PatientUpdate, PatientResponse

router = APIRouter()

@router.post("", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
def create_patient(patient_in: PatientCreate, db: Session = Depends(get_db)):
    """Create a new patient profile."""
    db_patient = Patient(**patient_in.model_dump())
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient


@router.get("", response_model=List[PatientResponse])
def list_patients(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    """List all registered patients."""
    patients = db.query(Patient).offset(skip).limit(limit).all()
    return patients


@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient(patient_id: int, db: Session = Depends(get_db)):
    """Retrieve patient profile by ID."""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID {patient_id} not found."
        )
    return patient


@router.put("/{patient_id}", response_model=PatientResponse)
def update_patient(patient_id: int, patient_update: PatientUpdate, db: Session = Depends(get_db)):
    """Update patient profile fields."""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID {patient_id} not found."
        )
    
    update_data = patient_update.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(patient, field, val)
    
    db.commit()
    db.refresh(patient)
    return patient


@router.post("/seed-synthetic", response_model=PatientResponse)
def seed_synthetic_patient(language: str = "English", db: Session = Depends(get_db)):
    """
    Seed standard synthetic patient for 36-hour hackathon demonstration.
    Supports English or Tamil preference.
    """
    existing = db.query(Patient).filter(Patient.name == "Sarah Jenkins").first()
    if existing:
        existing.preferred_language = language
        db.commit()
        db.refresh(existing)
        return existing

    synthetic_data = Patient(
        name="Sarah Jenkins",
        age=52,
        gender="Female",
        preferred_language=language,
        patient_phone="+91 98765 12345",
        smoking_status="Non-smoker",
        alcohol_consumption="None",
        medical_history="Mild Hypertension (diagnosed 2020), no prior drug allergies.",
        condition_or_disease="Invasive Ductal Breast Carcinoma",
        cancer_type="Stage IIA HER2-Positive Breast Cancer",
        treatment_type="Adjuvant AC-T Chemotherapy Regimen",
        caregiver_name="Mark Jenkins (Spouse)",
        caregiver_email="caregiver.mark@example.com",
        caregiver_phone="+91 98765 43210",
        notification_preference="In-App + Caregiver Escalation",
        escalation_after_minutes=30,
    )
    db.add(synthetic_data)
    db.commit()
    db.refresh(synthetic_data)
    return synthetic_data
