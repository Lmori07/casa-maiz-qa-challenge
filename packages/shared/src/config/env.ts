import { z } from 'zod';

const envSchema = z.object({
  CMS_API_BASE_URL: z.string().url(),
  CONSUMER_BASE_URL: z.string().url(),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validates the two required base URLs up front so a missing/malformed
 * `.env` fails fast at `playwright.config.ts` load time with a readable
 * message, instead of surfacing later as a cryptic "baseURL is undefined"
 * error deep inside a test.
 */
export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(
      `Missing or invalid environment configuration. Copy .env.example to .env and fill it in.\n${issues}`,
    );
  }
  return result.data;
}
