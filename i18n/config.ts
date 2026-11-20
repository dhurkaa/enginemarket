/** Locales with a messages file. Slovak (sk), Czech (cs) and German (de) are planned. */
export const locales = ["en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";
