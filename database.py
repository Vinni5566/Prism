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
    career_history      TEXT,          -- JSON list of {title, company, start, end, description}
    education           TEXT,          -- JSON list
    domain              TEXT,
    last_active         TEXT,          -- ISO date string
    profile_completeness REAL DEFAULT 0,
    activity_score      REAL DEFAULT 0,
    raw_data            TEXT,          -- full original row as JSON
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
            last_active, profile_completeness, activity_score, raw_data
        ) VALUES (
            :id, :name, :email, :phone, :location,
            :current_title, :current_company, :years_experience,
            :skills, :career_history, :education, :domain,
            :last_active, :profile_completeness, :activity_score, :raw_data
        )
        ON CONFLICT(id) DO UPDATE SET
            name=excluded.name,
            current_title=excluded.current_title,
            current_company=excluded.current_company,
            skills=excluded.skills,
            career_history=excluded.career_history,
            last_active=excluded.last_active,
            profile_completeness=excluded.profile_completeness,
            activity_score=excluded.activity_score,
            raw_data=excluded.raw_data
    """
    row = {k: (json.dumps(v) if isinstance(v, (list, dict)) else v)
           for k, v in candidate.items()}
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
    for field in ("skills", "career_history", "education", "raw_data"):
        if isinstance(row.get(field), str):
            row[field] = _safe_json(row[field])
    return row
