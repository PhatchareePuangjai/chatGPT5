# CI/CD Test Results Summary

> Last updated: 2026-05-16
> Repository: [PhatchareePuangjai/chatGPT5](https://github.com/PhatchareePuangjai/chatGPT5)
> Actions: [All Workflows](https://github.com/PhatchareePuangjai/chatGPT5/actions)

---

> **Note on SCSD01_v2:** ปรากฏในตาราง version เพื่อความสมบูรณ์ของข้อมูล แต่**ไม่รวมในทุก strategy-level summary** เนื่องจากสร้างขึ้นเพื่อทดสอบ reproducibility เท่านั้น ไม่ได้เป็นส่วนหนึ่งของการวิเคราะห์เปรียบเทียบ

---

## 1. Unit Tests

> Workflow run: [Unit Tests #23089850265](https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/23089850265) — CI jobs passed (IMBP02: local run only, CI skipped — paths-filter)
> Source: `test_report.md` in each version directory

| Version | Feature                | Tool   | Passed | Failed | Total | Result                  | Failure Details                                           |
| ------- | ---------------------- | ------ | ------ | ------ | ----- | ----------------------- | --------------------------------------------------------- |
| IMBP01  | Inventory Management   | Jest   | 7      | 0      | 7     | :white_check_mark: PASS | —                                                         |
| IMBP02  | Inventory Management   | Jest   | 5      | 2      | 7     | ⚠️ PARTIAL              | Restock 404 (not implemented); threshold `< 5` vs `<= 5` |
| IMCE01  | Inventory Management   | Jest   | 7      | 0      | 7     | :white_check_mark: PASS | —                                                         |
| IMSD01  | Inventory Management   | pytest | 17     | 0      | 17    | :white_check_mark: PASS | scenarios: 7, contract: 2, unit: 4, integration: 4        |
| SCBP01  | Shopping Cart          | Jest   | 5      | 0      | 5     | :white_check_mark: PASS | —                                                         |
| SCBP02  | Shopping Cart          | Jest   | 4      | 1      | 5     | ⚠️ PARTIAL              | No stock validation (Edge 1: add > stock accepted)        |
| SCCE01  | Shopping Cart          | Jest   | 5      | 0      | 5     | :white_check_mark: PASS | —                                                         |
| SCSD01  | Shopping Cart          | pytest | 16     | 0      | 16    | :white_check_mark: PASS | scenarios: 5, unit: 8, integration: 3                     |
| PDBP01  | Promotions & Discounts | Jest   | 6      | 0      | 6     | :white_check_mark: PASS | —                                                         |
| PDCE01  | Promotions & Discounts | Jest   | 6      | 0      | 6     | :white_check_mark: PASS | —                                                         |
| PDSD01  | Promotions & Discounts | pytest | 18     | 0      | 18    | :white_check_mark: PASS | scenarios: 6, unit: 7, integration: 5                     |

### Test Summary by Strategy

| Strategy                     | Passed | Failed | Total | Pass Rate |
| ---------------------------- | ------ | ------ | ----- | --------- |
| **BP** (Basic Prompting)     | 27     | 3      | 30    | 90%       |
| **CE** (Context Engineering) | 18     | 0      | 18    | 100%      |
| **SD** (Spec-Driven Dev)     | 51     | 0      | 51    | 100%      |

---

## 2. SonarQube Static Analysis

> SDD SonarQube values in this section were updated from the latest results in `Evaluating AI-Generated Code Quality from Basic Prompting to Spec-Driven Development - High-Quality Code (1).csv`.

### SonarQube Open Issues by Version

| Version   | Security (Open) | Reliability (Open) | Maintainability (Open) | Duplications |
| --------- | --------------- | ------------------ | ---------------------- | ------------ |
| IMBP01    | 0               | 3                  | 7                      | 6.90%        |
| IMBP02    | 2               | 0                  | 1                      | 0.00%        |
| IMCE01    | 0               | 19                 | 26                     | 0.00%        |
| IMSD01    | 0               | 12                 | 15                     | 3.30%        |
| SCBP01    | 0               | 9                  | 18                     | 5.40%        |
| SCBP02    | 6               | 1                  | 2                      | 0.00%        |
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
| **BP** (Basic Prompting)     | 1.6          | 2.8             | 7.6                 | 2.74%            |
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
| IMBP02  | 0    | 0      | 0     | -                                      |
| IMCE01  | 3    | 1      | 4     | Missing rate limiting, Permissive CORS |
| IMSD01  | 0    | 0      | 0     | -                                      |
| SCBP01  | 0    | 0      | 0     | -                                      |
| SCBP02  | 0    | 0      | 0     | -                                      |
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

> Workflow run: [DAST #25560722631](https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/25560722631)
> Result: :white_check_mark: **11/11 JOBS SCANNED**

| Version | FAIL-NEW | WARN-NEW | PASS | Notable Warnings                                                                  |
| ------- | -------- | -------- | ---- | --------------------------------------------------------------------------------- |
| IMBP01  | 0        | 7        | 60   | Missing headers                                                                   |
| IMBP02  | 0        | 10       | 57   | Missing headers + Cross-Domain Misconfiguration + Permissions Policy              |
| IMCE01  | 0        | 7        | 60   | Missing headers                                                                   |
| IMSD01  | 0        | 7        | 60   | Missing headers                                                                   |
| PDBP01  | 0        | 8        | 59   | Missing headers + Server version leak                                             |
| PDCE01  | 0        | 7        | 60   | Missing headers                                                                   |
| PDSD01  | 0        | 9        | 58   | Missing headers + Server version leak + In Page Banner Information Leak [10009]   |
| SCBP01  | 0        | 7        | 60   | Missing headers                                                                   |
| SCBP02  | 0        | 5        | 62   | Storable and Cacheable Content [10049] + CSP Failure [10055] + Permissions Policy [10063] + Cross-Domain Misconfiguration [10098] |
| SCCE01  | 0        | 8        | 59   | Missing headers + Server version leak                                             |
| SCSD01  | 0        | 8        | 59   | Missing headers + Sub Resource Integrity Attribute Missing [90003]                |

### Common ZAP Warnings (across all versions)

| Warning                                            | Rule ID | Severity      | Affected (11 scanned)                      |
| -------------------------------------------------- | ------- | ------------- | ------------------------------------------ |
| Missing Anti-clickjacking Header                   | 10020   | Medium        | 11/11                                      |
| Content Security Policy (CSP) Header Not Set       | 10038   | Medium        | 11/11                                      |
| Cross-Origin-Embedder-Policy Header Missing        | 90004   | Low           | 11/11                                      |
| Permissions Policy Header Not Set                  | 10063   | Low           | 11/11                                      |
| X-Content-Type-Options Header Missing              | 10021   | Low           | 11/11                                      |
| Modern Web Application                             | 10109   | Informational | 11/11                                      |
| Storable but Non-Cacheable Content                 | 10049   | Informational | 7/11                                       |
| Storable and Cacheable Content                     | 10049   | Informational | 3/10 (SCCE01, PDBP01, PDSD01)             |
| Server Leaks Version Information                   | 10036   | Low           | 3/10 (SCCE01, PDBP01, PDSD01)             |
| In Page Banner Information Leak                    | 10009   | Low           | 1/11 (PDSD01)                              |
| Sub Resource Integrity Attribute Missing           | 90003   | Medium        | 1/11 (SCSD01)                              |

### DAST Summary by Strategy

| Strategy                     | Avg Warnings | Avg Pass | Server Leak              | Scan Status                          |
| ---------------------------- | ------------ | -------- | ------------------------ | ------------------------------------ |
| **BP** (Basic Prompting)     | 7.4          | 59.6     | 1/5 (PDBP01)             | 5/5 scanned                          |
| **CE** (Context Engineering) | 7.3          | 59.7     | 1/3 (SCCE01)             | 3/3 scanned                          |
| **SD** (Spec-Driven Dev)     | 8.0          | 59.0     | 1/3 (PDSD01)             | 3/3 scanned                          |

---

## Overall Summary

| Version   | Tests                      | CodeQL Alerts | DAST (FAIL/WARN/PASS) | SonarQube (Sec/Rel/Maint) | Duplications | Backend LOC ² | Frontend LOC ³ | Avg LOC/File |
| --------- | -------------------------- | ------------- | --------------------- | ------------------------- | ------------ | ------------- | -------------- | ------------ |
| IMBP01    | :white_check_mark: 7/7     | 5 high        | 0/7/60                | 0 / 3 / 7                 | 6.90%        | 251           | 404            | 62.8         |
| IMBP02    | ⚠️ 5/7 (local, 2 fail)     | 0 alerts      | 0/10/57               | 2 / 0 / 1                 | 0.00%        | 85            | 80             | 28.3         |
| IMCE01    | :white_check_mark: 7/7     | 3 high, 1 med | 0/7/60                | 0 / 19 / 26               | 0.00%        | 228           | 1,115          | 114.0        |
| IMSD01    | :white_check_mark: 17/17 ¹ | 0 alerts      | 0/7/60                | 0 / 12 / 15               | 3.30%        | 398           | 318            | 15.9         |
| SCBP01    | :white_check_mark: 5/5     | 0 alerts      | 0/7/60                | 0 / 9 / 18                | 5.40%        | 406           | 358            | 67.7         |
| SCBP02    | ⚠️ 4/5 (CI, 1 fail)        | 0 alerts      | 0/5/62                | 6 / 1 / 2                 | 0.00%        | 87            | 88             | 29.0         |
| SCCE01    | :white_check_mark: 5/5     | 6 high        | 0/8/59                | 0 / 9 / 12                | 4.30%        | 409           | 457            | 204.5        |
| SCSD01    | :white_check_mark: 16/16 ¹ | 0 alerts      | 0/8/59                | 1 / 0 / 5                 | 26.90%       | 208           | 988            | 34.7         |
| SCSD01_v2 | :white_check_mark: 15/15 ¹ | 0 alerts      | —                     | 0 / 4 / 25                | 0.00%        | 493           | 357            | 41.1         |
| PDBP01    | :white_check_mark: 6/6     | 0 alerts      | 0/8/59                | 0 / 1 / 10                | 1.40%        | 365           | 805            | 60.8         |
| PDCE01    | :white_check_mark: 6/6     | 1 med         | 0/7/60                | 0 / 16 / 20               | 0.00%        | 305           | 249            | 43.6         |
| PDSD01    | :white_check_mark: 18/18 ¹ | 0 alerts      | 0/9/58                | 1 / 6 / 9                 | 0.00%        | 296           | 171            | 32.8         |

> ¹ Full test suite (scenario + unit + integration) from local verification on 2026-04-04 / 2026-04-05, reported using the document counting convention above. SonarQube values updated from CSV source.
> ² Backend LOC: counted from **backend production source files only** (`.py` / `.js`), excluding `node_modules`, `tests/`, test files (`test_*`, `*.test.js`, `*.spec.js`), and all frontend files (folders: `frontend/`, `client/`, `public/`; files: `.html`, `.css`, `.jsx`, and client-side `.js` without server logic). Avg LOC/File = Backend LOC ÷ number of backend source files.
> ³ Frontend LOC: counted from frontend source files (`.jsx`, `.tsx`, `.html`, `.js` in `frontend/`, `client/`, or `public/` folders; `.css` excluded). IMBP02 has no dedicated frontend folder — value reflects only the `index.html` embedded UI. Note: SonarQube and CodeQL scans include frontend code; this metric is provided for completeness only.

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
| IMBP01  | BP       | GPT-5 (gpt-5-2) | 1 | 4 | 7 | 341 |
| IMBP02  | BP       | GPT-5 (gpt-5-2-instant) | 1 | 2 | 3 | 144 |
| SCBP01  | BP       | GPT-5 (gpt-5-2) | 1 | 5 | 5 | 836 |
| SCBP02  | BP       | GPT-5 (gpt-5-2-instant) | 1 | 2 | 5 | 177 |
| PDBP01  | BP       | GPT-5 (gpt-5-2) | 1 | 2 | 2 | 618 |
| IMCE01  | CE       | GPT-5 (gpt-5-2) | 1 | 8 | 12 | 927 |
| SCCE01  | CE       | GPT-5 (gpt-5-2) | 1 | 3 | 3 | 463 |
| PDCE01  | CE       | GPT-5 (gpt-5-2) | 1 | 1 | 1 | 531 |
| IMSD01  | SDD      | Codex CLI | N/A | 13 | 12 | 296 ⁴ |
| SCSD01  | SDD      | Codex CLI | N/A | 23 | 20 | 353 ⁴ |
| PDSD01  | SDD      | Codex CLI | N/A | 14 | 13 | 170 ⁴ |

### Interaction Summary by Strategy

| Strategy | Total Conversations | Total User Turns | Total AI Turns | User Prompt Tokens ³ |
| -------- | ------------------- | ---------------- | -------------- | -------------------- |
| **BP** (Basic Prompting) | 5 | 15 | 22 | 2,116 |
| **CE** (Context Engineering) | 3 | 12 | 16 | 1,921 |
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
| Latest Unit Tests Run    | https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/25304296735           |
| Latest CodeQL Run        | https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/24025305539           |
| Latest DAST Run          | https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/25560722631           |
