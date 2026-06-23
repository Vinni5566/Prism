"""
scorer/trajectory_scorer.py — Signal 3: Career Trajectory & Momentum

Analyses career history to detect:
- Upward title progression (junior → senior → lead)
- Internal promotions (strongest signal)
- Career velocity (seniority gained per year)
- Red flags: long stagnation, unexplained gaps
"""

from datetime import datetime, date
from typing import Dict, List, Tuple
import re

# Seniority ladder — higher number = more senior
SENIORITY_MAP = {
    "intern":        0,
    "trainee":       0,
    "apprentice":    0,
    "junior":        1,
    "associate":     1,
    "entry":         1,
    "mid":           2,
    "intermediate":  2,
    "ii":            2,
    "2":             2,
    "senior":        3,
    "sr":            3,
    "iii":           3,
    "3":             3,
    "staff":         4,
    "lead":          4,
    "principal":     5,
    "architect":     5,
    "manager":       4,
    "head":          5,
    "director":      6,
    "vp":            7,
    "vice president":7,
    "cto":           8,
    "ceo":           8,
    "founder":       8,
    "co-founder":    8,
}


def trajectory_score(candidate: Dict, jd_parsed: Dict) -> float:
    """
    Returns 0-1 trajectory score.
    Higher = stronger upward career momentum relative to the target seniority.
    """
    career = candidate.get("career_history", [])
    years_exp = float(candidate.get("years_experience", 0) or 0)

    if not career or not isinstance(career, list):
        # No career history — use years_experience as a weak proxy
        return _fallback_score(years_exp, jd_parsed)

    parsed_jobs = [_parse_job(j) for j in career if isinstance(j, dict)]
    parsed_jobs = [j for j in parsed_jobs if j is not None]

    if not parsed_jobs:
        return _fallback_score(years_exp, jd_parsed)

    # Sort chronologically (oldest first)
    parsed_jobs.sort(key=lambda j: j["start_date"])

    score = 0.0
    score += _progression_score(parsed_jobs)   * 0.40
    score += _velocity_score(parsed_jobs)      * 0.30
    score += _promotion_score(parsed_jobs)     * 0.20
    score += _tenure_score(parsed_jobs)        * 0.10

    return round(min(1.0, max(0.0, score)), 4)


# ── Sub-scores ─────────────────────────────────────────────────────────────────

def _progression_score(jobs: List[Dict]) -> float:
    """How many seniority levels has the candidate climbed total?"""
    levels = [j["seniority"] for j in jobs if j["seniority"] is not None]
    if len(levels) < 2:
        return 0.5

    total_climb = levels[-1] - levels[0]
    # Max expected climb in a career is ~6 levels (intern → VP)
    return min(1.0, max(0.0, total_climb / 6.0))


def _velocity_score(jobs: List[Dict]) -> float:
    """Seniority levels gained per year (career velocity)."""
    first = jobs[0]
    last  = jobs[-1]

    years = max(0.5, (last["end_date"] - first["start_date"]).days / 365)
    if first["seniority"] is None or last["seniority"] is None:
        return 0.4

    climb_per_year = (last["seniority"] - first["seniority"]) / years

    # 0.5 levels/year is solid, 1.0+ is exceptional
    if climb_per_year >= 1.0:
        return 1.0
    if climb_per_year >= 0.5:
        return 0.75
    if climb_per_year >= 0.2:
        return 0.5
    if climb_per_year > 0:
        return 0.3
    return 0.1  # stagnant


def _promotion_score(jobs: List[Dict]) -> float:
    """Internal promotions are the strongest performance signal."""
    internal_promotions = 0
    for i in range(1, len(jobs)):
        prev = jobs[i-1]
        curr = jobs[i]
        same_company = (
            prev["company"] and curr["company"] and
            prev["company"].lower().strip() == curr["company"].lower().strip()
        )
        seniority_increase = (
            curr["seniority"] is not None and
            prev["seniority"] is not None and
            curr["seniority"] > prev["seniority"]
        )
        if same_company and seniority_increase:
            internal_promotions += 1

    # 3+ promotions = exceptional
    return min(1.0, internal_promotions / 3.0)


def _tenure_score(jobs: List[Dict]) -> float:
    """
    Penalise extreme job-hopping (< 8 months avg) if no seniority gain.
    Penalise very long stagnation (> 6 years same role).
    """
    if len(jobs) < 2:
        return 0.6

    tenures = []
    for j in jobs:
        days = (j["end_date"] - j["start_date"]).days
        tenures.append(days / 365)

    avg_tenure = sum(tenures) / len(tenures)

    if avg_tenure < 0.67:   # < 8 months avg
        return 0.2
    if avg_tenure < 1.5:
        return 0.5
    if avg_tenure <= 4.0:
        return 0.9
    return 0.7   # very long tenures — solid but possibly stagnant


def _fallback_score(years_exp: float, jd_parsed: Dict) -> float:
    """When there's no career history to analyse."""
    min_exp = jd_parsed.get("years_experience_min", 0) or 0
    max_exp = jd_parsed.get("years_experience_max", 10) or 10
    if years_exp >= min_exp:
        return min(0.6, years_exp / max(max_exp, 1))
    return max(0.0, years_exp / max(min_exp, 1)) * 0.4


# ── Parsers ────────────────────────────────────────────────────────────────────

def _parse_job(job: Dict) -> Dict:
    """Extract start_date, end_date, seniority, company from a career entry."""
    start = _parse_date(job.get("start_date") or job.get("start") or "")
    end   = _parse_date(job.get("end_date")   or job.get("end")   or "present")

    title   = str(job.get("title", "") or "").lower()
    company = str(job.get("company", "") or "")

    return {
        "title":      title,
        "company":    company,
        "start_date": start,
        "end_date":   end,
        "seniority":  _extract_seniority(title),
    }


def _extract_seniority(title: str) -> int:
    title_l = title.lower()
    best = None
    for keyword, level in SENIORITY_MAP.items():
        if keyword in title_l:
            if best is None or level > best:
                best = level
    return best if best is not None else 2   # default to mid-level


def _parse_date(raw: str) -> date:
    if not raw:
        return date.today()
    raw = str(raw).strip().lower()
    if raw in ("present", "current", "now", ""):
        return date.today()
    formats = [
        "%Y-%m-%d", "%Y/%m/%d", "%m/%Y", "%Y",
        "%b %Y", "%B %Y", "%Y-%m",
    ]
    for fmt in formats:
        try:
            return datetime.strptime(raw, fmt).date()
        except ValueError:
            pass
    # Try extracting year
    match = re.search(r"\b(19|20)\d{2}\b", raw)
    if match:
        return date(int(match.group()), 1, 1)
    return date.today()
