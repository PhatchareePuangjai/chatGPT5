# 📊 สรุปรวมงานวิจัย: การวิเคราะห์คุณภาพโค้ดทุกเวอร์ชัน

## 🎯 บทสรุปผู้บริหาร (Executive Summary)

งานวิจัยนี้ทำการวิเคราะห์คุณภาพโค้ดของโปรเจกต์ e-commerce/inventory system ที่มี 9 เวอร์ชัน (IMBP01 - PDBP03) โดยใช้ 3 วิธีการวิเคราะห์:

1. **Code Review Analysis** - การทบทวนโค้ดแบบละเอียด (Architecture, Patterns, Features)
2. **SonarQube Analysis** - การวิเคราะห์อัตโนมัติ (Security, Reliability, Maintainability, Duplications)
3. **Version Analysis** - การวิเคราะห์ด้วยกราฟและสถิติ (Trends, Evolution, Comparisons)

**ผลการวิจัยหลัก:**
- ✅ คุณภาพโค้ดพัฒนาขึ้นอย่างต่อเนื่อง: IMBP01 (3⭐) → PDBP03 (5⭐)
- ✅ PDBP03 เป็นเวอร์ชันที่ดีที่สุดทั้ง 3 วิธีการวิเคราะห์
- ⚠️ พบปัญหาสำคัญ: Test Coverage = 0.0% ทุกเวอร์ชัน
- ⚠️ SCBP01 และ SCBP03 มี Code Duplications สูงมาก (65.5%, 34.8%)
- ⚠️ SCBP03 มี Security vulnerabilities สูงสุด (5 จุด)

**วิธีการพัฒนา (Development Methods):**
- **IMBP01, SCBP01, PDBP01:** Basic Prompt (การพัฒนาแบบพื้นฐาน)
- **IMBP02, SCBP02, PDBP02:** Context Engineering (การพัฒนาโดยใช้ context ที่ดีขึ้น)
- **IMBP03, SCBP03, PDBP03:** SDD - Spec-Driven Development (การพัฒนาตาม specification)

---

## 📚 เอกสารอ้างอิง

- [Code Review Analysis](./CODE_REVIEW.md) - การทบทวนโค้ดแบบละเอียด
- [SonarQube Analysis](./versions/sonarQube.md) - การวิเคราะห์อัตโนมัติ
- [Version Analysis Notebook](./version_analysis.ipynb) - กราฟวิเคราะห์การพัฒนา

**หมายเหตุ:** Code Evolution Analysis ถูกรวมเข้าในส่วนที่ 8 ของเอกสารนี้แล้ว

---

## 📊 1. สรุปผลการวิเคราะห์ทั้ง 3 วิธี

### 1.1 Code Review Analysis

**วิธีการ:** การทบทวนโค้ดแบบละเอียด วิเคราะห์ Architecture, Patterns, Features, Best Practices

**ผลการวิเคราะห์ (เริ่มจาก IMBP01):**

| Version | Quality Score | Key Features | Architecture | Development Method |
|---------|--------------|--------------|--------------|---------------------|
| IMBP01 | ⭐⭐⭐☆☆ (3/5) | Docker, Tests | Monolithic | Basic Prompt |
| SCBP01 | ⭐⭐⭐⭐☆ (4/5) | Zod, ES Modules, Row Locking | Service Layer | Basic Prompt |
| PDBP01 | ⭐⭐⭐☆☆ (3/5) | TypeScript (Frontend) | Monolithic | Basic Prompt |
| IMBP02 | ⭐⭐⭐⭐☆ (4/5) | Concurrency Safety | Service Layer | Context Engineering |
| SCBP02 | ⭐⭐⭐☆☆ (3/5) | Stock Guard | Basic | Context Engineering |
| PDBP02 | ⭐⭐⭐⭐☆ (4/5) | Error Middleware, Money Utils | Service Layer | Context Engineering |
| IMBP03 | ⭐⭐⭐⭐☆ (4/5) | API Endpoints, Alerts | Service Layer | SDD (Spec-Driven) |
| SCBP03 | ⭐⭐⭐⭐☆ (4/5) | Zod, ES Modules | Service Layer | SDD (Spec-Driven) |
| PDBP03 | ⭐⭐⭐⭐⭐ (5/5) | Repository Pattern, Error Factory | Clean Architecture | SDD (Spec-Driven) |

**จุดเด่น:**
- SCBP01 เป็นจุดเปลี่ยนสำคัญ: เพิ่ม Zod validation, ES Modules, Row Locking (Basic Prompt)
- IMBP02-PDBP02: ใช้ Context Engineering - คุณภาพดีขึ้น (Concurrency Safety, Error Middleware)
- IMBP03-PDBP03: ใช้ SDD (Spec-Driven Development) - คุณภาพดีที่สุด (PDBP03: 5⭐)

**จุดที่ควรปรับปรุง:**
- IMBP01: ยังไม่มี Validation และ Error Handling ที่เป็นระบบ (Basic Prompt)
- PDBP01: Backend ยังใช้ CommonJS (ควรเป็น ES Modules) (Basic Prompt)
- IMBP02: SonarQube พบ Reliability และ Maintainability issues สูง (Context Engineering)

---

### 1.2 SonarQube Analysis

**วิธีการ:** การวิเคราะห์อัตโนมัติด้วย SonarQube (9,285 lines of code)

**ผลการวิเคราะห์รวม:**

| Metric | Value | Status |
|--------|-------|--------|
| **Lines of Code** | 9,285 | - |
| **Security Vulnerabilities** | 6 | ⚠️ |
| **Reliability Issues** | 101 | ⚠️ |
| **Maintainability Issues** | 148 | ⚠️ |
| **Security Hotspots** | 44 | 🔍 |
| **Test Coverage** | 0.0% | ❌ |
| **Code Duplications** | 16.6% | ⚠️ |

**ผลการวิเคราะห์รายเวอร์ชัน (เริ่มจาก IMBP01):**

| Version | Security | Reliability | Maintainability | Duplications | Dev Method | Best Metric |
|---------|----------|-------------|-----------------|--------------|------------|-------------|
| IMBP01 | 0 ✅ | 3 ✅ | 7 ✅ | 24.2% ⚠️ | Basic Prompt | Maintainability: 7 (ดีที่สุด) |
| SCBP01 | 0 ✅ | 9 ⚠️ | 18 ⚠️ | **65.5%** ❌ | Basic Prompt | - |
| PDBP01 | 0 ✅ | **1** ✅ | 10 ✅ | **1.4%** ✅ | Basic Prompt | Reliability: 1 (ดีที่สุด) |
| IMBP02 | 0 ✅ | 19 ⚠️ | **26** ⚠️ | 9.3% ✅ | Context Engineering | - |
| SCBP02 | 0 ✅ | 9 ⚠️ | 12 ⚠️ | 4.3% ✅ | Context Engineering | - |
| PDBP02 | 0 ✅ | 17 ⚠️ | 20 ⚠️ | **0.0%** ✅ | Context Engineering | Duplications: 0.0% |
| IMBP03 | 1 ⚠️ | **22** ❌ | 18 ⚠️ | 3.1% ✅ | SDD | - |
| SCBP03 | **5** ❌ | 9 ⚠️ | 12 ⚠️ | 34.8% ❌ | SDD | - |
| PDBP03 | 0 ✅ | 8 ✅ | 17 ⚠️ | **0.0%** ✅ | SDD | Best Overall |

**จุดเด่น:**
- PDBP03: Security = 0, Duplications = 0.0%, Reliability = 8
- PDBP01: Reliability = 1 (ดีที่สุด), Duplications = 1.4%
- PDBP02: Duplications = 0.0%
- IMBP01: Maintainability = 7 (ดีที่สุด)

**จุดที่ต้องแก้ไข:**
- SCBP03: Security = 5 (สูงสุด), Duplications = 34.8%
- SCBP01: Duplications = 65.5% (สูงสุด)
- IMBP03: Reliability = 22 (สูงสุด), Security = 1
- IMBP02: Maintainability = 26 (สูงสุด), Reliability = 19

---

### 1.3 Version Analysis (Notebook)

**วิธีการ:** การวิเคราะห์ด้วยกราฟและสถิติ (Pandas, Matplotlib, Seaborn)

**ผลการวิเคราะห์:**

**คุณภาพโค้ด:**
- Average Quality Score: 3.60⭐ (IMBP01-PDBP03)
- Quality Improvement: 2 stars (IMBP01: 3⭐ → PDBP03: 5⭐)
- Best Version: PDBP03 (5⭐, 10 features)

**Features Evolution:**
- IMBP01: 3 features (เริ่มต้น)
- SCBP01: 9 features (กระโดดใหญ่ - Basic Prompt)
- PDBP03: 10 features (มากที่สุด - SDD)

**Architecture Evolution:**
- IMBP01: Monolithic (Basic Prompt)
- SCBP01-SCBP03: Service Layer (Basic Prompt → Context Engineering → SDD)
- PDBP03: Repository + Service Pattern (Clean Architecture - SDD)

