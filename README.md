# Nexus

**Semantic research advisor matching via live retrieval, differential privacy, and grounded LLM synthesis.**

Nexus resolves a structural problem in graduate student placement: faculty research pages are static, outdated, and unsearchable by intent. Nexus replaces keyword search with a five-stage AI pipeline that retrieves live faculty data, verifies activity against public scientific databases, computes dense vector alignment, and synthesizes grounded, citation-backed intelligence — in a single round-trip.

---

## Architecture

```
                        ┌─────────────────────────────────────────────────────┐
                        │                  REQUEST BOUNDARY                    │
                        │  POST /api/search  {query, university, level, ...}   │
                        └───────────────────────────┬─────────────────────────┘
                                                    │
                        ┌───────────────────────────▼─────────────────────────┐
                        │           STAGE 1 — INTENT EXTRACTION               │
                        │  Claude (claude-sonnet-4-20250514)                   │
                        │  Input:  natural language query + student level      │
                        │  Output: primary_domain · specific_topics ·          │
                        │          methods · embedding_text · search_keywords  │
                        └───────────────────────────┬─────────────────────────┘
                                                    │
                        ┌───────────────────────────▼─────────────────────────┐
                        │         STAGE 2 — PARALLEL LIVE RETRIEVAL           │
                        │  Linkup API · 2 concurrent queries · asyncio.gather  │
                        │  Targets: faculty pages · lab sites · paper abs ·   │
                        │           grant mentions · personal sites            │
                        │  Claude extracts ≤8 structured professor objects     │
                        └──────────┬──────────────────────────┬───────────────┘
                                   │                          │
              ┌────────────────────▼──────┐    ┌─────────────▼────────────────┐
              │  STAGE 3A — arXiv CHECK   │    │  STAGE 3B — NSF CHECK        │
              │  arxiv Python SDK         │    │  api.nsf.gov/v1/awards.json   │
              │  Window: 18 months        │    │  Filter: expDate > today      │
              │  Sort: SubmittedDate DESC │    │  Fields: title · abstract ·   │
              │  Max: 10 results / prof   │    │  amount · expDate · id        │
              └────────────────────┬──────┘    └─────────────┬────────────────┘
                                   └──────────────┬──────────┘
                        ┌───────────────────────────▼─────────────────────────┐
                        │         STAGE 3C — ACTIVITY VERDICT                 │
                        │  ACTIVE   → arXiv paper in window (high confidence) │
                        │  ACTIVE   → active NSF grant (medium confidence)    │
                        │  UNCERTAIN→ found in DBs, no recent arXiv activity  │
                        └───────────────────────────┬─────────────────────────┘
                                                    │
                        ┌───────────────────────────▼─────────────────────────┐
                        │         STAGE 4 — SEMANTIC ALIGNMENT                │
                        │  Model: all-MiniLM-L6-v2 (384-dim, local CPU)       │
                        │  Student embedding_text  →  v_s ∈ ℝ³⁸⁴             │
                        │  Per paper abstract[0..4] →  v_p ∈ ℝ³⁸⁴           │
                        │  Research statement      →  v_r ∈ ℝ³⁸⁴             │
                        │  Paper score = 0.7·max(sim) + 0.3·mean(sim)         │
                        │  Final = 0.7·paper_score + 0.3·sim(v_s, v_r)        │
                        │  Normalized: (score + 0.1) / 0.9 × 100             │
                        └───────────────────────────┬─────────────────────────┘
                                                    │
                        ┌───────────────────────────▼─────────────────────────┐
                        │    STAGE 5 — MASTER INTELLIGENCE SYNTHESIS          │
                        │  1 Claude call per professor (replaces 4 calls)      │
                        │  Output: current_focus · open_questions ·           │
                        │          why_aligned · best_paper · seed_ideas[3] · │
                        │          email_draft · timing_analysis               │
                        │  Constraint: only references papers in provided data │
                        └─────────────────────────────────────────────────────┘
```

---

## Embedding & Alignment

**Model:** `all-MiniLM-L6-v2` via `sentence-transformers` — 384-dimensional dense vectors, L2-normalized, loaded once at process startup (~80 MB, CPU-only inference, no external API).

**Scoring formula:**

```
sim(a, b) = (a · b) / (‖a‖ · ‖b‖)          # cosine similarity

paper_score = 0.7 · max(sim(v_s, v_pᵢ)) + 0.3 · mean(sim(v_s, v_pᵢ))
                                              for i in papers[0..4]

final_score  = 0.7 · paper_score + 0.3 · sim(v_s, v_r)   # if v_r exists
             = paper_score                                  # fallback

normalized   = clamp((final_score + 0.1) / 0.9 × 100, 0, 100)
```

