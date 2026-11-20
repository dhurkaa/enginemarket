import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { GRADES, site } from "@/config/site";
import { PageHero } from "@/components/page-hero";
import { GradeBadge } from "@/components/ui";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("gradesPage");
  return { title: t("title"), description: t("description"), alternates: { canonical: "/grades" } };
}

export default async function GradesPage() {
  const t = await getTranslations("gradesPage");
  const tg = await getTranslations("grades");
  const tc = await getTranslations("common");
  return (
    <main id="top">
      <PageHero title={t("h1")} lead={t("lead")} image={{ src: "/engines/em-0003/1.jpg", alt: "Mercedes-AMG M139 engine on white, a grade R engine, both intercoolers marked 13" }} />

      <section className="section" id="grades" aria-labelledby="grades-h">
        <div className="wrap">
          <div className="section-head">
            <h2 id="grades-h">{t("tableTitle")}</h2>
          </div>
          <table className="data-table" style={{ fontSize: "var(--t-lead)" }}>
            <thead>
              <tr>
                <th scope="col">{t("colGrade")}</th>
                <th scope="col">{t("colMeans")}</th>
                <th scope="col">{t("colWarranty")}</th>
              </tr>
            </thead>
            <tbody>
              {GRADES.map((g) => (
                <tr key={g}>
                  <td style={{ width: 96, paddingBlock: "var(--s-5)" }}>
                    <GradeBadge grade={g} label={tg(`${g}.name`)} size="lg" />
                  </td>
                  <td>
                    <strong style={{ fontWeight: 500 }}>{tg(`${g}.short`)}</strong>
                    <p style={{ fontSize: "var(--t-body)", marginTop: "var(--s-1)", maxWidth: "60ch" }}>{tg(`${g}.text`)}</p>
                  </td>
                  <td style={{ font: "400 var(--t-h3)/1 var(--font-display)", whiteSpace: "nowrap" }}>{tc("months", { count: site.grades[g].months })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section" id="measure" aria-labelledby="measure-h">
        <div className="wrap">
          <div className="grid grid--top">
            <div className="span-5">
              <div className="section-head">
                <h2 id="measure-h">{t("measureTitle")}</h2>
                <p>{t("measureLine")}</p>
              </div>
              <ol className="rows">
                {(["m1", "m2", "m3"] as const).map((k, i) => (
                  <li key={k}>
                    <span className="rows__name">{t(k)}</span>
                    <span className="rows__value muted">{i + 1}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="span-6 start-7 split-photo" style={{ aspectRatio: "4 / 3" }}>
              <Image src="/engines/site/139580-02.jpg" alt={t("photoAlt")} fill sizes="(max-width: 1023px) 100vw, 628px" data-source="client" data-subject="product" />
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="cover" aria-labelledby="cover-h">
        <div className="wrap">
          <div className="section-head">
            <h2 id="cover-h">{t("coverTitle")}</h2>
          </div>
          <div className="faq" style={{ maxWidth: 840 }}>
            {(["cover1", "cover2", "cover3", "cover4"] as const).map((k) => (
              <div className="faq__item" key={k}>
                <h3>{t(`${k}Q`)}</h3>
                <p>{t(`${k}A`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
