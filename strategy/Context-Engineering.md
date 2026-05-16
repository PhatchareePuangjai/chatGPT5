# Context Engineering — Initial Prompt

**1. ระบบจัดการสินค้าคงคลัง (Inventory Management System - IMCE01)**
```text
[Instruction & Role]
Act as an expert Full-stack Developer and System Architect.

[Tech Spec]
- Frontend: React ^18.3.1
- Backend: Node.js
- Database: PostgreSQL

[Business Scenarios]
- Successful Stock Deduction
- Low Stock Alert Trigger (stock <= 5)
- Stock Restoration

[Constraints]
- Handle Race Condition (5 concurrent requests)
- Ensure Transaction Atomicity (rollback on failure)
- Prevent Overselling

[Deliverables]
- Backend API with PostgreSQL integration
- Frontend dashboard
- Dockerfile and docker-compose.yml for full-stack deployment
- README.md with run instructions and verification steps for
  Low Stock Alert (<= 5) and Race Condition

[Self-Refinement Task]
After generating, review your output for correctness,
missing edge cases, and code quality before finalizing.
Bundle all generated code with a clear structure and
zip all code to me.
```

**2. ระบบตะกร้าสินค้า (Shopping Cart System - SCCE01)**
```text
[Instruction & Role] 
Act as an expert Full-stack Developer and System Architect. I need you to develop the Shopping Cart System for an e-commerce application.

[Tech Spec] 
- Frontend: React ^18.3.1
- Backend: Node.js
- Database: PostgreSQL

[Business Scenarios] 
- Update Item Quantity: Users must be able to change the quantity of items in their cart.
- Merge Items Logic: If a user adds an item that is already in the cart, merge the quantities instead of adding a new row.
- Save for Later: Allow users to move items from the active cart to a "save for later" list.
- Calculate Total: Dynamically calculate the total price of the items in the cart.

[Constraints & Edge Cases] 
- Add More Than Stock: Validate stock before adding or updating. The current cart quantity + new quantity must not exceed the available stock.
- Floating Point Calculation: Handle precise decimal math for currency (e.g., 19.99 * 3 = 59.97) to prevent floating-point precision loss.

[Deliverables] 
Provide production-ready code for the backend API controllers, frontend React components, and the database schema.

[Self-Refinement Task] 
Before providing the final output, review your code to ensure floating-point precision vulnerabilities are mitigated and stock limit validation is strictly enforced.
```

---

**3. ระบบโปรโมชันและส่วนลด (Promotions & Discounts System - PDCE01)**
```text
[Instruction & Role] 
Act as an expert Full-stack Developer and System Architect. I need you to develop the Promotions & Discounts System for an e-commerce application.

[Tech Spec] 
- Frontend: React ^18.3.1
- Backend: Node.js
- Database: PostgreSQL

[Business Scenarios] 
- Coupon Validation: Validate promo codes entered by the user.
- Expiration Date Check: Ensure the applied coupon is not expired.
- Cart Total Discount: Calculate the discount amount based on the cart total.

[Constraints & Edge Cases] 
- Coupon Usage Limit: Enforce per-user usage limits for each coupon.
- Order-of-Operations: If multiple discount rules apply, you must calculate percentage (%) discounts before applying flat amount discounts.
- Negative Total Protection: Ensure that discounts never cause the final cart total to drop below zero.

[Deliverables] 
Provide production-ready code for the backend API controllers, frontend React components, and the database schema.

[Self-Refinement Task] 
Before providing the final output, review your code to ensure the order of operations for multiple discounts is mathematically correct and the final total strictly prevents negative values.
```
```

**💡 จุดที่แตกต่างจาก Basic Prompting อย่างชัดเจน:**
1. **มีหัวข้อโครงสร้าง (Structured Sections):** ใช้ `[วงเล็บเหลี่ยม]` เพื่อแบ่งสัดส่วนคำสั่งให้ AI อ่านง่ายและเป็นทางการ
2. **ใส่ Edge Cases ลงไปตั้งแต่แรก:** ใน `[Constraints & Edge Cases]` มีการดักปัญหาเรื่องทศนิยม, สต็อกเกิน, ยอดติดลบ และลำดับการคำนวณไว้เลย เพื่อไม่ให้เกิดวงจรการพิมพ์กลับไปกลับมาเพื่อแก้บั๊ก (Debug iteration) แบบในวิธี Basic Prompting,
3. **กำหนดบทบาทและสั่งให้รีวิวตัวเอง:** ใช้คำสั่ง `Act as an expert...` และมี `[Self-Refinement Task]` บังคับให้ AI ตรวจสอบโค้ดตัวเองก่อนส่งคำตอบ,