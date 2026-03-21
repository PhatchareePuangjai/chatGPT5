# Prompting Analysis: Basic Prompting vs Context Engineering vs Specification-Driven Development

> สรุปวิเคราะห์รูปแบบการสั่งงาน AI จาก prompt artifacts ที่มีอยู่ในโปรเจกต์
> เพื่อเปรียบเทียบระหว่าง **Basic Prompting (BP)**, **Context Engineering (CE)** และ **Specification-Driven Development (SDD)**

---

## Scope and Sources

เอกสารนี้วิเคราะห์ **ชุดเปรียบเทียบหลัก 9 เวอร์ชัน**:

- BP: `IMBP01`, `SCBP01`, `PDBP01`
- CE: `IMCE01`, `SCCE01`, `PDCE01`
- SDD: `IMSD01`, `SCSD01`, `PDSD01`

### Prompt Sources Used

| Strategy | Versions | Primary Source |
| ------- | -------- | -------------- |
| BP | IMBP01, SCBP01, PDBP01 | `chatgpt-export/.../conversations.json` |
| CE | IMCE01, SCCE01, PDCE01 | `chatgpt-export/.../conversations.json` |
| SDD | IMSD01, SCSD01, PDSD01 | `.specify/`, `speckit.specify`, `speckit.constitution`, scenarios files |

> หมายเหตุ: สำหรับ SDD “prompt” ไม่ได้อยู่ในรูปบทสนทนา 1 ก้อนเสมอไป แต่เป็นชุด specification artifacts ที่ทำหน้าที่เป็น prompt package แทน

---

## 1. Overview

| Version | Feature | Strategy | Prompt/Spec Form | Total Prompts / Artifacts | Conversations |
| ------- | ------- | -------- | ---------------- | -------------------------- | ------------- |
| IMBP01 | Inventory Management | Basic Prompt | Natural language requests | 5 prompts | 1 |
| SCBP01 | Shopping Cart | Basic Prompt | Natural language requests | 6 prompts | 2 |
| PDBP01 | Promotion / Discount | Basic Prompt | Natural language requests | 2 prompts | 1 |
| IMCE01 | Inventory Management | Context Engineering | Structured prompt with sections | 8 prompts | 1 |
| SCCE01 | Shopping Cart | Context Engineering | Structured prompt with sections | 3 prompts | 1 |
| PDCE01 | Promotion / Discount | Context Engineering | Single comprehensive structured prompt | 1 prompt | 1 |
| IMSD01 | Inventory Management | SDD | Scenario + constitution + plan/spec workflow | specification-driven | N/A |
| SCSD01 | Shopping Cart | SDD | `speckit.specify` + constitution-style constraints | specification-driven | N/A |
| PDSD01 | Promotion / Discount | SDD | `speckit.specify` requirements package | specification-driven | N/A |

---

## 2. Basic Prompting (BP) — รูปแบบการ Prompt

### IMBP01 — Inventory Management

ลักษณะสำคัญจาก `chatgpt-export`:

- เริ่มจากคำสั่งแบบกว้าง เช่น “write code for Inventory Management System”
- ระบุ feature หลัก แต่ยังไม่ลง acceptance criteria แบบละเอียด
- follow-up ส่วนใหญ่เป็น setup help, packaging, และ debug

Pattern ที่พบ:

- **Feature Request**
- **Repeat Request + Setup Help**
- **Packaging Request**
- **Debug / Fix Error**

### SCBP01 — Shopping Cart

ลักษณะสำคัญ:

- มีการเริ่มจาก scenarios ก่อนหนึ่งครั้ง แล้วจึงขอให้สร้างระบบจริง
- มี prompt เชิง implementation และ debug หลายรอบ
- ผู้ใช้ส่ง error message ตรงๆ กลับเข้าไปในระบบ

Pattern ที่พบ:

- **Documentation Request**
- **Feature Request**
- **Setup Simplification**
- **Debug — Incomplete Start / Docker Errors / DB Error**

### PDBP01 — Promotion / Discount

ลักษณะสำคัญ:

- ขอระบบจาก feature list ตรงๆ
- refinement รอบถัดไปเน้น UI fix มากกว่าการย้ำ business rules

Pattern ที่พบ:

- **Feature Request**
- **UI Fix Request**

### BP Summary

คำที่พบซ้ำบ่อย:

