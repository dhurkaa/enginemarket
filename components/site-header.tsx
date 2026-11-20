import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { getMakeCounts } from "@/lib/stock";

/** header.nav, dealt nav-mega: one word opens a full-width panel of link columns and one picture card. */
export async function SiteHeader() {
  const t = await getTranslations("nav");
  const tc = await getTranslations("common");
  const makes = getMakeCounts().slice(0, 6);
  return (
    <header className="nav">
      <div className="wrap nav__bar">
        <a className="skip-link" href="#top">
          {tc("skip")}
        </a>
        <a className="nav__logo" href="/">
          <span className="mark" data-mark="arc" aria-hidden="true" />
          EngineMarket
        </a>
        <nav className="nav__links" aria-label={t("label")}>
          <div className="nav__item">
            <a className="nav__link" href="/engines">
              {t("engines")}{" "}
              <svg className="chev" viewBox="0 0 12 12" aria-hidden="true">
                <path d="M3 4.5l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <button className="nav__expand" type="button" aria-label={`Show ${t("engines")} links`} aria-expanded="false">
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="nav__menu">
              <div className="wrap grid">
                <div className="menu-col span-3">
                  <p className="t-label">{t("menuByMake")}</p>
                  {makes.map((m) => (
                    <a key={m.make} href={`/engines?make=${encodeURIComponent(m.make)}`}>
                      {m.make}
                      <span>{t("menuMakeHint", { count: m.count })}</span>
                    </a>
                  ))}
                </div>
                <div className="menu-col span-3">
                  <p className="t-label">{t("menuSearch")}</p>
                  <a href="/engines">
                    {t("menuAll")}
                    <span>{t("menuAllHint")}</span>
                  </a>
                  <a href="/#car">
                    {t("menuCar")}
                    <span>{t("menuCarHint")}</span>
                  </a>
                  <a href="/engines?fuel=diesel">
                    {t("menuDiesel")}
                    <span>{t("menuByFuel")}</span>
                  </a>
                  <a href="/engines?fuel=petrol">
                    {t("menuPetrol")}
                    <span>{t("menuByFuel")}</span>
                  </a>
                  <a href="/sourcing">
                    {t("menuSourcing")}
                    <span>{t("menuSourcingHint")}</span>
                  </a>
                </div>
                <a className="menu-card span-3 start-10" href="/engines/b58b30b-bmw-3-0-b58-twinpower-turbo-em-0001">
                  <div className="panel">
                    <Image className="frame__img" src="/engines/em-0001/3.jpg" alt="" width={640} height={518} sizes="300px" />
                  </div>
                  <span className="t-card">{t("menuCardTitle")}</span>
                  <span className="t-small muted">{t("menuCardLine")}</span>
                </a>
              </div>
            </div>
          </div>
          <div className="nav__item">
            <a className="nav__link" href="/grades">
              {t("grades")}
            </a>
          </div>
          <div className="nav__item">
            <a className="nav__link" href="/delivery">
              {t("delivery")}
            </a>
          </div>
          <div className="nav__item">
            <a className="nav__link" href="/sourcing">
              {t("sourcing")}
            </a>
          </div>
          <div className="nav__item">
            <a className="nav__link" href="/trade-account">
              {t("trade")}
            </a>
          </div>
          <div className="nav__item">
            <a className="nav__link" href="/contact">
              {t("about")}
            </a>
          </div>
        </nav>
        <div className="nav__actions">
          <a className="btn btn--primary" href="/engines">
            {tc("mainAction")}
          </a>
        </div>
        <button className="nav__toggle" type="button" aria-expanded="false" aria-label={tc("menu")}>
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path d="M2 5h14M2 13h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </header>
  );
}
