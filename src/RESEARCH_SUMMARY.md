# 📊 สรุปรวมงานวิจัย: การวิเคราะห์คุณภาพโค้ดทุกเวอร์ชัน

## 🎯 บทสรุปผู้บริหาร (Executive Summary)

งานวิจัยนี้ทำการวิเคราะห์คุณภาพโค้ดของโปรเจกต์ e-commerce/inventory system ที่มี 11 เวอร์ชัน (v.1 - v.11) โดยใช้ 3 วิธีการวิเคราะห์:

1. **Code Review Analysis** - การทบทวนโค้ดแบบละเอียด (Architecture, Patterns, Features)
2. **SonarQube Analysis** - การวิเคราะห์อัตโนมัติ (Security, Reliability, Maintainability, Duplications)
3. **Version Analysis** - การวิเคราะห์ด้วยกราฟและสถิติ (Trends, Evolution, Comparisons)

**ผลการวิจัยหลัก:**
- ✅ คุณภาพโค้ดพัฒนาขึ้นอย่างต่อเนื่อง: v.3 (3⭐) → v.11 (5⭐)
- ✅ v.11 เป็นเวอร์ชันที่ดีที่สุดทั้ง 3 วิธีการวิเคราะห์
- ⚠️ พบปัญหาสำคัญ: Test Coverage = 0.0% ทุกเวอร์ชัน
- ⚠️ v.4 และ v.10 มี Code Duplications สูงมาก (65.5%, 34.8%)
- ⚠️ v.10 มี Security vulnerabilities สูงสุด (5 จุด)

**วิธีการพัฒนา (Development Methods):**
- **v.3, v.4, v.5:** Basic Prompt (การพัฒนาแบบพื้นฐาน)
- **v.6, v.7, v.8:** Context Engineering (การพัฒนาโดยใช้ context ที่ดีขึ้น)
- **v.9, v.10, v.11:** SDD - Spec-Driven Development (การพัฒนาตาม specification)

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

**ผลการวิเคราะห์ (เริ่มจาก v.3):**

| Version | Quality Score | Key Features | Architecture | Development Method |
|---------|--------------|--------------|--------------|---------------------|
| v.3 | ⭐⭐⭐☆☆ (3/5) | Docker, Tests | Monolithic | Basic Prompt |
| v.4 | ⭐⭐⭐⭐☆ (4/5) | Zod, ES Modules, Row Locking | Service Layer | Basic Prompt |
| v.5 | ⭐⭐⭐☆☆ (3/5) | TypeScript (Frontend) | Monolithic | Basic Prompt |
| v.6 | ⭐⭐⭐⭐☆ (4/5) | Concurrency Safety | Service Layer | Context Engineering |
| v.7 | ⭐⭐⭐☆☆ (3/5) | Stock Guard | Basic | Context Engineering |
| v.8 | ⭐⭐⭐⭐☆ (4/5) | Error Middleware, Money Utils | Service Layer | Context Engineering |
| v.9 | ⭐⭐⭐⭐☆ (4/5) | API Endpoints, Alerts | Service Layer | SDD (Spec-Driven) |
| v.10 | ⭐⭐⭐⭐☆ (4/5) | Zod, ES Modules | Service Layer | SDD (Spec-Driven) |
| v.11 | ⭐⭐⭐⭐⭐ (5/5) | Repository Pattern, Error Factory | Clean Architecture | SDD (Spec-Driven) |

**จุดเด่น:**
- v.4 เป็นจุดเปลี่ยนสำคัญ: เพิ่ม Zod validation, ES Modules, Row Locking (Basic Prompt)
- v.6-v.8: ใช้ Context Engineering - คุณภาพดีขึ้น (Concurrency Safety, Error Middleware)
- v.9-v.11: ใช้ SDD (Spec-Driven Development) - คุณภาพดีที่สุด (v.11: 5⭐)

**จุดที่ควรปรับปรุง:**
- v.3: ยังไม่มี Validation และ Error Handling ที่เป็นระบบ (Basic Prompt)
- v.5: Backend ยังใช้ CommonJS (ควรเป็น ES Modules) (Basic Prompt)
- v.6: SonarQube พบ Reliability และ Maintainability issues สูง (Context Engineering)

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

**ผลการวิเคราะห์รายเวอร์ชัน (เริ่มจาก v.3):**

| Version | Security | Reliability | Maintainability | Duplications | Dev Method | Best Metric |
|---------|----------|-------------|-----------------|--------------|------------|-------------|
| v.3 | 0 ✅ | 3 ✅ | 7 ✅ | 24.2% ⚠️ | Basic Prompt | Maintainability: 7 (ดีที่สุด) |
| v.4 | 0 ✅ | 9 ⚠️ | 18 ⚠️ | **65.5%** ❌ | Basic Prompt | - |
| v.5 | 0 ✅ | **1** ✅ | 10 ✅ | **1.4%** ✅ | Basic Prompt | Reliability: 1 (ดีที่สุด) |
| v.6 | 0 ✅ | 19 ⚠️ | **26** ⚠️ | 9.3% ✅ | Context Engineering | - |
| v.7 | 0 ✅ | 9 ⚠️ | 12 ⚠️ | 4.3% ✅ | Context Engineering | - |
| v.8 | 0 ✅ | 17 ⚠️ | 20 ⚠️ | **0.0%** ✅ | Context Engineering | Duplications: 0.0% |
| v.9 | 1 ⚠️ | **22** ❌ | 18 ⚠️ | 3.1% ✅ | SDD | - |
| v.10 | **5** ❌ | 9 ⚠️ | 12 ⚠️ | 34.8% ❌ | SDD | - |
| v.11 | 0 ✅ | 8 ✅ | 17 ⚠️ | **0.0%** ✅ | SDD | Best Overall |

