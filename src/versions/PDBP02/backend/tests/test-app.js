const express = require("express");
const cors = require("cors");
const promotionRoutes = require("../routes/promotionRoutes");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/promotions", promotionRoutes);

module.exports = app;
