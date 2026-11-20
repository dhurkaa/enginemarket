import Image from "next/image";
import type { ReactNode } from "react";

/** The inner pages' hero: the kit's split hero, the words on span-5 and the client's photograph on span-6. */
export function PageHero({
  title,
  lead,
  children,
  image,
  crumbs,
}: {
  title: string;
  lead: string;
  children?: ReactNode;
  image: { src: string; alt: string; pos?: string };
  crumbs?: ReactNode;
}) {
  return (
    <section className="hero hero--split" data-enter aria-labelledby="hero-h">
      <div className="wrap">
        <div className="hero-text grid hero__grid">
          <div className="hero__text span-5">
            {crumbs}
            <h1 id="hero-h">{title}</h1>
            <p className="hero__lead">{lead}</p>
            {children}
          </div>
          <div className="hero__media span-6 start-7">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(max-width: 1023px) 100vw, 628px"
              fetchPriority="high"
              loading="eager"
              style={{ ["--ly-pos" as string]: image.pos ?? "50% 50%" }}
              data-source="client"
              data-subject="product"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
