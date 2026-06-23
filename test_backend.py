"""
test_backend.py — Quick sanity checks before running the full server.

Run with:  python test_backend.py

Tests (no server needed):
  1. DB init and candidate insert
  2. Embedder
  3. Vector store add + search
  4. JD parser (requires NVIDIA API key)
  5. All 5 scorers
  6. Combiner
"""

import asyncio, json, sys

def sep(title):
    print(f"\n{'─'*55}")
    print(f"  {title}")
    print('─'*55)

# ── 1. Database ────────────────────────────────────────────────────────────────
sep("1 / 6  Database")
from database import init_db, upsert_candidate, get_candidate, count_candidates

init_db()
sample = {
    "id": "TEST_001",
    "name": "Test Candidate",
    "email": "test@test.com",
    "phone": "",
    "location": "Bangalore",
    "current_title": "Senior Python Developer",
    "current_company": "TestCorp",
    "years_experience": 5.0,
    "skills": ["Python", "FastAPI", "PostgreSQL", "Docker"],
    "career_history": [
        {"title": "Senior Developer", "company": "TestCorp",
         "start_date": "2021-01", "end_date": "present",
         "description": "Python FastAPI microservices"},
        {"title": "Junior Developer", "company": "OldCorp",
         "start_date": "2018-07", "end_date": "2020-12",
         "description": "Python Django REST APIs"},
    ],
    "education": [{"degree": "B.Tech", "field": "CS", "school": "IIT"}],
    "domain": "saas",
    "last_active": "2026-06-20",
    "profile_completeness": 0.9,
    "activity_score": 0.85,
    "raw_data": {},
}
upsert_candidate(sample)
fetched = get_candidate("TEST_001")
assert fetched is not None, "Candidate fetch failed"
print(f"  ✅ DB OK — {count_candidates()} candidate(s) in DB")

# ── 2. Embedder ────────────────────────────────────────────────────────────────
sep("2 / 6  Embedder")
from embedder import embed_text, embed_batch, build_candidate_profile_text

profile_text = build_candidate_profile_text(sample)
print(f"  Profile text: {profile_text[:80]}…")
vec = embed_text(profile_text)
assert len(vec) == 384, f"Expected 384-dim vector, got {len(vec)}"
print(f"  ✅ Embedder OK — vector dim: {len(vec)}")

# ── 3. Vector store ────────────────────────────────────────────────────────────
sep("3 / 6  Vector store (ChromaDB)")
from vector_store import add_candidates, search, count as vcount

add_candidates(
    candidate_ids=["TEST_001"],
    vectors=[vec],
    metadatas=[{"name": "Test Candidate", "current_title": "Senior Python Developer",
                "domain": "saas", "years_experience": "5"}],
    documents=[profile_text],
)
print(f"  Vectors in store: {vcount()}")

query_vec = embed_text("Python FastAPI backend engineer with Docker experience")
results   = search(query_vec, top_n=3)
assert len(results) > 0, "Vector search returned nothing"
print(f"  ✅ Vector store OK — top result: {results[0]['candidate_id']} "
      f"(similarity: {results[0]['similarity']})")

# ── 4. JD Parser ──────────────────────────────────────────────────────────────
sep("4 / 6  JD Parser (NVIDIA NIM API)")
from jd_parser import parse_jd

test_jd = """
We are looking for a Senior Backend Engineer with 4+ years of experience.
You will work on our payment processing platform serving millions of transactions.

Required: Python, FastAPI or Django, PostgreSQL, Redis, Docker, Kubernetes
Nice to have: Kafka, AWS, Go
Domain: Fintech / Payments
Seniority: Senior (4-7 years)
"""
parsed = parse_jd(test_jd)
print(f"  Job title:        {parsed.get('job_title')}")
print(f"  Domain:           {parsed.get('domain')}")
print(f"  Required skills:  {parsed.get('required_skills', [])[:5]}")
print(f"  Seniority:        {parsed.get('seniority_level')}")
assert "required_skills" in parsed, "JD parse missing required_skills"
print("  ✅ JD Parser OK")

# ── 5. All 5 Scorers ──────────────────────────────────────────────────────────
sep("5 / 6  All 5 Scorers")
from scorer import (
    semantic_score, skill_score, trajectory_score,
    behavioral_score, domain_score,
)

sem  = semantic_score(results[0]["similarity"])
sk, skill_gap = skill_score(sample, parsed)
traj = trajectory_score(sample, parsed)
beh  = behavioral_score(sample)
dom  = domain_score(sample, parsed)

print(f"  Semantic score:    {sem:.4f}")
print(f"  Skill score:       {sk:.4f}  (gap items: {len(skill_gap)})")
print(f"  Trajectory score:  {traj:.4f}")
print(f"  Behavioral score:  {beh:.4f}")
print(f"  Domain score:      {dom:.4f}")
assert all(0 <= s <= 1 for s in [sem, sk, traj, beh, dom]), "Score out of 0-1 range"
print("  ✅ All scorers OK")

# ── 6. Combiner ───────────────────────────────────────────────────────────────
sep("6 / 6  Combiner")
from combiner import combine_scores, build_score_dict

composite = combine_scores(sem, sk, traj, beh, dom)
score_dict = build_score_dict("TEST_001", sem, sk, traj, beh, dom)
print(f"  Composite score (0-100): {composite}")
print(f"  Score dict: {json.dumps({k: v for k, v in score_dict.items() if '_score' in k}, indent=4)}")
assert 0 <= composite <= 100, "Composite score out of 0-100 range"
print("  ✅ Combiner OK")

# ── Summary ────────────────────────────────────────────────────────────────────
print(f"\n{'═'*55}")
print("  ✅  ALL TESTS PASSED — backend is ready!")
print("  Run the server with:")
print("      uvicorn main:app --reload --port 8000")
print(f"{'═'*55}\n")
