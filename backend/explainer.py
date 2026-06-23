"""
explainer.py — NVIDIA NIM generates a 2-sentence plain-English
explanation for why each candidate ranked where they did.

Run for top-N candidates only to manage API cost.
"""

import asyncio
from typing import Dict
from openai import AsyncOpenAI
from config import NVIDIA_API_KEY, NVIDIA_BASE_URL, NVIDIA_MODEL

_client = AsyncOpenAI(
    base_url=NVIDIA_BASE_URL,
    api_key=NVIDIA_API_KEY,
)

EXPLAIN_SYSTEM = (
    "You are a concise, expert recruitment analyst. "
    "Write clear, honest, specific explanations. Never use generic filler."
)

EXPLAIN_PROMPT = """A candidate has been ranked for a job opening. Write EXACTLY 2 sentences:
- Sentence 1: The strongest reason this candidate ranked here (be specific — mention actual skills, companies, or career facts)
- Sentence 2: The main gap or caveat the recruiter should be aware of

Job Title: {job_title}
Domain: {domain}
Required Skills: {required_skills}

Candidate Name: {name}
Current Role: {current_title} at {current_company}
Years Experience: {years_experience}
Skills: {skills}
Domain: {cand_domain}

Scores (out of 100):
  Semantic fit:      {semantic}
  Skill coverage:    {skill}
  Career trajectory: {trajectory}
  Activity/intent:   {behavioral}
  Domain relevance:  {domain_score}
  COMPOSITE:         {composite}

Write only the 2 sentences. No labels, no bullet points."""


OUTREACH_SYSTEM = (
    "You are an expert tech recruiter writing personalized outreach messages. "
    "Be specific, warm, and concise. Sound human, not template-like."
)

OUTREACH_PROMPT = """Write a 3-sentence recruiter outreach message for this candidate.

Rules:
- Sentence 1: Mention one specific real detail from their background (role, company, or project)
- Sentence 2: Connect that to something specific about the open role
- Sentence 3: Clear, low-pressure call to action

Job Title: {job_title}
Company/Team context: {domain} space

Candidate Name: {name}
Current Role: {current_title} at {current_company}
Top Skills: {skills}

Write only the 3-sentence message. No subject line, no sign-off."""


async def generate_explanation(candidate: Dict, score_dict: Dict, jd_parsed: Dict) -> str:
    """Generate a 2-sentence explanation for one candidate asynchronously."""
    skills_str = ", ".join(
        str(s) for s in (candidate.get("skills") or [])[:8]
    )
    prompt = EXPLAIN_PROMPT.format(
        job_title       = jd_parsed.get("job_title", "the role"),
        domain          = jd_parsed.get("domain", ""),
        required_skills = ", ".join(jd_parsed.get("required_skills", [])[:8]),
        name            = candidate.get("name", "Candidate"),
        current_title   = candidate.get("current_title", ""),
        current_company = candidate.get("current_company", ""),
        years_experience= candidate.get("years_experience", 0),
        skills          = skills_str,
        cand_domain     = candidate.get("domain", ""),
        semantic        = score_dict.get("semantic_score", 0),
        skill           = score_dict.get("skill_score", 0),
        trajectory      = score_dict.get("trajectory_score", 0),
        behavioral      = score_dict.get("behavioral_score", 0),
        domain_score    = score_dict.get("domain_score", 0),
        composite       = score_dict.get("composite_score", 0),
    )
    return await _call_llm(EXPLAIN_SYSTEM, prompt, max_tokens=200)


async def generate_outreach(candidate: Dict, jd_parsed: Dict) -> str:
    """Generate a 3-sentence outreach message for one candidate."""
    skills_str = ", ".join(
        str(s) for s in (candidate.get("skills") or [])[:5]
    )
    prompt = OUTREACH_PROMPT.format(
        job_title       = jd_parsed.get("job_title", "the role"),
        domain          = jd_parsed.get("domain", ""),
        name            = candidate.get("name", "there"),
        current_title   = candidate.get("current_title", ""),
        current_company = candidate.get("current_company", ""),
        skills          = skills_str,
    )
    return await _call_llm(OUTREACH_SYSTEM, prompt, max_tokens=200)


async def batch_explain(
    candidates:  list,
    score_dicts: list,
    jd_parsed:   Dict,
    concurrency: int = 5,
) -> list:
    """
    Generate explanations for multiple candidates concurrently.
    concurrency controls how many API calls fire at once (rate-limit safe).
    """
    semaphore = asyncio.Semaphore(concurrency)

    async def _one(cand, score):
        async with semaphore:
            try:
                return await generate_explanation(cand, score, jd_parsed)
            except Exception as e:
                print(f"[Explainer] Error for {cand.get('id')}: {e}")
                return "Strong profile match based on skill and experience alignment."

    tasks = [_one(c, s) for c, s in zip(candidates, score_dicts)]
    return await asyncio.gather(*tasks)


async def batch_outreach(candidates: list, jd_parsed: Dict, concurrency: int = 3) -> list:
    """Generate outreach for multiple candidates concurrently."""
    semaphore = asyncio.Semaphore(concurrency)

    async def _one(cand):
        async with semaphore:
            try:
                return await generate_outreach(cand, jd_parsed)
            except Exception as e:
                print(f"[Outreach] Error for {cand.get('id')}: {e}")
                return ""

    tasks = [_one(c) for c in candidates]
    return await asyncio.gather(*tasks)


# ── Internal helper ────────────────────────────────────────────────────────────

async def _call_llm(system: str, user: str, max_tokens: int = 300) -> str:
    response = await _client.chat.completions.create(
        model=NVIDIA_MODEL,
        messages=[
            {"role": "system", "content": system},
            {"role": "user",   "content": user},
        ],
        temperature=0.4,
        max_tokens=max_tokens,
    )
    return response.choices[0].message.content.strip()
