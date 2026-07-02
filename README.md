# 🔮 Prism — Where AI Meets Intelligent Hiring

<div align="center">

**See every candidate in their true light**

*Semantic Search · Multi-Signal Scoring · Explainable AI · DEI-Aware Shortlisting*

[![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.x-61dafb?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.x-646cff?logo=vite)](https://vitejs.dev)
[![NVIDIA NIM](https://img.shields.io/badge/NVIDIA-NIM%20LLaMA%203.1%2070B-76b900?logo=nvidia)](https://build.nvidia.com)
[![ChromaDB](https://img.shields.io/badge/ChromaDB-Vector%20Store-orange)](https://trychroma.com)
[![Framer Motion](https://img.shields.io/badge/Framer-Motion-pink?logo=framer)](https://framer.com/motion)
[![License](https://img.shields.io/badge/License-MIT-purple)](LICENSE)

</div>

---

## 💡 Why Prism?

A prism doesn't change light — it **reveals what was always there**.

Traditional recruiting tools see candidates as flat keyword lists. **Prism breaks that surface apart** — revealing true potential, career momentum, behavioral intent, and domain depth that keyword filters completely miss.

Just like a prism splits white light into its full spectrum, Prism splits a candidate profile into **5 distinct scoring dimensions** — giving recruiters a complete, multi-angle view of every person in their talent pool.

> **"We're not replacing recruiters. We're giving them superpowers."**

---

## 🧩 The Problem We Solve

Recruiters today are drowning in thousands of profiles. Traditional AI tools fail them in critical ways:

| ❌ What's Broken | 💥 The Real Cost |
|---|---|
| Keyword matching — misses semantic meaning | Perfect candidates rejected because of synonym differences |
| Black box scores — no explanation | Legal risk + recruiter distrust of AI |
| Treats dormant profiles same as active | High offer rejection rate — candidate wasn't actually looking |
| No career trajectory analysis | Promotes safe candidates, misses rising stars |
| Fooled by AI-polished resumes | ChatGPT inflated resumes score unfairly high |
| Fixed, non-customisable scoring | One-size-fits-all fails for different role priorities |
| Enterprise-only pricing ($250k+/year) | SMBs and growing teams left without AI recruitment tools |
| No DEI bias detection in JDs | Biased job descriptions attract homogeneous candidate pools |

**Prism fixes all of this in one open, explainable, locally-run system.**

---

## ✨ Features & USPs

### 🧠 Core Intelligence

| Problem in Existing Tools | Prism's Solution |
|---|---|
| 🔴 Black box — no one knows why a candidate was rejected | ✅ **Glass Box Explainability** — every rank has an AI-written reason |
| 🔴 Keyword matching — misses semantic meaning | ✅ **Semantic Vector Search** — finds meaning, not just matching words |
| 🔴 Fixed scoring — can't adjust for role priorities | ✅ **Dynamic Weight Sliders** — recruiter controls what matters per role |
| 🔴 Ignores behavioral signals — dormant = active | ✅ **Intent Scoring** — recent activity signals boost candidate rank |
| 🔴 No career trajectory view | ✅ **Trajectory Momentum** — detects upward career velocity |
| 🔴 Fooled by AI-inflated resumes | ✅ **AI-Resistant Signals** — metadata ChatGPT can't fake |
| 🔴 Manual recruiter outreach | ✅ **Auto Outreach Drafts** — personalised messages for top candidates |
| 🔴 Enterprise-only, $250k/year pricing | ✅ **Fully open, runs locally** — zero licensing cost, no vendor lock-in |

### 🌈 Additional Features (Beyond Core Ranking)

- **🔍 JD Bias Detector** — Scans job descriptions for exclusionary, gendered, or aggressive language (e.g. "rockstar", "ninja", "brotherhood"), explains each flag, scores inclusivity (0–100), and auto-generates a ready-to-paste unbiased rewrite
- **📤 PDF JD Upload** — Upload a job description as a PDF, Prism extracts and parses it automatically
- **📥 PDF Resume Ingestion** — Upload candidate resumes as PDFs, parsed and embedded by LLaMA 3.1 70B
- **💬 AI Interview Question Generator** — Per-candidate, role-aware interview questions generated on demand
- **📊 Skill Gap Heatmap** — Visual grid showing exactly which required skills each candidate is missing
- **🔁 Feedback Re-Ranking** — Mark candidates as `strong_yes`, `maybe`, or `not_a_fit`; the system learns and re-ranks future runs accordingly
- **📁 CSV Export** — One-click full ranked shortlist export with scores, explanations, and metadata
- **📈 Analytics Dashboard** — Domain distribution, top skills in pool, average experience, run history stats
- **🗂️ Candidate Pool Browser** — Full searchable/filterable view of all ingested candidates with editable profiles
- **🕓 Run History** — Complete log of every ranking run, expandable to see ranked results, downloadable CSVs, with a one-click "Clear History" button
- **🔒 Role-Based Auth** — Recruiter portal login with JWT-style session management

---

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                  JOB DESCRIPTION (raw text / PDF)             │
└───────────────────────────┬──────────────────────────────────┘
                            │
                   ┌────────▼────────┐
                   │   JD PARSER     │  ← NVIDIA NIM LLaMA 3.1 70B
                   │                 │    extracts: required skills, domain,
                   └────────┬────────┘    seniority, deal-breakers, soft skills
                            │
              ┌─────────────▼─────────────┐
              │      JD BIAS SCANNER      │  ← NVIDIA NIM
              │  flags biased phrases,    │    generates inclusive rewrite
              └─────────────┬─────────────┘
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
          │   all weights fully adjustable     │
          └─────────────────┬─────────────────┘
                            │
               ┌────────────▼────────────┐
               │        COMBINER         │
               │  composite score 0-100  │
               └────────────┬────────────┘
                            │
          ┌─────────────────▼─────────────────┐
          │      EXPLAINER + OUTREACH          │  ← NVIDIA NIM (parallel async)
          │  AI-written reason per candidate   │    concurrency-optimised
          │  personalised outreach for top 5   │    asyncio.Semaphore(5)
          └─────────────────┬─────────────────┘
                            │
               ┌────────────▼────────────┐
               │     RANKED SHORTLIST    │
               │  Skill Gap Heatmap      │
               │  Interview Q Generator  │
               │  Feedback Re-Ranking    │
               │  CSV Export             │
               └─────────────────────────┘
```

### Data Flow Summary

```
User pastes JD → NIM parses JD → local embedder vectorises → ChromaDB retrieves top-N 
→ 5 scorers run in parallel → combiner produces composite score → NIM explains + outreaches 
→ ranked shortlist saved to SQLite → served to React dashboard
```

---

## 🔬 The 5 Scoring Signals — The Prism Spectrum

### ① Semantic Similarity (default 30%)
Vector embeddings find candidates who **mean** the right things — even with different words. "Drove top-line expansion" matches "revenue growth". Keyword search misses this entirely. Powered by `all-MiniLM-L6-v2` running fully locally.

### ② Skill Depth & Coverage (default 25%)
Not just "do they have it" but "how deeply?" 
- Skills backed by multiple projects → **1.2× credibility multiplier**
- Skills listed with zero evidence → **0.6× credibility penalty**
- Required skills present → matched against extracted JD requirements
- This is Prism's **primary defence against AI-inflated resumes** — ChatGPT can add skills to a resume but can't fabricate years of project history in metadata.

### ③ Career Trajectory (default 20%)
Analyses career history to detect upward momentum:
- Title progression (junior → senior → lead → principal)
- Internal promotions — strongest performance signal available
- Career velocity (seniority levels gained per year)
- Tenure health (fast-risers vs. job-hoppers vs. stagnation)

### ④ Behavioral Intent (default 15%)
Answers **"are they actually looking right now?"** using signals that cannot be faked:
- Days since last active (recent = high, dormant 18+ months = penalised)
- Profile completeness ratio
- Recent skill additions detected
- Native platform activity score from dataset

### ⑤ Domain Relevance (default 10%)
Industry overlap between candidate history and the target role:
- Fintech candidate for fintech role → **1.0**
- Adjacent industry (banking for fintech) → **0.65**
- Unrelated background → **0.15** (never zero — transferable skills exist)

---

## 🖥️ Frontend Pages & UI

Prism ships with a complete, premium React web application built with Vite + Tailwind CSS + Framer Motion animations.

### Pages

| Page | Description |
|---|---|
| **Landing Page** | Public marketing page with features, USPs, live stats, animated prism background |
| **About Page** | Deep-dive on architecture, scoring signals, and the problem we solve |
| **Recruiter Login** | Secure auth portal with role-based access |
| **Dashboard** | Main ranking interface — JD input, weight sliders, animated pipeline, ranked results |
| **Candidate Pool** | Searchable, filterable, editable view of all 50+ ingested candidates |
| **Analytics** | Domain distribution charts, top skills, score trends, run statistics |
| **Run History** | Complete log of all past runs with expandable results, CSV download, and clear history |

### UI Highlights

- 🌑 **Dark glassmorphism design** with teal/violet gradient accents
- ✨ **Framer Motion** animations on every card, button, and page transition
- 🔴 **Live loading pipeline** — step-by-step animated progress during ranking
- 📊 **Skill gap heatmap** — visual grid per candidate
- 🎛️ **Interactive weight sliders** with real-time score preview
- 📱 **Fully responsive** across all screen sizes
- 🔵 **Animated dot-grid background** relevant to AI/data domain

---

## 🚀 Quick Start

### Prerequisites
- Python **3.11** (required — 3.12+ breaks some AI dependencies)
- Node.js **18+** and npm
- NVIDIA NIM API key — free at [build.nvidia.com](https://build.nvidia.com)

### Backend Setup

```bash
# 1. Clone Prism
git clone https://github.com/shalukumari-10/Prism.git
cd Prism

# 2. Create virtual environment (must use Python 3.11)
python3.11 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 3. Install all dependencies
pip install --upgrade pip
pip install -r requirements.txt

# 4. Configure your API key
cp .env.example .env
# Add: NVIDIA_API_KEY=nvapi-your-key-here

# 5. Launch Prism Backend (auto-seeds demo data on first run)
cd backend
uvicorn main:app --reload --port 8000
```

**Interactive API Docs:** http://localhost:8000/docs

### Frontend Setup

```bash
# In a new terminal
cd Prism/frontend
npm install
npm run dev
```

**Access the Web App:** http://localhost:5173

> On first startup, the backend automatically seeds **50+ demo candidates** into SQLite and ChromaDB if the database is empty. No manual data ingestion required.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Server status, candidate count, model info |
| `POST` | `/rank` | **Core endpoint** — rank candidates for a JD |
| `GET` | `/candidates` | List all candidates (paginated) |
| `GET` | `/candidates/{id}` | Full profile for one candidate |
| `PUT` | `/candidates/{id}` | Update candidate profile + re-embed |
| `GET` | `/candidates/search` | Semantic search across candidate pool |
| `POST` | `/candidates/upload` | Bulk CSV upload or PDF resume ingestion |
| `POST` | `/candidates/{id}/interview-questions` | Generate AI interview questions |
| `GET` | `/runs` | List all past ranking runs |
| `DELETE` | `/runs` | Clear all run history |
| `GET` | `/runs/{run_id}/results` | Cached results for a completed run |
| `POST` | `/feedback` | Recruiter feedback (not_a_fit / strong_yes / maybe) |
| `GET` | `/export/{run_id}` | Download ranked shortlist as CSV |
| `GET` | `/stats` | Quick stats for dashboard header |
| `GET` | `/analytics` | Aggregate pool analytics |
| `POST` | `/jd/analyze` | Parse a raw JD into structured JSON |
| `POST` | `/jd/analyze/file` | Upload JD PDF and parse |
| `POST` | `/jd/bias-scan` | Scan JD for biased/exclusionary language + get inclusive rewrite |

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

### Example: Scan JD for Bias

```bash
curl -X POST http://localhost:8000/jd/bias-scan \
  -H "Content-Type: application/json" \
  -d '{"jd_text": "We need a rockstar ninja who can crush it. Must be a self-made man."}'
```

```json
{
  "score": 55,
  "flags": [
    {
      "phrase": "rockstar ninja",
      "reason": "Exclusionary tech bro jargon that discourages non-male, non-young applicants",
      "suggestion": "skilled engineer"
    },
    {
      "phrase": "self-made man",
      "reason": "Gendered language that implicitly excludes women and non-binary candidates",
      "suggestion": "self-driven professional"
    }
  ],
  "fixed_jd": "We need a skilled engineer who can deliver outstanding results. Must be a self-driven professional."
}
```

### Example: Full Ranking Response

```json
{
  "run_id": "6512a3ae-eadf-49d4-9f38",
  "jd_parsed": {
    "job_title": "Senior Backend Engineer",
    "domain": "fintech",
    "seniority_level": "senior",
    "required_skills": ["Python", "FastAPI", "PostgreSQL", "Redis", "Docker"]
  },
  "total_candidates_evaluated": 52,
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
      "outreach_msg": "Hi Rohan, I came across your backend work at CRED building payment infrastructure — we're doing something very similar at scale and your PostgreSQL experience would be a strong fit for what we're building..."
    }
  ]
}
```

---

## 🗂️ Project Structure

```
Prism/
│
├── backend/                      # FastAPI Backend Engine
│   ├── main.py                   # FastAPI app — all API routes
│   ├── config.py                 # Settings, API keys, weight defaults
│   ├── database.py               # SQLite — all DB operations
│   ├── models.py                 # Pydantic request/response schemas
│   ├── ranker.py                 # Master 9-step pipeline orchestrator
│   │
│   ├── jd_parser.py              # NVIDIA NIM: JD extraction + bias scanning
│   ├── embedder.py               # Local sentence-transformer embeddings
│   ├── vector_store.py           # ChromaDB vector operations
│   ├── combiner.py               # Weighted multi-signal score combiner
│   ├── explainer.py              # AI explanation + outreach generator (async, parallel)
│   ├── resume_parser.py          # PDF resume → structured candidate profile
│   │
│   ├── feedback_reranker.py      # Feedback-based re-ranking logic
│   ├── data_ingest.py            # Dataset loader + embedding pipeline
│   ├── seed.py                   # Auto-seeds 50+ demo candidates on startup
│   ├── utils.py                  # Shared helpers
│   ├── test_backend.py           # End-to-end test suite
│   │
│   ├── scorer/                   # The 5 Prism Scoring Signals
│   │   ├── __init__.py
│   │   ├── semantic_scorer.py    # Signal 1 — vector similarity
│   │   ├── skill_scorer.py       # Signal 2 — skill depth + coverage
│   │   ├── trajectory_scorer.py  # Signal 3 — career momentum
│   │   ├── behavioral_scorer.py  # Signal 4 — activity + intent signals
│   │   └── domain_scorer.py      # Signal 5 — industry overlap
│   │
│   └── data/
│       └── recruiter.db          # SQLite database (auto-created)
│
├── frontend/                     # React Vite Frontend Application
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js         # Axios API client
│   │   ├── components/
│   │   │   ├── Sidebar.jsx       # Navigation sidebar
│   │   │   ├── Header.jsx        # Dashboard header with stats
│   │   │   ├── JDInput.jsx       # JD textarea + bias scanner + file upload
│   │   │   ├── WeightSliders.jsx # Dynamic scoring weight controls
│   │   │   ├── CandidateCard.jsx # Ranked candidate result card
│   │   │   ├── LoadingPipeline.jsx # Animated 9-step ranking pipeline
│   │   │   └── SkillGapMatrix.jsx  # Skill coverage heatmap
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Auth state management
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx   # Public marketing page
│   │   │   ├── AboutPage.jsx     # Architecture + features deep-dive
│   │   │   ├── AuthPage.jsx      # Recruiter login
│   │   │   ├── Dashboard.jsx     # Main ranking interface
│   │   │   ├── CandidatePool.jsx # Candidate browser + search
│   │   │   ├── Analytics.jsx     # Pool analytics dashboard
│   │   │   └── RunHistory.jsx    # Past runs log with clear history
│   │   ├── App.jsx               # Main routing
│   │   └── index.css             # Tailwind + custom glass/gradient styles
│   ├── public/
│   │   └── logo.jpg              # Prism logo
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── README.md
```

---

## 🛠️ Tech Stack

| Component | Technology | Why |
|---|---|---|
| **Frontend** | React 18 + Vite + Tailwind CSS | Lightning fast, component-based, modern styling |
| **Animations** | Framer Motion | Premium micro-interactions, scale-on-hover, page transitions |
| **API Server** | FastAPI + Uvicorn | Async, auto-docs, sub-10ms overhead |
| **LLM** | NVIDIA NIM LLaMA 3.1 70B | JD parsing, explanations, outreach, bias rewriting |
| **Embeddings** | sentence-transformers (local) | Zero API cost, 384-dim vectors, CPU-only |
| **Vector DB** | ChromaDB | Local, persistent, zero infra, cosine similarity |
| **Database** | SQLite | Zero config, single file, fast for thousands of candidates |
| **Concurrency** | Python asyncio + Semaphore(5) | Parallel LLM calls for 5× faster explanation generation |
| **Language** | Python 3.11 + JavaScript (ES2023) | Full ecosystem compatibility |

---

## ⚡ Performance Optimisations

- **Parallel LLM calls** — `asyncio.Semaphore(5)` allows 5 simultaneous NVIDIA NIM API calls for explanation and outreach generation, reducing latency from ~120s to ~25s
- **Local embeddings** — `all-MiniLM-L6-v2` runs on CPU with zero API cost; embedding 50 candidates takes ~200ms
- **Selective explanation** — only the top 5 candidates get AI explanations and outreach drafts (configurable via `TOP_N_EXPLAIN`)
- **ChromaDB persistence** — vectors are cached on disk; re-ranking the same pool is near-instant
- **SQLite WAL mode** — write-ahead logging enables safe concurrent reads during async ranking

---

## 🔑 Getting Your NVIDIA API Key

1. Go to **https://build.nvidia.com**
2. Sign in or create a free account
3. Click any model → **"Get API Key"**
4. Copy the key (starts with `nvapi-`)
5. Add to `.env`: `NVIDIA_API_KEY=nvapi-your-key-here`

**Free tier** includes generous API credits — more than enough to run the full Prism pipeline hundreds of times.

---

## 💡 Key Design Decisions

**Why SQLite instead of PostgreSQL?**
Zero installation, single file, fast enough for thousands of candidates. Swap to PostgreSQL in `database.py` for production — the interface is identical.

**Why local embeddings instead of OpenAI?**
`all-MiniLM-L6-v2` runs on CPU in milliseconds with zero API cost. For 10,000 candidates, OpenAI embeddings cost ~$1. Prism runs free — forever.

**Why 5 signals instead of one ML model?**
Interpretability. Each signal is independently explainable and tunable. A recruiter can say "trajectory matters most for this senior role" and move the slider. A black-box model can't offer that.

**Why asyncio.Semaphore for LLM calls?**
Sequential LLM calls for 10 candidates would take 120+ seconds and exceed HTTP timeout limits. Parallel calls with a semaphore limit (to avoid rate limiting) reduces this to 20–30 seconds.

**Why include a JD bias scanner?**
Biased job descriptions produce biased candidate pools before the first resume is ever read. Fixing the JD upstream is more impactful than any downstream ranking adjustment.

---

## 🧪 Test Suite

```bash
cd backend
source ../venv/bin/activate     # Windows: ..\venv\Scripts\activate
python test_backend.py
```

Expected output:
```
✅  1/6  DB OK — 52 candidates in SQLite
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

## 🔮 Roadmap

- [x] 5-signal weighted ranking engine
- [x] Semantic vector search with ChromaDB
- [x] AI-generated explanations per candidate
- [x] Personalised outreach message drafts
- [x] JD bias detection + one-click inclusive rewrite
- [x] Dynamic weight sliders
- [x] Feedback re-ranking (not_a_fit / strong_yes)
- [x] Skill gap heatmap
- [x] PDF resume ingestion
- [x] PDF JD upload
- [x] AI interview question generator
- [x] Full analytics dashboard
- [x] Run history with CSV export
- [x] Recruiter auth + session management
- [ ] Multi-JD batch ranking
- [ ] Side-by-side candidate comparison view
- [ ] ATS integrations (Greenhouse, Lever, Workday)
- [ ] Fine-tuned domain-specific embedding model

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

## 🏆 Built For

**NVIDIA + RedRob AI Recruitment Hackathon**
*Track 01 — The Data & AI Challenge: Intelligent Candidate Discovery & Ranking*

> "Recruiters are tasked with finding the perfect fit from oceans of profiles, but traditional keyword filters are simply not cutting it."

**Prism is the smarter way to hire.**

---

<div align="center">

🔮 **Prism** — See every candidate in their true light

*Built with NVIDIA NIM · ChromaDB · FastAPI · React · Framer Motion*

</div>
