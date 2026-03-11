export const LOCALE_COOKIE = "linketus_locale";

export const locales = ["en", "ru"] as const;
export type Locale = (typeof locales)[number];

export function normalizeLocale(value: string | undefined): Locale {
  if (value === "ru") {
    return "ru";
  }

  return "en";
}

export const dictionary = {
  en: {
    appName: "Linketus",
    home: {
      title: "Presence over communication",
      description:
        "Create a shared linket and check in with one tap. No chat, no noise, only being there together.",
      openDashboard: "My linkets",
      signIn: "Sign in with Google",
      createSlot: "Create Linket",
    },
    nav: {
      dashboard: "My linkets",
      createSlot: "Create linket",
      signOut: "Sign out",
      signIn: "Sign in",
      language: "Language",
    },
    dashboard: {
      title: "My linkets",
      mySlots: "My linkets",
      participated: "Participated Linkets",
      emptyMySlots: "No created linkets yet.",
      emptyParticipated: "No participated linkets yet.",
      emptyFeed: "No linkets to show yet.",
      mineMark: "mine",
      open: "Open",
      start: "Start",
      end: "End",
    },
    createSlot: {
      title: "Create a linket",
      titleLabel: "Title",
      titlePlaceholder: "Morning run, coworking, jam session...",
      dateLabel: "Pick a date",
      timeLabel: "Start time",
      durationLabel: "Duration (in hours)",
      durationMaxError: "720 maximum",
      submit: "Create linket",
      authRequired: "Please sign in to create a linket.",
    },
    slot: {
      waiting: "Waiting",
      active: "Active",
      archive: "Ended",
      startsIn: "Starts in",
      endsIn: "Ends in",
      startedAt: "Start",
      endedAt: "End",
      checkIn: "Join this linket with an emoji:",
      joined: "You joined 🎉",
      delete: "Delete linket",
      copy: "Copy link",
      copied: "Link copied",
      checkins: "Activity stream",
      emptyCheckins: "No check-ins yet.",
      loginToCheckIn: "Sign in to join",
      joinToSeeParticipants: "Join to see activity",
      createdBy: "Created by",
      notFound: "Linket not found.",
      recentCooldown: "One emoji per minute is available",
    },
  },
  ru: {
    appName: "Linketus",
    home: {
      title: "Присутствие важнее общения",
      description:
        "Создайте общий linket и отмечайтесь одним нажатием. Без чатов и шума, просто быть рядом во времени.",
      openDashboard: "Мои linkets",
      signIn: "Войти через Google",
      createSlot: "Создать linket",
    },
    nav: {
      dashboard: "Мои linkets",
      createSlot: "Создать linket",
      signOut: "Выйти",
      signIn: "Войти",
      language: "Язык",
    },
    dashboard: {
      title: "Мои linkets",
      mySlots: "Мои linkets",
      participated: "Участвовал в linkets",
      emptyMySlots: "Пока нет созданных linkets.",
      emptyParticipated: "Пока нет linkets с участием.",
      emptyFeed: "Пока нет linkets для отображения.",
      mineMark: "мой",
      open: "Открыть",
      start: "Начало",
      end: "Конец",
    },
    createSlot: {
      title: "Создать linket",
      titleLabel: "Название",
      titlePlaceholder: "Утренняя пробежка, коворкинг, джем...",
      dateLabel: "Выберите дату",
      timeLabel: "Время начала",
      durationLabel: "Длительность (в часах)",
      durationMaxError: "Максимум 720",
      submit: "Создать linket",
      authRequired: "Войдите, чтобы создать linket.",
    },
    slot: {
      waiting: "Waiting",
      active: "Active",
      archive: "Ended",
      startsIn: "Начнется через",
      endsIn: "Закончится через",
      startedAt: "Start",
      endedAt: "End",
      checkIn: "Join this linket with an emoji:",
      joined: "You joined 🎉",
      delete: "Удалить linket",
      copy: "Копировать ссылку",
      copied: "Ссылка скопирована",
      checkins: "Лента активности",
      emptyCheckins: "Пока нет отметок.",
      loginToCheckIn: "Sign in to join",
      joinToSeeParticipants: "Join to see activity",
      createdBy: "Создатель",
      notFound: "Linket не найден.",
      recentCooldown: "One emoji per minute is available",
    },
  },
} as const;

export type Dictionary = typeof dictionary;

export function getDictionary(locale: Locale) {
  return dictionary[locale];
}
