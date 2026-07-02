"""
database.py — SQLite layer using SQLAlchemy core (no ORM overhead).
Single file. All DB logic lives here.
"""

import json
import sqlite3
from contextlib import contextmanager
from datetime import datetime
from typing import Any, Dict, List, Optional

from config import DB_PATH
import os

os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)


# ── Schema DDL ────────────────────────────────────────────────────────────────

SCHEMA = """
CREATE TABLE IF NOT EXISTS candidates (
    id                  TEXT PRIMARY KEY,
    name                TEXT,
    email               TEXT,
    phone               TEXT,
    location            TEXT,
    current_title       TEXT,
    current_company     TEXT,
    years_experience    REAL DEFAULT 0,
    skills              TEXT,          -- JSON list
    career_history      TEXT,          -- JSON list
    education           TEXT,          -- JSON list
    domain              TEXT,
    last_active         TEXT,          -- ISO date string
    profile_completeness REAL DEFAULT 0,
    activity_score      REAL DEFAULT 0,
    raw_data            TEXT,          -- full original row as JSON
    headline            TEXT,
    summary             TEXT,
    country             TEXT,
    current_company_size TEXT,
    current_industry    TEXT,
    certifications      TEXT,          -- JSON list
    languages           TEXT,          -- JSON list
    redrob_signals      TEXT,          -- JSON dict
    intent_score        REAL DEFAULT 0,
    hidden_gem_score    REAL DEFAULT 0,
    max_promotion_velocity REAL DEFAULT 0,
    avg_time_in_role_months REAL DEFAULT 0,
    created_at          TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS auth_users (
    username            TEXT PRIMARY KEY,
    password            TEXT NOT NULL,
    role                TEXT NOT NULL, -- 'recruiter' | 'candidate' | 'admin'
    created_at          TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS jd_runs (
    run_id          TEXT PRIMARY KEY,
    jd_text         TEXT NOT NULL,
    jd_parsed       TEXT,             -- JSON: structured extraction
    weights         TEXT,             -- JSON: weight dict used
    created_at      TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS candidate_scores (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    run_id          TEXT NOT NULL,
    candidate_id    TEXT NOT NULL,
    semantic_score  REAL DEFAULT 0,
    skill_score     REAL DEFAULT 0,
    trajectory_score REAL DEFAULT 0,
    behavioral_score REAL DEFAULT 0,
    domain_score    REAL DEFAULT 0,
    composite_score REAL DEFAULT 0,
    rank_position   INTEGER DEFAULT 0,
    explanation     TEXT,
    outreach_msg    TEXT,
    skill_gap       TEXT,             -- JSON
    created_at      TEXT DEFAULT (datetime('now')),
    UNIQUE(run_id, candidate_id)
);

CREATE TABLE IF NOT EXISTS feedback (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    run_id          TEXT NOT NULL,
    candidate_id    TEXT NOT NULL,
    feedback_type   TEXT,             -- 'not_a_fit' | 'strong_yes' | 'maybe'
    notes           TEXT,
    created_at      TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_scores_run   ON candidate_scores(run_id);
CREATE INDEX IF NOT EXISTS idx_scores_cand  ON candidate_scores(candidate_id);
CREATE INDEX IF NOT EXISTS idx_feedback_run ON feedback(run_id);
"""


@contextmanager
def get_conn():
    """Context manager — always closes connection cleanly."""
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row        # rows behave like dicts
    conn.execute("PRAGMA journal_mode=WAL")   # safe concurrent reads
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db():
    """Create all tables on first run."""
    with get_conn() as conn:
        conn.executescript(SCHEMA)
    print(f"[DB] Initialised at {DB_PATH}")


# ── Candidate operations ───────────────────────────────────────────────────────

