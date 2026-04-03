# Phase 0 Research — Inventory Management

## Decision: Python 3.11 + FastAPI + SQLAlchemy + PostgreSQL
**Rationale**: The feature requires transactional integrity, row-level locking, and clear API
responses. A Python FastAPI service with SQLAlchemy on PostgreSQL provides mature transactional
support and straightforward test tooling.
**Alternatives considered**: Django ORM (heavier framework), Node.js + Prisma (team unknown),
Go + sqlc (higher upfront schema tooling).

## Decision: React + Vite + TypeScript for minimal UI
**Rationale**: Vite provides fast local dev and simple build artifacts; React enables a minimal
form-based UI with predictable state handling.
**Alternatives considered**: Server-rendered templates (less interactive), plain HTML + fetch
(no build pipeline but harder to scale).

## Decision: Docker Compose for local stack (backend + frontend + db)
**Rationale**: One-command local review is required; Compose provides predictable orchestration
and portable environment parity.
**Alternatives considered**: Manual local setup (error-prone), k8s (overkill).

## Decision: Transactional stock mutation with row-level locking
**Rationale**: Use a single DB transaction that locks the product row, validates available
stock, applies the stock delta, writes the inventory log, and optionally inserts an alert.
This satisfies atomicity, prevents oversell, and ensures log consistency.
**Alternatives considered**: Optimistic locking with retries (risk of higher contention),
application-level mutexes (not reliable across instances).

## Decision: Uniform API response envelope
**Rationale**: The constitution mandates a consistent response shape and actionable errors.
Define a response envelope in contracts to prevent divergence across endpoints.
**Alternatives considered**: Ad-hoc responses per endpoint (violates constitution).

## Decision: Testing stack (pytest + concurrency tests)
**Rationale**: pytest supports unit, integration, and concurrency tests with fixtures and
transaction rollbacks to validate atomicity and locking behavior.
**Alternatives considered**: unittest (less ergonomic), external load tools only (insufficient
for deterministic assertions).
