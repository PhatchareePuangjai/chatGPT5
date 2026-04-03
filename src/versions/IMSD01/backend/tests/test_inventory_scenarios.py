from uuid import uuid4

import pytest
from sqlalchemy import select

from src.api.errors import InsufficientStockError
from src.models.alert import Alert
from src.models.inventory_log import InventoryLog
from src.models.product import Product
from src.services.inventory_service import purchase, restore

pytestmark = pytest.mark.scenarios


def _seed_product(db_session, sku: str, available_qty: int, low_stock_threshold: int) -> str:
    product_id = str(uuid4())
    db_session.add(
        Product(
            id=product_id,
            sku=sku,
            available_qty=available_qty,
            low_stock_threshold=low_stock_threshold,
        )
    )
    db_session.commit()
    return product_id


class TestInventoryScenarios:
    def test_1_successful_stock_deduction(self, db_session):
        """Scenario 1: Successful Stock Deduction."""
        product_id = _seed_product(db_session, "SKU-001", 10, 0)

        result = purchase(db_session, product_id, "SKU-001", 2)

        assert result["remaining"] == 8
        log = db_session.execute(select(InventoryLog)).scalar_one()
        assert log.operation == "SALE"
        assert log.quantity_delta == -2

    def test_2_low_stock_alert_trigger(self, db_session):
        """Scenario 2: Low Stock Alert Trigger."""
        product_id = _seed_product(db_session, "SKU-002", 6, 5)

        result = purchase(db_session, product_id, "SKU-002", 2)

        assert result["remaining"] == 4
        alerts = db_session.execute(select(Alert)).scalars().all()
        assert len(alerts) == 1
        assert alerts[0].product_id == product_id
        assert alerts[0].stock_level == 4

    @pytest.mark.parametrize(
        ("reason", "expected_operation"),
        [
            ("cancelled", "RESTOCK"),
            ("expired", "RETURN"),
        ],
    )
    def test_3_stock_restoration(self, db_session, reason, expected_operation):
        """Scenario 3: Stock Restoration from cancellation or expiration."""
        product_id = _seed_product(db_session, "SKU-003", 5, 1)

        result = restore(db_session, product_id, "SKU-003", 1, reason)

        assert result["remaining"] == 6
        log = db_session.execute(select(InventoryLog)).scalar_one()
        assert log.operation == expected_operation
        assert log.quantity_delta == 1


class TestInventoryEdgeCases:
    def test_edge_case_1_race_condition(self):
        """Edge Case 1: Race Condition on the last item."""
        # Covered in the dedicated concurrency suite.
        from tests.integration.test_purchase_concurrency import (
            test_concurrent_purchases_only_one_succeeds,
        )

        test_concurrent_purchases_only_one_succeeds()

    def test_edge_case_2_transaction_atomicity(self, db_session, monkeypatch):
        """Edge Case 2: Transaction Atomicity."""
        product_id = _seed_product(db_session, "SKU-ATOMIC", 5, 1)

        original_add = db_session.add

        def add_with_failure(instance):
            if isinstance(instance, InventoryLog):
                raise RuntimeError("log insert failed")
            return original_add(instance)

        monkeypatch.setattr(db_session, "add", add_with_failure)

        with pytest.raises(RuntimeError, match="log insert failed"):
            purchase(db_session, product_id, "SKU-ATOMIC", 2)

        product = db_session.execute(select(Product)).scalar_one()
        logs = db_session.execute(select(InventoryLog)).scalars().all()
        assert product.available_qty == 5
        assert logs == []

    def test_edge_case_3_overselling_attempt(self, db_session):
        """Edge Case 3: Overselling Attempt."""
        product_id = _seed_product(db_session, "SKU-BOUNDARY", 5, 1)

        with pytest.raises(InsufficientStockError):
            purchase(db_session, product_id, "SKU-BOUNDARY", 6)

        product = db_session.execute(select(Product)).scalar_one()
        logs = db_session.execute(select(InventoryLog)).scalars().all()
        assert product.available_qty == 5
        assert logs == []

    def test_edge_case_4_boundary_value_low_stock(self, db_session):
        """Edge Case 4: Boundary Value for low stock alerts."""
        product_id = _seed_product(db_session, "SKU-LOW", 7, 5)

        purchase(db_session, product_id, "SKU-LOW", 1)  # 7 -> 6
        alerts = db_session.execute(select(Alert)).scalars().all()
        assert len(alerts) == 0

        purchase(db_session, product_id, "SKU-LOW", 1)  # 6 -> 5
        alerts = db_session.execute(select(Alert)).scalars().all()
        assert len(alerts) == 1
        assert alerts[-1].stock_level == 5

        purchase(db_session, product_id, "SKU-LOW", 1)  # 5 -> 4
        alerts = db_session.execute(select(Alert)).scalars().all()
        assert len(alerts) == 2
        assert alerts[-1].stock_level == 4