def upsert_candidate(candidate: Dict[str, Any]):
    """Insert or replace a candidate record."""
    sql = """
        INSERT INTO candidates (
            id, name, email, phone, location,
            current_title, current_company, years_experience,
            skills, career_history, education, domain,
            last_active, profile_completeness, activity_score, raw_data,
            headline, summary, country, current_company_size, current_industry,
            certifications, languages, redrob_signals,
            intent_score, hidden_gem_score, max_promotion_velocity, avg_time_in_role_months
        ) VALUES (
            :id, :name, :email, :phone, :location,
            :current_title, :current_company, :years_experience,
            :skills, :career_history, :education, :domain,
            :last_active, :profile_completeness, :activity_score, :raw_data,
            :headline, :summary, :country, :current_company_size, :current_industry,
            :certifications, :languages, :redrob_signals,
            :intent_score, :hidden_gem_score, :max_promotion_velocity, :avg_time_in_role_months
        )
        ON CONFLICT(id) DO UPDATE SET
            name=excluded.name,
            current_title=excluded.current_title,
            current_company=excluded.current_company,
            skills=excluded.skills,
            career_history=excluded.career_history,
            education=excluded.education,
            location=excluded.location,
            years_experience=excluded.years_experience,
            last_active=excluded.last_active,
            profile_completeness=excluded.profile_completeness,
            activity_score=excluded.activity_score,
            raw_data=excluded.raw_data,
            headline=excluded.headline,
            summary=excluded.summary,
            country=excluded.country,
            current_company_size=excluded.current_company_size,
            current_industry=excluded.current_industry,
            certifications=excluded.certifications,
            languages=excluded.languages,
            redrob_signals=excluded.redrob_signals,
            intent_score=excluded.intent_score,
            hidden_gem_score=excluded.hidden_gem_score,
            max_promotion_velocity=excluded.max_promotion_velocity,
            avg_time_in_role_months=excluded.avg_time_in_role_months
    """
    row = {
        "id": candidate.get("id"),
        "name": candidate.get("name"),
        "email": candidate.get("email"),
        "phone": candidate.get("phone"),
        "location": candidate.get("location"),
        "current_title": candidate.get("current_title"),
        "current_company": candidate.get("current_company"),
        "years_experience": candidate.get("years_experience"),
        "skills": candidate.get("skills"),
        "career_history": candidate.get("career_history"),
        "education": candidate.get("education"),
        "domain": candidate.get("domain"),
        "last_active": candidate.get("last_active"),
        "profile_completeness": candidate.get("profile_completeness"),
        "activity_score": candidate.get("activity_score"),
        "raw_data": candidate.get("raw_data"),
        "headline": candidate.get("headline", ""),
        "summary": candidate.get("summary", ""),
        "country": candidate.get("country", ""),
        "current_company_size": candidate.get("current_company_size", ""),
        "current_industry": candidate.get("current_industry", ""),
        "certifications": candidate.get("certifications", []),
        "languages": candidate.get("languages", []),
        "redrob_signals": candidate.get("redrob_signals", {}),
        "intent_score": candidate.get("intent_score", 0.0),
        "hidden_gem_score": candidate.get("hidden_gem_score", 0.0),
        "max_promotion_velocity": candidate.get("max_promotion_velocity", 0.0),
        "avg_time_in_role_months": candidate.get("avg_time_in_role_months", 0.0)
    }
    
    # Serialise lists and dicts
    for k, v in row.items():
        if isinstance(v, (list, dict)):
            row[k] = json.dumps(v)

    with get_conn() as conn:
        conn.execute(sql, row)


def get_candidate(candidate_id: str) -> Optional[Dict]:
    with get_conn() as conn:
        row = conn.execute(
            "SELECT * FROM candidates WHERE id = ?", (candidate_id,)
        ).fetchone()
    if not row:
        return None
    return _deserialise(dict(row))


def get_all_candidates(limit: int = 5000) -> List[Dict]:
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT * FROM candidates LIMIT ?", (limit,)
        ).fetchall()
    return [_deserialise(dict(r)) for r in rows]


def count_candidates() -> int:
    with get_conn() as conn:
        return conn.execute("SELECT COUNT(*) FROM candidates").fetchone()[0]


# ── JD run operations ──────────────────────────────────────────────────────────

def save_jd_run(run_id: str, jd_text: str, jd_parsed: Dict, weights: Dict):
    sql = """
        INSERT OR REPLACE INTO jd_runs (run_id, jd_text, jd_parsed, weights)
        VALUES (?, ?, ?, ?)
    """
    with get_conn() as conn:
        conn.execute(sql, (
            run_id, jd_text,
            json.dumps(jd_parsed), json.dumps(weights)
        ))


