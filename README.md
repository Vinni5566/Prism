# 🔮 Prism- Where AI Meets Intelligent Hiring

<div align="center">

**See every candidate in their true light**

*Semantic Search · Multi-Signal Scoring · Explainable AI Shortlisting*

[![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green?logo=fastapi)](https://fastapi.tiangolo.com)
[![NVIDIA NIM](https://img.shields.io/badge/NVIDIA-NIM%20LLaMA%203.1%2070B-76b900?logo=nvidia)](https://build.nvidia.com)
[![ChromaDB](https://img.shields.io/badge/ChromaDB-Vector%20Store-orange)](https://trychroma.com)
[![License](https://img.shields.io/badge/License-MIT-purple)](LICENSE)

</div>

---

## 💡 Why Prism?

A prism doesn't change light — it **reveals what was always there**.

Traditional recruiting tools see candidates as flat keyword lists. **Prism breaks that surface apart** — revealing true potential, career momentum, behavioral intent, and domain depth that keyword filters completely miss.

Just like a prism splits white light into its full spectrum, Prism splits a candidate profile into **5 distinct scoring dimensions** — giving recruiters a complete, multi-angle view of every person in their talent pool.

---

## 🧩 The Problem We Solve

Recruiters are drowning in profiles. Traditional AI tools:

- ❌ Match keywords, not meaning
- ❌ Give scores with zero explanation
- ❌ Treat a dormant 2-year-old profile the same as an active one
- ❌ Can't distinguish a rising star from someone who's plateaued
- ❌ Are fooled by AI-polished resumes
- ❌ Cost $250,000+ per year (Eightfold, HireVue)

**Prism fixes all of this in one open, explainable system.**

---

## ✨ Key Features & USPs

| Problem in Existing Tools | Prism's Solution |
|---|---|
| 🔴 Black box — no one knows why a candidate was rejected | ✅ **Glass Box Explainability** — every rank has an AI-written reason |
| 🔴 Keyword matching — misses semantic meaning | ✅ **Semantic Vector Search** — finds meaning, not just matching words |
| 🔴 Fixed scoring — can't adjust for role priorities | ✅ **Dynamic Weight Sliders** — recruiter controls what matters |
| 🔴 Ignores behavioral signals — dormant = active | ✅ **Intent Scoring** — recent activity boosts rank |
| 🔴 No career trajectory view | ✅ **Trajectory Momentum** — detects upward career velocity |
| 🔴 Enterprise-only pricing | ✅ **Open stack** — runs locally, zero licensing cost |
| 🔴 Fooled by AI-inflated resumes | ✅ **AI-Resistant Signals** — metadata ChatGPT can't fake |
| 🔴 Manual recruiter outreach | ✅ **Auto Outreach Drafts** — personalised messages for top 5 |

---

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                  JOB DESCRIPTION (raw text)                   │
└───────────────────────────┬──────────────────────────────────┘
                            │
                   ┌────────▼────────┐
                   │   JD PARSER     │  ← NVIDIA NIM LLaMA 3.1 70B
                   │                 │    extracts: required skills,
                   └────────┬────────┘    domain, seniority, deal-breakers
                            │
               ┌────────────▼────────────┐
               │        EMBEDDER         │  ← sentence-transformers
               │   (all-MiniLM-L6-v2)    │    384-dim vectors, runs locally
               └────────────┬────────────┘
                            │
               ┌────────────▼────────────┐
               │     VECTOR SEARCH       │  ← ChromaDB
               │  top-N semantic matches │    cosine similarity
               └────────────┬────────────┘
                            │
          ┌─────────────────▼─────────────────┐
          │          5-SIGNAL SCORER           │
          │                                    │
          │  ① Semantic Similarity   (30%)     │
          │  ② Skill Depth           (25%)     │
          │  ③ Career Trajectory     (20%)     │
          │  ④ Behavioral Intent     (15%)     │
          │  ⑤ Domain Relevance      (10%)     │
          │                                    │
          │   weights fully adjustable         │
          └─────────────────┬─────────────────┘
                            │
               ┌────────────▼────────────┐
               │        COMBINER         │
               │  composite score 0-100  │
               └────────────┬────────────┘
                            │
          ┌─────────────────▼─────────────────┐
          │      EXPLAINER + OUTREACH          │  ← NVIDIA NIM
          │  2-sentence AI reason per rank     │
          │  personalised outreach for top 5   │
          └─────────────────┬─────────────────┘
                            │
               ┌────────────▼────────────┐
               │     RANKED SHORTLIST    │
               │  Skill Gap Heatmap      │
               │  CSV Export             │
               └─────────────────────────┘
```

---

## 🔬 The 5 Scoring Signals — The Prism Spectrum

### ① Semantic Similarity (30%)
Vector embeddings find candidates who **mean** the right things — even with different words. "Drove top-line expansion" matches "revenue growth". Keyword search would miss this entirely.

### ② Skill Depth & Coverage (25%)
Not just "do they have it" but "how deeply?" Skills backed by multiple projects get a **1.2× credibility multiplier**. Skills listed with no evidence get **0.6×**. This is Prism's primary defense against AI-inflated resumes — ChatGPT can add skills to a resume but can't fabricate years of project history in metadata.

### ③ Career Trajectory (20%)
Analyses career history to detect upward momentum:
- Title progression (junior → senior → lead)
- Internal promotions — strongest performance signal
- Career velocity (seniority levels gained per year)
- Tenure health (fast-risers vs. job-hoppers vs. plateau)

### ④ Behavioral Intent (15%)
Answers **"are they actually looking right now?"** using metadata signals that cannot be faked:
- Days since last active (recent = high, dormant 18 months = low)
- Profile completeness ratio
- Recent skill additions
- Native platform activity score

### ⑤ Domain Relevance (10%)
Industry overlap between candidate history and the target role. Fintech candidate for fintech = 1.0. Adjacent industry (banking for fintech) = 0.65. Unrelated = 0.15. Never zero — transferable skills exist.

---

## 🚀 Quick Start

### Prerequisites
- Python **3.11** (required — 3.12+ breaks some AI dependencies)
- NVIDIA NIM API key — free at [build.nvidia.com](https://build.nvidia.com)
- Ubuntu / Mac / WSL2

### Installation

```bash
# 1. Clone Prism
git clone https://github.com/shalukumari-10/Prism.git
cd Prism

# 2. Create virtual environment (must use Python 3.11)
python3.11 -m venv venv
source venv/bin/activate

# 3. Install all dependencies
pip install --upgrade pip
pip install -r requirements.txt

# 4. Configure your API key
cp .env.example .env
nano .env
# Add: NVIDIA_API_KEY=nvapi-your-key-here

# 5. Add your candidate dataset
mkdir -p data
cp your_candidates.csv data/candidates.csv

# 6. Run data ingestion (one-time)
python data_ingest.py --dataset data/candidates.csv

# 7. Run the test suite
python test_backend.py

# 8. Launch Prism
uvicorn main:app --reload --port 8000
```

**Interactive API Docs:** http://localhost:8000/docs

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Server status, candidate count, model info |
| `POST` | `/rank` | **Core endpoint** — rank candidates for a job description |
| `GET` | `/candidates` | List all candidates (paginated) |
| `GET` | `/candidates/{id}` | Full profile for one candidate |
| `GET` | `/runs/{run_id}/results` | Cached results for a completed run |
| `POST` | `/feedback` | Recruiter feedback (not_a_fit / strong_yes / maybe) |
| `GET` | `/export/{run_id}` | Download ranked shortlist as CSV |
| `GET` | `/stats` | Quick stats for dashboard header |

### Example: Rank Candidates

```bash
curl -X POST http://localhost:8000/rank \
  -H "Content-Type: application/json" \
  -d '{
    "jd_text": "Senior Backend Engineer, 4+ years, Python FastAPI PostgreSQL Redis Docker. Fintech payments platform.",
    "weights": {
      "semantic": 0.30,
      "skill": 0.25,
      "trajectory": 0.20,
      "behavioral": 0.15,
      "domain": 0.10
    }
  }'
```

### Example Response

```json
{
  "run_id": "6512a3ae-eadf-49d4-9f38",
  "jd_parsed": {
    "job_title": "Senior Backend Engineer",
    "domain": "fintech",
    "required_skills": ["Python", "FastAPI", "PostgreSQL", "Redis", "Docker"]
  },
  "total_candidates_evaluated": 21,
  "results": [
    {
      "rank": 1,
      "name": "Rohan Verma",
      "current_title": "Backend Engineer",
      "current_company": "CRED",
      "composite_score": 80.43,
      "score_breakdown": {
        "semantic": 88.0,
        "skill": 100.0,
        "trajectory": 29.0,
        "behavioral": 88.2,
        "domain": 100.0
      },
      "explanation": "Rohan ranked #1 due to perfect skill coverage in Python, PostgreSQL, Redis and Docker, with direct fintech domain experience at CRED. Main caveat: 3 years total experience is slightly below the 4-year requirement.",
      "outreach_msg": "I came across your backend work at CRED building payment infrastructure — we're doing something very similar at scale and your experience with Go and PostgreSQL would be a strong fit..."
    }
  ]
}
```

---

## 📊 Dataset Format

Place your CSV at `data/candidates.csv`. Prism has flexible column mapping — see `COLUMN_MAP` in `data_ingest.py` to adjust to your dataset's column names.

**Expected columns:**
```
candidate_id, name, email, current_title, current_company,
years_experience, skills, domain, last_active,
profile_completeness, career_history (JSON), education (JSON)
```

---

## 🗂️ Project Structure

```
Prism/
│
├── main.py                  # FastAPI app — all API routes
├── config.py                # Settings, API keys, weight defaults
├── database.py              # SQLite — all DB operations
├── models.py                # Pydantic request / response schemas
├── ranker.py                # Master pipeline orchestrator
│
├── jd_parser.py             # NVIDIA NIM JD extraction
├── embedder.py              # Local sentence-transformer embeddings
├── vector_store.py          # ChromaDB vector operations
├── combiner.py              # Weighted score combiner
├── explainer.py             # AI explanation + outreach generator
├── llm_client.py            # Centralised NVIDIA NIM client
│
├── feedback_reranker.py     # Feedback-based re-ranking
├── exporter.py              # CSV export for submission
├── data_ingest.py           # Dataset loader + embedding pipeline
├── utils.py                 # Shared helpers
├── logger.py                # Rotating file logger
├── test_backend.py          # End-to-end test suite
├── setup.sh                 # One-command Ubuntu setup script
│
├── scorer/
│   ├── __init__.py
│   ├── semantic_scorer.py   # Signal 1 — vector similarity
│   ├── skill_scorer.py      # Signal 2 — skill depth + coverage
│   ├── trajectory_scorer.py # Signal 3 — career momentum
│   ├── behavioral_scorer.py # Signal 4 — activity + intent
│   └── domain_scorer.py     # Signal 5 — industry overlap
│
├── data/
│   └── candidates.csv       # Challenge dataset
│
├── requirements.txt
├── .env.example
└── README.md
```

---

## 🛠️ Tech Stack

| Component | Technology | Why |
|---|---|---|
| API Server | FastAPI + Uvicorn | Async, lightning fast, auto-docs |
| LLM | NVIDIA NIM LLaMA 3.1 70B | JD parsing, explanations, outreach |
| Embeddings | sentence-transformers (local) | Zero API cost, 384-dim vectors |
| Vector DB | ChromaDB | Local, persistent, zero infra needed |
| Database | SQLite | Lightweight, zero config, single file |
| Language | Python 3.11 | Full ecosystem compatibility |

---

## 🔑 Getting Your NVIDIA API Key

1. Go to **https://build.nvidia.com**
2. Sign in or create a free account
3. Click any model → **"Get API Key"**
4. Copy the key (starts with `nvapi-`)
5. Add to `.env`: `NVIDIA_API_KEY=nvapi-your-key-here`

---

## 🧪 Test Suite

```bash
source venv/bin/activate
python test_backend.py
```

```
✅  1/6  DB OK — 20 candidates in SQLite
✅  2/6  Embedder OK — vector dim: 384
✅  3/6  Vector store OK — similarity search working
✅  4/6  JD Parser OK — NVIDIA NIM responding
✅  5/6  All 5 scorers OK — scores in valid 0-1 range
✅  6/6  Combiner OK — composite score: 64.7

═══════════════════════════════════════════════
  ✅  ALL TESTS PASSED — Prism is ready!
═══════════════════════════════════════════════
```

---

## 💡 Key Design Decisions

**Why SQLite instead of PostgreSQL?**
Zero installation, single file, fast enough for thousands of candidates. Swap to PostgreSQL in `database.py` for production — interface is identical.

**Why local embeddings instead of OpenAI?**
`all-MiniLM-L6-v2` runs on CPU in milliseconds with zero API cost. For 10,000 candidates, OpenAI embeddings cost ~$1. Prism runs free.

**Why 5 signals instead of one ML model?**
Interpretability. Each signal is independently explainable and tunable. A recruiter can say "trajectory matters most for this senior role" and move the slider. A black-box model can't offer that.

**Why weight behavioral signals?**
Research shows AI tools ignoring behavioral signals produce significantly higher 18-month attrition. A perfect resume from a dormant profile is worth less than a slightly weaker one from someone actively engaged.

---

## 🔮 Roadmap

- [ ] React dashboard with skill gap heatmap
- [ ] PDF resume parsing
- [ ] Multi-JD batch ranking
- [ ] Candidate comparison side-by-side view
- [ ] ATS integrations (Greenhouse, Lever, Workday)
- [ ] Fine-tuned embedding model on recruitment data

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

## 🏆 Built For

**Track 01 — The Data & AI Challenge**
*Intelligent Candidate Discovery & Ranking*

> "Recruiters are tasked with finding the perfect fit from oceans of profiles, but traditional keyword filters are simply not cutting it."

**Prism is the smarter way.**

---

<div align="center">

🔮 **Prism** — See every candidate in their true light

[GitHub](https://github.com/shalukumari-10/Prism) · [API Docs](http://localhost:8000/docs)

</div>
