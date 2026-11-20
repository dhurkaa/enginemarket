import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/page-hero";
import { SourcingForm } from "@/components/lead-forms";
import { Arrow } from "@/components/ui";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("sourcing");
  return { title: t("title"), description: t("description"), alternates: { canonical: "/sourcing" } };
}

export default async function SourcingPage() {
  const t = await getTranslations("sourcing");
  return (
    <main id="top">
      <PageHero title={t("h1")} lead={t("lead")} image={{ src: "/engines/em-0002/4.jpg", alt: t("photoAlt") }}>
        <div className="btn-row">
          <a className="btn btn--primary" href="#request">
            {t("formTitle")}
            <Arrow />
          </a>
        </div>
      </PageHero>
      <section className="section" id="request" aria-labelledby="request-h">
        <div className="wrap">
          <div className="grid grid--top">
            <div className="span-6">
              <div className="section-head">
                <h2 id="request-h">{t("formTitle")}</h2>
                <p>{t("reply")}</p>
              </div>
              <Suspense fallback={null}>
                <SourcingForm />
              </Suspense>
            </div>
            <div className="span-6 start-7 split-photo" style={{ aspectRatio: "4 / 5" }}>
              <Image src="/engines/site/139580-22.jpg" alt="A complete straight-six engine on white, seen from the front with its turbo pipework" fill sizes="(max-width: 1023px) 100vw, 628px" data-source="client" data-subject="product" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
