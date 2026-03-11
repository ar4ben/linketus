"use client";

import { SquarePlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type InstallLinketusCtaProps = {
  ctaText: string;
  iosTitle: string;
  iosBody: string;
};

function isIosDevice() {
  if (typeof navigator === "undefined") {
    return false;
  }

  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isStandaloneMode() {
  if (typeof window === "undefined") {
    return false;
  }

  const iosStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone;
  return Boolean(iosStandalone) || window.matchMedia("(display-mode: standalone)").matches;
}

export function InstallLinketusCta({ ctaText, iosTitle, iosBody }: InstallLinketusCtaProps) {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosPopover, setShowIosPopover] = useState(false);
  const [isInstalled, setIsInstalled] = useState(() => isStandaloneMode());

  const isIos = useMemo(() => isIosDevice(), []);

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    const onAppInstalled = () => {
      setInstallPrompt(null);
      setShowIosPopover(false);
      setIsInstalled(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  async function onInstallClick() {
    if (isInstalled) {
      return;
    }

    if (isIos) {
      setShowIosPopover((previous) => !previous);
      return;
    }

    if (!installPrompt) {
      return;
    }

    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  }

  return (
    <div className="relative mt-10 flex flex-col items-center">
      <button
        type="button"
        onClick={onInstallClick}
        className="flex items-center gap-3 rounded-2xl border border-input bg-card px-5 py-3 text-center text-base font-semibold text-foreground shadow-[0_10px_24px_-20px_rgba(32,29,26,0.6)] transition hover:bg-muted/50"
      >
        <SquarePlus className="size-9 text-emerald-600" />
        <span>{ctaText}</span>
      </button>

      {isIos && showIosPopover ? (
        <div className="absolute top-full z-10 mt-3 w-[min(92vw,420px)] rounded-2xl border border-border/90 bg-popover p-4 text-left text-sm text-popover-foreground shadow-lg">
          <p className="font-medium">{iosTitle}</p>
          <p className="mt-1 text-muted-foreground">{iosBody}</p>
        </div>
      ) : null}
    </div>
  );
}
