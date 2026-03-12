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
      heroLine1: "Linketus is a simple way to be present with others - even when you're apart.",
      heroLine2: "Create a linket, invite people, and check in with a single tap.",
      heroLine3: "No chat. No noise. Just presence.",
      openDashboard: "My linkets",
      signIn: "Sign in with Google",
      createSlot: "Create linket",
      createFirst: "Create your first linket",
      installCta: "Add Linketus to your home screen for the best experience",
      iosInstallTitle: "Install on iPhone/iPad",
      iosInstallBody: "Tap the Share button in Safari, then choose \"Add to Home Screen\".",
    },
    nav: {
      dashboard: "My linkets",
      createSlot: "Create linket",
      signOut: "Sign out",
      signIn: "Sign in",
      language: "Language",
    },
    auth: {
      title: "Sign in",
      subtitle: "Use Google to continue in Linketus.",
      continueWithGoogle: "Continue with Google",
      legalLinksLabel: "By continuing, you agree to:",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
    },
    dashboard: {
      title: "My linkets",
      mySlots: "My linkets",
      participated: "Participated linkets",
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
      errorAuthRequired: "Authentication required",
      errorRequiredFields: "Please fill all required fields",
      errorDurationNumber: "Duration must be a number",
      errorDurationMin: "Minimum 1 hour",
      errorInvalidTimeRange: "Invalid time range",
      errorCreateFailed: "Failed to create linket. Please try again.",
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
      waitingToStart: "This linket hasn’t started yet. Check back when it begins.",
      markPresence: "Mark your presence with an emoji:",
      joined: "You joined 🎉",
      delete: "Delete linket",
      copy: "Copy link",
      copied: "Link copied",
      checkins: "Activity stream",
      emptyCheckins: "No activity yet.",
      loginToCheckIn: "Sign in to join",
      joinToSeeParticipants: "Join to see activity",
      createdBy: "Created by",
      notFound: "Linket not found.",
      recentCooldown: "One emoji per minute is available",
      errorLinketEmojiRequired: "Linket and emoji are required",
      errorUnsupportedEmoji: "Unsupported emoji",
      errorAuthRequired: "Authentication required",
      errorActiveWindow: "Check-ins are available only while the linket is active",
      errorCheckInFailed: "Failed to join linket. Please try again.",
      errorDeleteFailed: "Failed to delete linket. Please try again.",
      toastCheckedIn: "checked in",
      someone: "Someone",
      emojiAriaPrefix: "Join with",
    },
    offline: {
      title: "Offline",
      description: "Linketus is currently offline. Reconnect to load live linket updates.",
    },
    push: {
      prompt: "Enable notifications to get live linket activity",
      enable: "Enable notifications",
      enabling: "Enabling...",
      blocked: "Notifications are blocked for this app in system settings.",
    },
    legal: {
      privacyTitle: "Privacy Policy",
      privacyLastUpdated: "Last updated: March 12, 2026",
      privacyP1:
        "Linketus stores only the data needed to run linkets: your basic profile, linkets you create, check-ins, and push subscriptions.",
      privacyP2:
        "Linketus does not sell your data and does not use your data for advertising. We use Google sign-in only for authentication.",
      privacyP3:
        "If you want your data removed, contact the Linketus support email and include your account identifier.",
      termsTitle: "Terms of Service",
      termsLastUpdated: "Last updated: March 12, 2026",
      termsP1:
        "Linketus is provided as-is to help people share presence through linkets. You are responsible for how you use the app.",
      termsP2:
        "Do not use Linketus for abuse, illegal activity, or harmful content. We may suspend access for misuse.",
      termsP3:
        "The service may change over time. Continued use means you accept the latest version of these terms.",
    },
  },
  ru: {
    appName: "Linketus",
    home: {
      title: "Присутствие важнее общения",
      heroLine1: "Linketus — простой способ быть рядом с другими, даже когда вы не вместе.",
      heroLine2: "Создайте linket, пригласите людей и отмечайтесь одним нажатием.",
      heroLine3: "Без чатов. Без шума. Только присутствие.",
      openDashboard: "Мои linkets",
      signIn: "Войти через Google",
      createSlot: "Создать linket",
      createFirst: "Создать первый linket",
      installCta: "Добавьте Linketus на экран «Домой» для лучшего опыта",
      iosInstallTitle: "Установка на iPhone/iPad",
      iosInstallBody: "Нажмите «Поделиться» в Safari, затем выберите «На экран Домой».",
    },
    nav: {
      dashboard: "Мои linkets",
      createSlot: "Создать linket",
      signOut: "Выйти",
      signIn: "Войти",
      language: "Язык",
    },
    auth: {
      title: "Вход",
      subtitle: "Используйте Google, чтобы продолжить в Linketus.",
      continueWithGoogle: "Продолжить через Google",
      legalLinksLabel: "Продолжая, вы соглашаетесь с:",
      privacy: "Политикой конфиденциальности",
      terms: "Условиями использования",
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
      errorAuthRequired: "Требуется авторизация",
      errorRequiredFields: "Заполните все обязательные поля",
      errorDurationNumber: "Длительность должна быть числом",
      errorDurationMin: "Минимум 1 час",
      errorInvalidTimeRange: "Некорректный диапазон времени",
      errorCreateFailed: "Не удалось создать linket. Попробуйте еще раз.",
    },
    slot: {
      waiting: "Ожидание",
      active: "Активно",
      archive: "Завершено",
      startsIn: "Начнется через",
      endsIn: "Закончится через",
      startedAt: "Начало",
      endedAt: "Конец",
      checkIn: "Присоединитесь к linket с emoji:",
      waitingToStart: "Этот linket еще не начался. Вернитесь, когда он начнется.",
      markPresence: "Отметьте свое присутствие с emoji:",
      joined: "Вы присоединились 🎉",
      delete: "Удалить linket",
      copy: "Копировать ссылку",
      copied: "Ссылка скопирована",
      checkins: "Лента активности",
      emptyCheckins: "Пока нет активности.",
      loginToCheckIn: "Войдите, чтобы присоединиться",
      joinToSeeParticipants: "Присоединитесь, чтобы видеть активность",
      createdBy: "Создатель",
      notFound: "Linket не найден.",
      recentCooldown: "Доступен один emoji в минуту",
      errorLinketEmojiRequired: "Нужны linket и emoji",
      errorUnsupportedEmoji: "Неподдерживаемый emoji",
      errorAuthRequired: "Требуется авторизация",
      errorActiveWindow: "Отмечаться можно только во время активного linket",
      errorCheckInFailed: "Не удалось присоединиться к linket. Попробуйте еще раз.",
      errorDeleteFailed: "Не удалось удалить linket. Попробуйте еще раз.",
      toastCheckedIn: "отметился",
      someone: "Кто-то",
      emojiAriaPrefix: "Присоединиться с",
    },
    offline: {
      title: "Офлайн",
      description: "Linketus сейчас офлайн. Подключитесь к сети, чтобы видеть активность linket в реальном времени.",
    },
    push: {
      prompt: "Включите уведомления, чтобы получать активность linket в реальном времени",
      enable: "Включить уведомления",
      enabling: "Включаем...",
      blocked: "Уведомления для этого приложения заблокированы в системных настройках.",
    },
    legal: {
      privacyTitle: "Политика конфиденциальности",
      privacyLastUpdated: "Последнее обновление: 12 марта 2026",
      privacyP1:
        "Linketus хранит только данные, необходимые для работы linkets: базовый профиль, созданные linkets, отметки активности и push-подписки.",
      privacyP2:
        "Linketus не продает ваши данные и не использует их для рекламы. Вход через Google используется только для авторизации.",
      privacyP3:
        "Если вы хотите удалить свои данные, напишите в поддержку Linketus и укажите идентификатор аккаунта.",
      termsTitle: "Условия использования",
      termsLastUpdated: "Последнее обновление: 12 марта 2026",
      termsP1:
        "Linketus предоставляется «как есть» для совместного присутствия через linkets. Вы несете ответственность за использование приложения.",
      termsP2:
        "Запрещено использовать Linketus для злоупотреблений, незаконной активности или вредоносного контента. За нарушения доступ может быть ограничен.",
      termsP3:
        "Сервис может меняться со временем. Продолжая использовать сервис, вы принимаете актуальную версию условий.",
    },
  },
} as const;

export type Dictionary = typeof dictionary;

export function getDictionary(locale: Locale) {
  return dictionary[locale];
}
