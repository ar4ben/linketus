import { render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AuthSessionGuard } from "@/components/auth-session-guard";

const navigationState = {
  pathname: "/dashboard",
  search: "",
  replace: vi.fn<(href: string) => void>(),
  refresh: vi.fn<() => void>(),
};

let onAuthStateChangeCallback: ((event: string) => void) | null = null;
const unsubscribe = vi.fn();

const authMock = {
  getSession: vi.fn(),
  refreshSession: vi.fn(),
  onAuthStateChange: vi.fn(),
};

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: navigationState.replace,
    refresh: navigationState.refresh,
  }),
  usePathname: () => navigationState.pathname,
  useSearchParams: () => new URLSearchParams(navigationState.search),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: authMock,
  }),
}));

function setOnline(value: boolean) {
  Object.defineProperty(window.navigator, "onLine", {
    configurable: true,
    value,
  });
}

describe("AuthSessionGuard", () => {
  beforeEach(() => {
    navigationState.pathname = "/dashboard";
    navigationState.search = "";
    navigationState.replace.mockReset();
    navigationState.refresh.mockReset();
    onAuthStateChangeCallback = null;
    unsubscribe.mockReset();

    authMock.getSession.mockReset();
    authMock.refreshSession.mockReset();
    authMock.onAuthStateChange.mockReset();

    authMock.onAuthStateChange.mockImplementation((callback: (event: string) => void) => {
      onAuthStateChangeCallback = callback;
      return {
        data: {
          subscription: {
            unsubscribe,
          },
        },
      };
    });

    setOnline(true);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("does not run health checks for unauthenticated visitors", () => {
    render(<AuthSessionGuard initiallyAuthenticated={false} />);
    expect(authMock.getSession).not.toHaveBeenCalled();
    expect(navigationState.replace).not.toHaveBeenCalled();
  });

  it("refreshes a near-expiry session and keeps user on page", async () => {
    const expiringSoon = Math.floor(Date.now() / 1000) + 30;
    authMock.getSession.mockResolvedValue({
      data: { session: { expires_at: expiringSoon } },
      error: null,
    });
    authMock.refreshSession.mockResolvedValue({
      data: { session: { expires_at: expiringSoon + 3600 } },
      error: null,
    });

    render(<AuthSessionGuard initiallyAuthenticated />);

    await waitFor(() => {
      expect(authMock.refreshSession).toHaveBeenCalledTimes(1);
    });
    expect(navigationState.refresh).toHaveBeenCalledTimes(1);
    expect(navigationState.replace).not.toHaveBeenCalled();
  });

  it("redirects to sign-in when no session exists on protected route", async () => {
    navigationState.pathname = "/dashboard";
    navigationState.search = "tab=recent";
    authMock.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    render(<AuthSessionGuard initiallyAuthenticated />);

    await waitFor(() => {
      expect(navigationState.replace).toHaveBeenCalledWith("/signin?next=%2Fdashboard%3Ftab%3Drecent");
    });
  });

  it("does not redirect while offline even if session check fails", async () => {
    setOnline(false);
    authMock.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    render(<AuthSessionGuard initiallyAuthenticated />);

    await waitFor(() => {
      expect(authMock.getSession).toHaveBeenCalled();
    });
    expect(navigationState.replace).not.toHaveBeenCalled();
  });

  it("does not redirect on public routes", async () => {
    navigationState.pathname = "/linket/abc";
    authMock.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    render(<AuthSessionGuard initiallyAuthenticated />);

    await waitFor(() => {
      expect(authMock.getSession).toHaveBeenCalled();
    });
    expect(navigationState.replace).not.toHaveBeenCalled();
  });

  it("redirects after SIGNED_OUT auth event on protected routes", async () => {
    authMock.getSession.mockResolvedValue({
      data: { session: { expires_at: Math.floor(Date.now() / 1000) + 3600 } },
      error: null,
    });

    render(<AuthSessionGuard initiallyAuthenticated />);

    await waitFor(() => {
      expect(authMock.onAuthStateChange).toHaveBeenCalled();
    });

    onAuthStateChangeCallback?.("SIGNED_OUT");
    await waitFor(() => {
      expect(navigationState.replace).toHaveBeenCalledWith("/signin?next=%2Fdashboard");
    });
  });
});
