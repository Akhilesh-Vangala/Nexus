"""
main.py — FastAPI application entry point.
CORS, privacy middleware, route mounting.
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from routes.search import router as search_router
from routes.professor import router as professor_router
from routes.tracker import router as tracker_router
from routes.resume import router as resume_router

app = FastAPI(
    title="Nexus API",
    description="AI-powered research alignment engine",
    version="1.0.0"
)

# Parse allowed origins from env — comma-separated list.
# In production, set ALLOWED_ORIGINS to the deployed frontend URL.
_raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:3001")
ALLOWED_ORIGINS = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Privacy middleware — prevents logging of private signal endpoint body
class PrivacyMiddleware(BaseHTTPMiddleware):
    PRIVATE_ENDPOINTS = {"/api/professor/private-signal"}

    async def dispatch(self, request: Request, call_next):
        if request.url.path in self.PRIVATE_ENDPOINTS:
            response = await call_next(request)
            return response
        return await call_next(request)

app.add_middleware(PrivacyMiddleware)

# Mount routes
app.include_router(search_router, prefix="/api")
app.include_router(professor_router, prefix="/api")
app.include_router(tracker_router, prefix="/api")
app.include_router(resume_router, prefix="/api")


@app.get("/")
async def root():
    return {
        "name": "Nexus API",
        "version": "1.0.0",
        "description": "AI-powered research alignment engine",
        "endpoints": [
            "POST /api/search",
            "POST /api/professor/deep",
            "POST /api/professor/private-signal",
            "DELETE /api/professor/private-signal/{professor_id}",
            "GET /api/professor/signal-status/{professor_id}",
            "POST /api/tracker/log",
            "GET /api/tracker/status/{professor_id}",
        ]
    }


@app.get("/health")
async def health():
    return {"status": "ok"}
