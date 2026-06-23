"""
jd_parser.py — Sends raw JD text to NVIDIA NIM (LLaMA 3.1 70B).
Returns a structured dict with all fields the scoring engine needs.
"""

import json
import re
from typing import Dict

from openai import OpenAI
from config import NVIDIA_API_KEY, NVIDIA_BASE_URL, NVIDIA_MODEL

_client = OpenAI(
    base_url=NVIDIA_BASE_URL,
    api_key=NVIDIA_API_KEY,
)

SYSTEM_PROMPT = """You are a precise job description parser for a recruitment AI system.
Extract structured information from job descriptions and return ONLY valid JSON.
No preamble, no explanation, no markdown code blocks — just the raw JSON object."""

USER_PROMPT_TEMPLATE = """Parse this job description and return a JSON object with EXACTLY these keys:

{{
  "job_title": "extracted job title",
  "seniority_level": "junior|mid|senior|lead|principal|executive",
  "domain": "industry/domain (e.g. fintech, healthtech, saas, ecommerce, edtech, gaming, defence, general)",
  "required_skills": ["skill1", "skill2", ...],
  "preferred_skills": ["skill1", "skill2", ...],
  "years_experience_min": 0,
  "years_experience_max": 0,
  "key_responsibilities": ["resp1", "resp2", ...],
  "deal_breakers": ["thing that would disqualify a candidate"],
  "soft_skills": ["communication", "leadership", etc],
  "education_requirement": "bachelor|master|phd|any|none",
  "remote_friendly": true|false|null,
  "suggested_weight_bias": "skills|experience|trajectory|balanced",
  "domain_keywords": ["keyword1", "keyword2", ...]
}}

Rules:
- required_skills: must-have technical skills only, max 15
- preferred_skills: nice-to-have, max 10
- domain_keywords: industry-specific jargon from the JD, helps domain matching
- suggested_weight_bias: your assessment of what matters most for THIS role
- If a field cannot be determined, use null for strings or [] for arrays

JOB DESCRIPTION:
{jd_text}"""


def parse_jd(jd_text: str) -> Dict:
    """
    Parse a job description using NVIDIA NIM LLM.
    Returns structured dict. Falls back to empty structure on error.
    """
    if not jd_text or not jd_text.strip():
        return _empty_jd()

    prompt = USER_PROMPT_TEMPLATE.format(jd_text=jd_text.strip())

    try:
        response = _client.chat.completions.create(
            model=NVIDIA_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user",   "content": prompt},
            ],
            temperature=0.1,      # low temp = consistent, structured output
            max_tokens=1500,
        )

        raw = response.choices[0].message.content.strip()

        # Strip markdown code fences if model wraps in them anyway
        raw = re.sub(r"^```(?:json)?\s*", "", raw)
        raw = re.sub(r"\s*```$", "", raw)
        raw = raw.strip()

        parsed = json.loads(raw)

        # Ensure all expected keys exist (fill missing with defaults)
        return _merge_defaults(parsed)

    except json.JSONDecodeError as e:
        print(f"[JDParser] JSON parse error: {e}\nRaw: {raw[:300]}")
        return _empty_jd()
    except Exception as e:
        print(f"[JDParser] API error: {e}")
        return _empty_jd()


def _merge_defaults(parsed: Dict) -> Dict:
    defaults = _empty_jd()
    for key, val in defaults.items():
        if key not in parsed or parsed[key] is None:
            parsed[key] = val
    return parsed


def _empty_jd() -> Dict:
    return {
        "job_title":             "Unknown",
        "seniority_level":       "mid",
        "domain":                "general",
        "required_skills":       [],
        "preferred_skills":      [],
        "years_experience_min":  0,
        "years_experience_max":  20,
        "key_responsibilities":  [],
        "deal_breakers":         [],
        "soft_skills":           [],
        "education_requirement": "any",
        "remote_friendly":       None,
        "suggested_weight_bias": "balanced",
        "domain_keywords":       [],
    }
