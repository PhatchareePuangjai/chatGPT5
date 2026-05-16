
# Inventory Management System

## Run Instructions

docker compose up --build

Access:
Frontend: http://localhost:3000
Backend: http://localhost:5000

## Verification

### Low Stock Alert
Product B starts with stock = 3.
Dashboard shows LOW STOCK label when stock <= 5.

### Race Condition Test
Open 5 browser tabs and click deduct simultaneously.
Because of SELECT ... FOR UPDATE inside transaction,
overselling is prevented and stock never goes negative.
