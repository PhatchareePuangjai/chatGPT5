const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const cartRoutes = require("./routes/cartRoutes");
app.use("/api/cart", cartRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Cart service running on port ${PORT}`);
});
