---
name: verify-ci-report
description: Use when the user asks Codex to verify CI_TEST_RESULTS.md or METHODOLOGY.md against GitHub Actions, CodeQL, DAST ZAP, LOC, and conversation/token data for a target version or all versions.
---


# Skill: verify-ci-report

ตรวจสอบว่าข้อมูลใน `CI_TEST_RESULTS.md` และ `METHODOLOGY.md` ตรงกับความเป็นจริงหรือไม่ โดย re-fetch จาก GitHub Actions + นับจากไฟล์จริง แล้ว diff กับค่าที่เขียนไว้ใน markdown

## Usage

```text
$verify-ci-report <FOLDER_NAME>
/verify-ci-report <FOLDER_NAME>
$verify-ci-report all
/verify-ci-report all
```

ตัวอย่าง: `$verify-ci-report IMBP02` หรือ `/verify-ci-report IMBP02`

ถ้า user พิมพ์แบบเดิมจาก Claude เช่น `/verify-ci-report IMBP02` ให้ถือว่าเป็นคำสั่งเดียวกัน

## Repo ที่ใช้

```text
REPO=PhatchareePuangjai/chatGPT5
```

ดึงจาก `CI_TEST_RESULTS.md` บรรทัดแรกๆ ถ้าเปลี่ยนชื่อ repo ให้อ่านจากไฟล์นั้นก่อนเสมอ

---

## LOC Counting Convention

นับเฉพาะ **production backend source files** เท่านั้น:

**นับ:**
- `.js` และ `.py` ที่เป็น server-side / business logic
- ตรวจจาก content: มี `express`, `app.listen`, `router`, `fastapi`, `flask`, `def ` ฯลฯ
- กรณีไม่มี folder แยก ให้ดู content ก่อน — ถ้า file มี `app.listen` หรือ Express route ถือว่าเป็น backend

**ไม่นับ:**
- `node_modules/`
- `tests/`, `test_*.py`, `*.test.js`, `*.spec.js`
- Frontend: folder ชื่อ `frontend/`, `client/`, `public/`, `src/` ที่มี React components
- ไฟล์ `.html`, `.css`, `.jsx` ที่ไม่ใช่ Express route
- กรณี monolith: `index.html` หรือ client-side JS ที่ไม่มี server logic

---

## ขั้นตอน

### Step 1 — Re-fetch ข้อมูลจริง

รัน commands ต่อไปนี้พร้อมกันทั้งหมดก่อน (parallel):

#### 1A — Unit Tests (latest completed run)

```bash
gh run list --workflow=unit-tests.yml --repo <REPO> --limit 5 --json databaseId,conclusion,createdAt,status \
  | python3 -c "import json,sys; runs=json.load(sys.stdin); print(next(r['databaseId'] for r in runs if r['status']=='completed'))"
```

จาก run ID นั้น ดึง job ของ `<TARGET>` และ log:

```bash
gh run view <run-id> --repo <REPO> --log \
  | grep "<TARGET>" | grep -E "Tests:|passing|failing" | head -5
```

เก็บ: `passed`, `failed`, `total`, `run_id`, `run_date`

#### 1B — DAST (latest completed run)

```bash
gh run list --workflow=dast-zap-all.yml --repo <REPO> --limit 5 --json databaseId,conclusion,createdAt,status \
  | python3 -c "import json,sys; runs=json.load(sys.stdin); r=next(r for r in runs if r['status']=='completed'); print(r['databaseId'], r['createdAt'])"
```

```bash
gh run view <run-id> --repo <REPO> --log \
  | grep "Scan <TARGET>" | grep "FAIL-NEW" | tail -1
```

เก็บ: `FAIL_NEW`, `WARN_NEW`, `PASS`, `run_id`, `run_date`

#### 1C — CodeQL Alerts

```bash
gh api "repos/<REPO>/code-scanning/alerts?state=open&tool_name=CodeQL&per_page=100" \
  | python3 -c "
import json, sys
alerts = json.load(sys.stdin)
target = [a for a in alerts if 'versions/<TARGET>' in a.get('most_recent_instance',{}).get('location',{}).get('path','')]
high = sum(1 for a in target if a['rule'].get('security_severity_level')=='high')
medium = sum(1 for a in target if a['rule'].get('security_severity_level')=='medium')
print(f'high={high} medium={medium} total={len(target)}')
"
```

เก็บ: `high`, `medium`, `total`

#### 1D — LOC (นับจากไฟล์จริง)

```bash
find src/versions/<TARGET> \
  -not -path "*/node_modules/*" \
  -not -path "*/tests/*" \
  -not -name "*.test.js" \
  -not -name "*.spec.js" \
  -not -name "test_*.py" \
  -not -name "*.html" \
  -not -name "*.css" \
  \( -name "*.js" -o -name "*.py" \) \
  | xargs grep -l -E "app\.listen|express\(\)|router\.|fastapi|flask|@app\." 2>/dev/null
```

ถ้า backend files หาด้วย content ไม่เจอ ให้ fallback ดู folder structure (มีชื่อ `backend/`, `server/`, `api/` ไหม)

```bash
wc -l <backend-files> | tail -1
```

เก็บ: `loc_actual`

#### 1E — Token count (นับจาก conversation file จริง)

