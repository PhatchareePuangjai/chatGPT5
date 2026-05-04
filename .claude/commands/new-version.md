# Skill: new-version

เตรียม folder สำหรับ version ใหม่ของการทดสอบเปรียบเทียบ AI code generation

## Usage

```text
/new-version <FOLDER_NAME>
```

ตัวอย่าง: `/new-version IMBP02`

## Folder Naming Convention

ชื่อ folder ประกอบด้วย 3 ส่วน:

- ตำแหน่ง `[0:2]` = Module prefix เช่น `IM` (Inventory Management), `PD` (Product), `SC` (Shopping Cart)
- ตำแหน่ง `[2:4]` = Prompting method เช่น `BP` (Basic Prompt), `CE` (Chain-of-thought Enhanced), `SD` (Self-Debug)
- ตำแหน่ง `[4:]`  = Version number เช่น `01`, `02`

Source folder คือ module + method เดิม แต่ version เป็น `01`:

- `IMBP02` → source = `IMBP01`
- `IMCE03` → source = `IMCE01`
- `PDSD02` → source = `PDSD01`

---

## การทำงานแบบ step-by-step

**ขยับ step ก็ต่อเมื่อ user พูดว่า "next step" เท่านั้น**
ถ้า step ไหนมี output file อยู่แล้วให้ข้ามไป step ถัดไปทันทีโดยแจ้ง user ด้วย

ตรวจสอบ output ของแต่ละ step:

- Step 1 done = มีไฟล์ `scenarios_*.md` ใน `src/versions/<TARGET>/`
- Step 2 done = มีไฟล์ test (เช่น `test_*.py`) ใน backend ของ target folder
- Step 3 done = มีไฟล์ `test_report.md` ใน `src/versions/<TARGET>/`
- Step 4 done = `<TARGET>` ปรากฏใน matrix ของทั้ง 4 workflows ใน `.github/workflows/`

---

## Step 1 — Copy scenarios file

1. **Parse input**: แยก module prefix, prompting method, และ version number
2. **หา source folder**: module + method เดิม + version `01`
3. **ถามยืนยัน**: แสดงข้อความก่อน copy เช่น:
   > จะ copy `scenarios_*.md` จาก `src/versions/IMBP01/` ไปยัง `src/versions/IMBP02/` ใช่ไหม?
4. **Copy file** เมื่อ user ยืนยัน:

   ```bash
   cp src/versions/<SOURCE>/scenarios_*.md src/versions/<TARGET>/
   ```

5. **แจ้งผล**: บอก user ว่า copy สำเร็จ ไฟล์อยู่ที่ไหน และรอ user พูด "next step"

---

## Step 2 — สร้าง test files

1. **อ่าน scenarios**: อ่านไฟล์ `scenarios_*.md` ใน `src/versions/<TARGET>/`
2. **อ่าน source tests**: ค้นหาและอ่านไฟล์ test ทั้งหมดใน backend ของ `src/versions/<SOURCE>/` เพื่อใช้เป็น reference โครงสร้างและรูปแบบ
3. **สร้าง test draft**: สร้าง test โดยยึดตาม scenarios ที่ copy มาเป็นหลัก ครอบคลุมทุก scenario และ edge case ใช้โครงสร้าง test ของ source เป็น reference เริ่มต้นเท่านั้น
4. **แสดงและถามยืนยัน**: แสดง test ที่จะสร้างทั้งหมดพร้อมอธิบายว่าแต่ละ test cover scenario ไหน แล้วถามว่า:
   > ต้องการปรับแก้ test ไหนไหม หรือยืนยันให้สร้างไฟล์ได้เลย?
5. **ปรับแก้**: ถ้า user ขอแก้ไข ให้แก้และแสดงผลใหม่ วนซ้ำจนกว่า user จะพอใจ
6. **เขียนไฟล์**: เมื่อ user ยืนยัน ให้เขียนไฟล์ test ลงใน backend ของ `src/versions/<TARGET>/`
7. **แจ้งผล**: บอก path ของ test files ที่สร้าง และรอ user พูด "next step"

---

## Step 3 — รัน test และสร้าง test_report.md

1. **อ่าน template**: อ่าน `test_report.md` จาก `src/versions/<SOURCE>/` เพื่อใช้เป็น template รูปแบบ
2. **รัน test**: รัน pytest หรือ test runner ที่เหมาะสมใน backend ของ `src/versions/<TARGET>/` และเก็บ output ทั้งหมด
3. **สร้าง report draft**: สร้าง `test_report.md` ใน `src/versions/<TARGET>/` โดย:
   - ใช้โครงสร้าง section เดียวกับ template จาก source
   - ใส่ผลการรัน test จริงที่ได้จากขั้นตอนที่ 2
   - ปรับ version name, date, project name ให้ตรงกับ target
4. **แสดงและถามยืนยัน**: แสดง report draft แล้วถามว่า:
   > ต้องการปรับแก้ส่วนไหนไหม หรือยืนยันให้บันทึกได้เลย?
5. **ปรับแก้**: ถ้า user ขอแก้ไข ให้แก้และแสดงผลใหม่ วนซ้ำจนกว่า user จะพอใจ
6. **เขียนไฟล์**: เมื่อ user ยืนยัน ให้เขียน `test_report.md` ลงใน `src/versions/<TARGET>/`
7. **แจ้งผล**: บอก path ของไฟล์ที่สร้าง และสรุปผลการทดสอบโดยรวม และรอ user พูด "next step"

---

## Step 4 — Update GitHub Actions workflows

