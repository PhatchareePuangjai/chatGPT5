# Research Methodology: Evaluating AI-Generated Code Quality

## Overview

This study evaluates AI-generated code using a multi-method design that combines prompt analysis, automated correctness checks, static analysis, and rubric-based code review. The goal is not only to measure whether generated systems run, but also to compare how different human-AI development strategies influence implementation quality, safety, and maintainability.

## 1. Study Scope and Dataset

### Core Comparative Dataset

The primary comparative dataset contains **9 generated versions** across **3 business domains** and **3 interaction strategies**.

| Domain | Basic Prompting | Context Engineering | Specification-Driven Development (SDD) |
|--------|------------------|---------------------|----------------------------------------|
| Inventory Management | IMBP01 | IMCE01 | IMSD01 |
| Shopping Cart | SCBP01 | SCCE01 | SCSD01 |
| Promotion / Discount | PDBP01 | PDCE01 | PDSD01 |

These 9 versions are the basis for the comparative claims reported in `RESEARCH_SUMMARY.md`.

### Supplementary Artifacts in the Repository

The repository also contains additional versions such as `IMAG01` (Agentic), `IMCS01` (Cursor), `PDAG01` (Agentic), `PDCS01` (Cursor), `SCAG01` (Agentic), and `SCCS01` (Cursor). These artifacts are useful as implementation references and supporting evidence, but they are **not included in the main 9-version comparison unless explicitly stated**.

> **Naming convention:** The prefix codes are **AG** = Agentic, **CS** = Cursor, **BP** = Basic Prompting, **CE** = Context Engineering, **SD** = Specification-Driven Development. This distinction is important because the repository-level population is larger than the dataset used in the summary tables.

### Unit of Analysis

The primary unit of analysis is **one generated project version** (for example, `IMCE01` or `PDSD01`). Each version is evaluated as a standalone full-stack implementation for one domain.

## 2. Experimental Design

### Independent Variable: Human-AI Interaction Strategy

We compare three levels of interaction complexity:

1. **Basic Prompting (BP):** Direct feature requests written in natural language with limited structure.
2. **Context Engineering (CE):** Structured prompting with role assignment, technical requirements, constraints, deliverables, and self-check instructions.
3. **Specification-Driven Development (SDD):** Implementation driven by structured specifications such as constitution/charter files, plans, scenario documents, and formal requirement traceability.

### Controlled Task Domains

To reduce domain randomness while still testing realistic business logic, all versions were built in a controlled e-commerce setting:

- Inventory management
- Shopping cart
- Promotion and discount logic

These domains were selected because they require:

- stateful CRUD behavior
- transaction integrity
- concurrency handling
- monetary precision
- user-visible validation and error handling

### Important Interpretation Note

The 9 versions do **not** form a pure time-series benchmark where the same task is repeated unchanged. They represent a matrix of:

- multiple domains, and
- multiple interaction strategies

Therefore, comparisons should be interpreted primarily as **cross-strategy comparisons within a shared application family**, not as proof of linear improvement over time alone.

## 3. Prompt and Specification Sources

To make the prompt-side analysis reproducible, the study uses prompt artifacts from two source types:

### A. ChatGPT Export Logs

Used for BP and CE versions where available:

- `src/versions/IMBP01/chatgpt-export/.../conversations.json`
- `src/versions/SCBP01/chatgpt-export/.../conversations.json`
- `src/versions/PDBP01/chatgpt-export/.../conversations.json`
- `src/versions/IMCE01/chatgpt-export/.../conversations.json`
- `src/versions/SCCE01/chatgpt-export/.../conversations.json`
- `src/versions/PDCE01/chatgpt-export/.../conversations.json`

These files provide the actual user prompts, refinement turns, packaging requests, and debug follow-ups used in the prompting analysis.

### B. Specification Artifacts

Used for SDD-style versions:

- `src/versions/IMSD01/.specify/...`
- `src/versions/SCSD01/speckit.specify`
- `src/versions/SCSD01/speckit.constitution`
- `src/versions/PDSD01/speckit.specify`

For SDD, the effective “prompt” is not a single conversational request but a structured requirements package composed of scenarios, constitutions/charters, plans, and formal specifications.

### Analysis Procedure

For each version, we extracted or reviewed:

- the initial generation request or specification package
- follow-up refinement instructions
- packaging/setup/debug turns when present
- explicit constraints, acceptance criteria, and self-check instructions

