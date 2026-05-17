
const express = require('express');
const cors = require('cors');
const cartRoutes = require('./routes/cartRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/cart', cartRoutes);

app.listen(5000, () => {
  console.log('Backend running on port 5000');
});
