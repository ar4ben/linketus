import { beforeEach, describe, expect, it, vi } from "vitest";

type CookieMutation = { name: string; value: string; options?: Record<string, unknown> };
type MiddlewareClientOptions = {
  cookies: {
    getAll: () => Array<{ name: string; value: string }>;
    setAll: (cookiesToSet: CookieMutation[]) => void;
  };
};

describe("lib/supabase/middleware", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("updates session and syncs cookies through NextResponse", async () => {
    const requestCookieSet = vi.fn();
    const responseCookieSet = vi.fn();
    const nextResponse = vi.fn(({ request }: { request: unknown }) => ({
      request,
      cookies: {
        set: responseCookieSet,
      },
    }));
    const getUser = vi.fn(async () => ({ data: { user: null } }));

    vi.doMock("next/server", () => ({
      NextResponse: {
        next: nextResponse,
      },
    }));
    vi.doMock("@/lib/env", () => ({
      requireEnv: (key: string) =>
        key === "NEXT_PUBLIC_SUPABASE_URL" ? "https://example.supabase.co" : "anon",
    }));
    vi.doMock("@supabase/ssr", () => ({
      createServerClient: (_url: string, _key: string, options: MiddlewareClientOptions) => {
        options.cookies.setAll([{ name: "sb-access-token", value: "abc", options: { path: "/" } }]);
        return {
          auth: {
            getUser,
          },
        };
      },
    }));

    const { updateSession } = await import("./middleware");
    const request = {
      cookies: {
        getAll: () => [{ name: "sb-access-token", value: "old" }],
        set: requestCookieSet,
      },
    };

    const response = await updateSession(request as never);

    expect(getUser).toHaveBeenCalledTimes(1);
    expect(nextResponse).toHaveBeenCalledTimes(2);
    expect(requestCookieSet).toHaveBeenCalledWith("sb-access-token", "abc");
    expect(responseCookieSet).toHaveBeenCalledWith("sb-access-token", "abc", { path: "/" });
    expect(response).toBeTruthy();
  });
});
