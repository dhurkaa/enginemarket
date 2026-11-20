"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { sourcingSchema, tradeSchema } from "@/lib/validation";
import { Field, FailBox, SubmitButton, Trap, useApiForm } from "@/components/form-kit";

export function SourcingForm() {
  const t = useTranslations("sourcing");
  const params = useSearchParams();
  const form = useApiForm({
    schema: sourcingSchema,
    endpoint: "/api/sourcing",
    initial: { name: "", email: "", phone: "", car: "", codeOrVin: params.get("code") ?? "", notes: "", website: "" },
  });
  if (form.state === "sent") {
    return (
      <div className="form-done" role="status" data-testid="form-done">
        <h3>{t("success")}</h3>
        <p>{t("reply")}</p>
      </div>
    );
  }
  return (
    <form className="em-form" onSubmit={form.submit} noValidate data-testid="sourcing-form">
      <Field form={form} idPrefix="src" name="name" label={t("name")} autoComplete="name" required />
      <Field form={form} idPrefix="src" name="email" label={t("email")} type="email" autoComplete="email" required />
      <Field form={form} idPrefix="src" name="car" label={t("car")} hint={t("carHint")} required />
      <Field form={form} idPrefix="src" name="codeOrVin" label={t("codeOrVin")} hint={t("codeOrVinHint")} autoCapitalize="characters" spellCheck={false} />
      <Field form={form} idPrefix="src" name="phone" label={t("phone")} hint={t("phoneHint")} type="tel" autoComplete="tel" />
      <Field form={form} idPrefix="src" name="notes" label={t("notes")} hint={t("notesHint")} as="textarea" full />
      <Trap form={form} idPrefix="src" />
      {form.state === "failed" && <FailBox text={t("failed")} retry={t("tryAgain")} onRetry={() => form.submit()} />}
      <SubmitButton state={form.state} label={t("submit")} sending={t("sending")} />
      <p className="form__status" role="status">
        {form.state === "sending" ? t("sending") : form.status}
      </p>
      <p className="form__note">{t("reply")}</p>
    </form>
  );
}

export function TradeForm() {
  const t = useTranslations("trade");
  const form = useApiForm({
    schema: tradeSchema,
    endpoint: "/api/trade-account",
    initial: { company: "", vatId: "", name: "", email: "", phone: "", volume: "", website: "" },
  });
  if (form.state === "sent") {
    return (
      <div className="form-done" role="status" data-testid="form-done">
        <h3>{t("success")}</h3>
        <p>{t("reply")}</p>
      </div>
    );
  }
  return (
    <form className="em-form" onSubmit={form.submit} noValidate data-testid="trade-form">
      <Field form={form} idPrefix="trd" name="company" label={t("company")} autoComplete="organization" required />
      <Field form={form} idPrefix="trd" name="vatId" label={t("vatId")} hint={t("vatIdHint")} autoCapitalize="characters" spellCheck={false} required />
      <Field form={form} idPrefix="trd" name="name" label={t("name")} autoComplete="name" required />
      <Field form={form} idPrefix="trd" name="email" label={t("email")} type="email" autoComplete="email" required />
      <Field form={form} idPrefix="trd" name="phone" label={t("phone")} type="tel" autoComplete="tel" required />
      <Field form={form} idPrefix="trd" name="volume" label={t("volume")} as="select" required>
        <option value="">{t("volumeChoose")}</option>
        <option value="1-5">1 to 5</option>
        <option value="6-20">6 to 20</option>
        <option value="21-50">21 to 50</option>
        <option value="50+">More than 50</option>
      </Field>
      <Trap form={form} idPrefix="trd" />
      {form.state === "failed" && <FailBox text={t("failed")} retry={t("tryAgain")} onRetry={() => form.submit()} />}
      <SubmitButton state={form.state} label={t("submit")} sending={t("sending")} />
      <p className="form__status" role="status">
        {form.state === "sending" ? t("sending") : form.status}
      </p>
      <p className="form__note">{t("reply")}</p>
    </form>
  );
}
