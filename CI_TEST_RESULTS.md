# CI/CD Test Results Summary

> Last updated: 2026-04-06
> Repository: [PhatchareePuangjai/chatGPT5](https://github.com/PhatchareePuangjai/chatGPT5)
> Actions: [All Workflows](https://github.com/PhatchareePuangjai/chatGPT5/actions)

---

## CI Results Update (2026-04-06)

Latest GitHub Actions runs triggered by code changes (unit test + SonarQube updates).

**CodeQL** run [`#24025305539`](https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/24025305539) — Both Python and JavaScript analyses passed. Security alert counts **unchanged** from previous run.

**DAST** run [`#24028162574`](https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/24028162574) — Overall status: FAILURE. 9/12 jobs scanned; 3 failed (AG versions IMAG01, PDAG01, SCAG01 not yet in repo). CS versions (IMCS01, PDCS01, SCCS01) removed from workflow.

| Version | Change                    | Notes                                                                              |
| ------- | ------------------------- | ---------------------------------------------------------------------------------- |
| PDSD01  | WARN-NEW 7→9, PASS 60→58  | New warnings: In Page Banner Info Leak [10009], Server Leaks Version Info [10036]  |
| SCSD01  | WARN-NEW 7→8, PASS 60→59  | New warning: Sub Resource Integrity Attribute Missing [90003]                      |
| IMCS01  | Removed from workflow     | CS strategy removed from DAST workflow                                             |
| PDCS01  | Removed from workflow     | CS strategy removed from DAST workflow                                             |
| SCCS01  | Removed from workflow     | CS strategy removed from DAST workflow                                             |
| IMAG01  | Scan FAILED (new version) | Directory `/src/versions/IMAG01` not found — not yet in repo                      |
| PDAG01  | Scan FAILED (new version) | Directory `/src/versions/PDAG01` not found — not yet in repo                      |
| SCAG01  | Scan FAILED (new version) | Directory `/src/versions/SCAG01/shopping-cart-system` not found — not yet in repo |

---

## Local Verification Updates (2026-04-04)

Full test suites (scenario + unit + integration) executed locally for all SDD versions after restructuring code under new folder names.
These results are local verification updates and are not part of the archived GitHub Actions run `#23089850265`.

> **Note:** CI run `#23089850265` results in the tables below reflect the **old code** (`_IMSD01`, `_PDSD01`, `_SCSD01`). The SDD test counts shown there are outdated. The correct counts from the new code are listed here.

| Version   | Feature                | Command            | Result                  | Passed | Failed | Breakdown                                                                   |
| --------- | ---------------------- | ------------------ | ----------------------- | ------ | ------ | --------------------------------------------------------------------------- |
| IMSD01    | Inventory Management   | `pytest tests/ -v` | :white_check_mark: PASS | 18     | 0      | scenarios: 8 (test_3 parametrized ×2), contract: 2, unit: 4, integration: 4 |
| PDSD01    | Promotions & Discounts | `pytest tests/ -v` | :white_check_mark: PASS | 18     | 0      | scenarios: 6, unit: 7, integration: 5                                       |
| SCSD01    | Shopping Cart          | `pytest tests/ -v` | :white_check_mark: PASS | 16     | 0      | scenarios: 5, unit: 8, integration: 3                                       |
| SCSD01_v2 | Shopping Cart          | `pytest tests/ -v` | :white_check_mark: PASS | 15     | 0      | scenarios: 5, unit: 6, integration: 4                                       |

---

## 1. Unit Tests & Integration Tests

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

| Strategy                     | IM (Inventory)           | SC (Shopping Cart) [2]           | PD (Promotions)          | Total     |
| ---------------------------- | ------------------------ | -------------------------------- | ------------------------ | --------- |
| **BP** (Basic Prompting)     | :white_check_mark: 7/7   | :white_check_mark: 5/5           | :white_check_mark: 6/6   | **18/18** |
| **CE** (Context Engineering) | :white_check_mark: 7/7   | :white_check_mark: 5/5           | :white_check_mark: 6/6   | **18/18** |
| **CS** (Cursor)              | :white_check_mark: 7/7   | :white_check_mark: 5/5           | :white_check_mark: 6/6   | **18/18** |
| **SD** (Spec-Driven Dev)     | :white_check_mark: 18/18 | :white_check_mark: 16/16 + 15/15 | :white_check_mark: 18/18 | **67/67** |

> BP/CE/CS counts are scenario-level tests from CI run `#23089850265`.
> SD counts include full test suite (scenario + unit + integration) from local run 2026-04-04 / 2026-04-05.
> [2] SD has 2 SC implementations: SCSD01 (OOP Service Layer, 16) + SCSD01_v2 (Functional/Module-Level, 15) = 31
>
> **Total: 121 tests passed, 0 failed across all 13 versions**

---

## 2. CodeQL Static Analysis (SAST)

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
| SCCE01  | 6    | 0      | 6     | Missing rate limiting                  |
| PDCE01  | 0    | 1      | 1     | Permissive CORS configuration          |
| IMCS01  | 0    | 0      | 0     | -                                      |
| PDCS01  | 0    | 0      | 0     | -                                      |
| SCCS01  | 0    | 0      | 0     | -                                      |
| IMSD01  | 0    | 0      | 0     | -                                      |
| SCSD01  | 0    | 0      | 0     | -                                      |
| PDSD01  | 0    | 0      | 0     | -                                      |
| SCBP01  | 0    | 0      | 0     | -                                      |
| PDBP01  | 0    | 0      | 0     | -                                      |

### CodeQL Alert Summary by Strategy

| Strategy                     | Total Alerts | High | Medium |
| ---------------------------- | ------------ | ---- | ------ |
| **BP** (Basic Prompting)     | 5            | 5    | 0      |
| **CE** (Context Engineering) | 11           | 9    | 2      |
| **CS** (Cursor)              | 0            | 0    | 0      |
| **SD** (Spec-Driven Dev)     | 0            | 0    | 0      |

---

## 3. DAST Security Scan (ZAP)

> Workflow run: [DAST #24026211427](https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/24026211427)
> Result: :x: **9/15 JOBS SCANNED, 6 FAILED (directory not found)**
> Note: IMCS01, PDCS01, SCCS01 failed — directory paths not found after code restructuring. IMAG01, PDAG01, SCAG01 are new versions referenced in workflow but not yet in repo.

| Version | FAIL-NEW | WARN-NEW | PASS | Notable Warnings                                                               |
| ------- | -------- | -------- | ---- | ------------------------------------------------------------------------------ |
| IMBP01  | 0        | 7        | 60   | Missing headers (CSP, X-Content-Type, Clickjacking, COEP)                      |
| IMCE01  | 0        | 7        | 60   | Missing headers (CSP, X-Content-Type, Clickjacking, COEP)                      |
| IMCS01  | —        | —        | —    | :x: ลบออกจาก workflow แล้ว (CS strategy ตัดออกจากงาน)                          |
| IMSD01  | 0        | 7        | 60   | Missing headers (CSP, X-Content-Type, Clickjacking, COEP)                      |
| SCBP01  | 0        | 7        | 60   | Missing headers (CSP, X-Content-Type, Clickjacking, COEP)                      |
| SCCE01  | 0        | 8        | 59   | Missing headers + Server version leak                                           |
| SCCS01  | —        | —        | —    | :x: SCAN FAILED — directory not found                                          |
| SCSD01  | 0        | 8        | 59   | Missing headers + Sub Resource Integrity Attr Missing [90003] *(new)*          |
| PDBP01  | 0        | 8        | 59   | Missing headers + Server version leak                                           |
| PDCE01  | 0        | 7        | 60   | Missing headers (CSP, X-Content-Type, Clickjacking, COEP)                      |
| PDCS01  | —        | —        | —    | :x: SCAN FAILED — directory not found                                          |
| PDSD01  | 0        | 9        | 58   | Missing headers + Server version leak + In Page Banner Info Leak [10009] *(new)* |
| IMAG01  | —        | —        | —    | :x: SCAN FAILED — new version, not yet in repo                                 |
| PDAG01  | —        | —        | —    | :x: SCAN FAILED — new version, not yet in repo                                 |
| SCAG01  | —        | —        | —    | :x: SCAN FAILED — new version, not yet in repo                                 |

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
| Server Leaks Version Information                   | 10036   | Low           | 3/9 (SCCE01, PDBP01, PDSD01) *(+PDSD01)*  |
| In Page Banner Information Leak                    | 10009   | Low           | 1/9 (PDSD01) *(new)*                       |
| Sub Resource Integrity Attribute Missing           | 90003   | Medium        | 1/9 (SCSD01) *(new)*                       |

### DAST Summary by Strategy

| Strategy                     | Avg Warnings | Avg Pass | Server Leak              | Scan Status                          |
| ---------------------------- | ------------ | -------- | ------------------------ | ------------------------------------ |
| **BP** (Basic Prompting)     | 7.3          | 59.7     | 1/3 (PDBP01)             | 3/3 scanned                          |
| **CE** (Context Engineering) | 7.3          | 59.7     | 1/3 (SCCE01)             | 3/3 scanned                          |
| **CS** (Cursor)              | —            | —        | —                        | :x: 0/3 scanned (all dirs not found) |
| **SD** (Spec-Driven Dev)     | 8.0          | 59.0     | 1/3 (PDSD01) *(changed)* | 3/3 scanned                          |

---

## 4. SonarQube Static Analysis

> SDD SonarQube values in this section were updated from the latest results in `Evaluating AI-Generated Code Quality from Basic Prompting to Spec-Driven Development - High-Quality Code (1).csv`.

### Functional Correctness

> All versions pass all functional correctness tests :white_check_mark:

**IM (Inventory Management)** — Successful Stock Deduction, Low Stock Alert Trigger, Stock Restoration

| Version | Successful Stock Deduction | Low Stock Alert Trigger | Stock Restoration  | Result                  |
| ------- | -------------------------- | ----------------------- | ------------------ | ----------------------- |
| IMBP01  | :white_check_mark:         | :white_check_mark:      | :white_check_mark: | :white_check_mark: PASS |
| IMCE01  | :white_check_mark:         | :white_check_mark:      | :white_check_mark: | :white_check_mark: PASS |
| IMSD01  | :white_check_mark:         | :white_check_mark:      | :white_check_mark: | :white_check_mark: PASS |
| IMCS01  | :white_check_mark:         | :white_check_mark:      | :white_check_mark: | :white_check_mark: PASS |

**PD (Promotion / Discount)** — Coupon Validation, Cart Total Discount, Expiration Date Check

| Version | Coupon Validation  | Cart Total Discount | Expiration Date Check | Result                  |
| ------- | ------------------ | ------------------- | --------------------- | ----------------------- |
| PDBP01  | :white_check_mark: | :white_check_mark:  | :white_check_mark:    | :white_check_mark: PASS |
| PDCE01  | :white_check_mark: | :white_check_mark:  | :white_check_mark:    | :white_check_mark: PASS |
| PDSD01  | :white_check_mark: | :white_check_mark:  | :white_check_mark:    | :white_check_mark: PASS |
| PDCS01  | :white_check_mark: | :white_check_mark:  | :white_check_mark:    | :white_check_mark: PASS |

**SC (Shopping Cart)** — Update Item Quantity, Merge Items Logic, Save for Later

| Version | Update Item Quantity | Merge Items Logic  | Save for Later     | Result                  |
| ------- | -------------------- | ------------------ | ------------------ | ----------------------- |
| SCBP01  | :white_check_mark:   | :white_check_mark: | :white_check_mark: | :white_check_mark: PASS |
| SCCE01  | :white_check_mark:   | :white_check_mark: | :white_check_mark: | :white_check_mark: PASS |
| SCSD01  | :white_check_mark:   | :white_check_mark: | :white_check_mark: | :white_check_mark: PASS |
| SCSD01_v2 | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: PASS |
| SCCS01  | :white_check_mark:   | :white_check_mark: | :white_check_mark: | :white_check_mark: PASS |

### SonarQube Open Issues by Version

| Version | Security (Open) | Reliability (Open) | Maintainability (Open) | Duplications |
| ------- | --------------- | ------------------ | ---------------------- | ------------ |
| IMBP01  | 0               | 3                  | 7                      | 6.90%        |
| IMCE01  | 0               | 19                 | 26                     | 0.00%        |
| IMSD01  | 0               | 12                 | 15                     | 3.30%        |
| IMCS01  | 1               | 8                  | 7                      | 0.00%        |
| PDBP01  | 0               | 1                  | 10                     | 1.40%        |
| PDCE01  | 0               | 16                 | 20                     | 0.00%        |
| PDSD01  | 1               | 6                  | 9                      | 0.00%        |
| PDCS01  | 0               | 8                  | 19                     | 4.20%        |
| SCBP01  | 0               | 9                  | 18                     | 5.40%        |
| SCCE01  | 0               | 9                  | 12                     | 4.30%        |
| SCSD01  | 1               | 0                  | 5                      | 26.90%       |
| SCSD01_v2 | 0             | 4                  | 25                     | 0.00%        |
| SCCS01  | 0               | 2                  | 8                      | 0.00%        |

### SonarQube Summary by Strategy

| Strategy                     | Avg Security | Avg Reliability | Avg Maintainability | Avg Duplications |
| ---------------------------- | ------------ | --------------- | ------------------- | ---------------- |
| **BP** (Basic Prompting)     | 0.0          | 4.3             | 11.7                | 4.57%            |
| **CE** (Context Engineering) | 0.0          | 14.7            | 19.3                | 1.43%            |
| **CS** (Cursor)              | 0.3          | 6.0             | 11.3                | 1.40%            |
| **SD** (Spec-Driven Dev)     | 0.5          | 5.5             | 13.5                | 7.55%            |

---

## Overall Summary

| Version   | Tests                      | CodeQL Alerts | DAST (FAIL/WARN/PASS) | SonarQube (Sec/Rel/Maint) | Duplications |
| --------- | -------------------------- | ------------- | --------------------- | ------------------------- | ------------ |
| IMBP01    | :white_check_mark: 7/7     | 5 high        | 0/7/60                | 0 / 3 / 7                 | 6.90%        |
| IMCE01    | :white_check_mark: 7/7     | 3 high, 1 med | 0/7/60                | 0 / 19 / 26               | 0.00%        |
| IMCS01    | :white_check_mark: 7/7     | 0 alerts      | 0/8/59                | 1 / 8 / 7                 | 0.00%        |
| IMSD01    | :white_check_mark: 18/18 ¹ | 0 alerts      | 0/7/60                | 0 / 12 / 15               | 3.30%        |
| SCBP01    | :white_check_mark: 5/5     | 0 alerts      | 0/7/60                | 0 / 9 / 18                | 5.40%        |
| SCCE01    | :white_check_mark: 5/5     | 6 high        | 0/8/59                | 0 / 9 / 12                | 4.30%        |
| SCCS01    | :white_check_mark: 5/5     | 0 alerts      | 0/8/59                | 0 / 2 / 8                 | 0.00%        |
| SCSD01    | :white_check_mark: 16/16 ¹ | 0 alerts      | 0/8/59 *(changed)*    | 1 / 0 / 5                 | 26.90%       |
| SCSD01_v2 | :white_check_mark: 15/15 ¹ | 0 alerts      | —                     | 0 / 4 / 25                | 0.00%        |
| PDBP01    | :white_check_mark: 6/6     | 0 alerts      | 0/8/59                | 0 / 1 / 10                | 1.40%        |
| PDCE01    | :white_check_mark: 6/6     | 1 med         | 0/7/60                | 0 / 16 / 20               | 0.00%        |
| PDCS01    | :white_check_mark: 6/6     | 0 alerts      | 0/7/60                | 0 / 8 / 19                | 4.20%        |
| PDSD01    | :white_check_mark: 18/18 ¹ | 0 alerts      | 0/9/58 *(changed)*    | 1 / 6 / 9                 | 0.00%        |

> ¹ Full test suite (scenario + unit + integration) from local run 2026-04-04. CodeQL and DAST results are from old code and pending re-run on new SDD codebase. SonarQube values for SDD rows were updated from the latest CSV source.

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
| Latest DAST Run          | https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/24026211427           |