**Development Method Impact:**
- **Basic Prompt (IMBP01-PDBP01):** คุณภาพ 3-4⭐, มี features ดี แต่ Code Duplications สูง (SCBP01: 65.5%)
- **Context Engineering (IMBP02-PDBP02):** คุณภาพ 3-4⭐, Code Duplications ลดลง (PDBP02: 0.0%)
- **SDD (IMBP03-PDBP03):** คุณภาพ 4-5⭐, Architecture ดีขึ้น (PDBP03: Clean Architecture)

**Tech Stack Adoption:**
- ES Modules: SCBP01, SCBP03
- TypeScript: PDBP01 (Frontend only)
- Zod Validation: SCBP01, SCBP03, PDBP03
- Docker: IMBP01+ (ทุกเวอร์ชัน)
- Tests: IMBP01, SCBP01, PDBP01, IMBP02, PDBP02, SCBP03, PDBP03

---

## 🔍 2. วิธีการพัฒนาและผลกระทบต่อคุณภาพโค้ด

### 2.1 วิธีการพัฒนา (Development Methods)

งานวิจัยนี้ใช้ 3 วิธีการพัฒนาในการสร้างแต่ละเวอร์ชัน:

#### 📝 Basic Prompt (IMBP01, SCBP01, PDBP01)

**ลักษณะ:**
- ใช้ prompt พื้นฐานในการพัฒนา
- ไม่มี context หรือ specification ที่ละเอียด
- พัฒนาตามความต้องการพื้นฐาน

**ผลลัพธ์:**
- ✅ IMBP01: คุณภาพ 3⭐, Maintainability ดี (7 จุด)
- ✅ SCBP01: คุณภาพ 4⭐, มี features ดี (Zod, ES Modules, Row Locking)
- ⚠️ SCBP01: Code Duplications สูงมาก (65.5%)
- ✅ PDBP01: Reliability ดีที่สุด (1 จุด), Code Duplications ต่ำ (1.4%)

**ข้อสังเกต:**
- คุณภาพดีขึ้นจาก IMBP01 → SCBP01 (3⭐ → 4⭐)
- แต่ Code Duplications สูงมากใน SCBP01 (65.5%)
- PDBP01 มี metrics ดีมาก แต่ Backend ยังใช้ CommonJS

#### 🧠 Context Engineering (IMBP02, SCBP02, PDBP02)

**ลักษณะ:**
- ใช้ context ที่ดีขึ้นในการพัฒนา
- มีการให้ข้อมูลเพิ่มเติมเกี่ยวกับ requirements
- เน้นการแก้ไขปัญหาที่พบในเวอร์ชันก่อนหน้า

**ผลลัพธ์:**
- ✅ IMBP02: คุณภาพ 4⭐, มี Concurrency Safety (FOR UPDATE)
- ⚠️ IMBP02: SonarQube พบ Reliability (19) และ Maintainability (26) สูง
- ✅ SCBP02: คุณภาพ 3⭐, Code Duplications ต่ำ (4.3%)
- ✅ PDBP02: Code Duplications = 0.0% (ดีที่สุด), Error Middleware

**ข้อสังเกต:**
- Code Duplications ลดลงอย่างชัดเจน (SCBP01: 65.5% → PDBP02: 0.0%)
- แต่ SonarQube พบ issues สูงใน IMBP02 (Reliability: 19, Maintainability: 26)
- PDBP02 มี Code Duplications = 0.0% - เป็นตัวอย่างที่ดี

#### 📋 SDD - Spec-Driven Development (IMBP03, SCBP03, PDBP03)

**ลักษณะ:**
- พัฒนาตาม specification ที่ละเอียด
- มีการวางแผนและออกแบบก่อนพัฒนา
- เน้น Clean Architecture และ Best Practices

**ผลลัพธ์:**
- ⚠️ IMBP03: คุณภาพ 4⭐, แต่ Reliability issues สูง (22 จุด), Security (1 จุด)
- ⚠️ SCBP03: คุณภาพ 4⭐, แต่ Security vulnerabilities สูงสุด (5 จุด), Duplications (34.8%)
- ✅ PDBP03: คุณภาพ 5⭐ (ดีที่สุด), Security = 0, Duplications = 0.0%, Clean Architecture

**ข้อสังเกต:**
- คุณภาพดีขึ้นอย่างต่อเนื่อง (IMBP03: 4⭐ → PDBP03: 5⭐)
- PDBP03 เป็นเวอร์ชันที่ดีที่สุดทั้ง 3 วิธีการวิเคราะห์
- แต่ IMBP03 และ SCBP03 ยังมี issues ที่ต้องแก้ไข

### 2.2 เปรียบเทียบผลกระทบของวิธีการพัฒนา

| Development Method | Versions | Avg Quality | Avg Duplications | Best Version | Issues |
|-------------------|----------|-------------|------------------|--------------|--------|
| **Basic Prompt** | IMBP01-PDBP01 | 3.33⭐ | 30.4% | PDBP01 (Reliability: 1) | SCBP01: Duplications 65.5% |
| **Context Engineering** | IMBP02-PDBP02 | 3.67⭐ | 4.5% | PDBP02 (Duplications: 0.0%) | IMBP02: Reliability 19, Maintainability 26 |
| **SDD** | IMBP03-PDBP03 | 4.33⭐ | 12.6% | PDBP03 (5⭐, Best Overall) | IMBP03: Reliability 22, SCBP03: Security 5 |

**สรุป:**
- **SDD ให้ผลลัพธ์ดีที่สุด** - Average Quality 4.33⭐, Best Version (PDBP03)
- **Context Engineering ลด Code Duplications ได้ดี** - Average 4.5% (PDBP02: 0.0%)
- **Basic Prompt เริ่มต้นได้ดี** - แต่ Code Duplications สูง (SCBP01: 65.5%)

---

## 🔍 3. เปรียบเทียบผลการวิเคราะห์ทั้ง 3 วิธี

### 2.1 ความสอดคล้องระหว่างวิธีการ

| Version | Code Review | SonarQube | Version Analysis | Dev Method | สรุป |
|---------|-------------|-----------|------------------|------------|------|
| **PDBP03** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | SDD | ✅ **สอดคล้องกัน - ดีที่สุด** |
| **PDBP01** | ⭐⭐⭐☆☆ | ⭐⭐⭐⭐ | ⭐⭐⭐☆☆ | Basic Prompt | ⚠️ SonarQube ดีกว่า (Reliability: 1) |
| **SCBP01** | ⭐⭐⭐⭐☆ | ⭐⭐ | ⭐⭐⭐⭐☆ | Basic Prompt | ⚠️ Code Review ดีกว่า แต่ Duplications สูง |
| **IMBP02** | ⭐⭐⭐⭐☆ | ⭐⭐ | ⭐⭐⭐⭐☆ | Context Engineering | ⚠️ Code Review ดีกว่า แต่ SonarQube พบ issues สูง |
| **PDBP02** | ⭐⭐⭐⭐☆ | ⭐⭐⭐ | ⭐⭐⭐⭐☆ | Context Engineering | ✅ Code Duplications = 0.0% |
| **SCBP03** | ⭐⭐⭐⭐☆ | ⭐ | ⭐⭐⭐⭐☆ | SDD | ❌ SonarQube แย่กว่า (Security: 5) |
| **IMBP01** | ⭐⭐⭐☆☆ | ⭐⭐⭐⭐ | ⭐⭐⭐☆☆ | Basic Prompt | ✅ SonarQube ดีกว่า (Maintainability: 7) |

### 2.2 การวิเคราะห์ความแตกต่าง

**กรณีที่ Code Review ให้คะแนนดี แต่ SonarQube พบ issues:**

1. **SCBP01 (Code Review: 4⭐, SonarQube: Duplications 65.5%)**
   - **สาเหตุ:** มี features ดี (Zod, ES Modules, Row Locking) แต่มี Code Duplications สูงมาก
   - **คำแนะนำ:** ควร refactor เพื่อลด Code Duplications

2. **IMBP02 (Code Review: 4⭐, SonarQube: Reliability 19, Maintainability 26)**
   - **สาเหตุ:** มี Concurrency Safety (FOR UPDATE) แต่ SonarQube พบ bugs และ code smells สูง
   - **คำแนะนำ:** ควรแก้ไข bugs และ refactor code smells

3. **SCBP03 (Code Review: 4⭐, SonarQube: Security 5, Duplications 34.8%)**
   - **สาเหตุ:** มี Zod, ES Modules แต่มี Security vulnerabilities และ Code Duplications สูง
   - **คำแนะนำ:** ต้องแก้ไข Security issues เร่งด่วน

**กรณีที่ SonarQube ให้คะแนนดี แต่ Code Review พบข้อบกพร่อง:**

1. **PDBP01 (SonarQube: Reliability 1, Code Review: 3⭐)**
   - **สาเหตุ:** SonarQube metrics ดีมาก แต่ Backend ยังใช้ CommonJS (ควรเป็น ES Modules)
   - **คำแนะนำ:** ควร migrate ไปใช้ ES Modules

---

## 📈 4. แนวโน้มการพัฒนา

