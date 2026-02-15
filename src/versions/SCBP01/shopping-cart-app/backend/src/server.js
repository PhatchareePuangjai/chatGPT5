import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import { pool } from "./db.js";
import { addItemSchema, updateQtySchema, saveSchema, parseJson } from "./validate.js";
import { listProducts, getCart, addToCart, updateQuantity, toggleSaveForLater, removeItem } from "./cartService.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));

app.get("/api/products", async (req, res, next) => {
  try {
    const client = await pool.connect();
    try {
      const products = await listProducts(client);
      res.json({ products });
    } finally {
      client.release();
    }
  } catch (e) { next(e); }
});

app.get("/api/cart", async (req, res, next) => {
  try {
    const client = await pool.connect();
    try {
      const cart = await getCart(client);
      res.json(cart);
    } finally {
      client.release();
    }
  } catch (e) { next(e); }
});

app.post("/api/cart/items", async (req, res, next) => {
  try {
    const body = parseJson(req);
    const parsed = addItemSchema.safeParse(body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
    }
    const cart = await addToCart(parsed.data.productId, parsed.data.qty);
    res.json(cart);
  } catch (e) { next(e); }
});

app.patch("/api/cart/items/:productId", async (req, res, next) => {
  try {
    const productId = Number(req.params.productId);
    const body = parseJson(req);

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({ error: "Invalid input", details: { productId: "Must be a positive integer" } });
    }

    const parsed = updateQtySchema.safeParse(body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
    }

    const cart = await updateQuantity(productId, parsed.data.qty);
    res.json(cart);
  } catch (e) { next(e); }
});

app.post("/api/cart/items/:productId/save", async (req, res, next) => {
  try {
    const productId = Number(req.params.productId);
    const body = parseJson(req);

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({ error: "Invalid input", details: { productId: "Must be a positive integer" } });
    }

    const parsed = saveSchema.safeParse(body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
    }

    const cart = await toggleSaveForLater(productId, parsed.data.saved);
    res.json(cart);
  } catch (e) { next(e); }
});

app.delete("/api/cart/items/:productId", async (req, res, next) => {
  try {
    const productId = Number(req.params.productId);
    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({ error: "Invalid input", details: { productId: "Must be a positive integer" } });
    }
    const cart = await removeItem(productId);
    res.json(cart);
  } catch (e) { next(e); }
});

// Error handler (always return friendly JSON)
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const debug = String(process.env.DEBUG_ERRORS || "false").toLowerCase() === "true";
  const payload = { error: err.message || "Server error" };
  if (debug && err.stack) payload.stack = err.stack;
  res.status(status).json(payload);
});

const port = Number(process.env.PORT || 4000);
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Backend listening on http://localhost:${port}`);
  });
}

export { app };
