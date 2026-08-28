from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class MedicationResponse(BaseModel):
    id: int
    patient_id: int
    prescription_id: Optional[int] = None
    name: str
    strength: Optional[str] = ""
    dose: Optional[str] = ""
    route: Optional[str] = "oral"
    frequency: Optional[str] = ""
    scheduled_times: List[str] = []
    duration_days: Optional[int] = 30
    instructions: Optional[str] = ""
    confidence: Optional[float] = 1.0
    is_active: bool = True
    created_at: datetime

    class Config:
        from_attributes = True


class DoseEventActionRequest(BaseModel):
    action: str  # "taken", "snooze", "missed", "busy", "help"
    snooze_minutes: Optional[int] = 15
    missed_reason: Optional[str] = None  # "busy", "forgot", "felt_unwell", "out_of_medicine", "other"
    notes: Optional[str] = None


class DoseEventResponse(BaseModel):
    id: int
    patient_id: int
    medication_id: int
    medication_name: str
    dose: str
    route: str
    scheduled_time: datetime
    status: str  # scheduled, taken, missed, snoozed, busy, help
    response_time: Optional[datetime] = None
    missed_reason: Optional[str] = None
    support_notes: Optional[str] = None
    caregiver_notified: bool = False
    instructions: Optional[str] = ""

    class Config:
        from_attributes = True


class AdherenceSummaryResponse(BaseModel):
    patient_id: int
    total_scheduled: int
    total_taken: int
    total_missed: int
    adherence_percentage: float
    current_streak_days: int
    status_label: str  # "Excellent", "Good", "Needs Support"


class InventoryItemResponse(BaseModel):
    id: int
    patient_id: int
    medication_id: int
    medication_name: str
    initial_quantity: int
    current_quantity: int
    units_per_dose: int
    refill_threshold: int
    days_remaining: float
    refill_alert_active: bool

    class Config:
        from_attributes = True