**จุดเด่น:**
- v.11: Security = 0, Duplications = 0.0%, Reliability = 8
- v.5: Reliability = 1 (ดีที่สุด), Duplications = 1.4%
- v.8: Duplications = 0.0%
- v.3: Maintainability = 7 (ดีที่สุด)

**จุดที่ต้องแก้ไข:**
- v.10: Security = 5 (สูงสุด), Duplications = 34.8%
- v.4: Duplications = 65.5% (สูงสุด)
- v.9: Reliability = 22 (สูงสุด), Security = 1
- v.6: Maintainability = 26 (สูงสุด), Reliability = 19

---

### 1.3 Version Analysis (Notebook)

**วิธีการ:** การวิเคราะห์ด้วยกราฟและสถิติ (Pandas, Matplotlib, Seaborn)

**ผลการวิเคราะห์:**

**คุณภาพโค้ด:**
- Average Quality Score: 3.60⭐ (v.3-v.11)
- Quality Improvement: 2 stars (v.3: 3⭐ → v.11: 5⭐)
- Best Version: v.11 (5⭐, 10 features)

**Features Evolution:**
- v.3: 3 features (เริ่มต้น)
- v.4: 9 features (กระโดดใหญ่ - Basic Prompt)
- v.11: 10 features (มากที่สุด - SDD)

**Architecture Evolution:**
- v.3: Monolithic (Basic Prompt)
- v.4-v.10: Service Layer (Basic Prompt → Context Engineering → SDD)
- v.11: Repository + Service Pattern (Clean Architecture - SDD)

**Development Method Impact:**
- **Basic Prompt (v.3-v.5):** คุณภาพ 3-4⭐, มี features ดี แต่ Code Duplications สูง (v.4: 65.5%)
- **Context Engineering (v.6-v.8):** คุณภาพ 3-4⭐, Code Duplications ลดลง (v.8: 0.0%)
- **SDD (v.9-v.11):** คุณภาพ 4-5⭐, Architecture ดีขึ้น (v.11: Clean Architecture)

**Tech Stack Adoption:**
- ES Modules: v.4, v.10
- TypeScript: v.2, v.5 (Frontend only)
- Zod Validation: v.4, v.10, v.11
- Docker: v.3+ (ทุกเวอร์ชัน)
- Tests: v.3, v.4, v.5, v.6, v.8, v.10, v.11

---

## 🔍 2. วิธีการพัฒนาและผลกระทบต่อคุณภาพโค้ด

### 2.1 วิธีการพัฒนา (Development Methods)

งานวิจัยนี้ใช้ 3 วิธีการพัฒนาในการสร้างแต่ละเวอร์ชัน:

#### 📝 Basic Prompt (v.3, v.4, v.5)

**ลักษณะ:**
- ใช้ prompt พื้นฐานในการพัฒนา
- ไม่มี context หรือ specification ที่ละเอียด
- พัฒนาตามความต้องการพื้นฐาน

**ผลลัพธ์:**
- ✅ v.3: คุณภาพ 3⭐, Maintainability ดี (7 จุด)
- ✅ v.4: คุณภาพ 4⭐, มี features ดี (Zod, ES Modules, Row Locking)
- ⚠️ v.4: Code Duplications สูงมาก (65.5%)
- ✅ v.5: Reliability ดีที่สุด (1 จุด), Code Duplications ต่ำ (1.4%)

**ข้อสังเกต:**
- คุณภาพดีขึ้นจาก v.3 → v.4 (3⭐ → 4⭐)
- แต่ Code Duplications สูงมากใน v.4 (65.5%)
- v.5 มี metrics ดีมาก แต่ Backend ยังใช้ CommonJS

#### 🧠 Context Engineering (v.6, v.7, v.8)

**ลักษณะ:**
- ใช้ context ที่ดีขึ้นในการพัฒนา
- มีการให้ข้อมูลเพิ่มเติมเกี่ยวกับ requirements
- เน้นการแก้ไขปัญหาที่พบในเวอร์ชันก่อนหน้า

**ผลลัพธ์:**
- ✅ v.6: คุณภาพ 4⭐, มี Concurrency Safety (FOR UPDATE)
- ⚠️ v.6: SonarQube พบ Reliability (19) และ Maintainability (26) สูง
- ✅ v.7: คุณภาพ 3⭐, Code Duplications ต่ำ (4.3%)
- ✅ v.8: Code Duplications = 0.0% (ดีที่สุด), Error Middleware

