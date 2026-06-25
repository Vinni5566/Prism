"""
data_ingest.py — Run this ONCE to load the challenge dataset.

Usage (from backend/ folder):
    python data_ingest.py --dataset data/candidates.csv

It will:
  1. Parse every candidate row from the CSV
  2. Insert into SQLite (database.py)
  3. Generate embeddings (embedder.py)
  4. Store vectors in ChromaDB (vector_store.py)

Safe to re-run — uses upsert so no duplicates.
"""

import argparse
import json
import os
import sys
import uuid
import gzip
from datetime import datetime, date
from typing import Any, Dict, List
from collections import defaultdict

import pandas as pd

from config import DATASET_PATH
from database import init_db, upsert_candidate, count_candidates
from embedder import embed_batch, build_candidate_profile_text
from vector_store import add_candidates, count as vcount
from redrob_signals import (
    VerifyProfileIntegrity,
    calculate_career_velocity,
    calculate_intent_score,
    calculate_hidden_gem_score
)


# ── Column name mapping ────────────────────────────────────────────────────────
# Map common dataset column names → our internal field names.
# Adjust the LEFT side to match YOUR actual dataset column headers.
COLUMN_MAP = {
    # identity
    "candidate_id":    "id",
    "id":              "id",
    "ID":              "id",

    "candidate_name":  "name",
    "name":            "name",
    "full_name":       "name",

    "email":           "email",
    "email_address":   "email",

    "phone":           "phone",
    "phone_number":    "phone",

    "location":        "location",
    "city":            "location",

    # role
    "current_title":   "current_title",
    "job_title":       "current_title",
    "title":           "current_title",

    "current_company": "current_company",
    "company":         "current_company",
    "employer":        "current_company",

    "years_experience": "years_experience",
    "experience_years": "years_experience",
    "total_experience": "years_experience",

    # skills
    "skills":          "skills",
    "skill_set":       "skills",
    "technical_skills":"skills",

    # domain / industry
    "domain":          "domain",
    "industry":        "domain",
    "sector":          "domain",

    # activity signals
    "last_active":        "last_active",
    "last_active_date":   "last_active",
    "last_login":         "last_active",
    "profile_completeness": "profile_completeness",
    "completeness":         "profile_completeness",
    "activity_score":       "activity_score",
}


def _safe(val: Any, default=None):
    """Return default if val is NaN/None/empty."""
    if val is None:
        return default
    try:
        if pd.isna(val):
            return default
    except Exception:
        pass
    return val


def _parse_skills(raw: Any) -> List[str]:
    """Accept comma-separated strings, JSON lists, or actual lists."""
    if raw is None or (isinstance(raw, float)):
        return []
    if isinstance(raw, list):
        return [str(s).strip() for s in raw if s]
    s = str(raw).strip()
    if s.startswith("["):
        try:
            return json.loads(s)
        except Exception:
            pass
    return [x.strip() for x in s.split(",") if x.strip()]


def _parse_career_history(row: pd.Series) -> List[Dict]:
    """
    Try to extract career history from the row.
    Dataset may store it as JSON in one column, or spread across multiple columns.
    """
    # Try JSON column first
    for col in ("career_history", "work_history", "experience", "jobs"):
        if col in row.index and _safe(row.get(col)):
            raw = str(row[col])
            if raw.startswith("["):
                try:
                    return json.loads(raw)
                except Exception:
                    pass

    # Fallback: build a single entry from current role columns
    entry = {}
    if _safe(row.get("current_title")):
        entry["title"] = str(row["current_title"])
    if _safe(row.get("current_company")):
        entry["company"] = str(row["current_company"])
    if _safe(row.get("years_experience")):
        try:
            yrs = float(row["years_experience"])
            entry["duration_years"] = yrs
        except Exception:
            pass
    return [entry] if entry else []


def _parse_education(row: pd.Series) -> List[Dict]:
    for col in ("education", "education_history", "qualifications"):
        if col in row.index and _safe(row.get(col)):
            raw = str(row[col])
            if raw.startswith("["):
                try:
                    return json.loads(raw)
                except Exception:
                    pass
            # plain string like "B.Tech Computer Science"
            return [{"degree": raw}]
    return []


def _profile_completeness(candidate: Dict) -> float:
    """Estimate completeness 0-1 based on which fields are populated."""
    fields = ["name", "email", "current_title", "current_company",
              "years_experience", "skills", "career_history",
              "education", "location", "domain"]
    filled = sum(1 for f in fields if candidate.get(f))
    return round(filled / len(fields), 2)


