import "./style.css";

const STOCK_EXCEEDED_MESSAGE = "สินค้าไม่เพียงพอ";

const app = document.getElementById("app");

app.innerHTML = `
  <main class="app">
    <header class="hero">
      <p class="eyebrow">Cart Lab</p>
      <h1>Shopping Cart UI</h1>
      <p class="subtitle">Subtotal is calculated from the active cart items.</p>
    </header>

    <section class="panel">
      <div class="panel-header">
        <h2>Cart Controls</h2>
        <span class="badge">In-memory demo</span>
      </div>
      <form id="add-form" class="form-grid">
        <label>
          SKU
          <input id="sku" type="text" placeholder="SKU-001" required />
        </label>
        <label>
          Unit Price
          <input id="price" type="number" min="0" step="0.01" placeholder="19.99" required />
        </label>
        <label>
          Quantity
          <input id="qty" type="number" min="1" value="1" required />
        </label>
        <label>
          Stock Limit
          <input id="stock" type="number" min="1" placeholder="5" />
        </label>
        <button type="submit">Add to Cart</button>
      </form>
      <div id="message" class="message" aria-live="polite"></div>
    </section>

    <section class="panel">
      <div class="panel-header">
        <h2>Totals</h2>
      </div>
      <div class="summary">
        <div>
          <span>Subtotal</span>
          <strong id="subtotal">0.00</strong>
        </div>
        <div>
          <span>Discount (fixed)</span>
          <input id="discount" type="number" min="0" step="0.01" placeholder="0.00" />
        </div>
        <div>
          <span>Total</span>
          <strong id="total">0.00</strong>
        </div>
      </div>
    </section>

    <section class="grid">
      <div class="panel">
        <div class="panel-header">
          <h2>Active Cart</h2>
          <span class="muted">Counts toward subtotal</span>
        </div>
        <div id="cart-items" class="list"></div>
      </div>

      <div class="panel">
        <div class="panel-header">
          <h2>Saved for Later</h2>
          <span class="muted">Excluded from subtotal</span>
        </div>
        <div id="saved-items" class="list"></div>
      </div>
    </section>

    <section class="panel">
      <div class="panel-header">
        <h2>API Check</h2>
      </div>
      <button id="health">Check API Health</button>
      <pre id="output"></pre>
    </section>
  </main>
`;

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
  subtotal: document.getElementById("subtotal"),
  discount: document.getElementById("discount"),
  total: document.getElementById("total"),
  health: document.getElementById("health"),
  output: document.getElementById("output"),
};

const apiBase = import.meta.env.VITE_API_BASE || "/api";

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

  const subtotalCents = activeItems.reduce(
    (sum, item) => sum + item.unitPriceCents * item.quantity,
    0
  );

  const discountCents = parseMoney(elements.discount.value || "0");
  const totalCents = Math.max(0, subtotalCents - discountCents);

  elements.subtotal.textContent = formatMoney(subtotalCents);
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

async function checkHealth() {
  elements.output.textContent = "Checking...";
  try {
    const response = await fetch(`${apiBase}/health`);
    const data = await response.json();
    elements.output.textContent = JSON.stringify(data, null, 2);
  } catch (error) {
    elements.output.textContent = `Error: ${error}`;
  }
}

elements.health.addEventListener("click", checkHealth);

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

elements.discount.addEventListener("input", render);

render();
