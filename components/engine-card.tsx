import Image from "next/image";
import { useTranslations } from "next-intl";
import { site } from "@/config/site";
import { enginePath, formatEur, formatKm, litres } from "@/lib/format";
import type { EngineView } from "@/lib/types";
import { CylinderStrip, GradeBadge } from "@/components/ui";

/**
 * One engine as a linked card. With photographs: the first one on white. Without: the compression strip
 * stands in, so the card always shows the engine's own data rather than a borrowed picture.
 */
export function EngineCard({ e, sizes = "(max-width: 639px) 100vw, (max-width: 1279px) 50vw, 33vw", eager = false }: { e: EngineView; sizes?: string; eager?: boolean }) {
  const t = useTranslations("common");
  const ts = useTranslations("engines");
  const min = Math.min(...e.compressionBar);
  const max = Math.max(...e.compressionBar);
  return (
    <a className="ecard card" href={enginePath(e)} data-status={e.status} data-engine={e.id}>
      {e.photos.length ? (
        <div className="ecard__media">
          <Image
            src={e.photos[0]}
            alt={e.photoAlt?.[0] ?? `${e.make} ${e.code} engine`}
            fill
            sizes={sizes}
            loading={eager ? "eager" : "lazy"}
          />
        </div>
      ) : (
        <div className="ecard__sheet">
          <span className="t-label">{ts("colCompression")}</span>
          <CylinderStrip
            values={e.compressionBar}
            spec={e.specCompressionBar}
            label={ts("compressionOf", { count: e.compressionBar.length, min: min.toFixed(1), max: max.toFixed(1) })}
          />
        </div>
      )}
      <div className="ecard__body">
        <div className="ecard__head">
          <span className="ecard__code">{e.code}</span>
          <GradeBadge grade={e.grade} label={t("grade", { grade: e.grade })} size="sm" />
        </div>
        <span className="ecard__name">
          {e.make} {e.family}
        </span>
        <span className="ecard__meta">
          {t(`fuel.${e.fuel}`)} · {litres(e.displacementCc)} l · {e.powerKw} kW · {formatKm(e.mileageKm)}
        </span>
        <span className="ecard__foot">
          <span className="ecard__price">{formatEur(e.priceEur)}</span>
          <span className="ecard__status">
            {e.status === "available"
              ? t("warranty", { months: site.grades[e.grade].months })
              : t(`status.${e.status}`)}
          </span>
        </span>
      </div>
    </a>
  );
}
