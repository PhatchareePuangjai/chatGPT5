from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CartItem(BaseModel):
    id: str
    price: float
    quantity: int

class PromotionRequest(BaseModel):
    cart_total: float
    coupons: List[str]
    user_id: Optional[str] = None

class PromotionResponse(BaseModel):
    original_total: float
    discount_amount: float
    final_total: float
    message: str

# Mock Database
COUPONS_DB = {
    "SAVE100": {
        "type": "fixed",
        "value": 100,
        "min_purchase": 500,
        "expires_at": datetime.now() + timedelta(days=30),
        "usage_limit_per_user": None
    },
    "10PERCENT": {
        "type": "percentage",
        "value": 10,
        "min_purchase": 0,
        "expires_at": datetime.now() + timedelta(days=30),
        "usage_limit_per_user": None
    },
    "EXPIRED": {
        "type": "fixed",
        "value": 50,
        "min_purchase": 0,
        "expires_at": datetime.now() - timedelta(days=1),
        "usage_limit_per_user": None
    },
    "WELCOME": {
        "type": "fixed",
        "value": 50,
        "min_purchase": 0,
        "expires_at": datetime.now() + timedelta(days=30),
        "usage_limit_per_user": 1
    }
}

USER_COUPON_USAGE = {
    "user123": {
        "WELCOME": 1
    }
}

@app.get("/")
def read_root():
    return {"message": "Promotions API"}

@app.post("/api/calculate_discount", response_model=PromotionResponse)
def calculate_discount(request: PromotionRequest):
    total = request.cart_total
    discount_amount = 0
    message = "Calculation successful"
    
    # Sort coupons simply to apply percentage first, then fixed, to follow standard logic
    # In a real app, logic might be more complex
    applied_coupons = []
    
    for code in request.coupons:
        if code not in COUPONS_DB:
            raise HTTPException(status_code=400, detail=f"Coupon {code} not found")
            
        coupon = COUPONS_DB[code]
        
        # 1. Expiration Date Check
        if coupon["expires_at"] < datetime.now():
            raise HTTPException(status_code=400, detail=f"คูปองหมดอายุ")
            
        # 2. Minimum Purchase Check
        if total < coupon["min_purchase"]:
            raise HTTPException(status_code=400, detail=f"ต้องซื้อขั้นต่ำ {coupon['min_purchase']} บาท")
            
        # 3. Usage Limit Check
        if coupon["usage_limit_per_user"] is not None:
            if not request.user_id:
                raise HTTPException(status_code=400, detail="User ID required for this coupon")
            usage_count = USER_COUPON_USAGE.get(request.user_id, {}).get(code, 0)
            if usage_count >= coupon["usage_limit_per_user"]:
                raise HTTPException(status_code=400, detail="คุณใช้สิทธิ์ครบแล้ว")
                
        applied_coupons.append(coupon)

    # Sort applied_coupons: percentage first, then fixed (This handles Order of Operations)
    applied_coupons.sort(key=lambda c: 0 if c["type"] == "percentage" else 1)

    temp_total = total
    for coupon in applied_coupons:
        if coupon["type"] == "percentage":
            discount = temp_total * (coupon["value"] / 100.0)
            discount_amount += discount
            temp_total -= discount
        elif coupon["type"] == "fixed":
            discount_amount += coupon["value"]
            temp_total -= coupon["value"]

    # Negative Total Protection
    final_total = max(0, total - discount_amount)
    actual_discount = total - final_total

    return PromotionResponse(
        original_total=total,
        discount_amount=actual_discount,
        final_total=final_total,
        message="ใช้คูปองสำเร็จ" if applied_coupons else "ไม่มีส่วนลด"
    )
