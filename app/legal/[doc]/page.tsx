import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { legal } from "@/content/legal.en";

type Props = { params: Promise<{ doc: string }> };
type Doc = keyof typeof legal;

export function generateStaticParams() {
  return Object.keys(legal).map((doc) => ({ doc }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { doc } = await params;
  const d = legal[doc as Doc];
  if (!d) return {};
  return { title: d.title, description: d.description, alternates: { canonical: `/legal/${doc}` } };
}

export default async function LegalPage({ params }: Props) {
  const { doc } = await params;
  const d = legal[doc as Doc];
  if (!d) notFound();
  return (
    <main id="top">
      <section className="flow" aria-labelledby="legal-h" data-enter>
        <div className="wrap">
          <div className="page-head">
            <h1 id="legal-h">{d.title}</h1>
            <p className="t-small muted">Last updated {new Date(d.updated).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
          <div className="prose" style={{ paddingBottom: "var(--s-9)" }}>
            {d.sections.map((s) => (
              <section key={s.h}>
                <h2>{s.h}</h2>
                {s.p.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
                {s.list && (
                  <ul>
                    {s.list.map((li) => (
                      <li key={li}>{li}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
