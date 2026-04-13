"""
tracker.py — Cold email follow-up tracker.
State machine: EMAIL_SENT → WAITING → FOLLOW_UP_READY → FOLLOWED_UP

Persistence: SQLite via Python stdlib (no external dependency).
Database file path is configurable via the TRACKER_DB environment variable
(default: tracker.db next to the process working directory).
"""

import os
import sqlite3
from contextlib import contextmanager
from datetime import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

DB_PATH = os.getenv("TRACKER_DB", "tracker.db")

VALID_STATES = {
    "EMAIL_SENT",
    "WAITING",
    "FOLLOW_UP_READY",
    "FOLLOWED_UP",
    "REPLIED_POSITIVE",
    "REPLIED_NEGATIVE",
    "MEETING_SCHEDULED",
    "NO_REPLY",
}


@contextmanager
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def _init_db() -> None:
    with get_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS tracker (
                professor_id   TEXT PRIMARY KEY,
                professor_name TEXT NOT NULL,
                email_subject  TEXT NOT NULL,
                sent_at        TEXT NOT NULL,
                state          TEXT NOT NULL DEFAULT 'EMAIL_SENT'
            )
        """)


_init_db()


class TrackerLogRequest(BaseModel):
    professor_id: str
    professor_name: str
    sent_at: str        # ISO 8601 timestamp
    email_subject: str


@router.post("/tracker/log")
async def log_email_sent(request: TrackerLogRequest):
    """Record that an initial email was sent to a professor."""
    with get_db() as conn:
        conn.execute(
            """
            INSERT INTO tracker (professor_id, professor_name, email_subject, sent_at, state)
            VALUES (?, ?, ?, ?, 'EMAIL_SENT')
            ON CONFLICT(professor_id) DO UPDATE SET
                sent_at       = excluded.sent_at,
                email_subject = excluded.email_subject,
                state         = 'EMAIL_SENT'
            """,
            (request.professor_id, request.professor_name, request.email_subject, request.sent_at),
        )
    return {"status": "logged", "state": "EMAIL_SENT"}


@router.get("/tracker/status/{professor_id}")
async def get_tracker_status(professor_id: str):
    """Return current follow-up state and next recommended action."""
    with get_db() as conn:
        row = conn.execute(
            "SELECT * FROM tracker WHERE professor_id = ?", (professor_id,)
        ).fetchone()

    if not row:
        return {"state": "NOT_CONTACTED", "professor_id": professor_id}

    try:
        sent_date = datetime.fromisoformat(row["sent_at"]).replace(tzinfo=None)
        days_waiting = (datetime.now() - sent_date).days
    except (ValueError, TypeError):
        days_waiting = 0

    state = row["state"]
    next_action = ""

    if state in ("EMAIL_SENT", "WAITING"):
        if days_waiting < 10:
            state = "WAITING"
            next_action = f"Follow-up window opens in {10 - days_waiting} day(s)"
        else:
            state = "FOLLOW_UP_READY"
            next_action = "Time to send a follow-up email"

    return {
        "professor_id": professor_id,
        "professor_name": row["professor_name"],
        "state": state,
        "sent_at": row["sent_at"],
        "days_waiting": days_waiting,
        "next_action": next_action,
        "email_subject": row["email_subject"],
    }


@router.post("/tracker/update/{professor_id}")
async def update_tracker(professor_id: str, new_state: str):
    """Manually advance tracker to a new state."""
    if new_state not in VALID_STATES:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid state. Must be one of: {', '.join(sorted(VALID_STATES))}",
        )
    with get_db() as conn:
        result = conn.execute(
            "UPDATE tracker SET state = ? WHERE professor_id = ?",
            (new_state, professor_id),
        )
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Professor not found in tracker")
    return {"status": "updated", "state": new_state}
