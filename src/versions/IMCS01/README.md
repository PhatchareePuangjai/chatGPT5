# IMCS01 — Inventory Management (Starter)

สตาร์ทเตอร์โปรเจกต์สำหรับ **Inventory Management System** ตามไฟล์ `scenarios_inventory.md` โดยมี **Frontend + Backend + Database** และออกแบบให้รองรับกรณี **Concurrency/Race Condition** ในการตัดสต็อก

## โครงสร้าง

- **Scenario / Spec**: `scenarios_inventory.md`
- **Docker Compose**: `docker-compose.yml`
- **Backend**: `backend/`
  - `backend/app/main.py` (FastAPI)
  - `backend/app/models.py` (SQLAlchemy Models: `Product`, `InventoryLog`, `Alert`)
  - `backend/app/services.py` (Business logic + Transaction/Lock)
- **Frontend**: `frontend/` (Vite/React)
  - เสิร์ฟแบบ static ผ่าน Nginx และ proxy `/api/*` ไป backend

## Services

- **db**: Postgres 15
- **backend**: FastAPI + SQLAlchemy (Postgres)
  - ใช้ **Transaction + `SELECT ... FOR UPDATE`** เพื่อป้องกัน oversell เวลายิงพร้อมกันหลาย request
- **frontend**: Vite/React → build เป็น static files → เสิร์ฟด้วย Nginx
  - Nginx ทำ reverse proxy ให้ `/api/*` ไปที่ backend

## วิธีรันด้วย Docker

รันจากโฟลเดอร์ `src/versions/IMCS01/`:

```bash
docker compose up --build
```

- **Frontend**: `http://localhost:3000`
- **Backend health**: `http://localhost:8000/api/health`

หยุดบริการ:

```bash
docker compose down
```

## API (สรุป Endpoint)

- **Health**
  - `GET /api/health`
- **Products**
  - `POST /api/products` สร้างสินค้า `{ sku, name, quantity, low_stock_threshold }`
  - `GET /api/products` ดูรายการสินค้า
- **Stock Operations**
  - `POST /api/purchase` ตัดสต็อก (ซื้อ) `{ sku, quantity }`
  - `POST /api/restore` คืนสต็อก (คืน/Restock) `{ sku, quantity }`
- **Audit/Monitoring**
  - `GET /api/logs` ดู `InventoryLog` (รองรับ `?sku=...`)
  - `GET /api/alerts` ดู `Alert` (รองรับ `?resolved=true|false`)

## Mapping ตาม Scenarios

- **1) Successful Stock Deduction**
  - ตัดสต็อกสำเร็จ: `quantity` ลดลงทันที
  - สร้าง `InventoryLog` ประเภท `"SALE"` ด้วย `delta = -quantity`
- **2) Low Stock Alert Trigger**
  - เมื่อ `quantity <= low_stock_threshold` จะสร้าง `Alert(kind="LOW_STOCK", ...)`
- **3) Stock Restoration**
  - คืนสต็อก: `quantity` เพิ่มขึ้น
  - สร้าง `InventoryLog` ประเภท `"RESTOCK/RETURN"` ด้วย `delta = +quantity`

## Edge cases ที่รองรับ

- **Race Condition / แย่งซื้อชิ้นสุดท้าย**
  - ใน `purchase()` ใช้ `SELECT ... FOR UPDATE` เพื่อ lock แถวสินค้า ทำให้ “มีได้เพียง 1 request” ที่ตัดสต็อกสำเร็จเมื่อของเหลือชิ้นสุดท้าย
- **Transaction Atomicity**
  - การ “ตัดสต็อก + เขียน `InventoryLog` (+ สร้าง Alert)” อยู่ใน transaction เดียวกัน → ถ้าพังระหว่างทางจะ rollback ทั้งหมด
- **Overselling Attempt**
  - ตรวจสอบ `product.quantity < requested` ก่อนตัด → ถ้าไม่พอจะ error และไม่แก้ข้อมูล

## Quick test flow (ตามตาราง Acceptance Scenarios)

1) สร้าง `SKU-001` จำนวน `10` แล้ว `purchase` `2` → เหลือ `8` และมี log `"SALE" delta=-2`  
2) สร้าง `SKU-002` จำนวน `6` threshold `5` แล้ว `purchase` `2` → เหลือ `4` และมี alert low-stock  
3) สร้าง `SKU-003` จำนวน `5` แล้ว `restore` `1` → เหลือ `6` และมี log `"RESTOCK/RETURN" delta=+1`

