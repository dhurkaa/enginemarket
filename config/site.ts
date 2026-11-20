/**
 * Site-wide facts. Everything here is PLACEHOLDER data from the brief: the client replaces it before
 * launch (see PLACEHOLDER_DATA.md). Components read these values; never hard-code them in a component.
 */
export const site = {
  name: "EngineMarket",
  domain: "enginemarket.eu",
  /** Used for canonical URLs, sitemap and Open Graph. Override with NEXT_PUBLIC_SITE_URL. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://enginemarket.eu",
  operator: "TopG7",
  shipsFrom: "Slovakia",
  shipsFromCode: "SK",
  currency: "EUR",
  locale: "en",
  vatRate: 0.23,
  reservationHours: 48,
  contact: {
    phone: "+421 2 3300 4400",
    phoneHref: "tel:+421233004400",
    email: "sales@enginemarket.eu",
    /** Opening hours in the client's time zone. dt label + value, read by the hours list. */
    timeZone: "Europe/Bratislava",
    hours: [
      { days: "mon-fri", label: "Monday to Friday", value: "8:00 to 17:00" },
      { days: "sat", label: "Saturday", value: "9:00 to 12:00" },
      { days: "sun", label: "Sunday", value: "Closed" },
    ],
  },
  /** Company details for the imprint. Empty values are left off the page until the client supplies them. */
  legal: {
    companyName: "",
    street: "",
    town: "",
    country: "Slovakia",
    registerNumber: "",
    vatId: "",
    managingDirector: "",
  },
  /** Grades set the warranty, in months. */
  grades: {
    R: { months: 12 },
    A: { months: 6 },
    B: { months: 6 },
    C: { months: 3 },
  },
} as const;

export type Grade = keyof typeof site.grades;
export const GRADES = Object.keys(site.grades) as Grade[];
