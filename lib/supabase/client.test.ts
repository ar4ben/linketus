import { beforeEach, describe, expect, it, vi } from "vitest";

describe("lib/supabase/client", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("creates browser supabase client once and reuses singleton", async () => {
    const createBrowserClient = vi.fn(() => ({ id: "mock-client" }));
    const requireEnv = vi.fn((key: string) =>
      key === "NEXT_PUBLIC_SUPABASE_URL" ? "https://example.supabase.co" : "anon-key",
    );

    vi.doMock("@supabase/ssr", () => ({
      createBrowserClient,
    }));
    vi.doMock("@/lib/env", () => ({
      requireEnv,
    }));

    const { createClient } = await import("./client");
    const first = createClient();
    const second = createClient();

    expect(first).toBe(second);
    expect(createBrowserClient).toHaveBeenCalledTimes(1);
    expect(createBrowserClient).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "anon-key",
      expect.objectContaining({
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      }),
    );
  });

  it("bubbles env errors from requireEnv", async () => {
    vi.doMock("@supabase/ssr", () => ({
      createBrowserClient: vi.fn(),
    }));
    vi.doMock("@/lib/env", () => ({
      requireEnv: () => {
        throw new Error("Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL");
      },
    }));

    const { createClient } = await import("./client");
    expect(() => createClient()).toThrow("Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL");
  });
});
