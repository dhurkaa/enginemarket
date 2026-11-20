import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { GRADES, site } from "@/config/site";
import { getCarCatalogue, getCountryCount, getEngineById, getFeaturedEngines, getStockCount } from "@/lib/stock";
import { enginePath } from "@/lib/format";
import { EngineCard } from "@/components/engine-card";
import { CarPicker } from "@/components/car-picker";
import { ChecksList, Compression } from "@/components/test-sheet";
import { Arrow, GradeBadge } from "@/components/ui";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  return {
    title: { absolute: t("homeTitle") },
    description: t("homeDescription"),
    alternates: { canonical: "/" },
    openGraph: { title: t("homeTitle"), description: t("homeDescription"), url: "/" },
  };
}

/*
  page plan (kind product, screens at 1440x900):
  hero      product hero: the B58 on the page ground, code search in the head row        1   object
  #car      choose your car: the picker beside the M256 from the gearbox end (split)     1   object
  #how      pinned-chapters moment: reserve, confirm by VIN, pay, one photo each         2   use / parts
  #sheet    a real test sheet (UI) beside what it lists; the grades as four tiles (g2)   2   ui
  #stock    four engines in stock as linked cards, the trust facts under them            1   object (cards)
  #sourcing brand band: picture-develops moment on a whole engine, the search request    1   parts / type
  closing   close-type + footer-dark                                                     1
*/
export default async function HomePage() {
  const t = await getTranslations("home");
  const tc = await getTranslations("common");
  const tg = await getTranslations("grades");
  const featured = await getFeaturedEngines(4);
  const sample = (await getEngineById("em-0001"))!;
  const count = getStockCount();
  const catalogue = getCarCatalogue();

  return (
    <main id="top">
      <section className="hero hero--product" data-enter aria-labelledby="hero-h">
        <div className="wrap">
          <div className="hero-text hero__in">
            <div className="hero__head">
              <div>
                <h1 id="hero-h">{t("h1")}</h1>
                <p className="hero__lead">{t("lead")}</p>
              </div>
              <div className="btn-row">
                <form className="hero-search" action="/engines" method="get" role="search">
                  <label htmlFor="hero-code">{t("codeLabel")}</label>
                  <div className="hero-search__row">
                    <input
                      id="hero-code"
                      name="q"
                      type="search"
                      autoComplete="off"
                      autoCapitalize="characters"
                      spellCheck={false}
                      placeholder={t("codeHint")}
                    />
                    <button className="btn btn--primary" type="submit">
                      {tc("mainAction")}
                      <Arrow />
                    </button>
                  </div>
                  <a className="link" href="#car">
                    {t("orCar")}
                  </a>
                </form>
              </div>
            </div>
            <div className="hero__stage">
              <Image
                src="/engines/em-0001/1.jpg"
                alt={t("heroAlt")}
                fill
                sizes="(max-width: 639px) 100vw, 1280px"
                fetchPriority="high"
                loading="eager"
                style={{ ["--ly-pos" as string]: "50% 52%" }}
                data-source="client"
                data-subject="product"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="car" aria-labelledby="car-h">
        <div className="wrap">
          <div className="grid grid--top">
            <div className="span-6">
              <div className="section-head">
                <h2 id="car-h">{t("carTitle")}</h2>
                <p>{t("carLine")}</p>
              </div>
              <CarPicker catalogue={catalogue} idPrefix="home-car" />
            </div>
            <div className="span-6 start-7 split-photo" style={{ aspectRatio: "4 / 3" }}>
              <Image
                src="/engines/em-0004/3.jpg"
                alt={t("carAlt")}
                fill
                sizes="(max-width: 1023px) 100vw, 628px"
                data-source="client"
                data-subject="product"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="how" style={{ ["--h" as string]: 2 }} data-moment="pinned-chapters" aria-labelledby="how-h">
        <div className="wrap mo-pc__grid">
          <div className="mo-pc__text">
            <h2 id="how-h">{t("howTitle")}</h2>
            <ol className="mo-pc__steps">
              {[
                { n: 1, src: "/engines/em-0004/2.jpg", w: 1024, h: 768 },
                { n: 2, src: "/engines/em-0004/5.jpg", w: 1024, h: 768 },
                { n: 3, src: "/engines/em-0005/2.jpg", w: 768, h: 1024 },
              ].map((s) => (
                <li className="mo-pc__step" key={s.n}>
                  <h3>{t(`how${s.n}Title`)}</h3>
                  <p>{t(`how${s.n}Text`)}</p>
                  <figure className="mo-pc__visual">
                    <Image src={s.src} alt={t(`how${s.n}Alt`)} width={s.w} height={s.h} sizes="(max-width: 1023px) 100vw, 628px" data-source="client" data-subject="product" />
                  </figure>
                </li>
              ))}
            </ol>
          </div>
          <div className="mo-pc__visuals frame" />
        </div>
      </section>

      <section className="section g2" id="sheet" aria-labelledby="sheet-h">
        <div className="wrap">
          <div className="group">
            <div className="grid grid--top">
              <div className="span-5">
                <div className="section-head">
                  <h2 id="sheet-h">{t("sheetTitle")}</h2>
                  <p>{t("sheetLine")}</p>
                </div>
                <ul className="rows rows--spec">
                  {(["compression", "checks", "donor", "proof", "included", "fits"] as const).map((k) => (
                    <li key={k}>
                      <span className="rows__name">{t(`sheetRows.${k}`)}</span>
                      <span className="rows__value">{t(`sheetRows.${k}Value`)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <a className="span-6 start-7 sheet-card card" href={enginePath(sample)} aria-label={`${t("sheetLink")}: ${sample.code}`}>
                <div className="sheet-card__head">
                  <div>
                    <p className="sheet-card__code">{sample.code}</p>
                    <p className="t-small muted">
                      {sample.make} {sample.family}
                    </p>
                  </div>
                  <GradeBadge grade={sample.grade} label={tc("grade", { grade: sample.grade })} size="lg" />
                </div>
                <Compression e={sample} legend={false} />
                <ChecksList checks={sample.checks.slice(0, 4)} />
                <span className="link">{t("sheetLink")}</span>
              </a>
            </div>
          </div>
          <div className="group">
            <div className="section-head section-head--split">
              <div>
                <h3 className="t-h2-like" style={{ font: "var(--display-weight) var(--t-h2)/1.1 var(--font-display)", letterSpacing: "var(--display-tracking)" }}>
                  {t("gradesTitle")}
                </h3>
                <p>{t("gradesLine")}</p>
              </div>
              <a className="link" href="/grades">
                {t("gradesLink")}
              </a>
            </div>
            <div className="grade-tiles">
              {GRADES.map((g) => (
                <div className="grade-tile" key={g}>
                  <GradeBadge grade={g} label={tg(`${g}.name`)} size="lg" />
                  <p className="grade-tile__months">{tc("months", { count: site.grades[g].months })}</p>
                  <h4 style={{ font: "500 var(--t-card)/1.3 var(--font-text)" }}>{tg(`${g}.short`)}</h4>
                  <p>{tg(`${g}.text`)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="stock" aria-labelledby="stock-h">
        <div className="wrap">
          <div className="section-head section-head--split">
            <div>
              <h2 id="stock-h">{t("stockTitle")}</h2>
              <p>{t("stockLine", { count })}</p>
            </div>
            <a className="link" href="/engines">
              {t("stockLink", { count })}
            </a>
          </div>
          <div className="home-cards">
            {featured.map((e) => (
              <EngineCard key={e.id} e={e} sizes="(max-width: 1023px) 50vw, 302px" />
            ))}
          </div>
          <div className="facts-row">
            <p>{t("facts.tested")}</p>
            <p>{t("facts.ships", { count: getCountryCount() })}</p>
            <p>{t("facts.warranty")}</p>
          </div>
        </div>
      </section>

      <section className="section ground-brand" id="sourcing" aria-labelledby="sourcing-h">
        <div className="wrap">
          <div className="grid grid--top">
            <div className="span-5">
              <div className="section-head">
                <h2 id="sourcing-h">{t("sourcingTitle")}</h2>
                <p>{t("sourcingLine")}</p>
              </div>
              <div className="btn-row">
                <a className="btn btn--primary" href="/sourcing">
                  {t("sourcingButton")}
                  <Arrow />
                </a>
                <a className="btn btn--secondary" href="/trade-account">
                  {t("sourcingTrade")}
                </a>
              </div>
            </div>
            <figure className="develop span-6 start-7" data-moment="picture-develops">
              <Image
                src="/engines/site/139580-18.jpg"
                alt={t("sourcingAlt")}
                width={1600}
                height={1480}
                sizes="(max-width: 1023px) 100vw, 628px"
                data-source="client"
                data-subject="product"
              />
            </figure>
          </div>
        </div>
      </section>
    </main>
  );
}
