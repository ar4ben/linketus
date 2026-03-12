import { describe, expect, it } from "vitest";

import { SLOT_MAX_HOURS, SLOT_MIN_HOURS } from "@/lib/constants";
import {
  formatDuration,
  getSlotState,
  localDateTimeToUtcIso,
  validateSlotDuration,
} from "@/lib/date";

describe("localDateTimeToUtcIso", () => {
  it("converts local datetime to UTC using user timezone offset", () => {
    const iso = localDateTimeToUtcIso("2026-03-12T12:30", -180);
    expect(iso).toBe("2026-03-12T09:30:00.000Z");
  });

  it("throws on invalid datetime format", () => {
    expect(() => localDateTimeToUtcIso("2026/03/12 12:30", -180)).toThrow("Invalid datetime format");
  });
});

describe("validateSlotDuration", () => {
  it("accepts durations at minimum and maximum bounds", () => {
    const start = "2026-03-12T00:00:00.000Z";
    const minEnd = new Date(new Date(start).getTime() + SLOT_MIN_HOURS * 60 * 60 * 1000).toISOString();
    const maxEnd = new Date(new Date(start).getTime() + SLOT_MAX_HOURS * 60 * 60 * 1000).toISOString();

    expect(() => validateSlotDuration(start, minEnd)).not.toThrow();
    expect(() => validateSlotDuration(start, maxEnd)).not.toThrow();
  });

  it("rejects non-positive durations", () => {
    const start = "2026-03-12T00:00:00.000Z";
    expect(() => validateSlotDuration(start, start)).toThrow("End time must be after start time");
  });

  it("rejects durations below minimum and above maximum bounds", () => {
    const start = "2026-03-12T00:00:00.000Z";
    const tooShort = new Date(new Date(start).getTime() + 30 * 60 * 1000).toISOString();
    const tooLong = new Date(new Date(start).getTime() + (SLOT_MAX_HOURS + 1) * 60 * 60 * 1000).toISOString();

    expect(() => validateSlotDuration(start, tooShort)).toThrow(
      `Linket duration must be between ${SLOT_MIN_HOURS} and ${SLOT_MAX_HOURS} hours`,
    );
    expect(() => validateSlotDuration(start, tooLong)).toThrow(
      `Linket duration must be between ${SLOT_MIN_HOURS} and ${SLOT_MAX_HOURS} hours`,
    );
  });
});

describe("getSlotState", () => {
  const start = "2026-03-12T10:00:00.000Z";
  const end = "2026-03-12T12:00:00.000Z";

  it("returns waiting before start", () => {
    expect(getSlotState(start, end, new Date("2026-03-12T09:59:59.000Z"))).toBe("waiting");
  });

  it("returns active during range and at exact end timestamp", () => {
    expect(getSlotState(start, end, new Date("2026-03-12T11:00:00.000Z"))).toBe("active");
    expect(getSlotState(start, end, new Date("2026-03-12T12:00:00.000Z"))).toBe("active");
  });

  it("returns archive after end", () => {
    expect(getSlotState(start, end, new Date("2026-03-12T12:00:00.001Z"))).toBe("archive");
  });
});

describe("formatDuration", () => {
  it("returns 0s for non-positive values", () => {
    expect(formatDuration(0)).toBe("0s");
    expect(formatDuration(-10)).toBe("0s");
  });

  it("formats seconds and mixed units", () => {
    expect(formatDuration(59)).toBe("59s");
    expect(formatDuration(3661)).toBe("1h 1m 1s");
  });

  it("limits output to the three most significant chunks", () => {
    expect(formatDuration(90061)).toBe("1d 1h 1m");
  });
});
