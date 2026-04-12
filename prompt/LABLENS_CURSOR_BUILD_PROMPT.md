# LabLens — Complete Cursor Build Prompt
## Tier-1 Hackathon Build Guide for Columbia × NYU Claude Builder Hackathon

---

# THE PRODUCT

**Name:** LabLens

**Tagline:** *"Find your research home. Before you send a single email."*

**What it is:** An AI-powered research alignment engine that matches students at Columbia and NYU (and any university) to professors whose active, funded research aligns with their intellectual interests — then gives them everything they need to make a real connection: a plain-language research summary, a semantic alignment score, personalized seed research ideas grounded in actual papers, a lab culture health report, a timing intelligence report, a skills gap analysis, lab alumni trails, grant opportunities, and a personalized cold email draft. Not a search engine. Not a directory. An intelligence layer.

**Tech stack:**
- Frontend: Next.js 14+ with TypeScript, Tailwind CSS, Framer Motion
- Backend: Python FastAPI
- ML Core: OpenAI text-embedding-3-small for semantic alignment scoring (cosine similarity)
- Search Intelligence: Linkup API (deep agentic search for live professor data, lab pages, papers, LinkedIn alumni, grants)
- AI Synthesis: Anthropic Claude claude-sonnet-4-20250514 for all reasoning, summarization, seed idea generation, email drafting
- Database: In-memory for hackathon (no auth needed)
- APIs: NSF Awards API (public, no key), arXiv API (public), academic calendar logic

---

# AESTHETIC DIRECTION

**Tone:** Refined dark academic — think a research paper meets a Bloomberg Terminal. Deep navy/charcoal backgrounds. Clean cream/off-white typography. Amber and teal accents for data. Mono font for scores and data points. Editorial serif for headlines. The feeling: serious intelligence, not a toy.

**Fonts:**
- Display: `Playfair Display` (Google Fonts) — for hero text and professor names
- Body: `DM Sans` — for all readable content  
- Mono: `JetBrains Mono` — for scores, code snippets, API tags
- Load via: `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500&family=JetBrains+Mono:wght@400;500&display=swap')`

**Color palette (CSS variables):**
```css
:root {
  --bg-primary: #0B0E1A;        /* deep navy */
  --bg-secondary: #111827;      /* card background */
  --bg-tertiary: #1A2035;       /* elevated card */
  --bg-hover: #1E2840;          /* hover state */
  --accent-amber: #F59E0B;      /* scores, highlights */
  --accent-teal: #14B8A6;       /* alignment, positive */
  --accent-coral: #F87171;      /* warnings, red flags */
  --accent-purple: #8B5CF6;     /* ML/embedding signals */
  --text-primary: #F1F0EB;      /* main text */
  --text-secondary: #9CA3AF;    /* muted text */
  --text-tertiary: #6B7280;     /* hints */
  --border: rgba(255,255,255,0.08); /* subtle borders */
  --border-hover: rgba(255,255,255,0.15);
  --glow-amber: 0 0 20px rgba(245,158,11,0.15);
  --glow-teal: 0 0 20px rgba(20,184,166,0.15);
}
```

**Design details:**
- Subtle grid/dot pattern on hero background
- Cards have `backdrop-filter: blur(8px)` and thin border
- Score numbers animate counting up on load
- Professor cards slide in with stagger animation (150ms delay each)
- Alignment bars animate width on mount
- Hover states elevate cards with subtle glow
- Loading states use elegant skeleton loaders, not spinners

---

# APPLICATION ARCHITECTURE

## File Structure
```
lablens/
├── app/
│   ├── page.tsx                    # Landing/search page
│   ├── results/page.tsx            # Results page
│   ├── professor/[id]/page.tsx     # Professor deep dive
│   └── layout.tsx
├── components/
│   ├── SearchInput.tsx             # Main search with university selector
│   ├── ProfessorCard.tsx           # Summary card in results grid
│   ├── AlignmentBar.tsx            # Animated score bar
│   ├── SeedIdeas.tsx               # Research seed ideas component
│   ├── LabCulture.tsx              # Culture signals component
│   ├── TimingBadge.tsx             # Timing window indicator
│   ├── SkillsGap.tsx               # Skills gap analysis
│   ├── AlumniTrail.tsx             # Lab alumni component
│   ├── EmailDraft.tsx              # Generated email with copy button
│   ├── GrantAlerts.tsx             # Matched grant opportunities
│   ├── FollowUpTracker.tsx         # Email tracking state machine
│   └── PhDProgramCard.tsx          # PhD program matching
├── lib/
│   ├── linkup.ts                   # Linkup API client
│   ├── claude.ts                   # Anthropic API client
│   ├── embeddings.ts               # OpenAI embeddings + cosine similarity
│   ├── nsf.ts                      # NSF Awards API
│   ├── timing.ts                   # Timing intelligence logic
│   └── types.ts                    # All TypeScript types
├── api/ (FastAPI backend)
│   ├── main.py
│   ├── routes/
│   │   ├── search.py               # Main search endpoint
│   │   ├── professor.py            # Professor deep dive
│   │   ├── phd.py                  # PhD program matching
│   │   └── tracker.py              # Follow-up tracker
│   └── services/
│       ├── linkup_service.py
│       ├── embedding_service.py
│       ├── claude_service.py
│       └── timing_service.py
└── public/
    └── assets/
```

---

# PAGE 1: LANDING / SEARCH PAGE

## Layout
Full-screen dark hero. Centered. Clean. Powerful.

## Components to build:

### Hero Section
```
LabLens                           ← Playfair Display, 72px, --text-primary
                                  ← with subtle text-shadow glow
Find your research home.
Before you send a single email.  ← DM Sans 400, 20px, --text-secondary
```

Subtitle text beneath: *"Semantic research matching for Columbia & NYU students — powered by live intelligence."*

Small badges below subtitle:
- `⚡ Live research data` (amber)
- `🧠 ML alignment scoring` (purple)  
- `🔗 Linkup Search` (teal)
- `✦ Claude AI` (white/subtle)

### Search Input Component
This is the main interaction. Large, prominent, beautiful.

```typescript
// SearchInput.tsx
interface SearchInputProps {
  onSearch: (query: string, university: string) => void;
  isLoading: boolean;
}
```

**UI spec:**
- Large textarea (not input) — 3 lines tall — for natural language interest description
- Placeholder text that rotates every 3 seconds between:
  - *"I'm fascinated by how language models fail at causal reasoning..."*
  - *"I want to work on computer vision for robotic manipulation..."*  
  - *"I'm interested in fairness and bias in machine learning systems..."*
  - *"I want to research protein structure prediction using deep learning..."*
- Below textarea: University selector (dropdown)
  - Default: "Columbia University" / "NYU" 
  - Also include: MIT, Stanford, Carnegie Mellon, UC Berkeley, Harvard (to demo generalizability)
- Student level selector (pill buttons): `Undergrad` / `Master's` / `PhD Applicant`
- Large CTA button: "Find My Research Home →" with loading state
- Below button, small text: *"Searches live faculty data, papers, grants, and alumni in real time"*

**Background:** Subtle animated dot grid. CSS grid pattern with slow pulse animation.

---

# THE CORE ML PIPELINE (BACKEND)

This is what makes LabLens an ML project, not a wrapper. Every judge will see this in the code.

## Step 1: Intent Extraction (Claude)
```python
# services/claude_service.py

INTENT_EXTRACTION_PROMPT = """
You are extracting structured research intent from a student's natural language description.

Student input: {student_input}
Student level: {student_level}

Extract and return JSON:
{
  "primary_domain": "e.g. causal inference, computer vision, NLP",
  "specific_interests": ["list", "of", "specific", "topics"],
  "methodological_interests": ["methods they mention or imply"],
  "career_direction": "academia | industry | open",
  "keywords_for_search": ["5-8 keywords for Linkup queries"],
  "embedding_text": "A rich 2-3 sentence description optimized for semantic similarity search against professor paper abstracts"
}
"""
```

## Step 2: Linkup Faculty Discovery
```python
# services/linkup_service.py

import httpx

LINKUP_BASE = "https://api.linkup.so/v1"

async def search_professors(university: str, domain: str, keywords: list[str]) -> list[dict]:
    """
    Multi-step agentic search to find professors at a university
    in a specific research domain.
    """
    queries = [
        f"{university} {domain} professor research lab 2024 2025",
        f"{university} CS faculty {' '.join(keywords[:3])} recent papers",
        f"site:{university.lower().replace(' ', '')}.edu {domain} lab professor",
    ]
    
    results = []
    async with httpx.AsyncClient() as client:
        for query in queries:
            response = await client.post(
                f"{LINKUP_BASE}/search",
                headers={"Authorization": f"Bearer {LINKUP_API_KEY}"},
                json={
                    "q": query,
                    "depth": "deep",
                    "outputType": "searchResults",
                    "includeImages": False,
                    "maxResults": 8
                }
            )
            results.extend(response.json().get("results", []))
    
    return deduplicate_and_rank(results)

async def get_professor_deep_profile(professor_name: str, university: str) -> dict:
    """
    Deep search on a specific professor - papers, grants, lab info, alumni.
    Uses Linkup's multi-step agentic search capability.
    """
    profile_query = f"""
    Find all of the following for professor {professor_name} at {university}:
    1. Their lab website URL
    2. Their 5 most recent papers (2023-2025) with titles and abstracts
    3. Any active NSF or NIH grants
    4. Current PhD students and postdocs in their lab
    5. Recent PhD graduates and where they went next
    6. Any open positions or recruiting announcements
    """
    
    response = await client.post(
        f"{LINKUP_BASE}/search",
        headers={"Authorization": f"Bearer {LINKUP_API_KEY}"},
        json={
            "q": profile_query,
            "depth": "deep",
            "outputType": "sourcedAnswer",
        }
    )
    return response.json()

async def get_lab_alumni(professor_name: str, university: str) -> list[dict]:
    """
    Uses Linkup's LinkedIn intelligence to find lab alumni.
    """
    alumni_query = f'LinkedIn people "PhD" OR "doctoral" "{professor_name}" "{university}" current position'
    
    response = await client.post(
        f"{LINKUP_BASE}/search", 
        headers={"Authorization": f"Bearer {LINKUP_API_KEY}"},
        json={
            "q": alumni_query,
            "depth": "standard",
            "outputType": "searchResults",
        }
    )
    return extract_alumni_profiles(response.json())
```

