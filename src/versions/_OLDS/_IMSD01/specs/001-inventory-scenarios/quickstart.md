# Quickstart: Inventory Stock Integrity

## Prerequisites

- Node.js 18+
- PostgreSQL 14+

## Environment

Set the database connection string:

```bash
export DATABASE_URL="postgresql://user:pass@localhost:5432/inventory"
export PORT=8080
export VITE_API_BASE_URL="http://localhost:8080"
```

## Install Dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Run Migrations

```bash
cd backend
npm run migrate
```

## Start the API

```bash
cd backend
npm run dev
```

## Start the Frontend

```bash
cd frontend
npm run dev
```

## Performance Validation

```bash
cd backend
node scripts/benchmark-stock.js
```

- Stock update requests should complete in under 2 seconds.
- Low-stock alerts should be emitted within 1 minute.
