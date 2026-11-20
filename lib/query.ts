/** The stock list's URL query: one parser for the page, the API route and the tests. */
import { GRADES, type Grade } from "@/config/site";
import type { Fuel, SortKey, StockQuery } from "@/lib/types";

const SORTS: SortKey[] = ["relevance", "price-asc", "price-desc", "km-asc", "grade"];

type Params = URLSearchParams | Record<string, string | string[] | undefined>;

function get(p: Params, k: string): string {
  if (p instanceof URLSearchParams) return p.get(k) ?? "";
  const v = p[k];
  return (Array.isArray(v) ? v[0] : v) ?? "";
}

const num = (s: string) => {
  if (s.trim() === "") return undefined;
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
};

export function parseStockQuery(p: Params): StockQuery {
  const fuel = get(p, "fuel");
  const sort = get(p, "sort") as SortKey;
  const grade = get(p, "grade")
    .split(",")
    .map((g) => g.trim().toUpperCase())
    .filter((g): g is Grade => (GRADES as string[]).includes(g));
  return {
    q: get(p, "q").trim() || undefined,
    make: get(p, "make") || undefined,
    model: get(p, "model") || undefined,
    year: /^\d{4}$/.test(get(p, "year")) ? get(p, "year") : undefined,
    fuel: fuel === "diesel" || fuel === "petrol" ? (fuel as Fuel) : undefined,
    grade: grade.length ? grade : undefined,
    priceMin: num(get(p, "priceMin")),
    priceMax: num(get(p, "priceMax")),
    kmMax: num(get(p, "kmMax")),
    sort: SORTS.includes(sort) ? sort : "relevance",
    page: Math.max(1, Math.floor(num(get(p, "page")) ?? 1)),
  };
}

/** The query as URL params, leaving out defaults so links stay short. */
export function stockQueryToParams(q: StockQuery & { view?: string }): URLSearchParams {
  const out = new URLSearchParams();
  if (q.q) out.set("q", q.q);
  if (q.make) out.set("make", q.make);
  if (q.model) out.set("model", q.model);
  if (q.year) out.set("year", q.year);
  if (q.fuel) out.set("fuel", q.fuel);
  if (q.grade?.length) out.set("grade", q.grade.join(","));
  if (q.priceMin != null) out.set("priceMin", String(q.priceMin));
  if (q.priceMax != null) out.set("priceMax", String(q.priceMax));
  if (q.kmMax != null) out.set("kmMax", String(q.kmMax));
  if (q.sort && q.sort !== "relevance") out.set("sort", q.sort);
  if (q.page && q.page > 1) out.set("page", String(q.page));
  if (q.view === "table") out.set("view", "table");
  return out;
}
