export type Env = {
  DATABASE_URL: string;
  PORT: number;
};

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

export function loadEnv(): Env {
  const portRaw = process.env.PORT ?? "3001";
  const port = Number(portRaw);
  if (!Number.isFinite(port) || port <= 0) throw new Error(`Invalid PORT: ${portRaw}`);

  return {
    DATABASE_URL: requireEnv("DATABASE_URL"),
    PORT: port
  };
}

