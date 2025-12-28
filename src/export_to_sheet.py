# export_to_sheet.py
#
# วิธีการใช้งาน (How to run):
# 1. เปิด Terminal
# 2. รันคำสั่ง: python export_to_sheet.py <path_to_conversations.json>
#
# ตัวอย่าง:
# python export_to_sheet.py ./versions/v.3/chatgpt-export/xxx/conversations.json
#
# หากไม่ระบุไฟล์ จะใช้ค่าเริ่มต้นเป็น ./chatgpt-export/conversations.json

import json, os
import requests
import hashlib
from datetime import datetime
from zoneinfo import ZoneInfo
from dotenv import load_dotenv
import tiktoken

# โหลดค่าจากไฟล์ .env
load_dotenv()

GS_WEBAPP_URL = os.getenv(
    "GS_WEBAPP_URL", "https://script.google.com/macros/s/XXXX/exec"
)
GS_API_KEY = os.getenv("GS_API_KEY", "my-secret-12345")
TZ = os.getenv("LOCAL_TZ", "Asia/Bangkok")
CACHE_FILE = os.getenv("CACHE_FILE", ".export_cache.json")


def count_tokens(text, model="gpt-3.5-turbo"):
    if text is None:
        return 0
    if not isinstance(text, str):
        text = str(text)
    if not text:
        return 0
    try:
        encoding = tiktoken.encoding_for_model(model)
    except KeyError:
        encoding = tiktoken.get_encoding("cl100k_base")
    return len(encoding.encode(text))


# เพิ่ม logging function
def log(message):
    print(f"[{datetime.now(ZoneInfo(TZ)).strftime('%Y-%m-%d %H:%M:%S')}] {message}")


def iso(ts):
    # ts อาจเป็นวินาที float หรือ None
    if ts is None:
        return datetime.now(ZoneInfo(TZ)).isoformat()
    return datetime.fromtimestamp(float(ts), tz=ZoneInfo(TZ)).isoformat()


