require("dotenv").config();

const express = require("express");
const cors = require("cors");
const apiRoutes = require("./routes/apiRoutes");
const { errorHandler } = require("./middleware/errorHandler");
const db = require("./db");

const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

const app = express();

app.use(express.json());
app.use(cors({ origin: CORS_ORIGIN }));

app.get("/health", async (req, res) => {
  // verify DB connectivity
  const r = await db.query("SELECT 1 AS ok");
  res.json({ ok: true, db: r.rows[0].ok === 1 });
});

app.use("/api", apiRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Backend listening on :${PORT}`);
});
