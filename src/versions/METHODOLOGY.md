# Research Methodology

## Overview

This study adopts a controlled experimental design to evaluate the quality of AI-generated code produced under different human-AI interaction strategies, using an e-commerce system as the experimental testbed. A multi-method assessment framework is employed, combining prompt and specification analysis, functional correctness testing, static code analysis, and security scanning. The objective is not merely to determine whether generated systems execute correctly, but to investigate how different interaction strategies influence correctness, security, maintainability, and architectural quality of the resulting implementations.

## 1. Research Design

### 1.1 Study Objective

The study investigates whether increasing the degree of structure in human-AI collaboration is associated with higher-quality implementation outcomes. In this context, "quality" is operationalized as a multi-dimensional construct comprising:

- functional correctness
- security posture
- reliability and maintainability
- code organization and duplication
- architectural discipline and engineering practices

### 1.2 Comparative Design

A cross-case comparative design is applied across three business domains and three development strategies. Each generated project version constitutes one case. Comparisons are conducted at two levels:

- **within-domain comparison:** evaluating BP, CE, and SDD implementations for the same business domain
- **cross-strategy comparison:** examining overall trends across all versions belonging to the same strategy

This design enables interpretation of strategy effects while acknowledging task-specific variation.

## 2. Dataset and Unit of Analysis

### 2.1 Core Comparative Dataset

The primary dataset consists of **9 generated versions** organized as a 3 × 3 matrix of domains and strategies.

| Domain               | Basic Prompting | Context Engineering | Specification-Driven Development |
| -------------------- | --------------- | ------------------- | -------------------------------- |
| Inventory Management | IMBP01          | IMCE01              | IMSD01                           |
| Shopping Cart        | SCBP01          | SCCE01              | SCSD01                           |
| Promotion / Discount | PDBP01          | PDCE01              | PDSD01                           |

All twelve code versions were generated using ChatGPT 5.2 as the underlying model. Each version is evaluated against an identical set of Acceptance Scenarios and Edge Cases across all versions, as summarized in the table above. These 9 versions form the basis of the main comparative findings reported in RESEARCH_SUMMARY.md.

### 2.2 Supplementary Repository Artifacts

The repository also contains additional versions — `IMAG01`, `IMCS01`, `PDAG01`, `PDCS01`, `SCAG01`, and `SCCS01` — produced using Agentic (AG) and Cursor (CS) workflows. These artifacts serve as supporting references but are excluded from the main 9-version comparison unless explicitly stated.

### 2.3 Unit of Analysis

The unit of analysis is **one generated project version**. Each version is evaluated as a standalone full-stack implementation containing business logic, API endpoints, and in most cases a frontend and deployment configuration.

## 3. Independent Variable: Development Strategy

The primary independent variable is the style of human-AI collaboration employed to produce each system. Three levels of interaction complexity are compared, each representing a progressively more structured approach to communicating requirements to the AI.

### 3.1 Basic Prompting (BP)

Basic Prompting refers to direct, conversational natural-language requests with limited formal structure. Prompts typically describe desired features at a high level, while detailed constraints, validation rules, and architectural decisions emerge only through subsequent debugging or follow-up turns.

**Illustrative excerpt (IMBP01):**

> _"I am building an e-commerce website. I need you to write code for the Inventory Management System. Requirements: Backend (Node.js): Create an API to handle stock updates. When a user buys an item, deduct the stock. If stock is low (less than 5), print a log message. Also, keep a history of stock changes. Frontend (React): Create a simple dashboard page to view current stock levels and a list of low-stock items. Please provide the code for both the backend controller and the frontend component."_

**Illustrative excerpt (SCBP01):**

> _"I am building an online shop and I need code for a Shopping Cart system. Can you give me all the code for both the display page (React) and the backend (Node.js)? [...] I don't know how to code or how to manage many files, so please provide the full code and tell me how to set up the database. If possible, put everything together so I can just download and run it on my Mac."_

As illustrated above, BP prompts tend to be informal and conversational in tone, specify technology choices only at a general level (e.g., "Node.js", "React"), and leave architectural decisions, concurrency handling, and edge-case coverage unaddressed.

### 3.2 Context Engineering (CE)

Context Engineering refers to structured prompting that front-loads relevant context before implementation begins. These prompts typically include explicit role assignment, pinned technology versions, domain constraints, acceptance criteria, concurrency requirements, and self-check instructions — all provided within the initial request.