# โหลดและบันทึกแคช
def load_cache():
    try:
        if os.path.exists(CACHE_FILE):
            with open(CACHE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        return {}
    except Exception as e:
        log(f"เกิดข้อผิดพลาดในการโหลดแคช: {str(e)}")
        return {}


def save_cache(cache):
    try:
        with open(CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(cache, f, ensure_ascii=False, indent=2)
    except Exception as e:
        log(f"เกิดข้อผิดพลาดในการบันทึกแคช: {str(e)}")


# สร้าง hash key จากข้อมูลเพื่อตรวจสอบความซ้ำซ้อน
def create_row_hash(row):
    key = f"{row['session_id']}_{row['timestamp']}_{row['user_prompt'][:50]}_{row['ai_response'][:50]}"
    return hashlib.md5(key.encode("utf-8")).hexdigest()


def post(row, cache):
    # สร้าง hash key จากข้อมูล
    row_hash = create_row_hash(row)

    # ตรวจสอบว่าเคยส่งข้อมูลนี้ไปแล้วหรือไม่
    if row_hash in cache:
        log(f"ข้ามการส่งข้อมูลซ้ำ: {row['session_id']} - {row['timestamp']}")
        return False

    row["api_key"] = GS_API_KEY
    log(f"กำลังส่งข้อมูลไปยัง {GS_WEBAPP_URL}")

    try:
        response = requests.post(GS_WEBAPP_URL, json=row, timeout=10)
        log(f"ส่งข้อมูลสำเร็จ: สถานะ {response.status_code}")

        if response.status_code == 200:
            # บันทึกลงแคชเมื่อส่งสำเร็จ
            cache[row_hash] = {
                "timestamp": row["timestamp"],
                "session_id": row["session_id"],
                "sent_at": datetime.now(ZoneInfo(TZ)).isoformat(),
            }
            return True

        if response.status_code == 401:
            log("เกิดข้อผิดพลาดในการยืนยันตัวตน (Unauthorized)")

        return False
    except Exception as e:
        log(f"เกิดข้อผิดพลาดในการส่งข้อมูล: {str(e)}")
        return False


def main(path="./chatgpt-export/conversations.json"):
    log(f"เริ่มการทำงาน: กำลังอ่านไฟล์ {path}")

    # โหลดแคชสำหรับตรวจสอบการส่งข้อมูลซ้ำ
    cache = load_cache()
    log(f"โหลดแคชสำเร็จ: มีข้อมูลในแคช {len(cache)} รายการ")

    # อ่านไฟล์ข้อมูลการสนทนา
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    log(f"อ่านข้อมูลสำเร็จ: พบการสนทนา {len(data)} รายการ จะส่งเฉพาะ 100 รายการล่าสุด")

    # จำนวนข้อมูลที่ส่งสำเร็จ
    sent_count = 0
    skipped_count = 0

    # โครงสร้าง export อาจเปลี่ยนได้ เราจะเดินไล่ messages แบบยืดหยุ่น
    # เอาเฉพาะข้อความ 100 ข้อความล่าสุด
    for i, conv in enumerate(data):
        title = conv.get("title") or ""
        session_id = (conv.get("id") or title or "export").replace(" ", "")[:32]
        create_t = conv.get("create_time")
        mapping = conv.get("mapping") or {}

        log(f"กำลังประมวลผลการสนทนาที่ {i+1}/10: {title} (session_id: {session_id})")

        # ดึงข้อความตามลำดับเวลา
        nodes = list(mapping.values())
        nodes.sort(key=lambda n: (n.get("create_time") or 0))

        # วนอ่านเฉพาะข้อความที่มาจาก user/assistant
        user_buf = None
        for n in nodes:
            m = n.get("message")
            if not m:
                continue
            role = m.get("author", {}).get("role")
            parts = m.get("content", {}).get("parts") or []
            text = "\n".join([p for p in parts if isinstance(p, str)]).strip()
            if not text:
                continue

            if role == "user":
                user_buf = text
            elif role == "assistant":
                # จับคู่ user → assistant ถ้าไม่มี user ก่อนหน้า ก็เก็บ assistant เดี่ยว ๆ
                row = {
                    "timestamp": iso(n.get("create_time") or create_t),
                    "session_id": session_id,
                    "model": "chatgpt.com",
                    "user_prompt": user_buf or "",
                    "ai_response": text,
                    "score_internal": "",
                    "score_external": "",
                    "notes": title,
                    "latency_ms": "",
                    "request_id": "",
                    "usage": {},
                    "token_count": count_tokens(user_buf),
                }

                # ส่งข้อมูลและตรวจสอบผลลัพธ์
                if post(row, cache):
                    sent_count += 1
                else:
                    skipped_count += 1

                user_buf = None

        # ถ้ามี user ค้าง (ไม่มีคำตอบ) ก็เก็บเฉพาะ user
        if user_buf:
            row = {
                "timestamp": iso(create_t),
                "session_id": session_id,
                "model": "chatgpt.com",
                "user_prompt": user_buf,
                "ai_response": "",
                "score_internal": "",
                "score_external": "",
                "notes": title,
                "latency_ms": "",
                "request_id": "",
                "usage": {},
                "token_count": count_tokens(user_buf),
            }

            if post(row, cache):
                sent_count += 1
            else:
                skipped_count += 1

    # บันทึกแคชหลังจากส่งข้อมูลเสร็จสิ้น
    save_cache(cache)
    log(
        f"สรุปการทำงาน: ส่งข้อมูลสำเร็จ {sent_count} รายการ, ข้ามข้อมูลซ้ำ {skipped_count} รายการ"
    )
    log("การทำงานเสร็จสมบูรณ์")


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        path = sys.argv[1]
    else:
        print("คำแนะนำ: คุณสามารถระบุ path ของไฟล์ได้ เช่น python export_to_sheet.py /path/to/conversations.json")
        path = "./chatgpt-export/conversations.json"
    
    main(path)