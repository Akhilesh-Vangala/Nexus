# Nexus

LabLens hackathon project workspace.

## What LabLens does (six steps)

1. **Student describes their interests** — in plain language, and picks a university (and level: undergrad, master’s, PhD applicant, etc.).
2. **Turn that into a structured search profile** — topics, keywords, and a short summary we can compare against real research text.
3. **Use Linkup to search the live web** — find real professors at that school and gather real evidence: faculty pages, papers, abstracts, lab sites, and related signals.
4. **Score research fit with ML** — embed the student summary and each professor’s research text as vectors and measure similarity (cosine similarity). That produces an alignment score judges can inspect.
5. **Rank and filter the list** — keep strong matches, drop weak or thin results, and apply simple checks so people look plausibly active at that institution.
6. **Generate grounded next steps** — short explanations, seed project ideas, and a draft outreach email **only from retrieved evidence**, not invented citations.

**In one sentence:** we pull real professors and real research from the web (via Linkup), compute semantic similarity between their work and the student’s interests, then produce personalized, evidence-backed suggestions.

## Prompts

Cursor / agent build instructions live in [`prompt/LABLENS_CURSOR_BUILD_PROMPT.md`](prompt/LABLENS_CURSOR_BUILD_PROMPT.md) (LabLens — full stack spec, ML pipeline, privacy tier, and demo script).
