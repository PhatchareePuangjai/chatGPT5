const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: process.env.DOTENV_CONFIG_PATH || path.resolve(__dirname, '../../.env') });

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4000),
  databaseUrl: process.env.DATABASE_URL || 'postgres://promo:promo@localhost:5432/promotions',
};

module.exports = config;
