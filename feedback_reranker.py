"""
feedback_reranker.py — Re-ranks candidates based on recruiter feedback signals.

When a recruiter marks candidates as 'not_a_fit', 'strong_yes', or 'maybe',
this module adjusts future rankings by:
  - Excluding 'not_a_fit' candidates
  - Boosting candidates similar to 'strong_yes' picks
  - Learning implicit preference patterns across multiple feedback events

This is our lightweight feedback loop — no full ML retraining needed.
"""

from typing import Dict, List, Optional
from database import get_candidate, get_ranked_results
from embedder import embed_text, build_candidate_profile_text
import numpy as np


def apply_feedback_boost(
    ranked_results: List[Dict],
    run_id: str,
    feedback_map: Dict[str, str],   # {candidate_id: feedback_type}
) -> List[Dict]:
    """
    Adjust composite scores based on recruiter feedback.

    'strong_yes' candidates boost similar candidates in the list.
    'not_a_fit'  candidates are removed entirely.
    'maybe'      candidates stay but get a mild score penalty (recruiter is hesitant).

    Args:
        ranked_results: list of candidate dicts with composite_score
        run_id:         current run id
        feedback_map:   dict of {candidate_id: feedback_type}

    Returns:
        New sorted list with adjusted scores and 'feedback_adjusted' flag
    """
    if not feedback_map:
        return ranked_results

    # Separate candidates by feedback type
    strong_yes_ids = {cid for cid, ft in feedback_map.items() if ft == "strong_yes"}
    not_fit_ids    = {cid for cid, ft in feedback_map.items() if ft == "not_a_fit"}
    maybe_ids      = {cid for cid, ft in feedback_map.items() if ft == "maybe"}

    # Filter out 'not_a_fit'
    filtered = [r for r in ranked_results if r.get("candidate_id") not in not_fit_ids]

    if not filtered:
        return filtered

    # Build similarity map if we have strong_yes picks to learn from
    similarity_boosts = {}
    if strong_yes_ids:
        similarity_boosts = _compute_similarity_boosts(
            strong_yes_ids, filtered
        )

    # Apply adjustments
    adjusted = []
    for result in filtered:
        cid = result.get("candidate_id", "")
        new_result = dict(result)
        score = float(result.get("composite_score", 0))

        if cid in strong_yes_ids:
            # Already confirmed good — small boost for visibility
            score = min(100.0, score * 1.05)
            new_result["feedback_tag"] = "✅ Shortlisted"

        elif cid in maybe_ids:
            # Recruiter is hesitant — mild penalty
            score = score * 0.90
            new_result["feedback_tag"] = "⚠️ Maybe"

        elif cid in similarity_boosts:
            # Candidate is similar to a 'strong_yes' pick — boost proportionally
            boost = similarity_boosts[cid]
            score = min(100.0, score * (1 + boost * 0.15))
            new_result["feedback_tag"] = f"🔗 Similar to shortlisted ({boost:.0%})"

        else:
            new_result["feedback_tag"] = ""

        new_result["composite_score"]     = round(score, 2)
        new_result["feedback_adjusted"]   = True
        adjusted.append(new_result)

    # Re-sort by adjusted composite score
    adjusted.sort(key=lambda x: -x["composite_score"])
    for i, r in enumerate(adjusted, start=1):
        r["rank"] = i

    return adjusted


def _compute_similarity_boosts(
    strong_yes_ids: set,
    candidates: List[Dict],
) -> Dict[str, float]:
    """
    For each candidate not in strong_yes_ids, compute a similarity
    score to the 'strong_yes' picks. Return as {candidate_id: similarity}.

    Uses profile text embeddings and cosine similarity.
    """
    # Fetch profiles for strong_yes candidates
    yes_profiles = []
    for cid in strong_yes_ids:
        cand = get_candidate(cid)
        if cand:
            text = build_candidate_profile_text(cand)
            yes_profiles.append(embed_text(text))

    if not yes_profiles:
        return {}

    # Average embedding of 'strong_yes' candidates = the "ideal candidate vector"
    yes_vec = np.mean(yes_profiles, axis=0)
    yes_vec = yes_vec / (np.linalg.norm(yes_vec) + 1e-9)

    boosts = {}
    for result in candidates:
        cid = result.get("candidate_id", "")
        if cid in strong_yes_ids:
            continue

        cand = get_candidate(cid)
        if not cand:
            continue

        text = build_candidate_profile_text(cand)
        vec  = np.array(embed_text(text))
        vec  = vec / (np.linalg.norm(vec) + 1e-9)

        similarity = float(np.dot(yes_vec, vec))
        if similarity > 0.7:     # only boost meaningfully similar candidates
            boosts[cid] = similarity

    return boosts
