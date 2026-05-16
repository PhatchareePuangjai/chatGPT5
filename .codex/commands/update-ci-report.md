---
name: update-ci-report
description: Use when the user asks Codex to pull GitHub Actions CI results for a target version and update CI_TEST_RESULTS.md and METHODOLOGY.md, especially requests like update-ci-report IMBP02, refresh CI metrics, collect Unit Tests, CodeQL, DAST ZAP, SonarQube, LOC, or interaction counts for src/versions targets.
---


# Skill: update-ci-report

ดึงผล CI จาก GitHub Actions แล้ว update ไฟล์ `CI_TEST_RESULTS.md` และ `METHODOLOGY.md`

## Usage

```text
$update-ci-report <FOLDER_NAME>
/update-ci-report <FOLDER_NAME>
```

ตัวอย่าง: `$update-ci-report IMBP02` หรือ `/update-ci-report IMBP02`

ถ้า user พิมพ์แบบเดิมจาก Claude เช่น `/update-ci-report IMBP02` ให้ถือว่าเป็นคำสั่งเดียวกัน

## Repo ที่ใช้

```text
REPO=PhatchareePuangjai/chatGPT5
```

ดึงจาก `CI_TEST_RESULTS.md` บรรทัดแรกๆ ถ้าเปลี่ยนชื่อ repo ให้อ่านจากไฟล์นั้นก่อนเสมอ

---

## Source version

ใช้ logic เดียวกับ `new-version`:

- `IMBP02` → source = `IMBP01`
- `IMCE03` → source = `IMCE01`
- `PDSD02` → source = `PDSD01`

### กฎสำคัญ: ทุก row ใหม่ที่เพิ่มต้องวางติดกับ source version เสมอ

---

## ขั้นตอน

### Step A — ดึงข้อมูลจาก GitHub

รัน commands ต่อไปนี้ด้วย `gh` CLI เพื่อเก็บข้อมูลทั้งหมดก่อน:

#### A1 — Unit Tests

```bash
gh run list --workflow=unit-tests.yml --repo <REPO> --limit 5 --json databaseId,conclusion,createdAt,status
```

จาก run ล่าสุดที่ status=completed ดึง job ของ `<TARGET>`:

```bash
gh run view <run-id> --repo <REPO> --json jobs \
  | python3 -c "import json,sys; jobs=json.load(sys.stdin)['jobs']; [print(j['name'], j['conclusion'], j.get('steps','')) for j in jobs if '<TARGET>' in j['name']]"
```

ดู log ของ job นั้นเพื่อหา passed/failed count:

```bash
gh run view <run-id> --repo <REPO> --log | grep -A5 "<TARGET>"
```

#### A2 — CodeQL Alerts

```bash
gh api repos/<REPO>/code-scanning/alerts?state=open&tool_name=CodeQL --paginate \
  | python3 -c "
import json, sys
alerts = json.load(sys.stdin)
for a in alerts:
    loc = a.get('most_recent_instance', {}).get('location', {}).get('path', '')
    if 'versions/<TARGET>' in loc:
        print(a['rule']['security_severity_level'], a['rule']['id'], loc)
"
```

นับ High และ Medium แยกกัน

#### A3 — DAST (ZAP)

```bash
gh run list --workflow=dast-zap-all.yml --repo <REPO> --limit 5 --json databaseId,conclusion,createdAt,status
```

ดึง job ของ `<TARGET>` และอ่าน log:

```bash
gh run view <run-id> --repo <REPO> --log | grep -A3 "Scan <TARGET>"
```

หาค่า `FAIL-NEW`, `WARN-NEW`, `PASS` จาก ZAP output line เช่น:
`FAIL-NEW: 0  WARN-NEW: 7  PASS: 60`

#### A4 — SonarQube

ดึง run ID ล่าสุดก่อน:

```bash
gh run list --workflow=sonarqube.yml --repo <REPO> --limit 5 --json databaseId,conclusion,createdAt,status
```

