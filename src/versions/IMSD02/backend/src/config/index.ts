import { z } from "zod";

const envSchema = z.object({
  POSTGRES_HOST: z.string().default("localhost"),
  POSTGRES_PORT: z.coerce.number().default(5432),
  POSTGRES_DB: z.string().default("imsd02"),
  POSTGRES_USER: z.string().default("imsd02"),
  POSTGRES_PASSWORD: z.string().default("imsd02"),
  POSTGRES_TEST_DB: z.string().default("imsd02_test"),
  PORT: z.coerce.number().default(3000)
});

export type AppConfig = z.infer<typeof envSchema>;

export function getConfig(): AppConfig {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Invalid environment: ${parsed.error.message}`);
  }
  return parsed.data;
}