## 4. Measurement Standards (Dependent Variables)

Code quality is evaluated through three complementary standards.

### Standard A: Functional Correctness Evaluation
**Tool:** Automated Acceptance Tests (Jest)

We implemented scenario-based tests aligned with the domain requirements, including:

- **Standard scenarios:** CRUD flows, cart updates, coupon application, stock restoration.
- **Edge cases:**
  - **Race Conditions:** concurrent deduction/addition requests against limited stock.
  - **Transaction Atomicity:** rollback behavior when part of the workflow fails.
  - **Boundary Values:** overselling prevention, threshold-trigger conditions, negative total prevention.
  - **Precision:** financial calculations such as `19.99 * 3`.

**Primary metric:** Pass/fail status against the scenario suites defined in `scenarios_*.md`.

**Reproducibility note:** Scenario files are version-specific by domain, so the test suites are equivalent in intent, but not identical line-for-line across all projects.

### Standard B: Static Code Analysis
**Tool:** SonarQube Community Edition

We used static analysis to measure:

- **Security vulnerabilities**
- **Reliability issues (bugs)**
- **Maintainability issues (code smells / technical debt)**
- **Code duplication percentage**
- **Security hotspots**

These metrics help capture structural quality issues that may not immediately break scenario tests.

### Standard C: Advanced Security Analysis
**Tool:** GitHub CodeQL

CodeQL was used as a deeper semantic security scan to identify issues that basic linters or style tools may miss, such as unsafe data handling patterns.

**Primary metric:** Presence or absence of critical security alerts.

## 5. Qualitative Assessment: Rubric-Based Quality Score

Automated tools do not fully capture architecture and design quality, so we also applied a structured rubric.

### Review Method

- **Single-rater assessment:** One reviewer evaluated all versions using the same rubric.
- **Retrospective application:** The rubric was applied after generation, not during prompting.
- **Scoring scale:** 0-3 points per dimension.

### Scoring Rubric (Total: 12 Points)

| Dimension | 0 Points | 1 Point | 2 Points | 3 Points |
|-----------|----------|---------|----------|----------|
| **1. Architecture** | Monolithic, no separation | Basic structure, some organization | Service layer or clear separation | Clean Architecture (Repository + Service Pattern) |
| **2. Features** | No validation, basic error handling | Basic validation/error handling | Good validation + error handling | Comprehensive (Zod, Error Factory, Money utils, Tests) |
| **3. Code Organization** | >30% duplication | 10-30% duplication | <10% duplication | 0% duplication, excellent structure |
| **4. Best Practices** | None | Some | Good | Comprehensive (patterns, utilities, structured errors) |

### Penalty Rules

- **Security penalty:** If security vulnerabilities > 0, the maximum total score is capped at 4/12.
- **Duplication penalty:**
  - If duplication > 50%, the Architecture dimension is capped at 1 point.
  - If duplication > 30%, the Code Organization dimension is capped at 1 point.

### Star Rating Mapping

- **⭐ (1/5):** 0-3 points
- **⭐⭐ (2/5):** 4-6 points
- **⭐⭐⭐ (3/5):** 7-9 points
- **⭐⭐⭐⭐ (4/5):** 10-11 points
- **⭐⭐⭐⭐⭐ (5/5):** 12 points

## 6. Traceability Rules

To keep the study internally consistent, conclusions should follow this chain:

1. **Prompt/spec evidence** from `chatgpt-export`, `prompt.txt`, or specification artifacts
2. **Implementation evidence** from the generated codebase
3. **Measured outcomes** from tests, SonarQube, and CodeQL
4. **Rubric interpretation** for architecture and engineering quality

This traceability is essential because a version may score well on one method and poorly on another.

## 7. Limitations

- **Single-rater bias:** The qualitative score was assigned by a single reviewer without inter-rater reliability checks.
- **Incomplete generation metadata:** Some run-level parameters such as exact model identifiers, temperature, or seed were not consistently preserved in the dataset.
- **Scope limitation:** The main comparison is based on 9 core versions even though the repository contains additional related artifacts.
- **Cross-domain variance:** Differences between inventory, cart, and promotions tasks may affect results independently of prompting strategy.
- **Coverage gap:** Reported test coverage is 0.0% in SonarQube for most versions, even when scenario tests exist externally.
- **Ecosystem bias:** Results are tied to the web application / e-commerce setting and should not be generalized to all software domains.