- "I need you to write code for..."
- "give me all the code"
- "I don't know how to..."
- "it's not working"
- "fix all the code"
- copy-paste error messages as prompt input

BP จึงมีลักษณะเด่นคือ **implementation-first, debug-later** และมักเกิด iteration จากปัญหาหลังรันจริง

---

## 3. Context Engineering (CE) — รูปแบบการ Prompt

### IMCE01 — Inventory Management

Prompt แรกของ IMCE01 มีโครงสร้างชัดเจนมาก และประกอบด้วย:

- **Role assignment**: expert full-stack developer / system architect
- **Technical specification**: React, Node.js, PostgreSQL พร้อม version
- **Business scenarios**: stock deduction, low stock alert, stock restoration
- **Constraints**: race condition, transaction atomicity, overselling prevention
- **Deliverables**: SQL + API + UI + Docker
- **Self-refinement task**: ตรวจเงื่อนไข low-stock `<= 5`

follow-up prompts ของ IMCE01 ส่วนใหญ่เป็น:

- packaging
- environment/Docker refinement
- UI refinement

### SCCE01 — Shopping Cart

ลักษณะสำคัญ:

- ใช้ role prompt ลักษณะ “Lead Software Architect”
- ระบุ core business logic และ critical constraints ตั้งแต่ต้น
- มี prompt ตามหลังเพียงเพื่อ packaging และ setup help

### PDCE01 — Promotion / Discount

PDCE01 เป็นตัวอย่าง CE ที่ชัดมาก เพราะใช้ **single comprehensive prompt** ซึ่งรวม:

- objective & role
- technical specification
- business logic & knowledge base
- mathematical constraints
- output requirements
- self-refinement task

### CE Summary

คำและองค์ประกอบที่พบซ้ำ:

- `[Instruction & Role]` / `[Objective & Role]`
- `[Technical Specification]`
- `[Business Scenarios / Business Logic]`
- `[Constraints]`
- `[Deliverables / Output Requirements]`
- `[Self-Refinement Task]` / `[Self-Verification Step]`

CE จึงมีลักษณะเด่นคือ **front-loaded context transfer** และ **proactive constraint injection**

---

## 4. Specification-Driven Development (SDD) — รูปแบบของ Prompt Package

SDD ในโปรเจกต์นี้ไม่ได้ขับด้วย prompt สนทนาเป็นหลัก แต่ใช้เอกสาร requirement เป็นชุดคำสั่งเชิงระบบแทน

### IMSD01 — Inventory Management

จาก `.specify/` และ related templates:

- ใช้ constitution/charter เพื่อกำหนด quality gates
- ใช้ plan/spec workflow ก่อนลงมือ implement
- ยึด scenario documents เป็นฐานของ acceptance behavior

ลักษณะเด่น:

- **governance-first**
- **test-and-quality expectations ถูกกำหนดก่อนเขียนโค้ด**
- **implementation เกิดตามแผน ไม่ใช่ตามบทสนทนาแบบ ad hoc**

### SCSD01 — Shopping Cart

จาก `speckit.specify` และ `speckit.constitution`:

- แยก `Context`, `Data & State`, `Functional Requirements`, `Non-Functional Requirements`, `Test Coverage Expectations`, `Traceability`
- functional requirements ถูกแมปกลับไปยัง scenario IDs โดยตรง

Pattern ที่พบ:

- **Formal Specification**
- **Acceptance Traceability**
- **Explicit Non-Functional Requirements**
- **Test-first expectation**

### PDSD01 — Promotion / Discount

จาก `speckit.specify`:

- ระบุ data model, business rules, order of operations, negative-total guard
- มี acceptance traceability ชัดเจน เช่น `Scenario 8.1 -> FR1`
- บอก observability, localization, performance, reliability ตั้งแต่ก่อนเขียนโค้ด

### SDD Summary

องค์ประกอบหลักของ SDD prompt package:

- Constitution / quality charter
- Structured specification
- Explicit FR/NFR sections
- Acceptance traceability
- Test coverage expectations
- Performance and observability requirements

SDD จึงมีลักษณะเด่นคือ **prompt ถูกแทนด้วย requirements system** มากกว่าการสั่งงานแบบประโยคเดียว

---

## 5. Comparative Analysis — เปรียบเทียบ Keywords, Structure, and Flow

### 5.1 Prompt / Spec Structure

