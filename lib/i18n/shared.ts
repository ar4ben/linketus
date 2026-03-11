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
        "Create a shared time slot and check in with one tap. No chat, no noise, only being there together.",
      openDashboard: "Open Dashboard",
      signIn: "Sign in with Google",
      createSlot: "Create Slot",
    },
    nav: {
      dashboard: "Dashboard",
      createSlot: "Create slot",
      signOut: "Sign out",
      signIn: "Sign in",
      language: "Language",
    },
    dashboard: {
      title: "Dashboard",
      feed: "Slots Feed",
      mySlots: "My Slots",
      participated: "Participated",
      emptyMySlots: "No created slots yet.",
      emptyParticipated: "No participations yet.",
      emptyFeed: "No slots to show yet.",
      mineMark: "mine",
      open: "Open",
      start: "Start",
      end: "End",
    },
    createSlot: {
      title: "Create a slot",
      titleLabel: "Title",
      titlePlaceholder: "Morning run, coworking, jam session...",
      startLabel: "Start (local time)",
      endLabel: "End (local time)",
      submit: "Create slot",
      authRequired: "Please sign in to create a slot.",
    },
    slot: {
      waiting: "Waiting room",
      active: "Active",
      archive: "Archive",
      startsIn: "Starts in",
      endsIn: "Ends in",
      startedAt: "Started at",
      endedAt: "Ended at",
      checkIn: "I'm Here",
      delete: "Delete slot",
      copy: "Copy link",
      copied: "Link copied",
      checkins: "Activity stream",
      emptyCheckins: "No check-ins yet.",
      loginToCheckIn: "Sign in to check in.",
      createdBy: "Created by",
      notFound: "Slot not found.",
      recentCooldown: "Cooldown active. Try again soon.",
    },
  },
  ru: {
    appName: "Linketus",
    home: {
      title: "Присутствие важнее общения",
      description:
        "Создайте общий слот времени и отмечайтесь одним нажатием. Без чатов и шума, просто быть рядом во времени.",
      openDashboard: "Открыть дашборд",
      signIn: "Войти через Google",
      createSlot: "Создать слот",
    },
    nav: {
      dashboard: "Дашборд",
      createSlot: "Создать слот",
      signOut: "Выйти",
      signIn: "Войти",
      language: "Язык",
    },
    dashboard: {
      title: "Дашборд",
      feed: "Лента слотов",
      mySlots: "Мои слоты",
      participated: "Участвовал",
      emptyMySlots: "Пока нет созданных слотов.",
      emptyParticipated: "Пока нет участий.",
      emptyFeed: "Пока нет слотов для отображения.",
      mineMark: "мой",
      open: "Открыть",
      start: "Начало",
      end: "Конец",
    },
    createSlot: {
      title: "Создать слот",
      titleLabel: "Название",
      titlePlaceholder: "Утренняя пробежка, коворкинг, джем...",
      startLabel: "Начало (локальное время)",
      endLabel: "Конец (локальное время)",
      submit: "Создать слот",
      authRequired: "Войдите, чтобы создать слот.",
    },
    slot: {
      waiting: "Ожидание",
      active: "Активен",
      archive: "Архив",
      startsIn: "Начнется через",
      endsIn: "Закончится через",
      startedAt: "Начался",
      endedAt: "Завершился",
      checkIn: "Я здесь",
      delete: "Удалить слот",
      copy: "Копировать ссылку",
      copied: "Ссылка скопирована",
      checkins: "Лента активности",
      emptyCheckins: "Пока нет отметок.",
      loginToCheckIn: "Войдите, чтобы отмечаться.",
      createdBy: "Создатель",
      notFound: "Слот не найден.",
      recentCooldown: "Кулдаун активен. Попробуйте позже.",
    },
  },
} as const;

export type Dictionary = typeof dictionary;

export function getDictionary(locale: Locale) {
  return dictionary[locale];
}
