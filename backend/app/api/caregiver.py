from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.services.notification_service import simulate_caregiver_escalation, check_and_escalate_overdue_events

router = APIRouter()


@router.post("/escalate/demo/{event_id}")
def demo_trigger_escalation(event_id: int, db: Session = Depends(get_db)):
    """
    Demo Mode: Manually trigger caregiver escalation for an event.
    Used during hackathon pitch to demonstrate §8 no-response escalation
    without waiting for real-time threshold to expire.
    """
    result = simulate_caregiver_escalation(db, event_id)
    if not result["success"]:
        raise HTTPException(status_code=404, detail=result["message"])
    return result


@router.post("/escalate/check")
def run_escalation_check(db: Session = Depends(get_db)):
    """Manually trigger escalation check (for demo / testing)."""
    escalated = check_and_escalate_overdue_events(db)
    return {
        "escalated_count": len(escalated),
        "escalated_event_ids": escalated,
        "message": f"Checked and escalated {len(escalated)} overdue dose events."
    }
