# CI/CD Test Results Summary

> Last updated: 2026-03-14
> Repository: [PhatchareePuangjai/chatGPT5](https://github.com/PhatchareePuangjai/chatGPT5)
> Actions: [All Workflows](https://github.com/PhatchareePuangjai/chatGPT5/actions)

---

## 1. Unit Tests & Integration Tests

> Workflow run: [Unit Tests #23089850265](https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/23089850265)
> Result: :white_check_mark: **ALL 16 JOBS PASSED**

### Backend Unit Tests (PostgreSQL action)

| Version | Feature                | Result                  | Passed | Failed | Total | Details                                                                        |
| ------- | ---------------------- | ----------------------- | ------ | ------ | ----- | ------------------------------------------------------------------------------ |
| IMBP01  | Inventory Management   | :white_check_mark: PASS | 7      | 0      | 7     | [Log](https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/23089850265) |
| IMCE01  | Inventory Management   | :white_check_mark: PASS | 7      | 0      | 7     | [Log](https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/23089850265) |
| IMSD01  | Inventory Management   | :white_check_mark: PASS | 7      | 0      | 7     | [Log](https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/23089850265) |
| PDCE01  | Promotions & Discounts | :white_check_mark: PASS | 6      | 0      | 6     | [Log](https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/23089850265) |

### Integration Tests (Docker Compose — AG / CS)

| Version            | Feature                | Result                  | Passed | Failed | Total | Details                                                                        |
| ------------------ | ---------------------- | ----------------------- | ------ | ------ | ----- | ------------------------------------------------------------------------------ |
| IMAG01             | Inventory Management   | :white_check_mark: PASS | 7      | 0      | 7     | [Log](https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/23089850265) |
| IMCS01             | Inventory Management   | :white_check_mark: PASS | 7      | 0      | 7     | [Log](https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/23089850265) |
| PDAG01             | Promotions & Discounts | :white_check_mark: PASS | 6      | 0      | 6     | [Log](https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/23089850265) |
| PDCS01-integration | Promotions & Discounts | :white_check_mark: PASS | 6      | 0      | 6     | [Log](https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/23089850265) |
| SCAG01             | Shopping Cart          | :white_check_mark: PASS | 5      | 0      | 5     | [Log](https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/23089850265) |
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
| **AG** (AI-Generated)        | :white_check_mark: 7/7 | :white_check_mark: 5/5 | :white_check_mark: 6/6   | **18/18** |
| **BP** (Basic Prompting)     | :white_check_mark: 7/7 | :white_check_mark: 5/5 | :white_check_mark: 6/6   | **18/18** |
| **CE** (Context Engineering) | :white_check_mark: 7/7 | :white_check_mark: 5/5 | :white_check_mark: 6/6   | **18/18** |
| **CS** (Claude Sonnet)       | :white_check_mark: 7/7 | :white_check_mark: 5/5 | :white_check_mark: 6/6   | **18/18** |
| **SD** (Spec-Driven Dev)     | :white_check_mark: 7/7 | :white_check_mark: 5/5 | :white_check_mark: 11/11 | **23/23** |

> **Total: 95 tests passed, 0 failed across all 15 versions**

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
| IMAG01  | 0    | 0      | 0     | -                                      |
| IMCS01  | 0    | 0      | 0     | -                                      |
| PDAG01  | 0    | 0      | 0     | -                                      |
| PDCS01  | 0    | 0      | 0     | -                                      |
| SCAG01  | 0    | 0      | 0     | -                                      |
| SCCS01  | 0    | 0      | 0     | -                                      |
| IMSD01  | 0    | 0      | 0     | -                                      |
| SCSD01  | 0    | 0      | 0     | -                                      |
| PDSD01  | 0    | 0      | 0     | -                                      |
| SCBP01  | 0    | 0      | 0     | -                                      |
| PDBP01  | 0    | 0      | 0     | -                                      |

### CodeQL Alert Summary by Strategy

| Strategy                     | Total Alerts | High | Medium |
| ---------------------------- | ------------ | ---- | ------ |
| **AG** (AI-Generated)        | 0            | 0    | 0      |
| **BP** (Basic Prompting)     | 5            | 5    | 0      |
| **CE** (Context Engineering) | 11           | 9    | 2      |
| **CS** (Claude Sonnet)       | 0            | 0    | 0      |
| **SD** (Spec-Driven Dev)     | 0            | 0    | 0      |

---

## 3. DAST Security Scan (ZAP)

> Workflow run: [DAST #23089748932](https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/23089748932)
> Result: :white_check_mark: **ALL 15 VERSIONS SCANNED SUCCESSFULLY**

| Version | FAIL-NEW | WARN-NEW | PASS | Notable Warnings                                          |
| ------- | -------- | -------- | ---- | --------------------------------------------------------- |
| IMAG01  | 0        | 7        | 60   | Missing headers (CSP, X-Content-Type, Clickjacking, COEP) |
| IMBP01  | 0        | 7        | 60   | Missing headers (CSP, X-Content-Type, Clickjacking, COEP) |
| IMCE01  | 0        | 7        | 60   | Missing headers (CSP, X-Content-Type, Clickjacking, COEP) |
| IMCS01  | 0        | 8        | 59   | Missing headers + Server version leak                     |
| IMSD01  | 0        | 7        | 60   | Missing headers (CSP, X-Content-Type, Clickjacking, COEP) |
| SCAG01  | 0        | 7        | 60   | Missing headers (CSP, X-Content-Type, Clickjacking, COEP) |
| SCBP01  | 0        | 7        | 60   | Missing headers (CSP, X-Content-Type, Clickjacking, COEP) |
| SCCE01  | 0        | 8        | 59   | Missing headers + Server version leak                     |
| SCCS01  | 0        | 8        | 59   | Missing headers + Server version leak                     |
| SCSD01  | 0        | 7        | 60   | Missing headers (CSP, X-Content-Type, Clickjacking, COEP) |
| PDAG01  | 0        | 7        | 60   | Missing headers (CSP, X-Content-Type, Clickjacking, COEP) |
| PDBP01  | 0        | 8        | 59   | Missing headers + Server version leak                     |
| PDCE01  | 0        | 7        | 60   | Missing headers (CSP, X-Content-Type, Clickjacking, COEP) |
| PDCS01  | 0        | 7        | 60   | Missing headers (CSP, X-Content-Type, Clickjacking, COEP) |
| PDSD01  | 0        | 7        | 60   | Missing headers (CSP, X-Content-Type, Clickjacking, COEP) |

### Common ZAP Warnings (across all versions)

| Warning                                      | Rule ID | Severity      | Affected                              |
| -------------------------------------------- | ------- | ------------- | ------------------------------------- |
| Missing Anti-clickjacking Header             | 10020   | Medium        | 15/15                                 |
| X-Content-Type-Options Header Missing        | 10021   | Low           | 15/15                                 |
| Content Security Policy (CSP) Header Not Set | 10038   | Medium        | 15/15                                 |
| Storable but Non-Cacheable Content           | 10049   | Informational | 15/15                                 |
| Permissions Policy Header Not Set            | 10063   | Low           | 15/15                                 |
| Modern Web Application                       | 10109   | Informational | 15/15                                 |
| Cross-Origin-Embedder-Policy Header Missing  | 90004   | Medium        | 15/15                                 |
| Server Leaks Version Information             | 10036   | Low           | 4/15 (IMCS01, SCCE01, SCCS01, PDBP01) |

### DAST Summary by Strategy

| Strategy                     | Avg Warnings | Avg Pass | Server Leak          |
| ---------------------------- | ------------ | -------- | -------------------- |
| **AG** (AI-Generated)        | 7.0          | 60.0     | No                   |
| **BP** (Basic Prompting)     | 7.3          | 59.7     | 1/3 (PDBP01)         |
| **CE** (Context Engineering) | 7.3          | 59.7     | 1/3 (SCCE01)         |
| **CS** (Claude Sonnet)       | 7.7          | 59.3     | 2/3 (IMCS01, SCCS01) |
| **SD** (Spec-Driven Dev)     | 7.0          | 60.0     | No                   |

---

## Overall Summary

| Version | Tests                    | CodeQL Alerts | DAST (FAIL/WARN/PASS) |
| ------- | ------------------------ | ------------- | --------------------- |
| IMAG01  | :white_check_mark: 7/7   | 0 alerts      | 0/7/60                |
| IMBP01  | :white_check_mark: 7/7   | 5 high        | 0/7/60                |
| IMCE01  | :white_check_mark: 7/7   | 3 high, 1 med | 0/7/60                |
| IMCS01  | :white_check_mark: 7/7   | 0 alerts      | 0/8/59                |
| IMSD01  | :white_check_mark: 7/7   | 0 alerts      | 0/7/60                |
| SCAG01  | :white_check_mark: 5/5   | 0 alerts      | 0/7/60                |
| SCBP01  | :white_check_mark: 5/5   | 0 alerts      | 0/7/60                |
| SCCE01  | :white_check_mark: 5/5   | 6 high        | 0/8/59                |
| SCCS01  | :white_check_mark: 5/5   | 0 alerts      | 0/8/59                |
| SCSD01  | :white_check_mark: 5/5   | 0 alerts      | 0/7/60                |
| PDAG01  | :white_check_mark: 6/6   | 0 alerts      | 0/7/60                |
| PDBP01  | :white_check_mark: 6/6   | 0 alerts      | 0/8/59                |
| PDCE01  | :white_check_mark: 6/6   | 1 med         | 0/7/60                |
| PDCS01  | :white_check_mark: 6/6   | 0 alerts      | 0/7/60                |
| PDSD01  | :white_check_mark: 11/11 | 0 alerts      | 0/7/60                |

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
