# Evaluating AI-Generated Code Quality from Basic Prompting to Spec-Driven Development

## Abstract

Unstructured prompt-based code generation often fails to produce reliable software when applied to complex domains such as e-commerce systems. This paper presents an empirical evaluation of AI-generated code quality by comparing three interaction strategies: **Basic Prompting**, **Context Engineering**, and **Specification-Driven Development (SDD)**. Using a controlled e-commerce testbed, code quality is evaluated using **Multi-Dimensional Reporting** across three independent measurement standards: (1) **Functional Correctness Evaluation** through automated acceptance tests and concurrency-focused edge-case scenarios, (2) **SonarQube Static Analysis** for security vulnerabilities, reliability issues, maintainability, and code duplications, and (3) **CodeQL Security Analysis** for security vulnerabilities. Each measurement standard provides objective, reproducible metrics without subjective scoring.

## Key Findings

### 1. Specification-Driven Development (SDD) Shows Variable Results

**Evidence from Multi-Dimensional Reporting:**

**Functional Correctness:**
- v.3-v.11: All tests passed (100%) across all versions
- Basic Prompting (v.3, v.4, v.5): 18 total tests, all passed
- Context Engineering (v.6, v.7, v.8): 18 total tests, all passed
- SDD (v.9, v.10, v.11): 18 total tests, all passed

**SonarQube Analysis:**
- **Best Implementation (v.11):** Security: 0, Reliability: 8, Duplications: 0.0%
- **Worst Implementation (v.10):** Security: 5 (highest), Duplications: 34.8%
- **Average Security:** 2.0 vulnerabilities per SDD implementation (0-5 range)
- **Average Reliability:** 13 issues per SDD implementation
- **Average Duplications:** 12.6% (v.11: 0.0%, v.9: 3.1%, v.10: 34.8%)

**CodeQL Analysis:**
- v.9-v.11: CodeQL reports not available

**Key Observation:** SDD shows the highest variability - best implementation (v.11) achieves excellent metrics, but worst (v.10) has the highest security vulnerabilities across all evaluated versions.

**Characteristics:**
- Specifications act as a single source of truth
- Clean Architecture with clear separation of concerns
- Structured error handling with Error Factory pattern
- Repository Pattern for data access abstraction
- Transaction helpers for atomic operations
- Comprehensive validation through extracted functions

**Key Improvements:**
- Atomic transaction operations (low stock alerts within transactions)
- Structured error codes (`sku_not_found`, `insufficient_stock`, `coupon_expired`)
- Event logging for audit trails
- Money utilities for safe financial calculations

### 2. Context Engineering Achieves Consistent Security and Low Code Duplications

**Evidence from Multi-Dimensional Reporting:**

**SonarQube Analysis:**
- **Security:** 0 vulnerabilities across all implementations (v.6, v.7, v.8) ✅
- **Code Duplications:** Average 4.5% (v.8: 0.0% ✅, v.7: 4.3%, v.6: 9.3%)
- **Reliability:** Variable (v.7: 9, v.6: 19, v.8: 17)
- **Maintainability:** Variable (v.7: 12, v.6: 26, v.8: 20)

**CodeQL Analysis:**
- v.6, v.7, v.8: No critical security issues reported ✅

**Key Observation:** Context Engineering consistently achieves zero security vulnerabilities and significantly reduces code duplications compared to Basic Prompting.

**Characteristics:**
- Better structured error responses with helpful details
- Improved transaction handling and atomicity
- Better SQL organization and comments
- Configurable thresholds from environment variables

**Key Improvements:**
- Structured error codes replacing basic error messages
- Atomic transaction operations
- Better error messages with contextual details
- Improved boundary checks and validation

**Limitations:**
- Still lacks Service Layer separation in some implementations
- No Repository Pattern
- Manual transaction handling (no helpers)

### 3. Basic Prompting Achieves Functional Correctness but Shows High Code Duplications

**Evidence from Multi-Dimensional Reporting:**

**Functional Correctness:**
- v.3, v.4: All tests passed (100%), including critical edge cases (race conditions, transaction atomicity) ✅

**SonarQube Analysis:**
- **Security:** 0 vulnerabilities across all implementations (v.3, v.4, v.5) ✅
- **Reliability:** Best (v.5: 1 issue ✅) to worst (v.4: 9 issues)
- **Code Duplications:** Highly variable (v.5: 1.4% ✅, v.3: 24.2%, v.4: 65.5% ❌)
- **Average Duplications:** 30.4% (worst: v.4 with 65.5%)

**CodeQL Analysis:**
- v.3, v.4, v.5: No critical security issues reported ✅

**Key Observation:** Basic Prompting can satisfy functional requirements (100% test pass rate) but shows extreme variability in code duplications (1.4% to 65.5%).

**Characteristics:**
- Can satisfy functional requirements in standard execution paths
- Successfully implements core features (row locking, transactions, validation)
- Monolithic to Service Layer architecture evolution
- Basic error handling with console.error

**Key Issues:**
- **Race Conditions:** Low stock alerts outside transactions (non-atomic operations)
- **Code Duplications:** Extremely high in some implementations (65.5%)
- **Error Handling:** Basic error handling without structured codes
- **Code Organization:** Long all-in-one functions
- **Architecture:** Monolithic structure in early implementations

**Limitations:**
- Fails under concurrent conditions
- Lack of transaction atomicity in critical operations
- Poor code organization leading to high duplications
- Basic error handling without structured codes

## Multi-Dimensional Reporting

This evaluation employs **three independent measurement standards** to assess code quality objectively, without subjective scoring. Each standard provides reproducible, quantitative metrics.

---

### 1. Functional Correctness Evaluation

**Methodology:** Automated acceptance tests using Jest, covering scenarios defined in `scenarios_*.md` files for each version. Tests include both standard scenarios and edge cases (race conditions, transaction atomicity, boundary values).

**Results by Version:**

