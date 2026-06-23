"""
exporter.py — Generates the final ranked output CSV for hackathon submission.

Usage:
    python exporter.py --run_id <run_id>
    python exporter.py --run_id <run_id> --output data/output_ranked.csv

Also callable from code:
    from exporter import export_ranked_csv
    export_ranked_csv(run_id, "data/output_ranked.csv")
"""

import argparse
import csv
import json
import os
from typing import List, Dict

from database import get_ranked_results, get_jd_run
from config import DATA_DIR


def export_ranked_csv(run_id: str, output_path: str = None) -> str:
    """
    Export ranked candidates for a given run to a CSV file.

    Args:
        run_id:      The ranking run ID
        output_path: Where to write the CSV (default: data/ranked_<run_id>.csv)

    Returns:
        Path to the written CSV file
    """
    if not output_path:
        output_path = os.path.join(DATA_DIR, f"ranked_{run_id[:8]}.csv")

    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    results = get_ranked_results(run_id)
    if not results:
        print(f"[Exporter] No results found for run_id: {run_id}")
        return ""

    run_meta = get_jd_run(run_id)
    jd_title = run_meta.get("jd_parsed", {}).get("job_title", "Unknown") if run_meta else "Unknown"

    fieldnames = [
        "rank",
        "candidate_id",
        "name",
        "current_title",
        "current_company",
        "location",
        "years_experience",
        "domain",
        "composite_score",
        "semantic_score",
        "skill_score",
        "trajectory_score",
        "behavioral_score",
        "domain_score",
        "top_skills",
        "skill_gaps",
        "explanation",
        "outreach_message",
    ]

    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()

        for r in results:
            # Build skill gap summary
            skill_gap_raw = r.get("skill_gap") or []
            if isinstance(skill_gap_raw, str):
                try:
                    skill_gap_raw = json.loads(skill_gap_raw)
                except Exception:
                    skill_gap_raw = []

            missing_skills = [
                sg["skill"] for sg in skill_gap_raw
                if isinstance(sg, dict) and sg.get("status") == "missing" and sg.get("required")
            ]

            # Build top skills string
            skills_raw = r.get("skills") or []
            if isinstance(skills_raw, str):
                try:
                    skills_raw = json.loads(skills_raw)
                except Exception:
                    skills_raw = [s.strip() for s in skills_raw.split(",")]
            top_skills = ", ".join(str(s) for s in skills_raw[:6])

            writer.writerow({
                "rank":              r.get("rank_position", ""),
                "candidate_id":      r.get("candidate_id", ""),
                "name":              r.get("name", ""),
                "current_title":     r.get("current_title", ""),
                "current_company":   r.get("current_company", ""),
                "location":          r.get("location", ""),
                "years_experience":  r.get("years_experience", ""),
                "domain":            r.get("domain", ""),
                "composite_score":   r.get("composite_score", ""),
                "semantic_score":    r.get("semantic_score", ""),
                "skill_score":       r.get("skill_score", ""),
                "trajectory_score":  r.get("trajectory_score", ""),
                "behavioral_score":  r.get("behavioral_score", ""),
                "domain_score":      r.get("domain_score", ""),
                "top_skills":        top_skills,
                "skill_gaps":        ", ".join(missing_skills),
                "explanation":       r.get("explanation", ""),
                "outreach_message":  r.get("outreach_msg", ""),
            })

    print(f"[Exporter] ✅ Exported {len(results)} candidates to: {output_path}")
    print(f"[Exporter]    Job title: {jd_title}")
    return output_path


def export_summary_report(run_id: str, output_path: str = None) -> str:
    """
    Export a human-readable summary report (text file) for the run.
    Useful for quick review without opening the CSV.
    """
    if not output_path:
        output_path = os.path.join(DATA_DIR, f"summary_{run_id[:8]}.txt")

    results = get_ranked_results(run_id)
    run_meta = get_jd_run(run_id)

    if not results or not run_meta:
        return ""

    jd_parsed = run_meta.get("jd_parsed", {})
    weights   = run_meta.get("weights", {})

    lines = [
        "=" * 65,
        f"  AI RECRUITER — RANKING SUMMARY REPORT",
        "=" * 65,
        f"  Run ID:      {run_id}",
        f"  Job Title:   {jd_parsed.get('job_title', 'N/A')}",
        f"  Domain:      {jd_parsed.get('domain', 'N/A')}",
        f"  Seniority:   {jd_parsed.get('seniority_level', 'N/A')}",
        f"  Required:    {', '.join(jd_parsed.get('required_skills', [])[:6])}",
        "",
        f"  Scoring Weights Used:",
        f"    Semantic:    {round(weights.get('semantic', 0) * 100)}%",
        f"    Skill:       {round(weights.get('skill', 0) * 100)}%",
        f"    Trajectory:  {round(weights.get('trajectory', 0) * 100)}%",
        f"    Behavioral:  {round(weights.get('behavioral', 0) * 100)}%",
        f"    Domain:      {round(weights.get('domain', 0) * 100)}%",
        "",
        "=" * 65,
        f"  TOP {min(10, len(results))} CANDIDATES",
        "=" * 65,
    ]

    for r in results[:10]:
        lines += [
            "",
            f"  #{r.get('rank_position')}  {r.get('name', 'N/A')}",
            f"      {r.get('current_title', '')} @ {r.get('current_company', '')}",
            f"      Composite Score: {r.get('composite_score', 0):.1f}/100",
            f"      Breakdown → Sem: {r.get('semantic_score', 0):.0f}  "
            f"Skill: {r.get('skill_score', 0):.0f}  "
            f"Traj: {r.get('trajectory_score', 0):.0f}  "
            f"Beh: {r.get('behavioral_score', 0):.0f}  "
            f"Dom: {r.get('domain_score', 0):.0f}",
            f"      Why: {r.get('explanation', 'N/A')}",
        ]

    lines += ["", "=" * 65, "  END OF REPORT", "=" * 65]

    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    print(f"[Exporter] ✅ Summary report saved to: {output_path}")
    return output_path


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Export ranked results to CSV")
    parser.add_argument("--run_id", required=True, help="Run ID from /rank endpoint")
    parser.add_argument("--output", default=None, help="Output CSV path")
    parser.add_argument("--summary", action="store_true", help="Also write text summary")
    args = parser.parse_args()

    export_ranked_csv(args.run_id, args.output)
    if args.summary:
        export_summary_report(args.run_id)
