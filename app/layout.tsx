import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { site } from "@/config/site";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { KitScripts } from "@/components/kit-scripts";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  return {
    metadataBase: new URL(site.url),
    title: { default: t("siteTitle"), template: "%s · EngineMarket" },
    description: t("siteDescription"),
    applicationName: site.name,
    openGraph: {
      type: "website",
      siteName: site.name,
      title: t("siteTitle"),
      description: t("siteDescription"),
      images: [{ url: "/share.jpg", width: 1200, height: 630, alt: t("siteTitle") }],
      locale: "en_GB",
    },
    twitter: { card: "summary_large_image" },
    icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }] },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

/*
  tasteskill deal (plan line 2), kept with the page:
  kind product (site-kind other) · hero product (the engine on the page ground) · palette white-navy-tab
  (white ground, navy ink and a workshop orange: the paint of engine stands and lifting gear) · type zilla
  (Zilla Slab / Rethink Sans) · radius soft · nav-mega · footer-dark · close-type · rhythm brand-band ·
  buttons arrow · mark arc · moments pinned-chapters (#how), picture-develops (#sourcing)
*/
export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  return (
    <html
      lang={locale}
      data-type="product"
      data-radius="soft"
      data-buttons="arrow"
      data-motion=""
      suppressHydrationWarning
    >
      <head>
        <meta name="site-kind" content="other" />
        <meta name="page-type" content="product" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Zilla+Slab:wght@400;500;600&family=Rethink+Sans:wght@400..600&display=swap"
        />
        <link rel="stylesheet" href="/assets/system.css" />
        <link rel="stylesheet" href="/assets/ui/cards.css" />
        <link rel="stylesheet" href="/assets/motion/motion.css" />
        <link rel="stylesheet" href="/assets/layout/layout.css" />
        <style
          // the :root block exactly as start.mjs printed it (kept after layout.css, which resets --ly-scale)
          dangerouslySetInnerHTML={{
            __html: `:root {
  --p-bg: #ffffff; --p-surface: #f4f4f2; --p-ink: #1f2b4d; --p-muted: #646b81;
  --p-accent: #f7941d; --p-accent-ink: #1f2b4d; --p-action: #f7941d; --p-action-ink: #1f2b4d;
  --p-inv-bg: #05070a; --p-inv-surface: #111417; --p-inv-ink: #ffffff; --p-inv-muted: #939597;
  --p-inv-accent: #f7941d; --p-inv-accent-ink: #1f2b4d; --p-inv-action: #f7941d; --p-inv-action-ink: #1f2b4d;
  --font-display: "Zilla Slab", Georgia, serif;
  --font-text: "Rethink Sans", system-ui, sans-serif;
  --display-weight: 400;
  --display-tracking: -0.018em;
  --display-tracking-xl: -0.024em;
  --ly-scale: 1.02;
}`,
          }}
        />
        <script
          // the hero's entrance: the words wait for motion.js instead of flashing (motion.md)
          dangerouslySetInnerHTML={{
            __html:
              "document.documentElement.classList.add('m-enter');setTimeout(function(){document.documentElement.classList.add('m-enter-done')},700);" +
              "document.documentElement.classList.add('mo-js');setTimeout(function(){document.documentElement.classList.add('mo-safe')},2500);",
          }}
        />
      </head>
      <body>
        <NextIntlClientProvider>
          <SiteHeader />
          {children}
          <SiteFooter />
        </NextIntlClientProvider>
        <KitScripts />
      </body>
    </html>
  );
}