ตรวจ conclusion ของ job `<TARGET>` ใน run ล่าสุด บันทึก run ID ไว้

จากนั้นดึง open issues จาก SonarCloud API โดยใช้ `SONAR_TOKEN` จากไฟล์ `.env`:

```bash
export SONAR_TOKEN=$(grep SONAR_TOKEN .env | cut -d'"' -f2)

# ดึง metrics history (ทำงานได้โดยไม่ต้องระบุ branch)
curl -s -u "$SONAR_TOKEN:" \
  "https://sonarcloud.io/api/measures/search_history?component=chatGPT5_<TARGET>&metrics=bugs,vulnerabilities,code_smells,duplicated_lines_density&ps=1" \
  | python3 -c "
import json, sys
d = json.load(sys.stdin)
for m in d.get('measures', []):
    hist = m.get('history', [])
    latest = hist[-1] if hist else {}
    print(f\"{m['metric']}: {latest.get('value', 'N/A')} ({latest.get('date','?')})\")
"
```

mapping ไปยัง column ใน CI_TEST_RESULTS.md:

- `vulnerabilities` → Security (Open)
- `bugs` → Reliability (Open)
- `code_smells` → Maintainability (Open)
- `duplicated_lines_density` → Duplications

> ถ้า token ไม่ถูกต้องหรือ project ยังไม่มีข้อมูล ให้ใส่ `TBD` และแจ้ง user ให้ตรวจสอบ token ที่ `.env`

#### A5 — Interaction / Prompt data

ค้นหา chatgpt-export หรือ conversation_export ใน `src/versions/<TARGET>/`:

```bash
find src/versions/<TARGET> -name "conversations.json" -o -name "conversation_export.json" | head -3
```

ถ้าเจอ ให้ extract:

- จำนวน conversations
- จำนวน user turns / AI turns
- user prompt tokens ด้วย tiktoken cl100k_base

ถ้าไม่เจอ ให้ใส่ `TBD`

---

### Step B — แสดงข้อมูลที่รวบรวมได้

แสดงตารางสรุปทุก metric ที่หาได้:

```text
Target: IMBP02  Source (insert near): IMBP01

Unit Tests  : Passed=? Failed=? Total=?  (run #?)
CodeQL      : High=?  Medium=?  Total=?
DAST        : FAIL-NEW=? WARN-NEW=? PASS=?  (run #?)
SonarQube   : Security=? Reliability=? Maintainability=? Duplications=?%  (run #?)
LOC         : TBD (นับจาก .js/.py production backend files เท่านั้น — ไม่รวม frontend, node_modules, tests)
```

ถามว่า:
> ข้อมูลครบแล้ว ต้องการแก้ไขหรือเพิ่มเติมอะไรไหมก่อน update ไฟล์?

---

### Step C — Update `CI_TEST_RESULTS.md`

เมื่อ user ยืนยัน ให้ update ทีละ section โดย **insert row ใหม่ถัดจาก source version เสมอ**

#### C1 — "Unit Tests" table (Section 1)

เพิ่ม row ของ `<TARGET>` ถัดจาก source version (`<SOURCE>`):

```markdown
| <TARGET> | <Feature> | <Tool> | <passed> | <failed> | <total> | <result-emoji> PASS/PARTIAL/FAIL | <failure details or —> |
```

#### C2 — "Test Summary by Strategy" table (Section 1)

อัปเดต row ของ strategy ที่ `<TARGET>` สังกัด — บวก Passed/Failed/Total ใหม่ แล้วคำนวณ Pass Rate

#### C3 — "SonarQube Open Issues by Version" table (Section 2)

เพิ่ม row ของ `<TARGET>` ถัดจาก source version ด้วยค่าจริงจาก A4:

```markdown
| <TARGET> | <vulnerabilities> | <bugs> | <code_smells> | <duplicated_lines_density>% |
```

#### C4 — "SonarQube Summary by Strategy" table (Section 2)

