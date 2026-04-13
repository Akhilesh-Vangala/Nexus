"""
embedding_service.py — ML core.
Local sentence-transformers model (all-MiniLM-L6-v2) + cosine similarity.
No external API required. Runs entirely on CPU.
"""

import logging
import numpy as np
from sentence_transformers import SentenceTransformer

logger = logging.getLogger(__name__)

# Load model once at process startup — ~80 MB, CPU inference only.
# all-MiniLM-L6-v2: 384-dimensional embeddings, optimized for semantic similarity.
logger.info("Loading embedding model (all-MiniLM-L6-v2)...")
model = SentenceTransformer("all-MiniLM-L6-v2")
logger.info("Embedding model loaded.")


async def embed_text(text: str) -> np.ndarray:
    """Generate a 384-dim L2-normalized embedding for the given text (truncated to 2000 chars)."""
    embedding = model.encode(text[:2000], normalize_embeddings=True)
    return np.array(embedding)


def cosine_similarity(vec_a: np.ndarray, vec_b: np.ndarray) -> float:
    """
    Cosine similarity between two embedding vectors.
    Since embeddings are L2-normalized, this reduces to the dot product.
    Returns a float in [-1, 1].
    """
    mag_a = np.linalg.norm(vec_a)
    mag_b = np.linalg.norm(vec_b)
    if mag_a == 0 or mag_b == 0:
        return 0.0
    return float(np.dot(vec_a, vec_b) / (mag_a * mag_b))


async def compute_alignment_score(
    student_interest_text: str,
    professor_paper_abstracts: list[str],
    professor_research_statement: str = ""
) -> dict:
    """
    Compute semantic alignment between a student interest description and a
    professor's research using dense vector retrieval.

    Scoring formula:
      paper_score = 0.7 * max(sim_i) + 0.3 * mean(sim_i)  for i in papers[0..4]
      final_score = 0.7 * paper_score + 0.3 * sim(v_s, v_r)  (if research statement exists)
      normalized  = clamp((final_score + 0.1) / 0.9 * 100, 0, 100)
    """
    student_embedding = await embed_text(student_interest_text)

    valid_abstracts = [a for a in professor_paper_abstracts[:5] if a and len(a) > 50]
    paper_embeddings: list[np.ndarray] = []
    if valid_abstracts:
        batch = model.encode([a[:2000] for a in valid_abstracts], normalize_embeddings=True)
        paper_embeddings = [np.array(e) for e in batch]

    paper_similarities = [cosine_similarity(student_embedding, e) for e in paper_embeddings]

    statement_similarity = 0.0
    if professor_research_statement and len(professor_research_statement) > 50:
        stmt_embedding = await embed_text(professor_research_statement)
        statement_similarity = cosine_similarity(student_embedding, stmt_embedding)

    if paper_similarities:
        paper_score = 0.7 * max(paper_similarities) + 0.3 * (sum(paper_similarities) / len(paper_similarities))
    else:
        paper_score = statement_similarity

    final_score = (0.7 * paper_score + 0.3 * statement_similarity) if statement_similarity > 0 else paper_score
    normalized = min(100, max(0, (final_score + 0.1) / 0.9 * 100))

    best_paper_idx = paper_similarities.index(max(paper_similarities)) if paper_similarities else 0

    return {
        "alignment_score": round(normalized, 1),
        "raw_cosine": round(final_score, 4),
        "paper_scores": [round(s * 100, 1) for s in paper_similarities],
        "best_matching_paper_idx": best_paper_idx,
        "statement_score": round(statement_similarity * 100, 1),
        "confidence": "high" if len(paper_embeddings) >= 3 else "medium" if len(paper_embeddings) >= 1 else "low",
        "embedding_dimensions": 384,
        "model": "all-MiniLM-L6-v2 (local)"
    }


async def rank_professors_by_alignment(
    student_interest: str,
    professors: list[dict]
) -> list[dict]:
    """Rank candidate professors by semantic alignment score (descending)."""
    scored: list[dict] = []
    for prof in professors:
        try:
            score_data = await compute_alignment_score(
                student_interest,
                prof.get("recent_paper_abstracts", []),
                prof.get("research_statement", "")
            )
            scored.append({**prof, "alignment": score_data})
        except Exception as e:
            scored.append({
                **prof,
                "alignment": {
                    "alignment_score": 0,
                    "raw_cosine": 0,
                    "paper_scores": [],
                    "best_matching_paper_idx": 0,
                    "statement_score": 0,
                    "confidence": "error",
                    "error": str(e)
                }
            })
    return sorted(scored, key=lambda x: x["alignment"]["alignment_score"], reverse=True)