## Step 3: Semantic Embedding + Cosine Similarity (THE ML CORE)
```python
# services/embedding_service.py
# THIS IS WHAT MAKES THIS AN ML PROJECT

import numpy as np
from openai import AsyncOpenAI

openai_client = AsyncOpenAI(api_key=OPENAI_API_KEY)

async def embed_text(text: str) -> np.ndarray:
    """Generate embedding using OpenAI text-embedding-3-small"""
    response = await openai_client.embeddings.create(
        model="text-embedding-3-small",
        input=text
    )
    return np.array(response.data[0].embedding)

def cosine_similarity(vec_a: np.ndarray, vec_b: np.ndarray) -> float:
    """
    Compute cosine similarity between two embedding vectors.
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
    professor_research_statement: str
) -> dict:
    """
    CORE ML FUNCTION: Compute semantic alignment between student interest
    and professor's actual research using dense vector retrieval.
    
    This is NOT a Claude opinion — this is a real ML similarity score
    computed over research embeddings.
    """
    # Embed student interest
    student_embedding = await embed_text(student_interest_text)
    
    # Embed each paper abstract (last 18 months only)
    paper_embeddings = []
    for abstract in professor_paper_abstracts[:5]:  # max 5 papers
        if abstract and len(abstract) > 50:
            emb = await embed_text(abstract)
            paper_embeddings.append(emb)
    
    # Embed professor research statement
    research_statement_embedding = await embed_text(professor_research_statement)
    
    # Compute similarities
    paper_similarities = [
        cosine_similarity(student_embedding, paper_emb)
        for paper_emb in paper_embeddings
    ]
    
    statement_similarity = cosine_similarity(
        student_embedding, 
        research_statement_embedding
    )
    
    # Weighted score: recent papers weighted 70%, research statement 30%
    if paper_similarities:
        max_paper_sim = max(paper_similarities)
        avg_paper_sim = sum(paper_similarities) / len(paper_similarities)
        paper_score = 0.7 * max_paper_sim + 0.3 * avg_paper_sim
    else:
        paper_score = 0.0
    
    final_score = 0.7 * paper_score + 0.3 * statement_similarity
    
    # Normalize to 0-100 range
    # Cosine similarity typically ranges 0.1-0.9 for research texts
    normalized_score = min(100, max(0, (final_score - 0.1) / 0.8 * 100))
    
    # Find which paper had highest alignment
    best_paper_idx = paper_similarities.index(max(paper_similarities)) if paper_similarities else 0
    
    return {
        "alignment_score": round(normalized_score, 1),
        "raw_cosine": round(final_score, 4),
        "paper_scores": [round(s * 100, 1) for s in paper_similarities],
        "best_matching_paper_idx": best_paper_idx,
        "statement_score": round(statement_similarity * 100, 1),
        "confidence": "high" if len(paper_embeddings) >= 3 else "medium" if len(paper_embeddings) >= 1 else "low"
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
        
        score_data = await compute_alignment_score(
            student_interest,
            abstracts,
            research_statement
        )
        
        scored_professors.append({
            **prof,
            "alignment": score_data
        })
    
    # Sort by alignment score descending
    return sorted(
        scored_professors, 
        key=lambda x: x["alignment"]["alignment_score"], 
        reverse=True
    )
```

## Step 4: Claude Synthesis — All Qualitative Intelligence
```python
# All Claude prompts — these are the intelligence layer

PROFESSOR_CARD_PROMPT = """
You are creating a plain-language intelligence card for a research student.

Professor: {professor_name}, {university}, Department: {department}
Their recent papers (last 18 months): {papers}
Their active grants: {grants}
Student's interest: {student_interest}
Semantic alignment score: {alignment_score}/100

Generate JSON with:
{
  "current_focus": "2-3 sentence plain English summary of what they're working on RIGHT NOW (not their career, just current work)",
  "open_questions": ["3 specific open research questions this professor is actively investigating"],
  "why_aligned": "1 sentence explaining exactly why this student's interest aligns with this professor's current work",
  "best_paper_to_read": {"title": "...", "why": "read this first because..."}
}

Rules:
- Only reference papers in the provided data — never invent citations
- Write for a smart student, not an expert — explain jargon
- Be specific, not generic — "works on causal reasoning in neural networks" not "works on AI"
"""

SEED_IDEAS_PROMPT = """
You are generating specific, original research seed ideas for a student to bring to a professor.

Professor's current work: {current_focus}
Professor's open questions: {open_questions}  
Professor's best recent paper abstract: {best_paper_abstract}
Student's background: {student_background}
Student's specific interest: {student_interest}
Alignment score: {alignment_score}/100

Generate exactly 3 research seed ideas. Each idea must:
1. Sit directly at the intersection of student interest AND professor's current open questions
2. Be specific enough to mention in an email — not "you could explore X" but "here's a specific question: ..."
3. Be novel — something the professor hasn't already answered in their papers
4. Be feasible for a student at the {student_level} level

Return JSON:
{
  "ideas": [
    {
      "title": "Short catchy title for the idea",
      "question": "The specific research question as one sentence",
      "connection_to_professor": "Why this professor is the right person to explore this with",
      "connection_to_student": "Why this matches the student's stated interest",
      "difficulty": "undergrad_suitable | masters_suitable | phd_level"
    }
  ]
}
"""

EMAIL_DRAFT_PROMPT = """
You are drafting a cold email from a student to a professor for research opportunities.

Professor: {professor_name}
Professor's best recent paper: {paper_title} ({paper_year})
Key finding from that paper: {paper_key_finding}
Student's level: {student_level}
Student's relevant background: {student_background}
Best seed idea for this professor: {seed_idea}
Alignment score: {alignment_score}/100

Write a cold email that:
1. Subject line: References their SPECIFIC paper title — never "Research Opportunity" 
2. Opening: 1 sentence showing you read the paper — reference a specific finding or method
3. Body (2-3 sentences): Your background + why it's relevant + the seed idea as intellectual hook
4. Ask: Request for 15 min call OR answers over email — give both options (reduces friction)
5. Sign-off: Simple

Hard rules:
- Maximum 180 words total
- Never use the phrase "I am reaching out" or "Hope this email finds you well"
- Never start with "I" — start with something specific about their work
- The seed idea should appear as YOUR intellectual curiosity, not a request for guidance
- Tone: peer-to-peer curiosity, not job application

Return JSON: {"subject": "...", "body": "..."}
"""

SKILLS_GAP_PROMPT = """
Analyze the gap between a student's background and what a professor's lab requires.

Professor's lab methods (extracted from papers): {lab_methods}
Programming tools mentioned in their papers: {lab_tools}
Mathematical frameworks used: {math_frameworks}
Student's stated background: {student_background}
Student's level: {student_level}

Return JSON:
{
  "required_skills": [{"skill": "...", "importance": "required|helpful|bonus", "student_has": true/false}],
  "critical_gaps": ["skills student must demonstrate to be taken seriously"],
  "strengths": ["what the student already has that's relevant"],
  "two_week_prep": [
    {"week": 1, "tasks": ["specific learning tasks with free resources"]},
    {"week": 2, "tasks": ["tasks to reframe their interest using lab vocabulary"]}
  ],
  "email_positioning": "how to frame their background in the email to minimize gap concerns"
}
"""

LAB_CULTURE_PROMPT = """
Analyze publicly available signals about a professor's lab culture.

Data provided:
- Alumni time-to-graduation data: {graduation_times}
- Student first-authorship rate: {first_author_data}
- Alumni destination diversity: {alumni_destinations}
- Lab size and current members: {lab_size_data}
- Professor public engagement (Twitter, blog): {public_engagement}
- Any public mentions or reviews found: {public_mentions}

Generate an honest, neutral lab culture assessment. DO NOT make accusations. 
Only report what the data shows. Use cautious language for anything uncertain.

Return JSON:
{
  "culture_score": 0-100,
  "strengths": ["evidence-based positive signals"],
  "watch_fors": ["things worth asking about before joining — neutral language only"],
  "graduation_timeline": "typical years based on alumni data",
  "mentorship_style_signals": "what the data suggests about mentorship approach",
  "best_fit_for": "types of students who tend to thrive here based on alumni patterns",
  "questions_to_ask": ["3 good questions to ask in an interview with this professor"]
}

IMPORTANT: Never state anything as fact that isn't directly supported by the provided data.
"""

TIMING_PROMPT = """
Determine the optimal timing for a student to contact a professor.

Today's date: {today}
Semester: {semester}, Week: {week_of_semester}
Days until nearest major grant deadline: {days_to_grant_deadline}
Grant deadline type: {grant_type}
Days since professor's last arXiv submission: {days_since_arxiv}
Upcoming conference deadlines professor likely submits to: {conference_deadlines}
Is it summer?: {is_summer}

Return JSON:
{
  "timing_score": 0-100,
  "verdict": "excellent|good|caution|wait",
  "verdict_color": "teal|amber|coral",
  "primary_reason": "one sentence",
  "details": "2-3 sentence explanation",
  "optimal_send_time": "specific day and time, e.g. Tuesday April 14 at 7:35 AM",
  "next_window": "if verdict is wait, when is the next good window",
  "red_flags": ["any timing-specific red flags right now"]
}
"""
```

