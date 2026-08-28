import datetime
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Tuple
from app.models.models import (
    Patient,
    Prescription,
    Medication,
    DoseEvent,
    Inventory,
    TreatmentAppointment,
    AdherenceEvent,
)
from app.schemas.prescription_schemas import MedicationExtractedItem

def activate_prescription_schedule(
    db: Session,
    patient_id: int,
    prescription_id: int,
    medications: List[MedicationExtractedItem],
    start_date: datetime.date = None,
) -> Tuple[int, int, int]:
    """
    Activate confirmed medications and generate dose events for the oncology cycle.
    Returns: (medications_count, dose_events_count, appointments_count)
    """
    if start_date is None:
        start_date = datetime.date.today()

    # Mark prescription confirmed
    rx = db.query(Prescription).filter(Prescription.id == prescription_id).first()
    if rx:
        rx.is_confirmed = True

    # Deactivate existing active meds for this patient to maintain clean demo state
    existing_meds = db.query(Medication).filter(
        Medication.patient_id == patient_id,
        Medication.is_active == True
    ).all()
    for m in existing_meds:
        m.is_active = False

    medications_created = 0
    dose_events_created = 0
    appointments_created = 0

    # Base reference day for chemo (Day 1 is tomorrow or start_date + 1 day)
    chemo_day_1 = start_date + datetime.timedelta(days=1)

    for item in medications:
        db_med = Medication(
            patient_id=patient_id,
            prescription_id=prescription_id,
            name=item.name,
            strength=item.strength or "",
            dose=item.dose or "1 unit",
            route=item.route or "oral",
            frequency=item.frequency or "Once daily",
            scheduled_times=item.scheduled_times or ["08:00"],
            duration_days=item.duration_days or 30,
            instructions=item.instructions or "",
            confidence=item.confidence or 1.0,
            is_active=True,
        )
        db.add(db_med)
        db.flush()
        medications_created += 1

        route_lower = (item.route or "").lower()
        drug_type = (item.drug_type or "").lower()

        # If IV Chemotherapy -> Create In-Clinic Treatment Appointment
        if "iv" in route_lower or "intravenous" in route_lower or "chemotherapy" in drug_type:
            app_time = item.scheduled_times[0] if item.scheduled_times else "10:00"
            appointment = TreatmentAppointment(
                patient_id=patient_id,
                treatment_type=f"IV Chemotherapy Infusion: {item.name} ({item.strength})",
                scheduled_date=chemo_day_1.strftime("%Y-%m-%d"),
                scheduled_time=app_time,
                location="Apex Oncology Infusion Suite #4",
                notes=item.instructions or "Please report 30 minutes before infusion.",
            )
            db.add(appointment)
            appointments_created += 1

        # If Oral Medication -> Create Dose Events & Inventory Tracking
        else:
            # Determine initial inventory quantity based on duration
            times_per_day = len(item.scheduled_times) if item.scheduled_times else 1
            total_cycle_units = times_per_day * (item.duration_days or 3)
            
            db_inv = Inventory(
                patient_id=patient_id,
                medication_id=db_med.id,
                initial_quantity=total_cycle_units,
                current_quantity=total_cycle_units,
                units_per_dose=1,
                refill_threshold=max(1, total_cycle_units // 3),
                refill_alert_active=False,
            )
            db.add(db_inv)

            # Generate cycle dose events
            # For Dexamethasone: Day -1 (day before chemo), Day 1, Day 2
            # For Aprepitant: Day 2, Day 3 following chemo
            cycle_days = item.cycle_days if item.cycle_days else [1, 2, 3]

            for rel_day in cycle_days:
                # Calculate target date relative to chemo Day 1
                if rel_day == -1:
                    event_date = chemo_day_1 - datetime.timedelta(days=1)
                else:
                    event_date = chemo_day_1 + datetime.timedelta(days=(rel_day - 1))

                for time_str in item.scheduled_times:
                    try:
                        hour, minute = map(int, time_str.split(":"))
                    except Exception:
                        hour, minute = 8, 0

                    event_datetime = datetime.datetime(
                        event_date.year, event_date.month, event_date.day, hour, minute
                    )

                    dose_event = DoseEvent(
                        patient_id=patient_id,
                        medication_id=db_med.id,
                        scheduled_time=event_datetime,
                        status="scheduled",
                        caregiver_notified=False,
                    )
                    db.add(dose_event)
                    dose_events_created += 1

    db.commit()
    return medications_created, dose_events_created, appointments_created


def record_dose_action(
    db: Session,
    event_id: int,
    action: str,
    snooze_minutes: int = 15,
    missed_reason: str = None,
    notes: str = None,
) -> DoseEvent:
    """Record patient action on a dose reminder."""
    event = db.query(DoseEvent).filter(DoseEvent.id == event_id).first()
    if not event:
        raise ValueError(f"Dose event #{event_id} not found.")

    now = datetime.datetime.utcnow()

    if action == "taken":
        event.status = "taken"
        event.response_time = now
        event.support_notes = "Confirmed by patient."

        # Decrement inventory
        inv = db.query(Inventory).filter(
            Inventory.medication_id == event.medication_id
        ).first()
        if inv and inv.current_quantity > 0:
            inv.current_quantity = max(0, inv.current_quantity - inv.units_per_dose)
            if inv.current_quantity <= inv.refill_threshold:
                inv.refill_alert_active = True

    elif action == "snooze":
        event.status = "snoozed"
        event.scheduled_time = event.scheduled_time + datetime.timedelta(minutes=snooze_minutes)
        event.support_notes = f"Snoozed for {snooze_minutes} minutes."

    elif action == "busy":
        event.status = "busy"
        event.scheduled_time = event.scheduled_time + datetime.timedelta(minutes=snooze_minutes)
        event.support_notes = f"Patient busy; rescheduled by {snooze_minutes} minutes."

    elif action == "missed":
        event.status = "missed"
        event.response_time = now
        event.missed_reason = missed_reason or "Patient marked missed"
        
        # Supportive advice based on reason (§7)
        if missed_reason == "busy":
            event.support_notes = "Life gets busy. We can shift this reminder 15-30 minutes earlier next time to give you a head start."
        elif missed_reason == "forgot":
            event.support_notes = "Keeping your medicine near something you use every morning (like keys or water) can help establish a routine."
        elif missed_reason == "felt_unwell":
            event.support_notes = "We noted you felt unwell. Please check the Symptom Triage section to review side effect guidance."
        elif missed_reason == "out_of_medicine":
            event.support_notes = "Refill alert triggered. Contact your pharmacy to replenish your supply."
        else:
            event.support_notes = "Dose skipped. Please remember not to double up on your next dose."

    elif action == "help":
        event.status = "help"
        event.support_notes = "Patient requested support. Check symptoms or contact care team."

    db.commit()
    db.refresh(event)
    return event


def get_patient_adherence_summary(db: Session, patient_id: int) -> Dict[str, Any]:
    """Calculate deterministic adherence metrics for patient."""
    events = db.query(DoseEvent).filter(DoseEvent.patient_id == patient_id).all()
    
    total_scheduled = len(events)
    total_taken = sum(1 for e in events if e.status == "taken")
    total_missed = sum(1 for e in events if e.status == "missed")

    if total_scheduled == 0:
        rate = 100.0
    else:
        # Evaluated events (taken or missed)
        evaluated = total_taken + total_missed
        if evaluated == 0:
            rate = 100.0
        else:
            rate = round((total_taken / evaluated) * 100.0, 1)

    status_label = "Excellent" if rate >= 85 else ("Good" if rate >= 70 else "Needs Support")

    return {
        "patient_id": patient_id,
        "total_scheduled": total_scheduled,
        "total_taken": total_taken,
        "total_missed": total_missed,
        "adherence_percentage": rate,
        "current_streak_days": 3 if total_taken > 0 else 0,
        "status_label": status_label,
    }
