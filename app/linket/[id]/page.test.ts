import { beforeEach, describe, expect, it, vi } from "vitest";

const getSlotByIdMock = vi.fn();

vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
}));

vi.mock("@/app/actions", () => ({
  deleteSlotAction: vi.fn(),
}));

vi.mock("@/components/slot-client", () => ({
  SlotClient: () => null,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children }: { children?: React.ReactNode }) => children ?? null,
}));

vi.mock("@/lib/data", () => ({
  getSlotById: (...args: unknown[]) => getSlotByIdMock(...args),
  getCheckInsBySlotId: vi.fn(),
}));

vi.mock("@/lib/i18n/shared", () => ({
  getDictionary: () => ({
    slot: { createdBy: "Created by", delete: "Delete" },
    nav: { signIn: "Sign in" },
  }),
}));

vi.mock("@/lib/i18n/server", () => ({
  getServerLocale: async () => "en",
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      getUser: async () => ({
        data: { user: null },
      }),
    },
    from: vi.fn(),
  }),
}));

import { generateMetadata } from "@/app/linket/[id]/page";

describe("linket page metadata", () => {
  beforeEach(() => {
    getSlotByIdMock.mockReset();
  });

  it("builds social metadata without Start and without title suffix", async () => {
    getSlotByIdMock.mockResolvedValue({
      id: "slot-123",
      title: "Daily standup",
    });

    const metadata = await generateMetadata({
      params: Promise.resolve({ id: "slot-123" }),
    });

    expect(getSlotByIdMock).toHaveBeenCalledWith("slot-123");
    expect(metadata.title).toBe("Daily standup");
    expect(metadata.description).toBe("");
    expect(metadata.alternates?.canonical).toBe("/linket/slot-123");

    expect(metadata.openGraph).toMatchObject({
      title: "Daily standup",
      description: "Daily standup",
      type: "website",
      url: "/linket/slot-123",
      siteName: "Linketus",
    });
    expect(metadata.openGraph?.images).toBeUndefined();

    expect(metadata.twitter).toEqual({
      card: "summary",
      title: "Daily standup",
      description: "Daily standup",
    });
  });

  it("returns non-indexable metadata when linket does not exist", async () => {
    getSlotByIdMock.mockResolvedValue(null);

    const metadata = await generateMetadata({
      params: Promise.resolve({ id: "missing-slot" }),
    });

    expect(metadata).toEqual({
      title: "Linket not found | Linketus",
      description: "Linket not found.",
      robots: {
        index: false,
        follow: false,
      },
    });
  });
});
