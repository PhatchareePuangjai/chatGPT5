const STOCK_EXCEEDED_MESSAGE = "สินค้าไม่เพียงพอ";

const cartState = {
  items: [],
  inventory: {},
};

const elements = {
  form: document.getElementById("add-form"),
  sku: document.getElementById("sku"),
  price: document.getElementById("price"),
  qty: document.getElementById("qty"),
  stock: document.getElementById("stock"),
  message: document.getElementById("message"),
  cartItems: document.getElementById("cart-items"),
  savedItems: document.getElementById("saved-items"),
  total: document.getElementById("cart-total"),
};

function parseMoney(input) {
  const value = String(input).trim();
  if (!value) return 0;
  const [whole, fractional = ""] = value.split(".");
  const cents = `${whole}${fractional.padEnd(2, "0").slice(0, 2)}`;
  return Number(cents);
}

function formatMoney(cents) {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  const whole = Math.floor(abs / 100);
  const fraction = String(abs % 100).padStart(2, "0");
  return `${sign}${whole}.${fraction}`;
}

function showMessage(text) {
  if (!text) {
    elements.message.textContent = "";
    elements.message.classList.remove("show");
    return;
  }
  elements.message.textContent = text;
  elements.message.classList.add("show");
}

function currentQuantity(sku) {
  return cartState.items
    .filter((item) => item.sku === sku && item.status === "ACTIVE")
    .reduce((sum, item) => sum + item.quantity, 0);
}

function canAddStock(sku, requestedQty) {
  const stock = cartState.inventory[sku] ?? 0;
  return currentQuantity(sku) + requestedQty <= stock;
}

function canSetStock(sku, newQty) {
  const stock = cartState.inventory[sku] ?? 0;
  return newQty <= stock;
}

function addItem(sku, unitPriceCents, quantity) {
  if (!canAddStock(sku, quantity)) {
    showMessage(STOCK_EXCEEDED_MESSAGE);
    return;
  }

  const existingIndex = cartState.items.findIndex(
    (item) => item.sku === sku && item.status === "ACTIVE"
  );

  if (existingIndex === -1) {
    cartState.items.push({
      sku,
      unitPriceCents,
      quantity,
      status: "ACTIVE",
    });
  } else {
    cartState.items[existingIndex].quantity += quantity;
  }

  showMessage("");
  render();
}

function updateQuantity(sku, newQuantity) {
  if (!canSetStock(sku, newQuantity)) {
    showMessage(STOCK_EXCEEDED_MESSAGE);
    return;
  }

  cartState.items = cartState.items.map((item) => {
    if (item.sku === sku && item.status === "ACTIVE") {
      return { ...item, quantity: newQuantity };
    }
    return item;
  });
  showMessage("");
  render();
}

function saveForLater(sku) {
  cartState.items = cartState.items.map((item) => {
    if (item.sku === sku && item.status === "ACTIVE") {
      return { ...item, status: "SAVED" };
    }
    return item;
  });
  showMessage("");
  render();
}

function render() {
  const activeItems = cartState.items.filter((item) => item.status === "ACTIVE");
  const savedItems = cartState.items.filter((item) => item.status === "SAVED");

  elements.cartItems.innerHTML = activeItems.length
    ? activeItems.map(renderItem).join("")
    : "<p class=\"muted\">No active items yet.</p>";

  elements.savedItems.innerHTML = savedItems.length
    ? savedItems.map(renderSaved).join("")
    : "<p class=\"muted\">Nothing saved yet.</p>";

  const totalCents = activeItems.reduce(
    (sum, item) => sum + item.unitPriceCents * item.quantity,
    0
  );
  elements.total.textContent = formatMoney(totalCents);

  bindActions();
}

function renderItem(item) {
  const lineTotal = formatMoney(item.unitPriceCents * item.quantity);
  return `
    <article class="card">
      <div class="card-header">
        <strong>${item.sku}</strong>
        <span>฿${formatMoney(item.unitPriceCents)}</span>
      </div>
      <div class="controls">
        <button data-action="dec" data-sku="${item.sku}">-</button>
        <span>${item.quantity}</span>
        <button data-action="inc" data-sku="${item.sku}">+</button>
        <button data-action="save" data-sku="${item.sku}">Save for Later</button>
      </div>
      <div class="total">Line Total: ฿${lineTotal}</div>
    </article>
  `;
}

function renderSaved(item) {
  return `
    <article class="card">
      <div class="card-header">
        <strong>${item.sku}</strong>
        <span>Saved</span>
      </div>
      <div class="muted">Qty: ${item.quantity}</div>
    </article>
  `;
}

function bindActions() {
  document.querySelectorAll("button[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const sku = button.getAttribute("data-sku");
      const action = button.getAttribute("data-action");
      const item = cartState.items.find(
        (entry) => entry.sku === sku && entry.status === "ACTIVE"
      );
      if (!item) return;

      if (action === "inc") {
        updateQuantity(sku, item.quantity + 1);
      }
      if (action === "dec" && item.quantity > 1) {
        updateQuantity(sku, item.quantity - 1);
      }
      if (action === "save") {
        saveForLater(sku);
      }
    });
  });
}

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();
  const sku = elements.sku.value.trim();
  const quantity = Number(elements.qty.value);
  const priceCents = parseMoney(elements.price.value);
  const stockValue = elements.stock.value.trim();

  if (!sku || quantity <= 0) return;

  if (stockValue) {
    cartState.inventory[sku] = Number(stockValue);
  } else if (!(sku in cartState.inventory)) {
    cartState.inventory[sku] = 999;
  }

  addItem(sku, priceCents, quantity);
  elements.sku.value = "";
  elements.price.value = "";
  elements.qty.value = "1";
  elements.stock.value = "";
});

render();
