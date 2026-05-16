const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const promotionRoutes = require("./routes/promotionRoutes");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/ecommerce", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use("/api/promotions", promotionRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
