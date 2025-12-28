import requests
import subprocess
import time
import json
from concurrent.futures import ThreadPoolExecutor

BASE_URL = "http://localhost:3001/api"

def run_sql(sql):
    cmd = [
        "docker", "exec", "-i", "shop_db",
        "psql", "-U", "postgres", "-d", "shopdb", "-c", sql
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"SQL Error: {result.stderr}")
    return result.stdout

def reset_db():
    # Reset products to known state
    # SKU-001: 10
    # SKU-002: 6
    # SKU-003: 5
    # SKU-004: 1 (for race condition)
    # SKU-005: 5 (for overselling)
    # SKU-006: 7 (for boundary)
    sql = """
    TRUNCATE stock_history CASCADE;
    DELETE FROM products;
    INSERT INTO products (id, sku, name, price_cents, stock) VALUES
    (1, 'SKU-001', 'Product 1', 1000, 10),
    (2, 'SKU-002', 'Product 2', 2000, 6),
    (3, 'SKU-003', 'Product 3', 3000, 5),
    (4, 'SKU-004', 'Product 4', 4000, 1),
    (5, 'SKU-005', 'Product 5', 5000, 5),
    (6, 'SKU-006', 'Product 6', 6000, 7);
    """
    run_sql(sql)

def test_1_successful_deduction():
    print("\n--- Test 1: Successful Stock Deduction ---")
    # Buy 2 of SKU-001 (id=1)
    try:
        res = requests.post(f"{BASE_URL}/purchase", json={"productId": 1, "quantity": 2})
        if res.status_code != 200:
            print(f"FAIL: Expected 200, got {res.status_code} {res.text}")
            return False
        
        # Check DB
        stock_out = run_sql("SELECT stock FROM products WHERE id=1").strip().split('\n')
        # Output format is usually:
        #  stock 
        # -------
        #      8
        # (1 row)
        # We need to parse it carefully
        stock = stock_out[2].strip() if len(stock_out) > 2 else "Error"
        
        if stock == '8':
            print("PASS: Stock reduced to 8")
        else:
            print(f"FAIL: Stock is {stock}, expected 8")
            return False
            
        # Check Log
        log_out = run_sql("SELECT count(*) FROM stock_history WHERE product_id=1 AND change_type='PURCHASE' AND delta=-2").strip().split('\n')
        log_count = log_out[2].strip() if len(log_out) > 2 else "Error"
        
        if log_count == '1':
            print("PASS: Log created")
            return True
        else:
            print(f"FAIL: Log count is {log_count}")
            return False
    except Exception as e:
        print(f"ERROR: {e}")
        return False

def test_2_low_stock_alert():
    print("\n--- Test 2: Low Stock Alert Trigger ---")
    # SKU-002 has 6. Threshold is 5. Buy 2 -> 4.
    try:
        res = requests.post(f"{BASE_URL}/purchase", json={"productId": 2, "quantity": 2})
        if res.status_code != 200:
            print(f"FAIL: Request failed {res.status_code}")
            return False
            
        stock_out = run_sql("SELECT stock FROM products WHERE id=2").strip().split('\n')
        stock = stock_out[2].strip() if len(stock_out) > 2 else "Error"
        
        if stock == '4':
            print("PASS: Stock reduced to 4")
        else:
            print(f"FAIL: Stock is {stock}")
            return False
        
        print("INFO: Check container logs for '[LOW STOCK]' message.")
        return True
    except Exception as e:
        print(f"ERROR: {e}")
        return False