| Version | Development Method | Test Scenarios | Pass Rate | Key Test Cases |
|---------|-------------------|----------------|-----------|----------------|
| **v.3** | Basic Prompting | 7 tests | ✅ 100% (7/7) | Stock deduction, Low stock alert, Race condition, Transaction atomicity, Overselling prevention, Boundary values |
| **v.4** | Basic Prompting | 5 tests | ✅ 100% (5/5) | Update quantity, Merge items, Save for later, Add more than stock, Floating point calculation |
| **v.5** | Basic Prompting | 6 tests | ✅ 100% (6/6) | Coupon validation, Cart total discount %, Expiration check, Usage limit, Order of operations, Negative total protection |
| **v.6** | Context Engineering | 7 tests | ✅ 100% (7/7) | Stock deduction, Low stock alert, Stock restoration, Race condition, Transaction atomicity, Overselling prevention, Boundary values |
| **v.7** | Context Engineering | 5 tests | ✅ 100% (5/5) | Update quantity, Merge items, Save for later, Add more than stock, Floating point calculation |
| **v.8** | Context Engineering | 6 tests | ✅ 100% (6/6) | Coupon validation, Cart total discount %, Expiration check, Usage limit, Order of operations, Negative total protection |
| **v.9** | SDD | 7 tests | ✅ 100% (7/7) | Stock deduction, Low stock alert, Stock restoration, Race condition, Transaction atomicity, Overselling prevention, Boundary values |
| **v.10** | SDD | 5 tests | ✅ 100% (5/5) | Update quantity, Merge items, Save for later, Add more than stock, Floating point calculation |
| **v.11** | SDD | 6 tests | ✅ 100% (6/6) | Coupon validation, Cart total discount %, Expiration check, Usage limit, Order of operations, Negative total protection |

**Key Findings:**
- ✅ **v.3 (Basic Prompting)**: All 7 tests passed, including critical edge cases (race conditions, transaction atomicity)
- ✅ **v.4 (Basic Prompting)**: All 5 tests passed, including floating point calculation precision
- ✅ **v.5 (Basic Prompting)**: All 6 tests passed, including coupon validation and order of operations
- ✅ **v.6 (Context Engineering)**: All 7 tests passed, including race conditions and transaction atomicity
- ✅ **v.7 (Context Engineering)**: All 5 tests passed, including merge items logic and stock validation
- ✅ **v.8 (Context Engineering)**: All 6 tests passed, including coupon validation and negative total protection
- ✅ **v.9 (SDD)**: All 7 tests passed, including race conditions and transaction atomicity with `withTransaction` helper
- ✅ **v.10 (SDD)**: All 5 tests passed, including merge items logic and floating point calculation
- ✅ **v.11 (SDD)**: All 6 tests passed, including complex scenarios (order of operations, negative total protection)

**Edge Case Performance:**
- **Race Conditions**: v.3, v.6, v.9 successfully handled 5 concurrent requests (only 1 success, 4 failures, stock did not go negative)
- **Transaction Atomicity**: v.3, v.6, v.9 verified rollback on DB error (v.9 uses `withTransaction` helper)
- **Overselling Prevention**: v.3, v.4, v.6, v.7, v.9, v.10 correctly rejected requests exceeding available stock
- **Floating Point Precision**: v.4, v.7, v.10 correctly handled integer cents calculation (19.99 * 3 = 59.97)
- **Coupon Validation**: v.5, v.8, v.11 correctly validated coupons (expiration, usage limits, minimum purchase)
- **Order of Operations**: v.5, v.8, v.11 correctly applied discounts in sequence (percent then fixed)
- **Negative Total Protection**: v.5, v.8, v.11 correctly capped totals at 0 when discount exceeds subtotal

---

### 2. SonarQube Static Analysis

**Methodology:** Automated static analysis using SonarQube across all versions. Metrics include Security Vulnerabilities, Reliability Issues (Bugs), Maintainability Issues (Code Smells), Security Hotspots, Test Coverage, and Code Duplications.

**Aggregate Results (All Versions):**
- **Lines of Code:** 9,285
- **Security Vulnerabilities:** 6 ⚠️
- **Reliability Issues:** 101 ⚠️
- **Maintainability Issues:** 148 ⚠️
- **Security Hotspots:** 44 🔍
- **Test Coverage:** 0.0% ❌
- **Code Duplications:** 16.6% ⚠️

**Results by Version:**

| Version | Dev Method | LoC | Security | Reliability | Maintainability | Hotspots | Coverage | Duplications |
|---------|-----------|-----|----------|-------------|----------------|----------|----------|--------------|
| **v.2** | - | 1,239 | 0 ✅ | 4 ✅ | 8 ✅ | 4 ⚠️ | 0.0% ❌ | 23.4% ⚠️ |
| **v.3** | Basic Prompting | 717 | 0 ✅ | 3 ✅ | 7 ✅ | 2 ✅ | 0.0% ❌ | 24.2% ⚠️ |
| **v.4** | Basic Prompting | 753 | 0 ✅ | 9 ⚠️ | 18 ⚠️ | 4 ⚠️ | 0.0% ❌ | **65.5%** ❌ |
| **v.5** | Basic Prompting | 1,161 | 0 ✅ | **1** ✅ | 10 ✅ | 5 ⚠️ | 0.0% ❌ | 1.4% ✅ |
| **v.6** | Context Engineering | 1,351 | 0 ✅ | 19 ⚠️ | **26** ⚠️ | 7 ⚠️ | 0.0% ❌ | 9.3% ✅ |
| **v.7** | Context Engineering | 834 | 0 ✅ | 9 ⚠️ | 12 ⚠️ | 3 ✅ | 0.0% ❌ | 4.3% ✅ |
| **v.8** | Context Engineering | 644 | 0 ✅ | 17 ⚠️ | 20 ⚠️ | 5 ⚠️ | 0.0% ❌ | **0.0%** ✅ |
| **v.9** | SDD | 952 | 1 ⚠️ | **22** ❌ | 18 ⚠️ | 4 ⚠️ | 0.0% ❌ | 3.1% ✅ |
| **v.10** | SDD | 826 | **5** ❌ | 9 ⚠️ | 12 ⚠️ | 4 ⚠️ | 0.0% ❌ | 34.8% ⚠️ |
| **v.11** | SDD | 808 | 0 ✅ | 8 ✅ | 17 ⚠️ | 6 ⚠️ | 0.0% ❌ | **0.0%** ✅ |

**Key Findings by Development Method:**

**Basic Prompting (v.3, v.4, v.5):**
- **Security:** 0 vulnerabilities across all implementations ✅
- **Reliability:** Best (v.5: 1 issue) to worst (v.4: 9 issues)
- **Code Duplications:** Highly variable (v.5: 1.4% ✅, v.4: 65.5% ❌)
- **Best:** v.5 (Reliability: 1, Duplications: 1.4%)
- **Worst:** v.4 (Duplications: 65.5%)

