"""
embedding_service.py — THE ML CORE
Local sentence-transformers model (all-MiniLM-L6-v2) + cosine similarity.
100% free, no API key needed. Runs locally on CPU.
This is the real ML computation, not a Claude opinion.
"""

import numpy as np
from sentence_transformers import SentenceTransformer

# Load model once at startup — ~80MB, very fast on CPU
# all-MiniLM-L6-v2: 384 dimensions, optimized for semantic similarity
print("Loading embedding model (all-MiniLM-L6-v2)...")
model = SentenceTransformer("all-MiniLM-L6-v2")
print("Embedding model loaded.")


async def embed_text(text: str) -> np.ndarray:
    """Generate embedding using local sentence-transformers model (384 dimensions)."""
    # sentence-transformers is synchronous but very fast for single texts
    embedding = model.encode(text[:2000], normalize_embeddings=True)
    return np.array(embedding)


def cosine_similarity(vec_a: np.ndarray, vec_b: np.ndarray) -> float:
    """
    Compute cosine similarity between two embedding vectors.
    Since embeddings are L2-normalized, this is just the dot product.
    Returns float between -1 and 1 (higher = more similar).
    """
    dot_product = np.dot(vec_a, vec_b)
    magnitude_a = np.linalg.norm(vec_a)
    magnitude_b = np.linalg.norm(vec_b)
    
    if magnitude_a == 0 or magnitude_b == 0:
        return 0.0
    
    return float(dot_product / (magnitude_a * magnitude_b))


async def compute_alignment_score(
    student_interest_text: str,
    professor_paper_abstracts: list[str],
    professor_research_statement: str = ""
) -> dict:
    """
    CORE ML FUNCTION: Compute semantic alignment between student interest
    and professor's actual research using dense vector retrieval.
    
    Uses local sentence-transformers model — no API key required.
    This is NOT a Claude opinion — this is a real ML similarity score
    computed over research embeddings.
    """
    # Embed student interest
    student_embedding = await embed_text(student_interest_text)
    
    # Embed each paper abstract
    paper_embeddings = []
    valid_abstracts = [a for a in professor_paper_abstracts[:5] if a and len(a) > 50]
    
    if valid_abstracts:
        # Batch encode for efficiency
        batch_embeddings = model.encode(
            [a[:2000] for a in valid_abstracts],
            normalize_embeddings=True
        )
        paper_embeddings = [np.array(e) for e in batch_embeddings]
    
    # Compute paper similarities
    paper_similarities = [
        cosine_similarity(student_embedding, paper_emb)
        for paper_emb in paper_embeddings
    ]
    
    # Embed and score research statement if available
    statement_similarity = 0.0
    if professor_research_statement and len(professor_research_statement) > 50:
        research_statement_embedding = await embed_text(professor_research_statement)
        statement_similarity = cosine_similarity(student_embedding, research_statement_embedding)
    
    # Weighted score: recent papers weighted 70%, research statement 30%
    if paper_similarities:
        max_paper_sim = max(paper_similarities)
        avg_paper_sim = sum(paper_similarities) / len(paper_similarities)
        paper_score = 0.7 * max_paper_sim + 0.3 * avg_paper_sim
    else:
        paper_score = statement_similarity  # fallback
    
    if statement_similarity > 0:
        final_score = 0.7 * paper_score + 0.3 * statement_similarity
    else:
        final_score = paper_score
    
    # Normalize to 0-100 range
    # sentence-transformers cosine similarity typically ranges -0.1 to 0.8
    normalized_score = min(100, max(0, (final_score + 0.1) / 0.9 * 100))
    
    # Find best matching paper
    best_paper_idx = paper_similarities.index(max(paper_similarities)) if paper_similarities else 0
    
    return {
        "alignment_score": round(normalized_score, 1),
        "raw_cosine": round(final_score, 4),
        "paper_scores": [round(s * 100, 1) for s in paper_similarities],
        "best_matching_paper_idx": best_paper_idx,
        "statement_score": round(statement_similarity * 100, 1),
        "confidence": "high" if len(paper_embeddings) >= 3 else "medium" if len(paper_embeddings) >= 1 else "low",
        "embedding_dimensions": 384,
        "model": "all-MiniLM-L6-v2 (local, free)"
    }


async def rank_professors_by_alignment(
    student_interest: str,
    professors: list[dict]
) -> list[dict]:
    """
    Rank all candidate professors by alignment score.
    Returns sorted list with scores attached.
    """
    scored_professors = []
    
    for prof in professors:
        abstracts = prof.get("recent_paper_abstracts", [])
        research_statement = prof.get("research_statement", "")
        
        try:
            score_data = await compute_alignment_score(
                student_interest,
                abstracts,
                research_statement
            )
            
            scored_professors.append({
                **prof,
                "alignment": score_data
            })
        except Exception as e:
            scored_professors.append({
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
    
    return sorted(
        scored_professors,
        key=lambda x: x["alignment"]["alignment_score"],
        reverse=True
    )
