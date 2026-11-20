import type { Metadata } from "next";
import { Fragment } from "react";
import { getTranslations } from "next-intl/server";
import { site } from "@/config/site";
import { PageHero } from "@/components/page-hero";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("about");
  return { title: t("title"), description: t("description"), alternates: { canonical: "/contact" } };
}

export default async function ContactPage() {
  const t = await getTranslations("about");
  const street = [site.legal.street, site.legal.town].filter(Boolean).join(", ");
  return (
    <main id="top">
      <PageHero title={t("h1")} lead={t("lead")} image={{ src: "/engines/em-0001/4.jpg", alt: t("photoAlt") }}>
        <div className="btn-row">
          <a className="btn btn--primary" href={site.contact.phoneHref}>
            {t("callButton", { phone: site.contact.phone })}
          </a>
          <a className="btn btn--secondary" href={`mailto:${site.contact.email}`}>
            {t("emailButton", { email: site.contact.email })}
          </a>
        </div>
      </PageHero>

      <section className="section" id="details" aria-labelledby="details-h">
        <div className="wrap">
          <div className="section-head">
            <h2 id="details-h">{t("aboutTitle")}</h2>
            <p>{t("aboutText")}</p>
          </div>
          <div className="grid grid--top" style={{ rowGap: "var(--s-7)" }}>
            <div className="span-4 stack-4">
              <h3 className="t-label muted">{t("phone")}</h3>
              <p style={{ fontSize: "var(--t-lead)" }}>
                <a className="link" href={site.contact.phoneHref}>
                  {site.contact.phone}
                </a>
              </p>
              <h3 className="t-label muted">{t("email")}</h3>
              <p style={{ fontSize: "var(--t-lead)" }}>
                <a className="link" href={`mailto:${site.contact.email}`}>
                  {site.contact.email}
                </a>
              </p>
            </div>
            <div className="span-4 stack-4">
              <h3 className="t-label muted">{t("hours")}</h3>
              <p data-open-now className="t-small" />
              <dl className="hours" data-tz={site.contact.timeZone}>
                {site.contact.hours.map((h) => (
                  <Fragment key={h.days}>
                    <dt data-days={h.days}>{h.label}</dt>
                    <dd>{h.value}</dd>
                  </Fragment>
                ))}
              </dl>
            </div>
            <div className="span-4 stack-4">
              <h3 className="t-label muted">{t("where")}</h3>
              <p style={{ fontSize: "var(--t-lead)" }}>{street || t("whereValue")}</p>
              {street && (
                <a className="link" href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(street)}`}>
                  {t("mapLink")}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
