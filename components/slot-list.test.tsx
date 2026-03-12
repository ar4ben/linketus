import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SlotList } from "@/components/slot-list";
import type { Slot } from "@/lib/db";
import { getDictionary } from "@/lib/i18n/shared";

const strings = getDictionary("en");

describe("SlotList", () => {
  it("renders empty placeholder", () => {
    render(
      <SlotList
        slots={[]}
        locale="en"
        emptyLabel="Nothing here"
        openLabel="Open"
        slotStrings={strings.slot}
      />,
    );

    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });

  it("renders slot cards with status and open links", () => {
    const now = Date.now();
    const slots: Slot[] = [
      {
        id: "s1",
        creator_id: "u1",
        title: "Waiting slot",
        start_at: new Date(now + 60 * 60 * 1000).toISOString(),
        end_at: new Date(now + 2 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(now).toISOString(),
      },
      {
        id: "s2",
        creator_id: "u1",
        title: "Active slot",
        start_at: new Date(now - 60 * 60 * 1000).toISOString(),
        end_at: new Date(now + 60 * 60 * 1000).toISOString(),
        created_at: new Date(now).toISOString(),
      },
      {
        id: "s3",
        creator_id: "u1",
        title: "Ended slot",
        start_at: new Date(now - 3 * 60 * 60 * 1000).toISOString(),
        end_at: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(now).toISOString(),
      },
    ];

    render(
      <SlotList
        slots={slots}
        locale="en"
        emptyLabel="Nothing here"
        openLabel="Open"
        slotStrings={strings.slot}
      />,
    );

    expect(screen.getByRole("heading", { name: "Waiting slot" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Active slot" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Ended slot" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Open" })).toHaveLength(3);
    expect(screen.getByText("Waiting")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Ended")).toBeInTheDocument();
  });
});
