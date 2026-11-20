"use client";

import { useCallback, useEffect, useMemo, useOptimistic, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { GRADES, type Grade } from "@/config/site";
import { enginePath, formatEur, formatKm, litres } from "@/lib/format";
import { parseStockQuery, stockQueryToParams } from "@/lib/query";
import type { CarCatalogue } from "@/lib/stock";
import type { StockPage, StockQuery } from "@/lib/types";
import { EngineCard } from "@/components/engine-card";
import { CylinderStrip, GradeBadge } from "@/components/ui";

type Load = { state: "loading" } | { state: "error" } | { state: "done"; data: StockPage };

const KM_STEPS = [50000, 100000, 150000, 200000];

export function StockBrowser({ catalogue }: { catalogue: CarCatalogue }) {
  const t = useTranslations("engines");
  const tc = useTranslations("common");
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  // the URL is the source of truth; the controls show the change at once (optimistic) while it lands there
  const urlQuery = useMemo(() => parseStockQuery(new URLSearchParams(params.toString())), [params]);
  const urlView = params.get("view") === "table" ? "table" : "cards";
  const apiKey = useMemo(() => stockQueryToParams(urlQuery).toString(), [urlQuery]);
  const [, startTransition] = useTransition();
  const [opt, setOpt] = useOptimistic({ query: urlQuery, view: urlView });
  const query = opt.query;
  const view = opt.view;

  const [attempt, setAttempt] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const fetchKey = `${apiKey}#${attempt}`;
  const [result, setResult] = useState<{ key: string; data?: StockPage; failed?: boolean } | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch(`/api/stock?${apiKey}`, { signal: ctrl.signal, headers: { Accept: "application/json" } })
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json() as Promise<StockPage>;
      })
      .then((data) => setResult({ key: fetchKey, data }))
      .catch((err) => {
        if ((err as Error).name !== "AbortError") setResult({ key: fetchKey, failed: true });
      });
    return () => ctrl.abort();
  }, [apiKey, fetchKey]);

  // the list is loading until the answer for this exact query (and attempt) is in
  const load: Load =
    !result || result.key !== fetchKey ? { state: "loading" } : result.failed ? { state: "error" } : { state: "done", data: result.data! };

  const push = useCallback(
    (next: Partial<StockQuery> & { view?: string }, resetPage = true) => {
      const merged = { ...query, view, ...next, ...(resetPage ? { page: 1 } : {}) };
      const { view: nextView, ...nextQuery } = merged;
      const s = stockQueryToParams(merged).toString();
      startTransition(() => {
        setOpt({ query: nextQuery, view: nextView === "table" ? "table" : "cards" });
        router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false });
      });
    },
    [query, view, router, pathname, setOpt],
  );

  const models = catalogue.find((c) => c.make === query.make)?.models ?? [];
  const years = models.find((m) => m.model === query.model)?.years ?? [];
  const hasFilters = Boolean(
    query.q || query.make || query.model || query.year || query.fuel || query.grade?.length || query.priceMin != null || query.priceMax != null || query.kmMax != null,
  );

  const toggleGrade = (g: Grade) => {
    const set = new Set(query.grade ?? []);
    if (set.has(g)) set.delete(g);
    else set.add(g);
    push({ grade: GRADES.filter((x) => set.has(x)) });
  };

  const pageHref = (n: number) => {
    const s = stockQueryToParams({ ...query, view, page: n }).toString();
    return s ? `${pathname}?${s}` : pathname;
  };

  return (
    <>
      {/* keyed by the URL value, so the back button or a shared link resets what the field shows */}
      <SearchBox key={query.q ?? ""} initial={query.q ?? ""} onSearch={(v) => push({ q: v.trim() || undefined })} />
      <div className="stock">
        <div>
          <button
            className="btn btn--secondary stock__toggle"
            type="button"
            aria-expanded={filtersOpen}
            aria-controls="stock-filters"
            onClick={() => setFiltersOpen((o) => !o)}
          >
            {filtersOpen ? t("hideFilters") : t("showFilters")}
          </button>
          <div className="stock__filters" id="stock-filters" data-open={String(filtersOpen)} aria-label={t("filters")} role="group">
            <fieldset>
              <legend>{t("carGroup")}</legend>
              <div className="field">
                <label htmlFor="f-make">{t("make")}</label>
                <select id="f-make" value={query.make ?? ""} onChange={(e) => push({ make: e.target.value || undefined, model: undefined, year: undefined })}>
                  <option value="">{t("anyMake")}</option>
                  {catalogue.map((c) => (
                    <option key={c.make} value={c.make}>
                      {c.make}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="f-model">{t("model")}</label>
                <select
                  id="f-model"
                  value={query.model ?? ""}
                  disabled={!query.make}
                  onChange={(e) => push({ model: e.target.value || undefined, year: undefined })}
                >
                  <option value="">{t("anyModel")}</option>
                  {models.map((m) => (
                    <option key={m.model} value={m.model}>
                      {m.model}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="f-year">{t("year")}</label>
                <select id="f-year" value={query.year ?? ""} disabled={!query.model} onChange={(e) => push({ year: e.target.value || undefined })}>
                  <option value="">{t("anyYear")}</option>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </fieldset>

            <div className="field">
              <label htmlFor="f-fuel">{t("fuel")}</label>
              <select id="f-fuel" value={query.fuel ?? ""} onChange={(e) => push({ fuel: (e.target.value || undefined) as StockQuery["fuel"] })}>
                <option value="">{t("anyFuel")}</option>
                <option value="diesel">{tc("fuel.diesel")}</option>
                <option value="petrol">{tc("fuel.petrol")}</option>
              </select>
            </div>

            <fieldset>
              <legend>{t("grade")}</legend>
              <div className="chips">
                {GRADES.map((g) => (
                  <label className="chip" key={g}>
                    <input type="checkbox" checked={query.grade?.includes(g) ?? false} onChange={() => toggleGrade(g)} aria-label={tc("grade", { grade: g })} />
                    <span aria-hidden="true">{g}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <PriceFields
              key={`${query.priceMin ?? ""}-${query.priceMax ?? ""}`}
              min={query.priceMin}
              max={query.priceMax}
              onApply={(priceMin, priceMax) => {
                if (priceMin !== query.priceMin || priceMax !== query.priceMax) push({ priceMin, priceMax });
              }}
            />

            <div className="field">
              <label htmlFor="f-km">{t("kmMax")}</label>
              <select id="f-km" value={query.kmMax?.toString() ?? ""} onChange={(e) => push({ kmMax: e.target.value ? Number(e.target.value) : undefined })}>
                <option value="">{t("anyKm")}</option>
                {KM_STEPS.map((k) => (
                  <option key={k} value={k}>
                    {formatKm(k)}
                  </option>
                ))}
              </select>
            </div>

            {hasFilters && (
              <button className="btn btn--secondary" type="button" onClick={() => router.replace(view === "table" ? `${pathname}?view=table` : pathname, { scroll: false })}>
                {t("clear")}
              </button>
            )}
          </div>
        </div>

        <div aria-live="polite" aria-busy={load.state === "loading"}>
          <div className="stock__bar">
            <p className="stock__range" data-testid="range">
              {load.state === "done"
                ? load.data.total
                  ? t("range", {
                      from: (load.data.page - 1) * load.data.pageSize + 1,
                      to: Math.min(load.data.page * load.data.pageSize, load.data.total),
                      total: load.data.total,
                    })
                  : t("rangeNone")
                : load.state === "loading"
                  ? t("loading")
                  : ""}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--s-3)", alignItems: "end" }}>
              <div className="field">
                <label htmlFor="f-sort">{t("sort")}</label>
                <select id="f-sort" value={query.sort ?? "relevance"} onChange={(e) => push({ sort: e.target.value as StockQuery["sort"] })}>
                  <option value="relevance">{t("sortRelevance")}</option>
                  <option value="price-asc">{t("sortPriceAsc")}</option>
                  <option value="price-desc">{t("sortPriceDesc")}</option>
                  <option value="km-asc">{t("sortKm")}</option>
                  <option value="grade">{t("sortGrade")}</option>
                </select>
              </div>
              <div className="seg" role="group" aria-label={t("view")}>
                <button type="button" aria-pressed={view === "cards"} onClick={() => push({ view: "cards" }, false)}>
                  {t("viewCards")}
                </button>
                <button type="button" aria-pressed={view === "table"} onClick={() => push({ view: "table" }, false)}>
                  {t("viewTable")}
                </button>
              </div>
            </div>
          </div>

          {load.state === "loading" && <Skeleton />}

          {load.state === "error" && (
            <div className="state-box" role="alert" data-testid="stock-error">
              <h2>{t("errorTitle")}</h2>
              <p>{t("errorLine")}</p>
              <button className="btn btn--primary" type="button" onClick={() => setAttempt((a) => a + 1)}>
                {t("reload")}
              </button>
            </div>
          )}

          {load.state === "done" && load.data.total === 0 && (
            <div className="state-box" data-testid="stock-empty">
              <h2>{t("emptyTitle")}</h2>
              <p>{t("emptyLine")}</p>
              <div className="btn-row">
                <a className="btn btn--primary" href={`/sourcing${query.q ? `?code=${encodeURIComponent(query.q)}` : ""}`}>
                  {t("emptyButton")}
                </a>
                {hasFilters && (
                  <button className="btn btn--secondary" type="button" onClick={() => router.replace(pathname, { scroll: false })}>
                    {t("clear")}
                  </button>
                )}
              </div>
            </div>
          )}

          {load.state === "done" && load.data.total > 0 && (
            <>
              {view === "cards" ? (
                <div className="stock__grid" data-testid="stock-results">
                  {load.data.items.map((e, i) => (
                    <EngineCard key={e.id} e={e} eager={i < 3} />
                  ))}
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="stock-table" data-testid="stock-results">
                    <thead>
                      <tr>
                        <th scope="col">{t("colEngine")}</th>
                        <th scope="col" className="hide-sm">{t("colFits")}</th>
                        <th scope="col" className="hide-sm">{t("colCompression")}</th>
                        <th scope="col">{t("colGrade")}</th>
                        <th scope="col" className="hide-sm">{t("colKm")}</th>
                        <th scope="col">{t("colPrice")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {load.data.items.map((e) => (
                        <tr key={e.id} data-engine={e.id}>
                          <td>
                            <a href={enginePath(e)}>{e.code}</a>
                            <div className="muted">
                              {e.make} {e.family} · {tc(`fuel.${e.fuel}`)} · {litres(e.displacementCc)} l
                            </div>
                          </td>
                          <td className="hide-sm">
                            {e.fits[0].make} {e.fits[0].model}
                            {e.fits.length > 1 && <div className="muted">{t("fitsMore", { count: e.fits.length - 1 })}</div>}
                          </td>
                          <td className="hide-sm">
                            <CylinderStrip
                              values={e.compressionBar}
                              spec={e.specCompressionBar}
                              label={t("compressionOf", {
                                count: e.compressionBar.length,
                                min: Math.min(...e.compressionBar).toFixed(1),
                                max: Math.max(...e.compressionBar).toFixed(1),
                              })}
                            />
                          </td>
                          <td>
                            <GradeBadge grade={e.grade} label={tc("grade", { grade: e.grade })} size="sm" />
                          </td>
                          <td className="hide-sm">{formatKm(e.mileageKm)}</td>
                          <td>
                            {formatEur(e.priceEur)}
                            {e.status !== "available" && <div className="muted">{tc(`status.${e.status}`)}</div>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {load.data.pages > 1 && (
                <nav className="pager" aria-label={t("pagination")}>
                  {load.data.page > 1 ? (
                    <a href={pageHref(load.data.page - 1)} aria-label={t("prev")}>
                      ←
                    </a>
                  ) : (
                    <span aria-disabled="true" aria-hidden="true">
                      ←
                    </span>
                  )}
                  {Array.from({ length: load.data.pages }, (_, i) => i + 1).map((n) => (
                    <a key={n} href={pageHref(n)} aria-label={t("pageN", { n })} aria-current={n === load.data.page ? "page" : undefined}>
                      {n}
                    </a>
                  ))}
                  {load.data.page < load.data.pages ? (
                    <a href={pageHref(load.data.page + 1)} aria-label={t("next")}>
                      →
                    </a>
                  ) : (
                    <span aria-disabled="true" aria-hidden="true">
                      →
                    </span>
                  )}
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

function SearchBox({ initial, onSearch }: { initial: string; onSearch: (v: string) => void }) {
  const t = useTranslations("engines");
  const [q, setQ] = useState(initial);
  return (
    <form
      className="stock__search"
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        onSearch(q);
      }}
    >
      <div className="field">
        <label htmlFor="stock-q">{t("searchLabel")}</label>
        <input id="stock-q" name="q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("searchHint")} autoComplete="off" spellCheck={false} />
      </div>
      <button className="btn btn--primary" type="submit">
        {t("searchButton")}
      </button>
    </form>
  );
}

function PriceFields({ min, max, onApply }: { min?: number; max?: number; onApply: (min?: number, max?: number) => void }) {
  const t = useTranslations("engines");
  const [lo, setLo] = useState(min?.toString() ?? "");
  const [hi, setHi] = useState(max?.toString() ?? "");
  const apply = () => onApply(lo.trim() === "" ? undefined : Number(lo), hi.trim() === "" ? undefined : Number(hi));
  return (
    <form
      className="stock__row2"
      onSubmit={(e) => {
        e.preventDefault();
        apply();
      }}
    >
      <div className="field">
        <label htmlFor="f-pmin">{t("priceFrom")}</label>
        <input id="f-pmin" inputMode="numeric" value={lo} onChange={(e) => setLo(e.target.value.replace(/[^\d]/g, ""))} onBlur={apply} />
      </div>
      <div className="field">
        <label htmlFor="f-pmax">{t("priceTo")}</label>
        <input id="f-pmax" inputMode="numeric" value={hi} onChange={(e) => setHi(e.target.value.replace(/[^\d]/g, ""))} onBlur={apply} />
      </div>
      <button type="submit" hidden />
    </form>
  );
}

function Skeleton() {
  return (
    <table className="stock-table" data-testid="stock-skeleton" aria-hidden="true">
      <tbody>
        {Array.from({ length: 6 }, (_, i) => (
          <tr className="skeleton-row" key={i}>
            <td>
              <span className="skeleton" style={{ width: 120, height: 18 }} />
              <span className="skeleton" style={{ width: 200, height: 14, marginTop: 8 }} />
            </td>
            <td className="hide-sm">
              <span className="skeleton" style={{ width: 140, height: 16 }} />
            </td>
            <td>
              <span className="skeleton" style={{ width: 26, height: 26 }} />
            </td>
            <td>
              <span className="skeleton" style={{ width: 80, height: 18, marginLeft: "auto" }} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
