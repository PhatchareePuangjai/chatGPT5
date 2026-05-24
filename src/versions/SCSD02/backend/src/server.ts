import { makeApp } from './index.js';

const { app } = makeApp();
const port = Number(process.env.PORT ?? 3001);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`backend listening on http://localhost:${port}`);
});

