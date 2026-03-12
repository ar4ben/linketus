"use client";

import { useEffect, useState } from "react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

type PushSubscriptionManagerProps = {
  vapidPublicKey?: string;
  enabled: boolean;
  strings: {
    prompt: string;
    enable: string;
    enabling: string;
    blocked: string;
  };
};

async function getBuildVersion() {
  const response = await fetch("/api/version", {
    cache: "no-store",
    headers: {
      "Cache-Control": "no-cache",
    },
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as { version?: string };
  return payload.version ?? null;
}

export function PushSubscriptionManager({ vapidPublicKey, enabled, strings }: PushSubscriptionManagerProps) {
  const [isPushSupported, setIsPushSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("unsupported");
  const [hasSubscription, setHasSubscription] = useState(false);
  const [isEnabling, setIsEnabling] = useState(false);

  async function persistSubscription(subscription: PushSubscription) {
    await fetch("/api/push/subscription", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(subscription),
    });
  }

  useEffect(() => {
    let cancelled = false;
    let knownBuildVersion: string | null = null;
    let reloadTriggered = false;
    let updateIntervalId: number | null = null;
    let removeVisibilityListener: (() => void) | null = null;
    let removeControllerChangeListener: (() => void) | null = null;
    let removeUpdateFoundListener: (() => void) | null = null;

    async function setup() {
      if (!("serviceWorker" in navigator)) {
        return;
      }

      const registration = await navigator.serviceWorker.register("/sw.js", {
        updateViaCache: "none",
      });

      async function checkForBuildUpdate() {
        const latestVersion = await getBuildVersion();
        if (!latestVersion || cancelled) {
          return;
        }

        if (!knownBuildVersion) {
          knownBuildVersion = latestVersion;
          return;
        }

        if (latestVersion !== knownBuildVersion && !reloadTriggered) {
          reloadTriggered = true;
          window.location.reload();
        }
      }

      function skipWaitingIfNeeded() {
        if (registration.waiting) {
          registration.waiting.postMessage({ type: "SKIP_WAITING" });
        }
      }

      function onUpdateFound() {
        const installing = registration.installing;
        if (!installing) {
          return;
        }

        installing.addEventListener("statechange", () => {
          if (installing.state === "installed" && navigator.serviceWorker.controller) {
            skipWaitingIfNeeded();
          }
        });
      }

      registration.addEventListener("updatefound", onUpdateFound);
      removeUpdateFoundListener = () => registration.removeEventListener("updatefound", onUpdateFound);

      function onControllerChange() {
        if (!reloadTriggered) {
          reloadTriggered = true;
          window.location.reload();
        }
      }

      navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
      removeControllerChangeListener = () =>
        navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);

      function onVisibilityChange() {
        if (document.visibilityState !== "visible") {
          return;
        }

        void registration.update();
        void checkForBuildUpdate();
      }

      document.addEventListener("visibilitychange", onVisibilityChange);
      removeVisibilityListener = () => document.removeEventListener("visibilitychange", onVisibilityChange);

      void registration.update();
      skipWaitingIfNeeded();
      void checkForBuildUpdate();

      updateIntervalId = window.setInterval(() => {
        void registration.update();
        void checkForBuildUpdate();
      }, 60_000);

      const supported = "PushManager" in window && "Notification" in window;
      setIsPushSupported(supported);

      if (!supported) {
        setPermission("unsupported");
        setHasSubscription(false);
        return;
      }

      setPermission(Notification.permission);

      if (!enabled || !vapidPublicKey || Notification.permission !== "granted") {
        return;
      }

      const ready = await navigator.serviceWorker.ready;
      const subscription = await ready.pushManager.getSubscription();
      setHasSubscription(Boolean(subscription));

      if (cancelled || !subscription) {
        return;
      }

      await persistSubscription(subscription);
    }

    void setup();

    return () => {
      cancelled = true;
      if (updateIntervalId !== null) {
        window.clearInterval(updateIntervalId);
      }
      removeVisibilityListener?.();
      removeControllerChangeListener?.();
      removeUpdateFoundListener?.();
    };
  }, [enabled, vapidPublicKey]);

  async function onEnableNotifications() {
    if (
      !enabled ||
      !vapidPublicKey ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window) ||
      !("Notification" in window)
    ) {
      return;
    }

    setIsEnabling(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      let nextPermission = Notification.permission;

      if (nextPermission === "default") {
        nextPermission = await Notification.requestPermission();
      }

      setPermission(nextPermission);

      if (nextPermission !== "granted") {
        return;
      }

      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });
      }

      if (!subscription) {
        return;
      }

      await persistSubscription(subscription);
      setHasSubscription(true);
    } catch (error) {
      console.error("Push enable failed", error);
    } finally {
      setIsEnabling(false);
    }
  }

  if (!enabled || !vapidPublicKey || !isPushSupported) {
    return null;
  }

  if (permission === "granted" && hasSubscription) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-3 z-40 flex justify-center px-4 sm:bottom-4">
      <div className="w-full max-w-md rounded-2xl border border-border/80 bg-card/95 p-3 shadow-[0_10px_24px_-20px_rgba(32,29,26,0.65)] backdrop-blur">
        <p className="text-sm text-foreground">{strings.prompt}</p>
        {permission === "denied" ? (
          <p className="mt-2 text-xs text-muted-foreground">{strings.blocked}</p>
        ) : (
          <button
            type="button"
            onClick={onEnableNotifications}
            disabled={isEnabling}
            className="mt-2 inline-flex h-9 touch-manipulation items-center justify-center rounded-xl bg-primary px-3 text-sm font-medium text-primary-foreground transition-[transform,background-color,color,opacity] duration-100 ease-out hover:opacity-90 active:scale-[0.98] active:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isEnabling ? strings.enabling : strings.enable}
          </button>
        )}
      </div>
    </div>
  );
}