**ข้อสังเกต:**
- Code Duplications ลดลงอย่างชัดเจน (v.4: 65.5% → v.8: 0.0%)
- แต่ SonarQube พบ issues สูงใน v.6 (Reliability: 19, Maintainability: 26)
- v.8 มี Code Duplications = 0.0% - เป็นตัวอย่างที่ดี

#### 📋 SDD - Spec-Driven Development (v.9, v.10, v.11)

**ลักษณะ:**
- พัฒนาตาม specification ที่ละเอียด
- มีการวางแผนและออกแบบก่อนพัฒนา
- เน้น Clean Architecture และ Best Practices

**ผลลัพธ์:**
- ⚠️ v.9: คุณภาพ 4⭐, แต่ Reliability issues สูง (22 จุด), Security (1 จุด)
- ⚠️ v.10: คุณภาพ 4⭐, แต่ Security vulnerabilities สูงสุด (5 จุด), Duplications (34.8%)
- ✅ v.11: คุณภาพ 5⭐ (ดีที่สุด), Security = 0, Duplications = 0.0%, Clean Architecture

**ข้อสังเกต:**
- คุณภาพดีขึ้นอย่างต่อเนื่อง (v.9: 4⭐ → v.11: 5⭐)
- v.11 เป็นเวอร์ชันที่ดีที่สุดทั้ง 3 วิธีการวิเคราะห์
- แต่ v.9 และ v.10 ยังมี issues ที่ต้องแก้ไข

### 2.2 เปรียบเทียบผลกระทบของวิธีการพัฒนา

| Development Method | Versions | Avg Quality | Avg Duplications | Best Version | Issues |
|-------------------|----------|-------------|------------------|--------------|--------|
| **Basic Prompt** | v.3-v.5 | 3.33⭐ | 30.4% | v.5 (Reliability: 1) | v.4: Duplications 65.5% |
| **Context Engineering** | v.6-v.8 | 3.67⭐ | 4.5% | v.8 (Duplications: 0.0%) | v.6: Reliability 19, Maintainability 26 |
| **SDD** | v.9-v.11 | 4.33⭐ | 12.6% | v.11 (5⭐, Best Overall) | v.9: Reliability 22, v.10: Security 5 |

**สรุป:**
- **SDD ให้ผลลัพธ์ดีที่สุด** - Average Quality 4.33⭐, Best Version (v.11)
- **Context Engineering ลด Code Duplications ได้ดี** - Average 4.5% (v.8: 0.0%)
- **Basic Prompt เริ่มต้นได้ดี** - แต่ Code Duplications สูง (v.4: 65.5%)

---

## 🔍 3. เปรียบเทียบผลการวิเคราะห์ทั้ง 3 วิธี

### 2.1 ความสอดคล้องระหว่างวิธีการ

| Version | Code Review | SonarQube | Version Analysis | Dev Method | สรุป |
|---------|-------------|-----------|------------------|------------|------|
| **v.11** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | SDD | ✅ **สอดคล้องกัน - ดีที่สุด** |
| **v.5** | ⭐⭐⭐☆☆ | ⭐⭐⭐⭐ | ⭐⭐⭐☆☆ | Basic Prompt | ⚠️ SonarQube ดีกว่า (Reliability: 1) |
| **v.4** | ⭐⭐⭐⭐☆ | ⭐⭐ | ⭐⭐⭐⭐☆ | Basic Prompt | ⚠️ Code Review ดีกว่า แต่ Duplications สูง |
| **v.6** | ⭐⭐⭐⭐☆ | ⭐⭐ | ⭐⭐⭐⭐☆ | Context Engineering | ⚠️ Code Review ดีกว่า แต่ SonarQube พบ issues สูง |
| **v.8** | ⭐⭐⭐⭐☆ | ⭐⭐⭐ | ⭐⭐⭐⭐☆ | Context Engineering | ✅ Code Duplications = 0.0% |
| **v.10** | ⭐⭐⭐⭐☆ | ⭐ | ⭐⭐⭐⭐☆ | SDD | ❌ SonarQube แย่กว่า (Security: 5) |
| **v.3** | ⭐⭐⭐☆☆ | ⭐⭐⭐⭐ | ⭐⭐⭐☆☆ | Basic Prompt | ✅ SonarQube ดีกว่า (Maintainability: 7) |

### 2.2 การวิเคราะห์ความแตกต่าง

**กรณีที่ Code Review ให้คะแนนดี แต่ SonarQube พบ issues:**

1. **v.4 (Code Review: 4⭐, SonarQube: Duplications 65.5%)**
   - **สาเหตุ:** มี features ดี (Zod, ES Modules, Row Locking) แต่มี Code Duplications สูงมาก
   - **คำแนะนำ:** ควร refactor เพื่อลด Code Duplications

2. **v.6 (Code Review: 4⭐, SonarQube: Reliability 19, Maintainability 26)**
   - **สาเหตุ:** มี Concurrency Safety (FOR UPDATE) แต่ SonarQube พบ bugs และ code smells สูง
   - **คำแนะนำ:** ควรแก้ไข bugs และ refactor code smells

