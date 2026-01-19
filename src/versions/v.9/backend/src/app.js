const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const routes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  })
);
app.use(express.json());
app.use('/api', routes);

app.use(errorHandler);

const port = process.env.PORT || 8080;

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Inventory API listening on port ${port}`);
  });
}

module.exports = app;
