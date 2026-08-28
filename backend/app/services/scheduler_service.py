"""
APScheduler background jobs (§18 Scheduler)
Runs escalation checks every 5 minutes.
"""
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from app.db.database import SessionLocal
from app.services.notification_service import check_and_escalate_overdue_events

_scheduler: BackgroundScheduler = None


def start_scheduler():
    global _scheduler
    if _scheduler and _scheduler.running:
        return

    _scheduler = BackgroundScheduler()
    _scheduler.add_job(
        func=_run_escalation_check,
        trigger=IntervalTrigger(minutes=5),
        id="escalation_check",
        name="Caregiver Escalation Check",
        replace_existing=True,
    )
    _scheduler.start()
    print("[SCHEDULER] Background scheduler started — escalation checks every 5 minutes.")


def _run_escalation_check():
    db = SessionLocal()
    try:
        escalated = check_and_escalate_overdue_events(db)
        if escalated:
            print(f"[ESCALATION] Notified caregivers for {len(escalated)} overdue events.")
    except Exception as e:
        print(f"[SCHEDULER ERROR] {e}")
    finally:
        db.close()


def stop_scheduler():
    global _scheduler
    if _scheduler and _scheduler.running:
        _scheduler.shutdown(wait=False)
