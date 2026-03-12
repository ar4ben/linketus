import { describe, expect, it } from "vitest";

import { getDictionary, locales, normalizeLocale } from "@/lib/i18n/shared";

describe("i18n locale helpers", () => {
  it("supports only en/ru locales", () => {
    expect(locales).toEqual(["en", "ru"]);
  });

  it("normalizes unknown locale to en", () => {
    expect(normalizeLocale("en")).toBe("en");
    expect(normalizeLocale("ru")).toBe("ru");
    expect(normalizeLocale("de")).toBe("en");
    expect(normalizeLocale(undefined)).toBe("en");
  });
});

describe("dictionary content", () => {
  it("returns localized dictionaries for both locales", () => {
    const en = getDictionary("en");
    const ru = getDictionary("ru");

    expect(en.nav.signIn).toBe("Sign in");
    expect(ru.nav.signIn).toBe("Войти");
  });

  it("keeps product naming consistent (Linketus/linket are not translated)", () => {
    const en = getDictionary("en");
    const ru = getDictionary("ru");

    expect(en.appName).toBe("Linketus");
    expect(ru.appName).toBe("Linketus");
    expect(en.createSlot.title.toLowerCase()).toContain("linket");
    expect(ru.createSlot.title.toLowerCase()).toContain("linket");
    expect(ru.home.heroLine1).toContain("Linketus");
  });

  it("contains legal and auth copy for both locales", () => {
    const en = getDictionary("en");
    const ru = getDictionary("ru");

    expect(en.auth.privacy).toBe("Privacy Policy");
    expect(en.auth.terms).toBe("Terms of Service");
    expect(ru.auth.privacy).toBe("Политикой конфиденциальности");
    expect(ru.auth.terms).toBe("Условиями использования");
    expect(en.legal.privacyTitle).toBe("Privacy Policy");
    expect(ru.legal.termsTitle).toBe("Условия использования");
  });
});
