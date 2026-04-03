# SCCS01 — Shopping Cart (Frontend + Backend + DB)

This folder contains a minimal full-stack project implementing the cart scenarios in `scenarios_cart.md`:

- Merge same SKU when adding again (no duplicate rows)
- Update quantity with stock checks
- Save for later (active vs saved lists)
- Money uses **integer cents** to avoid floating-point errors

## Run with Docker

From this folder:

```bash
cd src/versions/SCCS01
docker compose up --build
```

Then open:

- Frontend: `http://localhost:3000`
- Backend health: `http://localhost:8000/api/health`
- Backend products: `http://localhost:8000/api/products`

Stop:

```bash
docker compose down
```

Reset DB data (deletes Postgres volume):

```bash
docker compose down -v
```

## Run without Docker (optional)

### Backend

```bash
cd src/versions/SCCS01/backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export DATABASE_URL="postgresql+psycopg2://postgres:postgres@localhost:5432/cartdb"
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd src/versions/SCCS01/frontend
npm install
npm run dev
```

