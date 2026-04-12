"""
linkup_service.py — Linkup API integration for live professor search.
Uses Linkup's deep agentic search for faculty data, papers, alumni, grants.
"""

import httpx
import os
import re
import json
from dotenv import load_dotenv

load_dotenv(override=True)

LINKUP_API_KEY = os.getenv("LINKUP_API_KEY", "")
LINKUP_BASE = "https://api.linkup.so/v1"


async def linkup_search(query: str, depth: str = "standard", output_type: str = "sourcedAnswer") -> dict:
    """Execute a Linkup search query."""
    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            response = await client.post(
                f"{LINKUP_BASE}/search",
                headers={"Authorization": f"Bearer {LINKUP_API_KEY}"},
                json={
                    "q": query,
                    "depth": depth,
                    "outputType": output_type,
                }
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return {"error": str(e), "content": "", "results": []}


async def search_professors(university: str, domain: str, keywords: list[str]) -> list[dict]:
    """
    Multi-query search to find professors at a university in a specific research domain.
    Returns structured list of professor candidates.
    OPTIMIZED: both queries run in parallel.
    """
    import asyncio

    kw_str = " ".join(keywords[:4])
    queries = [
        f"{university} {domain} professor research lab 2024 2025",
        f"{university} computer science faculty {kw_str} recent papers publications",
    ]

    results = await asyncio.gather(
        *[linkup_search(q, depth="deep", output_type="sourcedAnswer") for q in queries],
        return_exceptions=True,
    )

    all_content = []
    for result in results:
        if isinstance(result, Exception):
            continue
        content = result.get("answer", result.get("content", ""))
        if content:
            all_content.append(content)

    return "\n\n".join(all_content)


async def get_professor_deep_profile(professor_name: str, university: str) -> str:
    """
    Deep search on a specific professor — papers, grants, lab info, alumni.
    Returns raw content for Claude to parse.
    """
    profile_query = f"""
    Find comprehensive information about professor {professor_name} at {university}:
    1. Their research lab name and website URL
    2. Their 5 most recent papers (2024-2025) with titles and brief descriptions
    3. Any active NSF or NIH grants
    4. Current PhD students and postdocs in their lab
    5. Recent PhD graduates and where they went (industry/academia)
    6. Any open positions, recruiting announcements, or RA opportunities
    7. Their Google Scholar profile and recent citation metrics
    """
    
    result = await linkup_search(profile_query, depth="deep", output_type="sourcedAnswer")
    return result.get("answer", result.get("content", ""))


async def get_lab_alumni(professor_name: str, university: str) -> str:
    """Search for lab alumni using Linkup's LinkedIn intelligence."""
    alumni_query = f'LinkedIn people "PhD" OR "postdoc" "{professor_name}" "{university}" current position career'
    
    result = await linkup_search(alumni_query, depth="standard", output_type="sourcedAnswer")
    return result.get("answer", result.get("content", ""))


async def check_scholar_profile(professor_name: str, university: str) -> str:
    """Check Google Scholar for .edu verification and recent activity."""
    UNIVERSITY_DOMAINS = {
        "Columbia University": "columbia.edu",
        "NYU": "nyu.edu",
        "MIT": "mit.edu",
        "Stanford University": "stanford.edu",
        "Carnegie Mellon University": "cs.cmu.edu",
        "UC Berkeley": "berkeley.edu",
        "Harvard University": "harvard.edu",
    }
    
    domain = UNIVERSITY_DOMAINS.get(university, "")
    query = f'Google Scholar "{professor_name}" "{domain}" verified email recent publications'
    
    result = await linkup_search(query, depth="standard", output_type="sourcedAnswer")
    return result.get("answer", result.get("content", ""))


async def check_lab_website(professor_name: str, university: str) -> str:
    """Check if professor has an active lab website with recent updates."""
    query = f'"{professor_name}" {university} research lab website 2024 2025 students'
    
    result = await linkup_search(query, depth="standard", output_type="sourcedAnswer")
    return result.get("answer", result.get("content", ""))
