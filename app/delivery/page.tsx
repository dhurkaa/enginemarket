import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import delivery from "@/data/delivery.json";
import { site } from "@/config/site";
import { formatEur } from "@/lib/format";
import { PageHero } from "@/components/page-hero";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("delivery");
  return { title: t("title"), description: t("description"), alternates: { canonical: "/delivery" } };
}

export default async function DeliveryPage() {
  const t = await getTranslations("delivery");
  const half = Math.ceil(delivery.countries.length / 2);
  const cols = [delivery.countries.slice(0, half), delivery.countries.slice(half)];
  return (
    <main id="top">
      <PageHero title={t("h1")} lead={t("lead")} image={{ src: "/engines/em-0005/3.jpg", alt: t("photoAlt"), pos: "50% 40%" }} />

      <section className="section" id="prices" aria-labelledby="prices-h">
        <div className="wrap">
          <div className="section-head">
            <h2 id="prices-h">{t("tableTitle")}</h2>
            <p>{t("palletLine")}</p>
          </div>
          <div className="grid grid--top">
            {cols.map((rows, i) => (
              <div className={i === 0 ? "span-6" : "span-6 start-7"} key={i}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th scope="col">{t("colCountry")}</th>
                      <th scope="col">{t("colDays")}</th>
                      <th scope="col">{t("colPrice")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((c) => (
                      <tr key={c.code} data-country={c.code}>
                        <td>{c.name}</td>
                        <td>{c.days}</td>
                        <td>{formatEur(c.priceEur)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="pallet" aria-labelledby="pallet-h">
        <div className="wrap">
          <div className="grid grid--top">
            <div className="span-5">
              <div className="section-head">
                <h2 id="pallet-h">{t("palletTitle")}</h2>
              </div>
              <ul className="rows">
                {(["p1", "p2", "p3", "p4", "p5"] as const).map((k) => (
                  <li key={k}>
                    <span className="rows__name" style={{ fontWeight: 400 }}>
                      {t(k, { kg: delivery.pallet.maxWeightKg, price: formatEur(delivery.pallet.secondEngineEur) })}
                    </span>
                  </li>
                ))}
              </ul>
              <p style={{ marginTop: "var(--s-6)" }}>{t("other")}</p>
              <div className="btn-row" style={{ marginTop: "var(--s-4)" }}>
                <a className="btn btn--secondary" href={`mailto:${site.contact.email}?subject=Delivery%20price`}>
                  {t("otherButton")}
                </a>
              </div>
            </div>
            <div className="span-6 start-7 split-photo" style={{ aspectRatio: "4 / 3" }}>
              <Image src="/engines/site/b58b30b-08.jpg" alt="A BMW B58 engine on white from the intake side, lifting chains attached" fill sizes="(max-width: 1023px) 100vw, 628px" data-source="client" data-subject="product" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
