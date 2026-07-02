"""
ranker.py — The conductor. Orchestrates the full ranking pipeline.

Flow:
  1. Parse JD via NVIDIA NIM
  2. Embed JD
  3. Semantic search → top-N candidates from ChromaDB
  4. Fetch full profiles from SQLite
  5. Run all 5 scorers per candidate (parallel)
  6. Combine → composite score
  7. Sort → assign rank positions
  8. Generate explanations for top-20 (concurrent)
  9. Generate outreach for top-5 (concurrent)
  10. Save everything to DB
  11. Return ranked list
"""

import asyncio
import uuid
from typing import Dict, List, Optional

from config import (
    DEFAULT_WEIGHTS, TOP_N_SEMANTIC, TOP_N_FINAL,
    TOP_N_EXPLAIN, TOP_N_OUTREACH,
)
from database import (
    get_candidate, save_jd_run, save_score, get_ranked_results,
    get_rejected_candidates,
)
from embedder   import embed_text
from vector_store import search as vector_search
from jd_parser  import parse_jd
from combiner   import build_score_dict, combine_scores
from explainer  import batch_explain, batch_outreach

from scorer import (
    semantic_score,
    skill_score,
    trajectory_score,
    behavioral_score,
    domain_score,
)


async def rank_candidates(
    jd_text:         str,
    weights:         Optional[Dict[str, float]] = None,
    run_id:          Optional[str] = None,
    previous_run_id: Optional[str] = None,   # for feedback-based re-ranking
) -> Dict:
    """
    Full ranking pipeline.

    Args:
        jd_text:         Raw job description text
        weights:         Custom scoring weights (optional, uses defaults if None)
        run_id:          Unique ID for this ranking run (auto-generated if None)
        previous_run_id: If provided, excluded candidates marked 'not_a_fit'

    Returns:
        {
          "run_id":     str,
          "jd_parsed":  dict,
          "weights":    dict,
          "total_candidates_evaluated": int,
          "results":    list of ranked candidate dicts
        }
    """
    run_id  = run_id or str(uuid.uuid4())
    weights = weights or DEFAULT_WEIGHTS

    print(f"\n[Ranker] Starting run {run_id[:8]}…")

    # ── Step 1: Parse JD ──────────────────────────────────────────────────────
    print("[Ranker] Step 1/9 — Parsing job description…")
    jd_parsed = parse_jd(jd_text)
    print(f"  → Title: {jd_parsed.get('job_title')}  Domain: {jd_parsed.get('domain')}")
    print(f"  → Required skills: {jd_parsed.get('required_skills', [])[:5]}")

    # ── Step 2: Embed JD ──────────────────────────────────────────────────────
    print("[Ranker] Step 2/9 — Embedding JD…")
    jd_vector = embed_text(jd_text)

    # ── Step 3: Semantic search ───────────────────────────────────────────────
    print(f"[Ranker] Step 3/9 — Searching {TOP_N_SEMANTIC} semantic candidates…")
    semantic_results = vector_search(jd_vector, top_n=TOP_N_SEMANTIC)
    print(f"  → Found {len(semantic_results)} candidates.")

    # ── Step 4: Load full profiles + filter rejected ──────────────────────────
    print("[Ranker] Step 4/9 — Loading candidate profiles from SQLite…")
    rejected_ids = set()
    if previous_run_id:
        rejected_ids = set(get_rejected_candidates(previous_run_id))
        if rejected_ids:
            print(f"  → Excluding {len(rejected_ids)} rejected candidates from previous run.")

    candidates_data = []
    for sr in semantic_results:
        cid = sr["candidate_id"]
        if cid in rejected_ids:
            continue
        cand = get_candidate(cid)
        if cand:
            candidates_data.append({
                "candidate": cand,
                "raw_similarity": sr["similarity"],
            })

    print(f"  → Loaded {len(candidates_data)} profiles.")

    # ── Step 5 & 6: Score all candidates ─────────────────────────────────────
    print("[Ranker] Steps 5-6/9 — Scoring all candidates…")
    scored = []
    for item in candidates_data:
        cand  = item["candidate"]
        sim   = item["raw_similarity"]

        sem   = semantic_score(sim)
        sk, skill_gap = skill_score(cand, jd_parsed)
        traj  = trajectory_score(cand, jd_parsed)
        beh   = behavioral_score(cand)
        dom   = domain_score(cand, jd_parsed)

        score_dict = build_score_dict(
            candidate_id = cand["id"],
            semantic     = sem,
            skill        = sk,
            trajectory   = traj,
            behavioral   = beh,
            domain       = dom,
            weights      = weights,
        )
        score_dict["skill_gap"] = skill_gap

        scored.append({
            "candidate":  cand,
            "score_dict": score_dict,
        })

    # ── Step 7: Sort and assign ranks ─────────────────────────────────────────
    print("[Ranker] Step 7/9 — Sorting and ranking…")
    scored.sort(
        key=lambda x: (
            -x["score_dict"]["composite_score"],
            -x["score_dict"]["behavioral_score"],   # tie-break
        )
    )
    for rank_pos, item in enumerate(scored, start=1):
        item["score_dict"]["rank_position"] = rank_pos

    top_results = scored[:TOP_N_FINAL]

    # ── Step 8: Generate explanations ─────────────────────────────────────────
    print(f"[Ranker] Step 8/9 — Generating explanations for top {TOP_N_EXPLAIN}…")
    explain_batch = top_results[:TOP_N_EXPLAIN]
    explanations  = await batch_explain(
        candidates  = [x["candidate"]  for x in explain_batch],
        score_dicts = [x["score_dict"] for x in explain_batch],
        jd_parsed   = jd_parsed,
    )
    for item, explanation in zip(explain_batch, explanations):
        item["score_dict"]["explanation"] = explanation

    # ── Step 9: Generate outreach for top 5 ───────────────────────────────────
    print(f"[Ranker] Step 9/9 — Generating outreach messages for top {TOP_N_OUTREACH}…")
    outreach_batch   = top_results[:TOP_N_OUTREACH]
    outreach_messages = await batch_outreach(
        candidates = [x["candidate"] for x in outreach_batch],
        jd_parsed  = jd_parsed,
    )
    for item, msg in zip(outreach_batch, outreach_messages):
        item["score_dict"]["outreach_msg"] = msg

    # ── Save to DB ────────────────────────────────────────────────────────────
    save_jd_run(run_id, jd_text, jd_parsed, weights)
    for item in top_results:
        save_score(run_id, item["candidate"]["id"], item["score_dict"])

    # ── Build response ────────────────────────────────────────────────────────
    results = []
    for item in top_results:
        cand  = item["candidate"]
        score = item["score_dict"]
        results.append({
            "rank":             score["rank_position"],
            "candidate_id":     cand["id"],
            "name":             cand.get("name", ""),
            "current_title":    cand.get("current_title", ""),
            "current_company":  cand.get("current_company", ""),
            "location":         cand.get("location", ""),
            "years_experience": cand.get("years_experience", 0),
            "skills":           cand.get("skills", []),
            "domain":           cand.get("domain", ""),
            "composite_score":  score["composite_score"],
            "score_breakdown": {
                "semantic":    score["semantic_score"],
                "skill":       score["skill_score"],
                "trajectory":  score["trajectory_score"],
                "behavioral":  score["behavioral_score"],
                "domain":      score["domain_score"],
            },
            "skill_gap":    score.get("skill_gap", []),
            "explanation":  score.get("explanation", ""),
            "outreach_msg": score.get("outreach_msg", ""),
        })

    print(f"\n[Ranker] Run {run_id[:8]} complete. Top candidate: "
          f"{results[0]['name'] if results else 'N/A'} "
          f"(score: {results[0]['composite_score'] if results else 0})\n")

    return {
        "run_id":                       run_id,
        "jd_parsed":                    jd_parsed,
        "weights":                      weights,
        "total_candidates_evaluated":   len(candidates_data),
        "results":                      results,
    }
