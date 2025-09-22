#!/usr/bin/env python3
"""
📋 Chat Logger Status Check & Recommendation
===========================================

เช็คสถานะปัจจุบันและแนะนำการแก้ไขปัญหา Google Sheets
"""

import os
import json
from datetime import datetime


def check_files():
    """ตรวจสอบไฟล์ที่มีอยู่"""
    print("🔍 ตรวจสอบไฟล์ในระบบ...")

    files_to_check = [
        ("../export_to_sheet.py", "Original v0"),
        ("../export_to_sheet_v1_atomic.py", "v1.0 with Atomic Prompting"),
        ("../.env", "Environment configuration"),
        ("../.export_cache.json", "Cache file"),
        ("../chatgpt-export/conversations-28-09-2025.json", "Data file"),
        ("../backup_data/", "Local backup directory"),
    ]

    for file_path, description in files_to_check:
        if os.path.exists(file_path):
            if os.path.isdir(file_path):
                count = len(os.listdir(file_path)) if os.path.isdir(file_path) else 0
                print(f"✅ {description}: {file_path} ({count} files)")
            else:
                size = os.path.getsize(file_path)
                print(f"✅ {description}: {file_path} ({size} bytes)")
        else:
            print(f"❌ {description}: {file_path} (ไม่พบ)")


def analyze_problem():
    """วิเคราะห์ปัญหาจากข้อมูลที่ user ให้"""
    print("\n🎯 วิเคราะห์ปัญหาจากข้อมูลที่รายงาน...")

    symptoms = [
        "✅ รัน export_to_sheet.py สำเร็จ",
        "✅ HTTP 200 response ทุกครั้ง",
        "✅ ส่งข้อมูล 12 รายการ",
        "❌ ไม่เห็นข้อมูลใน Google Sheets",
        "⏰ ใช้เวลา 3-4 วินาทีต่อ request",
    ]

    for symptom in symptoms:
        print(f"  {symptom}")

    print(f"\n💡 สรุป: การเชื่อมต่อสำเร็จ แต่ข้อมูลไม่ถูกบันทึกใน Google Sheets")


def recommend_solutions():
    """แนะนำวิธีแก้ไข"""
    print("\n🔧 วิธีแก้ไขที่แนะนำ (เรียงลำดับความสำคัญ):")

    solutions = [
        (
            "1. ใช้ v1.0 แทน v0",
            "python export_to_sheet_v1_atomic.py chatgpt-export/conversations-28-09-2025.json",
            "v1.0 มี debug logging ดีกว่า และมี local backup",
        ),
        (
            "2. ทดสอบการเชื่อมต่อ",
            "python quick_test.py",
            "ทดสอบเร็วๆ ว่า Google Sheets รับข้อมูลได้จริงไหม",
        ),
        (
            "3. ตรวจสอบ Google Sheets โดยตรง",
            "เปิด Google Sheets ใน browser",
            "ดูว่ามี sheet tab และ column headers ถูกต้องไหม",
        ),
        (
            "4. ตรวจสอบ Google Apps Script",
            "เปิด script.google.com และดู execution transcript",
            "ดูว่า script ทำงานได้และมี permission ไหม",
        ),
        (
            "5. ทดสอบ debug แบบละเอียด",
            "python debug_google_sheets.py",
            "วิเคราะห์ปัญหาแบบครบถ้วน",
        ),
    ]

    for title, command, description in solutions:
        print(f"\n{title}")
        print(f"   คำสั่ง: {command}")
        print(f"   เหตุผล: {description}")


def show_version_comparison():
    """แสดงเปรียบเทียบ v0 vs v1.0"""
    print("\n📊 เปรียบเทียบ v0 vs v1.0:")

    comparison = [
        ("Error Handling", "❌ พื้นฐาน", "✅ ขั้นสูงพร้อม fallback"),
        ("Debug Logging", "❌ น้อย", "✅ ละเอียดพร้อม emoji"),
        ("Local Backup", "❌ ไม่มี", "✅ อัตโนมัติใน backup_data/"),
        ("Token Analysis", "❌ ไม่มี", "✅ Atomic prompting analysis"),
        ("Config Check", "❌ ไม่มี", "✅ ตรวจสอบก่อนส่ง"),
        ("Data Safety", "❌ สูญหายได้", "✅ ไม่สูญหายแน่นอน"),
    ]

    print(f"{'Feature':<15} {'v0':<20} {'v1.0'}")
    print("-" * 60)
    for feature, v0, v1 in comparison:
        print(f"{feature:<15} {v0:<20} {v1}")


def main():
    """ฟังก์ชันหลัก"""
    print("🧪 Chat Logger Status Check & Recommendation")
    print("=" * 50)

    check_files()
    analyze_problem()
    recommend_solutions()
    show_version_comparison()

    print("\n" + "=" * 50)
    print("🎯 แนะนำเร่งด่วน:")
    print(
        "   1. รัน: python export_to_sheet_v1_atomic.py chatgpt-export/conversations-28-09-2025.json"
    )
    print("   2. รัน: python quick_test.py")
    print("   3. ตรวจสอบ Google Sheets โดยตรง")
    print("\n💡 v1.0 จะแก้ปัญหานี้ได้และไม่ทำให้ข้อมูลสูญหาย!")


if __name__ == "__main__":
    main()
