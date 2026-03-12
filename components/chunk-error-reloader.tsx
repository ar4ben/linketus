"use client";

import { useEffect } from "react";

export const RELOAD_GUARD_KEY = "linketus_chunk_reload_guard_v1";
const CHUNK_ERROR_PATTERNS = [
  /chunkloaderror/i,
  /failed to load chunk/i,
  /loading chunk [\w-]+ failed/i,
  /failed to fetch dynamically imported module/i,
  /\/_next\/static\/chunks\//i,
];

export function stringifyError(input: unknown): string {
  if (typeof input === "string") {
    return input;
  }

  if (input instanceof Error) {
    return `${input.name}: ${input.message}`;
  }

  try {
    return JSON.stringify(input);
  } catch {
    return String(input ?? "");
  }
}

export function isChunkErrorMessage(message: string): boolean {
  return CHUNK_ERROR_PATTERNS.some((pattern) => pattern.test(message));
}

export function isNextStaticAssetTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) {
    return false;
  }

  if (target instanceof HTMLScriptElement) {
    return target.src.includes("/_next/static/");
  }

  if (target instanceof HTMLLinkElement) {
    return target.href.includes("/_next/static/");
  }

  return false;
}

export function attemptRecoveryReload(
  currentUrl: string = window.location.href,
  storage: Pick<Storage, "getItem" | "setItem"> = sessionStorage,
  reload: () => void = () => window.location.reload(),
) {
  const lastAttemptUrl = storage.getItem(RELOAD_GUARD_KEY);

  if (lastAttemptUrl === currentUrl) {
    return;
  }

  storage.setItem(RELOAD_GUARD_KEY, currentUrl);
  reload();
}

export function ChunkErrorReloader() {
  useEffect(() => {
    const clearGuardTimer = window.setTimeout(() => {
      sessionStorage.removeItem(RELOAD_GUARD_KEY);
    }, 10_000);

    const onWindowError = (event: Event) => {
      if (isNextStaticAssetTarget(event.target)) {
        attemptRecoveryReload();
        return;
      }

      if (event instanceof ErrorEvent) {
        const message = `${event.message} ${stringifyError(event.error)}`;
        if (isChunkErrorMessage(message)) {
          attemptRecoveryReload();
        }
      }
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const message = stringifyError(event.reason);
      if (isChunkErrorMessage(message)) {
        attemptRecoveryReload();
      }
    };

    window.addEventListener("error", onWindowError, true);
    window.addEventListener("unhandledrejection", onUnhandledRejection);

    return () => {
      window.clearTimeout(clearGuardTimer);
      window.removeEventListener("error", onWindowError, true);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);

  return null;
}
