"""
scorer/skill_scorer.py — Signal 2: Skill Depth & Coverage

Checks required skills against candidate skills.
Awards credibility bonus for skills backed by project/tenure evidence.
Returns a 0-1 score + a skill_gap dict for the heatmap.
"""

from typing import Dict, List, Tuple
from config import SKILL_CREDIBILITY


def skill_score(candidate: Dict, jd_parsed: Dict) -> Tuple[float, List[Dict]]:
    """
    Args:
        candidate:  full candidate dict from SQLite
        jd_parsed:  structured JD dict from jd_parser

    Returns:
        (score: float 0-1,  skill_gap: list of dicts for heatmap)
    """
    required  = [s.lower().strip() for s in jd_parsed.get("required_skills", [])]
    preferred = [s.lower().strip() for s in jd_parsed.get("preferred_skills", [])]

    if not required and not preferred:
        return 0.5, []   # no skill requirements defined — neutral score

    cand_skills = _extract_candidate_skills(candidate)
    career      = candidate.get("career_history", [])

    skill_gap = []
    weighted_score = 0.0
    total_weight   = 0.0

    # Required skills — weight 1.0 each
    for skill in required:
        match_level, evidence_count = _match_skill(skill, cand_skills, career)
        credibility = _get_credibility(evidence_count)
        contribution = 1.0 * match_level * credibility

        weighted_score += contribution
        total_weight   += 1.0

        skill_gap.append({
            "skill":         skill,
            "required":      True,
            "match_level":   round(match_level, 2),   # 0=missing, 0.5=partial, 1=full
            "evidence":      evidence_count,
            "credibility":   credibility,
            "status":        _status(match_level),
        })

    # Preferred skills — weight 0.4 each
    for skill in preferred:
        match_level, evidence_count = _match_skill(skill, cand_skills, career)
        credibility = _get_credibility(evidence_count)
        contribution = 0.4 * match_level * credibility

        weighted_score += contribution
        total_weight   += 0.4

        skill_gap.append({
            "skill":       skill,
            "required":    False,
            "match_level": round(match_level, 2),
            "evidence":    evidence_count,
            "credibility": credibility,
            "status":      _status(match_level),
        })

    final_score = weighted_score / total_weight if total_weight > 0 else 0.0
    return round(min(1.0, final_score), 4), skill_gap


# ── Helpers ────────────────────────────────────────────────────────────────────

def _extract_candidate_skills(candidate: Dict) -> List[str]:
    """Pull skills from the skills list + extract from career descriptions."""
    skills_list = candidate.get("skills", [])
    if isinstance(skills_list, str):
        skills_list = [s.strip() for s in skills_list.split(",")]
    skills_lower = [str(s).lower().strip() for s in skills_list if s]

    # Also extract skill-like tokens from career description text
    career = candidate.get("career_history", [])
    for job in career[:5]:
        if isinstance(job, dict):
            desc = str(job.get("description", "") or "").lower()
            # Very lightweight extraction — just note the raw text for matching
            skills_lower.append(desc)

    return skills_lower


def _match_skill(
    skill: str,
    cand_skills: List[str],
    career: List[Dict],
) -> Tuple[float, int]:
    """
    Returns (match_level, evidence_count).
    match_level: 0=none, 0.5=partial/adjacent, 1.0=direct
    evidence_count: how many roles/projects mention this skill
    """
    skill_l = skill.lower()
    evidence = 0
    direct_match = False
    partial_match = False

    for cs in cand_skills:
        cs_l = cs.lower()
        if skill_l in cs_l or cs_l in skill_l:
            direct_match = True
            evidence += 1
        elif _partial_match(skill_l, cs_l):
            partial_match = True
            evidence += 1

    # Count evidence in career descriptions
    for job in career[:5]:
        if isinstance(job, dict):
            desc = str(job.get("description", "") or "").lower()
            if skill_l in desc:
                evidence += 1

    if direct_match:
        return 1.0, evidence
    if partial_match:
        return 0.5, evidence
    return 0.0, evidence


def _partial_match(skill: str, candidate_text: str) -> bool:
    """Simple adjacency — shares a significant word."""
    STOP = {"and", "or", "the", "a", "of", "in", "with", "for", "to"}
    skill_words = {w for w in skill.split() if w not in STOP and len(w) > 2}
    text_words  = set(candidate_text.split())
    return bool(skill_words & text_words)


def _get_credibility(evidence_count: int) -> float:
    if evidence_count == 0:
        return SKILL_CREDIBILITY["no_evidence"]
    if evidence_count == 1:
        return SKILL_CREDIBILITY["one_project"]
    return SKILL_CREDIBILITY["multi_project"]


def _status(match_level: float) -> str:
    if match_level >= 0.9:
        return "full"
    if match_level >= 0.4:
        return "partial"
    return "missing"