def normalise_row(row: pd.Series, idx: int) -> Dict:
    """Convert one raw dataset row → our internal candidate dict."""
    # Rename columns
    mapped = {}
    for col, val in row.items():
        key = COLUMN_MAP.get(str(col), str(col))
        mapped[key] = val

    candidate_id = str(_safe(mapped.get("id"), f"cand_{idx:06d}"))

    skills         = _parse_skills(_safe(mapped.get("skills")))
    career_history = _parse_career_history(row)
    education      = _parse_education(row)

    candidate = {
        "id":                  candidate_id,
        "name":                str(_safe(mapped.get("name"), f"Candidate {idx}")),
        "email":               str(_safe(mapped.get("email"), "")),
        "phone":               str(_safe(mapped.get("phone"), "")),
        "location":            str(_safe(mapped.get("location"), "")),
        "current_title":       str(_safe(mapped.get("current_title"), "")),
        "current_company":     str(_safe(mapped.get("current_company"), "")),
        "years_experience":    float(_safe(mapped.get("years_experience"), 0) or 0),
        "skills":              skills,
        "career_history":      career_history,
        "education":           education,
        "domain":              str(_safe(mapped.get("domain"), "")),
        "last_active":         str(_safe(mapped.get("last_active"), "")),
        "profile_completeness": float(_safe(mapped.get("profile_completeness"), 0) or 0),
        "activity_score":      float(_safe(mapped.get("activity_score"), 0) or 0),
        "headline":            str(_safe(mapped.get("headline"), "")),
        "summary":             str(_safe(mapped.get("summary"), "")),
        "country":             str(_safe(mapped.get("country"), "")),
        "current_company_size": str(_safe(mapped.get("current_company_size"), "")),
        "current_industry":    str(_safe(mapped.get("current_industry"), "")),
        "raw_data":            row.to_dict(),
    }

    # Compute completeness if not provided
    if candidate["profile_completeness"] == 0:
        candidate["profile_completeness"] = _profile_completeness(candidate)

    return candidate


def _parse_jsonl_candidate(raw: Dict) -> Dict:
    profile = raw.get("profile", {}) or {}
    redrob_signals = raw.get("redrob_signals", {}) or {}
    
    # Map fields
    candidate = {
        "id":                  raw.get("candidate_id"),
        "name":                profile.get("anonymized_name", ""),
        "email":               raw.get("email", ""),
        "phone":               raw.get("phone", ""),
        "location":            profile.get("location", ""),
        "current_title":       profile.get("current_title", ""),
        "current_company":     profile.get("current_company", ""),
        "years_experience":    float(profile.get("years_of_experience", 0) or 0),
        "skills":              raw.get("skills", []), # list of dicts/strings
        "career_history":      raw.get("career_history", []),
        "education":           raw.get("education", []),
        "domain":              profile.get("current_industry", ""),
        "last_active":         redrob_signals.get("last_active_date", ""),
        "profile_completeness": float(redrob_signals.get("profile_completeness_score", 0) or 0) / 100.0,
        "activity_score":      float(redrob_signals.get("github_activity_score", 0) or 0) / 100.0,
        
        # New rich fields
        "headline":            profile.get("headline", ""),
        "summary":             profile.get("summary", ""),
        "country":             profile.get("country", ""),
        "current_company_size": profile.get("current_company_size", ""),
        "current_industry":    profile.get("current_industry", ""),
        "certifications":      raw.get("certifications", []),
        "languages":           raw.get("languages", []),
        "redrob_signals":      redrob_signals,
        "raw_data":            raw,
    }
    return candidate