**Illustrative excerpt (IMCE01):**

> _"[Instruction & Role] Act as an expert Full-stack Developer and System Architect. Your mission is to implement a high-reliability Inventory Management System where data consistency and concurrency control are the top priorities._
>
> _[Technical Specification] Frontend: React (^18.3.1) with Vite (^5.4.8). Backend: Node.js (CommonJS) with Express (^4.19.2). Database: PostgreSQL using the pg driver (^8.12.0)._
>
> _[Constraints & Concurrency Control] Race Condition Management: Use Database-level locking (e.g., SELECT ... FOR UPDATE or Transactions) to ensure that if 5 concurrent requests buy the last remaining item, only one succeeds, and stock never drops below zero. Transaction Atomicity: Ensure an 'All or Nothing' approach. If the logging process fails, the stock deduction must rollback automatically."_

**Illustrative excerpt (PDCE01):**

> _"[Objective & Role] Act as a Senior Backend Architect and Logic Specialist. Your mission is to implement a high-precision Promotions and Discounts System. You must prioritize the Order of Operations and Business Rule Integrity to ensure financial accuracy and prevent revenue leakage._
>
> _[Mathematical Constraints & State] Calculation Order (Crucial): If multiple discounts apply, you must follow the correct business sequence: (Original Total − Percentage Discount) − Fixed Amount Discount. Do not miscalculate the order. Negative Total Protection: The Grand Total must NEVER fall below zero."_

Compared with BP, CE prompts are notably longer (280–341 words versus 85–266 words for BP), adopt a formal tone with bracketed section headers, assign an explicit professional role to the model, pin dependency versions, and specify edge cases using precise technical terminology such as "SELECT ... FOR UPDATE" and "Transaction Atomicity."

### 3.3 Specification-Driven Development (SDD)

Specification-Driven Development refers to workflows in which implementation is guided by formalized, multi-document specification packages rather than conversational prompts. Requirements are externalized into structured artifacts — constitutions, specifications, plans, task breakdowns, and scenario definitions — that collectively define the system's behavior, quality gates, and acceptance criteria.

**Illustrative excerpt — Constitution (SCSD01 `speckit.constitution`):**

> _"Code Quality: modularity, lint rules, code review gates, static analysis in CI. Testing Standards: >85% branch coverage target, deterministic tests, smoke/regression/performance suites. User Experience Consistency: design system adherence, WCAG 2.1 AA, i18n layer, usability metrics. Performance Requirements: p95 latency <300 ms, page interactive <2 s on 3G, lazy loading, profiling, automated perf tests."_

**Illustrative excerpt — Specification (PDSD01 `speckit.specify`):**

> _"Context: Promotions & Discounts engine. Functional Requirements (FR1–FR6): coupon validation, percentage discounts, expiration enforcement, usage limits, discount ordering, and negative-total protection. Data & State: coupon schema, usage records, audit events. Non-Functional Requirements: 100 ms median / 200 ms p95 latency budget, idempotency requirement for promotion writes. Acceptance Criteria Traceability: scenario-to-FR mapping table."_

Unlike BP and CE, the SDD approach does not rely on a single conversational prompt. Instead, it distributes requirements across multiple purpose-specific documents — each governing a different aspect of the system (governance principles, behavioral specifications, implementation plans, and task decomposition). This separation enables explicit traceability between requirements and implementation.

### 3.4 Summary of Strategy Characteristics

| Characteristic        | Basic Prompting (BP)         | Context Engineering (CE)                             | Specification-Driven Development (SDD)                          |
| --------------------- | ---------------------------- | ---------------------------------------------------- | --------------------------------------------------------------- |
| Tone                  | Informal, conversational     | Formal, structured sections                          | Declarative, policy-oriented                                    |
| Prompt length         | 85–266 words                 | 280–341 words                                        | Multi-document package                                          |
| Role assignment       | None                         | Explicit (e.g., "Act as a Senior Architect")         | Implicit via document structure                                 |
| Tech specifications   | General ("Node.js", "React") | Pinned versions (e.g., React ^18.3.1)                | Defined in specification context                                |
| Edge-case handling    | Ad hoc, via follow-up turns  | Pre-specified with technical terminology             | Formalized as numbered FRs with traceability                    |
| Architecture guidance | Unspecified                  | Partially specified (e.g., Docker, locking strategy) | Governed by constitution and quality gates                      |
| Quality gates         | None                         | Self-check instructions                              | Explicit gates (coverage targets, performance SLOs, lint rules) |

