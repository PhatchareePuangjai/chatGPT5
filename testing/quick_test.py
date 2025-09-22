#!/usr/bin/env python3
# quick_test.py - Quick Google Sheets Test
"""
ทดสอบเร็วๆ ว่า Google Sheets รับข้อมูลได้จริงหรือไม่
"""

import json
import os
import requests
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

GS_WEBAPP_URL = os.getenv("GS_WEBAPP_URL")
GS_API_KEY = os.getenv("GS_API_KEY")

print(f"🧪 Testing Google Sheets Connection...")
print(f"📍 URL: {GS_WEBAPP_URL}")
print(f"🔑 API Key: {GS_API_KEY[:10]}...")

# ข้อมูลทดสอบ
test_data = {
    "timestamp": datetime.now().isoformat(),
    "session_id": "QUICK_TEST_001",
    "conversation_title": "🧪 Quick Test",
    "user_prompt": "Test prompt",
    "ai_response": "Test response - เวลา " + datetime.now().strftime("%H:%M:%S"),
    "turn_count": 1,
    "api_key": GS_API_KEY,
}

print(f"\n📤 Sending test data...")

try:
    response = requests.post(
        GS_WEBAPP_URL,
        json=test_data,
        headers={"Content-Type": "application/json"},
        timeout=15,
    )

    print(f"📊 Status: {response.status_code}")
    print(f"📄 Response: {response.text}")

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
                print(f"✅ SUCCESS: Data saved to Google Sheets!")
                print(f"🎯 Response: {result}")
            else:
                print(
                    f"❌ ERROR: {result.get('message', result.get('error', 'Unknown error'))}"
                )
                print(f"📊 Full response: {result}")
        except:
            print(f"⚠️ Response not JSON: {response.text}")
    else:
        print(f"❌ HTTP Error: {response.status_code}")

except Exception as e:
    print(f"💥 Exception: {e}")
