import asyncio
import httpx

API_URL = "http://localhost:8000"

async def reset_stock():
    # Helper to reset stock for testing
    pass # In a real test we'd have a reset endpoint or direct DB access
    
async def test_race_condition():
    print("\n--- Testing Race Condition (Concurrent Requests) ---")
    sku = "SKU-001"
    # Assuming initial stock is 10. Let's send 15 concurrent requests for 1 quantity each.
    # Expected: 10 succeed, 5 fail.
    
    async with httpx.AsyncClient() as client:
        # Prepare 15 requests
        tasks = [client.post(f"{API_URL}/api/buy", json={"sku": sku, "quantity": 1}) for _ in range(15)]
        
        # Fire them concurrently
        responses = await asyncio.gather(*tasks, return_exceptions=True)
        
        success_count = 0
        error_count = 0
        
        for res in responses:
            if isinstance(res, httpx.Response):
                if res.status_code == 200:
                    success_count += 1
                elif res.status_code == 400:
                    error_count += 1
                else:
                    print(f"Unexpected status code: {res.status_code}")
            else:
                print(f"Request failed: {res}")
                
        print(f"Successful successful purchases: {success_count} (Expected <= 10 depending on initial stock)")
        print(f"Failed purchases (Insufficient Stock): {error_count} (Expected >= 5)")

async def test_overselling():
    print("\n--- Testing Overselling Attempt ---")
    sku = "SKU-002"
    # Let's say stock is 6. Try to buy 100.
    async with httpx.AsyncClient() as client:
        res = await client.post(f"{API_URL}/api/buy", json={"sku": sku, "quantity": 100})
        print(f"Overselling attempt result: Status Code = {res.status_code}")
        print(f"Response: {res.json()}")

async def test_low_stock_alert():
    print("\n--- Testing Low Stock Boundary ---")
    sku = "SKU-003" # Initial stock 5, threshold 5
    async with httpx.AsyncClient() as client:
        # Buy 1, remaining goes to 4. Expect alert.
        res = await client.post(f"{API_URL}/api/buy", json={"sku": sku, "quantity": 1})
        print(f"Buy 1 result alert_triggered: {res.json().get('alert_triggered')}")
        
async def main():
    await test_race_condition()
    await test_overselling()
    await test_low_stock_alert()

if __name__ == "__main__":
    asyncio.run(main())
