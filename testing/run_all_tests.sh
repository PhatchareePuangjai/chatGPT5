#!/bin/bash
# run_all_tests.sh
# ทดสอบ Google Sheets connection ทุกแบบ
# วิธีใช้: รันจาก project root directory: bash testing/run_all_tests.sh

echo "🧪 เริ่มการทดสอบ Google Sheets..."
echo "=================================="

# ตรวจสอบว่าอยู่ใน project root directory
if [ ! -f "export_to_sheet_v1_atomic.py" ]; then
    echo "❌ กรุณารันจาก project root directory"
    echo "   bash testing/run_all_tests.sh"
    exit 1
fi

echo ""
echo "📋 1. เช็คสถานะระบบ..."
python3 testing/check_status.py

echo ""
echo "🧪 2. ทดสอบการเชื่อมต่อเร็ว..."
python3 testing/quick_test.py

echo ""
echo "🔍 3. วินิจฉัยปัญหา..."
python3 testing/debug_google_sheets.py

echo ""
echo "✨ 4. แนะนำ: ลองใช้ v1.0..."
echo "คำสั่ง: python3 export_to_sheet_v1_atomic.py chatgpt-export/conversations-28-09-2025.json"

echo ""
echo "=================================="
echo "🎯 การทดสอบเสร็จสิ้น!"