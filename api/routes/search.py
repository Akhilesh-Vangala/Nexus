"""
search.py — Main search endpoint.
Full pipeline: intake → verify → match → approach → impress.
OPTIMIZED: Maximum parallelization across all stages.
"""

import asyncio
import hashlib
import json
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

from services.claude_service import (
    extract_intent,
    extract_professors_from_search,
    generate_master_intelligence,
)
from services.linkup_service import search_professors
from services.embedding_service import embed_text, compute_alignment_score
from services.verification_service import (
    check_arxiv_activity,
    check_nsf_active_grants,
    compute_activity_verdict,
)
from services.private_matching_service import (
    get_private_signal,
    compute_three_tier_composite,
)

router = APIRouter()


class SearchRequest(BaseModel):
    student_interest: str
    university: str = "Columbia University"
    student_level: str = "masters"
    student_background: str = ""
    top_k: int = 5


async def _generate_intelligence_for_professor(
    prof: dict,
    university: str,
    student_interest: str,
    student_background: str,
    student_level: str,
) -> dict:
    """Generate all intelligence via ONE master Claude call (card + seeds + email + timing)."""
    prof_name = prof.get("name", "")
    papers = prof.get("recent_paper_abstracts", [])
    paper_titles = prof.get("recent_paper_titles", [])
    grants = prof.get("grants", [])

    try:
        intel = await generate_master_intelligence(
            professor_name=prof_name,
            university=university,
            department=prof.get("department", "Computer Science"),
            papers=paper_titles if paper_titles else papers[:3],
            grants=[g.get("title", "") for g in grants],
            student_interest=student_interest,
            student_background=student_background,
            student_level=student_level,
            alignment_score=prof.get("alignment_score", 0),
            research_statement=prof.get("research_statement", ""),
            arxiv_data=prof.get("arxiv_data", {}),
        )

        return {
            "id": prof.get("id", ""),
            "name": prof_name,
            "university": university,
            "department": prof.get("department", "Computer Science"),
            "lab_name": prof.get("lab_name", ""),
            "lab_url": prof.get("lab_url", ""),
            "current_focus": intel.get("current_focus", ""),
            "open_questions": intel.get("open_questions", []),
            "why_aligned": intel.get("why_aligned", ""),
            "best_paper_to_read": intel.get("best_paper_to_read"),
            "alignment_score": prof.get("alignment_score", 0),
            "alignment_detail": prof.get("alignment", {}),
            "confidence": prof.get("alignment", {}).get("confidence", "medium"),
            "verification": prof.get("verification", {}),
            "papers": prof.get("arxiv_data", {}).get("papers_in_window", []),
            "grants": grants,
            "seed_ideas": intel.get("seed_ideas", []),
            "email_draft": intel.get("email_draft"),
            "timing": intel.get("timing"),
            "has_private_signal": prof.get("has_private_signal", False),
            "three_tier_score": prof.get("three_tier_score"),
        }
    except Exception as e:
        return {
            "id": prof.get("id", ""),
            "name": prof_name,
            "university": university,
            "department": prof.get("department", "Computer Science"),
            "alignment_score": prof.get("alignment_score", 0),
            "alignment_detail": prof.get("alignment", {}),
            "verification": prof.get("verification", {}),
            "papers": prof.get("arxiv_data", {}).get("papers_in_window", []),
            "grants": grants,
            "current_focus": prof.get("research_statement", ""),
            "seed_ideas": [],
            "email_draft": None,
            "timing": None,
            "has_private_signal": False,
            "error": str(e),
        }


