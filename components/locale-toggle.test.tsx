import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LocaleToggle } from "@/components/locale-toggle";
import { LOCALE_COOKIE } from "@/lib/i18n/shared";

const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh,
  }),
}));

describe("LocaleToggle", () => {
  beforeEach(() => {
    refresh.mockReset();
    document.cookie = "";
  });

  it("renders selected locale value", () => {
    render(<LocaleToggle locale="en" label="Language" />);
    expect(screen.getByLabelText("Language")).toHaveValue("en");
  });

  it("updates locale cookie and refreshes router on change", () => {
    render(<LocaleToggle locale="en" label="Language" />);

    fireEvent.change(screen.getByLabelText("Language"), { target: { value: "ru" } });

    expect(document.cookie).toContain(`${LOCALE_COOKIE}=ru`);
    expect(refresh).toHaveBeenCalledTimes(1);
  });
});
