"""
utils.py — Shared utility functions used across all backend modules.

Keeps helper logic DRY — one place to change date parsing,
text cleaning, normalisation, etc.
"""

import json
import re
import uuid
from datetime import datetime, date
from typing import Any, Dict, List, Optional, Union


# ── ID generation ──────────────────────────────────────────────────────────────

def new_run_id() -> str:
    """Generate a unique run ID (short UUID)."""
    return str(uuid.uuid4())


# ── Text helpers ───────────────────────────────────────────────────────────────

def clean_text(text: str) -> str:
    """Remove excessive whitespace and non-printable chars."""
    if not text:
        return ""
    text = re.sub(r"[^\x20-\x7E\n]", " ", str(text))   # keep printable ASCII
    text = re.sub(r"\s{3,}", "  ", text)                 # collapse whitespace
    return text.strip()


def truncate(text: str, max_chars: int = 500) -> str:
    """Truncate text to max_chars, ending cleanly at a word boundary."""
    if not text or len(text) <= max_chars:
        return text
    truncated = text[:max_chars]
    last_space = truncated.rfind(" ")
    return (truncated[:last_space] if last_space > 0 else truncated) + "…"


def skill_normalise(skill: str) -> str:
    """Lowercase + strip punctuation for consistent skill matching."""
    return re.sub(r"[^a-z0-9\s\+\#]", "", skill.lower().strip())


def skills_to_list(raw: Any) -> List[str]:
    """Accept comma-string, JSON list, or actual list → clean list of strings."""
    if raw is None:
        return []
    if isinstance(raw, list):
        return [str(s).strip() for s in raw if s]
    raw = str(raw).strip()
    if raw.startswith("["):
        try:
            return [str(s).strip() for s in json.loads(raw) if s]
        except Exception:
            pass
    return [s.strip() for s in raw.split(",") if s.strip()]


# ── Date helpers ───────────────────────────────────────────────────────────────

DATE_FORMATS = [
    "%Y-%m-%d", "%Y/%m/%d", "%d/%m/%Y", "%m/%d/%Y",
    "%Y-%m", "%m/%Y",
    "%b %Y", "%B %Y",
    "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d %H:%M:%S",
    "%Y",
]

def parse_date(raw: str) -> Optional[date]:
    """Try multiple date formats, return date or None."""
    if not raw:
        return None
    raw = str(raw).strip()
    if raw.lower() in ("present", "current", "now", "ongoing", ""):
        return date.today()
    for fmt in DATE_FORMATS:
        try:
            return datetime.strptime(raw, fmt).date()
        except ValueError:
            continue
    # Last resort: extract 4-digit year
    match = re.search(r"\b(19|20)\d{2}\b", raw)
    if match:
        return date(int(match.group()), 1, 1)
    return None


def days_since(date_str: str) -> Optional[int]:
    """Return number of days since a date string."""
    d = parse_date(date_str)
    if d is None:
        return None
    return (date.today() - d).days


def years_between(start_str: str, end_str: str) -> float:
    """Return decimal years between two date strings."""
    start = parse_date(start_str) or date.today()
    end   = parse_date(end_str)   or date.today()
    delta = (end - start).days
    return max(0.0, round(delta / 365.25, 2))


# ── Score helpers ──────────────────────────────────────────────────────────────

def clamp(value: float, lo: float = 0.0, hi: float = 1.0) -> float:
    """Clamp a float to [lo, hi]."""
    return max(lo, min(hi, value))


def normalise_to_100(score_0_1: float) -> float:
    """Convert a 0-1 score to 0-100 rounded to 2dp."""
    return round(clamp(score_0_1) * 100, 2)


def weighted_average(scores: Dict[str, float], weights: Dict[str, float]) -> float:
    """
    Compute weighted average. Weights are auto-normalised.

    Args:
        scores:  {dimension: score_0_to_1}
        weights: {dimension: weight}

    Returns:
        float 0-1
    """
    total_weight = sum(weights.get(k, 0) for k in scores)
    if total_weight == 0:
        return 0.0
    raw = sum(scores[k] * weights.get(k, 0) for k in scores)
    return clamp(raw / total_weight)


# ── JSON helpers ───────────────────────────────────────────────────────────────

def safe_json_loads(text: Any, default=None):
    """Parse JSON string without raising. Returns default on failure."""
    if text is None:
        return default
    if isinstance(text, (dict, list)):
        return text
    try:
        return json.loads(str(text))
    except Exception:
        return default


def safe_json_dumps(obj: Any) -> str:
    """Serialise to JSON string without raising."""
    try:
        return json.dumps(obj, ensure_ascii=False)
    except Exception:
        return "{}"


# ── Candidate profile helpers ──────────────────────────────────────────────────

def estimate_completeness(candidate: Dict) -> float:
    """Return 0-1 completeness estimate based on populated fields."""
    REQUIRED = [
        "name", "current_title", "current_company",
        "years_experience", "skills",
    ]
    OPTIONAL = [
        "email", "phone", "location", "domain",
        "career_history", "education", "last_active",
    ]
    filled_req = sum(1 for f in REQUIRED if candidate.get(f))
    filled_opt = sum(1 for f in OPTIONAL if candidate.get(f))
    score = (filled_req / len(REQUIRED)) * 0.7 + (filled_opt / len(OPTIONAL)) * 0.3
    return round(score, 2)


def get_domain_from_company(company_name: str) -> str:
    """Very lightweight domain inference from company name."""
    company_lower = company_name.lower()
    domain_keywords = {
        "fintech":    ["bank", "pay", "fin", "credit", "loan", "insurance", "wealth", "zerodha", "groww", "razorpay", "paytm"],
        "ecommerce":  ["shop", "commerce", "buy", "sell", "amazon", "flipkart", "meesho", "myntra", "nykaa"],
        "healthtech": ["health", "medic", "pharma", "clinic", "hospital", "care", "wellness"],
        "edtech":     ["learn", "edu", "teach", "course", "byju", "unacademy", "vedantu"],
        "saas":       ["software", "tech", "cloud", "platform", "solutions", "systems"],
        "gaming":     ["game", "play", "dream11", "mobile premier", "nazara"],
        "telecom":    ["telecom", "jio", "airtel", "bsnl", "vodafone"],
    }
    for domain, keywords in domain_keywords.items():
        for kw in keywords:
            if kw in company_lower:
                return domain
    return "general"
