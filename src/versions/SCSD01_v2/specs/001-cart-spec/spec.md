# Feature Specification: Shopping Cart Scenarios

**Feature Branch**: `001-cart-spec`  
**Created**: 2026-04-05  
**Status**: Draft  
**Input**: User description: "Create a specification based on the requirements in scenarios_cart.md"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Update Item Quantity (Priority: P1)

As a shopper, I want to increase or decrease item quantities in my cart so that
my order reflects the exact number of items I intend to buy.

**Why this priority**: Quantity changes are the core cart workflow and directly
impact order accuracy and totals.

**Independent Test**: Can be fully tested by changing quantities on a cart with
one item and verifying totals update correctly.

**Acceptance Scenarios**:

1. **Given** a cart contains item A priced at 100 THB with quantity 1, **When**
   the user updates the quantity to 3, **Then** the item quantity becomes 3, the
   line total becomes 300 THB, and the cart grand total updates immediately.
2. **Given** a cart contains item A with quantity 3, **When** the user reduces
   the quantity to 1, **Then** the line total and grand total decrease
   accordingly and are displayed correctly.

---

### User Story 2 - Merge Duplicate Items on Add (Priority: P2)

As a shopper, I want adding the same product multiple times to merge into a
single cart line so that the cart stays clear and accurate.

**Why this priority**: Preventing duplicate rows is essential for usability and
correct totals.

**Independent Test**: Can be tested by adding the same SKU multiple times and
verifying only one line item exists with the summed quantity.

**Acceptance Scenarios**:

1. **Given** the cart already has SKU-001 with quantity 1, **When** the user
   adds SKU-001 again with quantity 2, **Then** no new row is created, the
   existing row quantity becomes 3, and the cart total reflects the new quantity.
2. **Given** a product has limited stock, **When** a user adds the same product
   again, **Then** the system validates that the combined quantity does not
   exceed available stock before confirming the update.

---

### User Story 3 - Save for Later (Priority: P3)

As a shopper, I want to move items to a saved list so that I can postpone buying
without losing the product.

**Why this priority**: Save-for-later improves shopping flexibility while
maintaining a clear checkout list.

**Independent Test**: Can be tested by moving one item to saved status and
verifying it is removed from checkout totals and appears in the saved list.

**Acceptance Scenarios**:

1. **Given** SKU-005 is in the active cart list, **When** the user selects
   "Save for Later," **Then** SKU-005 is removed from the active cart list and
   appears in the saved items list.
2. **Given** SKU-005 is saved for later, **When** the cart total is displayed,
   **Then** the saved item price is not included in the cart grand total.

### Edge Cases

- What happens when a user tries to add more items than available stock?
- How does the system prevent floating point rounding errors in totals?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to update item quantities in the cart.
- **FR-002**: System MUST recalculate line totals and grand totals immediately
  after quantity changes.
- **FR-003**: System MUST merge duplicate items of the same SKU into a single
  cart line by summing quantities.
- **FR-004**: System MUST validate that the combined quantity of an item in the
  cart does not exceed available stock.
- **FR-005**: System MUST block additions that exceed stock and display a clear
  error message indicating insufficient stock.
- **FR-006**: System MUST support moving items to a "Saved Items" list.
- **FR-007**: System MUST exclude saved items from the active cart total.
- **FR-008**: System MUST compute currency totals to two decimal places without
  precision errors visible to users.

### Quality, UX, and Performance Requirements

- **QR-001**: UX patterns, terminology, and error messages MUST be consistent
  across cart and product interactions.
- **QR-002**: Performance budgets MUST be defined (or a plan to define them)
  before implementation begins.
- **QR-003**: All new behavior MUST be covered by automated tests.

### Key Entities *(include if feature involves data)*

- **Cart**: The active collection of items intended for checkout.
- **Cart Item**: A product entry in the cart with quantity and price.
- **Product**: The sellable item identified by SKU and unit price.
- **Inventory**: Available stock quantity for each product.
- **Saved Item**: A product moved out of the active cart list.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can update item quantities and see the cart totals refresh
  within 1 second in 95% of interactions.
- **SC-002**: 100% of attempts to exceed available stock are blocked and display
  an "insufficient stock" message.
- **SC-003**: Totals shown to users are accurate to two decimal places in 100%
  of test cases, with no visible rounding artifacts.
- **SC-004**: Users can move items to saved status and verify the active cart
  total excludes those items in all acceptance scenarios.

## Assumptions

- Prices are displayed in a single currency (THB) with two decimal places.
- The cart represents a single user session with one active cart at a time.
- Taxes, promotions, and shipping fees are out of scope for this feature.
- Inventory availability is provided by an existing product catalog or stock
  service.
