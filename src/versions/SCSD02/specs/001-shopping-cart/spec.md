# Feature Specification: Shopping Cart System

**Feature Branch**: `001-shopping-cart`

**Created**: 2026-05-24

**Status**: Draft

**Input**: User description: "Create a specification based on the requirements in scenarios_cart.md"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Update Item Quantity (Priority: P1)

A shopper updates the quantity of an item already in the cart and immediately sees the
item quantity, line total, and cart grand total reflect the change.

**Why this priority**: Quantity updates are the core cart behavior and directly affect
purchase totals.

**Independent Test**: Can be fully tested by starting with one active cart item,
changing its quantity, and verifying the displayed quantity and totals.

**Acceptance Scenarios**:

1. **Given** product A costs 100 baht and has quantity 1 in the cart, **When** the
   shopper increases the quantity to 3, **Then** the cart shows quantity 3, a line
   total of 300 baht, and an updated grand total immediately.
2. **Given** a cart contains multiple active items, **When** the shopper changes the
   quantity for one item, **Then** only that item's quantity and line total change and
   the grand total reflects the new cart total.

---

### User Story 2 - Merge Duplicate Cart Items (Priority: P2)

A shopper adds more units of a product that is already in the cart and the cart merges
the new quantity into the existing row instead of creating a duplicate line.

**Why this priority**: Merging duplicate products keeps the cart understandable and
prevents quantity and stock calculations from being split across rows.

**Independent Test**: Can be tested by adding an item with the same SKU to a cart that
already contains that SKU and verifying the row count and merged quantity.

**Acceptance Scenarios**:

1. **Given** the cart already contains SKU-001 with quantity 1, **When** the shopper
   adds 2 more units of SKU-001 from a product page, **Then** the cart keeps one row
   for SKU-001 and updates the quantity to 3.
2. **Given** the merged quantity would exceed available stock, **When** the shopper
   adds more units of the same SKU, **Then** the cart rejects the addition and keeps the
   original quantity unchanged.

---

### User Story 3 - Save Item For Later (Priority: P3)

A shopper moves an active cart item to a saved-items list so it is removed from the
checkout total while remaining available for later consideration.

**Why this priority**: Saving items for later supports common shopping behavior without
forcing users to remove products they may still want.

**Independent Test**: Can be tested by moving one active item to saved items and
verifying it no longer appears in the checkout cart or grand total.

**Acceptance Scenarios**:

1. **Given** SKU-005 is active in the cart, **When** the shopper selects "Save for
   Later" for SKU-005, **Then** SKU-005 is removed from the checkout cart, the cart
   total decreases by that item's price, and SKU-005 appears in saved items.
2. **Given** the cart contains active and saved items, **When** totals are displayed,
   **Then** only active cart items contribute to the checkout total.

---

### Edge Cases

- When a product has only 5 units in stock, the cart already contains 3 units, and the
  shopper tries to add 3 more units, the cart MUST reject the change, display
  "สินค้าไม่เพียงพอ", and keep the quantity at 3.
- When a product priced at 19.99 is added with quantity 3, the line total MUST display
  exactly 59.97 and MUST NOT display floating-point artifacts such as
  59.9700000000004.
- When a shopper attempts to set a quantity below 1, the cart MUST require a valid
  positive quantity or direct the shopper to remove/save the item instead.
- When an item is saved for later, it MUST be excluded from all checkout totals until
  it is returned to the active cart.

### User Experience Requirements *(mandatory for user-facing changes)*

- **UX-001**: Cart rows MUST show product identity, active quantity controls, line
  total, stock-related feedback, and a "Save for Later" action using the existing cart
  page terminology and interaction style.
- **UX-002**: The cart MUST provide clear empty-cart, saved-items-empty, loading,
  validation error, and stock rejection states without losing the shopper's current
  cart context.
- **UX-003**: Quantity controls and "Save for Later" actions MUST be keyboard
  accessible, screen-reader understandable, and usable on supported mobile and desktop
  viewport sizes.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow shoppers to update the quantity of an active cart item.
- **FR-002**: System MUST recalculate each affected line total immediately after a
  quantity change.
- **FR-003**: System MUST recalculate the active cart grand total immediately after any
  quantity, merge, or save-for-later change.
- **FR-004**: System MUST merge added units into an existing cart row when the added
  product has the same SKU as an active cart item.
- **FR-005**: System MUST prevent duplicate active rows for the same SKU in the same
  cart.
- **FR-006**: System MUST validate requested quantities against available stock by
  considering the current cart quantity plus the newly requested quantity.
- **FR-007**: System MUST reject any quantity update or add-to-cart action that would
  exceed available stock.
- **FR-008**: System MUST display the message "สินค้าไม่เพียงพอ" when a requested
  quantity exceeds available stock.
- **FR-009**: System MUST keep the existing cart quantity unchanged when a stock
  validation failure occurs.
- **FR-010**: System MUST move an active item to saved items when the shopper selects
  "Save for Later".
- **FR-011**: System MUST exclude saved items from checkout item lists and active cart
  totals.
- **FR-012**: System MUST include saved items in a separate saved-items list.
- **FR-013**: System MUST calculate currency totals exactly to two decimal places for
  display.
- **FR-014**: System MUST avoid displaying floating-point precision artifacts in line
  totals and grand totals.

### Key Entities *(include if feature involves data)*

- **Cart**: A shopper-owned collection containing active items for checkout and saved
  items for later.
- **Cart Item**: A product entry in a cart with SKU, unit price, quantity, line total,
  stock limit, and status.
- **Product Stock**: The available stock count used to validate cart quantities for a
  SKU.

### API And Data Requirements *(include if feature touches backend or storage)*

- **API-001**: Cart quantity changes, add-to-cart requests, and save-for-later actions
  MUST return the updated cart state, including active items, saved items, line totals,
  stock messages, and grand total.
- **API-002**: Rejected stock changes MUST return a user-displayable stock error while
  preserving the existing cart state.
- **DATA-001**: Cart item status MUST distinguish active checkout items from saved
  items.
- **DATA-002**: The cart data model MUST support one active row per SKU per cart.
- **DATA-003**: Monetary values MUST be stored or represented in a way that preserves
  exact two-decimal currency calculations.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of accepted quantity changes update the displayed quantity, line
  total, and grand total in the same user interaction.
- **SC-002**: 100% of duplicate add-to-cart actions for an existing SKU result in one
  active row with the correct merged quantity.
- **SC-003**: 100% of over-stock add attempts are rejected with "สินค้าไม่เพียงพอ" and
  leave the previous cart quantity unchanged.
- **SC-004**: 100% of saved-for-later items are removed from checkout totals and shown
  in saved items.
- **SC-005**: Currency totals display exactly two decimal places for all tested cart
  calculations.

### Performance Outcomes *(mandatory)*

- **PERF-001**: Shoppers see updated cart totals within 1 second after changing
  quantity, adding a duplicate item, or saving an item for later under normal service
  conditions.
- **PERF-002**: Cart interactions remain responsive on supported mobile and desktop
  views, with visible feedback for any operation that takes longer than 500
  milliseconds.

## Assumptions

- Prices are shown in baht unless a future feature introduces multi-currency support.
- The same shopper cannot have more than one active cart row for the same SKU.
- Saved items remain associated with the shopper's cart and can be displayed separately
  from active checkout items.
- Stock validation uses the latest available stock count at the time the shopper
  submits the cart action.
