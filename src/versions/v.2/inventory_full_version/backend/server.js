import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import stockRoutes from './routes/stockRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/api/stock', stockRoutes);

app.get('/', (req, res) => {
  res.send('Inventory API is running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
