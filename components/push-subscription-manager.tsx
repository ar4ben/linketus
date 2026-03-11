"use client";

import { useEffect } from "react";

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

export function PushSubscriptionManager({ vapidPublicKey, enabled }: PushSubscriptionManagerProps) {
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

      if (!enabled || !vapidPublicKey || !("PushManager" in window) || !("Notification" in window)) {
        return;
      }

      if (Notification.permission === "default") {
        await Notification.requestPermission();
      }

      if (Notification.permission !== "granted") {
        return;
      }

      const ready = await navigator.serviceWorker.ready;
      let subscription = await ready.pushManager.getSubscription();

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });
      }

      if (cancelled || !subscription) {
        return;
      }

      await fetch("/api/push/subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subscription),
      });
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

  return null;
}
