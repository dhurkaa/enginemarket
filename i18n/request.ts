import { getRequestConfig } from "next-intl/server";
import { defaultLocale, locales, type Locale } from "./config";

/**
 * English only for now. To add Slovak, Czech or German: add messages/<locale>.json with the same keys,
 * add the locale to i18n/config.ts and pick it here (from a cookie, a domain or a path segment).
 */
export default getRequestConfig(async () => {
  const locale: Locale = locales.includes(defaultLocale) ? defaultLocale : "en";
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
    timeZone: "Europe/Bratislava",
  };
});
