"""
professor.py — Professor deep dive + private signal endpoints.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

from services.linkup_service import get_professor_deep_profile, get_lab_alumni
from services.claude_service import (
    generate_professor_card,
    generate_seed_ideas,
    generate_email_draft,
    generate_lab_culture,
    generate_skills_gap,
    generate_timing_analysis,
    generate_approach_strategy,
)
from services.embedding_service import compute_alignment_score
from services.verification_service import check_arxiv_activity, check_nsf_active_grants
from services.private_matching_service import (
    create_private_project_signal,
    store_private_signal,
    get_private_signal,
    delete_private_signal,
)

router = APIRouter()


class ProfessorDeepRequest(BaseModel):
    professor_name: str
    university: str = "Columbia University"
    department: str = "Computer Science"
    student_interest: str
    student_background: str = ""
    student_level: str = "masters"


class PrivateSignalRequest(BaseModel):
    professor_id: str
    professor_name: str
    university: str
    skills_description: str
    epsilon: float = 1.0


@router.post("/professor/deep")
async def professor_deep_dive(request: ProfessorDeepRequest):
    """Full deep dive on one professor — all feature layers.
    OPTIMIZED: maximum parallelization across all independent calls.
    """
    import asyncio

    # WAVE 1: All data fetches in parallel (Linkup + arXiv + NSF)
    deep_profile_task = get_professor_deep_profile(
        professor_name=request.professor_name,
        university=request.university,
    )
    alumni_task = get_lab_alumni(
        professor_name=request.professor_name,
        university=request.university,
    )
    arxiv_task = check_arxiv_activity(request.professor_name)
    nsf_task = check_nsf_active_grants(request.professor_name)

    deep_profile, alumni_data, arxiv_data, nsf_data = await asyncio.gather(
        deep_profile_task, alumni_task, arxiv_task, nsf_task,
        return_exceptions=True,
    )
    # Handle exceptions gracefully
    if isinstance(deep_profile, Exception):
        deep_profile = ""
    if isinstance(alumni_data, Exception):
        alumni_data = ""
    if isinstance(arxiv_data, Exception):
        arxiv_data = {"active": False, "papers_in_window": [], "total_found": 0}
    if isinstance(nsf_data, Exception):
        nsf_data = {"has_active_grants": False, "active_grants": []}

    papers = arxiv_data.get("papers_in_window", [])
    paper_abstracts = [p.get("abstract", "") for p in papers]
    paper_titles = [p.get("title", "") for p in papers]
    grants = nsf_data.get("active_grants", [])

    # Alignment (fast, local ML — not a bottleneck)
    alignment = await compute_alignment_score(
        student_interest_text=request.student_interest,
        professor_paper_abstracts=paper_abstracts,
        professor_research_statement=deep_profile[:1000] if isinstance(deep_profile, str) else "",
    )
    score = alignment.get("alignment_score", 0)

    # WAVE 2: Card + culture + skills + timing + approach ALL in parallel
    card_task = generate_professor_card(
        professor_name=request.professor_name,
        university=request.university,
        department=request.department,
        papers=paper_titles,
        grants=[g.get("title", "") for g in grants],
        student_interest=request.student_interest,
        alignment_score=score,
        deep_profile=deep_profile,
    )
    culture_task = generate_lab_culture(
        professor_name=request.professor_name,
        alumni_data=alumni_data,
        lab_size_data=deep_profile,
        deep_profile=deep_profile,
    )
    skills_task = generate_skills_gap(
        professor_papers=paper_titles[:3],
        student_background=request.student_background,
        student_level=request.student_level,
        deep_profile=deep_profile,
    )
    timing_task = generate_timing_analysis(
        professor_name=request.professor_name,
        arxiv_data=arxiv_data,
        grants_data=grants,
        today="2026-04-12",
    )
    approach_task = generate_approach_strategy(
        professor_name=request.professor_name,
        lab_size="unknown",
        career_stage="established",
        hiring_signals=str(nsf_data.get("hiring_signal", False)),
        student_level=request.student_level,
        student_background=request.student_background,
        deep_profile=deep_profile,
    )

    card, culture, skills, timing, approach = await asyncio.gather(
        card_task, culture_task, skills_task, timing_task, approach_task,
        return_exceptions=True,
    )
    # Fallback for any failed Claude calls
    if isinstance(card, Exception):
        card = {}
    if isinstance(culture, Exception):
        culture = {}
    if isinstance(skills, Exception):
        skills = {}
    if isinstance(timing, Exception):
        timing = {}
    if isinstance(approach, Exception):
        approach = {}

    # WAVE 3: Seeds + Email in parallel (depend on card output)
    best_paper = card.get("best_paper_to_read", {})

    seeds_task = generate_seed_ideas(
        current_focus=card.get("current_focus", ""),
        open_questions=card.get("open_questions", []),
        best_paper_abstract=paper_abstracts[0] if paper_abstracts else "",
        student_background=request.student_background,
        student_interest=request.student_interest,
        student_level=request.student_level,
        alignment_score=score,
    )
    email_task = generate_email_draft(
        professor_name=request.professor_name,
        paper_title=best_paper.get("title", paper_titles[0] if paper_titles else ""),
        paper_year="2024-2025",
        paper_key_finding=best_paper.get("why", ""),
        student_level=request.student_level,
        student_background=request.student_background,
        seed_idea=card.get("open_questions", [""])[0] if card.get("open_questions") else "",
        alignment_score=score,
    )

    seeds, email = await asyncio.gather(seeds_task, email_task, return_exceptions=True)
    if isinstance(seeds, Exception):
        seeds = {"ideas": []}
    if isinstance(email, Exception):
        email = {}

    seed_ideas = seeds.get("ideas", [])

    return {
        "name": request.professor_name,
        "university": request.university,
        "department": request.department,
        "current_focus": card.get("current_focus", ""),
        "open_questions": card.get("open_questions", []),
        "why_aligned": card.get("why_aligned", ""),
        "best_paper_to_read": card.get("best_paper_to_read"),
        "alignment_score": score,
        "alignment_detail": alignment,
        "papers": papers,
        "grants": grants,
        "seed_ideas": seed_ideas,
        "email_draft": email,
        "lab_culture": culture,
        "skills_gap": skills,
        "timing": timing,
        "approach_strategy": approach,
        "alumni_data": alumni_data,
        "deep_profile_summary": deep_profile[:500] if isinstance(deep_profile, str) else "",
    }


@router.post("/professor/private-signal")
async def create_private_signal(request: PrivateSignalRequest):
    """Professor submits confidential skills description. Raw text NEVER stored."""
    signal = await create_private_project_signal(
        skills_description=request.skills_description,
        epsilon=request.epsilon,
        professor_id=request.professor_id
    )
    
    store_private_signal(request.professor_id, signal)
    
    return {
        "signal_id": signal["signal_id"],
        "created_at": signal["created_at"],
        "raw_text_stored": False,
        "privacy_guarantee": signal["privacy_guarantee"],
        "message": "Signal generated. Your description has been discarded."
    }


@router.delete("/professor/private-signal/{professor_id}")
async def remove_private_signal(professor_id: str):
    """Professor removes their signal."""
    deleted = delete_private_signal(professor_id)
    return {"deleted": deleted, "professor_id": professor_id}


@router.get("/professor/signal-status/{professor_id}")
async def signal_status(professor_id: str):
    """Check if a professor has an active private signal."""
    signal = get_private_signal(professor_id)
    if signal:
        return {
            "has_signal": True,
            "signal_id": signal["signal_id"],
            "created_at": signal["created_at"],
            "epsilon": signal["epsilon"]
        }
    return {"has_signal": False}
