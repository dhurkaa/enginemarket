import { useTranslations } from "next-intl";
import type { Engine } from "@/lib/types";
import { compressionSpread } from "@/lib/format";
import { CylinderMap } from "@/components/ui";

/** The cylinder map with its labels and legend, as the test sheet shows it. */
export function Compression({ e, legend = true }: { e: Pick<Engine, "compressionBar" | "specCompressionBar">; legend?: boolean }) {
  const t = useTranslations("sheet");
  return (
    <div className="cylmap-wrap" style={{ display: "grid", gap: "var(--s-4)" }}>
      <CylinderMap
        values={e.compressionBar}
        spec={e.specCompressionBar}
        labels={{
          cylinder: (n) => t("cylinder", { n }),
          short: (n) => t("cyl", { n }),
          unit: t("barUnit"),
          health: { good: t("health.good"), fair: t("health.fair"), low: t("health.low") },
          spec: t("spec", { nominal: e.specCompressionBar.nominal, min: e.specCompressionBar.min }),
          spread: t("spread", { spread: compressionSpread(e.compressionBar) }),
        }}
      />
      {legend && (
        <p className="cylmap__legend">
          <span style={{ ["--h" as string]: "var(--ok)" }}>
            <i aria-hidden="true" />
            {t("legendGood")}
          </span>
          <span style={{ ["--h" as string]: "var(--warn)" }}>
            <i aria-hidden="true" />
            {t("legendFair")}
          </span>
          <span style={{ ["--h" as string]: "var(--bad)" }}>
            <i aria-hidden="true" />
            {t("legendLow")}
          </span>
        </p>
      )}
    </div>
  );
}

export function ChecksList({ checks }: { checks: Engine["checks"] }) {
  const t = useTranslations("sheet");
  return (
    <ul className="checks-list">
      {checks.map((c) => (
        <li key={c.label} data-pass={String(c.pass)}>
          <svg className="ico" viewBox="0 0 20 20" aria-hidden="true">
            {c.pass ? (
              <path d="M5 10.5l3.2 3.2L15 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            ) : (
              <>
                <path d="M10 4.5v7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="10" cy="15" r="1.3" fill="currentColor" />
              </>
            )}
          </svg>
          <span>{c.label}</span>
          <span className="state">{c.pass ? t("pass") : t("fail")}</span>
          {c.note && <span className="note">{c.note}</span>}
        </li>
      ))}
    </ul>
  );
}
