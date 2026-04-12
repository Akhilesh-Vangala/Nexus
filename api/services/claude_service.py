"""
claude_service.py — All Claude AI prompts and synthesis functions.
Uses Anthropic Claude claude-sonnet-4-20250514 for reasoning, summarization, seed ideas, email drafting.
"""

import json
import os
from anthropic import AsyncAnthropic
from dotenv import load_dotenv

load_dotenv()

claude_client = AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
MODEL = "claude-sonnet-4-20250514"


async def claude_json(prompt: str, max_tokens: int = 4096) -> dict:
    """Call Claude and parse JSON response."""
    try:
        response = await claude_client.messages.create(
            model=MODEL,
            max_tokens=max_tokens,
            messages=[{"role": "user", "content": prompt}],
        )
        text = response.content[0].text
        # Try to extract JSON from the response
        # Handle cases where Claude wraps JSON in markdown code blocks
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0]
        elif "```" in text:
            text = text.split("```")[1].split("```")[0]
        return json.loads(text.strip())
    except json.JSONDecodeError:
        return {"raw_response": text, "parse_error": True}
    except Exception as e:
        return {"error": str(e)}


async def extract_intent(student_input: str, student_level: str, background: str = "") -> dict:
    """Extract structured research intent from student's natural language."""
    prompt = f"""You are extracting structured research intent from a student's natural language input.

Student input: {student_input}
Student level: {student_level}
Student background: {background or "Not provided"}

Return JSON exactly (no other text):
{{
  "primary_domain": "the single most specific domain name, e.g. 'causal representation learning'",
  "specific_topics": ["3-5 specific topics they mention or imply"],
  "methods_mentioned": ["any methods, frameworks, or tools they reference"],
  "career_direction": "academia | industry | open",
  "embedding_text": "A dense 2-3 sentence description optimized for semantic similarity search against professor paper abstracts. Use precise technical vocabulary. This is the text that will be embedded.",
  "search_keywords": ["6-8 keywords for web queries to find matching professors"],
  "student_level_context": "what this level means for approach strategy and email tone"
}}"""
    return await claude_json(prompt)


async def extract_professors_from_search(
    search_content: str,
    university: str,
    domain: str,
    student_interest: str
) -> list[dict]:
    """Use Claude to extract structured professor info from Linkup search results."""
    prompt = f"""You are extracting professor information from search results about {university} faculty in {domain}.

The student is interested in: {student_interest}

Search results content:
{search_content[:6000]}

Extract professors mentioned. For each professor found, return their info.
Return JSON exactly (no other text):
{{
  "professors": [
    {{
      "name": "Full name",
      "department": "Department name",
      "lab_name": "Lab name if found",
      "lab_url": "Lab URL if found",
      "research_statement": "2-3 sentence summary of their research focus based on the data",
      "recent_paper_abstracts": ["abstract or description of each recent paper found, as detailed as possible"],
      "recent_paper_titles": ["title of each recent paper"],
      "possible_grants": ["any grants or funding mentioned"]
    }}
  ]
}}

Rules:
- Only include professors who are actually at {university}
- Only include information explicitly found in the search results — never invent papers or data
- Include at most 8 professors
- If very little info is found for a professor, still include them with what's available"""
    return await claude_json(prompt)


async def generate_professor_card(
    professor_name: str,
    university: str,
    department: str,
    papers: list[str],
    grants: list[str],
    student_interest: str,
    alignment_score: float,
    deep_profile: str = ""
) -> dict:
    """Generate a plain-language intelligence card for a professor."""
    prompt = f"""You are creating a plain-language intelligence card for a research student.

Professor: {professor_name}, {university}, Department: {department}
Their recent papers/research (from live data): {json.dumps(papers[:5])}
Their active grants: {json.dumps(grants[:3])}
Additional profile info: {deep_profile[:2000]}
Student's interest: {student_interest}
Semantic alignment score: {alignment_score}/100

Generate JSON exactly (no other text):
{{
  "current_focus": "2-3 sentence plain English summary of what they're working on RIGHT NOW",
  "open_questions": ["3 specific open research questions this professor is actively investigating"],
  "why_aligned": "1 sentence explaining exactly why this student's interest aligns with this professor's current work",
  "best_paper_to_read": {{"title": "actual paper title from the data", "why": "read this first because..."}}
}}

Rules:
- Only reference papers in the provided data — never invent citations
- Write for a smart student, not an expert — explain jargon
- Be specific, not generic"""
    return await claude_json(prompt)


