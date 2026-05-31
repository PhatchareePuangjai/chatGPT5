import express from 'express';

import { router } from './api/router.js';
import { requestLogging } from './api/middleware/logging.js';

const app = express();
app.use(express.json());
app.use(requestLogging);

app.use('/api', router);

const port = Number.parseInt(process.env.PORT ?? '3001', 10);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`backend listening on :${port}`);
});
