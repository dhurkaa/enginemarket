import { Fragment } from "react";
import { getTranslations } from "next-intl/server";
import { site } from "@/config/site";
import { getStockCount } from "@/lib/stock";
import { Arrow } from "@/components/ui";

/** footer.closing, dealt close-type + footer-dark: the close and the directory in one last screen. */
export async function SiteFooter() {
  const t = await getTranslations("footer");
  const tn = await getTranslations("nav");
  const tc = await getTranslations("common");
  const year = new Date().getFullYear();
  return (
    <footer className="footer closing footer--dark ground-inverse" id="contact" aria-labelledby="close-h">
      <div className="wrap">
        <div className="closing__cta close--type">
          <div className="section-head">
            <h2 id="close-h">{t("closeTitle")}</h2>
            <p>{t("closeLine", { count: getStockCount() })}</p>
          </div>
          <a className="btn btn--primary btn--xl btn--wide" href="/engines">
            {tc("mainAction")}
            <Arrow />
          </a>
        </div>
        <div className="closing__links">
          <div className="grid">
            <div className="span-4 stack-4">
              <a className="nav__logo" href="/">
                <span className="mark" data-mark="arc" aria-hidden="true" />
                EngineMarket
              </a>
              <p className="footer__lede">{t("lede")}</p>
            </div>
            <div className="span-2 footer__col">
              <h3>{t("shop")}</h3>
              <ul>
                <li><a href="/engines">{tn("engines")}</a></li>
                <li><a href="/grades">{tn("grades")}</a></li>
                <li><a href="/delivery">{tn("delivery")}</a></li>
              </ul>
            </div>
            <div className="span-2 footer__col">
              <h3>{t("help")}</h3>
              <ul>
                <li><a href="/sourcing">{tn("sourcing")}</a></li>
                <li><a href="/trade-account">{tn("trade")}</a></li>
                <li><a href="/contact">{tn("about")}</a></li>
              </ul>
            </div>
            <div className="span-4 footer__col">
              <h3>{t("contact")}</h3>
              <ul>
                <li><a href={site.contact.phoneHref}>{site.contact.phone}</a></li>
                <li><a href={`mailto:${site.contact.email}`}>{site.contact.email}</a></li>
              </ul>
              <dl className="hours footer__hours" data-tz={site.contact.timeZone}>
                {site.contact.hours.map((h) => (
                  <Fragment key={h.days}>
                    <dt data-days={h.days}>{h.label}</dt>
                    <dd>{h.value}</dd>
                  </Fragment>
                ))}
              </dl>
            </div>
          </div>
          <div className="footer__legal">
            <span>
              &copy; {year} {site.name} &nbsp; <a href="/legal/privacy">{t("privacy")}</a> &nbsp;{" "}
              <a href="/legal/terms">{t("terms")}</a> &nbsp; <a href="/legal/imprint">{t("imprint")}</a> &nbsp;{" "}
              <a href="/legal/cookies">{t("cookies")}</a>
            </span>
            <span>{t("trademarks")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
