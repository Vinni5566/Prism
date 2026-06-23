"""
scorer/domain_scorer.py — Signal 5: Domain / Industry Relevance

Checks how much of the candidate's career was spent in the
same or adjacent industry as the target role.
"""

from typing import Dict, List

# Adjacent domain pairs — if JD domain is key, these candidate domains are adjacent
ADJACENT_DOMAINS = {
    "fintech":     {"banking", "finance", "insurance", "payments", "crypto", "blockchain", "lending"},
    "healthtech":  {"healthcare", "pharma", "biotech", "medtech", "clinical", "hospital", "wellness"},
    "edtech":      {"education", "e-learning", "training", "elearning"},
    "ecommerce":   {"retail", "marketplace", "logistics", "supply chain", "d2c"},
    "saas":        {"software", "cloud", "b2b", "enterprise software", "platform"},
    "gaming":      {"entertainment", "media", "mobile apps", "interactive"},
    "defence":     {"government", "aerospace", "security", "cybersecurity"},
    "adtech":      {"marketing", "media", "advertising", "analytics"},
    "proptech":    {"real estate", "construction", "facilities"},
    "legaltech":   {"legal", "law", "compliance", "regulatory"},
}

# Build reverse map for quick lookup
_REVERSE_ADJACENT: Dict[str, str] = {}
for primary, adj_set in ADJACENT_DOMAINS.items():
    for adj in adj_set:
        if adj not in _REVERSE_ADJACENT:
            _REVERSE_ADJACENT[adj] = primary


def domain_score(candidate: Dict, jd_parsed: Dict) -> float:
    """
    Returns 0-1 domain relevance score.

    Direct match:   1.0
    Adjacent match: 0.65
    No match:       0.15 (never zero — transferable skills still exist)
    """
    jd_domain   = str(jd_parsed.get("domain", "") or "").lower().strip()
    jd_keywords = [k.lower() for k in jd_parsed.get("domain_keywords", [])]

    if not jd_domain or jd_domain == "general":
        return 0.5   # no domain specified — neutral

    # Collect candidate's domain signals
    cand_domains = _extract_candidate_domains(candidate)

    if not cand_domains:
        return 0.2   # no domain info at all

    best_score = 0.0
    for cand_domain, weight in cand_domains:
        match = _domain_match(cand_domain, jd_domain, jd_keywords)
        weighted = match * weight
        if weighted > best_score:
            best_score = weighted

    return round(min(1.0, max(0.15, best_score)), 4)


# ── Helpers ────────────────────────────────────────────────────────────────────

def _extract_candidate_domains(candidate: Dict) -> List[tuple]:
    """
    Returns list of (domain_str, recency_weight) tuples.
    Most recent roles get higher weight.
    """
    domains = []

    # Explicit domain field
    explicit = str(candidate.get("domain", "") or "").lower().strip()
    if explicit:
        domains.append((explicit, 1.0))

    # From career history (recent = higher weight)
    career = candidate.get("career_history", [])
    if isinstance(career, list):
        total = len(career)
        for i, job in enumerate(career):
            if not isinstance(job, dict):
                continue
            recency_weight = (i + 1) / total   # latest job = weight 1.0
            for field in ("domain", "industry", "company", "description"):
                val = str(job.get(field, "") or "").lower()
                if val:
                    domains.append((val, recency_weight * 0.7))

    # From current company name (crude but useful)
    company = str(candidate.get("current_company", "") or "").lower()
    if company:
        domains.append((company, 0.5))

    return domains


def _domain_match(candidate_text: str, jd_domain: str, jd_keywords: List[str]) -> float:
    """Score how well candidate_text matches the jd_domain."""

    # Direct name match
    if jd_domain in candidate_text:
        return 1.0

    # Check if candidate text maps to same primary domain via reverse map
    for word in candidate_text.split():
        primary = _REVERSE_ADJACENT.get(word)
        if primary == jd_domain or primary in ADJACENT_DOMAINS.get(jd_domain, set()):
            return 0.8

    # Check adjacency directly
    adjacent = ADJACENT_DOMAINS.get(jd_domain, set())
    for adj in adjacent:
        if adj in candidate_text:
            return 0.65

    # Keyword overlap from JD domain_keywords
    for kw in jd_keywords:
        if kw in candidate_text:
            return 0.55

    return 0.0
