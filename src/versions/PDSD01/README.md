# PDSD01

This repo is scaffolded via Spec Kit.

## Feature: Promotions & Discounts

Specs and design artifacts live in `specs/001-promotions-discounts/`.

## Local dev (planned)

## Database (PostgreSQL)

If you don’t already have a local `pdsd01` database, start Postgres via Docker (recommended):

- Start DB: `docker compose up -d db`
- Check health: `docker ps` (wait until `pdsd01-db` is healthy)

### Backend

- Install deps: `cd backend && npm install`
- Run dev server: `npm run dev`
- Run migrations (first time / after schema change): `npm run migrate`

### Frontend

- Install deps: `cd frontend && npm install`
- Run dev server: `npm run dev`
