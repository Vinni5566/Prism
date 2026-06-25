"""
resume_parser.py — Parse raw resume text using NVIDIA NIM LLaMA-3.1-70B.
Outputs a structured JSON dictionary matching the database schema.
"""

import json
from typing import Dict, Any
from llm_client import chat, system_user

SYSTEM_PROMPT = """You are an expert AI recruiting assistant.
Your task is to parse raw text from a candidate's resume and extract details into a structured JSON object.

Extract data exactly matching the following JSON schema:
{
  "name": "Candidate's full name (default: Unknown)",
  "email": "Candidate's email address (default: empty string)",
  "phone": "Candidate's phone number (default: empty string)",
  "location": "Candidate's city and state/country (default: empty string)",
  "current_title": "Current job title (default: empty string)",
  "current_company": "Current company name (default: empty string)",
  "years_experience": 0.0, // Float, estimate total years of professional experience across all roles
  "skills": ["Skill 1", "Skill 2"], // Flat list of unique technical/domain skills (default: empty list)
  "career_history": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "start_date": "YYYY-MM (default: empty string)",
      "end_date": "YYYY-MM or 'present' (default: empty string)",
      "description": "Short description of duties and achievements"
    }
  ],
  "education": [
    {
      "degree": "Degree name, e.g., B.Tech / B.S. / M.S. (default: empty string)",
      "field": "Field of study, e.g., Computer Science",
      "school": "University / College name"
    }
  ],
  "domain": "Target industry/domain (e.g., saas, fintech, healthcare, e-commerce, banking, logistics, gaming)",
  "headline": "A short, professional headline (default: empty string)",
  "summary": "A brief summary of candidate's background (default: empty string)",
  "country": "Country where the candidate resides (default: empty string)",
  "current_company_size": "Estimated company size, e.g. Small / Medium / Large (default: empty string)",
  "current_industry": "Industry of their current company (default: empty string)"
}

CRITICAL RULES:
1. Return ONLY the raw JSON object. Do not wrap it in markdown code blocks like ```json ... ```. No extra commentary, no notes, no text before or after the JSON.
2. Ensure values are correctly typed (e.g., years_experience must be a float, skills must be a list of strings).
3. If information is missing, use the default values specified.
"""

def parse_resume_text(text: str) -> Dict[str, Any]:
    """
    Sends raw resume text to LLaMA-3.1-70B and parses the structured JSON output.
    """
    if not text or not text.strip():
        return _empty_candidate()

    messages = system_user(SYSTEM_PROMPT, f"Resume raw text:\n\n{text}")
    response = chat(messages, temperature=0.1, max_tokens=2000)
    
    # Robust JSON extraction
    clean_response = response.strip()
    if clean_response.startswith("```"):
        # Remove ```json and ``` lines
        lines = clean_response.splitlines()
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].startswith("```"):
            lines = lines[:-1]
        clean_response = "\n".join(lines).strip()

    try:
        data = json.loads(clean_response)
        return _validate_and_normalize(data)
    except Exception as e:
        print(f"[ResumeParser] JSON decoding failed: {e}. Raw response snippet:\n{response[:200]}")
        return _empty_candidate()

def _validate_and_normalize(data: Dict[str, Any]) -> Dict[str, Any]:
    """Ensure all required fields exist and are of correct types."""
    default = _empty_candidate()
    normalized = {}
    
    normalized["name"] = str(data.get("name") or default["name"])
    normalized["email"] = str(data.get("email") or default["email"])
    normalized["phone"] = str(data.get("phone") or default["phone"])
    normalized["location"] = str(data.get("location") or default["location"])
    normalized["current_title"] = str(data.get("current_title") or default["current_title"])
    normalized["current_company"] = str(data.get("current_company") or default["current_company"])
    
    try:
        normalized["years_experience"] = float(data.get("years_experience", 0.0))
    except (ValueError, TypeError):
        normalized["years_experience"] = 0.0

    # Skills format
    skills_raw = data.get("skills") or []
    skills = []
    if isinstance(skills_raw, list):
        for s in skills_raw:
            if isinstance(s, str):
                skills.append(s)
            elif isinstance(s, dict) and s.get("name"):
                skills.append(s.get("name"))
    normalized["skills"] = skills

    # Career history format
    history_raw = data.get("career_history") or []
    history = []
    if isinstance(history_raw, list):
        for job in history_raw:
            if isinstance(job, dict):
                history.append({
                    "title": str(job.get("title") or ""),
                    "company": str(job.get("company") or ""),
                    "start_date": str(job.get("start_date") or ""),
                    "end_date": str(job.get("end_date") or ""),
                    "description": str(job.get("description") or "")
                })
    normalized["career_history"] = history

    # Education format
    edu_raw = data.get("education") or []
    edu = []
    if isinstance(edu_raw, list):
        for e in edu_raw:
            if isinstance(e, dict):
                edu.append({
                    "degree": str(e.get("degree") or ""),
                    "field": str(e.get("field") or ""),
                    "school": str(e.get("school") or "")
                })
    normalized["education"] = edu

    normalized["domain"] = str(data.get("domain") or default["domain"]).lower()
    normalized["headline"] = str(data.get("headline") or default["headline"])
    normalized["summary"] = str(data.get("summary") or default["summary"])
    normalized["country"] = str(data.get("country") or default["country"])
    normalized["current_company_size"] = str(data.get("current_company_size") or default["current_company_size"])
    normalized["current_industry"] = str(data.get("current_industry") or default["current_industry"])

    return normalized

def _empty_candidate() -> Dict[str, Any]:
    return {
        "name": "Unknown Candidate",
        "email": "",
        "phone": "",
        "location": "",
        "current_title": "",
        "current_company": "",
        "years_experience": 0.0,
        "skills": [],
        "career_history": [],
        "education": [],
        "domain": "",
        "headline": "",
        "summary": "",
        "country": "",
        "current_company_size": "",
        "current_industry": ""
    }
