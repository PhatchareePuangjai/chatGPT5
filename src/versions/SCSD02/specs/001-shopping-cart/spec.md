# Feature Specification: Shopping Cart Core Behaviors

**Feature Branch**: `001-shopping-cart`

**Created**: 2026-05-24

**Status**: Draft

**Input**: User description: "Create a specification based on the requirements in scenarios_cart.md"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Update Item Quantity (Priority: P1)

As a shopper, I want to increase or decrease the quantity of an item already in my cart so that my
cart reflects what I intend to buy and the totals update immediately.

**Why this priority**: Quantity changes are a core cart action and directly affect what the user pays.

**Independent Test**: Add a single item to the cart, change its quantity, and verify quantity, line
total, and cart grand total update correctly.

**Acceptance Scenarios**:

1. **Given** the cart contains product A priced at 100.00 with quantity 1, **When** the user changes
   the quantity to 3, **Then** the item quantity becomes 3, the line total becomes 300.00, and the
   cart grand total reflects the change immediately.

---

### User Story 2 - Merge Duplicate Items (Priority: P2)

As a shopper, when I add a product that is already in my cart, I want the cart to merge the new
quantity into the existing cart line so that the cart stays clean and the quantity remains valid.

**Why this priority**: Prevents duplicate rows and ensures cart quantity reflects the real intent
and stock constraints.

**Independent Test**: Put one SKU into the cart, add the same SKU again from a product page, and
verify the cart still has one line with the merged quantity and that stock limits are enforced.

**Acceptance Scenarios**:

1. **Given** the cart already contains SKU-001 with quantity 1, **When** the user adds SKU-001 again
   with quantity 2, **Then** the cart MUST NOT create a new line, the existing line quantity becomes
   3, and the result MUST be rejected if it exceeds available stock.

---

### User Story 3 - Save For Later (Priority: P3)

As a shopper, I want to move an item from my active cart to a "Saved for later" list so that I can
keep it for consideration without paying for it now.

**Why this priority**: Supports common shopping behavior and ensures totals reflect only items being
checked out.

**Independent Test**: Put an item in the cart, save it for later, and verify it is removed from the
active cart, appears in the saved list, and totals decrease accordingly.

**Acceptance Scenarios**:

1. **Given** the cart contains SKU-005 as an active cart item, **When** the user selects "Save for
   later" on SKU-005, **Then** SKU-005 is removed from the active cart list, the cart total decreases
   by the SKU-005 line total, and SKU-005 appears in the saved items list with status "Saved".

---

### Edge Cases

- Adding more than stock:
  - **Given** available stock is 5 and the cart already contains quantity 3 of the same product,
    **When** the user attempts to add 3 more (total 6), **Then** the system rejects the update, shows
    a clear "insufficient stock" message, and keeps the cart quantity at 3.
- Currency precision:
  - **Given** a unit price of 19.99 and quantity 3, **When** totals are calculated and displayed,
    **Then** the line total MUST be exactly 59.97 (to 2 decimal places) with no visible floating
    point artifacts.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to view their cart items with unit price, quantity, and line
  totals.
- **FR-002**: System MUST allow users to change an existing cart item's quantity.
- **FR-003**: System MUST update the item quantity, line total, and cart grand total immediately
  after a quantity change.
- **FR-004**: System MUST merge quantities when the user adds a product that already exists in the
  cart, without creating duplicate cart rows for the same product.
- **FR-005**: System MUST validate cart quantities against available stock and MUST reject any
  change that would exceed available stock.
- **FR-006**: When a stock validation fails, the system MUST show a clear user-facing message and
  MUST NOT alter the previously valid cart quantity.
- **FR-007**: Users MUST be able to move an active cart item to a saved-for-later list.
- **FR-008**: Saved-for-later items MUST NOT be included in checkout totals.
- **FR-009**: System MUST calculate and display monetary values to 2 decimal places with correct
  currency precision.
- **FR-010**: System MUST keep cart totals consistent across all cart operations (add, merge,
  quantity update, save-for-later).

### Key Entities *(include if feature involves data)*

- **Product**: A purchasable item identified by a SKU, with a unit price and an available stock
  quantity.
- **Cart**: The user's current shopping cart containing active cart items and a computed grand
  total.
- **Cart Item**: A line item in the active cart for a specific product, including quantity and line
  total.
- **Saved Item**: A product moved out of the active cart into a saved list; excluded from cart
  totals.
- **Inventory/Stock**: The available quantity for a product used to validate cart quantity changes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: For quantity updates and add-to-cart merges, the updated cart totals are visible to
  the user within 1 second of the action completing.
- **SC-002**: In a test suite covering defined scenarios, 100% of line totals and grand totals match
  expected values to 2 decimal places.
- **SC-003**: When a user attempts to exceed stock, the cart quantity remains unchanged and the user
  receives a clear "insufficient stock" message in 100% of test cases.
- **SC-004**: Saved-for-later items are excluded from checkout totals in 100% of test cases.

## Assumptions

- The system operates in a single currency per cart session (currency formatting is out of scope for
  this feature).
- The system has access to a current available stock quantity for each product at the time of cart
  updates.
- A "cart" is associated with a user identity or session; how identity is established is out of
  scope for this feature.
- Promotions, discounts, shipping, taxes, and coupons are out of scope unless explicitly added by a
  future feature.