คำนวณ avg ใหม่จากทุก version ใน strategy (รวม `<TARGET>`) แล้ว update ค่า

#### C6 — "Security Alerts by Version (Open)" table

เพิ่ม row ของ `<TARGET>` ถัดจาก source version:

```markdown
| <TARGET> | <high> | <medium> | <total> | <description> |
```

#### C7 — "CodeQL Alert Summary by Strategy" table

อัปเดต row ของ strategy (BP/CE/SD) ด้วยผลรวมใหม่

#### C8 — "DAST" scan results table

ถ้า `<TARGET>` ยังไม่มีอยู่ในตาราง ให้เพิ่ม row ถัดจาก source version:

```markdown
| <TARGET> | <FAIL-NEW> | <WARN-NEW> | <PASS> | <Notable Warnings> |
```

ถ้ามีอยู่แล้ว ให้ update ค่าให้ตรงกับ run ล่าสุด

#### C9 — "DAST Summary by Strategy" table

อัปเดต Avg Warnings / Avg Pass / Scan Status ของ strategy ที่ `<TARGET>` สังกัด

#### C10 — "Overall Summary" table

เพิ่ม row ของ `<TARGET>` ถัดจาก source version:

```markdown
| <TARGET> | <tests-result> | <codeql-alerts> | <dast-result> | <sonarqube> | <dup%> | <LOC> | <avg-loc> |
```

#### C11 — "Interaction Counts by Version" table

เพิ่ม row ของ `<TARGET>` ถัดจาก source version ถ้ามี conversation data:

```markdown
| <TARGET> | <Strategy> | <Model> | <convs> | <user-turns> | <ai-turns> | <tokens> |
```

ถ้าไม่มี conversation file ให้ใส่ `TBD` และแจ้ง user

#### C12 — "Interaction Summary by Strategy" table

อัปเดต totals ของ strategy ที่ `<TARGET>` สังกัด

---

### Step D — Update `METHODOLOGY.md`

ค้นหาทุกตำแหน่งที่มี `<SOURCE>` ปรากฏอยู่ในตาราง แล้วเพิ่ม row ของ `<TARGET>` ถัดจาก source:

#### D1 — Section 3.4 quantitative metrics table

เพิ่ม row ถัดจาก `<SOURCE>`:

```markdown
| <TARGET> | <Strategy> | <LOC> | <tokens> |
```

#### D2 — Section 2.2 Supplementary Repository Artifacts

ถ้า `<TARGET>` ไม่ใช่ส่วนหนึ่งของ core 9-version dataset ให้เพิ่มชื่อ version ใน section นี้

---

### Step E — ยืนยันและแจ้งผล

1. แสดง diff summary ของสิ่งที่เปลี่ยนแปลงใน CI_TEST_RESULTS.md และ METHODOLOGY.md
2. ถามยืนยันก่อน write จริง:
   > ยืนยันให้บันทึกการเปลี่ยนแปลงทั้งหมดนี้ไหม?
3. เมื่อ user ยืนยัน ให้เขียนทั้ง 2 ไฟล์
4. แจ้ง user ว่า field ไหนที่ยังเป็น `TBD` ต้องไปกรอกเพิ่มเองจากที่ใด:
   - SonarQube → ถ้าดึงไม่ได้ ให้ตรวจสอบ `SONAR_TOKEN` ใน `.env` หรือเข้า dashboard ที่ `https://sonarcloud.io/project/issues?id=chatGPT5_<TARGET>`
   - LOC → นับจาก `.js`/`.py` **backend/server-side files เท่านั้น** ใน `src/versions/<TARGET>/` (ไม่รวม node_modules, tests, และ frontend — folder `frontend/`, `client/`, `public/`, ไฟล์ `.html`, `.css`, client-side JS ที่ไม่มี server logic)
   - Interaction data → ดูจากไฟล์ `conversations.json` หรือ `conversation_export.json`