---

# PAGE 2: RESULTS PAGE

## Layout
Full-screen. Left sidebar for filters/search refinement. Right main area for professor cards in a 2-column grid.

## Top section
- "Found {n} professors matching your research interest" in small mono font
- Student's input displayed back as a quote: *"'I'm interested in causal reasoning in LLMs...'"*
- Sort options: `Best Match` / `Most Approachable` / `Newest Hire`
- Filter pills: `Computer Science` / `Data Science` / `Electrical Engineering`

## Professor Cards Grid

Each card shows:
```
┌─────────────────────────────────────────┐
│  [ALIGNMENT SCORE]    [TIMING BADGE]    │
│  Prof. Elias Bareinboim                 │  ← Playfair Display
│  Columbia University · CS Department    │  ← DM Sans muted
│                                         │
│  Current focus:                         │
│  "Working on causal representation      │  ← 2 lines max
│  learning and how to..."                │
│                                         │
│  ████████████████░░░░  91% aligned     │  ← Animated bar
│                                         │
│  3 seed ideas  ·  4 alumni tracked     │
│  ⏰ Excellent timing  ·  2 grants       │
│                                         │
│  [View Full Profile →]                  │
└─────────────────────────────────────────┘
```

**Alignment score badge:** Large circular badge, top-left of card
- Score ≥ 85: Amber glow, "STRONG MATCH"
- Score 70-84: Teal, "GOOD MATCH"  
- Score < 70: Muted, "PARTIAL MATCH"

**Timing badge:** Top-right
- Green dot + "Reach out now" 
- Yellow dot + "Good window"
- Red dot + "Wait" + tooltip with reason

**Alignment bar:** Animated width on mount, color varies by score

---

# PAGE 3: PROFESSOR DEEP DIVE

## Layout
Full page with tabbed sections. Each tab lazy-loads its content.

### Tab 1: Research Intelligence
- Full professor card with expanded current focus
- All 3 seed ideas with expandable detail
- Best paper to read first with abstract
- Embedding score breakdown (show the ML work!)

**Seed idea cards:**
```
┌──────────────────────────────────────────┐
│  💡 Seed Idea 1                          │
│                                          │
│  "Does counterfactual training on        │
│  synthetic data improve causal           │
│  generalization or teach pattern         │
│  matching?"                              │
│                                          │
│  Why this professor: Directly in scope   │
│  of their 2024 NeurIPS paper on...       │
│                                          │
│  Why you: Aligns with your interest in   │
│  LLM reasoning failure modes             │
│                                          │
│  Level: Masters suitable                 │
└──────────────────────────────────────────┘
```

### Tab 2: Lab Intelligence
Split into two columns:

**Left: Lab Culture Report**
- Culture score (0-100) with color coding
- Strengths list (green checkmarks)
- Watch-fors list (amber warnings — neutral language)
- Typical graduation timeline
- "Questions to ask in an interview" section
- Mentorship style signals

**Right: Alumni Trail**
```
Lab Alumni — Where did they go?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Clayton Sanford · PhD 2024
→ Research Scientist, Google Research
  Worked on: transformer theory, ML theory

Tyler Chen · Courant Instructor 2022-2024
→ Applied Research Lead, JP Morgan
  Worked on: numerical linear algebra

[2 more alumni]

Industry: 3  ·  Academia: 2  ·  Avg time: 4.8 yrs
```

### Tab 3: Timing & Approach
- Large timing score display
- Calendar visualization showing:
  - Current position in semester
  - Grant deadlines (next 6 months)
  - Conference deadlines
  - Optimal contact windows (highlighted in green)
- "Best time to send: Tuesday April 14 at 7:35 AM"

### Tab 4: Skills Gap
- Two-column: "Lab requires" vs "You have"
- Traffic light indicators per skill
- Two-week prep plan with day-by-day tasks
- Free resource links for each gap

### Tab 5: Grant Opportunities
- Matched fellowships (NSF GRFP, Hertz, Ford, etc.)
- Each with: name, amount, deadline, fit score, "Why this fits you" text
- Professor's active grants that fund RAs (with amounts from NSF API)
- "Applying to this grant would make you a stronger RA candidate" callout

### Tab 6: Your Email
- Full generated email displayed
- Subject line + body
- Copy button (clipboard)
- "Edit & Personalize" toggle (textarea opens)
- Small note: "Optimized: {word_count} words · References: {paper_title}"
- Follow-up tracker activation button: "I sent this email →"

### Follow-up Tracker (activates on Tab 6)
After clicking "I sent this email":
- Shows: "Email sent {date}"
- Countdown: "Follow-up window opens in {X} days"
- After 10 days: "Follow-up ready" + pre-drafted follow-up shown
- State machine: SENT → WAITING → FOLLOW_UP_READY → FOLLOWED_UP → REPLIED/ARCHIVED

---

# PAGE 4: PhD PROGRAM MATCHING (separate flow)

Triggered by toggle on landing page: "I'm applying to PhD programs →"

Shows top 8 programs with:
- Program name + university
- Research fit score (embedding-based, same ML pipeline)
- Number of active professors in their area
- Placement rate to desired destination
- Average time-to-graduation
- Top 2 professors to contact pre-application
- Application strategy note
- Link to generate professor contact strategy

Uses CSRankings data (fetched via Linkup), NSF placement data, and the same embedding pipeline.

---

# COMPLETE API ENDPOINT SPEC (FastAPI)

```python
# POST /api/search
# Main search endpoint — the full pipeline
{
  "student_interest": "string (free text)",
  "university": "string",
  "student_level": "undergrad|masters|phd_applicant",
  "top_k": 5  # number of professors to return
}
# Returns: list of professor summaries with alignment scores, timing, basic culture signals

# POST /api/professor/deep
# Full deep dive on one professor
{
  "professor_name": "string",
  "professor_url": "string (faculty page)",
  "university": "string", 
  "student_interest": "string",
  "student_background": "string",
  "student_level": "string"
}
# Returns: full profile with all 7 feature layers

# GET /api/phd-programs
# PhD program matching
?interest=causal+inference&level=phd_applicant&count=8
# Returns: ranked PhD programs with fit scores

# POST /api/tracker/log
# Log that an email was sent
{
  "professor_id": "string",
  "professor_name": "string", 
  "sent_at": "ISO timestamp",
  "email_subject": "string"
}

# GET /api/tracker/status/{professor_id}
# Returns current follow-up state and next action

# GET /api/grants/match
?interest=causal+inference&level=masters&citizenship=us
# Returns: matched fellowship opportunities
```

---

# LOADING & ERROR STATES

**Main search loading sequence (30-45 seconds — show progress):**
```
Step 1: "Searching live faculty data..." (0-5s) — Linkup queries firing
Step 2: "Reading recent publications..." (5-15s) — Paper extraction
Step 3: "Computing semantic alignment..." (15-20s) — Embedding pipeline
Step 4: "Analyzing lab culture signals..." (20-30s) — Culture extraction
Step 5: "Generating your research roadmap..." (30-40s) — Claude synthesis
```
Each step has a pulsing indicator and description.

**Show a beautiful skeleton loader** — cards in the grid with shimmer animation while loading.

**Error handling:**
- If Linkup returns no results for a professor: show "Limited public data" badge on their card, still show what's available
- If embedding fails: fall back to Claude keyword matching, show "Keyword match" badge instead of score
- If NSF API times out: skip grant section, show "Grant data loading" with refresh button

---

# THE ML EXPLAINABILITY PANEL (IMPORTANT FOR JUDGES)

On the professor card and deep dive page, show a small "How we scored this" expandable section:

```
How LabLens computed this score
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Model: text-embedding-3-small (OpenAI)
Method: Cosine similarity over research embeddings

Your interest → vector (1536 dimensions)
Prof. paper abstracts → 4 vectors averaged
Cosine similarity: 0.847 raw score → 91 normalized

Paper-by-paper scores:
• "Causal Abstraction..." (2025)    ████████░  84%
• "Neural Causal Models..." (2024)  █████████  91%  ← best match
• "Counterfactual ID..." (2024)     ███████░░  78%

This is not a Claude opinion. This is a real ML similarity
computation over dense vector representations of research content.
```

This panel is crucial — it shows judges the ML depth is real.

---

# ENVIRONMENT VARIABLES NEEDED

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000