3. **v.10 (Code Review: 4⭐, SonarQube: Security 5, Duplications 34.8%)**
   - **สาเหตุ:** มี Zod, ES Modules แต่มี Security vulnerabilities และ Code Duplications สูง
   - **คำแนะนำ:** ต้องแก้ไข Security issues เร่งด่วน

**กรณีที่ SonarQube ให้คะแนนดี แต่ Code Review พบข้อบกพร่อง:**

1. **v.5 (SonarQube: Reliability 1, Code Review: 3⭐)**
   - **สาเหตุ:** SonarQube metrics ดีมาก แต่ Backend ยังใช้ CommonJS (ควรเป็น ES Modules)
   - **คำแนะนำ:** ควร migrate ไปใช้ ES Modules

---

## 📈 4. แนวโน้มการพัฒนา

### 4.1 คุณภาพโค้ด

```
v.3 (3⭐) [Basic Prompt] 
  → v.4 (4⭐) [Basic Prompt] 
  → v.5 (3⭐) [Basic Prompt]
  → v.6 (4⭐) [Context Engineering]
  → v.7 (3⭐) [Context Engineering]
  → v.8 (4⭐) [Context Engineering]
  → v.9 (4⭐) [SDD]
  → v.10 (4⭐) [SDD]
  → v.11 (5⭐) [SDD]
```

**จุดเปลี่ยนสำคัญ:**
- **v.3 → v.4:** กระโดดจาก 3⭐ → 4⭐ (Basic Prompt - เพิ่ม Zod, ES Modules, Row Locking)
- **v.5 → v.6:** เปลี่ยนเป็น Context Engineering - คุณภาพ 4⭐, Code Duplications ลดลง
- **v.8 → v.9:** เปลี่ยนเป็น SDD - คุณภาพคงที่ 4⭐ แต่ Architecture ดีขึ้น
- **v.10 → v.11:** กระโดดจาก 4⭐ → 5⭐ (SDD - เพิ่ม Repository Pattern, Clean Architecture)

### 4.2 Architecture Evolution

```
Monolithic (v.3) [Basic Prompt]
    ↓
Service Layer (v.4-v.10) [Basic Prompt → Context Engineering → SDD]
    ↓
Repository + Service Pattern (v.11) [SDD] ← Clean Architecture
```

**ความสัมพันธ์กับ Development Method:**
- **Basic Prompt:** Monolithic → Service Layer (v.3-v.5)
- **Context Engineering:** Service Layer (v.6-v.8)
- **SDD:** Service Layer → Clean Architecture (v.9-v.11)

### 4.3 Features Evolution

**Type Safety:**
- v.2-v.3: ไม่มี validation
- v.4, v.10, v.11: Zod validation
- v.2, v.5: TypeScript (Frontend only)

**Concurrency Safety:**
- v.3-v.4: Basic transactions
- v.4+: Row Locking (FOR UPDATE)
- v.6+: Atomic transactions

**Error Handling:**
- v.3-v.4: Basic error handler
- v.8-v.9: Error handler middleware
- v.11: Error factory pattern

**Money Handling:**
- v.4+: Integer cents math
- v.8+: Integer satang math (THB*100)

---

## 🏆 5. เวอร์ชันที่ดีที่สุด

### 5.1 v.11 (promotions-app) ⭐⭐⭐⭐⭐ - SDD

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

**สรุป:** v.11 เป็นเวอร์ชันที่ดีที่สุดทั้ง 3 วิธีการวิเคราะห์ ✅  
**Development Method:** SDD (Spec-Driven Development) - แสดงให้เห็นว่า SDD ให้ผลลัพธ์ดีที่สุด

### 5.2 เวอร์ชันอื่นที่น่าสนใจ

**v.8 (promotions-discounts-system) - Context Engineering:**
- SonarQube: Duplications = 0.0%, Security = 0
- Code Review: 4⭐ (Error Middleware, Money Utils)
- **Development Method:** Context Engineering - แสดงให้เห็นว่า Context Engineering ลด Code Duplications ได้ดี

**v.5 (promo-shop-plug-and-play) - Basic Prompt:**
- SonarQube: Reliability = 1 (ดีที่สุด), Duplications = 1.4%
- Code Review: 3⭐ (Backend ยังใช้ CommonJS)
- **Development Method:** Basic Prompt - แสดงให้เห็นว่า Basic Prompt ก็ให้ผลลัพธ์ดีได้ถ้า prompt ดี

**v.3 (online-shop-inventory) - Basic Prompt:**
- SonarQube: Maintainability = 7 (ดีที่สุด), Reliability = 3
- Code Review: 3⭐ (เริ่มต้นที่ดี แต่ยังไม่มี Validation)
- **Development Method:** Basic Prompt - เริ่มต้นที่ดี

**v.5 (promo-shop-plug-and-play):**
- SonarQube: Reliability = 1 (ดีที่สุด), Duplications = 1.4%
- Code Review: 3⭐ (Backend ยังใช้ CommonJS)

**v.8 (promotions-discounts-system):**
- SonarQube: Duplications = 0.0%, Security = 0
- Code Review: 4⭐ (Error Middleware, Money Utils)

