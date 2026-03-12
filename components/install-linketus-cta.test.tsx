import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { InstallLinketusCta } from "@/components/install-linketus-cta";

function setUserAgent(userAgent: string) {
  Object.defineProperty(window.navigator, "userAgent", {
    configurable: true,
    value: userAgent,
  });
}

function setupMatchMedia(matches = false) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockImplementation(() => ({
      matches,
      media: "(display-mode: standalone)",
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

describe("InstallLinketusCta", () => {
  beforeEach(() => {
    setupMatchMedia(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows iOS popover instructions on tap", async () => {
    setUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X)");

    render(
      <InstallLinketusCta
        ctaText="Install"
        iosTitle="Install on iPhone"
        iosBody="Use share menu"
      />,
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Install" }));

    expect(screen.getByText("Install on iPhone")).toBeInTheDocument();
    expect(screen.getByText("Use share menu")).toBeInTheDocument();
  });

  it("triggers browser install prompt on non-iOS when event is available", async () => {
    setUserAgent("Mozilla/5.0 (Linux; Android 14)");

    const prompt = vi.fn(async () => undefined);
    const beforeInstallEvent = new Event("beforeinstallprompt") as Event & {
      prompt: () => Promise<void>;
      userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
      preventDefault: () => void;
    };
    beforeInstallEvent.prompt = prompt;
    beforeInstallEvent.userChoice = Promise.resolve({ outcome: "accepted", platform: "web" });
    const preventDefaultSpy = vi.spyOn(beforeInstallEvent, "preventDefault");

    render(
      <InstallLinketusCta
        ctaText="Install"
        iosTitle="Install on iPhone"
        iosBody="Use share menu"
      />,
    );

    window.dispatchEvent(beforeInstallEvent);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Install" }));

    expect(preventDefaultSpy).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(prompt).toHaveBeenCalledTimes(1);
    });
  });
});
