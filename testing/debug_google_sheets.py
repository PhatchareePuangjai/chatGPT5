#!/usr/bin/env python3
# debug_google_sheets.py
# Google Sheets Debugging & Comparison Tool
# ========================================
"""
เครื่องมือสำหรับ debug และเปรียบเทียบการทำงานของ v0 vs v1.0
และแก้ไขปัญหาการเชื่อมต่อ Google Sheets
"""

import json
import os
import requests
from datetime import datetime
from zoneinfo import ZoneInfo
from dotenv import load_dotenv

load_dotenv()

GS_WEBAPP_URL = os.getenv("GS_WEBAPP_URL")
GS_API_KEY = os.getenv("GS_API_KEY")
TZ = os.getenv("LOCAL_TZ", "Asia/Bangkok")


def log(message, type="INFO"):
    """Consistent logging function"""
    timestamp = datetime.now(ZoneInfo(TZ)).strftime("%Y-%m-%d %H:%M:%S")
    emoji = {"INFO": "ℹ️", "SUCCESS": "✅", "ERROR": "❌", "WARNING": "⚠️", "DEBUG": "🔍"}
    print(f"[{timestamp}] {emoji.get(type, 'ℹ️')} {message}")


def analyze_logs():
    """วิเคราะห์ logs จากการรันครั้งที่แล้ว"""
    log("=== วิเคราะห์ปัญหาจาก logs ===", "DEBUG")

    # จากข้อมูลที่ user ให้มา
    observations = [
        "รัน export_to_sheet.py (v0) แทน export_to_sheet_v1_atomic.py",
        "HTTP Status 200 ทุกครั้ง",
        "ส่งข้อมูล 12 รายการ",
        "ไม่เห็นข้อมูลใน Google Sheets",
        "ใช้เวลาประมาณ 3-4 วินาทีต่อ request",
    ]

    for obs in observations:
        log(f"📝 {obs}")

    log("\n🎯 ปัญหาที่เป็นไปได้:", "DEBUG")
    problems = [
        "Google Apps Script ไม่ได้ save ข้อมูลจริง",
        "API Key หรือ permission ไม่ถูกต้อง",
        "Sheet structure ไม่ตรงกับข้อมูลที่ส่ง",
        "Response 200 แต่ข้อมูลไม่ได้ถูกประมวลผล",
        "Caching หรือ delay ในการแสดงผล",
    ]

    for i, problem in enumerate(problems, 1):
        log(f"  {i}. {problem}")


def test_data_format():
    """ทดสอบรูปแบบข้อมูลที่ส่งไป"""
    log("=== ทดสอบรูปแบบข้อมูล ===", "DEBUG")

    # สร้างข้อมูลในรูปแบบเดียวกับ v0
    v0_data = {
        "timestamp": datetime.now(ZoneInfo(TZ)).isoformat(),
        "session_id": "DEBUG_TEST_001",
        "conversation_title": "🔍 Debug Test v0 Format",
        "user_prompt": "ทดสอบรูปแบบข้อมูลแบบ v0",
        "ai_response": "ข้อมูลนี้ถูกส่งด้วยรูปแบบเดียวกับ export_to_sheet.py (v0)",
        "turn_count": 1,
        "api_key": GS_API_KEY,
    }

    log("📤 ส่งข้อมูลรูปแบบ v0...")
    log(f"📊 Data size: {len(json.dumps(v0_data))} bytes")

    try:
        response = requests.post(
            GS_WEBAPP_URL,
            json=v0_data,
            headers={"Content-Type": "application/json"},
            timeout=20,
        )

        log(f"📊 Status: {response.status_code}")
        log(f"📄 Response length: {len(response.text)} chars")
        log(f"📄 Response: {response.text}")

        # วิเคราะห์ response
        if response.status_code == 200:
            try:
                result = response.json()
                log(f"✅ JSON Response: {result}")

                if result.get("status") == "success":
                    log("✅ Data processed successfully!", "SUCCESS")
                    return True
                else:
                    log(f"❌ Server error: {result.get('message', 'Unknown')}", "ERROR")
                    return False

            except json.JSONDecodeError:
                log("⚠️ Response is not JSON - checking content", "WARNING")
                if "success" in response.text.lower():
                    log("✅ Probably successful (text response)", "SUCCESS")
                    return True
                else:
                    log(f"❌ Unexpected response: {response.text[:200]}", "ERROR")
                    return False
        else:
            log(f"❌ HTTP Error: {response.status_code}", "ERROR")
            return False

    except Exception as e:
        log(f"💥 Exception: {e}", "ERROR")
        return False


