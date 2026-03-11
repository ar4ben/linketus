export const CHECK_IN_COOLDOWN_SECONDS = 60;

export const SLOT_MIN_HOURS = 1;
export const SLOT_MAX_HOURS = 720;

export const ALLOWED_EMOJIS = [
  "😂",
  "❤️",
  "🤣",
  "👍",
  "😭",
  "🙏",
  "😘",
  "🥰",
  "😍",
  "😊",
  "💔",
  "🔥",
  "😎",
  "💩",
  "💪",
  "🙌",
  "👏",
  "✅",
  "👀",
  "💀",
  "🎉",
  "🎶",
  "🤡",
] as const;

export type AllowedEmoji = (typeof ALLOWED_EMOJIS)[number];
