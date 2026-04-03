class InventoryError(Exception):
    pass


class InsufficientStockError(InventoryError):
    def __init__(self, requested: int, available: int) -> None:
        super().__init__(f"Insufficient stock: requested {requested}, available {available}")


class ValidationError(InventoryError):
    pass


class ConcurrencyError(InventoryError):
    pass