def test_3_stock_restoration():
    print("\n--- Test 3: Stock Restoration ---")
    # Scenario: SKU-003 has 5. Order 1 (Stock->4). Cancel/Restock 1 (Stock->5).
    # We simulate "Cancel" by calling the restock API.
    
    # 1. Buy 1
    requests.post(f"{BASE_URL}/purchase", json={"productId": 3, "quantity": 1})
    
    # 2. Restock 1
    try:
        res = requests.post(f"{BASE_URL}/restock", json={"productId": 3, "quantity": 1})
        if res.status_code != 200:
            print(f"FAIL: Restock failed {res.status_code}")
            return False
            
        stock_out = run_sql("SELECT stock FROM products WHERE id=3").strip().split('\n')
        stock = stock_out[2].strip() if len(stock_out) > 2 else "Error"
        
        if stock == '5':
            print("PASS: Stock restored to 5")
        else:
            print(f"FAIL: Stock is {stock}, expected 5")
            return False
            
        # Check Log for RESTOCK
        log_out = run_sql("SELECT count(*) FROM stock_history WHERE product_id=3 AND change_type='RESTOCK' AND delta=1").strip().split('\n')
        log_count = log_out[2].strip() if len(log_out) > 2 else "Error"
        
        if log_count == '1':
            print("PASS: Restock log created")
            return True
        else:
            print(f"FAIL: Restock log count is {log_count}")
            return False
            
    except Exception as e:
        print(f"ERROR: {e}")
        return False

def test_edge_1_race_condition():
    print("\n--- Edge Case 1: Race Condition ---")
    # SKU-004 has 1. 5 concurrent requests for 1.
    
    def buy():
        try:
            return requests.post(f"{BASE_URL}/purchase", json={"productId": 4, "quantity": 1})
        except Exception as e:
            return None

    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = [executor.submit(buy) for _ in range(5)]
        results = [f.result() for f in futures if f.result() is not None]

    success_count = sum(1 for r in results if r.status_code == 200)
    fail_count = sum(1 for r in results if r.status_code == 409)
    
    print(f"Success: {success_count}, Fail (409): {fail_count}")
    
    stock_out = run_sql("SELECT stock FROM products WHERE id=4").strip().split('\n')
    stock = stock_out[2].strip() if len(stock_out) > 2 else "Error"
    
    if success_count == 1 and fail_count == 4 and stock == '0':
        print("PASS: Race condition handled correctly")
        return True
    else:
        print(f"FAIL: Expected 1 success, 4 fails, stock 0. Got stock {stock}")
        return False

def test_edge_3_overselling():
    print("\n--- Edge Case 3: Overselling Attempt ---")
    # SKU-005 has 5. Buy 6.
    try:
        res = requests.post(f"{BASE_URL}/purchase", json={"productId": 5, "quantity": 6})
        if res.status_code == 409:
            print("PASS: Rejected with 409")
        else:
            print(f"FAIL: Expected 409, got {res.status_code}")
            return False
            
        stock_out = run_sql("SELECT stock FROM products WHERE id=5").strip().split('\n')
        stock = stock_out[2].strip() if len(stock_out) > 2 else "Error"
        
        if stock == '5':
            print("PASS: Stock remained 5")
            return True
        else:
            print(f"FAIL: Stock changed to {stock}")
            return False
    except Exception as e:
        print(f"ERROR: {e}")
        return False

def test_edge_4_boundary():
    print("\n--- Edge Case 4: Boundary Value ---")
    # SKU-006 has 7. Threshold 5.
    # 7 -> 6 (No alert)
    try:
        requests.post(f"{BASE_URL}/purchase", json={"productId": 6, "quantity": 1})
        # 6 -> 5 (Alert)
        requests.post(f"{BASE_URL}/purchase", json={"productId": 6, "quantity": 1})
        # 5 -> 4 (Alert)
        requests.post(f"{BASE_URL}/purchase", json={"productId": 6, "quantity": 1})
        
        stock_out = run_sql("SELECT stock FROM products WHERE id=6").strip().split('\n')
        stock = stock_out[2].strip() if len(stock_out) > 2 else "Error"
        
        if stock == '4':
            print("PASS: Sequence completed successfully")
            return True
        else:
            print(f"FAIL: Final stock is {stock}")
            return False
    except Exception as e:
        print(f"ERROR: {e}")
        return False

if __name__ == "__main__":
    print("Waiting for DB...")
    time.sleep(5) # Wait for DB to be ready
    reset_db()
    
    test_1_successful_deduction()
    test_2_low_stock_alert()
    test_3_stock_restoration()
    test_edge_1_race_condition()
    test_edge_3_overselling()
    test_edge_4_boundary()
