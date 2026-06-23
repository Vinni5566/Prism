"""
combiner.py — Combines 5 individual scores into one composite rank score.

Formula: composite = Σ (weight_i × score_i)
Tie-breaking: behavioral score (more active candidate wins).
"""

from typing import Dict
from config import DEFAULT_WEIGHTS


def combine_scores(
    semantic:    float,
    skill:       float,
    trajectory:  float,
    behavioral:  float,
    domain:      float,
    weights:     Dict[str, float] = None,
) -> float:
    """
    Args:
        semantic, skill, trajectory, behavioral, domain: individual scores (0-1)
        weights: dict with keys matching above names, values sum to ~1.0
                 If None, DEFAULT_WEIGHTS from config are used.

    Returns:
        composite score: float 0-100 (multiplied by 100 for readability)
    """
    w = _normalise_weights(weights or DEFAULT_WEIGHTS)

    raw = (
        w["semantic"]   * semantic   +
        w["skill"]      * skill      +
        w["trajectory"] * trajectory +
        w["behavioral"] * behavioral +
        w["domain"]     * domain
    )

    # Convert to 0-100 scale and round to 2dp
    return round(min(100.0, max(0.0, raw * 100)), 2)


def build_score_dict(
    candidate_id: str,
    semantic:     float,
    skill:        float,
    trajectory:   float,
    behavioral:   float,
    domain:       float,
    weights:      Dict[str, float] = None,
) -> Dict:
    """
    Build the full score record that gets saved to the DB and returned by the API.
    """
    composite = combine_scores(semantic, skill, trajectory, behavioral, domain, weights)
    return {
        "candidate_id":    candidate_id,
        "semantic_score":  round(semantic   * 100, 2),
        "skill_score":     round(skill      * 100, 2),
        "trajectory_score":round(trajectory * 100, 2),
        "behavioral_score":round(behavioral * 100, 2),
        "domain_score":    round(domain     * 100, 2),
        "composite_score": composite,
        "rank_position":   0,   # filled in by ranker after sorting
        "explanation":     None,
        "outreach_msg":    None,
        "skill_gap":       [],
    }


def _normalise_weights(weights: Dict[str, float]) -> Dict[str, float]:
    """Ensure weights sum to 1.0. Fills missing keys with 0."""
    keys = ["semantic", "skill", "trajectory", "behavioral", "domain"]
    w = {k: float(weights.get(k, 0.0)) for k in keys}
    total = sum(w.values())
    if total <= 0:
        return DEFAULT_WEIGHTS
    return {k: v / total for k, v in w.items()}