| Aspect | Basic Prompting (BP) | Context Engineering (CE) | SDD |
| ----- | -------------------- | ------------------------ | --- |
| Initial input form | natural language request | structured prompt with sections | multi-file specification package |
| Role assignment | usually absent | explicit | implicit via charter / spec workflow |
| Constraint detail | low | high | very high |
| Acceptance criteria | mostly implicit | partially explicit | explicit and traceable |
| Self-check | absent | explicit self-refinement | embedded in quality gates and test expectations |
| Non-functional requirements | rarely stated | sometimes stated | explicitly formalized |

### 5.2 Conversation / Workflow Pattern

| Aspect | BP | CE | SDD |
| ----- | -- | -- | --- |
| Typical sequence | Request -> Debug -> Fix -> Debug | Structured prompt -> Package -> Refine | Scenario -> Spec -> Plan -> Implement |
| Debug prompts in source artifacts | frequent | low or absent | not represented as chat-centered flow |
| Packaging requests | common | common | secondary to spec completeness |
| Primary control mechanism | user follow-up | prompt structure | documentation and traceability |

### 5.3 Knowledge Transfer Style

| Dimension | BP | CE | SDD |
| --------- | -- | -- | --- |
| How domain knowledge is delivered | incremental | concentrated in first prompt | externalized into artifacts |
| How edge cases are introduced | after failures or briefly up front | up front in constraints | encoded as formal requirements |
| How QA is expressed | reactive | self-check instructions | mandatory tests / quality gates |

---

## 6. Prompting Characteristics Matrix

| Characteristic | IMBP01 | SCBP01 | PDBP01 | IMCE01 | SCCE01 | PDCE01 | IMSD01 | SCSD01 | PDSD01 |
| -------------- | ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| Role Assignment | - | - | - | Yes | Yes | Yes | Indirect | Indirect | Indirect |
| Structured Sections | - | - | - | Yes | Yes | Yes | Yes | Yes | Yes |
| Tech Stack Versioning | - | - | - | Yes | Yes | Yes | Partial | Partial | Partial |
| Business Scenarios | Vague | Moderate | Vague | Detailed | Detailed | Detailed | Detailed | Detailed | Detailed |
| Edge Case Specification | - | Partial | - | Yes | Yes | Yes | Yes | Yes | Yes |
| Concurrency / Safety Constraints | - | Partial | - | Yes | Yes | Yes | Yes | Yes | Yes |
| Mathematical Precision Rules | - | Partial | Partial | Partial | Yes | Yes | Partial | Yes | Yes |
| Self-Refinement / Verification | - | - | - | Yes | Yes | Yes | Yes | Yes | Yes |
| DevOps Requirements | Partial | Partial | Partial | Yes | Yes | Yes | Partial | Partial | Partial |
| Acceptance Traceability | - | - | - | - | - | - | Yes | Yes | Yes |
| Test Coverage Expectations in Input | - | - | - | - | - | - | Yes | Yes | Yes |

---

## 7. Key Differences Summary

| Dimension | BP | CE | SDD |
| --------- | -- | -- | --- |
| Prompt design | ad hoc | pre-structured | specification-driven |
| Knowledge transfer | conversational | dense and explicit | externalized into documents |
| Error handling strategy | reactive | preventive | governed by requirements |
| Edge-case handling | often discovered during execution | anticipated in prompt | formalized before implementation |
| Quality assurance mechanism | minimal | self-refinement | quality gates + traceability |
| Expected implementation stability | lower | medium-high | highest in theory, but depends on spec quality |

---

## 8. Research Interpretation Notes

- ถ้าจะเชื่อมเอกสารนี้กับ `METHODOLOGY.md` และ `RESEARCH_SUMMARY.md` ควรใช้เอกสารนี้เป็นหลักฐานของ **independent variable** ว่าแต่ละ strategy ต่างกันอย่างไรในระดับ input design
- สำหรับ BP/CE เราวิเคราะห์จากบทสนทนาจริงใน `chatgpt-export`
- สำหรับ SDD เราวิเคราะห์จาก specification artifacts แทน conversational prompts
- ดังนั้นคำว่า “prompting” ในงานนี้ควรถูกตีความกว้างเป็น **instruction design / requirement packaging**, ไม่ใช่เฉพาะข้อความ prompt 1 บรรทัด

---

> Generated from `chatgpt-export`, `prompt.txt`, scenarios files, and specification artifacts for research-paper traceability