def get_jd_run(run_id: str) -> Optional[Dict]:
    with get_conn() as conn:
        row = conn.execute(
            "SELECT * FROM jd_runs WHERE run_id = ?", (run_id,)
        ).fetchone()
    if not row:
        return None
    d = dict(row)
    d["jd_parsed"] = json.loads(d["jd_parsed"] or "{}")
    d["weights"]   = json.loads(d["weights"] or "{}")
    return d


# ── Score operations ───────────────────────────────────────────────────────────

def save_score(run_id: str, candidate_id: str, scores: Dict[str, Any]):
    sql = """
        INSERT INTO candidate_scores (
            run_id, candidate_id,
            semantic_score, skill_score, trajectory_score,
            behavioral_score, domain_score, composite_score,
            rank_position, explanation, outreach_msg, skill_gap
        ) VALUES (
            :run_id, :candidate_id,
            :semantic_score, :skill_score, :trajectory_score,
            :behavioral_score, :domain_score, :composite_score,
            :rank_position, :explanation, :outreach_msg, :skill_gap
        )
        ON CONFLICT(run_id, candidate_id) DO UPDATE SET
            semantic_score=excluded.semantic_score,
            skill_score=excluded.skill_score,
            trajectory_score=excluded.trajectory_score,
            behavioral_score=excluded.behavioral_score,
            domain_score=excluded.domain_score,
            composite_score=excluded.composite_score,
            rank_position=excluded.rank_position,
            explanation=excluded.explanation,
            outreach_msg=excluded.outreach_msg,
            skill_gap=excluded.skill_gap
    """
    row = dict(scores)
    row["run_id"]       = run_id
    row["candidate_id"] = candidate_id
    if isinstance(row.get("skill_gap"), (list, dict)):
        row["skill_gap"] = json.dumps(row["skill_gap"])
    with get_conn() as conn:
        conn.execute(sql, row)


def get_ranked_results(run_id: str) -> List[Dict]:
    sql = """
        SELECT cs.*, c.name, c.current_title, c.current_company,
               c.years_experience, c.skills, c.domain, c.location
        FROM candidate_scores cs
        JOIN candidates c ON cs.candidate_id = c.id
        WHERE cs.run_id = ?
        ORDER BY cs.rank_position ASC
    """
    with get_conn() as conn:
        rows = conn.execute(sql, (run_id,)).fetchall()
    results = []
    for r in rows:
        d = dict(r)
        d["skills"]    = _safe_json(d.get("skills"))
        d["skill_gap"] = _safe_json(d.get("skill_gap"))
        results.append(d)
    return results


# ── Feedback operations ────────────────────────────────────────────────────────

def save_feedback(run_id: str, candidate_id: str,
                  feedback_type: str, notes: str = ""):
    sql = """
        INSERT INTO feedback (run_id, candidate_id, feedback_type, notes)
        VALUES (?, ?, ?, ?)
    """
    with get_conn() as conn:
        conn.execute(sql, (run_id, candidate_id, feedback_type, notes))


def get_rejected_candidates(run_id: str) -> List[str]:
    """Return candidate IDs marked 'not_a_fit' for a given run."""
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT candidate_id FROM feedback WHERE run_id=? AND feedback_type='not_a_fit'",
            (run_id,)
        ).fetchall()
    return [r[0] for r in rows]


# ── Helpers ────────────────────────────────────────────────────────────────────

def _safe_json(val):
    if val is None:
        return []
    if isinstance(val, (list, dict)):
        return val
    try:
        return json.loads(val)
    except Exception:
        return val


def _deserialise(row: Dict) -> Dict:
    """Parse JSON string fields back into Python objects."""
    for field in ("skills", "career_history", "education", "raw_data", "certifications", "languages", "redrob_signals"):
        if isinstance(row.get(field), str):
            row[field] = _safe_json(row[field])
    return row


# ── Auth operations ───────────────────────────────────────────────────────────