def ingest(dataset_path: str):
    print(f"\n{'='*60}")
    print(f"[Ingest] Starting dataset load: {dataset_path}")
    print(f"{'='*60}\n")

    if not os.path.exists(dataset_path):
        print(f"[Ingest] ERROR — file not found: {dataset_path}")
        print("[Ingest] Place your dataset at data/candidates.csv or data/candidates.jsonl.gz")
        sys.exit(1)

    # ── Init DB ──────────────────────────────────────────────────────────────
    init_db()

    # ── Verify Profile Integrity class ───────────────────────────────────────
    verifier = VerifyProfileIntegrity()
    
    # ── Pass 1: Compute global skill frequencies ─────────────────────────────
    print("[Ingest] Pass 1 - Computing global skill frequencies...")
    skill_counts = defaultdict(int)
    total_skills = 0
    
    is_jsonl = dataset_path.endswith('.jsonl') or dataset_path.endswith('.jsonl.gz')
    open_func = gzip.open if dataset_path.endswith('.gz') else open

    if is_jsonl:
        with open_func(dataset_path, 'rt', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    raw = json.loads(line)
                    for s in raw.get('skills', []):
                        name = s.get('name') if isinstance(s, dict) else str(s)
                        if name:
                            skill_counts[name.lower()] += 1
                            total_skills += 1
                except Exception:
                    pass
    else:
        df = pd.read_csv(dataset_path, dtype=str)
        df = df.where(pd.notna(df), None)
        for idx, row in df.iterrows():
            try:
                skills = _parse_skills(_safe(row.get("skills")))
                for name in skills:
                    if name:
                        skill_counts[name.lower()] += 1
                        total_skills += 1
            except Exception:
                pass
                
    # Compute global probabilities
    skill_probs = {k: (v / total_skills) if total_skills > 0 else 0.0 for k, v in skill_counts.items()}
    print(f"[Ingest] Pass 1 complete. Found {len(skill_probs)} unique skills.\n")
    sys.stdout.flush()

    # ── Pass 2: Process, Validate & Extract Features ─────────────────────────
    print("[Ingest] Pass 2 - Processing candidates and extracting features...")
    candidates = []
    dropped_count = 0
    
    if is_jsonl:
        with open_func(dataset_path, 'rt', encoding='utf-8') as f:
            for idx, line in enumerate(f):
                line = line.strip()
                if not line:
                    continue
                try:
                    raw = json.loads(line)
                    # Verify integrity
                    if not verifier.is_valid(raw):
                        dropped_count += 1
                        continue
                        
                    c = _parse_jsonl_candidate(raw)
                    # Extract features
                    career_vel = calculate_career_velocity(c['career_history'])
                    c['max_promotion_velocity'] = career_vel.get('max_promotion_velocity', 0.0)
                    c['avg_time_in_role_months'] = career_vel.get('avg_time_in_role_months', 0.0)
                    c['intent_score'] = calculate_intent_score(c['redrob_signals'], c['last_active'])
                    c['hidden_gem_score'] = calculate_hidden_gem_score(c['skills'], skill_probs)
                    
                    candidates.append(c)
                except Exception as e:
                    print(f"[Ingest] Warning — JSONL line {idx} failed: {e}")
    else:
        df = pd.read_csv(dataset_path, dtype=str)
        df = df.where(pd.notna(df), None)
        for idx, row in df.iterrows():
            try:
                c = normalise_row(row, idx)
                # Verify integrity
                if not verifier.is_valid(c):
                    dropped_count += 1
                    continue
                    
                # Extract features (limited in CSV)
                career_vel = calculate_career_velocity(c['career_history'])
                c['max_promotion_velocity'] = career_vel.get('max_promotion_velocity', 0.0)
                c['avg_time_in_role_months'] = career_vel.get('avg_time_in_role_months', 0.0)
                # mock signals
                signals = {
                    "recruiter_response_rate": c.get("activity_score", 0.8),
                    "avg_response_time_hours": 24.0,
                    "last_active_date": c.get("last_active")
                }
                c['intent_score'] = calculate_intent_score(signals, c['last_active'])
                c['hidden_gem_score'] = calculate_hidden_gem_score(c['skills'], skill_probs)
                
                # Check for certifications, languages, redrob_signals in row
                cert_raw = row.get("certifications")
                c['certifications'] = _parse_skills(cert_raw) if cert_raw else []
                lang_raw = row.get("languages")
                c['languages'] = _parse_skills(lang_raw) if lang_raw else []
                
                sig_raw = row.get("redrob_signals")
                if sig_raw and isinstance(sig_raw, str) and sig_raw.strip().startswith("{"):
                    try:
                        c['redrob_signals'] = json.loads(sig_raw)
                    except:
                        c['redrob_signals'] = signals
                else:
                    c['redrob_signals'] = signals
                
                candidates.append(c)
            except Exception as e:
                print(f"[Ingest] Warning — CSV row {idx} failed: {e}")

    print(f"[Ingest] Ingested {len(candidates)} candidates. Dropped {dropped_count} due to integrity checks.\n")
    sys.stdout.flush()

    # ── Insert into SQLite ───────────────────────────────────────────────────
    print("[Ingest] Writing to SQLite...")
    for c in candidates:
        upsert_candidate(c)
    print(f"[Ingest] SQLite now has {count_candidates()} candidates.\n")

    # ── Generate embeddings ──────────────────────────────────────────────────
    print("[Ingest] Generating embeddings (this may take a few minutes)...")
    profile_texts = [build_candidate_profile_text(c) for c in candidates]
    vectors = embed_batch(profile_texts)

    # ── Store in ChromaDB ────────────────────────────────────────────────────
    print("\n[Ingest] Storing vectors in ChromaDB...")
    ids       = [c["id"] for c in candidates]
    metadatas = [
        {
            "name":            c.get("name", ""),
            "current_title":   c.get("current_title", ""),
            "domain":          c.get("domain", ""),
            "years_experience": str(c.get("years_experience", 0)),
        }
        for c in candidates
    ]
    add_candidates(ids, vectors, metadatas, profile_texts)

    print(f"\n[Ingest] Vector store now has {vcount()} entries.")
    print(f"\n{'='*60}")
    print("[Ingest] [DONE] Complete! Backend is ready to rank candidates.")
    print(f"{'='*60}\n")


def get_db_skill_probabilities() -> Dict[str, float]:
    """Retrieve skill probabilities from SQLite candidate data."""
    from database import get_conn, _safe_json
    skill_counts = defaultdict(int)
    total_skills = 0
    with get_conn() as conn:
        rows = conn.execute("SELECT skills FROM candidates WHERE skills IS NOT NULL").fetchall()
    for r in rows:
        skills = _safe_json(r[0])
        if isinstance(skills, list):
            for s in skills:
                name = s.get('name') if isinstance(s, dict) else str(s)
                if name:
                    skill_counts[name.lower()] += 1
                    total_skills += 1
    probs = {k: (v / total_skills) if total_skills > 0 else 0.0 for k, v in skill_counts.items()}
    return probs


def ingest_single_candidate(cand: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validates and processes a single candidate dictionary.
    Computes scores, writes to SQLite, embeds, and stores in ChromaDB.
    """
    # 1. Ensure it has a unique ID
    if not cand.get("id"):
        cand["id"] = f"cand_{uuid.uuid4().hex[:10]}"

    # 2. Check profile integrity
    verifier = VerifyProfileIntegrity()
    if not verifier.is_valid(cand):
        raise ValueError("Candidate profile failed integrity verification (banned company, profile inflation, etc.).")

    # 3. Calculate career velocity
    career_vel = calculate_career_velocity(cand.get("career_history", []))
    cand['max_promotion_velocity'] = career_vel.get('max_promotion_velocity', 0.0)
    cand['avg_time_in_role_months'] = career_vel.get('avg_time_in_role_months', 0.0)

    # 4. Intent signals
    if not cand.get("last_active"):
        cand["last_active"] = datetime.utcnow().strftime('%Y-%m-%d')
    if not cand.get("activity_score"):
        cand["activity_score"] = 1.0

    signals = cand.get("redrob_signals") or {}
    if not signals:
        signals = {
            "recruiter_response_rate": 1.0,
            "avg_response_time_hours": 12.0,
            "last_active_date": cand["last_active"]
        }
        cand["redrob_signals"] = signals

    cand['intent_score'] = calculate_intent_score(signals, cand['last_active'])

    # 5. Hidden gem score
    skill_probs = get_db_skill_probabilities()
    cand['hidden_gem_score'] = calculate_hidden_gem_score(cand.get('skills', []), skill_probs)

    # 6. SQLite write
    upsert_candidate(cand)

    # 7. Embedding generation
    profile_text = build_candidate_profile_text(cand)
    vector = embed_batch([profile_text])[0]

    # 8. ChromaDB write
    metadata = {
        "name":            cand.get("name", ""),
        "current_title":   cand.get("current_title", ""),
        "domain":          cand.get("domain", ""),
        "years_experience": str(cand.get("years_experience", 0)),
    }
    add_candidates([cand["id"]], [vector], [metadata], [profile_text])

    return cand


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Ingest candidate dataset")
    parser.add_argument(
        "--dataset",
        default=DATASET_PATH,
        help="Path to candidates CSV or JSONL file",
    )
    args = parser.parse_args()
    ingest(args.dataset)
