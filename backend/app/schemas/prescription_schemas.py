from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


class MedicationExtractedItem(BaseModel):
    name: str
    drug_type: Optional[str] = "oral_supportive"  # oral_supportive, oral_chemo, iv_chemotherapy
    strength: Optional[str] = ""
    dose: Optional[str] = "1 tablet"
    route: Optional[str] = "oral"
    frequency: Optional[str] = "Once daily"
    scheduled_times: List[str] = Field(default_factory=lambda: ["08:00"])
    duration_days: Optional[int] = 30
    cycle_days: Optional[List[int]] = Field(default_factory=lambda: [1])
    instructions: Optional[str] = ""
    confidence: Optional[float] = 1.0


class PrescriptionUploadResponse(BaseModel):
    prescription_id: int
    patient_id: int
    file_name: str
    file_type: str
    ocr_raw_text: str
    extracted_json: Dict[str, Any]
    medications: List[MedicationExtractedItem]
    is_confirmed: bool
    created_at: datetime

    class Config:
        from_attributes = True


class PrescriptionConfirmRequest(BaseModel):
    medications: List[MedicationExtractedItem]
    start_date: Optional[str] = None  # YYYY-MM-DD (defaults to today)


class PrescriptionConfirmResponse(BaseModel):
    prescription_id: int
    status: str
    message: str
    active_medications_count: int
    dose_events_generated: int
    appointments_generated: int
