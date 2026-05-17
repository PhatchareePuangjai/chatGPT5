const express = require('express');
const pool = require('./db');
const couponRoutes = require('./routes/couponRoutes');

const app = express();
app.use(express.json());
app.use('/api/coupons', couponRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
