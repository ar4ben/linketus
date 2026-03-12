import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DashboardFeed } from "@/components/dashboard-feed";
import type { DashboardFeedItem } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/shared";

const strings = getDictionary("en");

describe("DashboardFeed", () => {
  it("shows empty state when no linkets are available", () => {
    render(
      <DashboardFeed
        items={[]}
        locale="en"
        dashboardStrings={strings.dashboard}
        slotStrings={strings.slot}
      />,
    );

    expect(screen.getByText("No linkets to show yet.")).toBeInTheDocument();
  });

  it("renders all status variants and each card as a link", () => {
    const now = Date.now();
    const items: DashboardFeedItem[] = [
      {
        id: "waiting-id",
        creator_id: "u1",
        title: "Waiting linket",
        start_at: new Date(now + 60 * 60 * 1000).toISOString(),
        end_at: new Date(now + 2 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(now).toISOString(),
        isMine: true,
      },
      {
        id: "active-id",
        creator_id: "u2",
        title: "Active linket",
        start_at: new Date(now - 60 * 60 * 1000).toISOString(),
        end_at: new Date(now + 60 * 60 * 1000).toISOString(),
        created_at: new Date(now - 1000).toISOString(),
        isMine: false,
      },
      {
        id: "archive-id",
        creator_id: "u3",
        title: "Ended linket",
        start_at: new Date(now - 3 * 60 * 60 * 1000).toISOString(),
        end_at: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(now - 2000).toISOString(),
        isMine: false,
      },
    ];

    render(
      <DashboardFeed
        items={items}
        locale="en"
        dashboardStrings={strings.dashboard}
        slotStrings={strings.slot}
      />,
    );

    expect(screen.getByRole("link", { name: /Waiting linket/i })).toHaveAttribute(
      "href",
      "/linket/waiting-id",
    );
    expect(screen.getByRole("link", { name: /Active linket/i })).toHaveAttribute("href", "/linket/active-id");
    expect(screen.getByRole("link", { name: /Ended linket/i })).toHaveAttribute("href", "/linket/archive-id");

    expect(screen.getByText("Waiting")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Ended")).toBeInTheDocument();
  });
});
