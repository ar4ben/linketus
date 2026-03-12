"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef } from "react";

import { createClient } from "@/lib/supabase/client";

type AuthSessionGuardProps = {
  initiallyAuthenticated: boolean;
};

const REFRESH_SKEW_SECONDS = 5 * 60;
const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

function requiresAuth(pathname: string) {
  return pathname === "/dashboard" || pathname === "/linket/new";
}

export function AuthSessionGuard({ initiallyAuthenticated }: AuthSessionGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);
  const inFlightRefresh = useRef<Promise<boolean> | null>(null);
  const redirected = useRef(false);

  const nextPath = useMemo(() => {
    const search = searchParams.toString();
    return search ? `${pathname}?${search}` : pathname;
  }, [pathname, searchParams]);

  const maybeRedirectToSignIn = useCallback(() => {
    if (!initiallyAuthenticated || redirected.current || !requiresAuth(pathname)) {
      return;
    }

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      return;
    }

    redirected.current = true;
    router.replace(`/signin?next=${encodeURIComponent(nextPath)}`);
  }, [initiallyAuthenticated, nextPath, pathname, router]);

  const refreshSession = useCallback(async () => {
    if (inFlightRefresh.current) {
      return inFlightRefresh.current;
    }

    inFlightRefresh.current = (async () => {
      const { data, error } = await supabase.auth.refreshSession();
      if (error || !data.session) {
        return false;
      }

      router.refresh();
      return true;
    })().finally(() => {
      inFlightRefresh.current = null;
    });

    return inFlightRefresh.current;
  }, [router, supabase.auth]);

  const ensureFreshSession = useCallback(async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      return false;
    }

    const session = data.session;
    if (!session) {
      return false;
    }

    if (!session.expires_at) {
      return true;
    }

    const now = Math.floor(Date.now() / 1000);
    const secondsLeft = session.expires_at - now;

    if (secondsLeft > REFRESH_SKEW_SECONDS) {
      return true;
    }

    const refreshed = await refreshSession();
    if (refreshed) {
      return true;
    }

    return secondsLeft > 0;
  }, [refreshSession, supabase.auth]);

  useEffect(() => {
    if (!initiallyAuthenticated) {
      return;
    }

    let cancelled = false;

    async function runHealthCheck() {
      const healthy = await ensureFreshSession();
      if (cancelled) {
        return;
      }

      if (!healthy) {
        maybeRedirectToSignIn();
      }
    }

    void runHealthCheck();

    const intervalId = window.setInterval(() => {
      void runHealthCheck();
    }, REFRESH_INTERVAL_MS);

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void runHealthCheck();
      }
    };

    const onOnline = () => {
      void runHealthCheck();
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        maybeRedirectToSignIn();
      }
    });

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("online", onOnline);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("online", onOnline);
      subscription.unsubscribe();
    };
  }, [ensureFreshSession, initiallyAuthenticated, maybeRedirectToSignIn, supabase.auth]);

  return null;
}
