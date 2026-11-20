import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/page-hero";
import { TradeForm } from "@/components/lead-forms";
import { Arrow } from "@/components/ui";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("trade");
  return { title: t("title"), description: t("description"), alternates: { canonical: "/trade-account" } };
}

export default async function TradePage() {
  const t = await getTranslations("trade");
  return (
    <main id="top">
      <PageHero title={t("h1")} lead={t("lead")} image={{ src: "/engines/em-0002/1.jpg", alt: t("photoAlt") }}>
        <div className="btn-row">
          <a className="btn btn--primary" href="#apply">
            {t("formTitle")}
            <Arrow />
          </a>
        </div>
      </PageHero>
      <section className="section" id="apply" aria-labelledby="apply-h">
        <div className="wrap">
          <div className="grid grid--top">
            <div className="span-5">
              <div className="section-head">
                <h2 id="apply-h">{t("benefitsTitle")}</h2>
              </div>
              <ul className="rows">
                {(["b1", "b2", "b3"] as const).map((k) => (
                  <li key={k}>
                    <span className="rows__name">{t(k)}</span>
                    <p>{t(`${k}Text`)}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="span-6 start-7">
              <h3 style={{ font: "var(--display-weight) var(--t-h3)/1.2 var(--font-display)", marginBottom: "var(--s-5)" }}>{t("formTitle")}</h3>
              <TradeForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
