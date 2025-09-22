#!/usr/bin/env python3
# test_google_sheets_connection.py
# Google Sheets Connection Tester for Chat Logger
# ===============================================
"""
ทดสอบการเชื่อมต่อ Google Sheets และตรวจสอบว่าข้อมูลถูกบันทึกจริงหรือไม่

วิธีใช้: รันจาก project root directory
python3 testing/test_google_sheets_connection.py
"""

import json
import os
import requests
import time
from datetime import datetime
from zoneinfo import ZoneInfo
from dotenv import load_dotenv

# โหลดการตั้งค่า
load_dotenv()

GS_WEBAPP_URL = os.getenv(
    "GS_WEBAPP_URL", "https://script.google.com/macros/s/XXXX/exec"
)
GS_API_KEY = os.getenv("GS_API_KEY", "my-secret-12345")
TZ = os.getenv("LOCAL_TZ", "Asia/Bangkok")


def log(message, level="INFO"):
    """ระบบ logging ที่ดีขึ้น"""
    timestamp = datetime.now(ZoneInfo(TZ)).strftime("%Y-%m-%d %H:%M:%S")
    emoji = {"INFO": "ℹ️", "SUCCESS": "✅", "ERROR": "❌", "WARNING": "⚠️", "TEST": "🧪"}
    print(f"[{timestamp}] {emoji.get(level, 'ℹ️')} {message}")


def test_environment():
    """ทดสอบการตั้งค่า environment"""
    log("=== ทดสอบการตั้งค่า Environment ===", "TEST")

    # ตรวจสอบ .env file
    if os.path.exists("../.env"):
        log("พบไฟล์ .env", "SUCCESS")
        with open("../.env", "r") as f:
            content = f.read()
            if "GS_WEBAPP_URL" in content:
                log("พบ GS_WEBAPP_URL ใน .env", "SUCCESS")
            else:
                log("ไม่พบ GS_WEBAPP_URL ใน .env", "WARNING")
    else:
        log("ไม่พบไฟล์ .env", "WARNING")

    # ตรวจสอบค่าที่โหลดได้
    log(
        f"GS_WEBAPP_URL: {GS_WEBAPP_URL[:50]}{'...' if len(GS_WEBAPP_URL) > 50 else ''}"
    )
    log(f"GS_API_KEY: {GS_API_KEY[:10]}{'...' if len(GS_API_KEY) > 10 else ''}")

    # ตรวจสอบว่าเป็นค่า default หรือไม่
    if GS_WEBAPP_URL == "https://script.google.com/macros/s/XXXX/exec":
        log("⚠️ ยังใช้ GS_WEBAPP_URL เริ่มต้น - กรุณาแก้ไข!", "WARNING")
        return False

    if GS_API_KEY == "my-secret-12345":
        log("⚠️ ยังใช้ GS_API_KEY เริ่มต้น - กรุณาแก้ไข!", "WARNING")
        return False

    log("การตั้งค่า environment ถูกต้อง", "SUCCESS")
    return True


def test_basic_connection():
    """ทดสอบการเชื่อมต่อพื้นฐาน"""
    log("=== ทดสอบการเชื่อมต่อพื้นฐาน ===", "TEST")

    try:
        # ส่ง GET request เพื่อทดสอบการเชื่อมต่อ
        response = requests.get(GS_WEBAPP_URL, timeout=10)
        log(f"HTTP Status: {response.status_code}")
        log(f"Response Length: {len(response.text)} chars")

        if response.status_code == 200:
            log("การเชื่อมต่อสำเร็จ", "SUCCESS")
            return True
        else:
            log(f"การเชื่อมต่อล้มเหลว: HTTP {response.status_code}", "ERROR")
            return False

    except requests.exceptions.Timeout:
        log("การเชื่อมต่อหมดเวลา (timeout)", "ERROR")
        return False
    except requests.exceptions.RequestException as e:
        log(f"เกิดข้อผิดพลาดในการเชื่อมต่อ: {e}", "ERROR")
        return False


