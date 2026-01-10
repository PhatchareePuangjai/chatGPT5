const express = require("express");
const cors = require("cors");
const productsRoutes = require("./routes/products");
const cartRoutes = require("./routes/cart");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/products", productsRoutes);
app.use("/api/cart", cartRoutes);

// Central error handler
app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ error: message });
});

const port = Number(process.env.PORT || 3001);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on :${port}`);
});
