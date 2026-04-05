const apiBase = import.meta.env.VITE_API_BASE || "http://localhost:8000";

const cartItemsEl = document.getElementById("cart-items");
const savedItemsEl = document.getElementById("saved-items");
const cartTotalEl = document.getElementById("cart-total");
const addForm = document.getElementById("add-form");
const addError = document.getElementById("add-error");

async function fetchCart() {
  const res = await fetch(`${apiBase}/cart`);
  if (!res.ok) {
    throw new Error("Failed to load cart");
  }
  return res.json();
}

async function addItem(formData) {
  const payload = {
    sku: formData.get("sku"),
    name: formData.get("name"),
    unit_price_minor: Math.round(parseFloat(formData.get("price")) * 100),
    stock: parseInt(formData.get("stock"), 10),
    quantity: parseInt(formData.get("quantity"), 10)
  };

  const res = await fetch(`${apiBase}/cart/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || "Failed to add item");
  }

  return res.json();
}

async function updateQuantity(sku, quantity) {
  const res = await fetch(`${apiBase}/cart/items/${sku}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity })
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || "Failed to update quantity");
  }

  return res.json();
}

async function saveForLater(sku) {
  const res = await fetch(`${apiBase}/cart/items/${sku}/save`, {
    method: "POST"
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || "Failed to save item");
  }

  return res.json();
}

function renderCart(cart) {
  cartItemsEl.innerHTML = "";
  savedItemsEl.innerHTML = "";

  if (cart.items.length === 0) {
    cartItemsEl.innerHTML = "<p>No items in cart.</p>";
  } else {
    cart.items.forEach((item) => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <div>
          <h3>${item.name}</h3>
          <small>${item.sku} • ${formatMoney(item.unit_price_minor)}</small>
          <div>Line total: ${formatMoney(item.line_total_minor)}</div>
        </div>
        <div class="card-actions">
          <label>
            Qty
            <input type="number" min="1" value="${item.quantity}" data-sku="${item.sku}" />
          </label>
          <button class="secondary" data-save="${item.sku}">Save for later</button>
        </div>
      `;
      cartItemsEl.appendChild(card);
    });
  }

  if (cart.saved_items.length === 0) {
    savedItemsEl.innerHTML = "<p>No saved items.</p>";
  } else {
    cart.saved_items.forEach((item) => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <div>
          <h3>${item.name}</h3>
          <small>${item.sku} • ${formatMoney(item.unit_price_minor)}</small>
        </div>
        <div>
          <small>Saved</small>
        </div>
      `;
      savedItemsEl.appendChild(card);
    });
  }

  cartTotalEl.textContent = cart.totals.subtotal;

  document.querySelectorAll("input[data-sku]").forEach((input) => {
    input.addEventListener("change", async (event) => {
      const sku = event.target.dataset.sku;
      const quantity = parseInt(event.target.value, 10);
      try {
        const updated = await updateQuantity(sku, quantity);
        renderCart(updated);
      } catch (err) {
        alert(err.message);
      }
    });
  });

  document.querySelectorAll("button[data-save]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        const updated = await saveForLater(button.dataset.save);
        renderCart(updated);
      } catch (err) {
        alert(err.message);
      }
    });
  });
}

function formatMoney(minor) {
  return `${(minor / 100).toFixed(2)} THB`;
}

addForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  addError.textContent = "";
  const formData = new FormData(addForm);

  try {
    const cart = await addItem(formData);
    renderCart(cart);
    addForm.reset();
  } catch (err) {
    addError.textContent = err.message;
  }
});

fetchCart()
  .then(renderCart)
  .catch((err) => {
    cartItemsEl.innerHTML = `<p class="error">${err.message}</p>`;
  });
