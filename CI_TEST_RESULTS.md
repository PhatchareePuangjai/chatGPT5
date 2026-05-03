# CI/CD Test Results Summary

> Last updated: 2026-04-12
> Repository: [PhatchareePuangjai/chatGPT5](https://github.com/PhatchareePuangjai/chatGPT5)
> Actions: [All Workflows](https://github.com/PhatchareePuangjai/chatGPT5/actions)

---

## CI Results Update (2026-04-12)

**DAST** run [`#24299653751`](https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/24299653751) — Overall status: 9/9 jobs scanned. All FAIL-NEW counts remain 0 across all versions.

## CI Results Update (2026-04-11)

Latest GitHub Actions runs triggered by code changes (unit test + SonarQube updates).

**CodeQL** run [`#24025305539`](https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/24025305539) — Both Python and JavaScript analyses passed. Security alert counts **unchanged** from previous run.

**DAST** run [`#24028162574`](https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/24028162574) — Overall status: 9/9 jobs scanned.

Note: CS versions (IMCS01, PDCS01, SCCS01) and AG versions (IMAG01, PDAG01, SCAG01 removed from workflow.

## Local Verification Updates (2026-04-04)

Full test suites (scenario + unit + integration) executed locally for all SDD versions after restructuring code under new folder names.
These results are local verification updates and are not part of the archived GitHub Actions run `#23089850265`.

> **Note:** CI run `#23089850265` results in the tables below reflect the **old code** (`_IMSD01`, `_PDSD01`, `_SCSD01`). The SDD test counts shown there are outdated. The correct counts from the new code are listed here.
>
> **Counting convention used in this document:** for `IMSD01`, scenario count is reported as **7 scenario methods** to stay consistent with archived workflow run `#23089850265` (`Unit Test IMSD01 = 7/7`). Although local `pytest` collection can expand one parametrized scenario into multiple test items, that expansion is **not** used in the summary tables below.
>
> **Functional correctness in this document is represented by scenario-level tests** rather than SonarQube. The table below isolates the scenario counts that map directly to business requirements.

### Functional Correctness Coverage (Scenario-Level Tests)

| Version   | Feature                | Scenario Tests | Result                  | Business Coverage                                             |
| --------- | ---------------------- | -------------- | ----------------------- | ------------------------------------------------------------- |
| IMSD01    | Inventory Management   | 7/7            | :white_check_mark: PASS | Stock deduction, low stock alert, stock restoration, edge cases |
| PDSD01    | Promotions & Discounts | 6/6            | :white_check_mark: PASS | Coupon validation, discount calculation, expiration, edge cases |
| SCSD01    | Shopping Cart          | 5/5            | :white_check_mark: PASS | Update quantity, merge items, save for later, edge cases       |
| SCSD01_v2 | Shopping Cart          | 5/5            | :white_check_mark: PASS | Reproducibility rerun of SCSD01 scenario coverage              |

| Version   | Feature                | Command            | Result                  | Passed | Failed | Breakdown                                                                   |
| --------- | ---------------------- | ------------------ | ----------------------- | ------ | ------ | --------------------------------------------------------------------------- |
| IMSD01    | Inventory Management   | `pytest tests/ -v` | :white_check_mark: PASS | 17     | 0      | scenarios: 7, contract: 2, unit: 4, integration: 4                          |
| PDSD01    | Promotions & Discounts | `pytest tests/ -v` | :white_check_mark: PASS | 18     | 0      | scenarios: 6, unit: 7, integration: 5                                       |
| SCSD01    | Shopping Cart          | `pytest tests/ -v` | :white_check_mark: PASS | 16     | 0      | scenarios: 5, unit: 8, integration: 3                                       |
| SCSD01_v2 | Shopping Cart          | `pytest tests/ -v` | :white_check_mark: PASS | 15     | 0      | scenarios: 5, unit: 6, integration: 4                                       |

> **Note on SCSD01_v2:** สร้างขึ้นเพื่อทดสอบ reproducibility เท่านั้น — ต้องการรู้ว่าถ้ารัน spec-driven process เดิมซ้ำอีกครั้งโดยไม่เปลี่ยนอะไร จะได้ผลลัพธ์เหมือน SCSD01 ไหม **ไม่ได้นำมารวมในการวิเคราะห์เปรียบเทียบ strategy** (ทุกกราฟและ summary ใช้เฉพาะ SCSD01)

---

## 1. Unit Tests & Integration Tests (For Note, ไม่ได้ใช้ หรือให้ความสำคัญมาก)

> Workflow run: [Unit Tests #23089850265](https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/23089850265)
> Result: :white_check_mark: **ALL 13 JOBS PASSED**

### Backend Unit Tests (PostgreSQL action)

| Version | Feature                | Result                  | Passed | Failed | Total | Details                                                                        |
| ------- | ---------------------- | ----------------------- | ------ | ------ | ----- | ------------------------------------------------------------------------------ |
| IMBP01  | Inventory Management   | :white_check_mark: PASS | 7      | 0      | 7     | [Log](https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/23089850265) |
| IMCE01  | Inventory Management   | :white_check_mark: PASS | 7      | 0      | 7     | [Log](https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/23089850265) |
| IMSD01  | Inventory Management   | :white_check_mark: PASS | 7      | 0      | 7     | [Log](https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/23089850265) |
| PDCE01  | Promotions & Discounts | :white_check_mark: PASS | 6      | 0      | 6     | [Log](https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/23089850265) |

### Integration Tests (Docker Compose — CS)

| Version            | Feature                | Result                  | Passed | Failed | Total | Details                                                                        |
| ------------------ | ---------------------- | ----------------------- | ------ | ------ | ----- | ------------------------------------------------------------------------------ |
| IMCS01             | Inventory Management   | :white_check_mark: PASS | 7      | 0      | 7     | [Log](https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/23089850265) |
| PDCS01-integration | Promotions & Discounts | :white_check_mark: PASS | 6      | 0      | 6     | [Log](https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/23089850265) |
| SCCS01             | Shopping Cart          | :white_check_mark: PASS | 5      | 0      | 5     | [Log](https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/23089850265) |

### Integration Tests (Docker Compose DB — BP / CE / SD)

| Version | Feature                | Result                  | Passed | Failed | Total | Details                                                                        |
| ------- | ---------------------- | ----------------------- | ------ | ------ | ----- | ------------------------------------------------------------------------------ |
| SCBP01  | Shopping Cart          | :white_check_mark: PASS | 5      | 0      | 5     | [Log](https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/23089850265) |
| PDBP01  | Promotions & Discounts | :white_check_mark: PASS | 6      | 0      | 6     | [Log](https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/23089850265) |
| SCCE01  | Shopping Cart          | :white_check_mark: PASS | 5      | 0      | 5     | [Log](https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/23089850265) |
| SCSD01  | Shopping Cart          | :white_check_mark: PASS | 5      | 0      | 5     | [Log](https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/23089850265) |
| PDSD01  | Promotions & Discounts | :white_check_mark: PASS | 11     | 0      | 11    | [Log](https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/23089850265) |
| PDCS01  | Promotions & Discounts | :white_check_mark: PASS | 6      | 0      | 6     | [Log](https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/23089850265) |

### Test Summary by Prompting Strategy

| Strategy                     | IM (Inventory)           | SC (Shopping Cart)       | PD (Promotions)          | Total     |
| ---------------------------- | ------------------------ | ------------------------ | ------------------------ | --------- |
| **BP** (Basic Prompting)     | :white_check_mark: 7/7   | :white_check_mark: 5/5   | :white_check_mark: 6/6   | **18/18** |
| **CE** (Context Engineering) | :white_check_mark: 7/7   | :white_check_mark: 5/5   | :white_check_mark: 6/6   | **18/18** |
| **CS** (Cursor)              | :white_check_mark: 7/7   | :white_check_mark: 5/5   | :white_check_mark: 6/6   | **18/18** |
| **SD** (Spec-Driven Dev)     | :white_check_mark: 17/17 | :white_check_mark: 16/16 | :white_check_mark: 18/18 | **51/51** |

> BP/CE/CS counts are scenario-level test counts from archived CI run `#23089850265`.
> SD counts are local full-suite counts from the restructured codebase, using the document counting convention above.
> SCSD01_v2 excluded from strategy comparison — reproducibility test only (see note above).
>
> **Total: 106 tests passed, 0 failed across 12 versions (excluding SCSD01_v2)**

---

## 2. SonarQube Static Analysis

> SDD SonarQube values in this section were updated from the latest results in `Evaluating AI-Generated Code Quality from Basic Prompting to Spec-Driven Development - High-Quality Code (1).csv`.

### SonarQube Open Issues by Version

| Version   | Security (Open) | Reliability (Open) | Maintainability (Open) | Duplications |
| --------- | --------------- | ------------------ | ---------------------- | ------------ |
| IMBP01    | 0               | 3                  | 7                      | 6.90%        |
| IMCE01    | 0               | 19                 | 26                     | 0.00%        |
| IMSD01    | 0               | 12                 | 15                     | 3.30%        |
| SCBP01    | 0               | 9                  | 18                     | 5.40%        |
| SCCE01    | 0               | 9                  | 12                     | 4.30%        |
| SCSD01    | 1               | 0                  | 5                      | 26.90%       |
| SCSD01_v2 | 0               | 4                  | 25                     | 0.00%        |
| PDBP01    | 0               | 1                  | 10                     | 1.40%        |
| PDCE01    | 0               | 16                 | 20                     | 0.00%        |
| PDSD01    | 1               | 6                  | 9                      | 0.00%        |

> CS and AG versions are excluded from this SonarQube summary to match the current workflow scope.

### SonarQube Summary by Strategy

| Strategy                     | Avg Security | Avg Reliability | Avg Maintainability | Avg Duplications |
| ---------------------------- | ------------ | --------------- | ------------------- | ---------------- |
| **BP** (Basic Prompting)     | 0.0          | 4.3             | 11.7                | 4.57%            |
| **CE** (Context Engineering) | 0.0          | 14.7            | 19.3                | 1.43%            |
| **SD** (Spec-Driven Dev)     | 0.67         | 6.0             | 9.67                | 10.07%           |

---

## 3. CodeQL Static Analysis (SAST)

> Workflow run: [CodeQL #24025305539](https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/24025305539)
> Security alerts: [Code Scanning Alerts](https://github.com/PhatchareePuangjai/chatGPT5/security/code-scanning)

| Language              | Result                  |
| --------------------- | ----------------------- |
| JavaScript/TypeScript | :white_check_mark: PASS |
| Python                | :white_check_mark: PASS |

### Security Alerts by Version (Open)

| Version | High | Medium | Total | Details                                |
| ------- | ---- | ------ | ----- | -------------------------------------- |
| IMBP01  | 5    | 0      | 5     | Missing rate limiting                  |
| IMCE01  | 3    | 1      | 4     | Missing rate limiting, Permissive CORS |
| IMSD01  | 0    | 0      | 0     | -                                      |
| SCBP01  | 0    | 0      | 0     | -                                      |
| SCCE01  | 6    | 0      | 6     | Missing rate limiting                  |
| SCSD01  | 0    | 0      | 0     | -                                      |
| PDBP01  | 0    | 0      | 0     | -                                      |
| PDCE01  | 0    | 1      | 1     | Permissive CORS configuration          |
| PDSD01  | 0    | 0      | 0     | -                                      |


### CodeQL Alert Summary by Strategy

| Strategy                     | Total Alerts | High | Medium |
| ---------------------------- | ------------ | ---- | ------ |
| **BP** (Basic Prompting)     | 5            | 5    | 0      |
| **CE** (Context Engineering) | 11           | 9    | 2      |
| **SD** (Spec-Driven Dev)     | 0            | 0    | 0      |

---

## 4. DAST Security Scan (ZAP)

> Workflow run: [DAST #24299653751](https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/24299653751)
> Result: :white_check_mark: **9/9 JOBS SCANNED**

| Version | FAIL-NEW | WARN-NEW | PASS | Notable Warnings                                                                  |
| ------- | -------- | -------- | ---- | --------------------------------------------------------------------------------- |
| IMBP01  | 0        | 7        | 60   | Missing headers                                                                   |
| IMCE01  | 0        | 7        | 60   | Missing headers                                                                   |
| IMSD01  | 0        | 7        | 60   | Missing headers                                                                   |
| PDBP01  | 0        | 8        | 59   | Missing headers + Server version leak                                             |
| PDCE01  | 0        | 7        | 60   | Missing headers                                                                   |
| PDSD01  | 0        | 9        | 58   | Missing headers + Server version leak + In Page Banner Information Leak [10009]   |
| SCBP01  | 0        | 7        | 60   | Missing headers                                                                   |
| SCCE01  | 0        | 8        | 59   | Missing headers + Server version leak                                             |
| SCSD01  | 0        | 8        | 59   | Missing headers + Sub Resource Integrity Attribute Missing [90003]                |

### Common ZAP Warnings (across all versions)

| Warning                                            | Rule ID | Severity      | Affected (9 scanned)                       |
| -------------------------------------------------- | ------- | ------------- | ------------------------------------------ |
| Missing Anti-clickjacking Header                   | 10020   | Medium        | 9/9                                        |
| Content Security Policy (CSP) Header Not Set       | 10038   | Medium        | 9/9                                        |
| Cross-Origin-Embedder-Policy (COEP) Header Missing | 90004   | Low           | 9/9                                        |
| Cross-Origin-Opener-Policy (COOP) Header Missing   | 90004   | Low           | 9/9                                        |
| Cross-Origin-Resource-Policy (CORP) Header Missing | 90004   | Low           | 9/9                                        |
| Permissions Policy Header Not Set                  | 10063   | Low           | 9/9                                        |
| X-Content-Type-Options Header Missing              | 10021   | Low           | 9/9                                        |
| Storable but Non-Cacheable Content                 | 10049   | Informational | 9/9                                        |
| Modern Web Application                             | 10109   | Informational | 9/9                                        |
| Server Leaks Version Information                   | 10036   | Low           | 3/9 (SCCE01, PDBP01, PDSD01)              |
| In Page Banner Information Leak                    | 10009   | Low           | 1/9 (PDSD01)                               |
| Sub Resource Integrity Attribute Missing           | 90003   | Medium        | 1/9 (SCSD01)                               |

### DAST Summary by Strategy

| Strategy                     | Avg Warnings | Avg Pass | Server Leak              | Scan Status                          |
| ---------------------------- | ------------ | -------- | ------------------------ | ------------------------------------ |
| **BP** (Basic Prompting)     | 7.3          | 59.7     | 1/3 (PDBP01)             | 3/3 scanned                          |
| **CE** (Context Engineering) | 7.3          | 59.7     | 1/3 (SCCE01)             | 3/3 scanned                          |
| **SD** (Spec-Driven Dev)     | 8.0          | 59.0     | 1/3 (PDSD01)             | 3/3 scanned                          |

---

## Overall Summary

| Version   | Tests                      | CodeQL Alerts | DAST (FAIL/WARN/PASS) | SonarQube (Sec/Rel/Maint) | Duplications | Total LOC | Avg LOC/File |
| --------- | -------------------------- | ------------- | --------------------- | ------------------------- | ------------ | --------- | ------------ |
| IMBP01    | :white_check_mark: 7/7     | 5 high        | 0/7/60                | 0 / 3 / 7                 | 6.90%        | 282       | 47.0         |
| IMCE01    | :white_check_mark: 7/7     | 3 high, 1 med | 0/7/60                | 0 / 19 / 26               | 0.00%        | 256       | 51.2         |
| IMSD01    | :white_check_mark: 17/17 ¹ | 0 alerts      | 0/7/60                | 0 / 12 / 15               | 3.30%        | 398       | 15.9         |
| SCBP01    | :white_check_mark: 5/5     | 0 alerts      | 0/7/60                | 0 / 9 / 18                | 5.40%        | 454       | 50.4         |
| SCCE01    | :white_check_mark: 5/5     | 6 high        | 0/8/59                | 0 / 9 / 12                | 4.30%        | 459       | 91.8         |
| SCSD01    | :white_check_mark: 16/16 ¹ | 0 alerts      | 0/8/59                | 1 / 0 / 5                 | 26.90%       | 758       | 84.2         |
| SCSD01_v2 | :white_check_mark: 15/15 ¹ | 0 alerts      | —                     | 0 / 4 / 25                | 0.00%        | 665       | 47.5         |
| PDBP01    | :white_check_mark: 6/6     | 0 alerts      | 0/8/59                | 0 / 1 / 10                | 1.40%        | 365       | 60.8         |
| PDCE01    | :white_check_mark: 6/6     | 1 med         | 0/7/60                | 0 / 16 / 20               | 0.00%        | 344       | 38.2         |
| PDSD01    | :white_check_mark: 18/18 ¹ | 0 alerts      | 0/9/58                | 1 / 6 / 9                 | 0.00%        | 296       | 32.8         |

> ¹ Full test suite (scenario + unit + integration) from local verification on 2026-04-04 / 2026-04-05, reported using the document counting convention above. SonarQube values updated from CSV source.
> ² LOC counted from production source files only (`.py` / `.js`), excluding `node_modules`, `tests/`, and test files (`test_*`, `*.test.js`, `*.spec.js`). Avg LOC/File = Total LOC ÷ number of source files.

---

## 5. Conversation & Interaction Effort

> **Data sources:**
> - **BP / CE**: `chatgpt-export/.../conversations.json` — ChatGPT web interface exports (GPT-5 series)
> - **SDD**: `conversation_export.json` — Codex CLI session export, partial log (user commands only; AI responses not captured in export)
>
> **Note on token counts:** Conversations were conducted via web interfaces (not direct API), so actual API billing tokens were not recorded. `usage_json` in the Excel logs is `{}` (empty). User prompt tokens below are counted using **tiktoken `cl100k_base`** (GPT-4/GPT-5 tokenizer) applied to user-side text only. SDD values reflect spec commands only — actual AI token consumption is significantly higher.

### Interaction Counts by Version

| Version | Strategy | Model | Conversations | User Turns | AI Turns | User Prompt Tokens ³ |
| ------- | -------- | ----- | ------------- | ---------- | -------- | -------------------- |
| IMBP01  | BP       | GPT-5 (gpt-5-2) | 1 | 5 | 7 | 423 |
| SCBP01  | BP       | GPT-5 (gpt-5-2) | 2 | 6 | 6 | 836 |
| PDBP01  | BP       | GPT-5 (gpt-5-2) | 1 | 2 | 2 | 618 |
| IMCE01  | CE       | GPT-5 (gpt-5-2) | 1 | 8 | 13 | 927 |
| SCCE01  | CE       | GPT-5 (gpt-5-2) | 1 | 3 | 3 | 463 |
| PDCE01  | CE       | GPT-5 (gpt-5-2) | 1 | 1 | 1 | 531 |
| IMSD01  | SDD      | Codex CLI | N/A | 13 | 12 | 296 ⁴ |
| SCSD01  | SDD      | Codex CLI | N/A | 23 | 20 | 353 ⁴ |
| PDSD01  | SDD      | Codex CLI | N/A | 14 | 13 | 170 ⁴ |

### Interaction Summary by Strategy

| Strategy | Total Conversations | Total User Turns | Total AI Turns | User Prompt Tokens ³ |
| -------- | ------------------- | ---------------- | -------------- | -------------------- |
| **BP** (Basic Prompting) | 4 | 13 | 15 | 3,527 |
| **CE** (Context Engineering) | 3 | 12 | 17 | 1,921 |
| **SDD** (Spec-Driven Dev) | N/A | 50 | 45 | 819 ⁴ |

> ³ Counted using tiktoken `cl100k_base` encoding on user-side prompt text only. Source: `chatgpt-export/conversations.json` (BP/CE) and `conversation_export.json` (SDD).
> ⁴ SDD exports capture spec commands only (e.g., `speckit-plan`, `speckit.implement`). True token consumption is significantly higher as AI-generated code responses are not included in the export.
> &nbsp;&nbsp;&nbsp;&nbsp;**What is counted:** user-side spec commands in `conversation_export.json` only.
> &nbsp;&nbsp;&nbsp;&nbsp;**What is NOT counted:** AI-generated code responses, full conversation context sent per turn.
> &nbsp;&nbsp;&nbsp;&nbsp;→ SDD token values (296 / 353 / 170) are a significant undercount and should not be compared directly with BP/CE token values.

---

## Links

| Resource                 | URL                                                                               |
| ------------------------ | --------------------------------------------------------------------------------- |
| Repository               | https://github.com/PhatchareePuangjai/chatGPT5                                    |
| All Actions              | https://github.com/PhatchareePuangjai/chatGPT5/actions                            |
| Unit Tests Workflow      | https://github.com/PhatchareePuangjai/chatGPT5/actions/workflows/unit-tests.yml   |
| CodeQL Workflow          | https://github.com/PhatchareePuangjai/chatGPT5/actions/workflows/codeql.yml       |
| DAST ZAP Workflow        | https://github.com/PhatchareePuangjai/chatGPT5/actions/workflows/dast-zap-all.yml |
| Security Alerts (CodeQL) | https://github.com/PhatchareePuangjai/chatGPT5/security/code-scanning             |
| Latest Unit Tests Run    | https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/23089850265           |
| Latest CodeQL Run        | https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/24025305539           |
| Latest DAST Run          | https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/24299653751           |
