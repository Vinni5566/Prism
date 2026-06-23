#!/bin/bash
# setup.sh — One-command setup for the AI Recruiter backend on Ubuntu.
#
# Usage:
#   chmod +x setup.sh
#   ./setup.sh
#
# What it does:
#   1. Checks Python version (needs 3.10+)
#   2. Creates virtual environment
#   3. Installs all dependencies
#   4. Creates .env from template if missing
#   5. Creates data/ directory
#   6. Runs ingestion if candidates.csv exists
#   7. Prints next steps

set -e   # exit immediately on error

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'   # no colour

echo ""
echo "=========================================="
echo "  AI Recruiter Backend — Setup Script"
echo "=========================================="
echo ""

# ── 1. Python version check ───────────────────────────────────────────────────
echo "Checking Python version…"
PYTHON=$(command -v python3 || command -v python)
if [ -z "$PYTHON" ]; then
    echo -e "${RED}ERROR: Python not found. Install Python 3.10+${NC}"
    exit 1
fi

PY_VERSION=$($PYTHON -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
PY_MAJOR=$($PYTHON -c "import sys; print(sys.version_info.major)")
PY_MINOR=$($PYTHON -c "import sys; print(sys.version_info.minor)")

if [ "$PY_MAJOR" -lt 3 ] || ([ "$PY_MAJOR" -eq 3 ] && [ "$PY_MINOR" -lt 10 ]); then
    echo -e "${RED}ERROR: Python 3.10+ required. Found: $PY_VERSION${NC}"
    echo "Install with: sudo apt update && sudo apt install python3.10 python3.10-venv"
    exit 1
fi
echo -e "${GREEN}✅ Python $PY_VERSION OK${NC}"

# ── 2. Virtual environment ────────────────────────────────────────────────────
if [ ! -d "venv" ]; then
    echo "Creating virtual environment…"
    $PYTHON -m venv venv
    echo -e "${GREEN}✅ venv created${NC}"
else
    echo -e "${GREEN}✅ venv already exists${NC}"
fi

source venv/bin/activate

# ── 3. Dependencies ───────────────────────────────────────────────────────────
echo ""
echo "Installing dependencies (this may take 3-5 minutes for PyTorch)…"
pip install --upgrade pip --quiet
pip install -r requirements.txt --quiet
echo -e "${GREEN}✅ Dependencies installed${NC}"

# ── 4. .env file ──────────────────────────────────────────────────────────────
echo ""
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${YELLOW}⚠️  .env created from .env.example — add your NVIDIA_API_KEY${NC}"
    else
        echo "NVIDIA_API_KEY=" > .env
        echo -e "${YELLOW}⚠️  .env created — add your NVIDIA_API_KEY${NC}"
    fi
else
    echo -e "${GREEN}✅ .env already exists${NC}"
fi

# ── 5. Data directory ─────────────────────────────────────────────────────────
echo ""
mkdir -p data/logs
echo -e "${GREEN}✅ data/ directory ready${NC}"

# ── 6. Data ingestion (if dataset exists) ─────────────────────────────────────
echo ""
if [ -f "data/candidates.csv" ]; then
    echo "Found data/candidates.csv — running ingestion…"
    python data_ingest.py --dataset data/candidates.csv
    echo -e "${GREEN}✅ Dataset ingested${NC}"
else
    echo -e "${YELLOW}⚠️  No dataset found at data/candidates.csv${NC}"
    echo "   Copy your challenge dataset there and run:"
    echo "   python data_ingest.py --dataset data/candidates.csv"
fi

# ── 7. Quick import test ──────────────────────────────────────────────────────
echo ""
echo "Running quick import test…"
python -c "
import fastapi, chromadb, sentence_transformers, openai, pandas, sqlalchemy
print('All core imports OK')
" && echo -e "${GREEN}✅ All imports successful${NC}"

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo "=========================================="
echo -e "${GREEN}  Setup complete!${NC}"
echo "=========================================="
echo ""
echo "Next steps:"
echo ""
echo "  1. Make sure your NVIDIA API key is in .env:"
echo "     NVIDIA_API_KEY=nvapi-xxxxxxxx"
echo ""
echo "  2. If you haven't added your dataset yet:"
echo "     cp /path/to/candidates.csv data/candidates.csv"
echo "     python data_ingest.py"
echo ""
echo "  3. Run the backend server:"
echo "     source venv/bin/activate"
echo "     uvicorn main:app --reload --port 8000"
echo ""
echo "  4. Open API docs in browser:"
echo "     http://localhost:8000/docs"
echo ""
echo "  5. Run test suite:"
echo "     python test_backend.py"
echo ""