### 4.1 คุณภาพโค้ด

```
IMBP01 (3⭐) [Basic Prompt] 
  → SCBP01 (4⭐) [Basic Prompt] 
  → PDBP01 (3⭐) [Basic Prompt]
  → IMBP02 (4⭐) [Context Engineering]
  → SCBP02 (3⭐) [Context Engineering]
  → PDBP02 (4⭐) [Context Engineering]
  → IMBP03 (4⭐) [SDD]
  → SCBP03 (4⭐) [SDD]
  → PDBP03 (5⭐) [SDD]
```

**จุดเปลี่ยนสำคัญ:**
- **IMBP01 → SCBP01:** กระโดดจาก 3⭐ → 4⭐ (Basic Prompt - เพิ่ม Zod, ES Modules, Row Locking)
- **PDBP01 → IMBP02:** เปลี่ยนเป็น Context Engineering - คุณภาพ 4⭐, Code Duplications ลดลง
- **PDBP02 → IMBP03:** เปลี่ยนเป็น SDD - คุณภาพคงที่ 4⭐ แต่ Architecture ดีขึ้น
- **SCBP03 → PDBP03:** กระโดดจาก 4⭐ → 5⭐ (SDD - เพิ่ม Repository Pattern, Clean Architecture)

### 4.2 Architecture Evolution

```
Monolithic (IMBP01) [Basic Prompt]
    ↓
Service Layer (SCBP01-SCBP03) [Basic Prompt → Context Engineering → SDD]
    ↓
Repository + Service Pattern (PDBP03) [SDD] ← Clean Architecture
```

**ความสัมพันธ์กับ Development Method:**
- **Basic Prompt:** Monolithic → Service Layer (IMBP01-PDBP01)
- **Context Engineering:** Service Layer (IMBP02-PDBP02)
- **SDD:** Service Layer → Clean Architecture (IMBP03-PDBP03)

### 4.3 Features Evolution

**Type Safety:**
- IMBP01: ไม่มี validation
- SCBP01, SCBP03, PDBP03: Zod validation
- PDBP01: TypeScript (Frontend only)

**Concurrency Safety:**
- IMBP01-SCBP01: Basic transactions
- SCBP01+: Row Locking (FOR UPDATE)
- IMBP02+: Atomic transactions

**Error Handling:**
- IMBP01-SCBP01: Basic error handler
- PDBP02-IMBP03: Error handler middleware
- PDBP03: Error factory pattern

**Money Handling:**
- SCBP01+: Integer cents math
- PDBP02+: Integer satang math (THB*100)

---

## 🏆 5. เวอร์ชันที่ดีที่สุด

### 5.1 PDBP03 (promotions-app) ⭐⭐⭐⭐⭐ - SDD

**Code Review:** ⭐⭐⭐⭐⭐
- Repository Pattern
- Service Layer
- Error Factory
- Zod Validation
- Money Utilities
- Clean Architecture

**SonarQube:**
- Security: 0 ✅
- Reliability: 8 ✅
- Maintainability: 17 ⚠️
- Duplications: 0.0% ✅

**Version Analysis:**
- Quality Score: 5⭐
- Features: 10/10
- Architecture: Clean Architecture

**สรุป:** PDBP03 เป็นเวอร์ชันที่ดีที่สุดทั้ง 3 วิธีการวิเคราะห์ ✅  
**Development Method:** SDD (Spec-Driven Development) - แสดงให้เห็นว่า SDD ให้ผลลัพธ์ดีที่สุด

### 5.2 เวอร์ชันอื่นที่น่าสนใจ

**PDBP02 (promotions-discounts-system) - Context Engineering:**
- SonarQube: Duplications = 0.0%, Security = 0
- Code Review: 4⭐ (Error Middleware, Money Utils)
- **Development Method:** Context Engineering - แสดงให้เห็นว่า Context Engineering ลด Code Duplications ได้ดี

**PDBP01 (promo-shop-plug-and-play) - Basic Prompt:**
- SonarQube: Reliability = 1 (ดีที่สุด), Duplications = 1.4%
- Code Review: 3⭐ (Backend ยังใช้ CommonJS)
- **Development Method:** Basic Prompt - แสดงให้เห็นว่า Basic Prompt ก็ให้ผลลัพธ์ดีได้ถ้า prompt ดี

**IMBP01 (online-shop-inventory) - Basic Prompt:**
- SonarQube: Maintainability = 7 (ดีที่สุด), Reliability = 3
- Code Review: 3⭐ (เริ่มต้นที่ดี แต่ยังไม่มี Validation)
- **Development Method:** Basic Prompt - เริ่มต้นที่ดี

**PDBP01 (promo-shop-plug-and-play):**
- SonarQube: Reliability = 1 (ดีที่สุด), Duplications = 1.4%
- Code Review: 3⭐ (Backend ยังใช้ CommonJS)

**PDBP02 (promotions-discounts-system):**
- SonarQube: Duplications = 0.0%, Security = 0
- Code Review: 4⭐ (Error Middleware, Money Utils)

**IMBP01 (online-shop-inventory):**
- SonarQube: Maintainability = 7 (ดีที่สุด), Reliability = 3
- Code Review: 3⭐ (เริ่มต้นที่ดี แต่ยังไม่มี Validation)

---

## ⚠️ 6. ปัญหาที่พบและคำแนะนำ

### 6.1 ปัญหาสำคัญ

#### 1. Test Coverage = 0.0% (ทุกเวอร์ชัน) ❌

**ผลกระทบ:**
- ไม่สามารถมั่นใจได้ว่าโค้ดทำงานถูกต้อง
- ยากต่อการ refactor
- เสี่ยงต่อ regression bugs

**คำแนะนำ:**
- เพิ่ม Unit Tests สำหรับทุกเวอร์ชัน (เป้าหมาย: 70-80%)
- เริ่มจาก PDBP03, SCBP01, IMBP02 ที่มี test files อยู่แล้ว
- เพิ่ม Integration Tests

#### 2. Code Duplications สูง

**SCBP01: 65.5%** ❌
- สูงที่สุดในทุกเวอร์ชัน
- ต้อง refactor เร่งด่วน

**SCBP03: 34.8%** ❌
- สูงมาก ต้อง refactor

