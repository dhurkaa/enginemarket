/** Small presentational pieces shared by server and client components (no hooks). */
import type { Grade } from "@/config/site";
import { cylinderHealth, compressionSpread, type Health } from "@/lib/format";

export function Arrow() {
  return (
    <svg className="m-arrow" viewBox="0 0 12 12" aria-hidden="true">
      <path className="m-arrow__stem" d="M1 6h8" />
      <path className="m-arrow__head" d="M4.5 2.5 8 6l-3.5 3.5" />
    </svg>
  );
}

/** The grade as a square badge: the letter, with its full name for screen readers. */
export function GradeBadge({ grade, label, size = "md" }: { grade: Grade; label: string; size?: "sm" | "md" | "lg" }) {
  return (
    <span className={`grade grade--${size}`} data-grade={grade} title={label}>
      <span aria-hidden="true">{grade}</span>
      <span className="sr-only">{label}</span>
    </span>
  );
}

export interface CylinderLabels {
  cylinder: (n: number) => string;
  short: (n: number) => string;
  unit: string;
  health: Record<Health, string>;
  spec: string;
  spread: string;
}

/**
 * The cylinder map: one block per cylinder, the bar value in it, its fill height and colour by health
 * against the spec. The minimum and nominal show as two lines across the blocks.
 */
export function CylinderMap({
  values,
  spec,
  labels,
}: {
  values: number[];
  spec: { min: number; nominal: number };
  labels: CylinderLabels;
}) {
  const top = Math.max(spec.nominal * 1.12, ...values);
  const pct = (v: number) => `${Math.round((v / top) * 1000) / 10}%`;
  return (
    <div className="cylmap" style={{ ["--cyl" as string]: values.length }}>
      <div className="cylmap__blocks" role="list">
        <span className="cylmap__line cylmap__line--nominal" style={{ bottom: pct(spec.nominal) }} aria-hidden="true" />
        <span className="cylmap__line cylmap__line--min" style={{ bottom: pct(spec.min) }} aria-hidden="true" />
        {values.map((v, i) => {
          const h = cylinderHealth(v, spec);
          return (
            <div
              key={i}
              className="cylmap__cyl"
              data-health={h}
              role="listitem"
              aria-label={`${labels.cylinder(i + 1)}: ${v.toFixed(1)} ${labels.unit}, ${labels.health[h]}`}
            >
              <span className="cylmap__fill" style={{ height: pct(v) }} aria-hidden="true" />
              <span className="cylmap__value" aria-hidden="true">
                {v.toFixed(1)}
              </span>
              <span className="cylmap__name" aria-hidden="true">
                {labels.short(i + 1)}
              </span>
            </div>
          );
        })}
      </div>
      <p className="cylmap__spec">
        <span>{labels.spec}</span>
        <span>{labels.spread.replace("{spread}", String(compressionSpread(values)))}</span>
      </p>
    </div>
  );
}

/** A small compression strip for cards and table rows. */
export function CylinderStrip({ values, spec, label }: { values: number[]; spec: { min: number; nominal: number }; label: string }) {
  const top = Math.max(spec.nominal * 1.12, ...values);
  return (
    <span className="cylstrip" role="img" aria-label={label}>
      {values.map((v, i) => (
        <span
          key={i}
          className="cylstrip__bar"
          data-health={cylinderHealth(v, spec)}
          style={{ height: `${Math.round((v / top) * 100)}%` }}
        />
      ))}
    </span>
  );
}