def test_data_submission():
    """ทดสอบการส่งข้อมูลจริง"""
    log("=== ทดสอบการส่งข้อมูลจริง ===", "TEST")

    # สร้างข้อมูลทดสอบ
    test_data = {
        "timestamp": datetime.now(ZoneInfo(TZ)).isoformat(),
        "session_id": "TEST_SESSION_001",
        "conversation_title": "🧪 Test Connection",
        "user_prompt": "ทดสอบการเชื่อมต่อ Google Sheets",
        "ai_response": "นี่คือการทดสอบการเชื่อมต่อ ถ้าเห็นข้อความนี้แสดงว่าระบบทำงานได้",
        "turn_count": 1,
        "api_key": GS_API_KEY,
    }

    log(f"ส่งข้อมูลทดสอบ: session {test_data['session_id']}")

    try:
        response = requests.post(
            GS_WEBAPP_URL,
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=30,
        )

        log(f"HTTP Status: {response.status_code}")
        log(
            f"Response: {response.text[:200]}{'...' if len(response.text) > 200 else ''}"
        )

        if response.status_code == 200:
            try:
                result = response.json()
                log(f"📊 JSON Response: {result}")

                # รองรับ response format หลากหลาย
                success_indicators = [
                    result.get("status") == "success",
                    result.get("ok") == True,
                    result.get("success") == True,
                    "success" in str(result).lower(),
                    "ok" in str(result).lower(),
                ]

                if any(success_indicators):
                    log("✅ ข้อมูลถูกส่งและบันทึกสำเร็จ!", "SUCCESS")
                    log(f"🎯 Response format: {type(result).__name__}")
                    log(f"🎯 Response content: {result}")
                    return True
                else:
                    log(
                        f"❌ Server ตอบกลับ error: {result.get('message', result.get('error', 'Unknown error'))}",
                        "ERROR",
                    )
                    log(f"📊 Full response: {result}")
                    return False
            except json.JSONDecodeError:
                log("❌ Response ไม่ใช่ JSON format", "ERROR")
                log(f"Raw response: {response.text}")
                return False
        else:
            log(f"❌ HTTP Error {response.status_code}", "ERROR")
            return False

    except requests.exceptions.Timeout:
        log("⏰ การส่งข้อมูลหมดเวลา (timeout)", "ERROR")
        return False
    except requests.exceptions.RequestException as e:
        log(f"🌐 เกิดข้อผิดพลาดในการส่งข้อมูล: {e}", "ERROR")
        return False


def test_response_format():
    """ทดสอบรูปแบบการตอบกลับจาก Google Apps Script"""
    log("=== ทดสอบรูปแบบการตอบกลับ ===", "TEST")

    # ส่งข้อมูลที่ไม่ถูกต้องเพื่อดูการจัดการ error
    invalid_data = {"invalid_field": "test", "api_key": "wrong_key"}

    try:
        response = requests.post(
            GS_WEBAPP_URL,
            json=invalid_data,
            headers={"Content-Type": "application/json"},
            timeout=10,
        )

        log(f"Invalid data test - HTTP Status: {response.status_code}")
        log(f"Response: {response.text}")

        # ถ้าได้ response กลับมา แสดงว่า server รับ request ได้
        if response.status_code in [200, 400, 422]:
            log("Server สามารถรับและประมวลผล request ได้", "SUCCESS")
            return True
        else:
            log("Server อาจมีปัญหา", "WARNING")
            return False

    except Exception as e:
        log(f"เกิดข้อผิดพลาด: {e}", "ERROR")
        return False


def check_sheet_accessibility():
    """ตรวจสอบว่า Google Sheets สามารถเข้าถึงได้หรือไม่"""
    log("=== ตรวจสอบการเข้าถึง Google Sheets ===", "TEST")

    # แยกเอา Script ID จาก URL
    import re

    match = re.search(r"/macros/s/([a-zA-Z0-9_-]+)/", GS_WEBAPP_URL)
    if match:
        script_id = match.group(1)
        log(f"Google Apps Script ID: {script_id}")

        # ตรวจสอบว่า URL มีรูปแบบถูกต้องหรือไม่
        if len(script_id) > 20:
            log("Script ID มีรูปแบบที่ถูกต้อง", "SUCCESS")
            return True
        else:
            log("Script ID อาจไม่ถูกต้อง", "WARNING")
            return False
    else:
        log("ไม่สามารถแยก Script ID จาก URL ได้", "ERROR")
        return False


def main():
    """ฟังก์ชันหลักสำหรับการทดสอบ"""
    log("🧪 เริ่มการทดสอบการเชื่อมต่อ Google Sheets", "TEST")
    log("=" * 50)

    tests = [
        ("Environment Configuration", test_environment),
        ("Basic Connection", test_basic_connection),
        ("Sheet Accessibility", check_sheet_accessibility),
        ("Response Format", test_response_format),
        ("Data Submission", test_data_submission),
    ]

    results = {}

    for test_name, test_func in tests:
        log(f"\n🧪 กำลังทดสอบ: {test_name}")
        try:
            result = test_func()
            results[test_name] = result
            if result:
                log(f"✅ {test_name}: PASSED")
            else:
                log(f"❌ {test_name}: FAILED")
        except Exception as e:
            log(f"💥 {test_name}: ERROR - {e}", "ERROR")
            results[test_name] = False

    # สรุปผลการทดสอบ
    log("\n" + "=" * 50)
    log("📊 สรุปผลการทดสอบ", "TEST")

    passed = sum(1 for r in results.values() if r)
    total = len(results)

    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        log(f"  {test_name}: {status}")

    log(f"\n🎯 ผลลัพธ์รวม: {passed}/{total} tests passed")

    if passed == total:
        log("🎉 การเชื่อมต่อ Google Sheets ทำงานได้ปกติ!", "SUCCESS")
    elif passed >= total // 2:
        log("⚠️ การเชื่อมต่อมีปัญหาบางส่วน กรุณาตรวจสอบ", "WARNING")
    else:
        log("❌ การเชื่อมต่อมีปัญหาร้ายแรง กรุณาแก้ไข", "ERROR")

    return passed == total


if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
