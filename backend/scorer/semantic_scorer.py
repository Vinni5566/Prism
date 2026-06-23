"""
scorer/semantic_scorer.py — Signal 1: Semantic Similarity

Input:  raw cosine similarity from ChromaDB (0-1)
Output: adjusted score (0-1) with a slight curve applied
"""


def semantic_score(raw_similarity: float) -> float:
    """
    Normalize and curve the raw cosine similarity score.

    Why a curve?
    - Raw similarity below 0.3 → candidate is semantically far → penalise more
    - Raw similarity above 0.7 → strong match → give a slight boost
    - Middle range → linear scaling

    Args:
        raw_similarity: cosine similarity from ChromaDB, range 0-1

    Returns:
        float: adjusted score 0-1
    """
    sim = max(0.0, min(1.0, raw_similarity))   # clamp

    if sim < 0.3:
        # Below threshold — penalise quadratically
        score = (sim / 0.3) ** 2 * 0.3
    elif sim < 0.7:
        # Linear middle band — map 0.3-0.7 to 0.3-0.75
        score = 0.3 + (sim - 0.3) * (0.45 / 0.4)
    else:
        # High similarity — boost slightly, map 0.7-1.0 to 0.75-1.0
        score = 0.75 + (sim - 0.7) * (0.25 / 0.3)

    return round(min(1.0, score), 4)
