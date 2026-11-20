"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import delivery from "@/data/delivery.json";
import { site } from "@/config/site";
import { exVat, formatDateTime, formatEur } from "@/lib/format";
import { questionSchema, reserveSchema } from "@/lib/validation";
import type { EngineStatus } from "@/lib/types";
import { Dialog, CloseButton } from "@/components/dialog";
import { Field, FailBox, SubmitButton, Trap, useApiForm } from "@/components/form-kit";
import { Arrow, GradeBadge } from "@/components/ui";

type Props = {
  id: string;
  code: string;
  name: string;
  grade: keyof typeof site.grades;
  priceEur: number;
  status: EngineStatus;
  reservedUntil: string | null;
};

const POLL_MS = 5000;

export function EngineActions(p: Props) {
  const t = useTranslations("sheet");
  const tc = useTranslations("common");
  const tr = useTranslations("reserve");
  const [status, setStatus] = useState<EngineStatus>(p.status);
  const [until, setUntil] = useState<string | null>(p.reservedUntil);
  const [mine, setMine] = useState<{ ref: string; until: string; phone: string } | null>(null);
  const [reserveOpen, setReserveOpen] = useState(false);
  const [askOpen, setAskOpen] = useState(false);

  // another buyer may reserve this engine while the page is open: poll its status (acceptance 6)
  const refresh = useCallback(async () => {
    try {
      const r = await fetch(`/api/stock/${p.id}`, { cache: "no-store" });
      if (!r.ok) return;
      const s = (await r.json()) as { status: EngineStatus; reservedUntil: string | null };
      setStatus(s.status);
      setUntil(s.reservedUntil);
    } catch {
      /* offline: keep what we show */
    }
  }, [p.id]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, POLL_MS);
    const onVis = () => document.visibilityState === "visible" && refresh();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [refresh]);

  const months = site.grades[p.grade].months;
  const price = formatEur(p.priceEur);
  const available = status === "available";

  return (
    <>
      <div className="buy" data-testid="buy-box" data-status={status}>
        <div>
          <p className="t-label muted">{t("priceLabel")}</p>
          <p className="buy__price" data-testid="price">
            {price}
          </p>
          <p className="buy__vat">
            {tc("inclVat", { rate: Math.round(site.vatRate * 100) })} · {tc("exVat", { price: formatEur(exVat(p.priceEur)) })}
          </p>
        </div>
        <a className="buy__grade link" href="/grades">
          <GradeBadge grade={p.grade} label={tc("grade", { grade: p.grade })} />
          {t("warrantyLine", { grade: p.grade, months })}
        </a>

        {mine ? (
          <div className="buy__held" role="status" data-testid="reserved-mine">
            <strong>{tc("reservedUntil", { date: formatDateTime(mine.until) })}</strong>
            <span>{tr("successLine", { ref: mine.ref, phone: mine.phone })}</span>
          </div>
        ) : available ? (
          <>
            <button className="btn btn--primary" type="button" onClick={() => setReserveOpen(true)} data-testid="reserve-button">
              {t("reserve")}
              <Arrow />
            </button>
            <p className="buy__note">{t("reserveNote")}</p>
          </>
        ) : (
          <div className="buy__held" role="status" aria-live="polite" data-testid="reserved-banner">
            <strong>{status === "sold" ? t("soldTitle") : t("reservedTitle", { date: until ? formatDateTime(until) : "" })}</strong>
            <span>{status === "sold" ? t("soldLine") : t("reservedLine")}</span>
            <div className="btn-row" style={{ marginTop: "var(--s-2)" }}>
              <a className="btn btn--primary" href="#similar">
                {t("similar")}
              </a>
              <a className="btn btn--secondary" href={`/sourcing?code=${encodeURIComponent(p.code)}`}>
                {t("requestSearch")}
              </a>
            </div>
          </div>
        )}

        <button className="btn btn--secondary" type="button" onClick={() => setAskOpen(true)}>
          {t("ask")}
        </button>
        <DeliveryEstimate />
      </div>

      <div className="buybar" data-testid="buybar">
        <span className="buybar__price">
          <strong>{price}</strong>
          <span>{mine || !available ? tc(`status.${mine ? "reserved" : status}`) : tc("warranty", { months })}</span>
        </span>
        {available && !mine ? (
          <button className="btn btn--primary" type="button" onClick={() => setReserveOpen(true)}>
            {t("stickyReserve")}
          </button>
        ) : (
          <a className="btn btn--secondary" href="#similar">
            {t("similar")}
          </a>
        )}
      </div>

      <ReserveDialog
        open={reserveOpen}
        onClose={() => setReserveOpen(false)}
        engine={p}
        onReserved={(r) => {
          setMine(r);
          setStatus("reserved");
          setUntil(r.until);
        }}
        onTaken={(u) => {
          setStatus("reserved");
          setUntil(u);
        }}
      />
      <QuestionDialog open={askOpen} onClose={() => setAskOpen(false)} engine={p} />
    </>
  );
}

function DeliveryEstimate() {
  const t = useTranslations("sheet");
  const [code, setCode] = useState("");
  const c = delivery.countries.find((x) => x.code === code);
  return (
    <div className="deliv">
      <div className="field">
        <label htmlFor="deliv-country">{t("deliveryCountry")}</label>
        <select id="deliv-country" value={code} onChange={(e) => setCode(e.target.value)}>
          <option value="">—</option>
          {delivery.countries.map((x) => (
            <option key={x.code} value={x.code}>
              {x.name}
            </option>
          ))}
        </select>
      </div>
      <output htmlFor="deliv-country" aria-live="polite">
        {c ? t("deliveryPrice", { price: formatEur(c.priceEur), days: c.days }) : ""}
      </output>
      <a className="link" href="/delivery">
        {t("deliveryLink")}
      </a>
    </div>
  );
}

