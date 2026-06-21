import { z } from 'zod';

/**
 * Enum-like `const` of the supported Node environments.
 */
export const NodeEnv = {
  Development: 'development',
  Production: 'production',
  Test: 'test',
} as const;

/**
 * A supported Node environment value.
 */
export type NodeEnv = (typeof NodeEnv)[keyof typeof NodeEnv];

/** Parses a `"true"`/`"false"` string (or boolean) into a boolean. */
const booleanFromString = z
  .union([z.boolean(), z.string()])
  .transform((value) => value === true || value === 'true');

/**
 * Schema validating the process environment. Defaults keep local development and
 * tests zero-config.
 */
export const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3005),
  NODE_ENV: z.nativeEnum(NodeEnv).default(NodeEnv.Development),
  DB_HOST: z.string().min(1).default('localhost'),
  DB_PORT: z.coerce.number().int().positive().default(3306),
  DB_USERNAME: z.string().min(1).default('root'),
  DB_PASSWORD: z.string().default('root'),
  DB_DATABASE: z.string().min(1).default('email_templates'),
  DB_SYNCHRONIZE: booleanFromString.default(false),
  THROTTLE_TTL: z.coerce.number().int().positive().default(60000),
  THROTTLE_LIMIT: z.coerce.number().int().positive().default(120),
  RENDER_THROTTLE_LIMIT: z.coerce.number().int().positive().default(20),
  CORS_ORIGIN: z.string().min(1).default('http://localhost:3000'),
  // Email delivery (Resend). Optional: without an API key, test sends no-op.
  RESEND_API_KEY: z.string().optional(),
  MAIL_FROM: z.string().optional(),
});

/**
 * The validated, typed environment configuration.
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Validates the raw environment, throwing a `ZodError` if it is invalid. Used as
 * the `validate` function of `ConfigModule`.
 *
 * @param config - The raw `process.env`-like object.
 * @returns The validated, typed configuration.
 */
export function validateEnv(config: Record<string, unknown>): Env {
  return envSchema.parse(config);
}
