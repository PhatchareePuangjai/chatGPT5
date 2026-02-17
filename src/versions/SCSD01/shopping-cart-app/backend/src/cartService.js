import { withTx } from "./db.js";
import { multiplyCents, sumCents } from "./lib/money.js";

function assertStockAvailable(desiredQty, stock) {
  if (desiredQty > stock) {
    const err = new Error("สินค้าไม่เพียงพอ");
    err.status = 409;
    err.code = "STOCK_INSUFFICIENT";
    throw err;
  }
}

export async function ensureDemoCart(client) {
  const { rows } = await client.query("SELECT id FROM carts WHERE id=1");
  if (rows.length === 0) {
    await client.query("INSERT INTO carts (id) VALUES (1)");
  }
  return 1;
}

export async function listProducts(client) {
  const { rows } = await client.query(
    `SELECT id, sku, name, price_cents, stock
     FROM products
     ORDER BY id`
  );
  return rows;
}

export async function getCart(client) {
  const cartId = await ensureDemoCart(client);
  const items = (await client.query(
    `SELECT ci.product_id,
            p.sku,
            p.name,
            ci.qty,
            ci.saved_for_later,
            ci.unit_price_cents
     FROM cart_items ci
     JOIN products p ON p.id = ci.product_id
     WHERE ci.cart_id = $1
     ORDER BY ci.product_id`,
    [cartId]
  )).rows;

  const active = items.filter((i) => !i.saved_for_later);
  const saved = items.filter((i) => i.saved_for_later);

  const lineTotals = active.map((i) => multiplyCents(i.unit_price_cents, i.qty));
  const subtotal_cents = sumCents(lineTotals);
  const item_count = active.reduce((sum, i) => sum + i.qty, 0);

  return {
    cartId,
    items: active,
    savedForLater: saved,
    totals: {
      item_count,
      subtotal_cents,
    },
  };
}

export async function addToCart(productId, qty) {
  return withTx(async (client) => {
    const cartId = await ensureDemoCart(client);

    const productRes = await client.query(
      "SELECT id, stock, price_cents FROM products WHERE id=$1 FOR UPDATE",
      [productId]
    );
    if (productRes.rows.length === 0) {
      const err = new Error("Product not found");
      err.status = 404;
      throw err;
    }
    const product = productRes.rows[0];

    const itemRes = await client.query(
      "SELECT qty, saved_for_later FROM cart_items WHERE cart_id=$1 AND product_id=$2 FOR UPDATE",
      [cartId, productId]
    );

    const existingQty = itemRes.rows.length ? itemRes.rows[0].qty : 0;
    const desiredQty = existingQty + qty;

    assertStockAvailable(desiredQty, product.stock);

    if (itemRes.rows.length === 0) {
      await client.query(
        `INSERT INTO cart_items (cart_id, product_id, qty, saved_for_later, unit_price_cents)
         VALUES ($1, $2, $3, false, $4)`,
        [cartId, productId, qty, product.price_cents]
      );
    } else {
      await client.query(
        `UPDATE cart_items
         SET qty=$3
         WHERE cart_id=$1 AND product_id=$2`,
        [cartId, productId, desiredQty]
      );
    }

    return await getCart(client);
  });
}

export async function updateQuantity(productId, qty) {
  return withTx(async (client) => {
    const cartId = await ensureDemoCart(client);

    const productRes = await client.query(
      "SELECT id, stock FROM products WHERE id=$1 FOR UPDATE",
      [productId]
    );
    if (productRes.rows.length === 0) {
      const err = new Error("Product not found");
      err.status = 404;
      throw err;
    }
    const product = productRes.rows[0];

    const itemRes = await client.query(
      "SELECT qty FROM cart_items WHERE cart_id=$1 AND product_id=$2 FOR UPDATE",
      [cartId, productId]
    );
    if (itemRes.rows.length === 0) {
      const err = new Error("Item not in cart");
      err.status = 404;
      throw err;
    }

    if (qty === 0) {
      await client.query("DELETE FROM cart_items WHERE cart_id=$1 AND product_id=$2", [cartId, productId]);
      return await getCart(client);
    }

    assertStockAvailable(qty, product.stock);

    await client.query(
      "UPDATE cart_items SET qty=$3 WHERE cart_id=$1 AND product_id=$2",
      [cartId, productId, qty]
    );

    return await getCart(client);
  });
}

export async function toggleSaveForLater(productId, saved) {
  return withTx(async (client) => {
    const cartId = await ensureDemoCart(client);

    const itemRes = await client.query(
      "SELECT product_id, qty, saved_for_later FROM cart_items WHERE cart_id=$1 AND product_id=$2 FOR UPDATE",
      [cartId, productId]
    );
    if (itemRes.rows.length === 0) {
      const err = new Error("Item not in cart");
      err.status = 404;
      throw err;
    }
    const item = itemRes.rows[0];

    if (!saved) {
      const productRes = await client.query(
        "SELECT stock FROM products WHERE id=$1 FOR UPDATE",
        [productId]
      );
      if (productRes.rows.length === 0) {
        const err = new Error("Product not found");
        err.status = 404;
        throw err;
      }
      assertStockAvailable(item.qty, productRes.rows[0].stock);
    }

    await client.query(
      "UPDATE cart_items SET saved_for_later=$3 WHERE cart_id=$1 AND product_id=$2",
      [cartId, productId, saved]
    );

    return await getCart(client);
  });
}

export async function removeItem(productId) {
  return withTx(async (client) => {
    const cartId = await ensureDemoCart(client);
    await client.query("DELETE FROM cart_items WHERE cart_id=$1 AND product_id=$2", [cartId, productId]);
    return await getCart(client);
  });
}
