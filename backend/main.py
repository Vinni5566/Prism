"""
main.py — FastAPI application entry point.
All API routes live here. Business logic lives in ranker.py and other modules.

Run with:
    uvicorn main:app --reload --port 8000
"""

import csv
import io
import uuid
from typing import Dict, List, Optional

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from config import CORS_ORIGINS, DEFAULT_WEIGHTS
from database import (
    init_db, count_candidates,
    get_candidate, get_all_candidates,
    get_ranked_results, save_feedback, get_jd_run,
)
from vector_store import count as vcount
from ranker import rank_candidates

# ── App setup ──────────────────────────────────────────────────────────────────
app = FastAPI(
    title="AI Recruiter API",
    description="Intelligent candidate ranking engine powered by NVIDIA NIM + semantic search.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Init DB on startup ─────────────────────────────────────────────────────────
@app.on_event("startup")
def on_startup():
    init_db()
    print("[API] Database initialised.")


# ── Pydantic request/response models ──────────────────────────────────────────

class WeightsModel(BaseModel):
    semantic:   float = Field(default=0.30, ge=0, le=1)
    skill:      float = Field(default=0.25, ge=0, le=1)
    trajectory: float = Field(default=0.20, ge=0, le=1)
    behavioral: float = Field(default=0.15, ge=0, le=1)
    domain:     float = Field(default=0.10, ge=0, le=1)


class RankRequest(BaseModel):
    jd_text:         str  = Field(..., min_length=50, description="Full job description text")
    weights:         Optional[WeightsModel] = None
    run_id:          Optional[str] = None
    previous_run_id: Optional[str] = None


class FeedbackRequest(BaseModel):
    run_id:        str
    candidate_id:  str
    feedback_type: str = Field(..., pattern="^(not_a_fit|strong_yes|maybe)$")
    notes:         Optional[str] = ""


# ── Routes ─────────────────────────────────────────────────────────────────────

@app.get("/health")
def health_check():
    """Server status — frontend polls this on startup."""
    try:
        candidate_count = count_candidates()
        vector_count    = vcount()
        return {
            "status":          "ok",
            "candidates_in_db":     candidate_count,
            "vectors_in_store":     vector_count,
            "model":           "NVIDIA NIM / LLaMA-3.1-70B",
            "embedding_model": "all-MiniLM-L6-v2",
        }
    except Exception as e:
        return {"status": "error", "detail": str(e)}


@app.post("/rank")
async def rank(request: RankRequest):
    """
    Main endpoint — receives a JD and returns a ranked candidate shortlist.

    Body:
        jd_text:    full job description (required)
        weights:    optional custom scoring weights
        run_id:     optional, auto-generated if not provided
        previous_run_id: optional, to exclude 'not_a_fit' candidates from a prior run
    """
    if not request.jd_text.strip():
        raise HTTPException(status_code=400, detail="jd_text cannot be empty.")

    weights_dict = (
        request.weights.model_dump() if request.weights
        else DEFAULT_WEIGHTS
    )

    try:
        result = await rank_candidates(
            jd_text         = request.jd_text,
            weights         = weights_dict,
            run_id          = request.run_id or str(uuid.uuid4()),
            previous_run_id = request.previous_run_id,
        )
        return result
    except Exception as e:
        print(f"[API] /rank error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/candidates")
def list_candidates(limit: int = 100, offset: int = 0):
    """Return all candidates (paginated). Used by frontend to show full pool."""
    try:
        all_cands = get_all_candidates(limit=limit + offset)
        page      = all_cands[offset: offset + limit]
        return {
            "total":      count_candidates(),
            "offset":     offset,
            "limit":      limit,
            "candidates": page,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/candidates/{candidate_id}")
def get_one_candidate(candidate_id: str):
    """Full profile for a single candidate. Used when recruiter expands a card."""
    cand = get_candidate(candidate_id)
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate not found.")
    return cand


@app.get("/runs/{run_id}")
def get_run(run_id: str):
    """Return metadata for a ranking run (JD, weights, parsed JD)."""
    run = get_jd_run(run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found.")
    return run


@app.get("/runs/{run_id}/results")
def get_results(run_id: str):
    """Return the ranked results for a completed run (from DB cache)."""
    results = get_ranked_results(run_id)
    if not results:
        raise HTTPException(status_code=404, detail="No results found for this run_id.")
    return {"run_id": run_id, "results": results}


@app.post("/feedback")
def submit_feedback(request: FeedbackRequest):
    """
    Recruiter marks a candidate as 'not_a_fit', 'strong_yes', or 'maybe'.
    Pass the run_id as previous_run_id in a subsequent /rank call to apply.
    """
    try:
        save_feedback(
            run_id       = request.run_id,
            candidate_id = request.candidate_id,
            feedback_type= request.feedback_type,
            notes        = request.notes or "",
        )
        return {"status": "saved", "feedback_type": request.feedback_type}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/export/{run_id}")
def export_csv(run_id: str):
    """
    Download ranked results as CSV in submission format.
    Columns: rank, candidate_id, name, composite_score, explanation,
             semantic, skill, trajectory, behavioral, domain
    """
    results = get_ranked_results(run_id)
    if not results:
        raise HTTPException(status_code=404, detail="No results for this run_id.")

    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=[
        "rank", "candidate_id", "name", "current_title", "current_company",
        "composite_score", "semantic_score", "skill_score",
        "trajectory_score", "behavioral_score", "domain_score",
        "explanation",
    ])
    writer.writeheader()
    for r in results:
        writer.writerow({
            "rank":             r.get("rank_position", ""),
            "candidate_id":     r.get("candidate_id", ""),
            "name":             r.get("name", ""),
            "current_title":    r.get("current_title", ""),
            "current_company":  r.get("current_company", ""),
            "composite_score":  r.get("composite_score", ""),
            "semantic_score":   r.get("semantic_score", ""),
            "skill_score":      r.get("skill_score", ""),
            "trajectory_score": r.get("trajectory_score", ""),
            "behavioral_score": r.get("behavioral_score", ""),
            "domain_score":     r.get("domain_score", ""),
            "explanation":      r.get("explanation", ""),
        })

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=ranked_{run_id[:8]}.csv"},
    )


@app.get("/stats")
def stats():
    """Quick stats for the dashboard header."""
    return {
        "total_candidates": count_candidates(),
        "vectors_indexed":  vcount(),
    }