**เป้าหมาย**: เพิ่ม `<TARGET>` เข้า workflows ทั้ง 4 ตัวใน `.github/workflows/`

### 4.0 — เตรียมข้อมูล (ก่อนแก้ workflow ใดๆ)

1. **ค้นหา project folder** ใน `src/versions/<TARGET>/` (โฟลเดอร์ที่มี source code จริง เช่น `one-click-online-shop`)
2. **ตรวจภาษา**: ดูว่า project เป็น Node.js (`package.json`) หรือ Python (`requirements.txt` / `pyproject.toml`)
3. **ตรวจ docker**: ค้นหา `docker-compose.yml` และ `Dockerfile` ใน project folder
4. **อ่าน port**: จาก `docker-compose.yml` ดู port ที่ expose ออกมา (สำหรับ DAST)
5. **ตรวจ DB**: ดูจาก `docker-compose.yml` หรือ `.env.example` ว่ามี database service ไหม และ DATABASE_URL format เป็นอย่างไร
6. **แสดงสรุปก่อนดำเนินการ**:
   > พบข้อมูลดังนี้:
   > - project folder: `src/versions/<TARGET>/one-click-online-shop`
   > - ภาษา: Node.js / Python
   > - docker-compose: มี / ไม่มี
   > - port: 3000 (หรือตามที่ตรวจพบ)
   > - database: มี / ไม่มี
   >
   > จะ update workflows ทั้ง 4 ตัว ยืนยันไหม?

### 4.1 — docker-compose (ถ้าไม่มี)

ถ้า project folder ไม่มี `docker-compose.yml`:

1. อ่าน `Dockerfile` เพื่อเข้าใจ runtime และ port
2. สร้าง `docker-compose.yml` ที่เหมาะสม โดยดู pattern จาก source folder เป็น reference
3. **ถามยืนยัน**: แสดง docker-compose.yml ที่จะสร้าง แล้วถามว่า:
   > จะสร้าง `docker-compose.yml` ที่ `<path>` ใช่ไหม?
4. เขียนไฟล์เมื่อ user ยืนยัน

### 4.2 — codeql.yml

`codeql.yml` ใช้ path `src/versions/**` ซึ่งครอบคลุมทุก folder อัตโนมัติ ไม่ต้องแก้ไข แจ้ง user ว่า `<TARGET>` ถูก cover แล้วโดยอัตโนมัติ

### 4.3 — dast-zap-all.yml

ตรวจว่า `<TARGET>` อยู่ใน matrix แล้วหรือยัง ถ้ายัง:

1. สร้าง matrix entry ใหม่:

   ```yaml
   - version: '<TARGET>'
     path: 'src/versions/<TARGET>/<project-folder>'
     port: '<port-from-docker-compose>'
   ```

2. **ถามยืนยัน**: แสดง diff ที่จะเพิ่มเข้าไป แล้วถามว่า:
   > จะเพิ่ม `<TARGET>` เข้า `dast-zap-all.yml` ใช่ไหม?
3. แก้ไขไฟล์เมื่อ user ยืนยัน โดยเพิ่ม entry ต่อท้าย matrix include list

### 4.4 — sonarqube.yml

ตรวจว่า `<TARGET>` อยู่ใน workflow แล้วหรือยัง ถ้ายัง:

1. เพิ่ม `src/versions/<TARGET>/**` เข้า `paths` ทั้ง `push` และ `pull_request`
2. เพิ่ม matrix entry:

   ```yaml
   - version: <TARGET>
     path: src/versions/<TARGET>/<project-folder>
   ```

3. **ถามยืนยัน**: แสดง diff แล้วถามว่า:
   > จะ update `sonarqube.yml` ใช่ไหม?
4. แก้ไขไฟล์เมื่อ user ยืนยัน

### 4.5 — unit-tests.yml

ตรวจว่า `<TARGET>` อยู่ใน workflow แล้วหรือยัง ถ้ายัง:

1. เพิ่ม `src/versions/<TARGET>/**` เข้า `paths` ทั้ง `push` และ `pull_request`
2. เลือก job ที่จะเพิ่ม matrix entry:
   - Node.js → เพิ่มใน job `unit-test`
   - Python → เพิ่มใน job `python-test`
3. สร้าง matrix entry โดยดูจาก DB ที่ตรวจพบ:
   - มี DB → ใส่ `db_user`, `db_pass`, `db_name`, `database_url` จาก docker-compose / .env
   - ไม่มี DB → ใส่ค่าว่าง `''` ทั้งหมด

   ```yaml
   - version: <TARGET>
     path: src/versions/<TARGET>/<project-folder>/<test-path>
     db_user: ''
     db_pass: ''
     db_name: ''
     database_url: ''
   ```

4. **ถามยืนยัน**: แสดง diff แล้วถามว่า:
   > จะ update `unit-tests.yml` ใช่ไหม?
5. แก้ไขไฟล์เมื่อ user ยืนยัน

### 4.6 — แจ้งผลสรุป

แสดงตารางสรุปสิ่งที่ทำใน Step 4:

| Workflow | สถานะ | หมายเหตุ |
| --- | --- | --- |
| codeql.yml | ✅ ครอบคลุมอัตโนมัติ | ใช้ `src/versions/**` |
| dast-zap-all.yml | ✅ เพิ่มแล้ว / ⏭️ มีอยู่แล้ว | port ที่ใช้ |
| sonarqube.yml | ✅ เพิ่มแล้ว / ⏭️ มีอยู่แล้ว | path ที่ใช้ |
| unit-tests.yml | ✅ เพิ่มแล้ว / ⏭️ มีอยู่แล้ว | job ที่เพิ่ม |
