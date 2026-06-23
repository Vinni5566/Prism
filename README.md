# AI Recruiter — Backend

FastAPI backend for the intelligent candidate ranking engine.

## Stack
- **FastAPI** — API server
- **NVIDIA NIM (LLaMA 3.1 70B)** — JD parsing, explanations, outreach drafts
- **sentence-transformers** — local embeddings (all-MiniLM-L6-v2)
- **ChromaDB** — local vector store
- **SQLite** — lightweight candidate + score storage

---

## Setup (Ubuntu)

```bash
# 1. Clone and enter backend folder
cd backend

# 2. Create virtual environment
python3 -m venv venv
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set your NVIDIA API key
cp .env.example .env
# Edit .env and paste your key

# 5. Create data folder and add your dataset
mkdir -p data
cp /path/to/your/candidates.csv data/candidates.csv

# 6. Run data ingestion (one-time)
python data_ingest.py

# 7. Start the server
uvicorn main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET  | /health | Server + DB status |
| POST | /rank | **Main endpoint** — rank candidates for a JD |
| GET  | /candidates | List all candidates (paginated) |
| GET  | /candidates/{id} | Full candidate profile |
| GET  | /runs/{run_id}/results | Cached results for a run |
| POST | /feedback | Submit recruiter feedback |
| GET  | /export/{run_id} | Download ranked CSV |
| GET  | /stats | Quick stats for dashboard |

---

## Dataset Format

Place your CSV at `data/candidates.csv`. Expected columns (flexible — see COLUMN_MAP in data_ingest.py):

```
candidate_id, name, email, current_title, current_company,
years_experience, skills, domain, last_active,
profile_completeness, career_history (JSON), education (JSON)
```

Missing columns are handled gracefully with sensible defaults.

---

## Scoring Weights (defaults)

| Signal | Default Weight |
|--------|---------------|
| Semantic similarity | 30% |
| Skill depth & coverage | 25% |
| Career trajectory | 20% |
| Behavioral / activity | 15% |
| Domain relevance | 10% |

Weights are fully customisable per API call.
