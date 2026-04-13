"""
verification_service.py — Professor activity verification.
Checks arXiv recency (primary) and NSF active grants (secondary).
Both checks run concurrently via asyncio.gather() in the search pipeline.
"""

import httpx
import arxiv
from datetime import datetime, timedelta


async def check_arxiv_activity(professor_name: str, months: int = 18) -> dict:
    """
    Query arXiv for papers authored by professor_name within the last `months` months.
    Returns activity verdict and paper metadata.
    """
    try:
        client = arxiv.Client()
        search = arxiv.Search(
            query=f"au:{professor_name}",
            max_results=10,
            sort_by=arxiv.SortCriterion.SubmittedDate,
            sort_order=arxiv.SortOrder.Descending,
        )
        results = list(client.results(search))

        if not results:
            return {
                "active": False,
                "reason": "no_arxiv_papers",
                "papers_in_window": [],
                "total_found": 0,
                "signal_strength": "neutral",
            }

        cutoff = datetime.now() - timedelta(days=months * 30)
        papers_in_window = [
            {
                "title": r.title,
                "submitted": r.published.isoformat() if r.published else "",
                "abstract": r.summary[:500] if r.summary else "",
                "url": r.entry_id,
            }
            for r in results
            if r.published and r.published.replace(tzinfo=None) > cutoff
        ]

        return {
            "active": len(papers_in_window) > 0,
            "papers_in_window": papers_in_window,
            "most_recent_date": results[0].published.isoformat() if results[0].published else "",
            "total_found": len(results),
            "signal_strength": "strong",
        }
    except Exception as e:
        return {
            "active": False,
            "reason": f"arxiv_error: {str(e)}",
            "papers_in_window": [],
            "total_found": 0,
            "signal_strength": "error",
        }


async def check_nsf_active_grants(professor_name: str) -> dict:
    """
    Query the public NSF Awards API for active grants held by professor_name.
    No API key required.
    """
    try:
        url = "https://api.nsf.gov/services/v1/awards.json"
        params = {
            "pdPIName": professor_name,
            "dateStart": "01/01/2023",
            "printFields": "id,title,abstractText,startDate,expDate,awardeeName,piFirstName,piLastName,fundsObligatedAmt",
        }
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(url, params=params)
            data = response.json()

        awards = data.get("response", {}).get("award", [])
        today = datetime.now()
        active_awards = []
        for award in awards:
            exp_date_str = award.get("expDate", "")
            if not exp_date_str:
                continue
            try:
                exp_date = datetime.strptime(exp_date_str, "%m/%d/%Y")
                if exp_date > today:
                    active_awards.append({
                        "title": award.get("title", ""),
                        "abstract": (award.get("abstractText", "") or "")[:400],
                        "amount": award.get("fundsObligatedAmt", ""),
                        "expires": exp_date_str,
                        "id": award.get("id", ""),
                    })
            except ValueError:
                continue

        return {
            "has_active_grants": len(active_awards) > 0,
            "active_grants": active_awards,
            "signal_strength": "strong" if active_awards else "neutral",
            "hiring_signal": len(active_awards) > 0,
        }
    except Exception as e:
        return {
            "has_active_grants": False,
            "active_grants": [],
            "signal_strength": "error",
            "error": str(e),
        }


def compute_activity_verdict(signals: dict) -> dict:
    """
    Combine arXiv and NSF signals into an ACTIVE / UNCERTAIN verdict.
    arXiv recency is the primary signal; NSF grant is the secondary fallback.
    """
    arxiv_data = signals.get("arxiv", {})
    nsf = signals.get("nsf_grants", {})

    if arxiv_data.get("active"):
        paper_count = len(arxiv_data.get("papers_in_window", []))
        return {
            "verdict": "ACTIVE",
            "verdict_color": "teal",
            "reason": f"Published {paper_count} paper(s) on arXiv in the last 18 months",
            "show_to_student": True,
            "confidence": "high",
        }

    if nsf.get("has_active_grants"):
        return {
            "verdict": "ACTIVE",
            "verdict_color": "amber",
            "reason": "Has active NSF funding",
            "show_to_student": True,
            "confidence": "medium",
        }

    if arxiv_data.get("total_found", 0) > 0:
        return {
            "verdict": "UNCERTAIN",
            "verdict_color": "amber",
            "reason": "Found in academic databases but no recent publications in window",
            "show_to_student": True,
            "badge": "Limited recent data",
            "confidence": "low",
        }

    return {
        "verdict": "UNCERTAIN",
        "verdict_color": "amber",
        "reason": "Limited verification data — may publish in non-arXiv venues",
        "show_to_student": True,
        "badge": "Limited data",
        "confidence": "low",
    }
