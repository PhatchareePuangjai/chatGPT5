# Evaluating AI-Generated Code Quality from Basic Prompting to Spec-Driven Development

## Abstract

Unstructured prompt-based code generation often fails to produce reliable software when applied to complex domains such as e-commerce systems. This paper presents an empirical evaluation of AI-generated code quality by comparing three interaction strategies: **Basic Prompting**, **Context Engineering**, and **Specification-Driven Development (SDD)**. Using a controlled e-commerce testbed, code quality is evaluated along two dimensions. Functional Correctness is assessed through automated acceptance tests and concurrency-focused edge-case scenarios, while Structural Quality and security properties are analyzed using static analysis tools, including SonarQube and CodeQL.

## Key Findings

### 1. Specification-Driven Development (SDD) Yields Superior Results

**Evidence:**
- **Average Quality Score:** 4.33⭐ (highest among all methods)
- **Best Implementation:** Achieved 5⭐ quality rating with Clean Architecture
- **Architecture Patterns:** Repository Pattern, Service Layer, Error Factory
- **Code Organization:** Extracted Functions, Structured Logging, Event Logging
- **Code Duplications:** Achieved 0.0% in best implementations
- **Security:** Zero security vulnerabilities in best implementations

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

### 2. Context Engineering Improves Error Handling and Reduces Code Duplications

**Evidence:**
- **Average Quality Score:** 3.67⭐
- **Code Duplications:** Average 4.5% (best implementation achieved 0.0%)
- **Error Handling:** Structured error codes (`BAD_REQUEST`, `INSUFFICIENT_STOCK`, `COUPON_EXPIRED`)
- **Transaction Atomicity:** Improved atomic operations (low stock alerts within transactions)

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

### 3. Basic Prompting Provides Good Starting Point but Has Limitations

**Evidence:**
- **Average Quality Score:** 3.33⭐
- **Code Duplications:** Average 30.4% (worst implementation: 65.5%)
- **Reliability:** Best implementation achieved 1 reliability issue (lowest)
- **Features:** Successfully implemented Service Layer, Transaction Helpers, Zod validation

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

## Experimental Results

### Code Quality Metrics Comparison

| Development Method | Avg Quality Score | Avg Code Duplications | Best Security | Best Reliability | Architecture Evolution |
|-------------------|------------------|----------------------|---------------|------------------|----------------------|
| **Basic Prompting** | 3.33⭐ | 30.4% | 0 vulnerabilities | 1 issue (best) | Monolithic → Service Layer |
| **Context Engineering** | 3.67⭐ | 4.5% | 0 vulnerabilities | 9 issues | Better Structure |
| **Specification-Driven Development** | 4.33⭐ | 12.6% | 0 vulnerabilities | 8 issues | Clean Architecture ✅ |

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
- ✅ Excellent security (0 vulnerabilities in best implementations)
- ⚠️ Some implementations have vulnerabilities (worst: 5)

### 4. Test Coverage

**All Methods:**
- ❌ Test Coverage: 0.0% across all implementations
- ⚠️ This is a critical limitation affecting all evaluation methods
- Recommendation: Future work should include comprehensive test coverage

## Conclusions

1. **Specification-Driven Development produces the highest quality code** with Clean Architecture, structured error handling, and comprehensive validation. The best implementations achieved 5⭐ quality rating with 0.0% code duplications and zero security vulnerabilities.

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

*This evaluation demonstrates the necessity of structured, specification-driven contexts for generating reproducible and production-ready software with large language models.*
