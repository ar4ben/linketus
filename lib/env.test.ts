import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const originalEnv = process.env;

function clearRuntimeEnv() {
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  delete process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  delete process.env.NEXT_PUBLIC_SITE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  delete process.env.SUPABASE_EDGE_FUNCTION_URL;
  delete process.env.PUSH_INTERNAL_TOKEN;
  delete process.env.VAPID_PUBLIC_KEY;
  delete process.env.VAPID_PRIVATE_KEY;
  delete process.env.VAPID_SUBJECT;
}

describe("lib/env", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    clearRuntimeEnv();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("throws from requireEnv when required value is missing", async () => {
    const { requireEnv } = await import("./env");
    expect(() => requireEnv("NEXT_PUBLIC_SUPABASE_URL")).toThrow(
      "Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL",
    );
  });

  it("uses VAPID_PUBLIC_KEY as fallback for client push public key", async () => {
    process.env.VAPID_PUBLIC_KEY = "server-vapid-key";
    const { env } = await import("./env");
    expect(env.pushPublicKey).toBe("server-vapid-key");
  });

  it("marks push as configured when all required vars exist", async () => {
    process.env.VAPID_PUBLIC_KEY = "pub";
    process.env.SUPABASE_EDGE_FUNCTION_URL = "https://example.supabase.co/functions/v1";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role";
    process.env.PUSH_INTERNAL_TOKEN = "internal-token";

    const { isPushConfigured } = await import("./env");
    expect(isPushConfigured).toBe(true);
  });
});
