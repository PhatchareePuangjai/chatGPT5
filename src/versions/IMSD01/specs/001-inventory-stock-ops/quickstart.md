# Quickstart: Inventory Stock Operations

Date: 2026-05-30

This quickstart describes the intended dev workflow once code is implemented for this feature.

## Prerequisites

- Node.js (LTS)
- PostgreSQL (local instance)

## Repository Structure

```text
backend/   # Express API
frontend/  # React app
```

## Configure Environment

Backend environment variables (example):

- `DATABASE_URL` (PostgreSQL connection string)
- `PORT` (API port)

## Run Backend (API)

From `backend/`:

1. Install dependencies
2. Run database migrations
3. Start dev server

## Run Frontend (UI)

From `frontend/`:

1. Install dependencies
2. Start dev server

## Run Tests

- Backend: unit + integration tests
- Frontend: component/behavior tests

## Smoke Test Checklist

1. Deduct stock for SKU-001 from 10 -> 8, confirm log entry exists.
2. Race test: 5 concurrent deducts for last unit, confirm exactly one success and final on-hand 0.
3. Deduct to cross threshold, confirm low-stock alert record exists.
4. Restore stock on cancel/expire, confirm log entry exists.
