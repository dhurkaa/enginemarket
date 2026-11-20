"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { site } from "@/config/site";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("error");
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main id="top">
      <section className="flow" aria-labelledby="err-h">
        <div className="wrap">
          <div className="page-head" style={{ paddingBottom: "var(--s-9)" }}>
            <p className="t-label muted">500</p>
            <h1 id="err-h">{t("h1")}</h1>
            <p>{t("line")}</p>
            <div className="btn-row" style={{ marginTop: "var(--s-6)" }}>
              <button className="btn btn--primary" type="button" onClick={() => reset()}>
                {t("button")}
              </button>
              <a className="btn btn--secondary" href={site.contact.phoneHref}>
                {site.contact.phone}
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
