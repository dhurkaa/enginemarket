"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import type { z } from "zod";
import { fieldErrors, type FieldErrors } from "@/lib/validation";

export type SendState = "idle" | "sending" | "sent" | "failed";

/**
 * One recipe for every form (the kit's Forms rules): errors are checked on submit, shown under their
 * field and named by aria-describedby; the first field that failed takes the focus; the button shows
 * progress and a second click does nothing; a failure keeps every value and offers "Try again".
 */
export function useApiForm<S extends z.ZodTypeAny, R = unknown>(opts: {
  schema: S;
  endpoint: string;
  initial: Record<string, string>;
  onSent?: (result: R, values: z.output<S>) => void;
  onConflict?: (body: Record<string, unknown>) => void;
}) {
  const [values, setValues] = useState<Record<string, string>>(opts.initial);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [state, setState] = useState<SendState>("idle");
  const [status, setStatus] = useState("");
  const [result, setResult] = useState<R | null>(null);
  const busy = useRef(false);
  const te = useTranslations("errors");

  const set = useCallback(
    (name: string, value: string) => {
      setValues((v) => ({ ...v, [name]: value }));
      // a field already marked wrong is checked again as it changes, so the mark goes once it is right
      setErrors((errs) => {
        if (!errs[name]) return errs;
        const parsed = opts.schema.safeParse({ ...values, [name]: value });
        if (parsed.success) {
          const rest = { ...errs };
          delete rest[name];
          return rest;
        }
        const now = fieldErrors(parsed.error);
        const rest = { ...errs };
        if (now[name]) rest[name] = now[name];
        else delete rest[name];
        return rest;
      });
    },
    [opts.schema, values],
  );

  const submit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (busy.current) return; // a second click while sending has no effect
      const parsed = opts.schema.safeParse(values);
      if (!parsed.success) {
        const errs = fieldErrors(parsed.error);
        setErrors(errs);
        setStatus(te("count", { count: Object.keys(errs).length }));
        const first = Object.keys(opts.initial).find((k) => errs[k]);
        const formEl = (e?.currentTarget as HTMLFormElement | undefined) ?? null;
        if (first) formEl?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
        return;
      }
      busy.current = true;
      setErrors({});
      setState("sending");
      setStatus("");
      try {
        const res = await fetch(opts.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(values),
        });
        const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
        if (res.status === 409 && opts.onConflict) {
          opts.onConflict(body);
          setState("idle");
          return;
        }
        if (res.status === 422 && body.errors) {
          const errs = body.errors as FieldErrors;
          setErrors(errs);
          setStatus(te("count", { count: Object.keys(errs).length }));
          setState("idle");
          return;
        }
        if (!res.ok) throw new Error(String(res.status));
        setResult(body as R);
        setState("sent");
        opts.onSent?.(body as R, parsed.data);
      } catch {
        setState("failed");
      } finally {
        busy.current = false;
      }
    },
    [opts, values, te],
  );

  return { values, set, errors, state, setState, status, result, submit };
}

type FieldProps = {
  form: { values: Record<string, string>; set: (n: string, v: string) => void; errors: FieldErrors };
  name: string;
  label: string;
  hint?: string;
  idPrefix: string;
  full?: boolean;
  as?: "input" | "textarea" | "select";
  children?: ReactNode;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "form" | "name" | "value" | "onChange">;

export function Field({ form, name, label, hint, idPrefix, full, as = "input", children, ...rest }: FieldProps) {
  const te = useTranslations("errors");
  const id = `${idPrefix}-${name}`;
  const err = form.errors[name];
  const describedBy = [hint ? `${id}-hint` : "", `${id}-err`].filter(Boolean).join(" ");
  const common = {
    id,
    name,
    value: form.values[name] ?? "",
    "aria-invalid": err ? true : undefined,
    "aria-describedby": describedBy,
  } as const;
  return (
    <div className={`field${full ? " field--full" : ""}`}>
      <label htmlFor={id}>{label}</label>
      {hint && (
        <span className="field__hint" id={`${id}-hint`}>
          {hint}
        </span>
      )}
      {as === "textarea" ? (
        <textarea {...common} rows={4} onChange={(e) => form.set(name, e.target.value)} />
      ) : as === "select" ? (
        <select {...common} onChange={(e) => form.set(name, e.target.value)} required={rest.required}>
          {children}
        </select>
      ) : (
        <input {...rest} {...common} onChange={(e) => form.set(name, e.target.value)} />
      )}
      <p className="field__error" id={`${id}-err`} hidden={!err}>
        {err ? te(err) : ""}
      </p>
    </div>
  );
}

/** The hidden field a bot fills and a person never sees. */
export function Trap({ form, idPrefix }: { form: FieldProps["form"]; idPrefix: string }) {
  return (
    <div className="trap" aria-hidden="true">
      <label htmlFor={`${idPrefix}-website`}>Website</label>
      <input id={`${idPrefix}-website`} name="website" tabIndex={-1} autoComplete="off" value={form.values.website ?? ""} onChange={(e) => form.set("website", e.target.value)} />
    </div>
  );
}

export function SubmitButton({ state, label, sending }: { state: SendState; label: string; sending: string }) {
  const busy = state === "sending";
  return (
    <div className="btn-row">
      <button className="btn btn--primary" type="submit" aria-busy={busy} aria-disabled={busy} data-state={state}>
        {busy ? (
          <>
            <span className="spinner" aria-hidden="true" />
            {sending}
          </>
        ) : (
          label
        )}
      </button>
    </div>
  );
}

export function FailBox({ text, retry, onRetry }: { text: string; retry: string; onRetry: () => void }) {
  return (
    <div className="form-fail form__status" role="alert">
      <span>{text}</span>
      <button className="btn btn--secondary" type="button" onClick={onRetry}>
        {retry}
      </button>
    </div>
  );
}