```bash
find src/versions/<TARGET> \
  -name "conversations.json" -o -name "conversation_export.json" | head -1
```

นับด้วย tiktoken `cl100k_base` บน user-side text เท่านั้น (ดูวิธีจาก `update-ci-report`)

เก็บ: `tokens_actual`, `user_turns_actual`, `ai_turns_actual`

---

### Step 2 — Parse ค่าจาก Markdown

อ่าน `CI_TEST_RESULTS.md` และ `METHODOLOGY.md` แล้ว extract ค่าต่อไปนี้สำหรับ `<TARGET>`:

**จาก CI_TEST_RESULTS.md:**
- Unit Tests table: `passed_md`, `failed_md`, `total_md`, `unit_run_id_md`
- CodeQL table: `codeql_high_md`, `codeql_med_md`, `codeql_total_md`
- DAST table: `dast_fail_md`, `dast_warn_md`, `dast_pass_md`, `dast_run_id_md`
- Interaction table: `convs_md`, `user_turns_md`, `ai_turns_md`, `tokens_md`
- Overall Summary table: `loc_md`

**Strategy aggregates** (สำหรับ strategy ที่ `<TARGET>` สังกัด เช่น BP):
- DAST Summary: `avg_warn_md`, `avg_pass_md`
- CodeQL Summary: `strategy_total_md`, `strategy_high_md`, `strategy_med_md`
- Interaction Summary: `strategy_convs_md`, `strategy_user_md`, `strategy_ai_md`, `strategy_tokens_md`

**จาก METHODOLOGY.md:**
- Section 3.4 table: `loc_method_md`, `tokens_method_md`

---

### Step 3 — Re-compute Strategy Aggregates

คำนวณ aggregates ใหม่จาก individual rows ใน markdown (ไม่ใช่จาก GitHub):

**DAST Strategy Avg:**
- รวบรวม WARN_NEW และ PASS ของทุก version ใน strategy เดียวกัน
- คำนวณ avg โดย round เป็น 1 ทศนิยม

**CodeQL Strategy Total:**
- บวก High/Medium/Total ของทุก version ใน strategy

**Interaction Strategy Total:**
- บวก Conversations/User Turns/AI Turns/Tokens ของทุก version ใน strategy

---

### Step 4 — แสดง Verification Report

แสดงผลทุก check ในรูปแบบตาราง:

```
=== Verification Report: <TARGET> (<TODAY>) ===

[Individual Values]
Check               Markdown         Actual           Status
─────────────────────────────────────────────────────────────
Unit Tests          6/7 (run #...)   6/7 (run #...)   ✅ OK / ⚠️ MISMATCH / 🔄 STALE RUN
CodeQL High         3                3                ✅ OK
CodeQL Medium       1                1                ✅ OK
CodeQL Total        4                4                ✅ OK
DAST FAIL-NEW       0                0                ✅ OK
DAST WARN-NEW       9                9                ✅ OK / 🔄 STALE RUN
DAST PASS           58               58               ✅ OK
LOC                 67               67               ✅ OK
Tokens              79               79               ✅ OK
User Turns          5                5                ✅ OK
AI Turns            5                5                ✅ OK

[Strategy Aggregates — BP]
Check               Markdown         Computed         Status
─────────────────────────────────────────────────────────────
DAST Avg Warnings   7.8              7.8              ✅ OK
DAST Avg Pass       59.3             59.3             ✅ OK
CodeQL Total        9                9                ✅ OK
Interaction Convs   4                4                ✅ OK
Interaction Tokens  1,874            1,874            ✅ OK

[Cannot Verify]
SonarQube open issues — ต้องตรวจจาก dashboard โดยตรง
```

**Status codes:**
- `✅ OK` — ตรงกัน
- `⚠️ MISMATCH` — ค่าไม่ตรง (ระบุค่าที่ถูกด้วย)
- `🔄 STALE RUN` — ค่าตรง แต่ run ID ในไฟล์ไม่ใช่ latest run (มี run ใหม่กว่าแล้ว)
- `❓ NO DATA` — ยังเป็น TBD หรือหาไม่พบ

---

### Step 5 — เสนอ Auto-fix (ถ้ามี discrepancy)

ถ้าพบ `⚠️ MISMATCH` หรือ `🔄 STALE RUN` ให้ถามว่า:

> พบ N รายการที่ไม่ตรงกัน ต้องการให้แก้ไขในไฟล์ไหนบ้าง?
> 1. [รายการที่ 1] — แก้จาก X เป็น Y ใน CI_TEST_RESULTS.md
> 2. [รายการที่ 2] — แก้จาก X เป็น Y ใน METHODOLOGY.md
> ...
> ยืนยันให้แก้ทั้งหมด / เลือกเฉพาะข้อ / ไม่แก้

เมื่อ user ยืนยัน ให้แก้ไฟล์และแจ้งผล

**กฎ:** ห้ามแก้ SonarQube fields อัตโนมัติ — ต้องให้ user กรอกเองเสมอ

---

### กรณี `all`

ถ้า argument เป็น `all` ให้รัน Step 1–4 สำหรับทุก version ที่อยู่ใน `CI_TEST_RESULTS.md` และแสดง report รวม โดยเรียงตาม strategy (BP → CE → SD) แล้วจึงถามยืนยัน auto-fix ทีเดียว