**Per-version quantitative metrics:**

| Version | Strategy | LOC (prod. src) | User Prompt Tokens ⁵ |
| ------- | -------- | --------------- | -------------------- |
| IMBP01  | BP       | 282             | 341                  |
| SCBP01  | BP       | 454             | 836                  |
| PDBP01  | BP       | 365             | 618                  |
| IMCE01  | CE       | 256             | 927                  |
| SCCE01  | CE       | 459             | 463                  |
| PDCE01  | CE       | 344             | 531                  |
| IMSD01  | SDD      | 398             | 296                  |
| SCSD01  | SDD      | 758             | 353                  |
| PDSD01  | SDD      | 296             | 170                  |

> ⁵ Counted using tiktoken `cl100k_base` encoding (GPT-4/GPT-5 tokenizer) applied to all user-side prompt text. BP/CE source: `chatgpt-export/conversations.json`. SDD source: `conversation_export.json` — reflects spec commands only (e.g., `speckit-plan`, `speckit.implement`); actual token consumption is significantly higher as AI-generated code responses are not captured in the export.

## 4. Controlled Task Domains

To reduce domain-related randomness while preserving realistic engineering complexity, the study employs three related e-commerce modules as the experimental testbed:

- **Inventory Management (IM):** stock deduction, low-stock alerts, stock restoration, and audit logging
- **Shopping Cart (SC):** item merging, quantity management, save-for-later, and price calculation
- **Promotion and Discount (PD):** coupon validation, discount calculation, usage limits, and ordering rules

These domains were selected because they require comparable forms of software reasoning, including:

- stateful CRUD behavior
- transaction integrity
- concurrency control
- monetary precision
- rule-based validation
- user-facing error handling

Employing related domains ensures that the application family remains comparable while preventing the benchmark from collapsing into a single repeated task.

## 5. Prompt and Specification Data Collection

### 5.1 Prompt Sources for BP and CE

For Basic Prompting and Context Engineering versions, the study uses conversation artifacts exported from ChatGPT, stored as `chatgpt-export/.../conversations.json` within each version directory. These exports preserve:

- initial generation requests
- follow-up clarification and refinement turns
- packaging and setup requests
- debugging and fix prompts

### 5.2 Specification Sources for SDD

For SDD versions, the prompt equivalent is a structured specification package rather than a single conversational thread. The three SDD versions employ two different specification structures:

**IMSD01** uses a `.specify/` directory containing:

- `scripts/bash/` — setup and automation scripts (`setup-plan.sh`, `check-prerequisites.sh`, etc.)
- `templates/` — structured templates for specs, plans, tasks, and checklists
- `memory/constitution.md` — project constitution

**SCSD01 and PDSD01** use `speckit.*` flat files:

- `speckit.specify` — formal requirements specification
- `speckit.constitution` — project constitution (SCSD01 only)
- `speckit.plan` — implementation plan
- `speckit.tasks` — task breakdown
- `speckit.implement` — implementation guidance

All SDD versions also include scenario definition files (`scenarios_inventory.md`, `scenarios_cart.md`, `scenarios_promotions.md`).

> **Note:** The structural difference between IMSD01 (directory-based) and SCSD01/PDSD01 (flat-file-based) reflects an evolution in specification tooling during the study. Both approaches serve the same purpose — providing a structured specification package to the AI — but differ in file organization.

### 5.3 Prompt and Specification Review Procedure

For each version, the analysis reviews:

- the initial request or formal specification package
- explicit business rules and constraints
- acceptance criteria and non-functional requirements
- follow-up refinement or debug instructions when present

This step is necessary to establish traceability between the instruction design and the resulting implementation quality.

## 6. Dependent Variables and Evaluation Standards

The study operationalizes code quality through four automated measurement layers.

### 6.1 Functional Correctness

**Instrument:** scenario-based automated tests (Jest)

Functional correctness is measured through acceptance-style tests aligned with each domain's scenario file. The test suites cover both standard flows and critical edge cases:

