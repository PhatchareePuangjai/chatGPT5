## 4. DAST Security Scan (ZAP)

> Workflow run: [24299653751](https://github.com/PhatchareePuangjai/chatGPT5/actions/runs/24299653751)
> Result: :white_check_mark: **9/9 JOBS SCANNED**

| Version | FAIL-NEW | WARN-NEW | PASS | Notable Warnings |
| ------- | -------- | -------- | ---- | ---------------- |
| IMBP01 | 0 | 7 | 60 | Missing headers |
| IMCE01 | 0 | 7 | 60 | Missing headers |
| IMSD01 | 0 | 7 | 60 | Missing headers |
| PDBP01 | 0 | 8 | 59 | Missing headers + Server version leak |
| PDCE01 | 0 | 7 | 60 | Missing headers |
| PDSD01 | 0 | 9 | 58 | Missing headers + Server version leak + In Page Banner Information Leak [10009] |
| SCBP01 | 0 | 7 | 60 | Missing headers |
| SCCE01 | 0 | 8 | 59 | Missing headers + Server version leak |
| SCSD01 | 0 | 8 | 59 | Missing headers + Sub Resource Integrity Attribute Missing [90003] |

### Common ZAP Warnings (across all versions)

| Warning | Rule ID | Severity | Affected |
| ------- | ------- | -------- | -------- |
| Content Security Policy (CSP) Header Not Set | 10038 | Medium | 9/9 (IMBP01, IMCE01, IMSD01, PDBP01, PDCE01, PDSD01, SCBP01, SCCE01, SCSD01) |
| Cross-Origin-Embedder-Policy (COEP) Header Missing | 90004 | Low | 9/9 (IMBP01, IMCE01, IMSD01, PDBP01, PDCE01, PDSD01, SCBP01, SCCE01, SCSD01) |
| Cross-Origin-Opener-Policy (COOP) Header Missing | 90004 | Low | 9/9 (IMBP01, IMCE01, IMSD01, PDBP01, PDCE01, PDSD01, SCBP01, SCCE01, SCSD01) |
| Cross-Origin-Resource-Policy (CORP) Header Missing | 90004 | Low | 9/9 (IMBP01, IMCE01, IMSD01, PDBP01, PDCE01, PDSD01, SCBP01, SCCE01, SCSD01) |
| Missing Anti-clickjacking Header | 10020 | Medium | 9/9 (IMBP01, IMCE01, IMSD01, PDBP01, PDCE01, PDSD01, SCBP01, SCCE01, SCSD01) |
| Modern Web Application | 10109 | Informational | 9/9 (IMBP01, IMCE01, IMSD01, PDBP01, PDCE01, PDSD01, SCBP01, SCCE01, SCSD01) |
| Permissions Policy Header Not Set | 10063 | Low | 9/9 (IMBP01, IMCE01, IMSD01, PDBP01, PDCE01, PDSD01, SCBP01, SCCE01, SCSD01) |
| Storable but Non-Cacheable Content | 10049 | Informational | 9/9 (IMBP01, IMCE01, IMSD01, PDBP01, PDCE01, PDSD01, SCBP01, SCCE01, SCSD01) |
| X-Content-Type-Options Header Missing | 10021 | Low | 9/9 (IMBP01, IMCE01, IMSD01, PDBP01, PDCE01, PDSD01, SCBP01, SCCE01, SCSD01) |
| Server Leaks Version Information | 10036 | Low | 3/9 (PDBP01, PDSD01, SCCE01) |
| In Page Banner Information Leak | 10009 | Low | 1/9 (PDSD01) |
| Sub Resource Integrity Attribute Missing | 90003 | Medium | 1/9 (SCSD01) |

### DAST Summary by Strategy

| Strategy | Avg Warnings | Avg Pass | Server Leak | Scan Status |
| -------- | ------------ | -------- | ----------- | ----------- |
| **BP** (Basic Prompting) | 7.3 | 59.7 | 1/3 (PDBP01) | 3/3 scanned |
| **CE** (Context Engineering) | 7.3 | 59.7 | 1/3 (SCCE01) | 3/3 scanned |
| **SD** (Spec-Driven Dev) | 8.0 | 59.0 | 1/3 (PDSD01) | 3/3 scanned |
