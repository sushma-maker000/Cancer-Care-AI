"""
Caregiver Escalation & Notification Service (§8)
==================================================
Deterministic no-response escalation pipeline:
  Reminder → wait 15 min → follow-up → wait threshold → caregiver notify

Caregiver notification channels (in priority order):
  1. In-app alert (always)
  2. Telegram Bot (if CAREGIVER_NOTIFICATION_ENABLED=true)

Escalation message: minimal patient information only (§8 spec).
"""
import os
import datetime
import requests
from sqlalchemy.orm import Session
from typing import Optional

from app.models.models import DoseEvent, Patient, Medication

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "")
CAREGIVER_ENABLED = os.getenv("CAREGIVER_NOTIFICATION_ENABLED", "false").lower() == "true"


def check_and_escalate_overdue_events(db: Session) -> list:
    """
    Check all scheduled/snoozed dose events and escalate if no response
    within the patient's configured escalation_after_minutes threshold.
    Returns list of escalated event IDs.
    """
    now = datetime.datetime.utcnow()
    escalated = []

    # Find all scheduled events that are overdue
    overdue_events = db.query(DoseEvent).filter(
        DoseEvent.status.in_(["scheduled", "snoozed", "busy"]),
        DoseEvent.caregiver_notified == False,
    ).all()

    for event in overdue_events:
        patient = db.query(Patient).filter(Patient.id == event.patient_id).first()
        if not patient:
            continue

        threshold_minutes = patient.escalation_after_minutes or 30
        deadline = event.scheduled_time + datetime.timedelta(minutes=threshold_minutes)

        if now >= deadline:
            med = db.query(Medication).filter(Medication.id == event.medication_id).first()
            med_name = med.name if med else "a scheduled medication"

            # Send caregiver notification
            _notify_caregiver(
                patient=patient,
                medication_name=med_name,
                scheduled_time=event.scheduled_time,
            )

            # Mark event as escalated
            event.caregiver_notified = True
            event.support_notes = (
                (event.support_notes or "") +
                f" | Caregiver notified at {now.strftime('%H:%M UTC')} (no response after {threshold_minutes} min)"
            )
            escalated.append(event.id)

    if escalated:
        db.commit()

    return escalated


def _notify_caregiver(patient: Patient, medication_name: str, scheduled_time: datetime.datetime):
    """
    Send caregiver notification with minimal information (§8 spec).
    Minimal info: no diagnosis, no clinical details — just that dose was not confirmed.
    """
    # Format the caregiver message (§8 specification)
    caregiver_msg = (
        f"Medication reminder:\n"
        f"A scheduled medication dose has not been confirmed by the patient.\n\n"
        f"Patient: {patient.name}\n"
        f"Scheduled time: {scheduled_time.strftime('%I:%M %p')}\n\n"
        f"Please check in with the patient or contact their care team if there is any concern.\n"
        f"— CancerCare AI Alert System"
    )

    # 1. Always log in-app (via DB flag already set above)
    print(f"[ESCALATION] In-app alert for patient {patient.name} — caregiver: {patient.caregiver_name}")

    # 2. Telegram Bot notification (if configured)
    if CAREGIVER_ENABLED and TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID:
        _send_telegram_message(caregiver_msg)
    else:
        # Log to console for demo purposes when Telegram not configured
        print(f"[CAREGIVER ALERT - IN APP]\n{caregiver_msg}")


def _send_telegram_message(text: str):
    """Send message via Telegram Bot API."""
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": text,
        "parse_mode": "Markdown",
    }
    try:
        res = requests.post(url, json=payload, timeout=10)
        if res.status_code == 200:
            print("[TELEGRAM] Caregiver notification sent successfully.")
        else:
            print(f"[TELEGRAM] Failed to send: {res.status_code} — {res.text[:200]}")
    except Exception as e:
        print(f"[TELEGRAM] Exception: {e}")


def simulate_caregiver_escalation(db: Session, event_id: int) -> dict:
    """
    Demo utility: Manually trigger caregiver escalation for a specific event.
    Used in the 'Demo Mode / Time-Travel' feature for hackathon pitches.
    """
    event = db.query(DoseEvent).filter(DoseEvent.id == event_id).first()
    if not event:
        return {"success": False, "message": f"Event #{event_id} not found"}

    patient = db.query(Patient).filter(Patient.id == event.patient_id).first()
    med = db.query(Medication).filter(Medication.id == event.medication_id).first()

    med_name = med.name if med else "Scheduled Medication"
    _notify_caregiver(patient=patient, medication_name=med_name, scheduled_time=event.scheduled_time)

    event.caregiver_notified = True
    event.status = "missed"
    event.missed_reason = "no_response"
    event.support_notes = "Caregiver notified via demo escalation trigger."
    db.commit()

    return {
        "success": True,
        "message": f"Caregiver escalation triggered for {patient.name} ({med_name})",
        "caregiver_name": patient.caregiver_name,
        "caregiver_email": patient.caregiver_email,
    }
