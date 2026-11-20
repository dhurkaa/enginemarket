/** Pure helpers shared by server and client code. */
import { site } from "@/config/site";
import type { Engine } from "@/lib/types";

export function slugify(s: string): string {
  return s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** `/engines/cffb-volkswagen-2-0-tdi-cr-em-0006` */
export function engineSlug(e: Pick<Engine, "code" | "make" | "family" | "id">): string {
  return `${slugify(e.code)}-${slugify(e.make)}-${slugify(e.family)}-${e.id}`;
}

export function enginePath(e: Pick<Engine, "code" | "make" | "family" | "id">): string {
  return `/engines/${engineSlug(e)}`;
}

/** Engine codes are typed as stamped: case, dots, spaces and dashes are ignored. */
export function normaliseCode(s: string): string {
  return s.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function yearInRange(year: number, range: string): boolean {
  const [from, to] = range.split("–");
  const end = to ? Number(to) : 9999;
  return year >= Number(from) && year <= end;
}

const eur = new Intl.NumberFormat("en-IE", { style: "currency", currency: site.currency, maximumFractionDigits: 0 });
const num = new Intl.NumberFormat("en-GB");

export const formatEur = (n: number) => eur.format(n);
export const formatKm = (n: number) => `${num.format(n)} km`;
export const formatNumber = (n: number) => num.format(n);
export const exVat = (n: number) => Math.round(n / (1 + site.vatRate));
export const litres = (cc: number) => (cc / 1000).toFixed(1);

/** Compression health of one cylinder against the engine's spec. */
export type Health = "good" | "fair" | "low";
export function cylinderHealth(bar: number, spec: { min: number; nominal: number }): Health {
  if (bar < spec.min) return "low";
  if (bar >= spec.nominal * 0.92) return "good";
  return "fair";
}

/** Largest gap between cylinders, in percent of the highest. */
export function compressionSpread(values: number[]): number {
  const max = Math.max(...values);
  const min = Math.min(...values);
  return Math.round(((max - min) / max) * 1000) / 10;
}

export function formatDateTime(iso: string, timeZone: string = site.contact.timeZone): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
    timeZoneName: "short",
  }).format(new Date(iso));
}