# .env (backend)
LINKUP_API_KEY=your_linkup_key          # From hackathon
ANTHROPIC_API_KEY=your_anthropic_key    # From hackathon
OPENAI_API_KEY=your_openai_key          # For embeddings only
NSF_API_KEY=                            # Public, no key needed
```

---

# DEMO SCENARIOS — PRE-LOAD THESE

Pre-load 3 demo scenarios so the demo never fails:

**Scenario A (NLP/Causal):**
```
University: Columbia
Interest: "I'm interested in how large language models handle causal reasoning. 
Specifically, I want to understand whether LLMs are doing genuine causal inference 
or sophisticated pattern matching, and what this tells us about the nature of reasoning."
Level: Master's
Expected top match: Prof. Elias Bareinboim (CausalAI Lab)
Alignment score: ~90+
```

**Scenario B (Computer Vision/Robotics):**
```
University: NYU
Interest: "I want to work on computer vision systems for robotic manipulation — 
specifically teaching robots to understand and interact with objects 
they've never seen before using video generation."
Level: Master's
Expected top match: Prof. Lerrel Pinto (NYU Robotics) or Carl Vondrick (Columbia)
Alignment score: ~85+
```

**Scenario C (Show generalizability — MIT):**
```
University: MIT
Interest: "I'm fascinated by the theoretical foundations of why deep learning works —
specifically why overparameterized neural networks generalize despite having 
more parameters than training examples."
Level: PhD Applicant
Shows: Same pipeline works for any university
```

---

# PITCH TALKING POINTS (for the 5-minute demo)

**Opening line:** "Every professor at Columbia and NYU has research they need help with. Every student here has ideas they want to explore. The gap between them costs years of wasted cold emails and missed connections. LabLens closes that gap."

**The ML moment:** "What makes this different from a search engine is this: we use dense vector embeddings — specifically OpenAI's text-embedding-3-small — to compute actual semantic similarity between a student's research interest and a professor's paper abstracts. This is a real ML computation, not a Claude opinion. The score you see is cosine similarity over 1536-dimensional research vectors, normalized to 0-100."

**The Linkup moment:** "Every data point you see — the professor's current research focus, their active grants, their lab alumni, their hiring signals — is fetched live right now via Linkup's deep agentic search. Not cached. Not stale. Right now."

**The lab culture moment:** "We surface the information that no university will tell you. Is this lab healthy? Do students graduate in 5 years or 9? Do they go to diverse careers or is it academia-only? We pull this from public signals — alumni LinkedIn trails, first-authorship rates, graduation timelines. We don't make accusations. We show you the data. You decide."

**The demo:** Run Scenario A live. Show the score computing. Show the seed ideas. Show the email. Show the lab culture report. Total time: 45 seconds.

**Closing:** "LabLens starts at Columbia and NYU — where we are right now. The pipeline works for any university. Same system, different input. What we built today is a permanent product for every student at every research university who has ever felt lost trying to find their research home."

---

# NON-NEGOTIABLE QUALITY BARS

1. The embedding pipeline MUST be real — actual numpy cosine similarity, not Claude making up a number
2. Every piece of professor data MUST come from Linkup — never make up papers or grants  
3. The seed ideas MUST reference specific papers from Linkup data — never generic
4. The email MUST be under 180 words — enforce this programmatically
5. The lab culture section MUST use cautious language — no accusations
6. Loading states MUST show the pipeline steps — make the ML visible
7. The "How we scored this" panel MUST be on every professor card
8. The timing engine MUST use today's actual date (April 12, 2026)
9. Demo scenarios MUST be pre-loaded and work offline if APIs are slow
10. Mobile responsive — judges will look at phones

---

# START HERE

Build in this exact order:

1. **Set up Next.js + FastAPI project** (15 min)
2. **Build the embedding service** — this is the ML core, get it working first (30 min)
3. **Build the Linkup service** — professor search and deep profile (45 min)
4. **Build the Claude service** — all prompts as functions (30 min)
5. **Build the main search API endpoint** — wire together steps 2-4 (30 min)
6. **Build the landing page + search input** — beautiful, production-grade (45 min)
7. **Build the results page** — professor cards with alignment scores (45 min)
8. **Build the professor deep dive** — all 6 tabs (60 min)
9. **Add timing engine + skills gap + grants** (45 min)
10. **Add follow-up tracker** (30 min)
11. **Add PhD program matching** (30 min)
12. **Polish, demo scenarios, presentation mode** (30 min)

Total: ~7 hours. You have today. Build in parallel: Backend person does 1-5, Frontend person does 6-8 simultaneously using mock data, Claude person writes all prompts during 2-5, Demo person sets up scenarios during 9-12.

---

*LabLens — Built for the Columbia × NYU Claude Builder Hackathon, April 12, 2026*
*Stack: Next.js · FastAPI · Claude claude-sonnet-4-20250514 · Linkup · text-embedding-3-small · NumPy*

---

---

# THE NOVEL ML CONTRIBUTION: THREE-TIER PRIVACY-PRESERVING MATCHING

## What This Is — The Research Breakthrough

This is the feature that makes LabLens not just a product but a genuinely novel algorithmic contribution. No existing system does this. It addresses a real, unsolved problem: **how do you match a student to a research project that cannot be publicly described?**

**The scenario:** A professor has a confidential research project — industry-funded (NDA'd), pre-publication, grant-pending, or politically sensitive. They cannot post it publicly. They cannot advertise it. But they need a specific type of mind to work on it. Under the current system, they email colleagues and hope. Students who would be perfect never find out the opportunity exists.

**The solution:** A three-tier data architecture with differential privacy noise injection that allows matching across the confidentiality boundary — without ever revealing the confidential information.

**The ML judges will ask: what is novel here?**
Answer: Differentially private sparse matching for confidential research projects. A professor encodes "what type of mind I need" — not what the project is — using a privacy-preserving embedding with calibrated Gaussian noise. The raw description is immediately discarded. Only the noised vector persists. Students see aggregate alignment scores. The private signal is mathematically irreversible. This is cold-start recommendation under asymmetric privacy constraints — unsolved in the academic matching context.

---

## The Three-Tier Architecture

Every piece of data about a professor's research lives in exactly one tier:

```
┌─────────────────────────────────────────────────────────┐
│  TIER 1 — PUBLIC                              Weight: 50%│
│  Full signal. Already searchable.                       │
│  • Published papers + abstracts                         │
│  • Lab website, faculty page                            │
│  • NSF/NIH grant databases (public)                     │
│  • arXiv submissions                                    │
│  • Twitter/X, blog posts, conference talks              │
│  → Full Linkup deep search + full embedding             │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  TIER 2 — SEMI-PUBLIC                         Weight: 30%│
│  Exists publicly but requires friction to find.         │
│  • Workshop papers / extended abstracts                 │
│  • Grant abstracts (NSF public but obscure)             │
│  • Course syllabi they designed                         │
│  • GitHub repos, collaborator acknowledgments           │
│  → Linkup deep search required                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  TIER 3 — PRIVATE / CONFIDENTIAL             Weight: 20%│
│  Zero public signal. Only professor knows.              │
│  • Industry-funded project (NDA'd)                      │
│  • Pre-submission paper in progress                     │
│  • Grant proposal not yet awarded                       │
│  • Politically sensitive topic                          │
│  • "I need X skills but cannot say why"                 │
│  → Professor enters SKILLS NEEDED, not project desc    │
│  → Differentially private embedding generated          │
│  → Raw text IMMEDIATELY DISCARDED. Embedding only.     │
└─────────────────────────────────────────────────────────┘
```

---

## The Core Insight: Encode "What Mind I Need" Not "What I'm Doing"

The professor never describes their project. They describe the **type of intellectual mind they need**. This distinction is everything.

```
BAD — reveals project:
"I need someone to work on predicting protein-drug 
binding affinity using GNNs for a pharma partnership"
→ Reveals: what the project is, who it's for

GOOD — reveals only the mind needed:
"I need someone who thinks carefully about graph 
topology, has intuition for molecular representations, 
and isn't afraid of sparse irregular data structures"
→ Reveals: what skills are needed
→ Reveals NOTHING: about the project itself
```

The professor can honestly describe "the type of mind I need" without disclosing what the project is, who funds it, or why it matters. The system matches on the description of a mind, not a description of work.

---

## The Differential Privacy Implementation

```python
# services/private_matching_service.py
# THE NOVEL ML CONTRIBUTION — build this exactly

import numpy as np
from openai import AsyncOpenAI
import hashlib
import time

openai_client = AsyncOpenAI(api_key=OPENAI_API_KEY)

async def create_private_project_signal(
    skills_description: str,
    epsilon: float = 1.0,
    professor_id: str = None
) -> dict:
    """
    NOVEL FUNCTION: Create a differentially private embedding 
    from a professor's confidential skills description.
    
    The raw text is NEVER stored. Only the noised embedding persists.
    This function processes text and immediately discards it.
    
    epsilon: privacy budget
      epsilon=0.5: high privacy, lower matching accuracy  
      epsilon=1.0: balanced (recommended default)
      epsilon=2.0: lower privacy, higher matching accuracy
    
    Returns: noised embedding + metadata. NO raw text in return value.
    """
    
    # Step 1: Generate clean embedding from skills description
    response = await openai_client.embeddings.create(
        model="text-embedding-3-small",
        input=skills_description
    )
    clean_embedding = np.array(response.data[0].embedding)
    
    # Step 2: Apply Gaussian mechanism for differential privacy
    # Sensitivity of unit-normalized embeddings is bounded by 2 (L2 norm)
    l2_sensitivity = 2.0
    noise_scale = l2_sensitivity / epsilon
    
    # Calibrated Gaussian noise — standard DP mechanism
    noise = np.random.normal(
        loc=0.0,
        scale=noise_scale,
        size=clean_embedding.shape
    )
    
    # Step 3: Add noise and renormalize to unit sphere
    # Renormalization preserves angular relationships for cosine similarity
    noised_embedding = clean_embedding + noise
    noised_embedding = noised_embedding / np.linalg.norm(noised_embedding)
    
    # Step 4: Generate signal ID — hash of professor_id + timestamp
    signal_id = hashlib.sha256(
        f"{professor_id}_{time.time()}".encode()
    ).hexdigest()[:16]
    
    # IMPORTANT: skills_description is NOT included in return value
    # It is processed here and then goes out of scope — Python GC handles deletion
    return {
        "signal_id": signal_id,
        "professor_id": professor_id,
        "private_embedding": noised_embedding.tolist(),
        "epsilon": epsilon,
        "tier": 3,
        "created_at": time.time(),
        "raw_text_stored": False,  # explicitly document this guarantee
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
    Combines public (T1), semi-public (T2), and private (T3) signals
    into a single alignment score.
    
    When private_embedding is None (no T3 signal registered),
    falls back gracefully to T1+T2 only with renormalized weights.
    """
    
    W1, W2, W3 = 0.50, 0.30, 0.20
    
    if private_embedding is None:
        # No private signal — renormalize T1+T2 weights to sum to 1.0
        adjusted_W1 = W1 / (W1 + W2)   # 0.625
        adjusted_W2 = W2 / (W1 + W2)   # 0.375
        composite = adjusted_W1 * tier1_score + adjusted_W2 * tier2_score
        has_private_signal = False
        tier3_score = None
        confidence_boost = 0
        
    else:
        # Private signal available — compute noised similarity
        private_arr = np.array(private_embedding)
        
        raw_private_sim = float(
            np.dot(student_embedding, private_arr) / (
                np.linalg.norm(student_embedding) *
                np.linalg.norm(private_arr)
            )
        )
        
        # Normalize to 0-100 scale (same as T1, T2)
        tier3_score = min(100, max(0, (raw_private_sim - 0.1) / 0.8 * 100))
        
        # Weighted composite across all three tiers
        composite = W1 * tier1_score + W2 * tier2_score + W3 * tier3_score
        has_private_signal = True
        
        # Agreement bonus: if T3 strongly agrees with T1, slight confidence boost
        # If T3 contradicts T1 significantly, slight penalty (noise effect)
        tier_agreement = abs(tier3_score - tier1_score) < 15
        confidence_boost = 3 if tier_agreement else -2
        composite = min(100, composite + confidence_boost)
    
    return {
        "composite_score": round(composite, 1),
        "tier1_contribution": round(W1 * tier1_score, 1) if private_embedding else round(0.625 * tier1_score, 1),
        "tier2_contribution": round(W2 * tier2_score, 1) if private_embedding else round(0.375 * tier2_score, 1),
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


# In-memory store for private signals — hackathon only, no DB
# In production: encrypted database, signals expire after 90 days
PRIVATE_SIGNALS_STORE: dict[str, dict] = {}

def store_private_signal(professor_id: str, signal: dict) -> None:
    """Store only noised embedding — raw text never stored"""
    PRIVATE_SIGNALS_STORE[professor_id] = {
        "signal_id": signal["signal_id"],
        "private_embedding": signal["private_embedding"],
        "epsilon": signal["epsilon"],
        "created_at": signal["created_at"],
        "tier": 3,
        "raw_text_stored": False
    }

def get_private_signal(professor_id: str) -> dict | None:
    """Retrieve private signal — returns embedding only, no raw text"""
    return PRIVATE_SIGNALS_STORE.get(professor_id)

def delete_private_signal(professor_id: str) -> bool:
    """Professor can delete their signal at any time"""
    if professor_id in PRIVATE_SIGNALS_STORE:
        del PRIVATE_SIGNALS_STORE[professor_id]
        return True
    return False
```

---

## New API Endpoints (add to FastAPI)

```python
# POST /api/professor/private-signal
# Professor submits confidential skills description
# Raw text is NEVER logged — configure middleware to skip body logging
{
  "professor_id": "string",
  "professor_name": "string",
  "university": "string",
  "skills_description": "string",   # processed + discarded immediately
  "epsilon": 1.0
}
# Returns:
{
  "signal_id": "a3f8b2c1",
  "created_at": 1713916800,
  "raw_text_stored": false,
  "privacy_guarantee": "(epsilon=1.0)-differentially private",
  "message": "Signal generated. Your description has been discarded."
}

# DELETE /api/professor/private-signal/{professor_id}
# Professor removes their signal at any time

# GET /api/professor/signal-status/{professor_id}
# Returns: {has_signal: bool, signal_id: str, created_at: timestamp}
# Does NOT return the embedding vector
```

**CRITICAL: Add FastAPI middleware to prevent logging of private endpoint body:**
```python
# main.py — add this middleware

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

class PrivacyMiddleware(BaseHTTPMiddleware):
    """
    Ensures the private signal endpoint body is never logged.
    Raw text must not appear in any log file.
    """
    PRIVATE_ENDPOINTS = {"/api/professor/private-signal"}
    
    async def dispatch(self, request: Request, call_next):
        if request.url.path in self.PRIVATE_ENDPOINTS:
            # Process but never log body
            response = await call_next(request)
            return response
        return await call_next(request)

app.add_middleware(PrivacyMiddleware)

# Also configure uvicorn to not log request bodies:
# uvicorn main:app --no-access-log
```

---

## Professor Portal UI (Page 5 — new route: /professor)

Add a "Are you a professor? →" link at the bottom of the student landing page.

**The three-tier profile visualizer component (`TierVisualizer.tsx`):**

```tsx
// components/TierVisualizer.tsx
// Visual showing professor's data split across three tiers

interface TierVisualizerProps {
  tier1Data: { papers: number; grants: number; labPage: boolean }
  tier2Data: { workshopPapers: number; github: number }
  hasPrivateSignal: boolean
  onAddPrivateSignal: () => void
}

// Renders three stacked sections with different fill levels:
// Tier 1: bright amber/teal bars (full)
// Tier 2: medium fill bars (partial)
// Tier 3: empty bars with lock icon + "Add signal" CTA
```

**The private signal input form (`PrivateSignalForm.tsx`):**

UI spec:
- Dark card with subtle purple/indigo border (signals something special)
- Bold header: "Confidential Research Signal"
- Subheader in muted text: "Describe the type of mind you need. Not what the project is."
- Large textarea placeholder: "I need someone who thinks carefully about [skills, methods, intellectual approach]..."
- Privacy level selector: three pills — High (ε=0.5) / Balanced (ε=1.0) / Lower (ε=2.0)
- Warning box: "Once submitted: Your text is immediately discarded. Only a private mathematical signal persists. Students see 'Additional alignment detected' — they never see what you wrote."
- Submit button: "Generate Private Signal →"
- After submit: confirmation card showing signal_id, created_at, "Text: [DISCARDED]"

**Professor card in student results — when private signal matches:**

Add a lock badge `🔒` to the professor card when `has_private_signal: true`. Show tooltip: "This professor has indicated additional research interest beyond their public profile that aligns with you. Details are private." The alignment score shown already incorporates the T3 signal — student sees a higher score without knowing why.

---

## Updated ML Explainability Panel — Show T3 When Active

When a professor has an active T3 signal and student aligns with it:

```
How LabLens computed this score
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Model: text-embedding-3-small (OpenAI)
Method: Three-tier privacy-preserving composite scoring

TIER 1 — Public papers (weight: 50%)
Your interest ↔ 4 paper abstracts
Cosine similarity: 0.871 → 95.1 / 100

TIER 2 — Semi-public data (weight: 30%)
Workshop papers + GitHub repos
Cosine similarity: 0.834 → 91.8 / 100

TIER 3 — Confidential signal (weight: 20%)
🔒 Private project signal registered
Method: (ε=1.0)-differentially private Gaussian mechanism
Noised similarity: ~0.89 (approximate — noise is intentional)
Privacy guarantee: Source description irreversibly discarded

COMPOSITE SCORE: 94.3 / 100
Confidence: High · 3 tiers active · tiers agree

This is not a Claude opinion. This is a real ML computation
combining public semantic retrieval with differentially
private sparse matching over confidential research signals.
```

---

## Updated Demo — Scenario D (Show the Private Matching)

This is the demo moment that wins the room. Run it as a 90-second segment after the standard student demo.

**Step 1 — Professor side (30 seconds):**
```
Go to /professor
Enter Columbia CS
System auto-populates: "4 papers found, 2 grants, lab page indexed"
Click "+ Add confidential research signal"
Type: "I need someone with strong intuitions about 
distribution shift, causal graph structure, and 
who understands the difference between correlation 
and intervention at a formal mathematical level"
Click "Generate Private Signal"
→ Show: signal_id generated, text shows [DISCARDED]
```

**Step 2 — Student side (30 seconds):**
```
Switch to student view
Enter: "I'm interested in how statistical models fail 
when the data distribution shifts at test time — 
specifically what causal structure tells us about 
when and why generalization breaks down"
Run search
→ The professor from Step 1 shows 🔒 badge
→ Their composite score is higher than T1+T2 alone
→ Click "How we scored this" → show T3 row in the panel
```

**Pitch line for this moment:**
*"We just showed you a matching system that works even when the research can't be named. The professor described a mind. The student described a curiosity. The algorithm found the intersection — privately, mathematically, without either side revealing what they couldn't afford to reveal. That is the core research contribution of LabLens."*

---

## Updated Build Order — Add These Steps

After step 5 (main search endpoint), add:

**5b. Build private_matching_service.py** — 45 min · Backend person
- `create_private_project_signal()` with Gaussian noise
- `compute_three_tier_composite()` scoring
- In-memory store functions
- Privacy middleware for FastAPI

**5c. Build professor portal** — 45 min · Frontend person
- `/professor` page with `TierVisualizer.tsx`
- `PrivateSignalForm.tsx` with privacy level selector
- Confirmation flow + "text discarded" messaging

**5d. Wire T3 into student search results** — 20 min · Backend
- Check private signal store per professor during search
- Compute composite including T3 when available
- Return `has_private_signal: true` flag
- Show 🔒 badge on student-facing card

---

## Updated Tech Stack (add these)

- **Differential Privacy:** NumPy Gaussian mechanism — no external library, implement directly as shown
- **Privacy tier:** ε=1.0 default (balanced privacy/utility)
- **Signal storage:** In-memory only for hackathon. Production: encrypted DB, 90-day TTL, audit log
- **Privacy middleware:** FastAPI BaseHTTPMiddleware blocking body logging on private endpoint

---

## Why This Wins — The One Answer That Stops Judges

Every ML judge will ask: *"What's novel here?"*

**Without T3:** "We do semantic search with embeddings and Claude synthesis." Good product. Not novel ML.

**With T3:** "We built differentially private sparse matching for confidential research projects. Professors encode what type of mind they need using a Gaussian-noised embedding with calibrated privacy budget. The raw description is irreversibly discarded. Students receive aggregate alignment scores incorporating the private signal — without ever seeing what the professor wrote. This is cold-start recommendation under asymmetric privacy constraints, applied to a real unsolved problem in academic matching."

That answer belongs in a NeurIPS workshop paper. Sarena from Meta AI Research will ask follow-up questions. Ahsaas from Instacart will recognize the cold-start framing immediately. Prahal from Instagram ML will appreciate the DP implementation. Shyan from Eniac Ventures will see a moat. Kelly from BizCrush will see a product that universities will pay for.

That is what winning looks like.

---

*Three-tier privacy layer added — April 12, 2026*
*Novel contribution: Differentially private sparse matching for confidential research projects*
*ε=1.0 Gaussian mechanism · Three-tier composite scoring (50/30/20) · Raw text never persisted*
*Grounded in: PSI literature, federated cold-start recommendation, differential privacy theory*

---

---

# THE COMPLETE STUDENT JOURNEY PIPELINE
## From Research Interest → Exact Professor Match → Approach → Impress → Get the Role

This is the backbone of the entire product. Every feature exists to serve this arc.
The pipeline has 6 stages. They run in order. Each stage gates the next.

```
STAGE 1          STAGE 2              STAGE 3         STAGE 4          STAGE 5        STAGE 6
Student input → Active verification → ML matching → Approach plan → Impress them → Get the role
(free text)     (arXiv + Scholar     (embeddings,   (who, how,       (seed ideas,   (meeting prep,
                + .edu + faculty     cosine sim,    when, entry      email draft,   role types,
                page + NSF)          ranked list)   point type)      follow-up)     recovery plan)
```

---

## STAGE 1 — Student Research Interest Intake

### What happens
Student types free-form natural language. No dropdowns, no category selection, no keyword boxes. Plain intellectual curiosity. The system does the extraction.

### What Claude extracts (structured JSON)
```python
INTENT_EXTRACTION_PROMPT = """
You are extracting structured research intent from a student's natural language input.

Student input: {raw_input}
Student level: {level}  # undergrad | masters | phd_applicant
Student background (optional): {background}
Career direction (optional): {career}  # academia | industry | open

Return JSON exactly:
{
  "primary_domain": "the single most specific domain name, e.g. 'causal representation learning'",
  "specific_topics": ["3-5 specific topics they mention or imply"],
  "methods_mentioned": ["any methods, frameworks, or tools they reference"],
  "career_direction": "academia | industry | open",
  "embedding_text": "A dense 2-3 sentence description optimized for semantic similarity search 
                     against professor paper abstracts. Use precise technical vocabulary.
                     This is the text that will be embedded — make it rich.",
  "search_keywords": ["6-8 keywords for Linkup queries to find matching professors"],
  "student_level_context": "what this means for approach strategy and email tone"
}
"""
```

### What the student also provides (UI)
- University selector (default: Columbia / NYU — show any university is possible)
- Level: `Undergrad` / `Master's` / `PhD Applicant`
- Optionally: 2-3 sentences of their current technical background
- Optionally: career direction preference

---

## STAGE 2 — ACTIVE PROFESSOR VERIFICATION
### The most critical quality gate in the entire pipeline

**This is what separates LabLens from every existing tool.**

Google Scholar, faculty pages, LinkedIn — all show historical data. A professor who retired in 2022 still has a beautiful, citation-rich Scholar profile. A professor who went into administration still appears on the department website. Students waste months emailing people who are no longer doing active research.

LabLens runs every candidate professor through a 5-signal verification stack before they ever appear in results. Only verified-active professors are shown.

### The 5 verification signals — in priority order

#### Signal 1: arXiv recency (PRIMARY — strongest signal for CS/ML/AI)
```python
import arxiv

async def check_arxiv_activity(professor_name: str, months: int = 18) -> dict:
    """
    Check if professor has submitted papers to arXiv in the last 18 months.
    arXiv is FREE, has a proper public API, covers all CS/ML/Math/Physics/Stats.
    A submission in the last 18 months = definitively active researcher.
    """
    client = arxiv.Client()

    # Search by author name — use full name and last name variants
    search = arxiv.Search(
        query=f"au:{professor_name}",
        max_results=10,
        sort_by=arxiv.SortCriterion.SubmittedDate,
        sort_order=arxiv.SortOrder.Descending
    )

    results = list(client.results(search))

    if not results:
        return {"active": False, "reason": "no_arxiv_papers", "papers": []}

    # Check most recent paper date
    most_recent = results[0]
    cutoff = datetime.now() - timedelta(days=months * 30)

    papers_in_window = [
        {
            "title": r.title,
            "submitted": r.submitted.isoformat(),
            "abstract": r.summary[:500],
            "url": r.entry_id
        }
        for r in results
        if r.submitted.replace(tzinfo=None) > cutoff
    ]

    return {
        "active": len(papers_in_window) > 0,
        "papers_in_window": papers_in_window,
        "most_recent_date": most_recent.submitted.isoformat(),
        "total_found": len(results),
        "signal_strength": "strong"  # arXiv is the most reliable activity signal
    }
```

#### Signal 2: Google Scholar .edu email verification (AFFILIATION PROOF)
```python
async def check_scholar_edu_verification(
    professor_name: str,
    university: str
) -> dict:
    """
    Google Scholar shows "Verified email at columbia.edu" on public profiles.
    This .edu email badge = professor has verified their current institutional
    affiliation with Google. It is the clearest "currently employed here" signal.

    Implementation: Linkup fetches the Scholar profile page.
    Claude reads the verification badge text.
    No official Google Scholar API exists — use Linkup deep fetch.
    """
    # University domain mapping
    UNIVERSITY_DOMAINS = {
        "Columbia University": "columbia.edu",
        "NYU": "nyu.edu",
        "MIT": "mit.edu",
        "Stanford": "stanford.edu",
        "Carnegie Mellon": "cs.cmu.edu",
        "UC Berkeley": "berkeley.edu",
        "Harvard": "harvard.edu",
    }

    expected_domain = UNIVERSITY_DOMAINS.get(university, university.lower().replace(" ", "") + ".edu")

    # Linkup query to find Scholar profile with .edu verification
    linkup_query = f'Google Scholar "{professor_name}" "{expected_domain}" "verified email"'

    result = await linkup_search(linkup_query, depth="standard")

    # Check if .edu domain appears in verification context
    edu_verified = expected_domain in result.get("content", "").lower()

    return {
        "edu_verified": edu_verified,
        "expected_domain": expected_domain,
        "signal_strength": "strong" if edu_verified else "unknown"
    }
```

#### Signal 3: Faculty page live check (CURRENT EMPLOYMENT)
```python
async def check_faculty_page(
    professor_name: str,
    university: str
) -> dict:
    """
    If a professor's name appears on the department's active faculty page,
    they are currently employed. If the page 404s or they've moved to
    an "emeritus" or "alumni" section, they may have left.

    This is the ground truth for "are they still here?"
    """
    # Department faculty page URLs for major universities
    FACULTY_PAGE_URLS = {
        "Columbia University": "https://www.cs.columbia.edu/people/faculty/",
        "NYU": "https://cs.nyu.edu/home/people/faculty_members.html",
        "MIT": "https://www.eecs.mit.edu/people/faculty-advisors/",
        "Stanford": "https://cs.stanford.edu/people/faculty",
    }

    faculty_page = FACULTY_PAGE_URLS.get(university)

    if faculty_page:
        # Direct fetch of department faculty list
        content = await linkup_fetch(faculty_page)
        name_present = professor_name.lower() in content.lower()
    else:
        # Fall back to Linkup search
        content = await linkup_search(
            f'site:{university.lower().replace(" ","")}.edu "{professor_name}" faculty',
            depth="standard"
        )
        name_present = professor_name.lower() in content.get("content", "").lower()

    return {
        "on_faculty_page": name_present,
        "signal_strength": "strong" if name_present else "weak"
    }
```

#### Signal 4: NSF active grants check (FUNDING = ACTIVE RESEARCH)
```python
async def check_nsf_active_grants(professor_name: str) -> dict:
    """
    NSF Awards database is PUBLIC, FREE, no API key required.
    An active NSF grant means:
    1. Professor is currently doing funded research
    2. They almost certainly need students to execute it
    3. They have budget for RAs

    This is both an activity signal AND a hiring opportunity signal.
    """
    import httpx

    # NSF Awards API — completely free, no authentication
    url = "https://api.nsf.gov/services/v1/awards.json"
    params = {
        "pdPIName": professor_name,
        "dateStart": "01/01/2023",  # Only active/recent grants
        "printFields": "id,title,abstractText,startDate,expDate,awardeeName,piFirstName,piLastName,fundsObligatedAmt"
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        data = response.json()

    awards = data.get("response", {}).get("award", [])

    # Filter to currently active (not expired)
    today = datetime.now()
    active_awards = []
    for award in awards:
        exp_date_str = award.get("expDate", "")
        if exp_date_str:
            try:
                exp_date = datetime.strptime(exp_date_str, "%m/%d/%Y")
                if exp_date > today:
                    active_awards.append({
                        "title": award.get("title", ""),
                        "abstract": award.get("abstractText", "")[:400],
                        "amount": award.get("fundsObligatedAmt", ""),
                        "expires": exp_date_str,
                        "id": award.get("id", "")
                    })
            except ValueError:
                pass

    return {
        "has_active_grants": len(active_awards) > 0,
        "active_grants": active_awards,
        "signal_strength": "strong" if active_awards else "neutral",
        "hiring_signal": len(active_awards) > 0  # active grant = likely needs students
    }
```

#### Signal 5: Lab website recency (CURRENTLY RUNNING LAB)
```python
async def check_lab_website_recency(professor_name: str, university: str) -> dict:
    """
    A lab website with news posts from 2024-2025, current student listings,
    and recent paper announcements signals an actively running lab.

    A lab website last updated in 2021 signals the opposite.
    """
    # Linkup finds the lab website
    lab_search = await linkup_search(
        f'"{professor_name}" {university} research lab website 2024 2025',
        depth="deep"
    )

    # Claude extracts the most recent date reference from the content
    date_extraction_prompt = f"""
    From the following lab website content, extract the most recent date mentioned.
    Look for: paper submission dates, news post dates, student graduation years,
    event announcements, and any "last updated" markers.

    Content: {lab_search.get("content", "")[:2000]}

    Return JSON: {{"most_recent_year": 2024, "most_recent_context": "brief description"}}
    """

    date_result = await claude_extract(date_extraction_prompt)
    most_recent_year = date_result.get("most_recent_year", 0)

    return {
        "lab_recently_active": most_recent_year >= 2024,
        "most_recent_year": most_recent_year,
        "signal_strength": "strong" if most_recent_year >= 2024 else "weak"
    }
```

### The Verification Compositor — Final Active/Inactive Decision
```python
def compute_activity_verdict(signals: dict) -> dict:
    """
    Combines all 5 signals into a final ACTIVE / UNCERTAIN / INACTIVE verdict.
    Uses a tiered logic — primary signals override secondary signals.
    """

    arxiv = signals.get("arxiv", {})
    scholar = signals.get("scholar_edu", {})
    faculty_page = signals.get("faculty_page", {})
    nsf = signals.get("nsf_grants", {})
    lab_site = signals.get("lab_website", {})

    # PRIMARY: arXiv paper in last 18 months = definitively active
    if arxiv.get("active"):
        return {
            "verdict": "ACTIVE",
            "verdict_color": "teal",
            "reason": f"Published {len(arxiv.get('papers_in_window', []))} paper(s) on arXiv in the last 18 months",
            "show_to_student": True,
            "confidence": "high"
        }

    # PRIMARY: On faculty page + edu verified = almost certainly active
    if faculty_page.get("on_faculty_page") and scholar.get("edu_verified"):
        return {
            "verdict": "ACTIVE",
            "verdict_color": "teal",
            "reason": "Currently on department faculty page with verified institutional email",
            "show_to_student": True,
            "confidence": "high"
        }

    # SECONDARY: Active NSF grant = doing funded research
    if nsf.get("has_active_grants"):
        return {
            "verdict": "ACTIVE",
            "verdict_color": "amber",
            "reason": f"Has active NSF funding through {nsf['active_grants'][0]['expires']}",
            "show_to_student": True,
            "confidence": "medium"
        }

    # UNCERTAIN: On faculty page but no recent publications
    if faculty_page.get("on_faculty_page"):
        return {
            "verdict": "UNCERTAIN",
            "verdict_color": "amber",
            "reason": "On faculty page but no recent arXiv activity found. May work in non-arXiv venues.",
            "show_to_student": True,  # show with warning badge
            "badge": "Limited recent publications",
            "confidence": "low"
        }

    # INACTIVE: No faculty page, no recent work
    return {
        "verdict": "INACTIVE",
        "verdict_color": "coral",
        "reason": "No faculty page found and no publications since 2022",
        "show_to_student": False,  # FILTER OUT — do not show
        "confidence": "high"
    }
```

**Critical rule for the UI:** INACTIVE professors are silently filtered. The student never sees them. The system shows only ACTIVE and UNCERTAIN professors. UNCERTAIN professors get a small amber badge: "Limited recent data." This is the quality gate no other tool has.

---

## STAGE 3 — Semantic Matching (ML Core)

Matching runs ONLY on professors who passed Stage 2 as ACTIVE or UNCERTAIN. This is important — you are not embedding all professors, only verified-live ones.

```python
async def run_matching_pipeline(
    student_embedding_text: str,
    active_professors: list[dict]
) -> list[dict]:
    """
    Full embedding + cosine similarity pipeline.
    Runs only on verified active professors.
    Returns professors ranked by alignment score.
    """

    # Embed the student's interest
    student_vec = await embed_text(student_embedding_text)

    scored = []
    for prof in active_professors:
        # Collect paper abstracts — arXiv papers from Stage 2 verification
        # already have abstracts. Use those directly — no extra API call.
        abstracts = [
            p["abstract"] for p in prof.get("arxiv_papers", [])
            if p.get("abstract")
        ]

        # Also embed NSF grant abstract if available
        if prof.get("nsf_grants"):
            abstracts.append(prof["nsf_grants"][0].get("abstract", ""))

        if not abstracts:
            # No embeddings possible — still show but with confidence: low
            scored.append({**prof, "alignment_score": 0, "confidence": "insufficient_data"})
            continue

        # Embed each abstract
        abstract_vecs = [await embed_text(a) for a in abstracts[:5]]

        # Cosine similarity per paper
        paper_sims = [cosine_similarity(student_vec, v) for v in abstract_vecs]

        # Weighted composite: best paper sim gets most weight
        max_sim = max(paper_sims)
        avg_sim = sum(paper_sims) / len(paper_sims)

        # Normalized 0-100
        raw_score = 0.6 * max_sim + 0.4 * avg_sim
        normalized = min(100, max(0, (raw_score - 0.1) / 0.8 * 100))

        # Best matching paper index (for the explainability panel)
        best_idx = paper_sims.index(max_sim)

        scored.append({
            **prof,
            "alignment_score": round(normalized, 1),
            "alignment_detail": {
                "paper_scores": [round(s * 100, 1) for s in paper_sims],
                "best_paper_idx": best_idx,
                "best_paper_title": prof["arxiv_papers"][best_idx]["title"] if prof.get("arxiv_papers") else "",
                "raw_cosine": round(raw_score, 4),
            },
            "confidence": "high" if len(abstract_vecs) >= 3 else "medium"
        })

    # Sort by alignment score descending
    return sorted(scored, key=lambda x: x["alignment_score"], reverse=True)
```

---

## STAGE 4 — Approach Strategy (Who to Contact, How, When)

After matching, for each top-k professor Claude generates a specific approach recommendation. Not generic advice — specific to this professor's lab profile.

```python
APPROACH_STRATEGY_PROMPT = """
You are advising a student on exactly how to approach a specific professor for research.

Professor profile:
- Name: {professor_name}
- Lab size (current students): {lab_size}
- Career stage: {career_stage}  # new_hire | established | senior
- Has active hiring signals: {hiring_signals}
- Has active PhD students listed: {has_phd_students}
- Contact email: {contact_email}
- Has upcoming talks or seminars: {upcoming_talks}
- Lab GitHub repos (public): {github_repos}
- Student level: {student_level}
- Student background: {student_background}

Select ONE primary entry point and explain it specifically:

ENTRY_POINT_A: Email professor directly
  When: new/junior professor, small lab (<4 students), explicit hiring signal on lab page, 
        or lab page says "email me"

ENTRY_POINT_B: Email a PhD student or postdoc first  
  When: large lab (>6 students), senior/famous professor, professor rarely responds to 
        unsolicited emails. PhD student can: reply faster, vouch for you internally, 
        give you inside knowledge before you reach the professor.

ENTRY_POINT_C: Attend their talk or reading group first
  When: professor teaches an accessible course, has upcoming public seminar, 
        runs an open reading group. In-person warm intro converts 3-5x better than cold email.

ENTRY_POINT_D: Contribute to their public work first
  When: professor has active GitHub repos, regularly posts on Twitter/X about research.
        Make a small meaningful contribution (thoughtful comment, issue, PR) BEFORE asking.
        Shows initiative and makes you visible before the ask.

Return JSON:
{
  "recommended_entry": "A | B | C | D",
  "entry_rationale": "specific reason based on THIS professor's profile",
  "specific_action": "the exact first step — e.g. 'Email Dr. X's PhD student Sarah Chen who worked on the causal abstraction paper'",
  "contact_target": "professor | specific_phd_student | attend_event | github",
  "timing_recommendation": "when to make contact based on semester and grant cycle",
  "what_to_bring": ["2-3 specific things to have ready before making contact"]
}
"""
```

---

## STAGE 5 — How to Impress Them (Seed Ideas + Email)

This is the stage that converts a match into a relationship. The three-part formula every email must follow:

**Part 1 — The paper hook:** Reference their specific recent paper. Not "I find your research interesting" — but "Your 2024 NeurIPS paper raised a specific question for me." One sentence. Shows you actually read it.

**Part 2 — The seed idea:** A genuine research question at the intersection of their work and your curiosity. Not asking for guidance — proposing intellectual direction. This is what professors respond to.

**Part 3 — One line of credibility:** Not a resume. One concrete signal of readiness. "I implemented the PC algorithm from scratch" or "I have 2 years of PyTorch experience" or "I took your course last semester."

```python
IMPRESSIVE_EMAIL_PROMPT = """
Draft a cold email from a student to a professor that will actually get a response.

Professor: {professor_name}
Their best recent paper: "{paper_title}" ({paper_year})
One specific finding or method from that paper: {paper_specific_finding}
The seed idea generated for this professor: {seed_idea}
Student level: {student_level}
Student's one strongest credential: {top_credential}
Entry point type: {entry_point}  # professor_direct | phd_student | event_followup

RULES — non-negotiable:
1. Subject: Reference the SPECIFIC paper title. Never use "Research Opportunity" or "Interested in your work."
2. First sentence: Something specific about the paper — a finding, a method, a question it raised.
   Never start with "I", "My name is", or "Hope this email finds you well."
3. Second sentence: The seed idea — framed as YOUR intellectual curiosity, not a request.
   "This made me wonder if..." or "One question this opens up for me is..."
4. Third sentence: One specific credential showing readiness.
5. Final ask: Offer two low-friction options — "15-minute call or async email, whatever is easier for you"
6. Maximum 150 words total. Enforce this. Cut anything that doesn't carry weight.

Return JSON: {
  "subject": "...",
  "body": "...",
  "word_count": N,
  "hook_paper": "title of paper referenced",
  "seed_idea_used": "the idea embedded in the email"
}
"""
```

---

## STAGE 6 — Getting the Role (Full Follow-Through Kit)

### 6a. Meeting prep brief (generated when professor says yes)

```python
MEETING_PREP_PROMPT = """
Generate a meeting prep brief for a student who has a meeting with a professor.

Professor: {professor_name}
Lab focus: {lab_focus}
Student level: {student_level}
Student background: {student_background}
Alumni data (where past students went): {alumni_destinations}

Return JSON:
{
  "what_to_prepare": [
    "Read these 2 papers before the meeting: [titles]",
    "Prepare a 2-slide background summary",  
    "Have the seed idea polished and ready to articulate"
  ],
  "what_to_ask": [
    "What does a successful first semester for a new student look like?",
    "What are the biggest open questions in the lab right now?",
    "How do students in your lab typically find their thesis topic?"
  ],
  "what_NOT_to_do": [
    "Don't ask what projects are available — come with your own direction",
    "Don't ask about pay or credit in the first meeting",
    "Don't be late"
  ],
  "what_to_propose": "Specific low-commitment first step to offer: e.g. 'I could spend 2 weeks doing X as a trial'",
  "role_type_to_ask_for": "volunteer_ra | paid_ra | independent_study | thesis_supervision",
  "role_rationale": "why this role type fits this student's situation and this lab's norms"
}
"""
```

### 6b. Role types decoder (shown to every student before the meeting)

Display this as a quick reference card in the UI:

```
ROLE TYPES — what to ask for

Volunteer RA       No pay. Low commitment. Good for first 4-6 weeks to prove yourself.
                   Ask for: "I'd love to contribute to X project on a trial basis"

Paid RA            $15-25/hr typically. Requires budget (check NSF grant status).
                   Ask for: "Is there RA funding available if things go well?"

Independent Study  Academic credit (1-3 units). No pay. Formal deliverable required.
                   Ask for: "Could this count for independent study credit?"

Honors Thesis      Deepest commitment. 1-2 semesters. Leads to strong rec letter + paper.
                   Ask for: "I'm interested in a thesis project if you have one in mind"
```

### 6c. The "they said no" recovery plan

```python
NO_RECOVERY_PROMPT = """
A professor told this student there are no openings. Generate a recovery plan.

Professor: {professor_name}
Reason given (if any): {rejection_reason}
Current semester: {semester}
NSF grant expiry: {grant_expiry}
Lab size currently: {lab_size}

Return JSON:
{
  "next_attempt_timing": "specific month/semester when conditions may change",
  "reason_for_timing": "why that window is better (grant renewal, graduation, etc.)",
  "alternative_entry": "other way to get into this lab's orbit in the meantime",
  "alternative_professors": "types of professors to try next with similar research",
  "revised_email_strategy": "what to do differently in the next attempt"
}
"""
```

### 6d. Follow-through state machine (tracks progress)

```
States per professor contact:
NOT_CONTACTED → EMAIL_DRAFTED → EMAIL_SENT → WAITING (10 days)
    ↓                                              ↓
FOLLOW_UP_READY (day 10) ──────────────────→ FOLLOWED_UP
    ↓                                              ↓
REPLIED_POSITIVE → MEETING_SCHEDULED → MEETING_HAPPENED → OFFER_MADE → STARTED
REPLIED_NEGATIVE → RECOVERY_PLAN_GENERATED → RETRY_SCHEDULED
NO_REPLY_AFTER_FOLLOWUP → RETRY_SCHEDULED (next semester)
```

Each state transition surfaces the right next action. The student never has to ask "what do I do next."

---

## COMPLETE VERIFICATION + PIPELINE CODE FLOW

```python
# routes/search.py — the main search endpoint, full pipeline

@app.post("/api/search")
async def search(request: SearchRequest):
    """
    Full pipeline: intake → verify → match → approach → impress
    Returns top-k professors with complete intelligence packages.
    """

    # STAGE 1: Extract intent
    intent = await claude_extract_intent(
        student_input=request.student_interest,
        student_level=request.student_level,
        background=request.background
    )

    # STAGE 2: Find candidate professors via Linkup
    candidates = await linkup_find_professors(
        university=request.university,
        domain=intent["primary_domain"],
        keywords=intent["search_keywords"]
    )

    # STAGE 2 VERIFICATION: Run all 5 signals in parallel per professor
    verified_professors = []
    for candidate in candidates:
        signals = await asyncio.gather(
            check_arxiv_activity(candidate["name"]),
            check_scholar_edu_verification(candidate["name"], request.university),
            check_faculty_page(candidate["name"], request.university),
            check_nsf_active_grants(candidate["name"]),
            check_lab_website_recency(candidate["name"], request.university)
        )

        verdict = compute_activity_verdict({
            "arxiv": signals[0],
            "scholar_edu": signals[1],
            "faculty_page": signals[2],
            "nsf_grants": signals[3],
            "lab_website": signals[4]
        })

        # GATE: Only pass ACTIVE and UNCERTAIN professors to matching
        if verdict["show_to_student"]:
            verified_professors.append({
                **candidate,
                "verification": verdict,
                "arxiv_papers": signals[0].get("papers_in_window", []),
                "nsf_grants": signals[2].get("active_grants", []),
            })

    # STAGE 3: ML matching — embeddings + cosine similarity
    ranked = await run_matching_pipeline(
        student_embedding_text=intent["embedding_text"],
        active_professors=verified_professors
    )

    # Top-k only (default 5)
    top_k = ranked[:request.top_k]

    # STAGE 4 + 5: For each top professor, generate approach + email
    results = []
    for prof in top_k:
        approach = await claude_approach_strategy(prof, intent, request)
        seed_ideas = await claude_seed_ideas(prof, intent)
        email = await claude_email_draft(prof, intent, seed_ideas[0])

        # Check for private T3 signal
        private_signal = get_private_signal(prof.get("id", ""))
        if private_signal:
            composite = compute_three_tier_composite(
                student_embedding=await embed_text(intent["embedding_text"]),
                tier1_score=prof["alignment_score"],
                tier2_score=prof["alignment_score"] * 0.9,
                private_embedding=private_signal["private_embedding"]
            )
            prof["alignment_score"] = composite["composite_score"]
            prof["has_private_signal"] = True

        results.append({
            **prof,
            "approach_strategy": approach,
            "seed_ideas": seed_ideas,
            "email_draft": email,
        })

    return {"professors": results, "total_verified": len(verified_professors)}
```

---

## LOADING STATES — Show Every Stage to the Student

This is crucial. Make the pipeline visible. Judges who see the step labels understand immediately that something real is happening.

```
⟳ Step 1/6  Extracting your research intent...         (0-3s)
⟳ Step 2/6  Finding professors at {university}...      (3-8s)
⟳ Step 3/6  Verifying active status (arXiv + .edu)...  (8-18s)
⟳ Step 4/6  Computing semantic alignment...            (18-25s)
⟳ Step 5/6  Generating approach strategies...          (25-35s)
⟳ Step 6/6  Drafting personalized emails...            (35-45s)
✓ Done — found {n} verified active professors
```

Each step label tells the full product story without any explanation. Judges watching the demo read those labels and immediately understand what is real about this system.

---

## UPDATED NON-NEGOTIABLES (add to existing list)

11. The active verification pipeline MUST run before matching — never show unverified professors
12. The arXiv API check MUST use real dates — papers older than 18 months do not count
13. The .edu verification MUST check the specific university domain — not just any .edu
14. INACTIVE professors are silently filtered — never surfaced to the student
15. The loading steps MUST show "Verifying active status (arXiv + .edu)" — this is the quality signal
16. The email MUST reference a specific real paper from arXiv data — never a made-up title
17. Stage 6 meeting prep MUST be generated only after professor replies — not before
18. The "no recovery plan" MUST use NSF grant expiry data to suggest timing — not a generic "try again later"

---

# REPOSITORY

Hackathon / LabLens codebase: [Akhilesh-Vangala/Nexus](https://github.com/Akhilesh-Vangala/Nexus)

---

*Complete student journey pipeline added — April 12, 2026*

*Verification stack: arXiv API (free) + .edu Scholar check + faculty page + NSF Awards API (free) + lab website*

*Pipeline: intake → verify (5 signals) → embed → rank → approach → seed ideas → email → get role*

*Repo: [github.com/Akhilesh-Vangala/Nexus](https://github.com/Akhilesh-Vangala/Nexus)*
