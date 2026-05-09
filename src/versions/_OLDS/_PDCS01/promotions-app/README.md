# Promotions & Discounts App (PDCS01)

โปรเจกต์ตัวอย่าง Full-stack สำหรับทำตาม Test Scenarios ใน `../scenarios_promotions.md` (ระบบคูปอง/โปรโมชัน)

### Tech Stack
- **Backend**: Node.js 20, Express, Postgres, Zod
- **Frontend**: React (Vite)
- **Run**: Docker Compose (แนะนำ)

---

## Start (แนะนำ: Docker Compose)

### Prerequisites
- ติดตั้ง Docker Desktop ให้เรียบร้อย

### Run

```bash
cd src/versions/PDCS01/promotions-app
docker compose up --build
```

### URLs / Ports
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:4000`
- **Backend healthcheck**: `http://localhost:4000/health`

### Database
- ใช้ Postgres ผ่าน service `db` ใน `docker-compose.yml`
- ตอน `backend` start จะรันอัตโนมัติ:
  - `npm run db:migrate`
  - `npm run db:seed`

---

## Start (ทางเลือก: Run แบบไม่ใช้ Docker)

> เหมาะสำหรับ dev/debug แบบเร็ว ๆ (ต้องมี Node 20 + Postgres ในเครื่อง)

### 1) Backend

```bash
cd src/versions/PDCS01/promotions-app/backend
cp .env.example .env
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

### 2) Frontend

```bash
cd src/versions/PDCS01/promotions-app/frontend
cp .env.example .env
npm install
npm run dev
```

---

## Scenarios ที่รองรับ (จาก `scenarios_promotions.md`)
- **Coupon Validation / Min spend**: `SAVE100` (ขั้นต่ำ 500 บาท)
- **Cart Total Discount %**: `CART10` (ลด 10%)
- **Expiration Date Check**: `EXPIRED` (หมดอายุ)
- **Coupon Usage Limit**: `WELCOME` (1 ครั้ง/คน)
- **Order of Operations**: ส่วนลดเปอร์เซ็นต์ก่อน แล้วค่อย fixed
- **Negative Total Protection**: ยอดสุทธิไม่ติดลบ (ต่ำสุด 0)

---

## API

### Health
- **GET** `/health`

Response:
```json
{ "status": "ok" }
```

### Get cart summary
- **GET** `/api/cart?userId=demo-user`

ตัวอย่าง:
```bash
curl "http://localhost:4000/api/cart?userId=demo-user"
```

Response (ตัวอย่าง):
```json
{
  "user_id": "demo-user",
  "subtotal_cents": 200000,
  "discount_total_cents": 0,
  "grand_total_cents": 200000,
  "currency": "THB",
  "discounts": []
}
```

### Apply coupon
- **POST** `/api/promotions/apply`

Body:
```json
{ "couponCode": "CART10", "userId": "demo-user" }
```

ตัวอย่าง:
```bash
curl -X POST "http://localhost:4000/api/promotions/apply" \
  -H "Content-Type: application/json" \
  -d '{"userId":"demo-user","couponCode":"CART10"}'
```

Response (ตัวอย่าง):
```json
{
  "message": "ใช้คูปองสำเร็จ",
  "applied_discount_cents": 20000,
  "cart": {
    "user_id": "demo-user",
    "subtotal_cents": 200000,
    "discount_total_cents": 20000,
    "grand_total_cents": 180000,
    "currency": "THB",
    "discounts": [
      { "code": "CART10", "amount_cents": 20000, "priority": 1, "type": "percent", "reason": "applied", "created_at": "..." }
    ]
  }
}
```

### Error format (ทุก endpoint ที่ error)
```json
{ "error": "ข้อความแจ้งเตือน", "reason": "reason_code" }
```

ตัวอย่าง `reason` ที่พบได้:
- `expired`
- `min_spend_failed`
- `usage_limit`
- `duplicate`
- `not_found`
- `validation_error`

---

## Quick test coupons (seed data)
ใน seed จะมีคูปอง:
- `SAVE100` fixed 100 บาท (ขั้นต่ำ 500 บาท)
- `CART10` ลด 10%
- `EXPIRED` หมดอายุ
- `WELCOME` fixed 100 บาท (จำกัด 1 ครั้ง/คน)