async def generate_seed_ideas(
    current_focus: str,
    open_questions: list[str],
    best_paper_abstract: str,
    student_background: str,
    student_interest: str,
    student_level: str,
    alignment_score: float
) -> dict:
    """Generate 3 specific research seed ideas at the intersection of student and professor."""
    prompt = f"""You are generating specific, original research seed ideas for a student to bring to a professor.

Professor's current work: {current_focus}
Professor's open questions: {json.dumps(open_questions)}
Professor's best recent paper abstract: {best_paper_abstract[:1000]}
Student's background: {student_background or "Not specified"}
Student's specific interest: {student_interest}
Alignment score: {alignment_score}/100

Generate exactly 3 research seed ideas. Each must:
1. Sit at the intersection of student interest AND professor's current open questions
2. Be specific enough to mention in an email
3. Be novel — something the professor hasn't already answered
4. Be feasible for a {student_level} student

Return JSON exactly (no other text):
{{
  "ideas": [
    {{
      "title": "Short catchy title",
      "question": "The specific research question as one sentence",
      "connection_to_professor": "Why this professor is the right person to explore this with",
      "connection_to_student": "Why this matches the student's stated interest",
      "difficulty": "undergrad_suitable | masters_suitable | phd_level"
    }}
  ]
}}"""
    return await claude_json(prompt)


async def generate_email_draft(
    professor_name: str,
    paper_title: str,
    paper_year: str,
    paper_key_finding: str,
    student_level: str,
    student_background: str,
    seed_idea: str,
    alignment_score: float
) -> dict:
    """Generate a personalized cold email draft."""
    prompt = f"""You are drafting a cold email from a student to a professor for research opportunities.

Professor: {professor_name}
Their best recent paper: "{paper_title}" ({paper_year})
Key finding from that paper: {paper_key_finding}
Student's level: {student_level}
Student's relevant background: {student_background or "Not specified"}
Best seed idea: {seed_idea}
Alignment score: {alignment_score}/100

Write a cold email that:
1. Subject line references their SPECIFIC paper title
2. Opening: 1 sentence showing you read the paper — reference a specific finding
3. Body: Your background + why relevant + the seed idea as intellectual hook
4. Ask: 15 min call OR email — give both options
5. Sign-off: Simple

Hard rules:
- Maximum 150 words total
- Never use "I am reaching out" or "Hope this email finds you well"
- Never start with "I" — start with something about their work
- Seed idea appears as YOUR curiosity, not a request for guidance
- Tone: peer-to-peer curiosity, not job application

Return JSON exactly (no other text):
{{"subject": "...", "body": "...", "word_count": N}}"""
    return await claude_json(prompt)


async def generate_lab_culture(
    professor_name: str,
    alumni_data: str,
    lab_size_data: str,
    deep_profile: str
) -> dict:
    """Generate lab culture assessment from public signals."""
    prompt = f"""Analyze publicly available signals about professor {professor_name}'s lab culture.

Data provided:
- Alumni and graduate information: {alumni_data[:1500]}
- Lab size and current members: {lab_size_data[:1000]}
- Additional profile data: {deep_profile[:1500]}

Generate an honest, neutral lab culture assessment. DO NOT make accusations.
Only report what the data shows. Use cautious language for anything uncertain.

Return JSON exactly (no other text):
{{
  "culture_score": 75,
  "strengths": ["evidence-based positive signals"],
  "watch_fors": ["things worth asking about — neutral language only"],
  "graduation_timeline": "typical years based on alumni data or estimate",
  "mentorship_style_signals": "what the data suggests about mentorship approach",
  "best_fit_for": "types of students who tend to thrive here",
  "questions_to_ask": ["3 good questions to ask in an interview"]
}}

IMPORTANT: Never state anything as fact that isn't in the provided data. If data is limited, say so."""
    return await claude_json(prompt)


