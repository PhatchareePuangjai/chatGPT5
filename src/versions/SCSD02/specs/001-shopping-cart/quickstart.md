# Quickstart: Shopping Cart System

## Prerequisites

- Node.js 20 LTS
- Package manager selected by the repository
- PostgreSQL 16-compatible database
- Environment variables for database connection and app runtime configuration

## 1. Install Dependencies

```bash
npm install
```

## 2. Configure Environment

Create local backend configuration using the repository's standard environment file.
Required values:

```text
DATABASE_URL=postgres://user:password@localhost:5432/scsd02
NODE_ENV=development
```

## 3. Run Migrations

```bash
npm run db:migrate
```

Expected result:

- Cart tables exist.
- Cart item status supports active and saved states.
- One active row per cart and SKU is enforced.

## 4. Start The App

```bash
npm run dev
```

Expected result:

- Backend service accepts cart requests.
- Frontend cart page can load the current cart.

## 5. Validate Primary Flows

### Update Quantity

1. Start with product A at 100 baht and quantity 1.
2. Change quantity to 3.
3. Verify quantity is 3, line total is 300 baht, and grand total updates immediately.

### Merge Duplicate SKU

1. Start with SKU-001 quantity 1 in the cart.
2. Add 2 more units of SKU-001.
3. Verify the cart has one active SKU-001 row with quantity 3.

### Reject Over-Stock Addition

1. Configure available stock as 5.
2. Start with quantity 3 in the cart.
3. Try to add 3 more units.
4. Verify the cart displays "สินค้าไม่เพียงพอ" and keeps quantity 3.

### Save For Later

1. Start with SKU-005 active in the cart.
2. Select "Save for Later".
3. Verify SKU-005 is removed from active checkout items, shown in saved items, and
   excluded from the grand total.

### Decimal Total

1. Add a product priced at 19.99 with quantity 3.
2. Verify the line total displays exactly 59.97.

## 6. Run Checks

```bash
npm run lint
npm run test:unit
npm run test:contract
npm run test:integration
npm run test:database
npm run test:frontend
```

All checks must pass before implementation is considered complete.
