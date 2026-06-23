"""
scorer/behavioral_scorer.py — Signal 4: Behavioral Intent & Activity

Analyses metadata signals to estimate job-seeking intent.
These signals CANNOT be faked by AI-polished resumes — making this
our most AI-resistant scoring dimension.
"""

from datetime import datetime, date
from typing import Dict, Optional
from config import ACTIVITY_DECAY, ACTIVITY_DEFAULT


def behavioral_score(candidate: Dict) -> float:
    """
    Returns 0-1 score estimating how actively the candidate is job-seeking.

    Sub-signals:
      - Recency of last activity       (40%)
      - Profile completeness           (30%)
      - Native activity score (if any) (20%)
      - Skills added recently          (10%)
    """
    score = 0.0
    score += _activity_recency_score(candidate)   * 0.40
    score += _completeness_score(candidate)       * 0.30
    score += _native_activity_score(candidate)    * 0.20
    score += _recent_skills_score(candidate)      * 0.10

    return round(min(1.0, max(0.0, score)), 4)


# ── Sub-scores ─────────────────────────────────────────────────────────────────

def _activity_recency_score(candidate: Dict) -> float:
    """
    Score decays as days-since-last-active increases.
    Recent active = high intent signal.
    """
    last_active_str = candidate.get("last_active", "")
    if not last_active_str or str(last_active_str).strip() in ("", "None", "nan"):
        return ACTIVITY_DEFAULT

    days = _days_since(str(last_active_str))
    if days is None:
        return ACTIVITY_DEFAULT

    # Sorted thresholds — find first threshold days exceeds
    for threshold, score in sorted(ACTIVITY_DECAY.items()):
        if days <= threshold:
            return score

    return ACTIVITY_DEFAULT


def _completeness_score(candidate: Dict) -> float:
    """
    Profile completeness is a proxy for engagement.
    Someone who has filled everything out is actively managing their profile.
    """
    completeness = candidate.get("profile_completeness", 0)
    try:
        val = float(completeness or 0)
        # Already 0-1? Return directly. If 0-100, normalise.
        return val if val <= 1.0 else val / 100.0
    except (TypeError, ValueError):
        return 0.3


def _native_activity_score(candidate: Dict) -> float:
    """
    Use the dataset's own activity_score field if present.
    Many datasets include a pre-computed engagement metric.
    """
    val = candidate.get("activity_score", 0)
    try:
        val = float(val or 0)
        return val if val <= 1.0 else val / 100.0
    except (TypeError, ValueError):
        return 0.0


def _recent_skills_score(candidate: Dict) -> float:
    """
    If the dataset has a 'skills_added_recently' or 'updated_at' field,
    use it to infer whether the candidate is actively learning/updating.
    Falls back to checking completeness as a proxy.
    """
    # Try explicit recent-skills field
    for field in ("skills_added_recently", "skills_updated", "recent_skills"):
        val = candidate.get(field)
        if val:
            try:
                count = int(val)
                return min(1.0, count / 5.0)   # 5 new skills = max score
            except (TypeError, ValueError):
                pass

    # Fallback: if profile is very complete, give a moderate recent-skills score
    completeness = float(candidate.get("profile_completeness", 0) or 0)
    if completeness > 1.0:
        completeness /= 100.0
    return completeness * 0.5


# ── Helper ─────────────────────────────────────────────────────────────────────

def _days_since(date_str: str) -> Optional[int]:
    """Parse a date string and return days since then."""
    formats = [
        "%Y-%m-%d", "%Y/%m/%d", "%d/%m/%Y", "%m/%d/%Y",
        "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d %H:%M:%S",
        "%b %d, %Y", "%B %d, %Y",
    ]
    for fmt in formats:
        try:
            dt = datetime.strptime(date_str.strip(), fmt).date()
            return (date.today() - dt).days
        except ValueError:
            continue
    return None