async def generate_skills_gap(
    professor_papers: list[str],
    student_background: str,
    student_level: str,
    deep_profile: str
) -> dict:
    """Analyze skills gap between student and professor's lab requirements."""
    prompt = f"""Analyze the gap between a student's background and what a professor's lab likely requires.

Professor's research (from papers): {json.dumps(professor_papers[:3])}
Additional lab data: {deep_profile[:1000]}
Student's stated background: {student_background or "Not provided — assume basic CS background"}
Student's level: {student_level}

Return JSON exactly (no other text):
{{
  "required_skills": [{{"skill": "...", "importance": "required|helpful|bonus", "student_has": true}}],
  "critical_gaps": ["skills student must demonstrate"],
  "strengths": ["what the student likely has that's relevant"],
  "two_week_prep": [
    {{"week": 1, "tasks": ["specific learning tasks with free resources"]}},
    {{"week": 2, "tasks": ["tasks to prepare for outreach"]}}
  ],
  "email_positioning": "how to frame background in the email"
}}"""
    return await claude_json(prompt)


async def generate_timing_analysis(
    professor_name: str,
    arxiv_data: dict,
    grants_data: list[dict],
    today: str
) -> dict:
    """Determine optimal timing for student to contact professor."""
    # Determine semester info from date
    month = int(today.split("-")[1])
    is_summer = month in [6, 7, 8]
    semester = "Spring" if month <= 5 else ("Summer" if month <= 8 else "Fall")
    
    days_since_arxiv = "unknown"
    if arxiv_data.get("papers_in_window"):
        days_since_arxiv = f"Most recent paper: {arxiv_data['papers_in_window'][0].get('submitted', 'unknown')}"
    
    grant_info = "No active grants found"
    if grants_data:
        grant_info = f"Active grants: {json.dumps([g.get('title', '')[:100] for g in grants_data[:3]])}"
    
    prompt = f"""Determine optimal timing for a student to contact professor {professor_name}.

Today's date: {today}
Semester: {semester}
Is summer: {is_summer}
ArXiv activity: {days_since_arxiv}
Grant info: {grant_info}

Return JSON exactly (no other text):
{{
  "timing_score": 75,
  "verdict": "excellent|good|caution|wait",
  "verdict_color": "teal|amber|coral",
  "primary_reason": "one sentence",
  "details": "2-3 sentence explanation",
  "optimal_send_time": "e.g. Tuesday April 14 at 7:30 AM",
  "next_window": null,
  "red_flags": []
}}"""
    return await claude_json(prompt)


async def generate_approach_strategy(
    professor_name: str,
    lab_size: str,
    career_stage: str,
    hiring_signals: str,
    student_level: str,
    student_background: str,
    deep_profile: str
) -> dict:
    """Generate specific approach recommendation for contacting a professor."""
    prompt = f"""Advise a student on how to approach professor {professor_name} for research.

Professor data:
- Lab size: {lab_size}
- Career stage: {career_stage}
- Hiring signals: {hiring_signals}
- Profile: {deep_profile[:1000]}

Student: {student_level}, Background: {student_background or "Not specified"}

Select ONE entry point:
A: Email professor directly (small lab, junior prof, hiring signal)
B: Email PhD student first (large lab, senior/famous prof)
C: Attend their talk first (has upcoming events, courses)
D: Contribute to public work first (active GitHub, Twitter)

Return JSON exactly (no other text):
{{
  "recommended_entry": "A|B|C|D",
  "entry_rationale": "specific reason for THIS professor",
  "specific_action": "exact first step",
  "contact_target": "professor|phd_student|event|github"
}}"""
    return await claude_json(prompt)
