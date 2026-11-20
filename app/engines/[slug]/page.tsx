import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { site } from "@/config/site";
import { getEngineBySlug, getSimilarEngines } from "@/lib/stock";
import { enginePath, formatKm, formatNumber, litres } from "@/lib/format";
import { EngineActions } from "@/components/engine-actions";
import { EngineCard } from "@/components/engine-card";
import { Gallery } from "@/components/gallery";
import { ChecksList, Compression } from "@/components/test-sheet";
import { GradeBadge } from "@/components/ui";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

const title = (e: { code: string; make: string; family: string }) => `${e.code} ${e.make} ${e.family}`;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const e = await getEngineBySlug(slug);
  if (!e) return {};
  const tc = await getTranslations("common");
  const desc = `Used ${e.make} ${e.family} engine, code ${e.code}: ${formatKm(e.mileageKm)}, grade ${e.grade} with ${tc("months", { count: site.grades[e.grade].months })} warranty, compression per cylinder on its test sheet. €${formatNumber(e.priceEur)} incl. VAT, shipped from Slovakia.`;
  return {
    title: `${title(e)}, ${formatKm(e.mileageKm)}, grade ${e.grade}`,
    description: desc,
    alternates: { canonical: enginePath(e) },
    openGraph: {
      title: title(e),
      description: desc,
      url: enginePath(e),
      images: e.photos.length ? [{ url: e.photos[0], alt: e.photoAlt?.[0] ?? title(e) }] : undefined,
    },
  };
}

