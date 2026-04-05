class CartError(Exception):
    """Base error for cart operations."""


class InsufficientStockError(CartError):
    """Raised when requested quantity exceeds available stock."""


class ItemNotFoundError(CartError):
    """Raised when a cart item is not present."""
