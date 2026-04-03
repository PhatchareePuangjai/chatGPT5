# Quickstart — Inventory Management

## Prereqs
- Docker + Docker Compose

## Run With Docker (Recommended)
1. Build and start all services:
   - `docker compose -f infrastructure/docker-compose.yml up --build`
2. Open frontend at `http://localhost:5173`
3. Backend API at `http://localhost:8000`
4. Seeded demo products:
   - `SKU-001` / `11111111-1111-1111-1111-111111111111`
   - `SKU-002` / `22222222-2222-2222-2222-222222222222`
   - `SKU-003` / `33333333-3333-3333-3333-333333333333`

## Run Tests (Backend)
- `docker compose -f infrastructure/docker-compose.yml run --rm backend pytest`

## Try the API
- Use `POST /inventory/purchase` and `POST /inventory/cancel` as defined in `contracts/inventory-api.md`.

## Validation Checklist
- [ ] Services start with Docker Compose
- [ ] Frontend loads and can call backend
- [ ] Migrations apply cleanly
- [ ] `pytest` passes in backend container
- [ ] Purchase endpoint returns response envelope
- [ ] Cancel endpoint returns response envelope
