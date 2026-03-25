# CI/CD Test Results Summary

> Last updated: 2026-03-21
> Repository: [PhatchareePuangjai/chatGPT5](https://github.com/PhatchareePuangjai/chatGPT5)
> Actions: [All Workflows](https://github.com/PhatchareePuangjai/chatGPT5/actions)

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

| Strategy                     | IM (Inventory)         | SC (Shopping Cart)     | PD (Promotions)          | Total     |
| ---------------------------- | ---------------------- | ---------------------- | ------------------------ | --------- |
| **BP** (Basic Prompting)     | :white_check_mark: 7/7 | :white_check_mark: 5/5 | :white_check_mark: 6/6   | **18/18** |
| **CE** (Context Engineering) | :white_check_mark: 7/7 | :white_check_mark: 5/5 | :white_check_mark: 6/6   | **18/18** |
| **CS** (Cursor)              | :white_check_mark: 7/7 | :white_check_mark: 5/5 | :white_check_mark: 6/6   | **18/18** |
| **SD** (Spec-Driven Dev)     | :white_check_mark: 7/7 | :white_check_mark: 5/5 | :white_check_mark: 11/11 | **23/23** |

> **Total: 77 tests passed, 0 failed across all 12 versions**

---

## 2. CodeQL Static Analysis (SAST)

> Workflow run: [CodeQL #23089483346](https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/23089483346)
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

> Workflow run: [DAST #23089748932](https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/23089748932)
> Result: :white_check_mark: **ALL 12 VERSIONS SCANNED SUCCESSFULLY**

| Version | FAIL-NEW | WARN-NEW | PASS | Notable Warnings                                          |
| ------- | -------- | -------- | ---- | --------------------------------------------------------- |
| IMBP01  | 0        | 7        | 60   | Missing headers (CSP, X-Content-Type, Clickjacking, COEP) |
| IMCE01  | 0        | 7        | 60   | Missing headers (CSP, X-Content-Type, Clickjacking, COEP) |
| IMCS01  | 0        | 8        | 59   | Missing headers + Server version leak                     |
| IMSD01  | 0        | 7        | 60   | Missing headers (CSP, X-Content-Type, Clickjacking, COEP) |
| SCBP01  | 0        | 7        | 60   | Missing headers (CSP, X-Content-Type, Clickjacking, COEP) |
| SCCE01  | 0        | 8        | 59   | Missing headers + Server version leak                     |
| SCCS01  | 0        | 8        | 59   | Missing headers + Server version leak                     |
| SCSD01  | 0        | 7        | 60   | Missing headers (CSP, X-Content-Type, Clickjacking, COEP) |
| PDBP01  | 0        | 8        | 59   | Missing headers + Server version leak                     |
| PDCE01  | 0        | 7        | 60   | Missing headers (CSP, X-Content-Type, Clickjacking, COEP) |
| PDCS01  | 0        | 7        | 60   | Missing headers (CSP, X-Content-Type, Clickjacking, COEP) |
| PDSD01  | 0        | 7        | 60   | Missing headers (CSP, X-Content-Type, Clickjacking, COEP) |

### Common ZAP Warnings (across all versions)

| Warning                                              | Rule ID | Severity      | Affected                               |
| ---------------------------------------------------- | ------- | ------------- | -------------------------------------- |
| Missing Anti-clickjacking Header                     | 10020   | Medium        | 12/12                                  |
| Content Security Policy (CSP) Header Not Set         | 10038   | Medium        | 12/12                                  |
| Cross-Origin-Embedder-Policy (COEP) Header Missing   | 90004   | Low           | 12/12                                  |
| Cross-Origin-Opener-Policy (COOP) Header Missing     | 90004   | Low           | 12/12                                  |
| Cross-Origin-Resource-Policy (CORP) Header Missing   | 90004   | Low           | 12/12                                  |
| Permissions Policy Header Not Set                    | 10063   | Low           | 12/12                                  |
| X-Content-Type-Options Header Missing                | 10021   | Low           | 12/12                                  |
| Storable but Non-Cacheable Content                   | 10049   | Informational | 12/12                                  |
| Modern Web Application                               | 10109   | Informational | 12/12                                  |
| Server Leaks Version Information                     | 10036   | Low           | 4/12 (IMCS01, SCCE01, SCCS01, PDBP01) |

### DAST Summary by Strategy

| Strategy                     | Avg Warnings | Avg Pass | Server Leak          |
| ---------------------------- | ------------ | -------- | -------------------- |
| **BP** (Basic Prompting)     | 7.3          | 59.7     | 1/3 (PDBP01)         |
| **CE** (Context Engineering) | 7.3          | 59.7     | 1/3 (SCCE01)         |
| **CS** (Cursor)              | 7.7          | 59.3     | 2/3 (IMCS01, SCCS01) |
| **SD** (Spec-Driven Dev)     | 7.0          | 60.0     | No                   |

---

## 4. SonarQube Static Analysis

### Functional Correctness

> All versions pass all functional correctness tests :white_check_mark:

**IM (Inventory Management)** — Successful Stock Deduction, Low Stock Alert Trigger, Stock Restoration

| Version | Successful Stock Deduction | Low Stock Alert Trigger | Stock Restoration | Result                  |
| ------- | -------------------------- | ----------------------- | ----------------- | ----------------------- |
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
| ------- | ------------------- | ------------------ | ------------------ | ----------------------- |
| SCBP01  | :white_check_mark:  | :white_check_mark: | :white_check_mark: | :white_check_mark: PASS |
| SCCE01  | :white_check_mark:  | :white_check_mark: | :white_check_mark: | :white_check_mark: PASS |
| SCSD01  | :white_check_mark:  | :white_check_mark: | :white_check_mark: | :white_check_mark: PASS |
| SCCS01  | :white_check_mark:  | :white_check_mark: | :white_check_mark: | :white_check_mark: PASS |

### SonarQube Open Issues by Version

| Version | Security (Open) | Reliability (Open) | Maintainability (Open) | Duplications |
| ------- | --------------- | ------------------- | ---------------------- | ------------ |
| IMBP01  | 0               | 3                   | 7                      | 6.90%        |
| IMCE01  | 0               | 19                  | 26                     | 0.00%        |
| IMSD01  | 1               | 22                  | 18                     | 3.10%        |
| IMCS01  | 1               | 8                   | 7                      | 0.00%        |
| PDBP01  | 0               | 1                   | 10                     | 1.40%        |
| PDCE01  | 0               | 16                  | 20                     | 0.00%        |
| PDSD01  | 0               | 8                   | 17                     | 0.00%        |
| PDCS01  | 0               | 8                   | 19                     | 4.20%        |
| SCBP01  | 0               | 9                   | 18                     | 5.40%        |
| SCCE01  | 0               | 9                   | 12                     | 4.30%        |
| SCSD01  | 0               | 9                   | 12                     | 4.40%        |
| SCCS01  | 0               | 2                   | 8                      | 0.00%        |

### SonarQube Summary by Strategy

| Strategy                     | Avg Security | Avg Reliability | Avg Maintainability | Avg Duplications |
| ---------------------------- | ------------ | --------------- | ------------------- | ---------------- |
| **BP** (Basic Prompting)     | 0.0          | 4.3             | 11.7                | 4.57%            |
| **CE** (Context Engineering) | 0.0          | 14.7            | 19.3                | 1.43%            |
| **CS** (Cursor)              | 0.3          | 6.0             | 11.3                | 1.40%            |
| **SD** (Spec-Driven Dev)     | 0.3          | 13.0            | 15.7                | 2.50%            |

---

## Overall Summary

| Version | Tests                    | CodeQL Alerts | DAST (FAIL/WARN/PASS) | SonarQube (Sec/Rel/Maint) | Duplications |
| ------- | ------------------------ | ------------- | --------------------- | ------------------------- | ------------ |
| IMBP01  | :white_check_mark: 7/7   | 5 high        | 0/7/60                | 0 / 3 / 7                | 6.90%        |
| IMCE01  | :white_check_mark: 7/7   | 3 high, 1 med | 0/7/60                | 0 / 19 / 26              | 0.00%        |
| IMCS01  | :white_check_mark: 7/7   | 0 alerts      | 0/8/59                | 1 / 8 / 7                | 0.00%        |
| IMSD01  | :white_check_mark: 7/7   | 0 alerts      | 0/7/60                | 1 / 22 / 18              | 3.10%        |
| SCBP01  | :white_check_mark: 5/5   | 0 alerts      | 0/7/60                | 0 / 9 / 18               | 5.40%        |
| SCCE01  | :white_check_mark: 5/5   | 6 high        | 0/8/59                | 0 / 9 / 12               | 4.30%        |
| SCCS01  | :white_check_mark: 5/5   | 0 alerts      | 0/8/59                | 0 / 2 / 8                | 0.00%        |
| SCSD01  | :white_check_mark: 5/5   | 0 alerts      | 0/7/60                | 0 / 9 / 12               | 4.40%        |
| PDBP01  | :white_check_mark: 6/6   | 0 alerts      | 0/8/59                | 0 / 1 / 10               | 1.40%        |
| PDCE01  | :white_check_mark: 6/6   | 1 med         | 0/7/60                | 0 / 16 / 20              | 0.00%        |
| PDCS01  | :white_check_mark: 6/6   | 0 alerts      | 0/7/60                | 0 / 8 / 19               | 4.20%        |
| PDSD01  | :white_check_mark: 11/11 | 0 alerts      | 0/7/60                | 0 / 8 / 17               | 0.00%        |

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
| Latest CodeQL Run        | https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/23089483346           |
| Latest DAST Run          | https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/23089748932           |
