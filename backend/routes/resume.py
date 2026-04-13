"""
resume.py — Resume upload and parsing endpoint.
Extracts text from PDF or plain text, then uses Claude to structure
research-relevant fields for pre-filling the search form.
"""

import io
from fastapi import APIRouter, HTTPException, UploadFile, File
from services.claude_service import claude_json

router = APIRouter()

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract plain text from a PDF using PyMuPDF."""
    import fitz  # PyMuPDF
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    text = "".join(page.get_text() for page in doc)
    doc.close()
    return text.strip()


@router.post("/resume/parse")
async def parse_resume(file: UploadFile = File(...)):
    """Parse an uploaded resume (PDF or plain text) and extract research-relevant fields."""
    contents = await file.read()

    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 5 MB.")

    if file.filename and file.filename.lower().endswith(".pdf"):
        raw_text = extract_text_from_pdf(contents)
    else:
        raw_text = contents.decode("utf-8", errors="ignore")

    if not raw_text or len(raw_text) < 50:
        raise HTTPException(status_code=422, detail="Could not extract meaningful text from the uploaded file.")

    prompt = f"""Extract research-relevant information from this resume/CV. Be concise and focused.

Resume text:
{raw_text[:4000]}

Return JSON exactly (no other text):
{{
  "student_background": "A dense 2-3 sentence summary of the student's technical skills, research experience, coursework, and tools. Optimized for matching against professor research profiles. Include programming languages, frameworks, specific methods, and domain expertise.",
  "research_interests": "1-2 sentences about their stated or implied research interests based on projects, thesis, papers, or coursework focus areas.",
  "skills_list": ["key technical skills extracted"],
  "education_level": "undergrad | masters | phd_applicant",
  "suggested_query": "A natural language research interest query (1-2 sentences) that would work well as a search input for finding matching professors, based on their resume content."
}}"""

    return await claude_json(prompt, max_tokens=1024)
