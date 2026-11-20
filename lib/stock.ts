/**
 * The one data module for stock. Pages and API routes read engines only through these functions, so the
 * JSON file can be swapped for a database or a supplier API later without touching a page.
 */
import "server-only";
import raw from "@/data/engines.json";
import { GRADES, type Grade } from "@/config/site";
import { getReservation } from "@/lib/reservations";
import { engineSlug, normaliseCode, yearInRange } from "@/lib/format";
import type { Engine, EngineView, StockPage, StockQuery } from "@/lib/types";

export const PAGE_SIZE = 25;

const engines = (raw as { engines: Engine[] }).engines;

async function view(e: Engine): Promise<EngineView> {
  const r = e.status === "sold" ? null : await getReservation(e.id);
  return {
    ...e,
    slug: engineSlug(e),
    status: e.status === "sold" ? "sold" : r ? "reserved" : e.status,
    reservedUntil: r ? r.until : null,
  };
}

export async function getAllEngines(): Promise<EngineView[]> {
  return Promise.all(engines.map(view));
}

export async function getEngineById(id: string): Promise<EngineView | null> {
  const e = engines.find((x) => x.id === id);
  return e ? view(e) : null;
}

/** Slugs end with the id (`cffb-volkswagen-2-0-tdi-cr-em-0006`), so an old slug still finds the engine. */
export async function getEngineBySlug(slug: string): Promise<EngineView | null> {
  const m = slug.match(/(em-\d{4})$/);
  return m ? getEngineById(m[1]) : null;
}

export function matchesCode(e: Engine, q: string): boolean {
  const n = normaliseCode(q);
  if (!n) return true;
  return [e.code, ...e.aliases].some((c) => normaliseCode(c).startsWith(n) || normaliseCode(c) === n);
}

function matchesText(e: Engine, q: string): boolean {
  if (matchesCode(e, q)) return true;
  const hay = `${e.make} ${e.family} ${e.fits.map((f) => `${f.make} ${f.model}`).join(" ")}`.toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((w) => hay.includes(w));
}

function fitsCar(e: Engine, make?: string, model?: string, year?: string): boolean {
  if (!make && !model && !year) return true;
  return e.fits.some(
    (f) =>
      (!make || f.make === make) &&
      (!model || f.model === model) &&
      (!year || yearInRange(Number(year), f.years)),
  );
}

export async function queryStock(query: StockQuery): Promise<StockPage> {
  const all = await getAllEngines();
  // sold engines leave the list; their pages stay up for old links and point to similar engines
  let items = all.filter((e) => {
    if (e.status === "sold") return false;
    if (query.q && !matchesText(e, query.q)) return false;
    if (!fitsCar(e, query.make, query.model, query.year)) return false;
    if (query.fuel && e.fuel !== query.fuel) return false;
    if (query.grade?.length && !query.grade.includes(e.grade)) return false;
    if (query.priceMin != null && e.priceEur < query.priceMin) return false;
    if (query.priceMax != null && e.priceEur > query.priceMax) return false;
    if (query.kmMax != null && e.mileageKm > query.kmMax) return false;
    return true;
  });
  const sold = (e: EngineView) => (e.status === "sold" ? 1 : 0);
  const gradeRank = (g: Grade) => GRADES.indexOf(g);
  const sorters: Record<string, (a: EngineView, b: EngineView) => number> = {
    "price-asc": (a, b) => a.priceEur - b.priceEur,
    "price-desc": (a, b) => b.priceEur - a.priceEur,
    "km-asc": (a, b) => a.mileageKm - b.mileageKm,
    grade: (a, b) => gradeRank(a.grade) - gradeRank(b.grade) || a.priceEur - b.priceEur,
    relevance: (a, b) => a.id.localeCompare(b.id),
  };
  const sorter = sorters[query.sort ?? "relevance"] ?? sorters.relevance;
  items = items.sort((a, b) => sold(a) - sold(b) || sorter(a, b));
  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, query.page ?? 1), pages);
  return { items: items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), total, page, pageSize: PAGE_SIZE, pages };
}

/** Makes, models and years from the fitment lists, for the "choose your car" pickers. */
export function getCarCatalogue() {
  const map = new Map<string, Map<string, Set<number>>>();
  for (const e of engines) {
    for (const f of e.fits) {
      if (!map.has(f.make)) map.set(f.make, new Map());
      const models = map.get(f.make)!;
      if (!models.has(f.model)) models.set(f.model, new Set());
      const [from, toRaw] = f.years.split("–");
      const to = toRaw ? Number(toRaw) : new Date().getFullYear();
      for (let y = Number(from); y <= to; y++) models.get(f.model)!.add(y);
    }
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([make, models]) => ({
      make,
      models: [...models.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([model, years]) => ({ model, years: [...years].sort((a, b) => b - a) })),
    }));
}

export type CarCatalogue = ReturnType<typeof getCarCatalogue>;

export async function getSimilarEngines(e: EngineView, limit = 3): Promise<EngineView[]> {
  const all = await getAllEngines();
  const fitsKeys = new Set(e.fits.map((f) => `${f.make}|${f.model}`));
  return all
    .filter((x) => x.id !== e.id && x.status === "available")
    .map((x) => ({
      x,
      score:
        (x.fits.some((f) => fitsKeys.has(`${f.make}|${f.model}`)) ? 4 : 0) +
        (x.fuel === e.fuel ? 2 : 0) +
        (x.make === e.make ? 1 : 0) +
        (Math.abs(x.displacementCc - e.displacementCc) < 200 ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score || a.x.priceEur - b.x.priceEur)
    .slice(0, limit)
    .map((s) => s.x);
}

export async function getFeaturedEngines(limit = 4): Promise<EngineView[]> {
  const all = await getAllEngines();
  return all.filter((e) => e.photos.length && e.status !== "sold").slice(0, limit);
}

/** Car makes and how many listed engines fit one of their models, for the nav menu. */
export function getMakeCounts(): { make: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const e of engines) {
    if (e.status === "sold") continue;
    for (const make of new Set(e.fits.map((f) => f.make))) counts.set(make, (counts.get(make) ?? 0) + 1);
  }
  return [...counts.entries()].map(([make, count]) => ({ make, count })).sort((a, b) => b.count - a.count || a.make.localeCompare(b.make));
}

export function getCountryCount(): number {
  return 16;
}

export function getStockCount(): number {
  return engines.filter((e) => e.status !== "sold").length;
}

export function getEngineIds(): string[] {
  return engines.map((e) => e.id);
}

export function engineSlugs(): string[] {
  return engines.map(engineSlug);
}
