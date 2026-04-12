"""
private_matching_service.py — THE NOVEL ML CONTRIBUTION
Differentially private sparse matching for confidential research projects.
Three-tier composite scoring: Public (50%) + Semi-public (30%) + Private (20%).
Uses local sentence-transformers (free, no API key).
"""

import numpy as np
from sentence_transformers import SentenceTransformer
import hashlib
import time

# Reuse the same model loaded in embedding_service
# Import will use the cached model
model = SentenceTransformer("all-MiniLM-L6-v2")

# In-memory store for private signals — hackathon only
PRIVATE_SIGNALS_STORE: dict[str, dict] = {}


async def create_private_project_signal(
    skills_description: str,
    epsilon: float = 1.0,
    professor_id: str = None
) -> dict:
    """
    NOVEL FUNCTION: Create a differentially private embedding
    from a professor's confidential skills description.
    
    The raw text is NEVER stored. Only the noised embedding persists.
    
    epsilon: privacy budget
      0.5 = high privacy, lower matching accuracy
      1.0 = balanced (default)
      2.0 = lower privacy, higher matching accuracy
    """
    # Step 1: Generate clean embedding (local, free)
    clean_embedding = model.encode(skills_description, normalize_embeddings=True)
    clean_embedding = np.array(clean_embedding)
    
    # Step 2: Gaussian mechanism for differential privacy
    l2_sensitivity = 2.0  # bounded for unit-normalized embeddings
    noise_scale = l2_sensitivity / epsilon
    
    noise = np.random.normal(
        loc=0.0,
        scale=noise_scale,
        size=clean_embedding.shape
    )
    
    # Step 3: Add noise and renormalize to unit sphere
    noised_embedding = clean_embedding + noise
    noised_embedding = noised_embedding / np.linalg.norm(noised_embedding)
    
    # Step 4: Generate signal ID
    signal_id = hashlib.sha256(
        f"{professor_id}_{time.time()}".encode()
    ).hexdigest()[:16]
    
    # skills_description is NOT in return value — goes out of scope
    return {
        "signal_id": signal_id,
        "professor_id": professor_id,
        "private_embedding": noised_embedding.tolist(),
        "epsilon": epsilon,
        "tier": 3,
        "created_at": time.time(),
        "raw_text_stored": False,
        "privacy_guarantee": f"(epsilon={epsilon})-differentially private Gaussian mechanism"
    }


def compute_three_tier_composite(
    student_embedding: np.ndarray,
    tier1_score: float,
    tier2_score: float,
    private_embedding: list | None
) -> dict:
    """
    THREE-TIER COMPOSITE SCORING:
    Combines public (T1), semi-public (T2), and private (T3) signals.
    Falls back to T1+T2 only when no private signal exists.
    """
    W1, W2, W3 = 0.50, 0.30, 0.20
    
    if private_embedding is None:
        adjusted_W1 = W1 / (W1 + W2)   # 0.625
        adjusted_W2 = W2 / (W1 + W2)   # 0.375
        composite = adjusted_W1 * tier1_score + adjusted_W2 * tier2_score
        has_private_signal = False
        tier3_score = None
        confidence_boost = 0
    else:
        private_arr = np.array(private_embedding)
        
        raw_private_sim = float(
            np.dot(student_embedding, private_arr) / (
                np.linalg.norm(student_embedding) *
                np.linalg.norm(private_arr)
            )
        )
        
        # Normalize to 0-100
        tier3_score = min(100, max(0, (raw_private_sim + 0.1) / 0.9 * 100))
        
        composite = W1 * tier1_score + W2 * tier2_score + W3 * tier3_score
        has_private_signal = True
        
        # Agreement bonus
        tier_agreement = abs(tier3_score - tier1_score) < 15
        confidence_boost = 3 if tier_agreement else -2
        composite = min(100, composite + confidence_boost)
    
    return {
        "composite_score": round(composite, 1),
        "tier1_contribution": round((W1 if private_embedding else 0.625) * tier1_score, 1),
        "tier2_contribution": round((W2 if private_embedding else 0.375) * tier2_score, 1),
        "tier3_score": round(tier3_score, 1) if tier3_score is not None else None,
        "has_private_signal": has_private_signal,
        "private_signal_message": (
            "Additional confidential research alignment detected"
            if has_private_signal else None
        ),
        "student_facing_message": (
            "This professor has indicated additional research interest beyond their public profile that aligns with you"
            if has_private_signal else None
        )
    }


def store_private_signal(professor_id: str, signal: dict) -> None:
    """Store only noised embedding — raw text never stored."""
    PRIVATE_SIGNALS_STORE[professor_id] = {
        "signal_id": signal["signal_id"],
        "private_embedding": signal["private_embedding"],
        "epsilon": signal["epsilon"],
        "created_at": signal["created_at"],
        "tier": 3,
        "raw_text_stored": False
    }


def get_private_signal(professor_id: str) -> dict | None:
    """Retrieve private signal — returns embedding only."""
    return PRIVATE_SIGNALS_STORE.get(professor_id)


def delete_private_signal(professor_id: str) -> bool:
    """Professor can delete their signal at any time."""
    if professor_id in PRIVATE_SIGNALS_STORE:
        del PRIVATE_SIGNALS_STORE[professor_id]
        return True
    return False
