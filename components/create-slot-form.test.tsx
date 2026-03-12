import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CreateSlotForm } from "@/components/create-slot-form";
import { SLOT_MAX_HOURS } from "@/lib/constants";
import { getDictionary } from "@/lib/i18n/shared";

vi.mock("@/app/actions", () => ({
  createSlotAction: async () => ({ error: null }),
}));

const strings = getDictionary("en").createSlot;

describe("CreateSlotForm", () => {
  it("shows max duration validation and disables submit", () => {
    render(<CreateSlotForm locale="en" strings={strings} />);

    fireEvent.change(screen.getByPlaceholderText(strings.durationLabel), {
      target: { value: String(SLOT_MAX_HOURS + 1) },
    });

    expect(screen.getByText(strings.durationMaxError)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: strings.submit })).toBeDisabled();
  });

  it("sets timezone offset hidden field on submit when duration is valid", () => {
    const offsetSpy = vi.spyOn(Date.prototype, "getTimezoneOffset").mockReturnValue(-180);
    render(<CreateSlotForm locale="en" strings={strings} />);

    fireEvent.change(screen.getByPlaceholderText(strings.durationLabel), {
      target: { value: "2" },
    });

    const form = screen.getByRole("button", { name: strings.submit }).closest("form");
    expect(form).toBeTruthy();
    form!.addEventListener("submit", (event) => event.preventDefault());

    fireEvent.submit(form!);

    const offsetInput = document.querySelector('input[name="timezone_offset_minutes"]') as HTMLInputElement;
    expect(offsetInput.value).toBe("-180");

    offsetSpy.mockRestore();
  });

  it("opens native picker hooks for date and time fields when available", () => {
    render(<CreateSlotForm locale="en" strings={strings} />);

    const dateInput = screen.getByLabelText(strings.dateLabel) as HTMLInputElement & {
      showPicker?: () => void;
    };
    const timeInput = screen.getByLabelText(strings.timeLabel) as HTMLInputElement & {
      showPicker?: () => void;
    };
    const datePickerSpy = vi.fn();
    const timePickerSpy = vi.fn();
    dateInput.showPicker = datePickerSpy;
    timeInput.showPicker = timePickerSpy;

    fireEvent.click(dateInput);
    fireEvent.click(timeInput);

    expect(datePickerSpy).toHaveBeenCalledTimes(1);
    expect(timePickerSpy).toHaveBeenCalledTimes(1);
  });
});