**Confidence tiers:**
- `high`   — ≥3 paper embeddings scored
- `medium` — 1–2 paper embeddings scored
- `low`    — research statement only

---

## Differential Privacy (Three-Tier Matching)

Professors may submit a confidential research description through the Professor Portal. The raw text is **never stored** — only a noised embedding persists.

**Mechanism: Gaussian with L2 sensitivity = 2.0**

```
v_clean  = encode(description)           # unit-normalized, ℝ³⁸⁴
σ        = Δ₂ / ε     where Δ₂ = 2.0
noise    ~ 𝒩(0, σ²·I)
v_noised = normalize(v_clean + noise)    # re-projected to unit sphere
```

**Privacy budget (ε):**

| ε   | σ (noise scale) | Privacy | Matching accuracy |
|-----|-----------------|---------|-------------------|
| 0.5 | 4.0             | High    | Lower             |
| 1.0 | 2.0             | Balanced| Moderate          |
| 2.0 | 1.0             | Lower   | Higher            |

**Three-tier composite score:**

```
W₁ = 0.50   # Tier 1: public data (papers, arXiv, NSF grants)
W₂ = 0.30   # Tier 2: semi-public (workshops, GitHub, syllabi)
W₃ = 0.20   # Tier 3: private signal (noised embedding)

composite = W₁·T₁ + W₂·T₂ + W₃·T₃

# Without private signal:
composite = (W₁/(W₁+W₂))·T₁ + (W₂/(W₁+W₂))·T₂
          = 0.625·T₁ + 0.375·T₂

# Agreement bonus: |T₃ - T₁| < 15 → +3; else → -2
```

The stored object contains only: `signal_id`, `private_embedding`, `epsilon`, `created_at`, `raw_text_stored: false`. The professor can delete the signal at any time via `DELETE /api/professor/private-signal/{id}`.

---

## Verification Pipeline

Two parallel checks per professor via `asyncio.gather()`:

**arXiv (primary signal — high confidence)**
- SDK: `arxiv` Python client
- Query: `au:{professor_name}`
- Window: 18 months (`datetime.now() - timedelta(days=540)`)
- Max results: 10, sorted by `SubmittedDate DESC`
- Active if: ≥1 paper within window

**NSF Awards API (secondary signal — medium confidence)**
- Endpoint: `api.nsf.gov/services/v1/awards.json`
- Filter: `dateStart=01/01/2023`, `pdPIName={name}`
- Active if: any award with `expDate > today`

**Verdict logic (strict precedence):**

```
arXiv paper in window        → ACTIVE   (confidence: high,   color: teal)
active NSF grant             → ACTIVE   (confidence: medium, color: amber)
in arXiv DB but no window    → UNCERTAIN(confidence: low,    color: amber)
no signal                    → UNCERTAIN(confidence: low,    color: amber)
```

---

## Master Intelligence Prompt

Each professor receives **one Claude call** that replaces four separate calls (card, seed ideas, email draft, timing). This collapses latency from ~12–20s to ~3–5s per professor.

**Output contract (strict JSON, no markdown wrapping):**

```typescript
{
  current_focus:    string           // 2–3 sentence plain-English summary
  open_questions:   string[3]        // specific active research questions
  why_aligned:      string           // one sentence, grounded in student intent
  best_paper_to_read: {
    title: string                    // must exist in provided papers
    why:   string
  }
  seed_ideas: Array<{
    title:                  string
    question:               string   // single sentence research question
    connection_to_professor:string
    connection_to_student:  string
    difficulty:             "undergrad_suitable"|"masters_suitable"|"phd_level"
  }>                                 // exactly 3
  email_draft: {
    subject:    string               // references specific paper title
    body:       string               // ≤150 words, no "I am reaching out"
    word_count: number
  }
  timing: {
    timing_score:     number         // 0–100
    verdict:          "excellent"|"good"|"caution"|"wait"
    verdict_color:    "teal"|"amber"|"coral"
    primary_reason:   string
    details:          string
    optimal_send_time:string
    next_window:      string|null
    red_flags:        string[]
  }
}
```

Hard constraints enforced in prompt:
- Citations must exist in the provided data — no hallucinated papers
- Email body must not start with "I" and must not contain "reaching out" or "hope this finds you"
- Seed ideas must sit at the intersection of student interest and professor open questions

---

## Outreach Tracker (State Machine)

```
         log email
NONE ──────────────► SENT
                       │
                       │  days_elapsed ≥ threshold
                       ▼
                  FOLLOW_UP_READY
                       │
                       │  follow-up sent
                       ▼
                  FOLLOWED_UP
```

State transitions are time-gated. `GET /api/tracker/status/{id}` returns the current state plus `days_since_sent` and whether `follow_up_ready` is true.

---

## Resume Parsing