def save_user(username: str, password_hash: str, role: str):
    sql = """
        INSERT INTO auth_users (username, password, role)
        VALUES (?, ?, ?)
        ON CONFLICT(username) DO UPDATE SET
            password=excluded.password,
            role=excluded.role
    """
    with get_conn() as conn:
        conn.execute(sql, (username, password_hash, role))


def get_user(username: str) -> Optional[Dict]:
    with get_conn() as conn:
        row = conn.execute(
            "SELECT * FROM auth_users WHERE username = ?", (username,)
        ).fetchone()
    if not row:
        return None
    return dict(row)


# ── Analytics & run-listing operations ────────────────────────────────────────

def list_jd_runs(limit: int = 50) -> List[Dict]:
    """Return the most recent JD runs (descending by creation time)."""
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT run_id, jd_text, jd_parsed, weights, created_at FROM jd_runs ORDER BY created_at DESC LIMIT ?",
            (limit,)
        ).fetchall()
    results = []
    for r in rows:
        d = dict(r)
        d["jd_parsed"] = _safe_json(d.get("jd_parsed") or "{}")
        d["weights"]   = _safe_json(d.get("weights") or "{}")
        # Truncate jd_text for listing
        d["jd_preview"] = (d["jd_text"] or "")[:200]
        results.append(d)
    return results


def clear_all_runs():
    """Delete all records from jd_runs and candidate_scores."""
    with get_conn() as conn:
        conn.execute("DELETE FROM jd_runs")
        conn.execute("DELETE FROM candidate_scores")


def get_analytics() -> Dict:
    """Aggregate pool-level analytics for the dashboard."""
    with get_conn() as conn:
        total = conn.execute("SELECT COUNT(*) FROM candidates").fetchone()[0]

        # Domain distribution
        domain_rows = conn.execute(
            "SELECT domain, COUNT(*) as cnt FROM candidates WHERE domain != '' GROUP BY domain ORDER BY cnt DESC LIMIT 15"
        ).fetchall()

        # Avg experience
        avg_exp = conn.execute(
            "SELECT AVG(years_experience) FROM candidates WHERE years_experience > 0"
        ).fetchone()[0] or 0

        # Top skills (aggregate across all candidates)
        skill_rows = conn.execute(
            "SELECT skills FROM candidates WHERE skills IS NOT NULL AND skills != '[]'"
        ).fetchall()

        # Score stats from most recent run
        score_row = conn.execute("""
            SELECT
                AVG(composite_score) as avg_score,
                MAX(composite_score) as max_score,
                MIN(composite_score) as min_score,
                COUNT(DISTINCT run_id) as total_runs
            FROM candidate_scores
        """).fetchone()

        # Recent runs summary
        run_rows = conn.execute("""
            SELECT run_id, created_at,
                   COUNT(*) as candidates_evaluated,
                   MAX(composite_score) as top_score
            FROM candidate_scores
            GROUP BY run_id
            ORDER BY created_at DESC
            LIMIT 10
        """).fetchall()

    # Process top skills
    from collections import Counter
    skill_counter: Counter = Counter()
    for row in skill_rows:
        skills = _safe_json(row[0])
        if isinstance(skills, list):
            for s in skills:
                if isinstance(s, str) and s.strip():
                    skill_counter[s.strip()] += 1

    top_skills = [{"skill": s, "count": c} for s, c in skill_counter.most_common(20)]

    return {
        "total_candidates": total,
        "avg_experience_years": round(avg_exp, 1),
        "domain_distribution": [{"domain": r[0] or "Unknown", "count": r[1]} for r in domain_rows],
        "top_skills": top_skills,
        "score_stats": {
            "avg":        round(float(score_row[0] or 0) * 100, 1),
            "max":        round(float(score_row[1] or 0) * 100, 1),
            "min":        round(float(score_row[2] or 0) * 100, 1),
            "total_runs": int(score_row[3] or 0),
        },
        "recent_runs": [
            {
                "run_id":               r[0],
                "created_at":           r[1],
                "candidates_evaluated": r[2],
                "top_score":            round(float(r[3] or 0) * 100, 1),
            }
            for r in run_rows
        ],
    }