**v.3 (online-shop-inventory):**
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
- เริ่มจาก v.11, v.4, v.6 ที่มี test files อยู่แล้ว
- เพิ่ม Integration Tests

#### 2. Code Duplications สูง

**v.4: 65.5%** ❌
- สูงที่สุดในทุกเวอร์ชัน
- ต้อง refactor เร่งด่วน

**v.10: 34.8%** ❌
- สูงมาก ต้อง refactor

**คำแนะนำ:**
- ใช้ v.11 และ v.8 เป็น reference (Duplications = 0.0%)
- Extract common functions/utilities
- ใช้ DRY (Don't Repeat Yourself) principle

#### 3. Security Vulnerabilities

**v.10: 5 จุด** ❌ (สูงสุด)
- ต้องแก้ไขเร่งด่วน

**v.9: 1 จุด** ⚠️
- ต้องแก้ไข

**คำแนะนำ:**
- ตรวจสอบและแก้ไข Security vulnerabilities ทันที
- ตรวจสอบ Security Hotspots ทั้งหมด 44 จุด
- ใช้ security best practices

#### 4. Reliability Issues

**v.9: 22 จุด** ❌ (สูงสุด)
**v.6: 19 จุด** ⚠️

**คำแนะนำ:**
- แก้ไข bugs โดยเฉพาะ v.9 และ v.6
- เพิ่ม error handling
- เพิ่ม input validation

#### 5. Maintainability Issues

**v.6: 26 จุด** ❌ (สูงสุด)
**v.8: 20 จุด** ⚠️

**คำแนะนำ:**
- Refactor code smells
- ปรับปรุง code structure
- ใช้ v.3 เป็น reference (Maintainability = 7)

---

### 6.2 Action Items

#### 🔴 เร่งด่วน (High Priority)

1. **แก้ไข Security vulnerabilities**
   - v.10: 5 จุด
   - v.9: 1 จุด

2. **Refactor Code Duplications**
   - v.4: 65.5% → <10%
   - v.10: 34.8% → <10%

#### 🟡 สำคัญ (Medium Priority)

1. **แก้ไข Reliability issues**
   - v.9: 22 จุด → <10
   - v.6: 19 จุด → <10

2. **ลด Maintainability issues**
   - v.6: 26 จุด → <15
   - v.8: 20 จุด → <15

3. **ตรวจสอบ Security Hotspots**
   - ทั้งหมด 44 จุด
   - โดยเฉพาะ v.6 (7 จุด) และ v.11 (6 จุด)

#### 🟢 ควรทำ (Low Priority)

1. **เพิ่ม Test Coverage**
   - เป้าหมาย: 70-80%
   - เริ่มจาก v.11, v.4, v.6

2. **ปรับปรุง Maintainability**
   - ทุกเวอร์ชัน
   - ใช้ v.3 เป็น reference

---

## 💡 7. Best Practices ที่เรียนรู้ได้

### 7.1 จาก v.11 (Best Version - SDD)

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

### 7.2 จาก v.4 (จุดเปลี่ยนสำคัญ - Basic Prompt)

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

### 7.3 จาก v.6 (Concurrency Safety - Context Engineering)

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
1. **Inventory Management** (v.3, v.6, v.9) - `scenarios_inventory.md`
2. **Shopping Cart** (v.4, v.7, v.10) - `scenarios_cart.md`
3. **Promotions & Discounts** (v.5, v.8, v.11) - `scenarios_promotions.md`

---

### 8.2 Inventory Management System (v.3, v.6, v.9)

#### Scenario: Stock Deduction (การตัดสต็อก)

**v.3 (Basic Prompt) - `inventoryController.js`**

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

**v.6 (Context Engineering) - `app.js`**

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

**การปรับปรุงจาก v.3:**
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

**v.9 (SDD) - `stockService.js`**

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

**การปรับปรุงจาก v.6:**
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

| Feature | v.3 (Basic Prompt) | v.6 (Context Engineering) | v.9 (SDD) |
|---------|-------------------|---------------------------|-----------|
| **Row Locking** | ✅ FOR UPDATE | ✅ FOR UPDATE | ✅ FOR UPDATE (via Repository) |
| **Transaction** | ✅ Manual | ✅ Manual | ✅ Helper (`withTransaction`) |
| **Low Stock Alert** | ❌ Outside transaction | ✅ Inside transaction | ✅ Inside transaction + Repository |
| **Error Handling** | ❌ Basic (console.error) | ⚠️ Better messages | ✅ Structured error codes |
| **Architecture** | ❌ Monolithic | ⚠️ Better structure | ✅ Repository + Service Pattern |
| **Logging** | ❌ console.log | ❌ console.log | ✅ Structured logging |
| **Code Organization** | ❌ All in controller | ❌ All in route handler | ✅ Separated (Repository, Service, Controller) |

**จุดที่น่าสนใจ:**
1. **v.3 → v.6:** Low stock alert ย้ายเข้า transaction (Atomic!) ⭐
2. **v.6 → v.9:** Architecture ดีขึ้นมาก (Repository Pattern) ⭐
3. **v.9:** มี structured error codes และ logging ⭐

---

### 8.3 Shopping Cart System (v.4, v.7, v.10)

#### Scenario: Add to Cart (เพิ่มสินค้าลงตะกร้า)

**v.4 (Basic Prompt) - `cartService.js`**

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

**v.7 (Context Engineering) - `server.js`**

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

**การปรับปรุงจาก v.4:**
- ✅ **Structured Error Responses** - `apiError()` function
- ✅ **Error Codes** - `BAD_REQUEST`, `NOT_FOUND`, `INSUFFICIENT_STOCK`
- ✅ **Helpful Error Details** - `maxAddQty` ใน error response
- ✅ **Status Management** - `status = 'ACTIVE'`
- ✅ **Better Comments** - "Inventory Guard" comment

**จุดที่ควรปรับปรุง:**
- ❌ ยังไม่มี Service Layer (โค้ดอยู่ใน route handler)
- ❌ ไม่มี Transaction Helper

---

**v.10 (SDD) - `cartService.js`**

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

**การปรับปรุงจาก v.7:**
- ✅ **Service Layer** - กลับมาใช้ service layer (เหมือน v.4)
- ✅ **Transaction Helper** - ใช้ `withTx()` (เหมือน v.4)
- ✅ **Extracted Functions** - `assertStockAvailable()` - DRY principle
- ✅ **Cleaner Code** - โค้ดสั้นและอ่านง่ายขึ้น

**จุดเด่น:**
- ✅ รวมจุดดีของ v.4 (Service Layer, Transaction Helper) กับ v.7 (Better error handling)
- ✅ โค้ดสะอาดและ maintainable

---

#### 📊 สรุปเปรียบเทียบ Shopping Cart

| Feature | v.4 (Basic Prompt) | v.7 (Context Engineering) | v.10 (SDD) |
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
1. **v.4 → v.7:** เพิ่ม structured error handling แต่เสีย Service Layer
2. **v.7 → v.10:** กลับมาใช้ Service Layer + Transaction Helper + Extracted Functions
3. **v.10:** รวมจุดดีของ v.4 และ v.7 ⭐

---

### 8.4 Promotions & Discounts System (v.5, v.8, v.11)

#### Scenario: Apply Coupon (ใช้คูปอง)

**v.5 (Basic Prompt) - `server.js`**

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

**v.8 (Context Engineering) - `applyCouponController.js`**

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

**การปรับปรุงจาก v.5:**
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

**v.11 (SDD) - `promotionService.js`**

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

**การปรับปรุงจาก v.8:**
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

| Feature | v.5 (Basic Prompt) | v.8 (Context Engineering) | v.11 (SDD) |
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
1. **v.5 → v.8:** เพิ่ม structured error codes และ better organization
2. **v.8 → v.11:** เพิ่ม Repository Pattern, Error Factory, Extracted Functions
3. **v.11:** Clean Architecture - โค้ดสะอาดและ maintainable มากที่สุด ⭐

---

### 8.5 สรุปการวิเคราะห์ Code Evolution

#### 8.5.1 จุดที่โค้ดดีขึ้นชัดเจน

**1. Architecture Evolution**

```
Monolithic/All-in-one (v.3, v.4, v.5)
    ↓
Better Structure (v.6, v.7, v.8)
    ↓
Clean Architecture (v.9, v.10, v.11) ✅
```

**ตัวอย่าง:**
- **v.3:** All in controller
- **v.6:** Better structure แต่ยังไม่มี service layer
- **v.9:** Repository + Service Pattern ✅

**2. Error Handling Evolution**

```
console.error / errors.push (v.3, v.5)
    ↓
Structured error codes (v.6, v.7, v.8)
    ↓
Error Factory Pattern (v.9, v.11) ✅
```

**ตัวอย่าง:**
- **v.3:** `console.error("purchase:", e)`
- **v.8:** `error: "COUPON_EXPIRED", message: "Coupon has expired"`
- **v.11:** `throw errorFactory.expired()` ✅

**3. Code Organization Evolution**

```
Long functions (all-in-one) (v.5)
    ↓
Better comments and steps (v.8)
    ↓
Extracted Functions (v.10, v.11) ✅
```

**ตัวอย่าง:**
- **v.5:** `buildQuote()` function ยาวมาก (all-in-one)
- **v.8:** แบ่งเป็น steps (1-7) แต่ยังอยู่ใน function เดียว
- **v.11:** `validateDateWindow()`, `validateMinimum()`, `validateUsage()` - Extracted Functions ✅

**4. Transaction & Atomicity**

```
Manual transaction + Alert outside (v.3) ❌
    ↓
Manual transaction + Alert inside (v.6) ✅
    ↓
Transaction Helper + Repository (v.9, v.11) ✅
```

**ตัวอย่าง:**
- **v.3:** Low stock alert อยู่นอก transaction ❌
- **v.6:** Low stock alert อยู่ใน transaction ✅
- **v.9:** Transaction Helper (`withTransaction`) + Repository Pattern ✅

**5. Data Access Layer**

```
Direct SQL queries (v.3, v.4, v.5)
    ↓
Better SQL organization (v.6, v.7, v.8)
    ↓
Repository Pattern (v.9, v.11) ✅
```

---

#### 8.5.2 จุดที่น่าสนใจเป็นพิเศษ

**🔍 Group 1: Inventory Management (v.3, v.6, v.9)**

1. **Low Stock Alert - Atomicity**
   - **v.3:** อยู่นอก transaction (ไม่ atomic) ❌
   - **v.6:** อยู่ใน transaction (atomic) ✅
   - **v.9:** อยู่ใน transaction + Repository Pattern ✅

2. **Error Handling**
   - **v.3:** `console.error()` ❌
   - **v.6:** Better error messages
   - **v.9:** Structured error codes (`sku_not_found`, `insufficient_stock`) ✅

3. **Architecture**
   - **v.3:** Monolithic
   - **v.6:** Better structure
   - **v.9:** Repository + Service Pattern (Clean Architecture) ✅

**สรุป:** v.9 ดีขึ้นชัดเจนในทุกด้าน - Architecture, Error Handling, Atomicity

---

**🔍 Group 2: Shopping Cart (v.4, v.7, v.10)**

1. **Service Layer**
   - **v.4:** มี Service Layer ✅
   - **v.7:** ไม่มี Service Layer (โค้ดอยู่ใน route handler) ❌
   - **v.10:** กลับมาใช้ Service Layer ✅

2. **Error Handling**
   - **v.4:** Basic error handling
   - **v.7:** Structured error codes (`BAD_REQUEST`, `INSUFFICIENT_STOCK`) + Helpful details ✅
   - **v.10:** Basic error handling แต่มี Zod validation

3. **Code Organization**
   - **v.4:** Service Layer แต่ยังไม่มี extracted functions
   - **v.7:** Better error handling แต่ไม่มี service layer
   - **v.10:** Service Layer + Extracted Functions (`assertStockAvailable()`) ✅

**สรุป:** v.10 รวมจุดดีของ v.4 (Service Layer) และ v.7 (Better error handling) + Extracted Functions

---

**🔍 Group 3: Promotions & Discounts (v.5, v.8, v.11)**

1. **Code Organization**
   - **v.5:** All-in-one function (`buildQuote()` ยาวมาก) ❌
   - **v.8:** แบ่งเป็น steps (1-7) แต่ยังอยู่ใน function เดียว
   - **v.11:** Extracted Functions (`validateDateWindow()`, `validateMinimum()`, `validateUsage()`) ✅

2. **Error Handling**
   - **v.5:** Error array (`errors.push()`) ❌
   - **v.8:** Structured error codes (`COUPON_EXPIRED`, `MIN_PURCHASE_NOT_MET`) ✅
   - **v.11:** Error Factory Pattern (`errorFactory.expired()`, `errorFactory.minSpend()`) ✅

3. **Architecture**
   - **v.5:** Monolithic (all-in-one)
   - **v.8:** Better structure แต่ยังไม่มี service layer
   - **v.11:** Repository + Service Pattern (Clean Architecture) ✅

4. **Event Logging**
   - **v.5:** ไม่มี
   - **v.8:** ไม่มี
   - **v.11:** `eventRepository.logEvent()` สำหรับ audit trail ✅

**สรุป:** v.11 ดีขึ้นชัดเจนในทุกด้าน - Architecture, Error Handling, Code Organization, Event Logging

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
- **v.9 (SDD):** Repository + Service Pattern, Structured error codes, Structured logging
- **v.10 (SDD):** Service Layer + Extracted Functions
- **v.11 (SDD):** Clean Architecture, Error Factory, Event Logging

**สรุป:** SDD ให้โค้ดที่สะอาด maintainable และมี architecture ที่ดีที่สุด

**2. Context Engineering ช่วยปรับปรุง Error Handling**

**หลักฐาน:**
- **v.6:** Better error messages, Atomic transactions
- **v.7:** Structured error codes (`BAD_REQUEST`, `INSUFFICIENT_STOCK`)
- **v.8:** Structured error codes (`COUPON_EXPIRED`, `MIN_PURCHASE_NOT_MET`)

**สรุป:** Context Engineering ช่วยให้ error handling ดีขึ้น แต่ยังไม่มี Clean Architecture

**3. Basic Prompt เริ่มต้นได้ดี แต่มีข้อจำกัด**

**หลักฐาน:**
- **v.3:** มี FOR UPDATE, Transaction แต่ Low stock alert อยู่นอก transaction
- **v.4:** มี Service Layer, Transaction Helper, Zod validation แต่ Code Duplications สูง (65.5%)
- **v.5:** มี coupon validation, order of operations แต่โค้ดยาวมาก (all-in-one)

**สรุป:** Basic Prompt เริ่มต้นได้ดี แต่มีข้อจำกัดในเรื่อง Code Organization และ Architecture

---

## 📊 9. สถิติที่น่าสนใจ

### 8.1 คุณภาพโค้ด

- **Average Quality Score:** 3.60⭐ (v.3-v.11)
- **Quality Improvement:** 2 stars (v.3: 3⭐ → v.11: 5⭐)
- **Best Version:** v.11 (5⭐) - SDD
- **Worst Version:** v.3 (3⭐) - Basic Prompt (เริ่มต้น)

### 8.2 Features

- **Average Features:** 5.2 features per version (v.3-v.11)
- **Most Features:** v.11 (10 features) - SDD
- **Least Features:** v.3 (3 features) - Basic Prompt

### 8.3 SonarQube Metrics

- **Best Security:** v.2, v.3, v.4, v.5, v.6, v.7, v.8, v.11 (0)
- **Worst Security:** v.10 (5)
- **Best Reliability:** v.5 (1)
- **Worst Reliability:** v.9 (22)
- **Best Maintainability:** v.3 (7)
- **Worst Maintainability:** v.6 (26)
- **Best Duplications:** v.8, v.11 (0.0%)
- **Worst Duplications:** v.4 (65.5%)

---

## 🎯 10. สรุปและข้อเสนอแนะ

### 10.1 สรุป

1. **คุณภาพโค้ดพัฒนาขึ้นอย่างต่อเนื่อง** - จาก v.3 (3⭐) ไปถึง v.11 (5⭐)
2. **v.11 เป็นเวอร์ชันที่ดีที่สุด** - สอดคล้องกันทั้ง 3 วิธีการวิเคราะห์ (SDD)
3. **v.4 เป็นจุดเปลี่ยนสำคัญ** - เพิ่ม Zod, ES Modules, Row Locking (Basic Prompt)
4. **SDD ให้ผลลัพธ์ดีที่สุด** - Average Quality 4.33⭐, Best Version (v.11: 5⭐)
5. **Context Engineering ลด Code Duplications ได้ดี** - v.8: 0.0% (ดีที่สุด)
6. **พบปัญหาสำคัญ:** Test Coverage = 0.0%, Code Duplications สูง (v.4: 65.5%), Security vulnerabilities (v.10: 5 จุด)

### 10.2 ข้อเสนอแนะ

#### สำหรับ AI-Assisted Development

1. **ใช้ SDD สำหรับโปรเจกต์ใหม่**
   - ให้ผลลัพธ์ดีที่สุด (Average Quality 4.33⭐)
   - v.11 เป็นตัวอย่างที่ดี (5⭐, Clean Architecture)
   - ควรมี specification ที่ละเอียดก่อนพัฒนา

2. **ใช้ Context Engineering เพื่อลด Code Duplications**
   - v.8 แสดงให้เห็นว่า Context Engineering ลด Duplications ได้ดี (0.0%)
   - ควรให้ context ที่ดีเกี่ยวกับ requirements และ best practices

3. **Basic Prompt ใช้ได้ แต่ต้องระวัง**
   - v.4 แสดงให้เห็นว่า Basic Prompt ให้ features ดี แต่ Code Duplications สูง (65.5%)
   - ควรมี code review และ refactoring หลังพัฒนา

#### สำหรับ Developer

#### สำหรับ Developer

1. **ใช้ v.11 เป็น reference** - Clean Architecture, Best Practices
2. **เรียนรู้จาก v.4** - ES Modules + Zod + Transactions
3. **ศึกษา v.6** - Concurrency Safety
4. **หลีกเลี่ยงปัญหาใน v.4, v.10** - Code Duplications สูง

#### สำหรับ Project Manager

1. **เลือก Development Method ตามความต้องการ**
   - **SDD:** สำหรับโปรเจกต์ที่ต้องการคุณภาพสูง (v.11: 5⭐)
   - **Context Engineering:** สำหรับลด Code Duplications (v.8: 0.0%)
   - **Basic Prompt:** สำหรับโปรเจกต์ที่ต้องการความเร็ว แต่ต้องมี code review

2. **ตั้งเป้า Test Coverage 70-80%** - ปัจจุบัน 0.0%
3. **แก้ไข Security vulnerabilities** - โดยเฉพาะ v.10 (5 จุด)
4. **Refactor Code Duplications** - โดยเฉพาะ v.4 (65.5%)
5. **ใช้ v.11 เป็น baseline** - สำหรับเวอร์ชันใหม่

1. **ตั้งเป้า Test Coverage 70-80%** - ปัจจุบัน 0.0%
2. **แก้ไข Security vulnerabilities** - โดยเฉพาะ v.10 (5 จุด)
3. **Refactor Code Duplications** - โดยเฉพาะ v.4 (65.5%)
4. **ใช้ v.11 เป็น baseline** - สำหรับเวอร์ชันใหม่

#### สำหรับ Technical Lead

1. **กำหนด Coding Standards** - ใช้ v.11 เป็น reference
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

1. **Basic Prompt (v.3-v.5):** ใช้ prompt พื้นฐานในการพัฒนา
2. **Context Engineering (v.6-v.8):** ใช้ context ที่ดีขึ้นในการพัฒนา
3. **SDD - Spec-Driven Development (v.9-v.11):** พัฒนาตาม specification ที่ละเอียด

### ข้อจำกัด

1. **Test Coverage:** ไม่มีข้อมูล Test Coverage (0.0%) - อาจไม่สะท้อนคุณภาพจริง
2. **Code Duplications:** v.4 และ v.10 มี Duplications สูง - อาจเป็นเพราะ copy-paste
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
