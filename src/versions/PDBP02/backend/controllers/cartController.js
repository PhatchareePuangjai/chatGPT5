let cart = {
  items: [],
  savedForLater: []
};

const calculateTotal = () => {
  return cart.items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
};

exports.getCart = (req, res) => {
  res.json({
    items: cart.items,
    savedForLater: cart.savedForLater,
    totalPrice: calculateTotal()
  });
};

exports.addItem = (req, res) => {
  const { id, name, price, quantity } = req.body;
  const existingItem = cart.items.find(item => item.id === id);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({ id, name, price, quantity });
  }

  res.json({ cart, totalPrice: calculateTotal() });
};

exports.updateQuantity = (req, res) => {
  const { id, quantity } = req.body;
  const item = cart.items.find(item => item.id === id);

  if (!item) {
    return res.status(404).json({ message: "Item not found" });
  }

  if (quantity <= 0) {
    cart.items = cart.items.filter(item => item.id !== id);
  } else {
    item.quantity = quantity;
  }

  res.json({ cart, totalPrice: calculateTotal() });
};

exports.saveForLater = (req, res) => {
  const { id } = req.body;
  const itemIndex = cart.items.findIndex(item => item.id === id);

  if (itemIndex === -1) {
    return res.status(404).json({ message: "Item not found" });
  }

  const [item] = cart.items.splice(itemIndex, 1);
  cart.savedForLater.push(item);

  res.json({ cart, totalPrice: calculateTotal() });
};
