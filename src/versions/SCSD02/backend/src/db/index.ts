import pg from 'pg';

export type DbConfig = {
  connectionString: string;
};

let pool: pg.Pool | null = null;

export function getPool(config?: DbConfig): pg.Pool {
  if (pool) return pool;
  const connectionString =
    config?.connectionString ?? process.env.DATABASE_URL ?? 'postgres://localhost/postgres';
  pool = new pg.Pool({ connectionString });
  return pool;
}