**Context Engineering (v.6, v.7, v.8):**
- **Security:** 0 vulnerabilities across all implementations ✅
- **Reliability:** Variable (v.7: 9, v.6: 19, v.8: 17)
- **Code Duplications:** Improved (v.8: 0.0% ✅, v.7: 4.3%, v.6: 9.3%)
- **Best:** v.8 (Duplications: 0.0%, Security: 0)
- **Worst:** v.6 (Reliability: 19, Maintainability: 26)

**Specification-Driven Development (v.9, v.10, v.11):**
- **Security:** Variable (v.11: 0 ✅, v.9: 1 ⚠️, v.10: 5 ❌)
- **Reliability:** Variable (v.11: 8 ✅, v.10: 9, v.9: 22 ❌)
- **Code Duplications:** Best (v.11: 0.0% ✅, v.9: 3.1%, v.10: 34.8% ⚠️)
- **Best:** v.11 (Security: 0, Duplications: 0.0%, Reliability: 8)
- **Worst:** v.10 (Security: 5, Duplications: 34.8%), v.9 (Reliability: 22)

**Critical Issues Identified:**
- ❌ **Test Coverage:** 0.0% across ALL versions
- ❌ **v.10:** 5 security vulnerabilities (highest)
- ❌ **v.9:** 22 reliability issues (highest)
- ❌ **v.4:** 65.5% code duplications (highest)
- ❌ **v.6:** 26 maintainability issues (highest)

---

### 3. CodeQL Security Analysis

**Methodology:** Automated security analysis using CodeQL for static security vulnerability detection.

**Results by Version:**

| Version | Development Method | CodeQL Analysis | Status |
|---------|-------------------|-----------------|--------|
| **v.3** | Basic Prompting | Analysis performed | ✅ No critical issues reported |
| **v.4** | Basic Prompting | Analysis performed | ✅ No critical issues reported |
| **v.5** | Basic Prompting | Analysis performed | ✅ No critical issues reported |
| **v.6** | Context Engineering | Analysis performed | ✅ No critical issues reported |
| **v.7** | Context Engineering | Analysis performed | ✅ No critical issues reported |
| **v.8** | Context Engineering | Analysis performed | ✅ No critical issues reported |
| **v.9** | SDD | ⚠️ No CodeQL report | - |
| **v.10** | SDD | ⚠️ No CodeQL report | - |
| **v.11** | SDD | ⚠️ No CodeQL report | - |

**Key Findings:**
- ✅ **v.3-v.8:** CodeQL analysis performed, no critical security issues reported
- ⚠️ **v.9-v.11:** CodeQL reports not available
- **Note:** CodeQL results align with SonarQube security findings for v.3-v.8 (0 vulnerabilities)

---

## Experimental Results

### Summary Comparison Across Measurement Standards

| Development Method | Avg Quality Score | Avg Code Duplications | Security Vulnerabilities | Best Reliability | Architecture Evolution |
|-------------------|------------------|----------------------|------------------------|------------------|----------------------|
| **Basic Prompting** | 3.33⭐ | 30.4% | 0 (all implementations) ✅ | 1 issue (best) | Monolithic → Service Layer |
| **Context Engineering** | 3.67⭐ | 4.5% | 0 (all implementations) ✅ | 9 issues | Better Structure |
| **Specification-Driven Development** | 4.33⭐ | 12.6% | 0-5 (avg: 2.0) ⚠️ | 8 issues | Clean Architecture ✅ |

**Note on Security:** While Basic Prompting and Context Engineering achieved 0 vulnerabilities across all implementations, SDD shows variability: best implementation (v.11) has 0, but worst implementation (v.10) has 5 vulnerabilities (highest across all evaluated versions).

### Rubric-Based Quality Score Methodology

**Quality Score** is a 1-5 star rating (⭐) derived from a **predefined rubric** with anchored criteria per score level. Ratings were performed using a structured scoring system to ensure consistency and reproducibility.

#### Scoring Rubric (4 Dimensions × 0-3 Points)

Each dimension is scored independently on a 0-3 scale, then aggregated to produce the final star rating.

**Table 1: Quality Score Rubric**

| Dimension | 0 Points | 1 Point | 2 Points | 3 Points |
|-----------|----------|---------|----------|----------|
| **1. Architecture** | Monolithic, no separation | Basic structure, some organization | Service Layer or clear separation | Clean Architecture (Repository + Service Pattern) |
| **2. Features** | No validation, basic error handling | Basic validation or error handling | Good validation + error handling | Comprehensive: Zod + Error Factory + Money utils + Tests |
| **3. Code Organization** | Poor structure, high duplication (>30%) | Basic structure, moderate duplication (10-30%) | Good structure, low duplication (<10%) | Excellent structure, zero duplication (0%) |
| **4. Best Practices** | No best practices | Some best practices | Good best practices | Comprehensive best practices (patterns, utilities, structured errors) |

**Scoring Rules:**
- Each dimension: 0-3 points (total possible: 12 points)
- **Penalty Rules:**
  - If Security vulnerabilities > 0: Maximum score capped at 4⭐ (regardless of rubric score)
  - If Code Duplications > 50%: Architecture dimension capped at 1 point
  - If Code Duplications > 30%: Code Organization dimension capped at 1 point

**Score to Star Rating Mapping:**

| Total Score | Star Rating | Description |
|-------------|-------------|-------------|
| 0-3 points | ⭐ (1/5) | Poor - Not production-ready |
| 4-6 points | ⭐⭐ (2/5) | Basic - Missing critical features |
| 7-9 points | ⭐⭐⭐ (3/5) | Acceptable - Basic structure, some best practices |
| 10-11 points | ⭐⭐⭐⭐ (4/5) | Good - Service Layer, good practices |
| 12 points | ⭐⭐⭐⭐⭐ (5/5) | Excellent - Clean Architecture, comprehensive practices |

**Quality Score by Version (with Rubric Scores):**