- normal CRUD and update operations
- coupon application and cart recalculation
- stock restoration and threshold alerts
- race conditions under concurrent requests
- transaction rollback and atomicity behavior
- boundary conditions such as overselling prevention and negative totals
- monetary precision cases such as decimal multiplication (e.g., 19.99 × 3 = 59.97)

**Primary metric:** pass/fail outcome against the relevant scenario suite.

Because each domain uses domain-specific scenarios, the suites are equivalent in intent rather than identical in implementation.

### 6.2 Static Code Quality

**Instrument:** SonarQube Community Edition

SonarQube is employed to capture structural quality issues that may not surface in functional tests. The following measures are collected:

- security vulnerabilities
- reliability issues (bugs)
- maintainability issues (code smells and technical debt)
- security hotspots
- duplication percentage
- coverage as reported by the scanner

These metrics support comparison of technical debt and code health across strategies.

### 6.3 Advanced Security Analysis

**Instrument:** GitHub CodeQL

CodeQL is used as a deeper semantic analysis layer to detect security-relevant patterns — such as injection vulnerabilities and unsafe data handling — that surface-level linting or style-based inspection may miss.

**Primary metric:** number and severity of security alerts.

### 6.4 Dynamic Application Security Testing

**Instrument:** OWASP ZAP

OWASP ZAP is employed for dynamic application security testing (DAST) to identify runtime vulnerabilities by actively probing the running application. This complements the static analysis performed by SonarQube and CodeQL by testing the system's behavior under simulated attack conditions.

## 7. Analysis Workflow

The evaluation pipeline follows an identical sequence for every version:

1. **Prompt/specification review** — identify requirements, constraints, and development intent from the input artifacts
2. **Implementation inspection** — verify how requirements were translated into code structure and behavior
3. **Functional validation** — execute scenario-based tests against the running application
4. **Static analysis and security scanning** — run SonarQube, CodeQL, and OWASP ZAP
5. **Cross-version comparison** — compare results by domain and by strategy

This workflow ensures that all interpretive claims are grounded in both instruction evidence and observable implementation outcomes.

## 8. Traceability Rules

To maintain internal consistency, conclusions are drawn only when the following traceability chain can be established:

1. **Instruction evidence** — from prompts, conversation exports, or specification artifacts
2. **Implementation evidence** — from the generated codebase
3. **Measured evidence** — from functional tests, SonarQube, CodeQL, and OWASP ZAP

This rule is particularly important because strong performance in one layer does not guarantee strong performance in another. A project may pass all scenario tests while still containing significant duplication or security weaknesses.

## 9. Interpretation Boundaries

The results should be interpreted as a **comparative benchmark of development strategies within a shared application family**, not as a pure time-series experiment. Because the versions differ by both domain and strategy, the methodology supports comparative insight rather than strict causal inference.

Accordingly:

- Findings regarding strategy superiority should be treated as pattern-based rather than absolute.
- Within-domain comparisons carry greater evidential weight than unrestricted cross-domain comparisons.
- Repository-wide artifacts outside the 9 core versions should not be merged into the main conclusions without explicit re-scoping.

## 10. Limitations

- **Incomplete generation metadata:** Exact model parameters such as temperature and seed values were not consistently preserved across all generation sessions.
- **Cross-domain variation:** Inherent differences among inventory, cart, and promotion tasks may influence outcomes independently of the interaction strategy.
- **Coverage reporting gap:** Scanner-reported coverage is near zero for most versions even when external scenario tests exist, due to the tests running outside the instrumented build pipeline.
- **Ecosystem limitation:** Findings are grounded in web-based e-commerce applications (Node.js + PostgreSQL + React) and may not generalize to other software domains or technology stacks.
- **Repository scope asymmetry:** The repository contains additional artifacts beyond the primary 9-version comparison set, which may create an impression of broader coverage than the formal analysis supports.

## 11. Methodological Summary

In summary, this study evaluates AI-generated software through a triangulated methodology: instruction analysis characterizes how each system was requested, automated testing verifies whether it meets functional requirements, and static and dynamic security analysis reveals structural and runtime risks. By providing illustrative examples of each interaction strategy — from informal conversational prompts (BP) through structured context-rich prompts (CE) to multi-document specification packages (SDD) — the methodology enables transparent comparison of how the degree of input structure influences the quality of AI-generated implementations. This combination of automated evaluation instruments provides a reproducible and objective basis for comparing AI-assisted development strategies.
