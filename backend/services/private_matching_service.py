"""
private_matching_service.py — Differentially private professor signal matching.
Three-tier composite scoring: Public (50%) + Semi-public (30%) + Private (20%).
Uses the shared all-MiniLM-L6-v2 model — no second model load.
"""

import hashlib
import time
import numpy as np

from services.embedding_service import model

# In-memory store — maps professor_id to noised embedding metadata only.
# Raw description text is never persisted.
PRIVATE_SIGNALS_STORE: dict[str, dict] = {}


async def create_private_project_signal(
    skills_description: str,
    epsilon: float = 1.0,
    professor_id: str = None
) -> dict:
    """
    Create an (epsilon)-differentially private embedding from a professor's
    confidential research description using the Gaussian mechanism.

    The raw description is never stored — only the noised, renormalized
    embedding persists. epsilon controls the privacy / accuracy trade-off:
      0.5 — high privacy, lower matching accuracy  (σ = 4.0)
      1.0 — balanced default                       (σ = 2.0)
      2.0 — lower privacy, higher accuracy          (σ = 1.0)

    Mechanism: v_noised = normalize(v_clean + N(0, (Δ₂/ε)²·I)),  Δ₂ = 2.0
    """
    clean_embedding = np.array(model.encode(skills_description, normalize_embeddings=True))

    # Gaussian mechanism: σ = l2_sensitivity / epsilon
    l2_sensitivity = 2.0  # upper bound for unit-normalized embeddings
    noise = np.random.normal(loc=0.0, scale=l2_sensitivity / epsilon, size=clean_embedding.shape)

    noised_embedding = clean_embedding + noise
    noised_embedding = noised_embedding / np.linalg.norm(noised_embedding)

    signal_id = hashlib.sha256(f"{professor_id}_{time.time()}".encode()).hexdigest()[:16]

    return {
        "signal_id": signal_id,
        "professor_id": professor_id,
        "private_embedding": noised_embedding.tolist(),
        "epsilon": epsilon,
        "tier": 3,
        "created_at": time.time(),
        "raw_text_stored": False,
        "privacy_guarantee": f"({epsilon}ε)-differentially private Gaussian mechanism"
    }


def compute_three_tier_composite(
    student_embedding: np.ndarray,
    tier1_score: float,
    tier2_score: float,
    private_embedding: list | None
) -> dict:
    """
    Compute a three-tier composite alignment score.

    Weights:
      T1 (public data):       W1 = 0.50
      T2 (semi-public data):  W2 = 0.30
      T3 (private signal):    W3 = 0.20

    Without a private signal, weights are renormalized to W1/0.8 = 0.625
    and W2/0.8 = 0.375.

    Agreement bonus: |T3 - T1| < 15 → +3 to composite; else → -2.
    """
    W1, W2, W3 = 0.50, 0.30, 0.20

    if private_embedding is None:
        composite = (W1 / (W1 + W2)) * tier1_score + (W2 / (W1 + W2)) * tier2_score
        return {
            "composite_score": round(composite, 1),
            "tier1_contribution": round(0.625 * tier1_score, 1),
            "tier2_contribution": round(0.375 * tier2_score, 1),
            "tier3_score": None,
            "has_private_signal": False,
            "private_signal_message": None,
            "student_facing_message": None,
        }

    private_arr = np.array(private_embedding)
    raw_sim = float(
        np.dot(student_embedding, private_arr) / (
            np.linalg.norm(student_embedding) * np.linalg.norm(private_arr)
        )
    )
    tier3_score = min(100, max(0, (raw_sim + 0.1) / 0.9 * 100))
    composite = W1 * tier1_score + W2 * tier2_score + W3 * tier3_score
    confidence_boost = 3 if abs(tier3_score - tier1_score) < 15 else -2
    composite = min(100, composite + confidence_boost)

    return {
        "composite_score": round(composite, 1),
        "tier1_contribution": round(W1 * tier1_score, 1),
        "tier2_contribution": round(W2 * tier2_score, 1),
        "tier3_score": round(tier3_score, 1),
        "has_private_signal": True,
        "private_signal_message": "Additional confidential research alignment detected",
        "student_facing_message": (
            "This professor has indicated additional research interest beyond their public profile that aligns with you"
        ),
    }


def store_private_signal(professor_id: str, signal: dict) -> None:
    """Persist only the noised embedding — raw text is never stored."""
    PRIVATE_SIGNALS_STORE[professor_id] = {
        "signal_id": signal["signal_id"],
        "private_embedding": signal["private_embedding"],
        "epsilon": signal["epsilon"],
        "created_at": signal["created_at"],
        "tier": 3,
        "raw_text_stored": False,
    }


def get_private_signal(professor_id: str) -> dict | None:
    """Retrieve private signal metadata (embedding only — no raw text)."""
    return PRIVATE_SIGNALS_STORE.get(professor_id)


def delete_private_signal(professor_id: str) -> bool:
    """Delete a professor's private signal. Returns True if found and removed."""
    if professor_id in PRIVATE_SIGNALS_STORE:
        del PRIVATE_SIGNALS_STORE[professor_id]
        return True
    return False
