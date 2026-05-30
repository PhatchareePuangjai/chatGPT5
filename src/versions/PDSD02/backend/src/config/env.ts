type Env = {
  nodeEnv: 'development' | 'test' | 'production';
  port: number;
  databaseUrl?: string;
};

function getNodeEnv(value: string | undefined): Env['nodeEnv'] {
  if (value === 'production' || value === 'test') return value;
  return 'development';
}

export const env: Env = {
  nodeEnv: getNodeEnv(process.env.NODE_ENV),
  port: Number(process.env.PORT ?? 3001),
  databaseUrl: process.env.DATABASE_URL,
};

