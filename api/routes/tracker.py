"""
tracker.py — Follow-up email tracker endpoints.
State machine: SENT → WAITING → FOLLOW_UP_READY → FOLLOWED_UP → REPLIED/ARCHIVED
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta

router = APIRouter()

# In-memory tracker store
TRACKER_STORE: dict[str, dict] = {}


class TrackerLogRequest(BaseModel):
    professor_id: str
    professor_name: str
    sent_at: str  # ISO timestamp
    email_subject: str


@router.post("/tracker/log")
async def log_email_sent(request: TrackerLogRequest):
    """Log that an email was sent to a professor."""
    TRACKER_STORE[request.professor_id] = {
        "professor_id": request.professor_id,
        "professor_name": request.professor_name,
        "email_subject": request.email_subject,
        "sent_at": request.sent_at,
        "state": "EMAIL_SENT",
        "follow_up_at": None,
        "replied_at": None,
    }
    return {"status": "logged", "state": "EMAIL_SENT"}


@router.get("/tracker/status/{professor_id}")
async def get_tracker_status(professor_id: str):
    """Get current follow-up state and next action."""
    entry = TRACKER_STORE.get(professor_id)
    if not entry:
        return {"state": "NOT_CONTACTED", "professor_id": professor_id}
    
    # Calculate days since sent
    try:
        sent_date = datetime.fromisoformat(entry["sent_at"])
        days_waiting = (datetime.now() - sent_date).days
    except:
        days_waiting = 0
    
    # Auto-transition states based on time
    state = entry["state"]
    next_action = ""
    
    if state == "EMAIL_SENT" and days_waiting < 10:
        state = "WAITING"
        next_action = f"Follow-up window opens in {10 - days_waiting} days"
    elif state in ("EMAIL_SENT", "WAITING") and days_waiting >= 10:
        state = "FOLLOW_UP_READY"
        next_action = "Time to send a follow-up email"
    
    return {
        "professor_id": professor_id,
        "professor_name": entry["professor_name"],
        "state": state,
        "sent_at": entry["sent_at"],
        "days_waiting": days_waiting,
        "next_action": next_action,
        "email_subject": entry["email_subject"],
    }


@router.post("/tracker/update/{professor_id}")
async def update_tracker(professor_id: str, new_state: str):
    """Manually update tracker state."""
    if professor_id in TRACKER_STORE:
        TRACKER_STORE[professor_id]["state"] = new_state
        return {"status": "updated", "state": new_state}
    return {"error": "Not found"}
