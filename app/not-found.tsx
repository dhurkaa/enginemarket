import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Arrow } from "@/components/ui";

export default async function NotFound() {
  const t = await getTranslations("notFound");
  const th = await getTranslations("home");
  return (
    <main id="top">
      <section className="hero hero--split" data-enter aria-labelledby="hero-h">
        <div className="wrap">
          <div className="hero-text grid hero__grid">
            <div className="hero__text span-5">
              <p className="t-label muted">404</p>
              <h1 id="hero-h">{t("h1")}</h1>
              <p className="hero__lead">{t("line")}</p>
              <form className="hero-search" action="/engines" method="get" role="search" style={{ marginTop: "var(--s-6)" }}>
                <label htmlFor="nf-code">{th("codeLabel")}</label>
                <div className="hero-search__row">
                  <input id="nf-code" name="q" type="search" autoComplete="off" placeholder={th("codeHint")} />
                  <button className="btn btn--primary" type="submit">
                    {t("button")}
                    <Arrow />
                  </button>
                </div>
                <a className="link" href="/">
                  {t("home")}
                </a>
              </form>
            </div>
            <div className="hero__media span-6 start-7">
              <Image src="/engines/site/139580-20.jpg" alt="Two intake ports of a cylinder head, seen close up" fill sizes="(max-width: 1023px) 100vw, 628px" loading="eager" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
