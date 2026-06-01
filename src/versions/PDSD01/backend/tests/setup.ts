import { beforeAll } from 'vitest';

import { applyMigrations } from '../src/db/migrate.js';

beforeAll(async () => {
  await applyMigrations();
});
// pool.end() removed: with singleFork mode all files share one process,
// calling pool.end() after the first file closes the pool for remaining files.
// The fork process exits cleanly on its own, terminating all connections.
