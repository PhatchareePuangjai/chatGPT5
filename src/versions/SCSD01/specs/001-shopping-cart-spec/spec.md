# Feature Specification: Shopping Cart Scenarios

**Feature Branch**: `001-shopping-cart-spec`  
**Created**: 2026-04-03  
**Status**: Draft  
**Input**: User description: "Create a specification based on the requirements in scenarios_cart.md"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Update Item Quantity (Priority: P1)

As a shopper, I want to increase or decrease the quantity of a cart item so that my
cart reflects the exact number of units I plan to buy.

**Why this priority**: Quantity updates are a primary cart action and must be correct
for checkout accuracy.

**Independent Test**: With a cart containing one item, the user can change quantity
and see the line total and cart total update correctly.

**Acceptance Scenarios**:

1. **Given** an item A priced at 100 with quantity 1 in the cart, **When** the user
   increases the quantity to 3, **Then** the item quantity becomes 3, the line total
   becomes 300, and the cart total increases accordingly.
2. **Given** a cart with multiple items, **When** the user changes the quantity of a
   single item, **Then** only that item’s line total and the cart total update, and
   other item quantities remain unchanged.

---

### User Story 2 - Merge Duplicate Items (Priority: P2)

As a shopper, I want adding the same product again to increase its quantity instead
of creating duplicate rows, so the cart stays clear and accurate.

**Why this priority**: Duplicate rows create confusion and can lead to incorrect
totals or checkout errors.

**Independent Test**: Adding the same SKU twice results in one cart row with a summed
quantity that respects available stock.

**Acceptance Scenarios**:

1. **Given** the cart already contains SKU-001 with quantity 1, **When** the user
   adds SKU-001 with quantity 2 again, **Then** the cart keeps one row for SKU-001
   with quantity 3 and recalculates totals.
2. **Given** a stock limit for SKU-001, **When** the user adds quantities that would
   exceed stock, **Then** the cart rejects the addition, shows a clear stock warning,
   and preserves the existing quantity.

---

### User Story 3 - Save for Later (Priority: P3)

As a shopper, I want to move items out of the active cart into a “Saved for Later”
area so I can postpone purchasing without losing the item.

**Why this priority**: It supports flexible purchasing decisions without removing
items permanently.

**Independent Test**: Moving an item to “Saved for Later” removes it from active
checkout totals and shows it in a saved list.

**Acceptance Scenarios**:

1. **Given** SKU-005 is in the active cart, **When** the user selects “Save for
   Later,” **Then** SKU-005 is removed from the active cart, the cart total decreases
   accordingly, and the item appears in the saved list.

---

### Edge Cases

- Exceeding stock: When the user attempts to increase quantity beyond available
  stock, the system rejects the action, shows a “Not enough stock” message, and
  keeps the previous quantity.
- Decimal pricing: When the item price has cents (e.g., 19.99) and quantity 3, the
  line total displays exactly 59.97 with correct rounding.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to update the quantity of items already in the
  cart.
- **FR-002**: System MUST recalculate and display the line total and cart total
  immediately after a quantity change.
- **FR-003**: System MUST merge duplicate items by SKU into a single cart line when
  added again.
- **FR-004**: System MUST prevent quantity changes that exceed available stock and
  display a clear stock warning.
- **FR-005**: System MUST allow users to move items from the active cart to a
  “Saved for Later” list.
- **FR-006**: System MUST remove saved items from active cart totals.
- **FR-007**: System MUST calculate decimal prices with correct rounding and display
  results without floating-point artifacts.

### Key Entities *(include if feature involves data)*

- **Cart Item**: Represents a product in the cart, including SKU, unit price,
  quantity, line total, and status (Active or Saved).
- **Cart**: Represents the user’s current cart, containing cart items and a cart
  total.
- **Inventory Snapshot**: Represents the available stock for each SKU at the time of
  cart update.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of quantity updates correctly change line totals and cart totals
  in acceptance testing.
- **SC-002**: 100% of duplicate-item additions result in a single cart line with the
  summed quantity, or a stock warning if limits are exceeded.
- **SC-003**: 100% of “Save for Later” actions remove the item from active totals and
  show it in the saved list.
- **SC-004**: Price calculations with decimals display exact expected totals for
  standard test cases (e.g., 19.99 × 3 = 59.97).
- **SC-005**: Users see cart total updates within 1 second of quantity or save
  actions during acceptance testing.

## Assumptions

- Prices are displayed in Thai baht and include two decimal places when needed.
- Stock availability is checked at the time of a cart update action.
- The cart supports at least one active list and one saved list for items.
- If stock is insufficient, the previous quantity remains unchanged.
