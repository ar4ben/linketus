import { beforeEach, describe, expect, it, vi } from "vitest";

describe("lib/i18n/server", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("returns locale from cookie when present", async () => {
    vi.doMock("next/headers", () => ({
      cookies: async () => ({
        get: (name: string) => (name === "linketus_locale" ? { value: "ru" } : undefined),
      }),
    }));

    const { getServerLocale } = await import("./server");
    await expect(getServerLocale()).resolves.toBe("ru");
  });

  it("falls back to en for missing/unknown cookie values", async () => {
    vi.doMock("next/headers", () => ({
      cookies: async () => ({
        get: () => ({ value: "de" }),
      }),
    }));

    const { getServerLocale } = await import("./server");
    await expect(getServerLocale()).resolves.toBe("en");
  });
});
