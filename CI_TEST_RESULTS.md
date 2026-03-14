# CI/CD Test Results Summary

> Last updated: 2026-03-14
> Repository: [PhatchareePuangjai/chatGPT5](https://github.com/PhatchareePuangjai/chatGPT5)
> Actions: [All Workflows](https://github.com/PhatchareePuangjai/chatGPT5/actions)

---

## 1. Unit Tests & Integration Tests

> Workflow run: [Unit Tests #23086206414](https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/23086206414)

### Backend Unit Tests (BP / CE / SD)

| Version | Feature                | Result                  | Passed | Failed | Total | Details                                                                                             |
| ------- | ---------------------- | ----------------------- | ------ | ------ | ----- | --------------------------------------------------------------------------------------------------- |
| IMBP01  | Inventory Management   | :white_check_mark: PASS | 7      | 0      | 7     | [Log](https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/23086206414/job/Unit+Test+IMBP01) |
| SCBP01  | Shopping Cart          | :x: FAIL                | 0      | 0      | 0     | Test suite error (ไม่สามารถ load test ได้)                                                          |
| PDBP01  | Promotions & Discounts | :x: FAIL                | 0      | 0      | 0     | Test suite error (ไม่สามารถ load test ได้)                                                          |
| IMCE01  | Inventory Management   | :white_check_mark: PASS | 7      | 0      | 7     | [Log](https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/23086206414/job/Unit+Test+IMCE01) |
| SCCE01  | Shopping Cart          | :x: FAIL                | 0      | 5      | 5     | ทุก test case fail                                                                                  |
| PDCE01  | Promotions & Discounts | :white_check_mark: PASS | 6      | 0      | 6     | [Log](https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/23086206414/job/Unit+Test+PDCE01) |
| IMSD01  | Inventory Management   | :white_check_mark: PASS | 7      | 0      | 7     | [Log](https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/23086206414/job/Unit+Test+IMSD01) |
| SCSD01  | Shopping Cart          | :x: FAIL                | 0      | 0      | 0     | Test suite error (ไม่สามารถ load test ได้)                                                          |
| PDSD01  | Promotions & Discounts | :warning: PARTIAL       | 5      | 6      | 11    | 2 suites pass, 1 suite fail                                                                         |
| PDCS01  | Promotions & Discounts | :x: FAIL                | -      | -      | -     | Setup Node.js error (ไม่พบ package-lock.json)                                                       |

### Integration Tests (AG / CS — via Docker Compose)

| Version | Feature                | Result                  | Passed | Failed | Total | Details                                                                                                                |
| ------- | ---------------------- | ----------------------- | ------ | ------ | ----- | ---------------------------------------------------------------------------------------------------------------------- |
| IMAG01  | Inventory Management   | :white_check_mark: PASS | 7      | 0      | 7     | [Log](https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/23086206414/job/Integration+Test+IMAG01)             |
| IMCS01  | Inventory Management   | :white_check_mark: PASS | 7      | 0      | 7     | [Log](https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/23086206414/job/Integration+Test+IMCS01)             |
| PDAG01  | Promotions & Discounts | :white_check_mark: PASS | 6      | 0      | 6     | [Log](https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/23086206414/job/Integration+Test+PDAG01)             |
| PDCS01  | Promotions & Discounts | :white_check_mark: PASS | 6      | 0      | 6     | [Log](https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/23086206414/job/Integration+Test+PDCS01-integration) |
| SCAG01  | Shopping Cart          | :white_check_mark: PASS | 5      | 0      | 5     | [Log](https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/23086206414/job/Integration+Test+SCAG01)             |
| SCCS01  | Shopping Cart          | :white_check_mark: PASS | 5      | 0      | 5     | [Log](https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/23086206414/job/Integration+Test+SCCS01)             |

### Test Summary by Prompting Strategy

| Strategy                     | IM (Inventory)         | SC (Shopping Cart)     | PD (Promotions)        |
| ---------------------------- | ---------------------- | ---------------------- | ---------------------- |
| **AG** (AI-Generated)        | :white_check_mark: 7/7 | :white_check_mark: 5/5 | :white_check_mark: 6/6 |
| **BP** (Basic Prompting)     | :white_check_mark: 7/7 | :x: 0/0 suite error    | :x: 0/0 suite error    |
| **CE** (Context Engineering) | :white_check_mark: 7/7 | :x: 0/5 all fail       | :white_check_mark: 6/6 |
| **CS** (Claude Sonnet)       | :white_check_mark: 7/7 | :white_check_mark: 5/5 | :white_check_mark: 6/6 |
| **SD** (Spec-Driven Dev)     | :white_check_mark: 7/7 | :x: 0/0 suite error    | :warning: 5/11 partial |

---

## 2. CodeQL Static Analysis (SAST)

> Workflow run: [CodeQL #23085624154](https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/23085624154)
> Security alerts: [Code Scanning Alerts](https://github.com/PhatchareePuangjai/chatGPT5/security/code-scanning)

| Language              | Result                  |
| --------------------- | ----------------------- |
| JavaScript/TypeScript | :white_check_mark: PASS |
| Python                | :white_check_mark: PASS |

### Security Alerts by Version

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

> Workflow run: [DAST #23085624160](https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/23085624160)

| Version         | Result          | Note                                                      |
| --------------- | --------------- | --------------------------------------------------------- |
| All 15 versions | :warning: ERROR | `PermissionError: Permission denied: '/zap/wrk/zap.yaml'` |

> **Note:** ทุก version เจอ error เดียวกัน — ZAP ไม่สามารถเขียนไฟล์ `zap.yaml` ได้เนื่องจาก permission ของ Docker volume mount
> Workflow แสดง "success" เพราะตั้ง `fail_action: false` ไว้ แต่จริง ๆ scan ไม่ได้ทำงาน

---

## Overall Summary

| Version | Unit/Integration Test                     | CodeQL Alerts | DAST                |
| ------- | ----------------------------------------- | ------------- | ------------------- |
| IMAG01  | :white_check_mark: 7/7 pass               | 0 alerts      | :warning: ZAP error |
| IMBP01  | :white_check_mark: 7/7 pass               | 5 high        | :warning: ZAP error |
| IMCE01  | :white_check_mark: 7/7 pass               | 3 high, 1 med | :warning: ZAP error |
| IMCS01  | :white_check_mark: 7/7 pass               | 0 alerts      | :warning: ZAP error |
| IMSD01  | :white_check_mark: 7/7 pass               | 0 alerts      | :warning: ZAP error |
| SCAG01  | :white_check_mark: 5/5 pass               | 0 alerts      | :warning: ZAP error |
| SCBP01  | :x: suite error                           | 0 alerts      | :warning: ZAP error |
| SCCE01  | :x: 0/5 fail                              | 6 high        | :warning: ZAP error |
| SCCS01  | :white_check_mark: 5/5 pass               | 0 alerts      | :warning: ZAP error |
| SCSD01  | :x: suite error                           | 0 alerts      | :warning: ZAP error |
| PDAG01  | :white_check_mark: 6/6 pass               | 0 alerts      | :warning: ZAP error |
| PDBP01  | :x: suite error                           | 0 alerts      | :warning: ZAP error |
| PDCE01  | :white_check_mark: 6/6 pass               | 1 med         | :warning: ZAP error |
| PDCS01  | :white_check_mark: 6/6 pass (integration) | 0 alerts      | :warning: ZAP error |
| PDSD01  | :warning: 5/11 partial                    | 0 alerts      | :warning: ZAP error |

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
| Latest Unit Tests Run    | https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/23086206414           |
| Latest CodeQL Run        | https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/23085624154           |
| Latest DAST Run          | https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/23085624160           |