**คำแนะนำ:**
- ใช้ PDBP03 และ PDBP02 เป็น reference (Duplications = 0.0%)
- Extract common functions/utilities
- ใช้ DRY (Don't Repeat Yourself) principle

#### 3. Security Vulnerabilities

**SCBP03: 5 จุด** ❌ (สูงสุด)
- ต้องแก้ไขเร่งด่วน

**IMBP03: 1 จุด** ⚠️
- ต้องแก้ไข

**คำแนะนำ:**
- ตรวจสอบและแก้ไข Security vulnerabilities ทันที
- ตรวจสอบ Security Hotspots ทั้งหมด 44 จุด
- ใช้ security best practices

#### 4. Reliability Issues

**IMBP03: 22 จุด** ❌ (สูงสุด)
**IMBP02: 19 จุด** ⚠️

**คำแนะนำ:**
- แก้ไข bugs โดยเฉพาะ IMBP03 และ IMBP02
- เพิ่ม error handling
- เพิ่ม input validation

#### 5. Maintainability Issues

**IMBP02: 26 จุด** ❌ (สูงสุด)
**PDBP02: 20 จุด** ⚠️

**คำแนะนำ:**
- Refactor code smells
- ปรับปรุง code structure
- ใช้ IMBP01 เป็น reference (Maintainability = 7)

---

### 6.2 Action Items

#### 🔴 เร่งด่วน (High Priority)

1. **แก้ไข Security vulnerabilities**
   - SCBP03: 5 จุด
   - IMBP03: 1 จุด

2. **Refactor Code Duplications**
   - SCBP01: 65.5% → <10%
   - SCBP03: 34.8% → <10%

#### 🟡 สำคัญ (Medium Priority)

1. **แก้ไข Reliability issues**
   - IMBP03: 22 จุด → <10
   - IMBP02: 19 จุด → <10

2. **ลด Maintainability issues**
   - IMBP02: 26 จุด → <15
   - PDBP02: 20 จุด → <15

3. **ตรวจสอบ Security Hotspots**
   - ทั้งหมด 44 จุด
   - โดยเฉพาะ IMBP02 (7 จุด) และ PDBP03 (6 จุด)

#### 🟢 ควรทำ (Low Priority)

1. **เพิ่ม Test Coverage**
   - เป้าหมาย: 70-80%
   - เริ่มจาก PDBP03, SCBP01, IMBP02

2. **ปรับปรุง Maintainability**
   - ทุกเวอร์ชัน
   - ใช้ IMBP01 เป็น reference

---

## 💡 7. Best Practices ที่เรียนรู้ได้

### 7.1 จาก PDBP03 (Best Version - SDD)

1. **Repository Pattern**
   ```javascript
   // แยก data access layer
   const cart = await cartRepository.getCartByUserId(userId);
   ```

2. **Service Layer**
   ```javascript
   // แยก business logic
   const result = await promotionService.applyCoupon({ userId, couponCode });
   ```

3. **Error Factory**
   ```javascript
   // Structured error handling
   throw errorFactory.expired();
   throw errorFactory.minSpend();
   ```

4. **Zod Validation**
   ```javascript
   // Type-safe input validation
   const schema = z.object({
     productId: z.number().int().positive(),
   });
   ```

### 7.2 จาก SCBP01 (จุดเปลี่ยนสำคัญ - Basic Prompt)

1. **Transaction Helper**
   ```javascript
   export async function withTx(fn) {
     const client = await pool.connect();
     try {
       await client.query("BEGIN");
       const result = await fn(client);
       await client.query("COMMIT");
       return result;
     } catch (err) {
       await client.query("ROLLBACK");
       throw err;
     } finally {
       client.release();
     }
   }
   ```

2. **Row Locking**
   ```javascript
   // ป้องกัน race condition
   const productRes = await client.query(
     "SELECT id, stock FROM products WHERE id=$1 FOR UPDATE",
     [productId]
   );
   ```

3. **Integer Cents Math**
   ```javascript
   // แก้ปัญหา floating point errors
   const price_cents = 1999; // $19.99
   ```

### 7.3 จาก IMBP02 (Concurrency Safety - Context Engineering)

1. **Atomic Transactions**
   ```javascript
   await client.query("BEGIN");
   // ... update stock and logs in same transaction
   await client.query("COMMIT");
   ```

2. **Overselling Prevention**
   ```javascript
   if (quantity > product.stock) {
     await client.query("ROLLBACK");
     return res.status(409).json({ error: "Insufficient stock" });
   }
   ```

---

## 🔬 8. Code Evolution Analysis: การพัฒนาของโค้ดในแต่ละกลุ่ม Scenario

### 8.1 ภาพรวม

ส่วนนี้วิเคราะห์การพัฒนาของโค้ดในแต่ละกลุ่ม scenario ที่เหมือนกัน โดยเปรียบเทียบระหว่าง 3 วิธีการพัฒนา:

**กลุ่ม Scenario:**
1. **Inventory Management** (IMBP01, IMBP02, IMBP03) - `scenarios_inventory.md`
2. **Shopping Cart** (SCBP01, SCBP02, SCBP03) - `scenarios_cart.md`
3. **Promotions & Discounts** (PDBP01, PDBP02, PDBP03) - `scenarios_promotions.md`

---

### 8.2 Inventory Management System (IMBP01, IMBP02, IMBP03)

#### Scenario: Stock Deduction (การตัดสต็อก)

**IMBP01 (Basic Prompt) - `inventoryController.js`**

```javascript
// POST /api/purchase
async function purchase(req, res) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    
    // Lock product row
    const pr = await client.query(
      `SELECT id, name, stock FROM products WHERE id = $1 FOR UPDATE`,
      [productId]
    );
    
    // Basic stock check
    if (before < quantity) {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "Not enough stock" });
    }
    
    // Update stock + Log history
    await client.query(`UPDATE products SET stock = $1 WHERE id = $2`, [after, productId]);
    await client.query(`INSERT INTO stock_history ...`, [...]);
    
    await client.query("COMMIT");
    
    // ❌ Low stock alert อยู่นอก transaction (ไม่ atomic!)
    if (after < threshold()) {
      console.log(`[LOW STOCK] productId=${productId} stock=${after}`);
    }
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("purchase:", e);  // ❌ Basic error handling
    return res.status(500).json({ error: "Server error" });
  }
}
```

**จุดเด่น:** ✅ FOR UPDATE, ✅ Transaction, ✅ Stock validation  
**จุดที่ควรปรับปรุง:** ❌ Low stock alert อยู่นอก transaction, ❌ Error handling ยังไม่เป็นระบบ

---

**IMBP02 (Context Engineering) - `app.js`**

```javascript
app.post("/api/purchase", async (req, res) => {
  // Configurable threshold
  const threshold = Number.isFinite(Number(process.env.LOW_STOCK_THRESHOLD))
    ? Number(process.env.LOW_STOCK_THRESHOLD)
    : 5;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    
    // Lock product row (includes low_stock_threshold)
    const { rows } = await client.query(
      `SELECT id, stock, low_stock_threshold FROM products WHERE id = $1 FOR UPDATE`,
      [productId]
    );
    
    // Overselling prevention: validate BEFORE any write
    if (quantity > product.stock) {
      await client.query("ROLLBACK");
      return res.status(409).json({
        error: "Insufficient stock",
        available: product.stock,
        requested: quantity
      });
    }
    
    // Update stock + SALE log (same transaction => atomic)
    await client.query(`UPDATE products SET stock = $1 WHERE id = $2`, [remainingStock, productId]);
    await client.query(`INSERT INTO inventory_log ...`, [...]);
    
    // ✅ Low stock alert trigger (STRICT <=) - INSIDE transaction!
    const lowStockAlertTriggered = remainingStock <= threshold;
    if (lowStockAlertTriggered) {
      await client.query(`INSERT INTO inventory_log ...`, [...]);
    }
    
    await client.query("COMMIT");
    
    return res.json({
      ok: true,
      remainingStock,
      lowStockAlertTriggered,  // ✅ Response มีข้อมูลครบ
      lowStockThresholdUsed: threshold
    });
  } catch (err) {
    try { await client.query("ROLLBACK"); } catch (_) {}
    return res.status(500).json({ 
      error: "Purchase failed (rolled back)", 
      details: err.message  // ✅ Better error messages
    });
  }
});
```

**การปรับปรุงจาก IMBP01:**
- ✅ **Low stock alert อยู่ใน transaction** - Atomic!
- ✅ **ใช้ low_stock_threshold จาก database** - ไม่ hardcode
- ✅ **Boundary check ถูกต้อง** - ใช้ `<=` (STRICT)
- ✅ **Error messages ดีขึ้น** - มี details
- ✅ **Response มีข้อมูลครบ** - lowStockAlertTriggered, threshold

**จุดที่ควรปรับปรุง:**
- ❌ ยังไม่มี service layer
- ❌ Error handling ยังไม่เป็นระบบ
- ❌ ไม่มี structured error codes

---

**IMBP03 (SDD) - `stockService.js`**

```javascript
const { withTransaction } = require('../db');
const inventoryRepository = require('../repositories/inventoryRepository');
const inventoryLogRepository = require('../repositories/inventoryLogRepository');
const stockAlertRepository = require('../repositories/stockAlertRepository');
const { logInfo } = require('../utils/logger');

const STOCK_CHANGE_TYPES = {
  SALE: 'SALE',
  RESTOCK_RETURN: 'RESTOCK_RETURN',
};

const deductStock = async ({ sku, quantity, orderId }) =>
  withTransaction(async (client) => {
    // ✅ Repository pattern - clean data access
    const item = await inventoryRepository.getBySku(client, sku, true);
    if (!item) {
      const error = new Error('SKU not found.');
      error.status = 404;
      error.code = 'sku_not_found';  // ✅ Structured error code
      throw error;
    }

    if (quantity > item.quantity) {
      const error = new Error('Insufficient stock.');
      error.status = 409;
      error.code = 'insufficient_stock';  // ✅ Structured error code
      throw error;
    }

    const newQuantity = item.quantity - quantity;
    
    // ✅ Repository pattern
    const updated = await inventoryRepository.updateQuantity(client, sku, newQuantity);
    const log = await inventoryLogRepository.createLog(client, {
      sku,
      changeType: STOCK_CHANGE_TYPES.SALE,
      quantityDelta: -quantity,
      orderId,
    });

    // ✅ Low stock alert - atomic in transaction
    if (updated.quantity <= updated.low_stock_threshold) {
      await stockAlertRepository.createAlert(client, {
        sku,
        threshold: updated.low_stock_threshold,
        quantity: updated.quantity,
      });
      logInfo('Low stock alert created', {  // ✅ Structured logging
        sku,
        quantity: updated.quantity,
        threshold: updated.low_stock_threshold,
      });
    }

    logInfo('Stock deducted', {  // ✅ Structured logging
      sku,
      quantity,
      newQuantity: updated.quantity,
      orderId,
    });

    return { updated, logId: log.id };
  });
```

**การปรับปรุงจาก IMBP02:**
- ✅ **Repository Pattern** - แยก data access layer
- ✅ **Service Layer** - แยก business logic
- ✅ **Structured Error Codes** - `sku_not_found`, `insufficient_stock`
- ✅ **Structured Logging** - `logInfo()` แทน `console.log`
- ✅ **Constants** - `STOCK_CHANGE_TYPES` แทน hardcode strings
- ✅ **Transaction Helper** - `withTransaction()` แทน manual BEGIN/COMMIT

**จุดเด่น:**
- ✅ โค้ดสะอาดและ maintainable
- ✅ แยก concerns ชัดเจน (Repository, Service, Controller)
- ✅ Error handling เป็นระบบ
- ✅ Logging เป็นระบบ

---

#### 📊 สรุปเปรียบเทียบ Inventory Management

| Feature | IMBP01 (Basic Prompt) | IMBP02 (Context Engineering) | IMBP03 (SDD) |
|---------|-------------------|---------------------------|-----------|
| **Row Locking** | ✅ FOR UPDATE | ✅ FOR UPDATE | ✅ FOR UPDATE (via Repository) |
| **Transaction** | ✅ Manual | ✅ Manual | ✅ Helper (`withTransaction`) |
| **Low Stock Alert** | ❌ Outside transaction | ✅ Inside transaction | ✅ Inside transaction + Repository |
| **Error Handling** | ❌ Basic (console.error) | ⚠️ Better messages | ✅ Structured error codes |
| **Architecture** | ❌ Monolithic | ⚠️ Better structure | ✅ Repository + Service Pattern |
| **Logging** | ❌ console.log | ❌ console.log | ✅ Structured logging |
| **Code Organization** | ❌ All in controller | ❌ All in route handler | ✅ Separated (Repository, Service, Controller) |

**จุดที่น่าสนใจ:**
1. **IMBP01 → IMBP02:** Low stock alert ย้ายเข้า transaction (Atomic!) ⭐
2. **IMBP02 → IMBP03:** Architecture ดีขึ้นมาก (Repository Pattern) ⭐
3. **IMBP03:** มี structured error codes และ logging ⭐

---

### 8.3 Shopping Cart System (SCBP01, SCBP02, SCBP03)

#### Scenario: Add to Cart (เพิ่มสินค้าลงตะกร้า)

**SCBP01 (Basic Prompt) - `cartService.js`**

```javascript
export async function addToCart(productId, qty) {
  return withTx(async (client) => {
    const cartId = await ensureDemoCart(client);

    // Lock product row to safely check stock
    const productRes = await client.query(
      "SELECT id, stock, price_cents FROM products WHERE id=$1 FOR UPDATE",
      [productId]
    );
    
    // Get existing cart item (lock row if exists)
    const itemRes = await client.query(
      "SELECT qty, saved_for_later FROM cart_items WHERE cart_id=$1 AND product_id=$2 FOR UPDATE",
      [cartId, productId]
    );

    const existingQty = itemRes.rows.length ? itemRes.rows[0].qty : 0;
    const desiredQty = existingQty + qty;

    // Stock validation
    if (desiredQty > product.stock) {
      const err = new Error(`Not enough stock. Available: ${product.stock}`);
      err.status = 409;
      throw err;
    }

    // Insert or Update
    if (itemRes.rows.length === 0) {
      await client.query(`INSERT INTO cart_items ...`, [...]);
    } else {
      await client.query(`UPDATE cart_items SET qty=$3 ...`, [...]);
    }

    return await getCart(client);
  });
}
```

**จุดเด่น:** ✅ Service Layer, ✅ Transaction Helper (`withTx`), ✅ Row Locking, ✅ Zod Validation  
**จุดที่ควรปรับปรุง:** ⚠️ Error messages ยังไม่เป็นระบบ

---

**SCBP02 (Context Engineering) - `server.js`**

```javascript
app.post("/api/cart/items", async (req, res) => {
  const sku = String(req.body?.sku || "").trim();
  const addQty = asInt(req.body?.quantity);

  // ✅ Structured error responses
  if (!sku) return apiError(res, 400, "BAD_REQUEST", "sku is required");
  if (addQty == null || addQty <= 0) {
    return apiError(res, 400, "BAD_REQUEST", "quantity must be a positive integer");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Lock product row
    const prodRes = await client.query(
      `SELECT sku, stock FROM products WHERE sku = $1 FOR UPDATE;`,
      [sku]
    );
    
    // Lock cart item row (if exists)
    const itemRes = await client.query(
      `SELECT quantity FROM cart_items WHERE cart_id = $1 AND sku = $2 FOR UPDATE;`,
      [DEMO_CART_ID, sku]
    );

    const currentQty = itemRes.rowCount ? Number(itemRes.rows[0].quantity) : 0;

    // ✅ Inventory Guard: (CurrentCartQty + NewQty) <= Stock
    if (currentQty + addQty > stock) {
      await client.query("ROLLBACK");
      return apiError(res, 409, "INSUFFICIENT_STOCK", "Insufficient Stock", {
        sku,
        stock,
        currentCartQty: currentQty,
        requestedAddQty: addQty,
        maxAddQty: Math.max(0, stock - currentQty)  // ✅ Helpful error details
      });
    }

    // Insert or Update
    if (itemRes.rowCount) {
      await client.query(`UPDATE cart_items SET quantity = quantity + $3, status = 'ACTIVE' ...`, [...]);
    } else {
      await client.query(`INSERT INTO cart_items ...`, [...]);
    }

    await client.query("COMMIT");
    const snap = await getCartSnapshot(client, DEMO_CART_ID);
    res.json({ ok: true, cart: snap });
  } catch (e) {
    await client.query("ROLLBACK");
    console.error(e);
    apiError(res, 500, "SERVER_ERROR", "Unexpected error");
  } finally {
    client.release();
  }
});
```

**การปรับปรุงจาก SCBP01:**
- ✅ **Structured Error Responses** - `apiError()` function
- ✅ **Error Codes** - `BAD_REQUEST`, `NOT_FOUND`, `INSUFFICIENT_STOCK`
- ✅ **Helpful Error Details** - `maxAddQty` ใน error response
- ✅ **Status Management** - `status = 'ACTIVE'`
- ✅ **Better Comments** - "Inventory Guard" comment

**จุดที่ควรปรับปรุง:**
- ❌ ยังไม่มี Service Layer (โค้ดอยู่ใน route handler)
- ❌ ไม่มี Transaction Helper

---

**SCBP03 (SDD) - `cartService.js`**

```javascript
export async function addToCart(productId, qty) {
  return withTx(async (client) => {
    const cartId = await ensureDemoCart(client);

    const productRes = await client.query(
      "SELECT id, stock, price_cents FROM products WHERE id=$1 FOR UPDATE",
      [productId]
    );
    
    const itemRes = await client.query(
      "SELECT qty, saved_for_later FROM cart_items WHERE cart_id=$1 AND product_id=$2 FOR UPDATE",
      [cartId, productId]
    );

    const existingQty = itemRes.rows.length ? itemRes.rows[0].qty : 0;
    const desiredQty = existingQty + qty;

    // ✅ Extracted validation function
    assertStockAvailable(desiredQty, product.stock);

    // Insert or Update
    if (itemRes.rows.length === 0) {
      await client.query(`INSERT INTO cart_items ...`, [...]);
    } else {
      await client.query(`UPDATE cart_items SET qty=$3 ...`, [...]);
    }

    return await getCart(client);
  });
}

// ✅ Extracted validation function
function assertStockAvailable(desiredQty, stock) {
  if (desiredQty > stock) {
    const err = new Error(`Not enough stock. Available: ${stock}`);
    err.status = 409;
    throw err;
  }
}
```

**การปรับปรุงจาก SCBP02:**
- ✅ **Service Layer** - กลับมาใช้ service layer (เหมือน SCBP01)
- ✅ **Transaction Helper** - ใช้ `withTx()` (เหมือน SCBP01)
- ✅ **Extracted Functions** - `assertStockAvailable()` - DRY principle
- ✅ **Cleaner Code** - โค้ดสั้นและอ่านง่ายขึ้น

**จุดเด่น:**
- ✅ รวมจุดดีของ SCBP01 (Service Layer, Transaction Helper) กับ SCBP02 (Better error handling)
- ✅ โค้ดสะอาดและ maintainable

---

#### 📊 สรุปเปรียบเทียบ Shopping Cart

| Feature | SCBP01 (Basic Prompt) | SCBP02 (Context Engineering) | SCBP03 (SDD) |
|---------|-------------------|---------------------------|------------|
| **Service Layer** | ✅ Yes | ❌ No | ✅ Yes |
| **Transaction Helper** | ✅ `withTx()` | ❌ Manual | ✅ `withTx()` |
| **Row Locking** | ✅ FOR UPDATE | ✅ FOR UPDATE | ✅ FOR UPDATE |
| **Error Handling** | ⚠️ Basic | ✅ Structured (`apiError`) | ⚠️ Basic (แต่มี Zod) |
| **Error Codes** | ❌ No | ✅ Yes | ⚠️ Status codes only |
| **Validation** | ✅ Zod | ⚠️ Manual | ✅ Zod |
| **Code Organization** | ✅ Service Layer | ❌ Route handler | ✅ Service Layer |
| **Extracted Functions** | ❌ No | ❌ No | ✅ `assertStockAvailable()` |

**จุดที่น่าสนใจ:**
1. **SCBP01 → SCBP02:** เพิ่ม structured error handling แต่เสีย Service Layer
2. **SCBP02 → SCBP03:** กลับมาใช้ Service Layer + Transaction Helper + Extracted Functions
3. **SCBP03:** รวมจุดดีของ SCBP01 และ SCBP02 ⭐

---

### 8.4 Promotions & Discounts System (PDBP01, PDBP02, PDBP03)

#### Scenario: Apply Coupon (ใช้คูปอง)

**PDBP01 (Basic Prompt) - `server.js`**

```javascript
async function buildQuote(client, { userId, items, couponCode }, { consumeOnConfirm, autoDiscountPercent }) {
  const errors = [];  // ❌ Error handling แบบ array
  const messages = [];

  // Load products
  const { rows: products } = await client.query(
    `SELECT id, name, price_satang, stock FROM products WHERE id = ANY($1::text[])`,
    [ids]
  );

  // Build line items + subtotal
  let subtotal = 0;
  const lineItems = [];
  for (const it of normItems) {
    const p = map.get(it.productId);
    if (!p) { errors.push(`Unknown product: ${it.productId}.`); continue; }
    if (it.qty > p.stock) {
      errors.push(`Out of stock: ${p.name} (available ${p.stock}).`);
    }
    // ... build line items
  }

  // Coupon usage count
  const code = normalizeCode(couponCode);
  let usedCount = 0;
  if (code && uid) {
    const r = await client.query(
      `SELECT used_count FROM coupon_usage WHERE user_id=$1 AND coupon_code=$2`,
      [uid, code]
    );
    usedCount = r.rows?.[0]?.used_count ?? 0;
  }

  const { coupon, errors: couponErrors, messages: couponMessages } = validateCoupon({
    code,
    subtotal_satang: subtotal,
    userUsedCount: usedCount
  });

  errors.push(...couponErrors);
  messages.push(...couponMessages);

  const totals = computeTotals(subtotal, coupon, autoDiscountPercent);

  return { lineItems, totals, errors, messages };
}
```

**จุดเด่น:** ✅ มี coupon validation, ✅ มี usage count check, ✅ มี order of operations  
**จุดที่ควรปรับปรุง:** ❌ โค้ดยาวมาก (all-in-one function), ❌ Error handling แบบ array, ❌ ไม่มี structured error codes

---

**PDBP02 (Context Engineering) - `applyCouponController.js`**

```javascript
async function applyCoupon(req, res, next) {
  try {
    const { userId, orderId, couponCode } = req.body || {};

    if (!userId || !orderId || !couponCode || typeof couponCode !== "string") {
      return res.status(400).json({ 
        error: "INVALID_REQUEST", 
        message: "userId, orderId, couponCode are required" 
      });
    }

    // 1) Load order (and ensure it belongs to user)
    const orderResult = await db.query(`SELECT ... FROM orders WHERE id = $1`, [orderId]);
    if (orderResult.rowCount === 0) {
      return res.status(404).json({ error: "ORDER_NOT_FOUND", message: "Order not found" });
    }

    // 2) Load coupon
    const couponResult = await db.query(`SELECT ... FROM coupons WHERE code = $1`, [couponCode.trim().toUpperCase()]);
    if (couponResult.rowCount === 0) {
      return res.status(400).json({ error: "COUPON_INVALID", message: "Invalid coupon code" });
    }

    // 3) Expiry check
    if (coupon.expires_at) {
      const now = new Date();
      const expires = new Date(coupon.expires_at);
      if (now.getTime() > expires.getTime()) {
        return res.status(400).json({ error: "COUPON_EXPIRED", message: "Coupon has expired" });
      }
    }

    // 4) Minimum purchase check
    const minPurchase = parseInt(coupon.min_purchase_satang, 10);
    if (original < minPurchase) {
      return res.status(400).json({
        error: "MIN_PURCHASE_NOT_MET",
        message: `Minimum purchase not met`,
        min_purchase_satang: minPurchase,
      });
    }

    // 5) One-time per user policy
    if (coupon.one_time_per_user) {
      const used = await db.query(
        `SELECT 1 FROM user_coupon_history WHERE user_id = $1 AND coupon_id = $2 LIMIT 1`,
        [userId, coupon.id]
      );
      if (used.rowCount > 0) {
        return res.status(400).json({ 
          error: "COUPON_OVERUSED", 
          message: "Coupon already used by this user" 
        });
      }
    }

    // 6) Sequenced calculation (integer satang)
    const percentDiscount = calcPercentDiscount(original, percentBps);
    const afterPercent = original - percentDiscount;
    const afterFixed = afterPercent - fixedSatang;
    const grandTotal = Math.max(0, afterFixed);  // ✅ Negative protection

    // 7) Persist: update order + insert history (transaction)
    await db.query("BEGIN");
    await db.query(`UPDATE orders SET ...`, [...]);
    await db.query(`INSERT INTO user_coupon_history ...`, [...]);
    await db.query("COMMIT");

    res.json({ ok: true, order: updated.rows[0], message: "Coupon applied successfully" });
  } catch (err) {
    await db.query("ROLLBACK");
    next(err);
  }
}
```

**การปรับปรุงจาก PDBP01:**
- ✅ **Structured Error Codes** - `COUPON_INVALID`, `COUPON_EXPIRED`, `MIN_PURCHASE_NOT_MET`
- ✅ **Better Organization** - แบ่งเป็น steps (1-7) ชัดเจน
- ✅ **Better Comments** - อธิบายแต่ละ step
- ✅ **Transaction** - มี transaction สำหรับ persistence
- ✅ **Order of Operations** - ชัดเจน (percent → fixed)
- ✅ **Negative Protection** - `Math.max(0, afterFixed)`
- ✅ **Audit Trail** - `user_coupon_history`

**จุดที่ควรปรับปรุง:**
- ❌ ยังไม่มี Service Layer (โค้ดอยู่ใน controller)
- ❌ ไม่มี Repository Pattern

---

**PDBP03 (SDD) - `promotionService.js`**

```javascript
const couponRepository = require('../repositories/couponRepository');
const cartRepository = require('../repositories/cartRepository');
const usageRepository = require('../repositories/couponUsageRepository');
const eventRepository = require('../repositories/eventRepository');
const { percentOf, clampZero, sumCents } = require('../utils/money');
const { errorFactory } = require('../utils/errors');

// ✅ Extracted validation functions
function validateDateWindow(coupon) {
  const now = new Date();
  if (now < coupon.start_at || now > coupon.end_at) {
    throw errorFactory.expired();
  }
}

function validateMinimum(cart, coupon) {
  if (cart.subtotal_cents < coupon.min_subtotal_cents) {
    throw errorFactory.minSpend();
  }
}

async function validateUsage(userId, coupon) {
  const usage = await usageRepository.getUsage(userId, coupon.code);
  if (usage && usage.times_used >= coupon.usage_limit_per_user) {
    throw errorFactory.usageLimit();
  }
}

function computeDiscountAmount(cart, coupon) {
  if (coupon.type === 'percent') {
    return percentOf(cart.subtotal_cents, coupon.value_percent);
  }
  return coupon.value_cents;
}

// ✅ Clean service function
async function applyCoupon({ userId, couponCode }) {
  const normalizedCode = couponCode.trim().toUpperCase();
  try {
    // ✅ Repository pattern
    const cart = await cartRepository.getCartByUserId(userId);
    const coupon = await couponRepository.findByCode(normalizedCode);
    
    // Check for duplicate
    const existingDiscount = await cartRepository.findDiscountByCode(cart.id, normalizedCode);
    if (existingDiscount) {
      throw errorFactory.duplicate();
    }

    // ✅ Validation (extracted functions)
    validateDateWindow(coupon);
    validateMinimum(cart, coupon);
    await validateUsage(userId, coupon);

    // Compute discount
    const discountAmount = computeDiscountAmount(cart, coupon);
    const priority = determinePriority(coupon);

    // Persist discount line
    await cartRepository.addDiscountLine(cart.id, {
      couponCode: normalizedCode,
      amountCents: discountAmount,
      priority,
      discountType: coupon.type,
      reason: 'applied',
    });

    // Increment usage
    await usageRepository.incrementUsage(userId, normalizedCode);

    // Calculate totals
    const discounts = await cartRepository.getDiscounts(cart.id);
    const totalDiscount = clampZero(sumCents(discounts.map((d) => d.amount_cents)));
    const grand = clampZero(cart.subtotal_cents - totalDiscount);

    // ✅ Event logging
    await eventRepository.logEvent({
      couponCode: normalizedCode,
      userId,
      status: 'applied',
      reason: 'success',
      deltaCents: discountAmount,
    });

    return {
      discountAmount,
      message: 'ใช้คูปองสำเร็จ',
      grandTotalCents: grand,
    };
  } catch (error) {
    // ✅ Event logging for failures
    await eventRepository.logEvent({
      couponCode: normalizedCode,
      userId,
      status: 'rejected',
      reason: error.reason || 'error',
      deltaCents: 0,
    });
    throw error;
  }
}
```

**การปรับปรุงจาก PDBP02:**
- ✅ **Repository Pattern** - แยก data access layer
- ✅ **Service Layer** - แยก business logic
- ✅ **Error Factory** - `errorFactory.expired()`, `errorFactory.minSpend()`
- ✅ **Extracted Functions** - `validateDateWindow()`, `validateMinimum()`, `validateUsage()`
- ✅ **Money Utilities** - `percentOf()`, `clampZero()`, `sumCents()`
- ✅ **Event Logging** - `eventRepository.logEvent()` สำหรับ audit
- ✅ **Clean Code** - โค้ดสั้น อ่านง่าย maintainable

**จุดเด่น:**
- ✅ Clean Architecture (Repository + Service)
- ✅ Error handling เป็นระบบ (Error Factory)
- ✅ Code organization ดีมาก (Extracted Functions)
- ✅ Event logging สำหรับ audit trail

---

#### 📊 สรุปเปรียบเทียบ Promotions & Discounts

| Feature | PDBP01 (Basic Prompt) | PDBP02 (Context Engineering) | PDBP03 (SDD) |
|---------|-------------------|---------------------------|------------|
| **Service Layer** | ❌ No | ❌ No | ✅ Yes |
| **Repository Pattern** | ❌ No | ❌ No | ✅ Yes |
| **Error Handling** | ❌ Array (errors.push) | ✅ Structured codes | ✅ Error Factory |
| **Error Codes** | ❌ No | ✅ Yes | ✅ Error Factory |
| **Code Organization** | ❌ All-in-one | ⚠️ Steps (1-7) | ✅ Extracted Functions |
| **Validation** | ⚠️ Mixed in function | ⚠️ Inline | ✅ Extracted Functions |
| **Money Utilities** | ⚠️ Inline | ⚠️ Inline | ✅ `percentOf()`, `clampZero()` |
| **Event Logging** | ❌ No | ❌ No | ✅ Yes |
| **Transaction** | ⚠️ Partial | ✅ Yes | ✅ Yes (via Repository) |

**จุดที่น่าสนใจ:**
1. **PDBP01 → PDBP02:** เพิ่ม structured error codes และ better organization
2. **PDBP02 → PDBP03:** เพิ่ม Repository Pattern, Error Factory, Extracted Functions
3. **PDBP03:** Clean Architecture - โค้ดสะอาดและ maintainable มากที่สุด ⭐

---

### 8.5 สรุปการวิเคราะห์ Code Evolution

#### 8.5.1 จุดที่โค้ดดีขึ้นชัดเจน

**1. Architecture Evolution**

```
Monolithic/All-in-one (IMBP01, SCBP01, PDBP01)
    ↓
Better Structure (IMBP02, SCBP02, PDBP02)
    ↓
Clean Architecture (IMBP03, SCBP03, PDBP03) ✅
```

**ตัวอย่าง:**
- **IMBP01:** All in controller
- **IMBP02:** Better structure แต่ยังไม่มี service layer
- **IMBP03:** Repository + Service Pattern ✅

**2. Error Handling Evolution**

```
console.error / errors.push (IMBP01, PDBP01)
    ↓
Structured error codes (IMBP02, SCBP02, PDBP02)
    ↓
Error Factory Pattern (IMBP03, PDBP03) ✅
```

**ตัวอย่าง:**
- **IMBP01:** `console.error("purchase:", e)`
- **PDBP02:** `error: "COUPON_EXPIRED", message: "Coupon has expired"`
- **PDBP03:** `throw errorFactory.expired()` ✅

**3. Code Organization Evolution**

```
Long functions (all-in-one) (PDBP01)
    ↓
Better comments and steps (PDBP02)
    ↓
Extracted Functions (SCBP03, PDBP03) ✅
```

**ตัวอย่าง:**
- **PDBP01:** `buildQuote()` function ยาวมาก (all-in-one)
- **PDBP02:** แบ่งเป็น steps (1-7) แต่ยังอยู่ใน function เดียว
- **PDBP03:** `validateDateWindow()`, `validateMinimum()`, `validateUsage()` - Extracted Functions ✅

**4. Transaction & Atomicity**

```
Manual transaction + Alert outside (IMBP01) ❌
    ↓
Manual transaction + Alert inside (IMBP02) ✅
    ↓
Transaction Helper + Repository (IMBP03, PDBP03) ✅
```

**ตัวอย่าง:**
- **IMBP01:** Low stock alert อยู่นอก transaction ❌
- **IMBP02:** Low stock alert อยู่ใน transaction ✅
- **IMBP03:** Transaction Helper (`withTransaction`) + Repository Pattern ✅

**5. Data Access Layer**

```
Direct SQL queries (IMBP01, SCBP01, PDBP01)
    ↓
Better SQL organization (IMBP02, SCBP02, PDBP02)
    ↓
Repository Pattern (IMBP03, PDBP03) ✅
```

---

#### 8.5.2 จุดที่น่าสนใจเป็นพิเศษ

**🔍 Group 1: Inventory Management (IMBP01, IMBP02, IMBP03)**

1. **Low Stock Alert - Atomicity**
   - **IMBP01:** อยู่นอก transaction (ไม่ atomic) ❌
   - **IMBP02:** อยู่ใน transaction (atomic) ✅
   - **IMBP03:** อยู่ใน transaction + Repository Pattern ✅

2. **Error Handling**
   - **IMBP01:** `console.error()` ❌
   - **IMBP02:** Better error messages
   - **IMBP03:** Structured error codes (`sku_not_found`, `insufficient_stock`) ✅

3. **Architecture**
   - **IMBP01:** Monolithic
   - **IMBP02:** Better structure
   - **IMBP03:** Repository + Service Pattern (Clean Architecture) ✅

**สรุป:** IMBP03 ดีขึ้นชัดเจนในทุกด้าน - Architecture, Error Handling, Atomicity

---

**🔍 Group 2: Shopping Cart (SCBP01, SCBP02, SCBP03)**

1. **Service Layer**
   - **SCBP01:** มี Service Layer ✅
   - **SCBP02:** ไม่มี Service Layer (โค้ดอยู่ใน route handler) ❌
   - **SCBP03:** กลับมาใช้ Service Layer ✅

2. **Error Handling**
   - **SCBP01:** Basic error handling
   - **SCBP02:** Structured error codes (`BAD_REQUEST`, `INSUFFICIENT_STOCK`) + Helpful details ✅
   - **SCBP03:** Basic error handling แต่มี Zod validation

3. **Code Organization**
   - **SCBP01:** Service Layer แต่ยังไม่มี extracted functions
   - **SCBP02:** Better error handling แต่ไม่มี service layer
   - **SCBP03:** Service Layer + Extracted Functions (`assertStockAvailable()`) ✅

**สรุป:** SCBP03 รวมจุดดีของ SCBP01 (Service Layer) และ SCBP02 (Better error handling) + Extracted Functions

---

**🔍 Group 3: Promotions & Discounts (PDBP01, PDBP02, PDBP03)**

1. **Code Organization**
   - **PDBP01:** All-in-one function (`buildQuote()` ยาวมาก) ❌
   - **PDBP02:** แบ่งเป็น steps (1-7) แต่ยังอยู่ใน function เดียว
   - **PDBP03:** Extracted Functions (`validateDateWindow()`, `validateMinimum()`, `validateUsage()`) ✅

2. **Error Handling**
   - **PDBP01:** Error array (`errors.push()`) ❌
   - **PDBP02:** Structured error codes (`COUPON_EXPIRED`, `MIN_PURCHASE_NOT_MET`) ✅
   - **PDBP03:** Error Factory Pattern (`errorFactory.expired()`, `errorFactory.minSpend()`) ✅

3. **Architecture**
   - **PDBP01:** Monolithic (all-in-one)
   - **PDBP02:** Better structure แต่ยังไม่มี service layer
   - **PDBP03:** Repository + Service Pattern (Clean Architecture) ✅

4. **Event Logging**
   - **PDBP01:** ไม่มี
   - **PDBP02:** ไม่มี
   - **PDBP03:** `eventRepository.logEvent()` สำหรับ audit trail ✅

**สรุป:** PDBP03 ดีขึ้นชัดเจนในทุกด้าน - Architecture, Error Handling, Code Organization, Event Logging

---

#### 8.5.3 สรุปเปรียบเทียบทั้ง 3 กลุ่ม

| Aspect | Basic Prompt | Context Engineering | SDD |
|--------|--------------|---------------------|-----|
| **Architecture** | Monolithic/All-in-one | Better structure | Clean Architecture ✅ |
| **Error Handling** | Basic/Array | Structured codes | Error Factory ✅ |
| **Code Organization** | Long functions | Better comments | Extracted Functions ✅ |
| **Transaction** | Manual | Manual | Transaction Helper ✅ |
| **Data Access** | Direct SQL | Better SQL | Repository Pattern ✅ |
| **Logging** | console.log | console.log | Structured Logging ✅ |
| **Validation** | Basic/Mixed | Better validation | Extracted Functions ✅ |

---

### 8.6 ข้อค้นพบสำคัญ

**1. SDD ให้ผลลัพธ์ดีที่สุด**

**หลักฐาน:**
- **IMBP03 (SDD):** Repository + Service Pattern, Structured error codes, Structured logging
- **SCBP03 (SDD):** Service Layer + Extracted Functions
- **PDBP03 (SDD):** Clean Architecture, Error Factory, Event Logging

**สรุป:** SDD ให้โค้ดที่สะอาด maintainable และมี architecture ที่ดีที่สุด

**2. Context Engineering ช่วยปรับปรุง Error Handling**

**หลักฐาน:**
- **IMBP02:** Better error messages, Atomic transactions
- **SCBP02:** Structured error codes (`BAD_REQUEST`, `INSUFFICIENT_STOCK`)
- **PDBP02:** Structured error codes (`COUPON_EXPIRED`, `MIN_PURCHASE_NOT_MET`)

**สรุป:** Context Engineering ช่วยให้ error handling ดีขึ้น แต่ยังไม่มี Clean Architecture

**3. Basic Prompt เริ่มต้นได้ดี แต่มีข้อจำกัด**

**หลักฐาน:**
- **IMBP01:** มี FOR UPDATE, Transaction แต่ Low stock alert อยู่นอก transaction
- **SCBP01:** มี Service Layer, Transaction Helper, Zod validation แต่ Code Duplications สูง (65.5%)
- **PDBP01:** มี coupon validation, order of operations แต่โค้ดยาวมาก (all-in-one)

**สรุป:** Basic Prompt เริ่มต้นได้ดี แต่มีข้อจำกัดในเรื่อง Code Organization และ Architecture

---

## 📊 9. สถิติที่น่าสนใจ

### 8.1 คุณภาพโค้ด

- **Average Quality Score:** 3.60⭐ (IMBP01-PDBP03)
- **Quality Improvement:** 2 stars (IMBP01: 3⭐ → PDBP03: 5⭐)
- **Best Version:** PDBP03 (5⭐) - SDD
- **Worst Version:** IMBP01 (3⭐) - Basic Prompt (เริ่มต้น)

### 8.2 Features

- **Average Features:** 5.2 features per version (IMBP01-PDBP03)
- **Most Features:** PDBP03 (10 features) - SDD
- **Least Features:** IMBP01 (3 features) - Basic Prompt

### 8.3 SonarQube Metrics

- **Best Security:** IMBP01, SCBP01, PDBP01, IMBP02, SCBP02, PDBP02, PDBP03 (0)
- **Worst Security:** SCBP03 (5)
- **Best Reliability:** PDBP01 (1)
- **Worst Reliability:** IMBP03 (22)
- **Best Maintainability:** IMBP01 (7)
- **Worst Maintainability:** IMBP02 (26)
- **Best Duplications:** PDBP02, PDBP03 (0.0%)
- **Worst Duplications:** SCBP01 (65.5%)

---

## 🎯 10. สรุปและข้อเสนอแนะ

### 10.1 สรุป

1. **คุณภาพโค้ดพัฒนาขึ้นอย่างต่อเนื่อง** - จาก IMBP01 (3⭐) ไปถึง PDBP03 (5⭐)
2. **PDBP03 เป็นเวอร์ชันที่ดีที่สุด** - สอดคล้องกันทั้ง 3 วิธีการวิเคราะห์ (SDD)
3. **SCBP01 เป็นจุดเปลี่ยนสำคัญ** - เพิ่ม Zod, ES Modules, Row Locking (Basic Prompt)
4. **SDD ให้ผลลัพธ์ดีที่สุด** - Average Quality 4.33⭐, Best Version (PDBP03: 5⭐)
5. **Context Engineering ลด Code Duplications ได้ดี** - PDBP02: 0.0% (ดีที่สุด)
6. **พบปัญหาสำคัญ:** Test Coverage = 0.0%, Code Duplications สูง (SCBP01: 65.5%), Security vulnerabilities (SCBP03: 5 จุด)

### 10.2 ข้อเสนอแนะ

#### สำหรับ AI-Assisted Development

1. **ใช้ SDD สำหรับโปรเจกต์ใหม่**
   - ให้ผลลัพธ์ดีที่สุด (Average Quality 4.33⭐)
   - PDBP03 เป็นตัวอย่างที่ดี (5⭐, Clean Architecture)
   - ควรมี specification ที่ละเอียดก่อนพัฒนา

2. **ใช้ Context Engineering เพื่อลด Code Duplications**
   - PDBP02 แสดงให้เห็นว่า Context Engineering ลด Duplications ได้ดี (0.0%)
   - ควรให้ context ที่ดีเกี่ยวกับ requirements และ best practices

3. **Basic Prompt ใช้ได้ แต่ต้องระวัง**
   - SCBP01 แสดงให้เห็นว่า Basic Prompt ให้ features ดี แต่ Code Duplications สูง (65.5%)
   - ควรมี code review และ refactoring หลังพัฒนา

#### สำหรับ Developer

#### สำหรับ Developer

1. **ใช้ PDBP03 เป็น reference** - Clean Architecture, Best Practices
2. **เรียนรู้จาก SCBP01** - ES Modules + Zod + Transactions
3. **ศึกษา IMBP02** - Concurrency Safety
4. **หลีกเลี่ยงปัญหาใน SCBP01, SCBP03** - Code Duplications สูง

#### สำหรับ Project Manager

1. **เลือก Development Method ตามความต้องการ**
   - **SDD:** สำหรับโปรเจกต์ที่ต้องการคุณภาพสูง (PDBP03: 5⭐)
   - **Context Engineering:** สำหรับลด Code Duplications (PDBP02: 0.0%)
   - **Basic Prompt:** สำหรับโปรเจกต์ที่ต้องการความเร็ว แต่ต้องมี code review

2. **ตั้งเป้า Test Coverage 70-80%** - ปัจจุบัน 0.0%
3. **แก้ไข Security vulnerabilities** - โดยเฉพาะ SCBP03 (5 จุด)
4. **Refactor Code Duplications** - โดยเฉพาะ SCBP01 (65.5%)
5. **ใช้ PDBP03 เป็น baseline** - สำหรับเวอร์ชันใหม่

1. **ตั้งเป้า Test Coverage 70-80%** - ปัจจุบัน 0.0%
2. **แก้ไข Security vulnerabilities** - โดยเฉพาะ SCBP03 (5 จุด)
3. **Refactor Code Duplications** - โดยเฉพาะ SCBP01 (65.5%)
4. **ใช้ PDBP03 เป็น baseline** - สำหรับเวอร์ชันใหม่

#### สำหรับ Technical Lead

1. **กำหนด Coding Standards** - ใช้ PDBP03 เป็น reference
2. **Setup CI/CD with SonarQube** - ตรวจสอบคุณภาพอัตโนมัติ
3. **Code Review Process** - ตรวจสอบ Architecture, Patterns
4. **Training** - สอน Clean Architecture, Best Practices

---

## 📚 11. เอกสารอ้างอิง

### เอกสารหลัก

1. [Code Review Analysis](./CODE_REVIEW.md) - การทบทวนโค้ดแบบละเอียด
2. [SonarQube Analysis](./versions/sonarQube.md) - การวิเคราะห์อัตโนมัติ
3. [Version Analysis Notebook](./version_analysis.ipynb) - กราฟวิเคราะห์การพัฒนา

**หมายเหตุ:** Code Evolution Analysis ถูกรวมเข้าในส่วนที่ 8 ของเอกสารนี้แล้ว

### External Resources

- [SonarQube Documentation](https://docs.sonarqube.org/)
- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Zod Documentation](https://zod.dev/)
- [PostgreSQL Row Locking](https://www.postgresql.org/docs/current/explicit-locking.html)


---

## 📝 12. หมายเหตุ

### วิธีการวิเคราะห์

1. **Code Review:** วิเคราะห์จาก Architecture, Patterns, Features, Best Practices
2. **SonarQube:** วิเคราะห์อัตโนมัติจาก Security, Reliability, Maintainability, Duplications
3. **Version Analysis:** วิเคราะห์ด้วยกราฟและสถิติ (Trends, Evolution, Comparisons)

### วิธีการพัฒนา (Development Methods)

1. **Basic Prompt (IMBP01-PDBP01):** ใช้ prompt พื้นฐานในการพัฒนา
2. **Context Engineering (IMBP02-PDBP02):** ใช้ context ที่ดีขึ้นในการพัฒนา
3. **SDD - Spec-Driven Development (IMBP03-PDBP03):** พัฒนาตาม specification ที่ละเอียด

### ข้อจำกัด

1. **Test Coverage:** ไม่มีข้อมูล Test Coverage (0.0%) - อาจไม่สะท้อนคุณภาพจริง
2. **Code Duplications:** SCBP01 และ SCBP03 มี Duplications สูง - อาจเป็นเพราะ copy-paste
3. **Security Hotspots:** ต้องตรวจสอบด้วยตนเอง - SonarQube แค่ระบุจุด

### การตีความผล

- **Code Review:** เน้น Architecture และ Best Practices
- **SonarQube:** เน้น Metrics และ Automated Analysis
- **Version Analysis:** เน้น Trends และ Evolution

**คำแนะนำ:** ควรพิจารณาทั้ง 3 วิธีการร่วมกัน เพื่อให้ได้ภาพรวมที่ครบถ้วน

---

*รายงานนี้สรุปรวมจาก 3 วิธีการวิเคราะห์*  
*วันที่สร้าง: 2026-01-24*  
*อัปเดตล่าสุด: 2026-01-24*
