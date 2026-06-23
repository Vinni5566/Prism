"""
models.py — All Pydantic models (request bodies, response shapes, internal types).
Centralised here so main.py and ranker.py import from one place.
"""

from __future__ import annotations
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


# ── Request models ─────────────────────────────────────────────────────────────

class WeightsInput(BaseModel):
    """Custom scoring weights from the recruiter's sliders."""
    semantic:   float = Field(default=0.30, ge=0.0, le=1.0)
    skill:      float = Field(default=0.25, ge=0.0, le=1.0)
    trajectory: float = Field(default=0.20, ge=0.0, le=1.0)
    behavioral: float = Field(default=0.15, ge=0.0, le=1.0)
    domain:     float = Field(default=0.10, ge=0.0, le=1.0)

    def to_dict(self) -> Dict[str, float]:
        return self.model_dump()


class RankRequest(BaseModel):
    """POST /rank — main ranking request."""
    jd_text:         str            = Field(..., min_length=50,
                                            description="Full job description text")
    weights:         Optional[WeightsInput] = None
    run_id:          Optional[str]  = None
    previous_run_id: Optional[str]  = None
    top_n:           int            = Field(default=20, ge=1, le=100)


class FeedbackRequest(BaseModel):
    """POST /feedback — recruiter signals on a candidate."""
    run_id:        str
    candidate_id:  str
    feedback_type: str = Field(..., pattern="^(not_a_fit|strong_yes|maybe)$")
    notes:         Optional[str] = ""


class ReRankRequest(BaseModel):
    """POST /rerank — apply feedback and re-rank a previous run."""
    run_id:          str
    feedback_map:    Dict[str, str]   # {candidate_id: feedback_type}


# ── Internal data types ────────────────────────────────────────────────────────

class SkillGapItem(BaseModel):
    skill:       str
    required:    bool
    match_level: float        # 0=missing, 0.5=partial, 1=full
    evidence:    int          # how many roles/projects back this skill
    credibility: float
    status:      str          # "full" | "partial" | "missing"


class ScoreBreakdown(BaseModel):
    semantic:   float
    skill:      float
    trajectory: float
    behavioral: float
    domain:     float


class CandidateResult(BaseModel):
    """One ranked candidate in the API response."""
    rank:             int
    candidate_id:     str
    name:             str
    current_title:    str
    current_company:  str
    location:         str
    years_experience: float
    skills:           List[str]
    domain:           str
    composite_score:  float
    score_breakdown:  ScoreBreakdown
    skill_gap:        List[SkillGapItem]
    explanation:      Optional[str] = ""
    outreach_msg:     Optional[str] = ""
    feedback_tag:     Optional[str] = ""


class JDParsed(BaseModel):
    """Structured output from the JD parser."""
    job_title:              str
    seniority_level:        str
    domain:                 str
    required_skills:        List[str]
    preferred_skills:       List[str]
    years_experience_min:   int
    years_experience_max:   int
    key_responsibilities:   List[str]
    deal_breakers:          List[str]
    soft_skills:            List[str]
    education_requirement:  str
    remote_friendly:        Optional[bool]
    suggested_weight_bias:  str
    domain_keywords:        List[str]


class RankResponse(BaseModel):
    """Response from POST /rank."""
    run_id:                     str
    jd_parsed:                  Dict[str, Any]
    weights:                    Dict[str, float]
    total_candidates_evaluated: int
    results:                    List[Dict[str, Any]]


# ── Candidate DB model ─────────────────────────────────────────────────────────

class CareerEntry(BaseModel):
    title:          Optional[str] = ""
    company:        Optional[str] = ""
    start_date:     Optional[str] = ""
    end_date:       Optional[str] = ""
    description:    Optional[str] = ""
    duration_years: Optional[float] = None


class EducationEntry(BaseModel):
    degree: Optional[str] = ""
    field:  Optional[str] = ""
    school: Optional[str] = ""
    year:   Optional[int] = None


class CandidateProfile(BaseModel):
    """Full candidate profile as stored in SQLite."""
    id:                   str
    name:                 str
    email:                Optional[str] = ""
    phone:                Optional[str] = ""
    location:             Optional[str] = ""
    current_title:        Optional[str] = ""
    current_company:      Optional[str] = ""
    years_experience:     float = 0
    skills:               List[str] = []
    career_history:       List[Dict] = []
    education:            List[Dict] = []
    domain:               Optional[str] = ""
    last_active:          Optional[str] = ""
    profile_completeness: float = 0
    activity_score:       float = 0
