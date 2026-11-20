"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

/** One large photograph and a row of thumbnails; a thumbnail click swaps the large one (no carousel). */
export function Gallery({ photos, alts }: { photos: string[]; alts: string[] }) {
  const t = useTranslations("sheet");
  const [i, setI] = useState(0);
  return (
    <div className="gallery" role="group" aria-label={t("gallery")}>
      <div className="gallery__main">
        <Image src={photos[i]} alt={alts[i]} fill sizes="(max-width: 1023px) 100vw, 737px" loading={i === 0 ? "eager" : "lazy"} fetchPriority={i === 0 ? "high" : "auto"} data-source="client" data-subject="product" />
      </div>
      {photos.length > 1 && (
        <div className="gallery__thumbs">
          {photos.map((src, n) => (
            <button key={src} type="button" aria-pressed={n === i} aria-label={t("showPhoto", { n: n + 1 })} onClick={() => setI(n)}>
              <Image src={src} alt="" fill sizes="120px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
