import { SLOT_MAX_HOURS, SLOT_MIN_HOURS } from "@/lib/constants";

export type SlotState = "waiting" | "active" | "archive";

const localDateTimePattern =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;

export function localDateTimeToUtcIso(
  localDateTime: string,
  timezoneOffsetMinutes: number,
): string {
  const match = localDateTime.match(localDateTimePattern);

  if (!match) {
    throw new Error("Invalid datetime format");
  }

  const [, yearToken, monthToken, dayToken, hourToken, minuteToken] = match;
  const year = Number(yearToken);
  const month = Number(monthToken);
  const day = Number(dayToken);
  const hour = Number(hourToken);
  const minute = Number(minuteToken);

  const utcTimestamp =
    Date.UTC(year, month - 1, day, hour, minute, 0, 0) +
    timezoneOffsetMinutes * 60 * 1000;

  return new Date(utcTimestamp).toISOString();
}

export function validateSlotDuration(startAtIso: string, endAtIso: string): void {
  const start = new Date(startAtIso);
  const end = new Date(endAtIso);
  const durationMs = end.getTime() - start.getTime();

  if (durationMs <= 0) {
    throw new Error("End time must be after start time");
  }

  const minDurationMs = SLOT_MIN_HOURS * 60 * 60 * 1000;
  const maxDurationMs = SLOT_MAX_HOURS * 60 * 60 * 1000;

  if (durationMs < minDurationMs || durationMs > maxDurationMs) {
    throw new Error(`Linket duration must be between ${SLOT_MIN_HOURS} and ${SLOT_MAX_HOURS} hours`);
  }
}

export function getSlotState(
  startAt: string | Date,
  endAt: string | Date,
  nowDate: Date = new Date(),
): SlotState {
  const start = new Date(startAt);
  const end = new Date(endAt);
  const now = nowDate.getTime();

  if (now < start.getTime()) {
    return "waiting";
  }

  if (now > end.getTime()) {
    return "archive";
  }

  return "active";
}

export function formatDuration(seconds: number): string {
  if (seconds <= 0) {
    return "0s";
  }

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const chunks: string[] = [];
  if (days > 0) chunks.push(`${days}d`);
  if (hours > 0) chunks.push(`${hours}h`);
  if (minutes > 0) chunks.push(`${minutes}m`);
  if (secs > 0 && chunks.length < 3) chunks.push(`${secs}s`);

  return chunks.join(" ");
}
