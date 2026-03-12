import { z } from "zod";

const runtimeEnv = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_EDGE_FUNCTION_URL: process.env.SUPABASE_EDGE_FUNCTION_URL,
  PUSH_INTERNAL_TOKEN: process.env.PUSH_INTERNAL_TOKEN,
  VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY,
  VAPID_SUBJECT: process.env.VAPID_SUBJECT,
} as const;

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  SUPABASE_EDGE_FUNCTION_URL: z.string().url().optional(),
  PUSH_INTERNAL_TOKEN: z.string().min(1).optional(),
  VAPID_PUBLIC_KEY: z.string().min(1).optional(),
  VAPID_PRIVATE_KEY: z.string().min(1).optional(),
  VAPID_SUBJECT: z.string().min(1).optional(),
});

const parsed = envSchema.safeParse(runtimeEnv);

if (!parsed.success) {
  // Keep startup tolerant in local dev and fail at point of usage with clearer errors.
  console.warn("Environment variables validation warning", parsed.error.flatten().fieldErrors);
}

const values = parsed.success ? parsed.data : {};

export function requireEnv(name: keyof z.infer<typeof envSchema>): string {
  const value = values[name] ?? runtimeEnv[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const env = {
  ...values,
  pushPublicKey: values.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? values.VAPID_PUBLIC_KEY,
  siteUrl: values.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};

export const isPushConfigured =
  Boolean(values.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? values.VAPID_PUBLIC_KEY) &&
  Boolean(values.SUPABASE_EDGE_FUNCTION_URL) &&
  Boolean(values.SUPABASE_SERVICE_ROLE_KEY) &&
  Boolean(values.PUSH_INTERNAL_TOKEN);
