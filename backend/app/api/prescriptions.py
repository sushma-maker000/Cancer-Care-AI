import os
import uuid
import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.database import get_db
from app.models.models import Prescription, Patient
from app.schemas.prescription_schemas import (
    PrescriptionUploadResponse,
    PrescriptionConfirmRequest,
    PrescriptionConfirmResponse,
    MedicationExtractedItem,
)
from app.services.ocr_service import (
    process_prescription_document,
    get_apex_sample_prescription,
    UPLOAD_DIR,
)
from app.services.medication_service import activate_prescription_schedule

router = APIRouter()

@router.post("/upload", response_model=PrescriptionUploadResponse)
async def upload_prescription(
    patient_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Upload and process a prescription image or PDF."""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail=f"Patient #{patient_id} not found.")

    ext = file.filename.split(".")[-1].lower() if "." in file.filename else "pdf"
    unique_name = f"{uuid.uuid4().hex}_{file.filename}"
    saved_path = os.path.join(UPLOAD_DIR, unique_name)

    content = await file.read()
    with open(saved_path, "wb") as f:
        f.write(content)

    # Process OCR & Mistral structured extraction
    raw_text, extracted_json = process_prescription_document(saved_path, file.filename, ext)

    db_rx = Prescription(
        patient_id=patient_id,
        file_name=file.filename,
        file_path=saved_path,
        file_type=ext,
        ocr_raw_text=raw_text,
        extracted_json=extracted_json,
        is_confirmed=False,
    )
    db.add(db_rx)
    db.commit()
    db.refresh(db_rx)

    meds_list = [
        MedicationExtractedItem(**m) for m in extracted_json.get("medications", [])
    ]

    return PrescriptionUploadResponse(
        prescription_id=db_rx.id,
        patient_id=patient_id,
        file_name=db_rx.file_name,
        file_type=db_rx.file_type,
        ocr_raw_text=raw_text,
        extracted_json=extracted_json,
        medications=meds_list,
        is_confirmed=False,
        created_at=db_rx.created_at,
    )


@router.post("/load-sample", response_model=PrescriptionUploadResponse)
def load_sample_prescription(
    patient_id: int = Form(...),
    db: Session = Depends(get_db),
):
    """1-Click loader for the APEX Oncology Center sample prescription for fast demo flow."""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail=f"Patient #{patient_id} not found.")

    raw_text, extracted_json = get_apex_sample_prescription()

    db_rx = Prescription(
        patient_id=patient_id,
        file_name="Apex_Oncology_Treatment_Plan_Jane_Doe.pdf",
        file_path="samples/apex_oncology_plan.pdf",
        file_type="pdf",
        ocr_raw_text=raw_text,
        extracted_json=extracted_json,
        is_confirmed=False,
    )
    db.add(db_rx)
    db.commit()
    db.refresh(db_rx)

    meds_list = [
        MedicationExtractedItem(**m) for m in extracted_json.get("medications", [])
    ]

    return PrescriptionUploadResponse(
        prescription_id=db_rx.id,
        patient_id=patient_id,
        file_name=db_rx.file_name,
        file_type=db_rx.file_type,
        ocr_raw_text=raw_text,
        extracted_json=extracted_json,
        medications=meds_list,
        is_confirmed=False,
        created_at=db_rx.created_at,
    )


@router.get("/{prescription_id}", response_model=PrescriptionUploadResponse)
def get_prescription(prescription_id: int, db: Session = Depends(get_db)):
    """Retrieve details and extracted medications of a prescription."""
    db_rx = db.query(Prescription).filter(Prescription.id == prescription_id).first()
    if not db_rx:
        raise HTTPException(status_code=404, detail="Prescription not found.")

    meds_list = [
        MedicationExtractedItem(**m) for m in (db_rx.extracted_json or {}).get("medications", [])
    ]

    return PrescriptionUploadResponse(
        prescription_id=db_rx.id,
        patient_id=db_rx.patient_id,
        file_name=db_rx.file_name,
        file_type=db_rx.file_type,
        ocr_raw_text=db_rx.ocr_raw_text or "",
        extracted_json=db_rx.extracted_json or {},
        medications=meds_list,
        is_confirmed=db_rx.is_confirmed,
        created_at=db_rx.created_at,
    )


@router.post("/{prescription_id}/confirm", response_model=PrescriptionConfirmResponse)
def confirm_prescription_medications(
    prescription_id: int,
    confirm_in: PrescriptionConfirmRequest,
    db: Session = Depends(get_db),
):
    """
    Patient confirmation endpoint (§4, §19, §28).
    Takes reviewed/edited medications and activates schedule + dose events in DB.
    """
    db_rx = db.query(Prescription).filter(Prescription.id == prescription_id).first()
    if not db_rx:
        raise HTTPException(status_code=404, detail="Prescription not found.")

    start_date = None
    if confirm_in.start_date:
        try:
            start_date = datetime.datetime.strptime(confirm_in.start_date, "%Y-%m-%d").date()
        except Exception:
            start_date = datetime.date.today()

    meds_cnt, events_cnt, appts_cnt = activate_prescription_schedule(
        db=db,
        patient_id=db_rx.patient_id,
        prescription_id=prescription_id,
        medications=confirm_in.medications,
        start_date=start_date,
    )

    return PrescriptionConfirmResponse(
        prescription_id=prescription_id,
        status="confirmed",
        message="Prescription confirmed! Medication schedule and dose alarms activated successfully.",
        active_medications_count=meds_cnt,
        dose_events_generated=events_cnt,
        appointments_generated=appts_cnt,
    )