@router.post("/search")
async def search(request: SearchRequest):
    """
    Full pipeline: intent → Linkup search → verify → embed → rank → synthesize.
    OPTIMIZED: all independent steps run in parallel.
    """
    # STAGE 1: Extract intent
    intent = await extract_intent(
        student_input=request.student_interest,
        student_level=request.student_level,
        background=request.student_background,
    )

    if "error" in intent:
        return {"error": "Failed to extract intent", "details": intent}

    # STAGE 2: Find professors via Linkup
    domain = intent.get("primary_domain", "computer science")
    keywords = intent.get("search_keywords", [])

    search_content = await search_professors(
        university=request.university,
        domain=domain,
        keywords=keywords,
    )

    # Parse search content into structured professor data
    parsed = await extract_professors_from_search(
        search_content=search_content,
        university=request.university,
        domain=domain,
        student_interest=request.student_interest,
    )

    professors_raw = parsed.get("professors", [])

    if not professors_raw:
        return {
            "professors": [],
            "total_verified": 0,
            "pipeline_metadata": {
                "intent_extracted": True,
                "professors_found": 0,
                "professors_verified": 0,
                "embeddings_computed": 0,
            },
            "intent": intent,
            "message": "No professors found. Try broadening your search or checking another university.",
        }

    # STAGE 2b: Verification — ALL professors verified in parallel
    async def _verify_professor(prof: dict) -> dict:
        prof_name = prof.get("name", "")
        arxiv_result, nsf_result = await asyncio.gather(
            check_arxiv_activity(prof_name),
            check_nsf_active_grants(prof_name),
            return_exceptions=True,
        )
        if isinstance(arxiv_result, Exception):
            arxiv_result = {"active": False, "papers_in_window": [], "signal_strength": "error"}
        if isinstance(nsf_result, Exception):
            nsf_result = {"has_active_grants": False, "active_grants": [], "signal_strength": "error"}

        verdict = compute_activity_verdict({"arxiv": arxiv_result, "nsf_grants": nsf_result})

        if not verdict.get("show_to_student", True):
            return None

        arxiv_papers = arxiv_result.get("papers_in_window", [])
        existing_abstracts = prof.get("recent_paper_abstracts", [])
        for paper in arxiv_papers:
            if paper.get("abstract"):
                existing_abstracts.append(paper["abstract"])

        prof["recent_paper_abstracts"] = existing_abstracts
        prof["verification"] = verdict
        prof["arxiv_data"] = arxiv_result
        prof["nsf_data"] = nsf_result
        prof["grants"] = nsf_result.get("active_grants", [])
        prof["id"] = hashlib.md5(prof_name.encode()).hexdigest()[:12]
        return prof

    verified_results = await asyncio.gather(
        *[_verify_professor(p) for p in professors_raw],
        return_exceptions=True,
    )
    verified_professors = [p for p in verified_results if p is not None and not isinstance(p, Exception)]

    # STAGE 3: ML matching — embeddings + cosine similarity (ALL in parallel)
    embedding_text = intent.get("embedding_text", request.student_interest)

    async def _score_professor(prof: dict) -> dict:
        abstracts = prof.get("recent_paper_abstracts", [])
        research_statement = prof.get("research_statement", "")
        try:
            score_data = await compute_alignment_score(
                student_interest_text=embedding_text,
                professor_paper_abstracts=abstracts,
                professor_research_statement=research_statement,
            )
            prof["alignment"] = score_data
            prof["alignment_score"] = score_data["alignment_score"]
        except Exception as e:
            prof["alignment"] = {"alignment_score": 50, "confidence": "error", "error": str(e)}
            prof["alignment_score"] = 50

        private_signal = get_private_signal(prof.get("id", ""))
        if private_signal:
            try:
                student_vec = await embed_text(embedding_text)
                composite = compute_three_tier_composite(
                    student_embedding=student_vec,
                    tier1_score=prof["alignment_score"],
                    tier2_score=prof["alignment_score"] * 0.9,
                    private_embedding=private_signal["private_embedding"],
                )
                prof["alignment_score"] = composite["composite_score"]
                prof["has_private_signal"] = True
                prof["three_tier_score"] = composite
            except Exception:
                prof["has_private_signal"] = False
        else:
            prof["has_private_signal"] = False
        return prof

    scored_professors = await asyncio.gather(
        *[_score_professor(p) for p in verified_professors],
        return_exceptions=True,
    )
    scored_professors = [p for p in scored_professors if not isinstance(p, Exception)]

    # Sort by alignment score
    scored_professors.sort(key=lambda x: x.get("alignment_score", 0), reverse=True)
    top_k = scored_professors[: request.top_k]

    # STAGE 4+5: Generate intelligence for ALL top professors in parallel
    results = await asyncio.gather(
        *[
            _generate_intelligence_for_professor(
                prof=prof,
                university=request.university,
                student_interest=request.student_interest,
                student_background=request.student_background,
                student_level=request.student_level,
            )
            for prof in top_k
        ],
        return_exceptions=True,
    )
    results = [r for r in results if not isinstance(r, Exception)]

    return {
        "professors": results,
        "total_verified": len(verified_professors),
        "pipeline_metadata": {
            "intent_extracted": True,
            "professors_found": len(professors_raw),
            "professors_verified": len(verified_professors),
            "embeddings_computed": len(scored_professors),
        },
        "intent": intent,
    }
