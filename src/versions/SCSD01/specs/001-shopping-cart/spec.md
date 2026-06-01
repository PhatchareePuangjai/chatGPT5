# Feature Specification: Shopping Cart Core Behaviors

**Feature Branch**: `001-shopping-cart`

**Created**: 2026-06-01

**Status**: Draft

**Input**: User description: "Create a specification based on the requirements in scenarios_cart.md"

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.

  Constitution alignment: Each acceptance scenario MUST map to at least one test
  (backend, frontend, or both depending on the change).

  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Update Item Quantity (Priority: P1)

As a shopper, I can increase or decrease the quantity of an item already in my cart,
and the cart totals update immediately and correctly.

**Why this priority**: Quantity updates are a core cart workflow; incorrect totals break trust.

**Independent Test**: With a cart containing one item, changing the quantity updates the
item's line total and the cart grand total accurately.

**Acceptance Scenarios**:

1. **Given** a cart contains item A priced 100.00 with quantity 1, **When** I set quantity to 3,
   **Then** the item quantity is 3, the line total is 300.00, and the cart grand total updates accordingly.
2. **Given** a cart contains item A priced 100.00 with quantity 3, **When** I set quantity back to 1,
   **Then** the item quantity is 1, the line total is 100.00, and the cart grand total updates accordingly.

---

### User Story 2 - Merge Duplicate Add-To-Cart Items (Priority: P2)

As a shopper, adding the same product (same SKU) to my cart multiple times does not
create duplicate rows; it merges into the existing cart line and enforces stock limits.

**Why this priority**: Duplicate rows cause confusion, incorrect totals, and downstream errors.

**Independent Test**: With an existing cart line for a SKU, adding the same SKU again merges
quantities into that line without creating a new line.

**Acceptance Scenarios**:

1. **Given** the cart already has SKU-001 with quantity 1, **When** I add SKU-001 with quantity 2,
   **Then** the cart contains exactly one line for SKU-001 with quantity 3 (no duplicate rows).
2. **Given** the cart already has SKU-001 with quantity 1 and available stock is 2, **When** I try
   to add SKU-001 with quantity 2, **Then** the system rejects the change and keeps the cart quantity unchanged.

---

### User Story 3 - Save For Later (Priority: P3)

As a shopper, I can move an item from my active cart to a "Saved for later" list so it
no longer contributes to checkout totals.

**Why this priority**: Enables realistic cart management and aligns with expected e-commerce behavior.

**Independent Test**: Starting with an active cart item, saving it moves it out of the checkout list and
reduces totals appropriately.

**Acceptance Scenarios**:

1. **Given** the cart contains SKU-005 with status Active, **When** I choose "Save for later" for SKU-005,
   **Then** SKU-005 no longer appears in the active checkout list and appears in the saved items list with status Saved.
2. **Given** the cart grand total includes SKU-005 while it is Active, **When** I save SKU-005 for later,
   **Then** the cart grand total decreases by SKU-005's contribution.

---

### Edge Cases

- **Add more than available stock**:
  - If stock available is 5 and the cart already contains 3, attempting to add 3 more (total 6) is rejected.
  - The cart quantity remains 3 and the user sees a clear error message indicating insufficient stock.
- **Money precision and formatting**:
  - For a price of 19.99 and quantity 3, the displayed total is exactly 59.97 (no floating-point artifacts).
- **Immediate totals**:
  - After any cart mutation (quantity update, merge add-to-cart, save for later), line totals and grand totals reflect the new state without requiring a manual refresh.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow shoppers to view a cart containing line items with quantity, unit price, line total, and item status (Active or Saved).
- **FR-002**: System MUST allow shoppers to update an existing cart line's quantity and recalculate line total and cart grand total immediately.
- **FR-003**: System MUST merge add-to-cart operations for an existing SKU into a single cart line (no duplicate rows for the same SKU in the same status).
- **FR-004**: System MUST prevent cart quantity for any SKU from exceeding available stock when adding or increasing quantity.
- **FR-005**: When a stock limit would be exceeded, the system MUST reject the change, preserve the previous cart state, and present a user-understandable error.
- **FR-006**: System MUST support saving an active cart item for later, moving it to a saved list and excluding it from checkout totals.
- **FR-007**: System MUST compute monetary values using a money-safe approach so displayed totals are exact to two decimal places.
- **FR-008**: System MUST ensure cart totals (line totals and grand total) reflect only Active items.
- **FR-009**: System MUST ensure cart operations are idempotent at the user intent level (e.g., a repeated "add same SKU with quantity N" results in the same merged quantity outcome as intended, not duplicates).

### Key Entities *(include if feature involves data)*

- **Cart**: A collection of cart items for a shopper; has a grand total for Active items.
- **Cart Item**: Represents a product in the cart; attributes include SKU, unit price, quantity, status (Active/Saved), line total.
- **Inventory Item**: Represents available stock for a SKU; used to enforce stock limits during cart updates.
- **Money Amount**: Represents currency values with exact decimal handling and formatting rules.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of acceptance scenarios in this spec pass in automated test runs.
- **SC-002**: Cart totals shown to users match expected arithmetic to two decimal places for all tested cases (including 19.99 * 3 = 59.97).
- **SC-003**: Attempting to exceed available stock never results in an incorrect cart state (no transient overstock state visible to the user).
- **SC-004**: Users can complete each user story's primary flow (update quantity, merge add-to-cart, save for later) without errors in normal operation.

## Assumptions

- Shoppers have stable internet connectivity during cart interactions.
- Only one currency is in use for a given cart; amounts are displayed with two decimal places.
- The system has access to an authoritative current stock value per SKU at the time of cart mutation.
- Taxes, shipping, promotions/discounts, and multi-warehouse inventory allocation are out of scope for this feature slice.
- Authentication and shopper identity mechanisms are out of scope; the cart is associated with a shopper context that already exists.