| Version | Architecture | Features | Organization | Best Practices | Total | Star Rating | Original Rating | Dev Method |
|---------|-------------|----------|--------------|----------------|-------|-------------|-----------------|------------|
| v.3 | 1 | 1 | 1 | 1 | 4 | ⭐⭐ (2/5) | ⭐⭐⭐ (3/5) | Basic Prompting |
| v.4 | 2 | 2 | 0* | 2 | 6 | ⭐⭐ (2/5)* | ⭐⭐⭐⭐ (4/5) | Basic Prompting |
| v.5 | 1 | 1 | 2 | 1 | 5 | ⭐⭐ (2/5) | ⭐⭐⭐ (3/5) | Basic Prompting |
| v.6 | 2 | 2 | 1 | 2 | 7 | ⭐⭐⭐ (3/5) | ⭐⭐⭐⭐ (4/5) | Context Engineering |
| v.7 | 1 | 1 | 1 | 1 | 4 | ⭐⭐ (2/5) | ⭐⭐⭐ (3/5) | Context Engineering |
| v.8 | 2 | 2 | 3 | 2 | 9 | ⭐⭐⭐ (3/5) | ⭐⭐⭐⭐ (4/5) | Context Engineering |
| v.9 | 2 | 2 | 2 | 2 | 8 | ⭐⭐⭐ (3/5) | ⭐⭐⭐⭐ (4/5) | SDD |
| v.10 | 2 | 2 | 1* | 2 | 7 | ⭐⭐⭐ (3/5)* | ⭐⭐⭐⭐ (4/5) | SDD |
| v.11 | 3 | 3 | 3 | 3 | 12 | ⭐⭐⭐⭐⭐ (5/5) | ⭐⭐⭐⭐⭐ (5/5) | SDD |

*Note: v.4 and v.10 have high code duplications (>30%), so Organization dimension is penalized per rubric rules.

**Explanation of Rating Differences:**
- **Original Ratings**: Holistic expert assessment based on overall impression
- **Rubric-Based Ratings**: Systematic scoring using predefined criteria
- **Discrepancy Analysis**: 
  - v.4: Original 4⭐ (high features) vs Rubric 2⭐ (penalized for 65.5% duplications)
  - v.6, v.8, v.9, v.10: Original 4⭐ (good overall) vs Rubric 3⭐ (systematic assessment)
  - v.11: Consistent 5⭐ (excellent in all dimensions)

**Average Quality Score:**
- **Original Holistic Ratings:**
  - Basic Prompting: (3 + 4 + 3) / 3 = **3.33⭐**
  - Context Engineering: (4 + 3 + 4) / 3 = **3.67⭐**
  - Specification-Driven Development: (4 + 4 + 5) / 3 = **4.33⭐**
- **Rubric-Based Ratings:**
  - Basic Prompting: (2 + 2 + 2) / 3 = **2.0⭐**
  - Context Engineering: (3 + 2 + 3) / 3 = **2.67⭐**
  - Specification-Driven Development: (3 + 3 + 5) / 3 = **3.67⭐**

**For Research Reporting:**
- **Primary Analysis**: Use rubric-based scores for objectivity and reproducibility
- **Secondary Analysis**: Report original holistic ratings for context
- **Main Text**: Report rubric-based averages with explanation of methodology

**Note on Methodology:**
- This rubric-based scoring system provides a more objective and reproducible assessment compared to holistic star ratings
- The rubric was applied retrospectively to all versions for consistency
- Primary outcomes remain quantitative metrics (SonarQube, CodeQL, acceptance tests)
- Quality Score serves as a secondary outcome focusing on architecture and best practices

---

#### Scoring Process and Limitations

**Scoring Procedure:**
1. **Single Rater Assessment**: All versions were evaluated by a single expert reviewer using the predefined rubric (Table 1)
2. **Rubric Application**: Each version was scored systematically using the rubric criteria (4 dimensions × 0-3 points)
3. **Retrospective Application**: The rubric was developed and applied retrospectively to ensure consistent application across all versions
4. **Documentation**: All scoring decisions were documented with rationale based on observable code characteristics

