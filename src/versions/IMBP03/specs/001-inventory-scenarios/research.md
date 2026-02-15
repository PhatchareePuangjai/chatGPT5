# Research: Inventory Stock Integrity

## Decision: Language and Framework

- **Decision**: Python 3.11 with FastAPI, SQLAlchemy, and Pydantic.
- **Rationale**: Python aligns with the repository naming and is well-suited for
  API services. FastAPI provides typed request/response contracts; SQLAlchemy
  supports transactional workflows; Pydantic enforces schema validation.
- **Alternatives considered**: Flask (lighter but less schema-driven), Django
  (heavier framework for the scope).

## Decision: Storage

- **Decision**: PostgreSQL.
- **Rationale**: Provides row-level locking, transactions, and strong
  consistency required for stock integrity under concurrency.
- **Alternatives considered**: MySQL (viable but less preferred for locking
  semantics), SQLite (not ideal for concurrent writes).

## Decision: Transaction Strategy

- **Decision**: Use `SELECT ... FOR UPDATE` on inventory rows and perform stock
  updates, logging, and alert checks in a single database transaction.
- **Rationale**: Ensures atomicity and prevents negative stock under concurrent
  requests.
- **Alternatives considered**: Optimistic locking with version columns (more
  complex error handling).

## Decision: Testing Approach

- **Decision**: pytest with unit tests for business rules and integration tests
  for database transactions and API endpoints.
- **Rationale**: Mirrors constitution testing standards and validates atomic
  behavior under concurrency.
- **Alternatives considered**: unittest (less ergonomic for fixtures).

## Decision: Target Platform

- **Decision**: Linux server (containerized deployment).
- **Rationale**: Standard for Python API services and compatible with Postgres
  infrastructure.
- **Alternatives considered**: Serverless (not ideal for long transactions).