function ReserveDialog({
  open,
  onClose,
  engine,
  onReserved,
  onTaken,
}: {
  open: boolean;
  onClose: () => void;
  engine: Props;
  onReserved: (r: { ref: string; until: string; phone: string }) => void;
  onTaken: (until: string) => void;
}) {
  const t = useTranslations("reserve");
  const ts = useTranslations("sheet");
  const [taken, setTaken] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const form = useApiForm<typeof reserveSchema, { ref: string; until: string }>({
    schema: reserveSchema,
    endpoint: "/api/reserve",
    initial: { engineId: engine.id, name: "", email: "", phone: "", country: "", vin: "", notes: "", website: "" },
    onSent: (r, v) => {
      setPhone(v.phone);
      onReserved({ ...r, phone: v.phone });
    },
    onConflict: (body) => {
      const until = String(body.until ?? "");
      setTaken(until);
      if (until) onTaken(until);
    },
  });
  const sent = form.state === "sent" && form.result;

  return (
    <Dialog open={open} onClose={onClose} labelledBy="reserve-h" describedBy="reserve-d" testId="reserve-dialog">
      <div className="dlg__head">
        <div>
          <h2 id="reserve-h">{sent ? t("successTitle", { date: formatDateTime(form.result!.until) }) : t("title", { code: engine.code })}</h2>
          <p id="reserve-d">{sent ? t("successLine", { ref: form.result!.ref, phone }) : t("line")}</p>
        </div>
        <CloseButton label={t("close")} onClick={onClose} />
      </div>
      <div className="dlg__body">
        {sent ? (
          <div className="btn-row">
            <button className="btn btn--primary" type="button" onClick={onClose}>
              {t("successDone")}
            </button>
          </div>
        ) : taken ? (
          <div className="buy__held" role="alert">
            <strong>{t("taken", { date: formatDateTime(taken) })}</strong>
            <div className="btn-row">
              <a className="btn btn--primary" href="#similar" onClick={onClose}>
                {ts("similar")}
              </a>
            </div>
          </div>
        ) : (
          <form className="em-form" onSubmit={form.submit} noValidate data-testid="reserve-form">
            <Field form={form} idPrefix="rsv" name="name" label={t("name")} autoComplete="name" required />
            <Field form={form} idPrefix="rsv" name="email" label={t("email")} type="email" autoComplete="email" inputMode="email" required />
            <Field form={form} idPrefix="rsv" name="phone" label={t("phone")} type="tel" autoComplete="tel" inputMode="tel" required />
            <Field form={form} idPrefix="rsv" name="country" label={t("country")} as="select" required>
              <option value="">{t("chooseCountry")}</option>
              {delivery.countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </Field>
            <Field form={form} idPrefix="rsv" name="vin" label={t("vin")} hint={t("vinHint")} full autoComplete="off" autoCapitalize="characters" spellCheck={false} maxLength={20} required />
            <Field form={form} idPrefix="rsv" name="notes" label={t("notes")} hint={t("notesHint")} full as="textarea" />
            <Trap form={form} idPrefix="rsv" />
            {form.state === "failed" && <FailBox text={t("failed")} retry={t("tryAgain")} onRetry={() => form.submit()} />}
            <SubmitButton state={form.state} label={t("submit")} sending={t("sending")} />
            <p className="form__status" role="status">
              {form.state === "sending" ? t("sending") : form.status}
            </p>
            <p className="form__note">
              {t("privacy")} <a href="/legal/privacy">Privacy</a>
            </p>
          </form>
        )}
      </div>
    </Dialog>
  );
}

function QuestionDialog({ open, onClose, engine }: { open: boolean; onClose: () => void; engine: Props }) {
  const t = useTranslations("question");
  const form = useApiForm({
    schema: questionSchema,
    endpoint: "/api/question",
    initial: { engineId: engine.id, name: "", email: "", question: "", website: "" },
  });
  return (
    <Dialog open={open} onClose={onClose} labelledBy="ask-h" describedBy="ask-d" testId="question-dialog">
      <div className="dlg__head">
        <div>
          <h2 id="ask-h">{t("title", { code: engine.code })}</h2>
          <p id="ask-d">{form.state === "sent" ? t("success", { code: engine.code }) : t("line")}</p>
        </div>
        <CloseButton label={t("close")} onClick={onClose} />
      </div>
      <div className="dlg__body">
        {form.state === "sent" ? (
          <div className="btn-row">
            <button className="btn btn--primary" type="button" onClick={onClose}>
              {t("close")}
            </button>
          </div>
        ) : (
          <form className="em-form" onSubmit={form.submit} noValidate>
            <Field form={form} idPrefix="ask" name="name" label={t("name")} autoComplete="name" required />
            <Field form={form} idPrefix="ask" name="email" label={t("email")} type="email" autoComplete="email" required />
            <Field form={form} idPrefix="ask" name="question" label={t("question")} full as="textarea" />
            <Trap form={form} idPrefix="ask" />
            {form.state === "failed" && <FailBox text={t("failed")} retry={t("tryAgain")} onRetry={() => form.submit()} />}
            <SubmitButton state={form.state} label={t("submit")} sending={t("sending")} />
            <p className="form__status" role="status">
              {form.state === "sending" ? t("sending") : form.status}
            </p>
          </form>
        )}
      </div>
    </Dialog>
  );
}