def test_minimal_payload():
    """ทดสอบด้วยข้อมูลขั้นต่ำ"""
    log("=== ทดสอบข้อมูลขั้นต่ำ ===", "DEBUG")

    minimal_data = {
        "api_key": GS_API_KEY,
        "test": "minimal payload",
        "timestamp": datetime.now().isoformat(),
    }

    log("📤 ส่งข้อมูลขั้นต่ำ...")

    try:
        response = requests.post(GS_WEBAPP_URL, json=minimal_data, timeout=10)

        log(f"📊 Status: {response.status_code}")
        log(f"📄 Response: {response.text}")

        return response.status_code == 200

    except Exception as e:
        log(f"💥 Exception: {e}", "ERROR")
        return False


def check_google_apps_script():
    """ตรวจสอบ Google Apps Script"""
    log("=== ตรวจสอบ Google Apps Script ===", "DEBUG")

    # วิเคราะห์ URL
    log(f"📍 URL: {GS_WEBAPP_URL}")

    if "/macros/s/" in GS_WEBAPP_URL and "/exec" in GS_WEBAPP_URL:
        log("✅ URL รูปแบบถูกต้อง", "SUCCESS")
    else:
        log("❌ URL รูปแบบไม่ถูกต้อง", "ERROR")
        return False

    # ทดสอบ GET request
    log("📤 ทดสอบ GET request...")
    try:
        response = requests.get(GS_WEBAPP_URL, timeout=10)
        log(f"📊 GET Status: {response.status_code}")
        log(f"📄 GET Response: {response.text[:200]}...")

        if response.status_code == 200:
            log("✅ GET request สำเร็จ", "SUCCESS")
        else:
            log("⚠️ GET request ไม่สำเร็จ", "WARNING")

    except Exception as e:
        log(f"❌ GET request ล้มเหลว: {e}", "ERROR")

    return True


def diagnostic_summary():
    """สรุปการ diagnostic"""
    log("=== สรุปการวินิจฉัย ===", "DEBUG")

    recommendations = [
        "1. ตรวจสอบ Google Sheets - เปิดดู sheet ตรงๆ ว่ามีข้อมูลหรือไม่",
        "2. ตรวจสอบ Google Apps Script - ดู execution transcript",
        "3. ลองใช้ v1.0 ที่มี debug logging ดีกว่า",
        "4. ตรวจสอบ permission ของ Google Apps Script",
        "5. ทดสอบส่งข้อมูลผ่าน Google Apps Script editor โดยตรง",
    ]

    log("🔧 คำแนะนำการแก้ไข:")
    for rec in recommendations:
        log(f"   {rec}")

    log("\n📋 คำสั่งที่แนะนำ:")
    commands = [
        "python quick_test.py  # ทดสอบเร็ว",
        "python test_google_sheets_connection.py  # ทดสอบละเอียด",
        "python export_to_sheet_v1_atomic.py chatgpt-export/conversations-28-09-2025.json  # ใช้ v1.0",
    ]

    for cmd in commands:
        log(f"   {cmd}")


def main():
    """ฟังก์ชันหลัก"""
    log("🔍 เริ่มการวินิจฉัยปัญหา Google Sheets", "DEBUG")
    log("=" * 60)

    # 1. วิเคราะห์ logs
    analyze_logs()

    # 2. ตรวจสอบ Google Apps Script
    log("")
    check_google_apps_script()

    # 3. ทดสอบข้อมูลขั้นต่ำ
    log("")
    minimal_success = test_minimal_payload()

    # 4. ทดสอบรูปแบบข้อมูล v0
    log("")
    data_success = test_data_format()

    # 5. สรุป
    log("")
    diagnostic_summary()

    log("\n" + "=" * 60)
    if minimal_success and data_success:
        log("🎉 Google Sheets connection ทำงานได้! ปัญหาอาจอยู่ที่การแสดงผล", "SUCCESS")
    elif minimal_success:
        log("⚠️ Connection ได้ แต่ข้อมูลอาจมีปัญหา", "WARNING")
    else:
        log("❌ มีปัญหาการเชื่อมต่อ Google Sheets", "ERROR")


if __name__ == "__main__":
    main()
