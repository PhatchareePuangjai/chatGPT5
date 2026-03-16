# Prompting Analysis: Basic Prompting vs Context Engineering

> สรุปวิเคราะห์รูปแบบการ Prompt AI จาก ChatGPT Export Log ของแต่ละ Version
> เปรียบเทียบระหว่าง **Basic Prompting (BP)** และ **Context Engineering (CE)**

---

## Overview

| Version | Feature              | Strategy            | Total Prompts | Conversations |
| ------- | -------------------- | ------------------- | ------------- | ------------- |
| IMBP01  | Inventory Management | Basic Prompt        | 5             | 1             |
| IMCE01  | Inventory Management | Context Engineering | 8             | 1             |
| PDBP01  | Promotion / Discount | Basic Prompt        | 2             | 1             |
| PDCE01  | Promotion / Discount | Context Engineering | 1             | 1             |
| SCBP01  | Shopping Cart        | Basic Prompt        | 6             | 2             |
| SCCE01  | Shopping Cart        | Context Engineering | 3             | 1             |

---

## 1. Basic Prompting (BP) — รูปแบบการ Prompt

### IMBP01 — Inventory Management (5 prompts)

| #   | Prompt Summary                                                                                                                                                                                                         | Pattern                         |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| 1   | "I am building an e-commerce website. I need you to write code for the Inventory Management System..." — ระบุ requirement แบบกว้างๆ (backend Node.js, frontend React, stock deduction, low stock alert, stock history) | **Feature Request**             |
| 2   | "I want to build an online shop system for my inventory. Can you give me all the code..." — ขอ code ทั้งหมด + database setup + README เพราะ "I don't know how to code"                                                 | **Repeat Request + Setup Help** |
| 3   | "I don't know how to copy all these code blocks into many files. It's too confusing. Can you put everything together into one link for me to download?"                                                                | **Packaging Request** (ขอ zip)  |
| 4   | "I tried to run the code you gave me, but it's not working. I see a red box that says 'productId must be a positive integer'..."                                                                                       | **Debug / Fix Error**           |
| 5   | (ซ้ำกับ #4 — ส่งซ้ำ)                                                                                                                                                                                                   | **Duplicate**                   |

**Keywords:** "I need you to write code", "give me all the code", "I don't know how to code", "fix all the code", "ready to use"

### PDBP01 — Promotion / Discount (2 prompts)

| #   | Prompt Summary                                                                                                                                                                         | Pattern             |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| 1   | "I am making an online shop and I need code for a Promotion and Discount system..." — ระบุ features: coupon codes (SAVE100, min 500 THB), automatic 10% discount, README, Docker setup | **Feature Request** |
| 2   | "I have the code, but the UI is messy and the text overlaps..." — ขอแก้ UI: fix overlapping, clear totals, mobile friendly                                                             | **UI Fix Request**  |

**Keywords:** "I need code for", "give me the code", "UI is messy", "fix overlapping", "mobile friendly"

### SCBP01 — Shopping Cart (6 prompts, 2 conversations)

| #   | Prompt Summary                                                                                                                                                                                | Pattern                      |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| 1   | (Thai) เขียน scenarios.md สำหรับ Shopping Cart — ขอ acceptance scenarios format                                                                                                               | **Documentation Request**    |
| 2   | "I am building an online shop and I need code for a Shopping Cart system..." — ขอ code ทั้ง React + Node.js, 5 features (add/merge, update qty, save for later, stock check, decimal pricing) | **Feature Request**          |
| 3   | "don't know how to install or run many things. you can push all to one command."                                                                                                              | **Setup Simplification**     |
| 4   | "it start only Postgres DB"                                                                                                                                                                   | **Debug — Incomplete Start** |
| 5   | Reports migration failed (ENOENT), vite not found, backend/frontend exited                                                                                                                    | **Debug — Docker Errors**    |
| 6   | Reports PostgreSQL cannot truncate `carts` due to foreign key constraint                                                                                                                      | **Debug — DB Error**         |

**Keywords:** "I need code for", "don't know how to install", "push all to one command", error messages copy-paste

---

## 2. Context Engineering (CE) — รูปแบบการ Prompt

### IMCE01 — Inventory Management (8 prompts)

| #   | Prompt Summary                                                                                                                                                                                                                                                                                                                  | Pattern                         |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| 1   | **[Instruction & Role]** Act as expert Full-stack Developer and System Architect — ระบุ Role, Tech Spec (React, Node.js, PostgreSQL), Business Scenarios (Stock Deduction, Low Stock Alert, Stock Restoration), Constraints (Race Condition, Transaction Atomicity, Overselling Prevention), Deliverables, Self-Refinement Task | **Structured System Prompt**    |
| 2   | "Please bundle all the generated code into a single block using a clear file structure... Also, include a Dockerfile and docker-compose.yml"                                                                                                                                                                                    | **Packaging + DevOps**          |
| 3   | "zip all code to me."                                                                                                                                                                                                                                                                                                           | **Packaging Request**           |
| 4   | "Before you bundle everything, please ensure the following Context Optimizations: (1) Environment Separation (.env), (2) Docker Orchestration (healthcheck), (3) Validation Log (README)"                                                                                                                                       | **Refinement with Constraints** |
| 5   | "update this in code and zip to again."                                                                                                                                                                                                                                                                                         | **Iteration Request**           |
| 6   | **[Goal]** Update UI — ระบุ Design Context (Tailwind CSS, Color Logic: Red/Green/Blue), Consistency Indicators (Sync Status, Transaction ID)                                                                                                                                                                                    | **Structured UI Prompt**        |
| 7   | "zip to me."                                                                                                                                                                                                                                                                                                                    | **Packaging Request**           |
| 8   | "Improve the user interface for easier use."                                                                                                                                                                                                                                                                                    | **General Improvement**         |

**Keywords:** "[Instruction & Role]", "[Technical Specification]", "[Business Scenarios]", "[Constraints]", "[Deliverables]", "[Self-Refinement Task]", "Context Optimizations"

### PDCE01 — Promotion / Discount (1 prompt)

| #   | Prompt Summary                                                                                                                                                                                                                                                                                                                     | Pattern                         |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| 1   | **[Objective & Role]** Act as Senior Backend Architect and Logic Specialist — ระบุ Tech Spec, Business Logic (Coupon Validation, Discount Calculation, Usage Limit), Mathematical Constraints (Calculation Order, Negative Total Protection, Precision Guard), Output Requirements (SQL + API + UI + DevOps), Self-Refinement Task | **Single Comprehensive Prompt** |

**Keywords:** "[Objective & Role]", "[Technical Specification]", "[Business Logic & Knowledge Base]", "[Mathematical Constraints & State]", "[Output Requirements]", "[Self-Refinement Task]"

### SCCE01 — Shopping Cart (3 prompts)

| #   | Prompt Summary                                                                                                                                                                                                                                                                               | Pattern                      |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| 1   | **Objective & Role:** Act as Lead Software Architect — ระบุ Tech Stack, Core Business Logic (Reactive Quantity Management, Item Merging, Save for Later), Critical Constraints (Inventory Guard, Financial Precision), Output Deliverables (SQL + API + UI + DevOps), Self-Verification Step | **Structured System Prompt** |
| 2   | "zip all to me."                                                                                                                                                                                                                                                                             | **Packaging Request**        |
| 3   | "how to start this project"                                                                                                                                                                                                                                                                  | **Setup Help**               |

**Keywords:** "Objective & Role", "Technical Stack Implementation", "Core Business Logic", "Critical Constraints", "Output Deliverables", "Self-Verification Step"

---

## 3. Comparative Analysis — เปรียบเทียบ Keywords & Patterns

### 3.1 Prompt Structure

| Aspect              | Basic Prompting (BP)                              | Context Engineering (CE)                                                                                           |
| ------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Initial Prompt**  | คำอธิบายแบบ natural language, ระบุ feature กว้างๆ | มี section headers ชัดเจน เช่น [Role], [Tech Spec], [Business Logic], [Constraints], [Deliverables]                |
| **Role Assignment** | ไม่มี — ถาม AI ตรงๆ                               | กำหนด Role ชัดเจน เช่น "Act as expert Full-stack Developer", "Senior Backend Architect", "Lead Software Architect" |
| **Specificity**     | กว้าง — "write code for Inventory Management"     | เจาะจง — ระบุ version numbers, edge cases, mathematical constraints                                                |
| **Constraints**     | ไม่มี หรือน้อยมาก                                 | ระบุชัดเจน: Race Condition, Transaction Atomicity, Negative Total Protection, Precision Guard                      |
| **Self-Check**      | ไม่มี                                             | มี [Self-Refinement Task] / [Self-Verification Step] ทุก version                                                   |

### 3.2 Conversation Flow

| Aspect                  | Basic Prompting (BP)                    | Context Engineering (CE)                                                |
| ----------------------- | --------------------------------------- | ----------------------------------------------------------------------- |
| **จำนวน Prompt เฉลี่ย** | 4.3 prompts                             | 4.0 prompts                                                             |
| **Debug / Fix prompts** | 2-4 ครั้ง (IMBP01: 2, SCBP01: 3)        | 0 ครั้ง (ไม่พบ debug prompts)                                           |
| **Iteration Pattern**   | Request → Debug → Fix → Debug           | Structured Prompt → Package → Refine → Package                          |
| **ภาษาที่ใช้**          | ภาษาพูดง่ายๆ "I don't know how to code" | ภาษาเทคนิคเฉพาะทาง "Transaction Atomicity", "Race Condition Management" |

### 3.3 Common Keywords by Strategy

#### Basic Prompting — Recurring Phrases

- "I need you to write code for..."
- "Can you give me all the code..."
- "I don't know how to..."
- "it's not working" / "fix all the code"
- "ready to use" / "easy to read"
- Copy-paste error messages เป็น prompt

#### Context Engineering — Recurring Phrases

- "[Instruction & Role] Act as..."
- "[Technical Specification]" พร้อม version numbers
- "[Business Scenarios / Logic]" พร้อม acceptance criteria
- "[Constraints]" — Race Condition, Atomicity, Precision
- "[Deliverables / Output Requirements]"
- "[Self-Refinement Task]" / "[Self-Verification Step]"
- "Context Optimizations"

### 3.4 Key Differences Summary

| Dimension                      | BP                                | CE                                                                 |
| ------------------------------ | --------------------------------- | ------------------------------------------------------------------ |
| **Prompt Design**              | Ad-hoc, conversational            | Pre-structured, systematic                                         |
| **Knowledge Transfer**         | ผู้ใช้บอก AI ทีละขั้น             | ผู้ใช้ส่ง "knowledge base" ทั้งหมดใน prompt แรก                    |
| **Error Handling**             | เกิด error แล้วค่อยแก้ (reactive) | ป้องกัน error ใน prompt (proactive)                                |
| **Edge Cases**                 | ไม่ได้ระบุ — พบปัญหาตอน run       | ระบุ edge cases ใน prompt เช่น concurrent requests, floating-point |
| **Quality Assurance**          | ไม่มี                             | มี Self-Refinement/Verification ทุก prompt                         |
| **Iterations to Working Code** | ต้อง debug หลายรอบ                | ส่วนใหญ่ได้ code ที่ใช้งานได้ตั้งแต่ prompt แรก                    |

---

## 4. ตารางสรุปสำหรับงานวิจัย

### Prompting Characteristics Matrix

| Characteristic                 | IMBP01 | PDBP01 | SCBP01   | IMCE01   | PDCE01   | SCCE01   |
| ------------------------------ | ------ | ------ | -------- | -------- | -------- | -------- |
| Role Assignment                | -      | -      | -        | Yes      | Yes      | Yes      |
| Structured Sections            | -      | -      | -        | Yes      | Yes      | Yes      |
| Tech Stack Versioning          | -      | -      | -        | Yes      | Yes      | Yes      |
| Business Scenarios             | Vague  | Vague  | Moderate | Detailed | Detailed | Detailed |
| Edge Case Specification        | -      | -      | -        | Yes      | Yes      | Yes      |
| Concurrency/Safety Constraints | -      | -      | -        | Yes      | Yes      | Yes      |
| Mathematical Precision         | -      | -      | -        | Yes      | Yes      | Yes      |
| Self-Refinement Instruction    | -      | -      | -        | Yes      | Yes      | Yes      |
| DevOps Requirements in Prompt  | -      | -      | -        | Yes      | Yes      | Yes      |
| Debug Iterations Needed        | 2      | 0      | 3        | 0        | 0        | 0        |
| Total Prompts                  | 5      | 2      | 6        | 8        | 1        | 3        |

---

> Generated from ChatGPT export logs analysis — for research paper reference
