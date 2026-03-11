"use client";

type LocalDateTimeProps = {
  iso: string;
  locale: string;
  options?: Intl.DateTimeFormatOptions;
};

export function LocalDateTime({ iso, locale, options }: LocalDateTimeProps) {
  const formatted = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  }).format(new Date(iso));

  return (
    <time dateTime={iso} suppressHydrationWarning>
      {formatted}
    </time>
  );
}
