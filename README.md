# Chat + Google Sheet Logger (Python)

CLI สำหรับคุยกับ OpenAI **Responses API** และบันทึก log ไป Google Sheets (ผ่าน Apps Script Web App)

## ใช้ยังไง
```bash
pip install -r requirements.txt
cp .env.example .env
# แก้ค่า .env ให้เรียบร้อย
python chat_gsheet_logger.py
```

- พิมพ์ข้อความเพื่อคุยกับ AI
- ใส่คะแนนคำตอบล่าสุดได้ด้วยคำสั่ง: `:score 4 note=ดีมาก`
- ระบบจะยิง log ทุกเทิร์นไปยัง Google Sheet อัตโนมัติ

## ต้องมีอะไรบ้าง
1) **OpenAI API Key** → ใส่ใน `.env`
2) **Apps Script Web App** บน Google Sheet ที่รับ `POST` และ `appendRow` (ดูตัวอย่างโค้ดในคำตอบก่อนหน้า)

## หมายเหตุ
- เก็บประวัติแค่ไม่กี่เทิร์นเพื่อคงบริบท (`HISTORY_MAX_TURNS`)
- ถ้าไม่ได้ตั้งค่า GS_WEBAPP_URL/GS_API_KEY ระบบจะข้ามการ log (ไม่ล้มการคุย)
