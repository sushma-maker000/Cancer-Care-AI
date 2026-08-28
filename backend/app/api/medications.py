from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.db.database import get_db
from app.models.models import Medication, DoseEvent, Inventory, TreatmentAppointment, Patient
from app.schemas.medication_schemas import (
    MedicationResponse,
    DoseEventResponse,
    DoseEventActionRequest,
    AdherenceSummaryResponse,
    InventoryItemResponse,
)
from app.services.medication_service import (
    record_dose_action,
    get_patient_adherence_summary,
)

router = APIRouter()

@router.get("/patients/{patient_id}/medications", response_model=List[MedicationResponse])
def get_patient_medications(patient_id: int, db: Session = Depends(get_db)):
    """Retrieve all active medications for patient."""
    meds = db.query(Medication).filter(
        Medication.patient_id == patient_id,
        Medication.is_active == True
    ).all()
    return meds


@router.get("/patients/{patient_id}/dose-events", response_model=List[DoseEventResponse])
def get_patient_dose_events(patient_id: int, db: Session = Depends(get_db)):
    """Retrieve all dose events for patient timeline."""
    events = db.query(DoseEvent).filter(
        DoseEvent.patient_id == patient_id
    ).order_by(DoseEvent.scheduled_time.asc()).all()

    result = []
    for e in events:
        med = db.query(Medication).filter(Medication.id == e.medication_id).first()
        result.append(
            DoseEventResponse(
                id=e.id,
                patient_id=e.patient_id,
                medication_id=e.medication_id,
                medication_name=med.name if med else "Medication",
                dose=med.dose if med else "",
                route=med.route if med else "oral",
                scheduled_time=e.scheduled_time,
                status=e.status,
                response_time=e.response_time,
                missed_reason=e.missed_reason,
                support_notes=e.support_notes,
                caregiver_notified=e.caregiver_notified,
                instructions=med.instructions if med else "",
            )
        )
    return result


@router.post("/dose-events/{event_id}/action", response_model=DoseEventResponse)
def handle_dose_event_action(
    event_id: int,
    action_in: DoseEventActionRequest,
    db: Session = Depends(get_db),
):
    """
    Handle action button clicks: taken, snooze, busy, missed, help (§6, §7).
    """
    try:
        updated_event = record_dose_action(
            db=db,
            event_id=event_id,
            action=action_in.action,
            snooze_minutes=action_in.snooze_minutes or 15,
            missed_reason=action_in.missed_reason,
            notes=action_in.notes,
        )
    except ValueError as err:
        raise HTTPException(status_code=404, detail=str(err))

    med = db.query(Medication).filter(Medication.id == updated_event.medication_id).first()
    return DoseEventResponse(
        id=updated_event.id,
        patient_id=updated_event.patient_id,
        medication_id=updated_event.medication_id,
        medication_name=med.name if med else "Medication",
        dose=med.dose if med else "",
        route=med.route if med else "oral",
        scheduled_time=updated_event.scheduled_time,
        status=updated_event.status,
        response_time=updated_event.response_time,
        missed_reason=updated_event.missed_reason,
        support_notes=updated_event.support_notes,
        caregiver_notified=updated_event.caregiver_notified,
        instructions=med.instructions if med else "",
    )


@router.get("/patients/{patient_id}/adherence", response_model=AdherenceSummaryResponse)
def get_adherence_metrics(patient_id: int, db: Session = Depends(get_db)):
    """Calculate and return deterministic adherence rate (§19)."""
    return get_patient_adherence_summary(db, patient_id)


@router.get("/patients/{patient_id}/inventory", response_model=List[InventoryItemResponse])
def get_patient_inventory(patient_id: int, db: Session = Depends(get_db)):
    """Retrieve inventory and stock levels for oral medications (§16)."""
    items = db.query(Inventory).filter(Inventory.patient_id == patient_id).all()
    result = []
    for inv in items:
        med = db.query(Medication).filter(Medication.id == inv.medication_id).first()
        times_per_day = len(med.scheduled_times) if med and med.scheduled_times else 1
        daily_usage = times_per_day * inv.units_per_dose
        days_rem = round(inv.current_quantity / daily_usage, 1) if daily_usage > 0 else 0

        result.append(
            InventoryItemResponse(
                id=inv.id,
                patient_id=inv.patient_id,
                medication_id=inv.medication_id,
                medication_name=med.name if med else "Medication",
                initial_quantity=inv.initial_quantity,
                current_quantity=inv.current_quantity,
                units_per_dose=inv.units_per_dose,
                refill_threshold=inv.refill_threshold,
                days_remaining=days_rem,
                refill_alert_active=inv.current_quantity <= inv.refill_threshold,
            )
        )
    return result


@router.get("/patients/{patient_id}/appointments")
def get_patient_appointments(patient_id: int, db: Session = Depends(get_db)):
    """Retrieve chemotherapy and oncology clinic appointments (§15)."""
    appts = db.query(TreatmentAppointment).filter(
        TreatmentAppointment.patient_id == patient_id
    ).order_by(TreatmentAppointment.scheduled_date.asc()).all()
    return appts
