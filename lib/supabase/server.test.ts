import { beforeEach, describe, expect, it, vi } from "vitest";

type CookieMutation = { name: string; value: string; options?: Record<string, unknown> };
type ServerClientOptions = {
  cookies: {
    getAll: () => Array<{ name: string; value: string }>;
    setAll: (cookiesToSet: CookieMutation[]) => void;
  };
};

describe("lib/supabase/server", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("creates server supabase client with cookie adapters", async () => {
    const cookieSet = vi.fn();
    const cookieStore = {
      getAll: vi.fn(() => [{ name: "sb", value: "token" }]),
      set: cookieSet,
    };
    const createServerClient = vi.fn((_url: string, _key: string, options: ServerClientOptions) => {
      expect(options.cookies.getAll()).toEqual([{ name: "sb", value: "token" }]);
      options.cookies.setAll([{ name: "new-cookie", value: "123", options: { path: "/" } }]);
      return { id: "server-client" };
    });

    vi.doMock("@supabase/ssr", () => ({
      createServerClient,
    }));
    vi.doMock("next/headers", () => ({
      cookies: async () => cookieStore,
    }));
    vi.doMock("@/lib/env", () => ({
      requireEnv: (key: string) =>
        key === "NEXT_PUBLIC_SUPABASE_URL" ? "https://example.supabase.co" : "anon",
    }));

    const { createClient } = await import("./server");
    const result = await createClient();

    expect(result).toEqual({ id: "server-client" });
    expect(createServerClient).toHaveBeenCalledTimes(1);
    expect(cookieSet).toHaveBeenCalledWith("new-cookie", "123", { path: "/" });
  });

  it("does not throw when cookie store set fails", async () => {
    const cookieStore = {
      getAll: vi.fn(() => []),
      set: vi.fn(() => {
        throw new Error("set failed");
      }),
    };
    const createServerClient = vi.fn((_url: string, _key: string, options: ServerClientOptions) => {
      expect(() =>
        options.cookies.setAll([{ name: "ignored", value: "1", options: { path: "/" } }]),
      ).not.toThrow();
      return { id: "server-client" };
    });

    vi.doMock("@supabase/ssr", () => ({
      createServerClient,
    }));
    vi.doMock("next/headers", () => ({
      cookies: async () => cookieStore,
    }));
    vi.doMock("@/lib/env", () => ({
      requireEnv: (key: string) =>
        key === "NEXT_PUBLIC_SUPABASE_URL" ? "https://example.supabase.co" : "anon",
    }));

    const { createClient } = await import("./server");
    await expect(createClient()).resolves.toEqual({ id: "server-client" });
  });
});
