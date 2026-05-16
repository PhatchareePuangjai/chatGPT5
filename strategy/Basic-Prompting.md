### Basic Prompting — Initial Prompt

**1. ระบบจัดการสินค้าคงคลัง (Inventory Management System - IMBP01)**
จุดประสงค์ตามงานวิจัย: การตัดสต็อก, การแจ้งเตือนสินค้าใกล้หมด, ประวัติการเคลื่อนไหวของสินค้า

```text
I am building an e-commerce website. I need you to write
code for the Inventory Management System.

Requirements:
Backend (Node.js): Create an API to handle stock updates.
When a user buys an item, deduct the stock. If the stock is
low (less than 5), print a log message. Also, keep a
history of stock changes.

Frontend (React): Create a simple dashboard page to view
current stock levels and a list of low-stock items. Please
provide the code for both the backend controller and the
frontend component.
```

2. ระบบตะกร้าสินค้า (Shopping Cart System - SCBP01) จุดประสงค์ตามงานวิจัย: อัปเดตจำนวนสินค้า, ตรรกะรวมรายการสินค้า (Merge items), และบันทึกไว้ซื้อภายหลัง (Save for later)
```text
I am building an e-commerce website. I need you to write 
code for the Shopping Cart System.

Requirements:
Backend (Node.js): Create an API to handle cart operations. 
Users should be able to update item quantities. If a user adds 
an item that is already in the cart, please merge the items logic 
instead of adding a new row. Also, allow users to save an item 
for later. Calculate the total price of the cart.

Frontend (React): Create a cart page that shows the list of items, 
their quantities, and the total price. Include a button to "save for 
later" for each item. Please provide the code for both the backend 
controller and the frontend component.
```

3. ระบบโปรโมชันและส่วนลด (Promotions & Discounts System - PDBP01) จุดประสงค์ตามงานวิจัย: ตรวจสอบความถูกต้องของคูปอง, คำนวณส่วนลด % จากยอดรวม, และตรวจสอบวันหมดอายุ
```text
I am building an e-commerce website. I need you to write 
code for the Promotions and Discounts System.

Requirements:
Backend (Node.js): Create an API to handle discount codes. 
When a user applies a coupon to their cart, validate the coupon 
and check its expiration date. If it is valid, calculate the 
percentage discount on the cart total. 

Frontend (React): Create a checkout component where users 
can input a promo code. Show the original total, the discount 
amount, and the new total price after the coupon is applied. 
Please provide the code for both the backend controller and the 
frontend component.
```