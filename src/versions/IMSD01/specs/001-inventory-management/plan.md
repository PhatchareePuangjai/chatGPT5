# Implementation Plan: Inventory Management — Stock Mutation & Alerts

**Branch**: `001-inventory-management` | **Date**: 2026-04-03 | **Spec**: `specs/001-inventory-management/spec.md`
**Input**: Feature specification from `specs/001-inventory-management/spec.md`

**Note**: This plan includes a minimal frontend UI and Dockerized local stack (backend + frontend + database).

## Summary

Implement atomic stock deduction/restoration with immutable logs and low-stock alerts. Provide a
minimal frontend UI for purchase/cancel flows, and package backend/frontend/database via Docker
Compose for one-command local review.

## Technical Context

**Language/Version**: Python 3.11 (backend), Node.js 20 (frontend)  
**Primary Dependencies**: FastAPI, SQLAlchemy 2.x, psycopg, Pydantic; React + Vite + TypeScript  
**Storage**: PostgreSQL (transactional, row-level locking)  
**Testing**: pytest (backend), Vitest (frontend basic)  
**Target Platform**: Dockerized local stack  
**Project Type**: web-service + SPA frontend  
**Performance Goals**: p95 ≤ 200ms for stock mutation operations  
**Constraints**: no external I/O inside DB transactions; atomic updates and log writes  
**Scale/Scope**: MVP scope for single-service inventory operations with minimal UI

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Code Quality & Maintainability: PASS (service-layer domain logic; frontend isolated)
- Testing Standards: PASS (TDD for backend; UI smoke tests optional)
- UX Consistency: PASS (uniform response envelope enforced in contracts)
- Performance Requirements: PASS (transaction scope bounded; row locks documented)

**Re-check (post Phase 1 design)**: PASS (contracts + data-model align with principles)

## Project Structure

### Documentation (this feature)

```text
specs/001-inventory-management/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── api/
│   ├── config/
│   ├── db/
│   ├── models/
│   └── services/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── index.html

infrastructure/
├── docker/
│   ├── backend.Dockerfile
│   └── frontend.Dockerfile
└── docker-compose.yml
```

**Structure Decision**: Split backend/frontend for clarity and Dockerized local review. Backend
keeps service-layer domain logic; frontend is minimal UI for purchase/cancel flows.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| | | |
