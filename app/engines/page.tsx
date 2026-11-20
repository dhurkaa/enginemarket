import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { getCarCatalogue, getStockCount } from "@/lib/stock";
import { StockBrowser } from "@/components/stock-browser";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("engines");
  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: "/engines" },
    openGraph: { title: t("title"), description: t("description"), url: "/engines" },
  };
}

export default async function EnginesPage() {
  const t = await getTranslations("engines");
  const catalogue = getCarCatalogue();
  return (
    <main id="top">
      <section className="flow" aria-labelledby="engines-h" data-enter>
        <div className="wrap">
          <div className="page-head" style={{ paddingBottom: "var(--s-6)" }}>
            <h1 id="engines-h">
              {t("h1")} <span className="muted">({getStockCount()})</span>
            </h1>
            <p>{t("lead")}</p>
          </div>
          <Suspense fallback={null}>
            <StockBrowser catalogue={catalogue} />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
