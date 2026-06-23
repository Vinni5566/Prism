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
from datetime import datetime, date
from typing import Any, Dict, List

import pandas as pd

from config import DATASET_PATH
from database import init_db, upsert_candidate, count_candidates
from embedder import embed_batch, build_candidate_profile_text
from vector_store import add_candidates, count as vcount


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
        "raw_data":            row.to_dict(),
    }

    # Compute completeness if not provided
    if candidate["profile_completeness"] == 0:
        candidate["profile_completeness"] = _profile_completeness(candidate)

    return candidate


def ingest(dataset_path: str):
    print(f"\n{'='*60}")
    print(f"[Ingest] Starting dataset load: {dataset_path}")
    print(f"{'='*60}\n")

    if not os.path.exists(dataset_path):
        print(f"[Ingest] ERROR — file not found: {dataset_path}")
        print("[Ingest] Place your dataset CSV at data/candidates.csv")
        sys.exit(1)

    # ── Init DB ──────────────────────────────────────────────────────────────
    init_db()

    # ── Load CSV ─────────────────────────────────────────────────────────────
    df = pd.read_csv(dataset_path, dtype=str)
    df = df.where(pd.notna(df), None)
    print(f"[Ingest] Loaded {len(df)} rows, columns: {list(df.columns)}\n")

    # ── Parse candidates ─────────────────────────────────────────────────────
    candidates = []
    for idx, row in df.iterrows():
        try:
            c = normalise_row(row, idx)
            candidates.append(c)
        except Exception as e:
            print(f"[Ingest] Warning — row {idx} failed: {e}")

    print(f"[Ingest] Parsed {len(candidates)} candidates successfully.\n")

    # ── Insert into SQLite ───────────────────────────────────────────────────
    print("[Ingest] Writing to SQLite …")
    for c in candidates:
        upsert_candidate(c)
    print(f"[Ingest] SQLite now has {count_candidates()} candidates.\n")

    # ── Generate embeddings ──────────────────────────────────────────────────
    print("[Ingest] Generating embeddings (this may take a few minutes) …")
    profile_texts = [build_candidate_profile_text(c) for c in candidates]
    vectors = embed_batch(profile_texts)

    # ── Store in ChromaDB ────────────────────────────────────────────────────
    print("\n[Ingest] Storing vectors in ChromaDB …")
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
    print("[Ingest] ✅ Complete! Backend is ready to rank candidates.")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Ingest candidate dataset")
    parser.add_argument(
        "--dataset",
        default=DATASET_PATH,
        help="Path to candidates CSV file",
    )
    args = parser.parse_args()
    ingest(args.dataset)