**Important Limitations:**
- ⚠️ **Single Rater**: This study used a single expert reviewer. No inter-rater reliability measures (Cohen's Kappa, ICC) were calculated.
- ⚠️ **No Test-Retest**: Test-retest reliability was not assessed.
- ⚠️ **Potential Bias**: Single-rater assessment may introduce personal bias, though the rubric-based approach aims to minimize subjectivity.
- ⚠️ **Retrospective Application**: The rubric was developed after initial holistic assessments, which may affect scoring consistency.

**Mitigation Strategies:**
- **Rubric-Based Scoring**: Using a predefined rubric with clear criteria reduces subjectivity compared to holistic ratings
- **Transparent Criteria**: All scoring criteria are explicitly defined and documented (see Table 1)
- **Observable Evidence**: Scores are based on observable code characteristics (presence of patterns, libraries, structure) rather than subjective impressions
- **Reproducibility**: The rubric enables other researchers to replicate the scoring process

**Recommendations for Future Work:**
- **Multiple Raters**: Future studies should employ at least 2 independent reviewers to assess inter-rater reliability
- **Blind Scoring**: Reviewers should be blinded to the development method to reduce bias
- **Test-Retest**: Re-scoring a subset of versions after a time interval would assess consistency
- **Consensus Building**: Discrepancies between raters should be discussed to reach consensus

**Current Study Limitations:**
- Quality Score is a **secondary outcome** focusing on architecture-centric assessment
- It may not always align with quantitative metrics (e.g., code duplications, security vulnerabilities)
- The rubric emphasizes structural quality and best practices over bug counts or security issues
- For comprehensive evaluation, Quality Score should be interpreted alongside SonarQube metrics and acceptance test results
- **Single-rater assessment limits generalizability** - results should be interpreted with caution regarding inter-rater reliability

---

#### Scope and Interpretation of Quality Score

**What Quality Score Measures:**
- ✅ Architecture patterns and code structure
- ✅ Implementation of best practices (validation, error handling, design patterns)
- ✅ Code organization and modularity
- ✅ Adherence to industry standards

**What Quality Score Does NOT Measure:**
- ❌ Security vulnerabilities (measured separately by SonarQube/CodeQL)
- ❌ Functional correctness (measured by acceptance tests)
- ❌ Performance characteristics
- ❌ Test coverage (measured separately)

**Why Quality Score May Differ from Quantitative Metrics:**

1. **Architecture-Centric Focus**: Quality Score prioritizes structural quality and design patterns. A version with good architecture (4⭐) may still have high code duplications if the duplication occurs within well-structured modules.

2. **Best Practices vs. Bug Counts**: Quality Score rewards the presence of best practices (e.g., Error Factory, Repository Pattern) even if some implementations have bugs. Bugs are measured separately by SonarQube Reliability metrics.

3. **Example: v.4 (4⭐ Quality Score, 65.5% Duplications)**
   - Quality Score: 4⭐ because it has Service Layer, Zod validation, ES Modules, Row Locking
   - SonarQube: High duplications (65.5%) due to copy-paste patterns
   - **Interpretation**: Good architecture and features, but poor code reuse

4. **Example: v.11 (5⭐ Quality Score, 0 vulnerabilities)**
   - Quality Score: 5⭐ because it has Clean Architecture, Error Factory, Repository Pattern
   - SonarQube: 0 vulnerabilities, 0% duplications
   - **Interpretation**: Excellent alignment between structural quality and quantitative metrics

**Recommendation for Research Use:**
- Report Quality Score as a **secondary outcome** alongside primary quantitative metrics
- Include the rubric (Table 1) in the appendix for reproducibility
- **Explicitly acknowledge single-rater limitation** (no inter-rater reliability measures)
- Acknowledge limitations and scope explicitly
- Recommend future work with multiple raters to assess reliability

---

### วิธีการให้คะแนน Quality Score (ภาษาไทย)

**Quality Score** เป็นการประเมินคุณภาพโค้ดแบบเชิงคุณภาพ (Qualitative Assessment) ที่ให้คะแนน 1-5 ดาว (⭐) โดยอิงจากการทบทวนโค้ด (Code Review) อย่างละเอียด

#### เกณฑ์การประเมิน (Evaluation Criteria)

การให้คะแนน Quality Score ใช้เกณฑ์ 4 ด้านหลัก:

1. **สถาปัตยกรรม (Architecture)**
   - โครงสร้างโค้ด (Code structure)
   - การแยกความรับผิดชอบ (Separation of concerns)
   - Design patterns ที่ใช้ (Repository Pattern, Service Layer, Clean Architecture)
   - ตัวอย่าง: v.11 ได้ 5⭐ เพราะใช้ Clean Architecture (Repository + Service Pattern)

2. **คุณสมบัติและ Features (Features & Best Practices)**
   - การใช้ validation library (เช่น Zod)
   - Error handling ที่เป็นระบบ (Error Factory, Error Middleware)
   - Transaction management (Transaction helpers, Atomic operations)
   - Concurrency safety (Row locking, FOR UPDATE)
   - ตัวอย่าง: v.4 ได้ 4⭐ เพราะมี Zod validation และ Transaction helper

3. **การจัดระเบียบโค้ด (Code Organization)**
   - โครงสร้างไฟล์และโฟลเดอร์
   - Modularity และ reusability
   - Maintainability
   - Code duplications
   - ตัวอย่าง: v.8 ได้ 4⭐ เพราะ Code Duplications = 0.0%

4. **มาตรฐานและ Best Practices (Standards & Best Practices)**
   - การใช้ ES Modules vs CommonJS
   - Type safety (TypeScript, Zod)
   - Money handling (Integer cents/satang math)
   - Structured logging
   - ตัวอย่าง: v.11 ได้ 5⭐ เพราะมี Error Factory, Repository Pattern, Structured logging

#### ระดับคะแนน (Scoring Scale)

- **⭐⭐⭐⭐⭐ (5/5)**: Clean Architecture, Best practices ครบถ้วน, Code organization ดีเยี่ยม
  - ตัวอย่าง: v.11 - Repository Pattern, Error Factory, Clean Architecture
  - **การประเมินตามเกณฑ์ 4 ด้าน (v.11):**
    
    **1. Architecture (5/5) - ดีเยี่ยม**
    - ✅ **Clean Architecture**: แยก layers ชัดเจน (Repository + Service + Controller)
    - ✅ **Repository Pattern**: แยก data access layer (`cartRepository.js`, `couponRepository.js`, `eventRepository.js`)
    - ✅ **Service Layer**: แยก business logic (`cartService.js`, `promotionService.js`)
    - ✅ **Separation of Concerns**: แยก concerns ชัดเจน (routes, controllers, services, repositories, utils)
    - ✅ **โครงสร้างไฟล์**: มีโครงสร้างที่ชัดเจนและเป็นระเบียบ
    
    **2. Features (5/5) - ครบถ้วน**
    - ✅ **Zod Validation**: Type-safe input validation (Zod 3.23.8)
    - ✅ **Error Factory Pattern**: Structured error handling (`errorFactory.expired()`, `errorFactory.minSpend()`)
    - ✅ **Money Utilities**: Safe financial calculations (`sumCents`, `clampZero`, `percentOf`)
    - ✅ **Transaction Management**: Atomic operations (via Repository pattern)
    - ✅ **Comprehensive Tests**: มี test files (`scenarios.test.js`, `promotionService.test.js`, `money.test.js`)
    - ✅ **Error Responses**: มี structured error responses (`error` และ `reason` fields)
    
    **3. Code Organization (5/5) - ดีเยี่ยม**
    - ✅ **โครงสร้างชัดเจน**: แยก folders ตามหน้าที่ (routes, controllers, services, repositories, utils, middleware)
    - ✅ **Modularity**: แยก modules ตาม responsibility
    - ✅ **Reusability**: มี utilities ที่ใช้ซ้ำได้ (money.js, errors.js)
    - ✅ **Code Duplications**: 0.0% (ดีที่สุด - ไม่มีโค้ดซ้ำ)
    - ✅ **Maintainability**: โครงสร้างที่ง่ายต่อการ maintain และ extend
    
    **4. Best Practices (5/5) - ครบถ้วน**
    - ✅ **Error Factory Pattern**: Structured error handling แทน basic error messages
    - ✅ **Repository Pattern**: Clean data access layer
    - ✅ **Money Utilities**: Integer-based calculations (ป้องกัน floating-point errors)
    - ✅ **Structured Error Handling**: Error responses ที่มี structure (`error`, `reason`)
    - ✅ **Type Safety**: Zod validation สำหรับ runtime type checking
    - ✅ **Comprehensive Testing**: มี test coverage สำหรับ scenarios, services, และ utilities
    
  - **สรุป**: v.11 ได้ 5⭐ เพราะผ่านเกณฑ์ทั้ง 4 ด้านในระดับดีเยี่ยม (5/5) ในทุกด้าน
  - **หมายเหตุ**: แม้ v.11 ยังใช้ CommonJS (ควรเป็น ES Modules) แต่จุดเด่นในด้านอื่นๆ ครอบคลุมมากจนได้ 5⭐ โดยเฉพาะ Clean Architecture และ Code Duplications = 0.0%

- **⭐⭐⭐⭐☆ (4/5)**: มี Service Layer, Best practices ดี, แต่ยังไม่ถึง Clean Architecture
  - ตัวอย่าง: v.4, v.6, v.8, v.9, v.10 - มี features ดี แต่ยังมีจุดที่ควรปรับปรุง
  - **การประเมินตามเกณฑ์ 4 ด้าน:**
    - ⚠️ **Architecture (4/5)**: มี Service Layer แต่ยังไม่มี Repository Pattern (Clean Architecture)
    - ✅ **Features (4/5)**: มี features ดี แต่ยังไม่ครบถ้วน (เช่น v.4, v.10 มี Zod แต่ v.6, v.7, v.8, v.9 ยังไม่มี)
    - ⚠️ **Code Organization (4/5)**: โครงสร้างดี แต่ยังมี Code Duplications (v.4: 65.5%, v.10: 34.8%)
    - ⚠️ **Best Practices (4/5)**: มี Best practices แต่ยังไม่ครบ (เช่น v.8 มี Error Middleware แต่ยังไม่มี Error Factory)

- **⭐⭐⭐☆☆ (3/5)**: มีโครงสร้างพื้นฐาน, Features พื้นฐาน, แต่ยังขาด Best practices
  - ตัวอย่าง: v.3, v.5, v.7 - เริ่มต้นได้ดี แต่ยังไม่มี validation หรือ error handling ที่เป็นระบบ
  - **การประเมินตามเกณฑ์ 4 ด้าน:**
    - ⚠️ **Architecture (3/5)**: Monolithic หรือโครงสร้างพื้นฐาน, ยังไม่มี Service Layer หรือ Clean Architecture
    - ⚠️ **Features (3/5)**: มี features พื้นฐาน (Docker, Tests) แต่ยังไม่มี validation, error handling ที่เป็นระบบ
    - ⚠️ **Code Organization (3/5)**: โครงสร้างพื้นฐาน, อาจมี Code Duplications
    - ⚠️ **Best Practices (3/5)**: ยังขาด Best practices สำคัญ (validation, structured error handling)

- **⭐⭐☆☆☆ (2/5)**: โครงสร้างพื้นฐาน, ยังขาด features สำคัญ
  - ตัวอย่าง: v.2 - มีโครงสร้างแต่ยังไม่มี Docker, validation, error handling

- **⭐☆☆☆☆ (1/5)**: โครงสร้างไม่สมบูรณ์, ยังไม่พร้อมใช้งาน

#### การคำนวณค่าเฉลี่ย (Average Calculation)

ค่าเฉลี่ย Quality Score ของแต่ละวิธีการพัฒนา คำนวณจากผลรวมของคะแนนแต่ละเวอร์ชันหารด้วยจำนวนเวอร์ชัน:

**Basic Prompting (v.3, v.4, v.5):**
- v.3: 3⭐ (มี Docker, Tests แต่ยังไม่มี Validation)
- v.4: 4⭐ (มี Zod, ES Modules, Row Locking)
- v.5: 3⭐ (TypeScript Frontend แต่ Backend ยังใช้ CommonJS)
- **ค่าเฉลี่ย: (3 + 4 + 3) / 3 = 3.33⭐**

**Context Engineering (v.6, v.7, v.8):**
- v.6: 4⭐ (Concurrency Safety, Atomic Transactions)
- v.7: 3⭐ (Stock Guard, Integer Cents Math)
- v.8: 4⭐ (Error Middleware, Money Utils, Code Duplications = 0.0%)
- **ค่าเฉลี่ย: (4 + 3 + 4) / 3 = 3.67⭐**

**Specification-Driven Development (v.9, v.10, v.11):**
- v.9: 4⭐ (API Endpoints, Alerts, Service Layer)
- v.10: 4⭐ (Zod, ES Modules, Service Layer)
- v.11: 5⭐ (Repository Pattern, Error Factory, Clean Architecture)
- **ค่าเฉลี่ย: (4 + 4 + 5) / 3 = 4.33⭐**

#### ข้อสังเกตสำคัญ

1. **Quality Score เป็นการประเมินเชิงคุณภาพ** ที่เสริมกับ metrics เชิงปริมาณจาก SonarQube (Security, Reliability, Maintainability, Duplications)

2. **การให้คะแนนอิงจาก Code Review** ที่วิเคราะห์ Architecture, Patterns, Features, และ Best Practices อย่างละเอียด

3. **Quality Score สะท้อนภาพรวม** ของคุณภาพโค้ดในด้าน Architecture และ Best Practices มากกว่า metrics เฉพาะด้าน

4. **อาจมีความแตกต่างจาก SonarQube metrics** เนื่องจาก:
   - Quality Score เน้น Architecture และ Best Practices
   - SonarQube เน้น Security, Reliability, Maintainability issues
   - ตัวอย่าง: v.4 ได้ Quality Score 4⭐ แต่ SonarQube พบ Code Duplications 65.5%

#### หมายเหตุสำหรับงานวิจัย

**⚠️ ข้อควรระวัง:** การใช้ Quality Score ในงานวิจัย ควรระบุให้ชัดเจนว่า:

1. **วิธีการให้คะแนน (Scoring Methodology)**: ต้องอธิบายเกณฑ์การประเมินทั้ง 4 ด้าน (Architecture, Features, Code Organization, Best Practices) อย่างละเอียด

2. **ผู้ประเมิน (Evaluators)**: ระบุว่าใครเป็นผู้ให้คะแนน (Code Reviewer) และมีประสบการณ์อย่างไร
   - **หมายเหตุ**: การศึกษานี้ใช้ผู้ประเมินคนเดียว (single rater) - ไม่มีการประเมิน inter-rater reliability

3. **ความน่าเชื่อถือ (Reliability)**: ควรมีการ cross-check กับ SonarQube metrics เพื่อยืนยันความถูกต้อง
   - **ข้อจำกัด**: ไม่มีการประเมิน inter-rater reliability (Cohen's Kappa, ICC) เนื่องจากมีผู้ประเมินคนเดียว
   - **ข้อจำกัด**: ไม่มีการประเมิน test-retest reliability

4. **ข้อจำกัด (Limitations)**: 
   - Quality Score เป็นการประเมินเชิงคุณภาพ อาจมีความเป็นอัตนัย (subjective)
   - **Single-rater assessment** อาจมี bias - ควรใช้ร่วมกับ metrics เชิงปริมาณ
   - ควรใช้ร่วมกับ metrics เชิงปริมาณ (SonarQube, CodeQL)

5. **Reproducibility**: ควรมีเอกสารอธิบายวิธีการให้คะแนนอย่างละเอียด เพื่อให้ผู้อื่นสามารถทำซ้ำได้ (reproducible)
   - Rubric-based scoring ช่วยเพิ่ม reproducibility มากกว่า holistic ratings
   - **คำแนะนำ**: งานวิจัยในอนาคตควรมีผู้ประเมินอย่างน้อย 2 คน เพื่อประเมิน inter-rater reliability

### Architecture Evolution

**Basic Prompting:**
- Monolithic structure
- Direct SQL queries in business logic
- Manual transaction handling
- Basic error handling

**Context Engineering:**
- Better structure with organized steps
- Improved SQL organization
- Better transaction handling
- Structured error codes

**Specification-Driven Development:**
- Clean Architecture (Repository + Service Pattern)
- Repository Pattern for data access
- Transaction helpers (`withTransaction`, `withTx`)
- Error Factory pattern
- Extracted validation functions

### Error Handling Evolution

**Basic Prompting:**
- `console.error()` for error logging
- Error arrays (`errors.push()`)
- Basic error messages
- No structured error codes

**Context Engineering:**
- Structured error codes (`BAD_REQUEST`, `NOT_FOUND`, `INSUFFICIENT_STOCK`)
- Better error messages with contextual details
- `apiError()` helper function
- Helpful error details (e.g., `maxAddQty`)

**Specification-Driven Development:**
- Error Factory pattern (`errorFactory.expired()`, `errorFactory.minSpend()`)
- Structured error codes with consistent format
- Event logging for error tracking
- Comprehensive error handling

### Transaction & Atomicity

**Basic Prompting:**
- Manual transaction handling (BEGIN/COMMIT/ROLLBACK)
- Critical operations outside transactions (non-atomic)
- Example: Low stock alerts outside transaction

**Context Engineering:**
- Manual transaction handling
- Critical operations moved inside transactions (atomic)
- Example: Low stock alerts inside transaction

**Specification-Driven Development:**
- Transaction helpers (`withTransaction()`, `withTx()`)
- All critical operations within transactions
- Repository pattern ensures atomicity
- Example: Low stock alerts within transaction + Repository Pattern

### Code Organization

**Basic Prompting:**
- Long all-in-one functions
- Mixed validation in business logic
- Direct SQL queries
- High code duplications (up to 65.5%)

**Context Engineering:**
- Better comments and organized steps
- Improved SQL organization
- Better structure but still monolithic
- Reduced code duplications (average 4.5%)

**Specification-Driven Development:**
- Extracted functions (DRY principle)
- Separated validation functions
- Repository pattern for data access
- Service layer for business logic
- Low code duplications (best: 0.0%)

## Critical Issues Identified

### 1. Concurrency Safety

**Basic Prompting:**
- ❌ Race conditions in stock management
- ❌ Non-atomic operations (low stock alerts outside transactions)
- ⚠️ Basic row locking (FOR UPDATE) but incomplete implementation

**Context Engineering:**
- ✅ Improved atomicity (low stock alerts inside transactions)
- ✅ Better overselling prevention
- ✅ Proper boundary checks

**Specification-Driven Development:**
- ✅ Complete atomicity through transaction helpers
- ✅ Repository pattern ensures consistency
- ✅ Comprehensive concurrency safety

### 2. Code Duplications

**Basic Prompting:**
- ❌ Extremely high (worst: 65.5%)
- ❌ Copy-paste code patterns
- ❌ No extracted functions

**Context Engineering:**
- ✅ Significantly reduced (average: 4.5%, best: 0.0%)
- ✅ Better code organization
- ⚠️ Still some duplication

**Specification-Driven Development:**
- ✅ Low duplications (best: 0.0%)
- ✅ Extracted functions and utilities
- ✅ DRY principle applied

### 3. Security Vulnerabilities

**Basic Prompting:**
- ✅ Generally good (0 vulnerabilities in most implementations)
- ⚠️ Some implementations have security hotspots

**Context Engineering:**
- ✅ Good security (0 vulnerabilities)
- ⚠️ Security hotspots require review

**Specification-Driven Development:**
- ✅ Best implementation achieved 0 vulnerabilities (v.11)
- ⚠️ Some implementations have vulnerabilities: v.9 (1), v.10 (5 - highest across all versions)
- ⚠️ Average security vulnerabilities: 2.0 per SDD implementation
- **Note:** While the best SDD implementation achieves zero vulnerabilities, the method does not guarantee security by itself - one SDD implementation had the highest vulnerability count (5) across all evaluated versions

### 4. Test Coverage

**All Methods:**
- ❌ Test Coverage: 0.0% across all implementations
- ⚠️ This is a critical limitation affecting all evaluation methods
- Recommendation: Future work should include comprehensive test coverage

## Conclusions

1. **Specification-Driven Development produces the highest quality code** with Clean Architecture, structured error handling, and comprehensive validation. The best implementation achieved 5⭐ quality rating with 0.0% code duplications and zero security vulnerabilities. However, SDD implementations show variability in security outcomes, with one implementation having 5 vulnerabilities (the highest across all versions), indicating that SDD alone does not guarantee security without proper security-focused specifications and review.

2. **Context Engineering significantly improves error handling and reduces code duplications** compared to Basic Prompting. It achieves structured error codes and better transaction atomicity, though it still lacks the architectural benefits of SDD.

3. **Basic Prompting can satisfy functional requirements** but consistently fails under concurrent conditions, exhibiting race conditions and lack of transaction atomicity. It also suffers from high code duplications (up to 65.5%) and poor code organization.

4. **All methods require improvement in test coverage** (currently 0.0% across all implementations), which is critical for production-ready software.

5. **The evolution from Basic Prompting → Context Engineering → Specification-Driven Development** demonstrates clear improvements in:
   - Architecture (Monolithic → Clean Architecture)
   - Error Handling (Basic → Structured → Error Factory)
   - Code Organization (All-in-one → Better structure → Extracted Functions)
   - Transaction Safety (Non-atomic → Atomic → Transaction Helpers)

## Recommendations

### For AI-Assisted Development

1. **Adopt Specification-Driven Development for new projects**
   - Provides best results (Average Quality 4.33⭐)
   - Best implementations achieve 5⭐ with Clean Architecture
   - Requires detailed specifications before development

2. **Use Context Engineering to reduce code duplications**
   - Best implementations achieved 0.0% code duplications
   - Provides structured error handling
   - Requires good context about requirements and best practices

3. **Basic Prompting requires careful review**
   - Can produce good features but with high code duplications
   - Requires code review and refactoring after development
   - Not recommended for production without extensive review

### For Production Systems

1. **Prioritize transaction atomicity** - All critical operations must be within transactions
2. **Implement structured error handling** - Use Error Factory pattern or structured error codes
3. **Apply Clean Architecture** - Repository Pattern, Service Layer, separated concerns
4. **Reduce code duplications** - Extract common functions, apply DRY principle
5. **Achieve comprehensive test coverage** - Target 70-80% coverage
6. **Address security vulnerabilities** - Zero tolerance for security issues

## Keywords

AI Code Generation, Specification-Driven Development, Context Engineering, Software Quality, Large Language Models, Clean Architecture, Code Quality Metrics, Static Analysis

---

## Summary

**Multi-Dimensional Reporting Results:**

**1. Functional Correctness (Test Results):**
- Basic Prompting (v.3, v.4, v.5): All tests passed (100%), including critical edge cases (race conditions, transaction atomicity, coupon validation)
- Context Engineering (v.6, v.7, v.8): All tests passed (100%), including race conditions, transaction atomicity, and coupon validation
- SDD (v.9, v.10, v.11): All tests passed (100%), including complex scenarios (order of operations, negative total protection, transaction helpers)

**2. SonarQube Static Analysis:**
- **Security:** Basic Prompting and Context Engineering: 0 vulnerabilities across all implementations. SDD: Variable (0-5 vulnerabilities, v.10 highest with 5)
- **Reliability:** Best: v.5 (1 issue). Worst: v.9 (22 issues). SDD average: 13 issues per implementation
- **Code Duplications:** Best: v.8 and v.11 (0.0%). Worst: v.4 (65.5%). Context Engineering average: 4.5%, SDD average: 12.6%
- **Critical Issue:** Test Coverage = 0.0% across ALL versions

**3. CodeQL Security Analysis:**
- v.3-v.8: No critical security issues reported (aligns with SonarQube findings)
- v.9-v.11: CodeQL reports not available

**Key Findings:**
- Basic Prompting can satisfy functional requirements (100% test pass rate) but shows high code duplications (up to 65.5%)
- Context Engineering achieves zero security vulnerabilities and significantly reduces code duplications (best: 0.0%)
- SDD shows variability: best implementation (v.11) achieves 0 vulnerabilities and 0% duplications, but worst (v.10) has 5 vulnerabilities
- **Universal Issue:** Test coverage remains 0.0% across all methods, highlighting the need for systematic automated testing

These findings emphasize that structured specification-driven contexts can improve code quality, but security and test coverage must be explicitly addressed in the development process.

---

## Methodology Summary for Research Paper

### Multi-Dimensional Reporting (Primary Outcomes)

This study employs **three independent measurement standards** to assess code quality objectively:

**1. Functional Correctness Evaluation**
- **Method:** Automated acceptance tests using Jest
- **Test Scenarios:** Defined in `scenarios_*.md` files for each version
- **Coverage:** Standard scenarios + edge cases (race conditions, transaction atomicity, boundary values)
- **Metrics:** Pass/fail rates, test count, edge case performance

**2. SonarQube Static Analysis**
- **Method:** Automated static code analysis
- **Metrics:**
  - Security Vulnerabilities (count)
  - Reliability Issues / Bugs (count)
  - Maintainability Issues / Code Smells (count)
  - Security Hotspots (count)
  - Test Coverage (percentage)
  - Code Duplications (percentage)
- **Lines of Code:** 9,285 total across all versions

**3. CodeQL Security Analysis**
- **Method:** Automated security vulnerability detection
- **Metrics:** Critical security issues (presence/absence)
- **Coverage:** v.3-v.8 (v.9-v.11 reports not available)

### Note on Subjective Assessments

**Rubric-Based Quality Score** (if included) should be reported as a **secondary outcome** with explicit acknowledgment of:
- Single-rater assessment (no inter-rater reliability)
- Architecture-centric focus (may not align with quantitative metrics)
- Retrospective application

**Scoring Process:**
- Single expert reviewer using predefined rubric
- Systematic application of rubric criteria (4 dimensions × 0-3 points)
- Retrospective application to ensure consistency
- Documentation of scoring rationale based on observable code characteristics

**Important Limitations:**
- ⚠️ **Single Rater**: No inter-rater reliability measures were calculated (Cohen's κ, ICC not applicable)
- ⚠️ **No Test-Retest**: Test-retest reliability was not assessed
- ⚠️ **Potential Bias**: Single-rater assessment may introduce personal bias
- ⚠️ **Retrospective Application**: Rubric developed after initial assessments

**Mitigation Strategies:**
- Rubric-based scoring reduces subjectivity compared to holistic ratings
- Transparent, observable criteria (see Table 1)
- Reproducible scoring process

**Scope and Limitations:**
- Quality Score focuses on architecture-centric assessment and best practices
- It may not always align with quantitative metrics (e.g., code duplications, security vulnerabilities)
- Quality Score is a secondary outcome and should be interpreted alongside primary quantitative metrics
- The rubric emphasizes structural quality over bug counts or security issues
- **Single-rater assessment limits generalizability** - results should be interpreted with caution

**For Paper Appendix:**
- Include Table 1 (Quality Score Rubric) in appendix
- **Explicitly acknowledge single-rater limitation**
- Acknowledge that inter-rater reliability was not assessed
- Clarify that Quality Score is architecture-centric and may differ from quantitative metrics
- Recommend future work with multiple raters and reliability measures

---

*This evaluation demonstrates the necessity of structured, specification-driven contexts for generating reproducible and production-ready software with large language models, while highlighting that security considerations must be explicitly incorporated into the development process. The rubric-based assessment provides a systematic, reproducible method for evaluating structural quality, complementing quantitative metrics from automated analysis tools.*


ข้อแนะนำเพิ่มเติมสำหรับการเขียนเล่มวิจัย:
Section III (Methodology): ให้อธิบายหัวข้อ "Multi-Dimensional Reporting" ว่าเป็นการใช้ 3 มาตรฐานการวัดที่อิสระต่อกัน เพื่อลดความลำเอียงจากการประเมินโดยมนุษย์

Section IV (Results): ให้ใช้ตาราง "Results by Version" จาก SonarQube เป็นตารางหลัก (Primary Table) เพราะเป็นข้อมูลที่หนักแน่นที่สุด

Section V (Discussion): ให้อภิปรายเรื่อง "Test Coverage 0.0%" อย่างจริงจัง เพราะเป็นจุดอ่อนที่พบในทุกวิธีการ ซึ่งจะเป็นข้อเสนอแนะที่สำคัญมากสำหรับวงการ AI Code Generation