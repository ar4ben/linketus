import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PushSubscriptionManager } from "@/components/push-subscription-manager";

const refreshSession = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      refreshSession,
    },
  }),
}));

type MutableNotification = {
  permission: NotificationPermission;
  requestPermission: ReturnType<typeof vi.fn<() => Promise<NotificationPermission>>>;
};

type MockRegistration = {
  waiting: ServiceWorker | null;
  installing: ServiceWorker | null;
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  pushManager: {
    getSubscription: ReturnType<typeof vi.fn>;
    subscribe: ReturnType<typeof vi.fn>;
  };
};

function setupPushEnvironment(options?: {
  permission?: NotificationPermission;
  existingSubscription?: PushSubscription | null;
}) {
  const permission = options?.permission ?? "default";
  const existingSubscription = options?.existingSubscription ?? null;

  const notification: MutableNotification = {
    permission,
    requestPermission: vi.fn(async () => "granted"),
  };

  vi.stubGlobal("Notification", notification as unknown as typeof Notification);
  vi.stubGlobal("PushManager", class PushManager {});

  const subscription =
    existingSubscription ??
    ({
      endpoint: "https://example.com/push-endpoint",
      toJSON: () => ({ endpoint: "https://example.com/push-endpoint" }),
    } as unknown as PushSubscription);

  const registration: MockRegistration = {
    waiting: null,
    installing: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    update: vi.fn(async () => undefined),
    pushManager: {
      getSubscription: vi.fn(async () => existingSubscription),
      subscribe: vi.fn(async () => subscription),
    },
  };

  Object.defineProperty(navigator, "serviceWorker", {
    configurable: true,
    value: {
      register: vi.fn(async () => registration),
      ready: Promise.resolve(registration),
      controller: {},
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    },
  });

  return { registration, notification, subscription };
}

function setupFetchMock(pushStatuses: number[] = [200]) {
  const queue = [...pushStatuses];
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = typeof input === "string" ? input : input.toString();

    if (url.endsWith("/api/version")) {
      return new Response(JSON.stringify({ version: "v1" }), { status: 200 });
    }

    if (url.endsWith("/api/push/subscription")) {
      const status = queue.shift() ?? 200;
      return new Response("{}", { status });
    }

    return new Response("{}", { status: 200 });
  });

  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("PushSubscriptionManager", () => {
  beforeEach(() => {
    refreshSession.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("renders nothing when push is not supported", () => {
    delete (window as Window & { PushManager?: unknown }).PushManager;
    delete (window as Window & { Notification?: unknown }).Notification;
    Reflect.deleteProperty(navigator as unknown as Record<string, unknown>, "serviceWorker");

    render(
      <PushSubscriptionManager
        enabled
        vapidPublicKey="test-vapid"
        strings={{
          prompt: "Enable notifications",
          enable: "Enable",
          enabling: "Enabling...",
          blocked: "Blocked",
        }}
      />,
    );

    expect(screen.queryByText("Enable notifications")).not.toBeInTheDocument();
  });

  it("retries subscription persistence once after 401 by refreshing session", async () => {
    setupPushEnvironment({ permission: "default" });
    const fetchMock = setupFetchMock([401, 200]);
    refreshSession.mockResolvedValue({
      data: { session: { access_token: "fresh-token" } },
      error: null,
    });

    render(
      <PushSubscriptionManager
        enabled
        vapidPublicKey="test-vapid"
        strings={{
          prompt: "Enable notifications",
          enable: "Enable",
          enabling: "Enabling...",
          blocked: "Blocked",
        }}
      />,
    );

    const user = userEvent.setup();
    const enableButton = await screen.findByRole("button", { name: "Enable" });
    await user.click(enableButton);

    await waitFor(() => {
      expect(refreshSession).toHaveBeenCalledTimes(1);
    });

    const pushCalls = fetchMock.mock.calls.filter(([url]) =>
      String(url).endsWith("/api/push/subscription"),
    );
    expect(pushCalls).toHaveLength(2);
  });

  it("shows blocked state when notifications are denied", async () => {
    setupPushEnvironment({ permission: "denied" });
    setupFetchMock();

    render(
      <PushSubscriptionManager
        enabled
        vapidPublicKey="test-vapid"
        strings={{
          prompt: "Enable notifications",
          enable: "Enable",
          enabling: "Enabling...",
          blocked: "Blocked",
        }}
      />,
    );

    expect(await screen.findByText("Blocked")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Enable" })).not.toBeInTheDocument();
  });

  it("auto-persists an existing subscription when permission is already granted", async () => {
    setupPushEnvironment({
      permission: "granted",
      existingSubscription: {
        endpoint: "https://example.com/existing",
        toJSON: () => ({ endpoint: "https://example.com/existing" }),
      } as unknown as PushSubscription,
    });
    const fetchMock = setupFetchMock([200]);

    render(
      <PushSubscriptionManager
        enabled
        vapidPublicKey="test-vapid"
        strings={{
          prompt: "Enable notifications",
          enable: "Enable",
          enabling: "Enabling...",
          blocked: "Blocked",
        }}
      />,
    );

    await waitFor(() => {
      const pushCalls = fetchMock.mock.calls.filter(([url]) =>
        String(url).endsWith("/api/push/subscription"),
      );
      expect(pushCalls).toHaveLength(1);
    });
  });
});
