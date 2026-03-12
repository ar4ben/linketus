import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SlotClient } from "@/components/slot-client";
import type { CheckIn, Slot } from "@/lib/db";
import { getDictionary } from "@/lib/i18n/shared";

const refresh = vi.fn();
const checkInAction = vi.fn();
const toastError = vi.fn();
const toastInfo = vi.fn();
const toastSuccess = vi.fn();

const channelOn = vi.fn();
const channelSubscribe = vi.fn();
const removeChannel = vi.fn();
const supabaseFrom = vi.fn();
const supabaseChannel = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh,
  }),
}));

vi.mock("@/app/actions", () => ({
  checkInAction: (...args: unknown[]) => checkInAction(...args),
}));

vi.mock("sonner", () => ({
  toast: {
    error: (...args: unknown[]) => toastError(...args),
    info: (...args: unknown[]) => toastInfo(...args),
    success: (...args: unknown[]) => toastSuccess(...args),
  },
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    channel: (...args: unknown[]) => supabaseChannel(...args),
    removeChannel: (...args: unknown[]) => removeChannel(...args),
    from: (...args: unknown[]) => supabaseFrom(...args),
  }),
}));

function buildSlot(): Slot {
  const now = Date.now();
  return {
    id: "slot-1",
    creator_id: "creator-1",
    title: "Morning linket",
    start_at: new Date(now - 60 * 60 * 1000).toISOString(),
    end_at: new Date(now + 60 * 60 * 1000).toISOString(),
    created_at: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
  };
}

function renderSlotClient(overrides?: Partial<ComponentProps<typeof SlotClient>>) {
  const strings = getDictionary("en").slot;
  return render(
    <SlotClient
      slot={buildSlot()}
      initialCheckIns={[]}
      currentUserId={null}
      hasJoined={false}
      signInUrl="/signin?next=%2Flinket%2Fslot-1"
      signInLabel="Sign in"
      locale="en"
      strings={strings}
      {...overrides}
    />,
  );
}

describe("SlotClient", () => {
  beforeEach(() => {
    refresh.mockReset();
    checkInAction.mockReset();
    toastError.mockReset();
    toastInfo.mockReset();
    toastSuccess.mockReset();
    channelOn.mockReset();
    channelSubscribe.mockReset();
    removeChannel.mockReset();
    supabaseFrom.mockReset();
    supabaseChannel.mockReset();

    channelOn.mockReturnValue({
      subscribe: channelSubscribe,
    });
    channelSubscribe.mockReturnValue({ unsubscribe: vi.fn() });
    supabaseChannel.mockReturnValue({
      on: channelOn,
    });
    supabaseFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: null }),
        }),
      }),
    });
  });

  it("shows sign-in CTA for unauthenticated users", () => {
    renderSlotClient();

    expect(screen.getByRole("heading", { name: "Sign in to join" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute(
      "href",
      "/signin?next=%2Flinket%2Fslot-1",
    );
  });

  it("shows gated activity message for authenticated users who have not joined", () => {
    renderSlotClient({
      currentUserId: "user-1",
      hasJoined: false,
    });

    expect(screen.getByRole("heading", { name: "Join this linket with an emoji:" })).toBeInTheDocument();
    expect(screen.getByText("Join to see activity")).toBeInTheDocument();
    expect(supabaseChannel).not.toHaveBeenCalled();
  });

  it("renders joined state and subscribes to realtime feed", async () => {
    const checkIns: CheckIn[] = [
      {
        id: "c1",
        slot_id: "slot-1",
        user_id: "u2",
        emoji: "🎉",
        created_at: new Date().toISOString(),
        profiles: { id: "u2", full_name: "Alex", avatar_url: null },
      },
    ];

    renderSlotClient({
      currentUserId: "user-1",
      hasJoined: true,
      initialCheckIns: checkIns,
    });

    expect(screen.getByRole("heading", { name: "You joined 🎉" })).toBeInTheDocument();
    expect(screen.getByText("Alex")).toBeInTheDocument();

    await waitFor(() => {
      expect(supabaseChannel).toHaveBeenCalledWith("slot-slot-1");
    });
  });

  it("submits check-in and refreshes page on success", async () => {
    checkInAction.mockResolvedValue({ error: null });
    renderSlotClient({
      currentUserId: "user-1",
      hasJoined: false,
    });

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Join with 😂" }));

    await waitFor(() => {
      expect(checkInAction).toHaveBeenCalledTimes(1);
    });

    const formData = checkInAction.mock.calls[0]?.[1] as FormData;
    expect(formData.get("slot_id")).toBe("slot-1");
    expect(formData.get("emoji")).toBe("😂");
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("shows action error when check-in fails", async () => {
    checkInAction.mockResolvedValue({ error: "Failed to join linket. Please try again." });
    renderSlotClient({
      currentUserId: "user-1",
      hasJoined: false,
    });

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Join with 😂" }));

    expect(await screen.findByText("Failed to join linket. Please try again.")).toBeInTheDocument();
    expect(toastError).toHaveBeenCalledTimes(1);
    expect(refresh).not.toHaveBeenCalled();
  });
});
