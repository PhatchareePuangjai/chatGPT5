#!/usr/bin/env python3
# compare_v0_v1.py - เปรียบเทียบการทำงาน v0 vs v1.0
"""
เปรียบเทียบการส่งข้อมูลระหว่าง v0 และ v1.0
เพื่อให้เห็นความแตกต่างและตรวจสอบการแก้ไข
"""

import json
import os
import requests
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

GS_WEBAPP_URL = os.getenv("GS_WEBAPP_URL")
GS_API_KEY = os.getenv("GS_API_KEY")

print("🔄 Comparing v0 vs v1.0 Data Submission Methods")
print("=" * 60)

# ข้อมูลทดสอบเดียวกัน
test_data = {
    "timestamp": datetime.now().isoformat(),
    "session_id": "COMPARE_TEST_001",
    "model": "chatgpt.com",
    "user_prompt": "ทดสอบเปรียบเทียบ v0 vs v1.0",
    "ai_response": "นี่คือการทดสอบเปรียบเทียบ",
    "score_internal": "",
    "score_external": "",
    "notes": "🔄 Comparison Test",
    "latency_ms": "",
    "request_id": "",
    "usage": {},
}

print(f"📤 Test data: session {test_data['session_id']}")
print(f"📍 URL: {GS_WEBAPP_URL}")

# Method 1: v0 Style (ที่สำเร็จ)
print(f"\n🧪 Testing v0 method (working)...")
v0_data = test_data.copy()
v0_data["api_key"] = GS_API_KEY

try:
    response = requests.post(GS_WEBAPP_URL, json=v0_data, timeout=10)
    print(f"📊 v0 Status: {response.status_code}")
    print(f"📄 v0 Response: {response.text}")

    if response.status_code == 200:
        print(f"✅ v0 SUCCESS!")
    else:
        print(f"❌ v0 FAILED")

except Exception as e:
    print(f"💥 v0 Exception: {e}")

# Method 2: v1.0 Style (หลังแก้ไข)
print(f"\n🧪 Testing v1.0 method (after fix)...")
v1_data = test_data.copy()
v1_data["api_key"] = GS_API_KEY
v1_data["session_id"] = "COMPARE_TEST_002"  # เปลี่ยน session เพื่อไม่ซ้ำ

# เพิ่มข้อมูล atomic prompting
v1_data["atomic_analysis"] = json.dumps(
    {"atomic_prompt": {"analysis": {"token_count": 50}, "quality": 4.0}}
)
v1_data["token_efficiency"] = 0.08
v1_data["quality_score"] = 4.0

try:
    response = requests.post(
        GS_WEBAPP_URL,
        json=v1_data,
        headers={"Content-Type": "application/json"},
        timeout=30,
    )
    print(f"📊 v1.0 Status: {response.status_code}")
    print(f"📄 v1.0 Response: {response.text}")

    if response.status_code == 200:
        print(f"✅ v1.0 SUCCESS!")
    else:
        print(f"❌ v1.0 FAILED")

except Exception as e:
    print(f"💥 v1.0 Exception: {e}")

print(f"\n" + "=" * 60)
print(f"🎯 Conclusion:")
print(f"   หาก v0 และ v1.0 ได้ HTTP 200 ทั้งคู่")
print(f"   แสดงว่าการแก้ไขสำเร็จ!")
print(f"\n🚀 Next: ลองรัน v1.0 กับข้อมูลจริง:")
print(
    f"   python export_to_sheet_v1_atomic.py chatgpt-export/conversations-30-09-2025.json"
)
