# CI/CD Test Results Summary

> Last updated: 2026-06-01 (full recheck: Unit Tests #26735096014, SonarQube #26735096015, DAST #26735096020, CodeQL #26735096022; all 19 versions now scanned by DAST)
> SCSD01 refresh 2026-06-01: Unit Tests #26764446595 (CI vitest 8/8), DAST #26763971867 (0/7/60). SonarQube metrics retained — local SONAR_TOKEN returned HTTP 401 (invalid).
> Repository: [PhatchareePuangjai/chatGPT5](https://github.com/PhatchareePuangjai/chatGPT5)
> Actions: [All Workflows](https://github.com/PhatchareePuangjai/chatGPT5/actions)

---

> **Note on SCSD01_v2:** ปรากฏในตาราง version เพื่อความสมบูรณ์ของข้อมูล แต่**ไม่รวมในทุก strategy-level summary** เนื่องจากสร้างขึ้นเพื่อทดสอบ reproducibility เท่านั้น ไม่ได้เป็นส่วนหนึ่งของการวิเคราะห์เปรียบเทียบ

---

## 1. Unit Tests

> Workflow run: [Unit Tests #26735096014](https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/26735096014)
> Note: most jobs skipped by path filter (only versions with changed files re-run); counts sourced from `test_report.md` per version for unchanged versions.

| Version | Feature | Tool | Passed | Failed | Total | Result | Failure Details |
| --- | --- | --- | --- | --- | --- | --- | --- |
| IMBP01 | Inventory Management | Jest | 7 | 0 | 7 | :white_check_mark: PASS | — |
| IMBP02 | Inventory Management | Jest | 5 | 2 | 7 | ⚠️ PARTIAL | Restock 404 (not implemented); threshold `< 5` vs `<= 5` |
| IMCE01 | Inventory Management | Jest | 7 | 0 | 7 | :white_check_mark: PASS | — |
| IMCE02 | Inventory Management | Jest | 7 | 0 | 7 | :white_check_mark: PASS | Stock deduct/restore pass; InventoryLog & low-stock alert not implemented (noted in comments) |
| IMSD01 | Inventory Management | vitest | 11 | 1 | 12 | ⚠️ PARTIAL | Atomicity rollback test: HTTP 400 returned where 500 was expected |
| IMSD02 | Inventory Management | vitest | 8 | 0 | 8 | :white_check_mark: PASS | unit: 2, integration: 6 (requires --maxWorkers=1) |
| SCBP01 | Shopping Cart | Jest | 5 | 0 | 5 | :white_check_mark: PASS | — |
| SCBP02 | Shopping Cart | Jest | 4 | 1 | 5 | ⚠️ PARTIAL | No stock validation (Edge 1: add > stock accepted) |
| SCCE01 | Shopping Cart | Jest | 5 | 0 | 5 | :white_check_mark: PASS | — |
| SCCE02 | Shopping Cart | node:test | 0 | 5 | 5 | :x: FAIL | Missing add/update/save-for-later/stock-validation workflows; only GET cart is implemented |
| SCSD01 | Shopping Cart | vitest | 8 | 0 | 8 | :white_check_mark: PASS | CI: integration/contract/unit (7 files, 8 tests) |
| SCSD02 | Shopping Cart | vitest | 10 | 0 | 10 | :white_check_mark: PASS | backend: 8, frontend: 2 |
| PDBP01 | Promotions & Discounts | Jest | 6 | 0 | 6 | :white_check_mark: PASS | — |
| PDBP02 | Promotions & Discounts | Jest | 1 | 5 | 6 | ⚠️ PARTIAL | Missing min purchase, auto-discount, usage limit, ordering, negative total guard |
| PDCE01 | Promotions & Discounts | Jest | 6 | 0 | 6 | :white_check_mark: PASS | — |
| PDCE02 | Promotions & Discounts | node:test | 5 | 0 | 6 | ⚠️ PARTIAL | 1 TODO / expected failure: usage limit not implemented |
| PDSD01 | Promotions & Discounts | vitest | 11 | 0 | 11 | :white_check_mark: PASS | — |
| PDSD02 | Promotions & Discounts | Jest | 8 | 1 | 9 | ⚠️ PARTIAL | applyCoupon grandTotal mismatch — demo-cart has active promo when testing coupon only |

### Test Summary by Strategy

| Strategy                     | Passed | Failed | Total | Pass Rate |
| ---------------------------- | ------ | ------ | ----- | --------- |
| **BP** (Basic Prompting)     | 28     | 8      | 36    | 78%       |
| **CE** (Context Engineering) | 30     | 5      | 36    | 83%       |
| **SD** (Spec-Driven Dev)     | 56     | 2      | 58    | 97%       |

---

## 2. SonarQube Static Analysis

> SDD SonarQube values in this section were updated from the latest results in `Evaluating AI-Generated Code Quality from Basic Prompting to Spec-Driven Development - High-Quality Code (1).csv`.
> IMSD01 SonarQube workflow run #26698243746 completed successfully; direct SonarCloud API verification returned HTTP 401 with the current local token, so the existing SonarQube metric values are retained.

### SonarQube Open Issues by Version

| Version   | Security (Open) | Reliability (Open) | Maintainability (Open) | Duplications | Security Hotspots |
| --------- | --------------- | ------------------ | ---------------------- | ------------ | ----------------- |
| IMBP01    | 3               | 3                  | 7                      | 6.10%        | 0                 |
| IMBP02    | 2               | 1                  | 1                      | 0.00%        | 0                 |
| IMCE01    | 7               | 19                 | 27                     | 0.00%        | 6                 |
| IMCE02    | 16              | 2                  | 1                      | 5.40%        | 4                 |
| IMSD01    | 7               | 12                 | 15                     | 2.70%        | 2                 |
| IMSD02    | 5               | 0                  | 6                      | 13.20%       | 2                 |
| SCBP01    | 9               | 9                  | 20                     | 4.70%        | 2                 |
| SCBP02    | 6               | 2                  | 2                      | 0.00%        | 1                 |
| SCCE01    | 8               | 9                  | 11                     | 3.80%        | 2                 |
| SCCE02    | 9               | 2                  | 1                      | 0.00%        | 4                 |
| SCSD01    | 7               | 0                  | 5                      | 21.90%       | 3                 |
| SCSD02    | 1               | 0                  | 19                     | 0.00%        | 1                 |
| SCSD01_v2 | 7               | 4                  | 25                     | 0.00%        | 4                 |
| PDBP01    | 8               | 1                  | 9                      | 1.30%        | 3                 |
| PDBP02    | 6               | 3                  | 2                      | 0.00%        | 2                 |
| PDCE01    | 6               | 16                 | 20                     | 0.00%        | 4                 |
| PDCE02    | 9               | 0                  | 8                      | 0.00%        | 4                 |
| PDSD01    | 5               | 6                  | 9                      | 0.00%        | 5                 |
| PDSD02    | 1               | 0                  | 13                     | 0.00%        | 0                 |

> CS and AG versions are excluded from this SonarQube summary to match the current workflow scope.

### SonarQube Summary by Strategy

| Strategy                     | Avg Security | Avg Reliability | Avg Maintainability | Avg Duplications | Avg Security Hotspots |
| ---------------------------- | ------------ | --------------- | ------------------- | ---------------- | --------------------- |
| **BP** (Basic Prompting)     | 5.67         | 3.17            | 6.83                | 2.02%            | 1.33                  |
| **CE** (Context Engineering) | 9.17         | 8.00            | 11.33               | 1.53%            | 4.00                  |
| **SD** (Spec-Driven Dev)     | 4.33         | 3.00            | 11.17               | 6.30%            | 2.17                  |

---

## 3. CodeQL Static Analysis (SAST)

> Workflow run: [CodeQL #26735096022](https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/26735096022)
> Security alerts: [Code Scanning Alerts](https://github.com/PhatchareePuangjai/chatGPT5/security/code-scanning)

| Language              | Result                  |
| --------------------- | ----------------------- |
| JavaScript/TypeScript | :white_check_mark: PASS |
| Python                | :white_check_mark: PASS |

### Security Alerts by Version (Open)

| Version | High | Medium | Total | Details |
| --- | --- | --- | --- | --- |
| IMBP01 | 5 | 0 | 5 | Missing rate limiting |
| IMBP02 | 0 | 0 | 0 | - |
| IMCE01 | 3 | 1 | 4 | Missing rate limiting, Permissive CORS |
| IMCE02 | 6 | 0 | 6 | Missing rate limiting |
| IMSD01 | 1 | 0 | 1 | Missing rate limiting |
| IMSD02 | 0 | 0 | 0 | - |
| SCBP01 | 0 | 0 | 0 | - |
| SCBP02 | 0 | 0 | 0 | - |
| SCCE01 | 6 | 0 | 6 | Missing rate limiting |
| SCCE02 | 1 | 0 | 1 | Missing rate limiting |
| SCSD01 | 0 | 0 | 0 | - |
| SCSD02 | 0 | 0 | 0 | - |
| PDBP01 | 0 | 0 | 0 | - |
| PDBP02 | 1 | 0 | 1 | Missing rate limiting |
| PDCE01 | 0 | 1 | 1 | Permissive CORS configuration |
| PDCE02 | 1 | 0 | 1 | Missing rate limiting |
| PDSD01 | 0 | 2 | 2 | Prototype pollution (js/prototype-polluting-assignment) |
| PDSD02 | 0 | 0 | 0 | - |

### CodeQL Alert Summary by Strategy

| Strategy                     | Total Alerts | High | Medium |
| ---------------------------- | ------------ | ---- | ------ |
| **BP** (Basic Prompting)     | 6            | 6    | 0      |
| **CE** (Context Engineering) | 19           | 17   | 2      |
| **SD** (Spec-Driven Dev)     | 3            | 1    | 2      |

---

## 4. DAST Security Scan (ZAP)

> Workflow run: [DAST #26735096020](https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/26735096020) — all 19 versions scanned successfully.

| Version | FAIL-NEW | WARN-NEW | PASS | Notable Warnings |
| --- | --- | --- | --- | --- |
| IMBP01 | 0 | 7 | 60 | Missing headers |
| IMBP02 | 0 | 11 | 56 | Missing headers + Suspicious comments + X-Powered-By leak + CSP fallback + Cross-Domain Misconfiguration |
| IMCE01 | 0 | 7 | 60 | Missing headers |
| IMCE02 | 0 | 5 | 62 | X-Powered-By leak |
| IMSD01 | 0 | 7 | 60 | Missing headers |
| IMSD02 | 0 | 4 | 63 | X-Powered-By leak [10037] + Cacheable Content [10049] + CSP failure [10055] + Permissions Policy [10063] |
| PDBP01 | 0 | 8 | 59 | Missing headers + Server version leak |
| PDBP02 | 0 | 5 | 62 | X-Powered-By leak + Cacheable Content + CSP fallback + Permissions Policy + Cross-Domain Misconfiguration |
| PDCE01 | 0 | 7 | 60 | Missing headers |
| PDCE02 | 0 | 11 | 56 | Missing headers + Suspicious comments + X-Powered-By leak + Cacheable + CSP fallback + Cross-Domain Misconfiguration |
| PDSD01 | 0 | 7 | 60 | Missing headers |
| PDSD02 | 0 | 7 | 60 | Missing headers |
| SCBP01 | 0 | 7 | 60 | Missing headers |
| SCBP02 | 0 | 5 | 62 | X-Powered-By leak + Cacheable Content [10049] + CSP Failure [10055] + Permissions Policy [10063] + Cross-Domain Misconfiguration [10098] |
| SCCE01 | 0 | 8 | 59 | Missing headers + Server version leak |
| SCCE02 | 0 | 11 | 56 | Missing headers + X-Powered-By leak + Suspicious comments + Cacheable content + Cross-Domain Misconfiguration |
| SCSD01 | 0 | 7 | 60 | Missing headers |
| SCSD01_v2 | 0 | 7 | 60 | Missing headers |
| SCSD02 | 0 | 7 | 60 | Missing headers |

### Common ZAP Warnings (legacy 12-version baseline)

| Warning | Rule ID | Severity | Affected (legacy 12 scanned) |
| --- | --- | --- | --- |
| Missing Anti-clickjacking Header | 10020 | Medium | 11/12 |
| Content Security Policy (CSP) Header Not Set | 10038 | Medium | 11/12 |
| Cross-Origin-Embedder-Policy Header Missing | 90004 | Low | 11/12 |
| Permissions Policy Header Not Set | 10063 | Low | 12/12 |
| X-Content-Type-Options Header Missing | 10021 | Low | 11/12 |
| Modern Web Application | 10109 | Informational | 11/12 |
| Storable but Non-Cacheable Content | 10049 | Informational | 7/12 |
| Storable and Cacheable Content | 10049 | Informational | 4/12 (SCCE01, PDBP01, PDBP02, PDSD01) |
| Server Leaks Version Information | 10036 | Low | 3/12 (SCCE01, PDBP01, PDSD01) |
| In Page Banner Information Leak | 10009 | Low | 1/12 (PDSD01) |
| Sub Resource Integrity Attribute Missing | 90003 | Medium | 1/12 (SCSD01) |
| X-Powered-By Header Information Leak | 10037 | Low | 1/12 (PDBP02) |

### DAST Summary by Strategy

| Strategy | Avg Warnings | Avg Pass | Server Leak | Scan Status |
| --- | --- | --- | --- | --- |
| **BP** (Basic Prompting) | 7.2 | 59.8 | 3/6 (IMBP02, PDBP01, PDBP02) | 6/6 scanned |
| **CE** (Context Engineering) | 8.2 | 58.8 | 4/6 (IMCE02, SCCE01, SCCE02, PDCE02) | 6/6 scanned |
| **SD** (Spec-Driven Dev) | 6.5 | 60.5 | 1/6 (IMSD02) | 6/6 scanned |

---

## Overall Summary

| Version | Tests | CodeQL Alerts | DAST (FAIL/WARN/PASS) | SonarQube (Sec/Rel/Maint) | Duplications | Backend LOC ² | Frontend LOC ³ | Avg LOC/File |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| IMBP01 | :white_check_mark: 7/7 | 5 high | 0/7/60 | 3 / 3 / 7 | 6.10% | 251 | 404 | 62.8 |
| IMBP02 | ⚠️ 5/7 (local, 2 fail) | 0 alerts | 0/11/56 | 2 / 1 / 1 | 0.00% | 85 | 80 | 28.3 |
| IMCE01 | :white_check_mark: 7/7 | 3 high, 1 med | 0/7/60 | 7 / 19 / 27 | 0.00% | 228 | 1,115 | 114.0 |
| IMCE02 | :white_check_mark: 7/7 | 6 high | 0/5/62 | 16 / 2 / 1 | 5.40% | 58 | 60 | 58.0 |
| IMSD01 | ⚠️ 11/12 (local, 1 fail) | 1 high | 0/7/60 | 7 / 12 / 15 | 2.70% | 469 | 396 | 24.7 |
| IMSD02 | :white_check_mark: 8/8 ¹ | 0 alerts | 0/4/63 | 5 / 0 / 6 | 13.20% | 622 | 304 | 29.6 |
| SCBP01 | :white_check_mark: 5/5 | 0 alerts | 0/7/60 | 9 / 9 / 20 | 4.70% | 406 | 358 | 67.7 |
| SCBP02 | ⚠️ 4/5 (CI, 1 fail) | 0 alerts | 0/5/62 | 6 / 2 / 2 | 0.00% | 87 | 88 | 29.0 |
| SCCE01 | :white_check_mark: 5/5 | 6 high | 0/8/59 | 8 / 9 / 11 | 3.80% | 409 | 457 | 204.5 |
| SCCE02 | :x: 0/5 (local, 5 fail) | 1 high | 0/11/56 | 9 / 2 / 1 | 0.00% | 65 | 70 | 16.3 |
| SCSD01 | :white_check_mark: 8/8 (CI) | 0 alerts | 0/7/60 | 7 / 0 / 5 | 21.90% | 479 | 273 | 26.6 |
| SCSD02 | :white_check_mark: 10/10 ¹ | 0 alerts | 0/7/60 | 1 / 0 / 19 | 0.00% | 632 | 369 | 42.1 |
| SCSD01_v2 | :white_check_mark: 15/15 ¹ | 0 alerts | 0/7/60 | 7 / 4 / 25 | 0.00% | 493 | 357 | 41.1 |
| PDBP01 | :white_check_mark: 6/6 | 0 alerts | 0/8/59 | 8 / 1 / 9 | 1.30% | 365 | 805 | 60.8 |
| PDBP02 | ⚠️ 1/6 (CI, 5 fail) | 1 high | 0/5/62 | 6 / 3 / 2 | 0.00% | 93 | 81 | 23.3 |
| PDCE01 | :white_check_mark: 6/6 | 1 med | 0/7/60 | 6 / 16 / 20 | 0.00% | 305 | 249 | 43.6 |
| PDCE02 | ⚠️ 5/6 (CI, 1 todo) | 1 high | 0/11/56 | 9 / 0 / 8 | 0.00% | 90 | 73 | 18.0 |
| PDSD01 | :white_check_mark: 11/11 | 0 high, 2 med | 0/7/60 | 5 / 6 / 9 | 0.00% | 296 | 171 | 32.8 |
| PDSD02 | ⚠️ 8/9 (local, 1 fail) | 0 alerts | 0/7/60 | 1 / 0 / 13 | 0.00% | 429 | 176 | 23.8 |

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
| IMBP02  | BP       | GPT-5 (gpt-5-2) | 1 | 2 | 3 | 144 |
| SCBP01  | BP       | GPT-5 (gpt-5-2) | 1 | 5 | 5 | 836 |
| SCBP02  | BP       | GPT-5 (gpt-5-2) | 1 | 2 | 5 | 177 |
| PDBP01  | BP       | GPT-5 (gpt-5-2) | 1 | 2 | 2 | 618 |
| PDBP02  | BP       | GPT-5 (gpt-5-2) | 1 | 3 | 5 | 1,366 |
| IMCE01  | CE       | GPT-5 (gpt-5-2) | 1 | 8 | 12 | 927 |
| IMCE02  | CE       | GPT-5 (gpt-5-2) | 1 | 2 | 5 | 210 |
| SCCE01  | CE       | GPT-5 (gpt-5-2) | 1 | 3 | 3 | 463 |
| SCCE02  | CE       | GPT-5 (gpt-5-2) | 1 | 6 | 11 | 508 |
| PDCE01  | CE       | GPT-5 (gpt-5-2) | 1 | 1 | 1 | 531 |
| PDCE02  | CE       | GPT-5 (gpt-5-2) | 1 | 5 | 10 | 479 |
| IMSD01  | SDD      | Codex CLI | N/A | 10 | 9  | 234 ⁴ |
| IMSD02  | SDD      | Codex CLI | N/A | 14 | 12 | 337 ⁴ |
| SCSD01  | SDD      | Codex CLI | 1 | 7 | 6 | 97 ⁴ |
| SCSD02  | SDD      | Codex CLI | 1 | 11 | 10 | 346 ⁴ |
| PDSD01  | SDD      | Codex CLI | N/A | 14 | 13 | 170 ⁴ |
| PDSD02  | SDD      | GPT-5 (gpt-5-2) | 1 | 10 | 9 | 336 ⁴ |

### Interaction Summary by Strategy

| Strategy | Total Conversations | Total User Turns | Total AI Turns | User Prompt Tokens ³ |
| -------- | ------------------- | ---------------- | -------------- | -------------------- |
| **BP** (Basic Prompting) | 6 | 18 | 27 | 3,482 |
| **CE** (Context Engineering) | 6 | 25 | 42 | 3,118 |
| **SDD** (Spec-Driven Dev) | N/A | 66 | 59 | 1,520 ⁴ |

> ³ Counted using tiktoken `cl100k_base` encoding on user-side prompt text only. Source: `chatgpt-export/conversations.json` (BP/CE) and `conversation_export.json` (SDD).
> ⁴ SDD exports capture spec commands only (e.g., `speckit-plan`, `speckit.implement`). True token consumption is significantly higher as AI-generated code responses are not included in the export.
> &nbsp;&nbsp;&nbsp;&nbsp;**What is counted:** user-side spec commands in `conversation_export.json` only.
> &nbsp;&nbsp;&nbsp;&nbsp;**What is NOT counted:** AI-generated code responses, full conversation context sent per turn.
> &nbsp;&nbsp;&nbsp;&nbsp;→ SDD token values (296 / 337 / 97 / 346 / 170 / 336) are a significant undercount and should not be compared directly with BP/CE token values.

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
| Latest Unit Tests Run    | https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/26735096014           |
| Latest SonarQube Run     | https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/26735096015           |
| Latest DAST Run          | https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/26735096020           |
| Latest CodeQL Run        | https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/26735096022           |
