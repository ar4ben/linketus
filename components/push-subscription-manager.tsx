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

export function PushSubscriptionManager({ vapidPublicKey, enabled }: PushSubscriptionManagerProps) {
  useEffect(() => {
    let cancelled = false;

    async function setup() {
      if (!("serviceWorker" in navigator)) {
        return;
      }

      const registration = await navigator.serviceWorker.register("/sw.js");

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
    };
  }, [enabled, vapidPublicKey]);

  return null;
}