`POST /api/resume/parse` accepts `multipart/form-data` with a PDF or plain text file. PDFs are decoded via `PyMuPDF` (`fitz`). The extracted text is sent to Claude with a structured prompt that outputs:

```typescript
{
  student_background:  string    // dense 2-3 sentence technical summary
  research_interests:  string    // 1-2 sentences on stated/implied interests
  skills_list:         string[]  // key technical skills extracted
  education_level:     string    // "undergrad" | "masters" | "phd_applicant"
  suggested_query:     string    // auto-fills the search form
}
```

---

## API Reference

| Method   | Endpoint                                      | Description                              |
|----------|-----------------------------------------------|------------------------------------------|
| `POST`   | `/api/search`                                 | Full pipeline — returns ranked professors|
| `POST`   | `/api/professor/deep`                         | Deep dive on a single professor          |
| `POST`   | `/api/professor/private-signal`               | Submit private signal (text discarded)   |
| `DELETE` | `/api/professor/private-signal/{professor_id}`| Remove private signal embedding          |
| `GET`    | `/api/professor/signal-status/{professor_id}` | Check signal presence                    |
| `POST`   | `/api/resume/parse`                           | Parse PDF/text resume                    |
| `POST`   | `/api/tracker/log`                            | Record email sent                        |
| `GET`    | `/api/tracker/status/{professor_id}`          | Get follow-up state                      |
| `POST`   | `/api/tracker/update/{professor_id}`          | Advance tracker state                    |
| `GET`    | `/health`                                     | Process health check                     |

---

## Stack

| Layer              | Technology                                           |
|--------------------|------------------------------------------------------|
| Frontend           | Next.js 14 (App Router), TypeScript, Tailwind CSS    |
| Backend            | FastAPI, Python 3.11+, asyncio                       |
| LLM                | claude-sonnet-4-20250514 (Anthropic)                          |
| Embeddings         | all-MiniLM-L6-v2 · sentence-transformers · CPU       |
| Live Retrieval     | Linkup API                                           |
| Paper Verification | arXiv API (arxiv Python SDK)                         |
| Grant Verification | NSF Awards API (public, no key required)             |
| Privacy            | Gaussian mechanism · ε-differential privacy          |
| Resume Parsing     | PyMuPDF (fitz)                                       |

---

## Project Structure

```
├── backend/
│   ├── main.py                        # FastAPI app, CORS, PrivacyMiddleware
│   ├── requirements.txt
│   ├── routes/
│   │   ├── search.py                  # 5-stage search pipeline
│   │   ├── professor.py               # Deep dive + private signal endpoints
│   │   ├── resume.py                  # PDF/text parsing
│   │   └── tracker.py                 # Outreach state machine
│   └── services/
│       ├── claude_service.py          # All Claude prompts; master intelligence call
│       ├── embedding_service.py       # all-MiniLM-L6-v2 · cosine similarity · ranking
│       ├── linkup_service.py          # Linkup API integration
│       ├── verification_service.py    # arXiv + NSF parallel verification
│       └── private_matching_service.py# Gaussian DP · 3-tier composite scoring
│
└── frontend/
    ├── app/
    │   ├── page.tsx                   # Search form + resume upload
    │   ├── results/page.tsx           # Ranked results + pipeline progress
    │   ├── professor/[id]/page.tsx    # 6-tab professor detail view
    │   ├── shortlist/page.tsx         # Saved professors
    │   ├── compare/page.tsx           # Side-by-side comparison
    │   ├── professor-portal/page.tsx  # Private signal submission
    │   └── methodology/page.tsx       # Pipeline documentation
    ├── components/
    ├── lib/
    │   ├── api.ts                     # Backend client
    │   ├── types.ts                   # Shared TypeScript interfaces
    │   ├── mergeSearch.ts             # Result deduplication logic
    │   └── searchSession.ts           # Client-side session state
    └── tailwind.config.ts
```

---

## Running Locally

**Backend**
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --port 8000 --reload
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

**Environment — `backend/.env`**
```
ANTHROPIC_API_KEY=
LINKUP_API_KEY=
```

NSF Awards API requires no key. arXiv API requires no key. Embeddings run locally with no API dependency.

---

## Concurrency Model

All I/O-bound operations run under `asyncio.gather()`:

| Parallel group                   | Operations                                        |
|----------------------------------|---------------------------------------------------|
| Live retrieval                   | 2 Linkup queries fire simultaneously              |
| Per-professor verification       | arXiv check + NSF check per professor             |
| Embedding computation            | All professor embeddings scored concurrently      |
| Deep dive (3 waves)              | Data fetch → analysis → synthesis                 |
| Master prompt                    | 1 Claude call replaces 4 (card + seeds + email + timing) |
