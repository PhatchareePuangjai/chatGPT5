export type Db = {
  query: (sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }>;
};

export function createDb(): Db {
  if (!process.env.DATABASE_URL) {
    return {
      async query() {
        throw new Error('DATABASE_URL not set');
      },
    };
  }
  return {
    async query() {
      throw new Error('DB client not implemented in this scaffold');
    },
  };
}

