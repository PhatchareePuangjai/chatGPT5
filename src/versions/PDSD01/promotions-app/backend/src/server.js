const config = require('./config');
const app = require('./app');

app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Promotions service listening on port ${config.port}`);
});
