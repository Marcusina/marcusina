import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  MIGRATION_DATABASE_URL: z.string().url().optional(),
  APP_DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
  // 3001 matches utils/config.js's EXPO_PUBLIC_DEV_PORT default in the
  // frontend - the two projects need to agree on this with zero extra
  // configuration for `expo start` to reach this server out of the box.
  PORT: z.coerce.number().int().positive().default(3001),
  // Optional: /auth/google responds 503 GOOGLE_AUTH_NOT_CONFIGURED rather
  // than crash when this is unset - see lib/googleIdToken.ts.
  GOOGLE_CLIENT_ID: z.string().optional(),
  // Comma-separated allowed origins for cors() in app.ts. Only matters for
  // browser (Expo web) clients - native fetch isn't subject to CORS. Defaults
  // to local Expo web dev; set explicitly in prod to the deployed frontend's
  // origin(s).
  CORS_ORIGINS: z
    .string()
    .default("http://localhost:8081")
    .transform((v) => v.split(",").map((s) => s.trim()).filter(Boolean)),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("[env] Invalid environment configuration:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