export default async function EnginePage({ params }: Props) {
  const { slug } = await params;
  const e = await getEngineBySlug(slug);
  if (!e) notFound();
  if (e.slug !== slug) permanentRedirect(enginePath(e));

  const t = await getTranslations("sheet");
  const tc = await getTranslations("common");
  const similar = await getSimilarEngines(e, 3);
  const months = site.grades[e.grade].months;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${title(e)} engine`,
    sku: e.id,
    mpn: e.code,
    brand: { "@type": "Brand", name: e.make },
    category: "Vehicle engines",
    description: `${e.make} ${e.family} (${e.code}), ${e.fuel}, ${e.displacementCc} cc, ${e.powerKw} kW, ${e.mileageKm} km. Grade ${e.grade}, ${months}-month warranty.`,
    image: e.photos.map((p) => new URL(p, site.url).toString()),
    itemCondition: e.mileageKm === 0 ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition",
    additionalProperty: [
      { "@type": "PropertyValue", name: "Engine code", value: e.code },
      { "@type": "PropertyValue", name: "Mileage", value: e.mileageKm, unitCode: "KMT" },
      { "@type": "PropertyValue", name: "Grade", value: e.grade },
      { "@type": "PropertyValue", name: "Warranty", value: `${months} months` },
    ],
    offers: {
      "@type": "Offer",
      url: new URL(enginePath(e), site.url).toString(),
      priceCurrency: site.currency,
      price: e.priceEur,
      availability: e.status === "sold" ? "https://schema.org/SoldOut" : e.status === "reserved" ? "https://schema.org/LimitedAvailability" : "https://schema.org/InStock",
      itemCondition: e.mileageKm === 0 ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition",
      seller: { "@type": "Organization", name: site.name },
      shippingDetails: { "@type": "OfferShippingDetails", shippingOrigin: { "@type": "DefinedRegion", addressCountry: site.shipsFromCode } },
    },
  };

  const alts = e.photos.map((_, i) => e.photoAlt?.[i] ?? `${title(e)}, ${tc("photoOf", { n: i + 1, total: e.photos.length })}`);

  return (
    <main id="top">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <section className="flow" aria-labelledby="engine-h" data-enter>
        <div className="wrap">
          <div style={{ paddingTop: "calc(var(--nav) + var(--s-7))" }}>
            <nav aria-label={t("breadcrumb")}>
              <ol className="crumbs">
                <li>
                  <a href="/">{t("home")}</a>
                </li>
                <li>
                  <a href="/engines">{t("engines")}</a>
                </li>
                <li aria-current="page">{e.code}</li>
              </ol>
            </nav>
            <div className="sheet-head">
              <div>
                <h1 id="engine-h">
                  {e.code}
                  <small>
                    {e.make} {e.family} · {tc(`fuel.${e.fuel}`)}
                  </small>
                </h1>
                <dl className="spec-facts" aria-label={t("facts")}>
                  <div>
                    <dt>{tc("mileage")}</dt>
                    <dd>{formatKm(e.mileageKm)}</dd>
                  </div>
                  <div>
                    <dt>{tc("displacement")}</dt>
                    <dd>
                      {formatNumber(e.displacementCc)} cc ({litres(e.displacementCc)} l)
                    </dd>
                  </div>
                  <div>
                    <dt>{tc("power")}</dt>
                    <dd>{e.powerKw} kW</dd>
                  </div>
                  <div>
                    <dt>{tc("gradeShort")}</dt>
                    <dd style={{ display: "flex", alignItems: "center", gap: "var(--s-2)" }}>
                      <GradeBadge grade={e.grade} label={tc("grade", { grade: e.grade })} size="sm" />
                      {tc("months", { count: months })}
                    </dd>
                  </div>
                </dl>
                {e.photos.length ? (
                  <Gallery photos={e.photos} alts={alts} />
                ) : (
                  <div className="nophoto" data-testid="no-photos">
                    <h2 style={{ font: "var(--display-weight) var(--t-h3)/1.2 var(--font-display)" }}>{t("noPhotosTitle")}</h2>
                    <p>{t("noPhotosLine")}</p>
                  </div>
                )}
              </div>
              <EngineActions
                id={e.id}
                code={e.code}
                name={`${e.make} ${e.family}`}
                grade={e.grade}
                priceEur={e.priceEur}
                status={e.status}
                reservedUntil={e.reservedUntil}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="flow" id="test-sheet" aria-labelledby="test-h">
        <div className="wrap">
          <div className="sheet-grid">
            <div className="wide">
              <h2 id="test-h">{t("testTitle")}</h2>
              <p>{t("compressionTitle")}</p>
              <Compression e={e} />
            </div>
            <div className="narrow">
              <h2>{t("checksTitle")}</h2>
              <ChecksList checks={e.checks} />
            </div>
            <div className="narrow">
              <h2>{t("donorTitle")}</h2>
              <ul className="rows rows--spec">
                <li>
                  <span className="rows__name">{t("donorCar")}</span>
                  <span className="rows__value">
                    {e.donor.make} {e.donor.model}
                  </span>
                </li>
                <li>
                  <span className="rows__name">{t("donorYear")}</span>
                  <span className="rows__value">{e.donor.year}</span>
                </li>
                <li>
                  <span className="rows__name">{t("donorVin")}</span>
                  <span className="rows__value">{e.donor.vinLast6}</span>
                </li>
                <li>
                  <span className="rows__name">{t("proofTitle")}</span>
                  <span className="rows__value">{e.mileageProof}</span>
                </li>
              </ul>
              <p className="t-small muted" style={{ marginTop: "var(--s-3)" }}>
                {t("proofLine")}
              </p>
            </div>
            <div className="wide">
              <h2>{t("includedTitle")}</h2>
              <ul className="tags">
                {e.included.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
            <div className="wide" id="fits" style={{ gridColumn: "1 / -1" }}>
              <h2>{t("fitsTitle")}</h2>
              <p>{t("fitsLine")}</p>
              <table className="fit-table">
                <thead>
                  <tr>
                    <th scope="col">{t("fitsMake")}</th>
                    <th scope="col">{t("fitsModel")}</th>
                    <th scope="col">{t("fitsYears")}</th>
                  </tr>
                </thead>
                <tbody>
                  {e.fits.map((f) => (
                    <tr key={`${f.make}-${f.model}`}>
                      <td>{f.make}</td>
                      <td>{f.model}</td>
                      <td>{f.years}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {similar.length > 0 && (
        <section className="flow" id="similar" aria-labelledby="similar-h">
          <div className="wrap">
            <h2 id="similar-h" style={{ font: "var(--display-weight) var(--t-h3)/1.2 var(--font-display)", marginBottom: "var(--s-5)" }}>
              {t("similarTitle")}
            </h2>
            <div className="similar">
              {similar.map((s) => (
                <EngineCard key={s.id} e={s} sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 410px" />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
