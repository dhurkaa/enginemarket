/**
 * Form schemas, shared by the browser (inline errors) and the API routes (the real check).
 * Each message is a key in messages/<locale>.json under "errors".
 */
import { z } from "zod";

const name = z.string().trim().min(2, "name").max(120, "name");
const email = z.string().trim().max(200, "email").email("email");
const phone = z
  .string()
  .trim()
  .max(40, "phone")
  .refine((v) => (v.match(/\d/g) ?? []).length >= 6 && /^[+\d\s()./-]+$/.test(v), "phone");
const optionalPhone = z.union([z.literal(""), phone]).optional().default("");
const notes = z.string().trim().max(2000, "notes").optional().default("");
const vin = z
  .string()
  .trim()
  .transform((v) => v.toUpperCase().replace(/\s+/g, ""))
  .refine((v) => /^[A-HJ-NPR-Z0-9]{17}$/.test(v), "vin");
const optionalVin = z
  .string()
  .trim()
  .transform((v) => v.toUpperCase().replace(/\s+/g, ""))
  .refine((v) => v === "" || /^[A-HJ-NPR-Z0-9]{17}$/.test(v), "vin")
  .optional()
  .default("");
/** A hidden field people never see; a bot fills it. */
const trap = z.string().max(0, "trap").optional().default("");

export const countryCodes = ["SK", "CZ", "AT", "HU", "PL", "SI", "DE", "HR", "NL", "BE", "LU", "IT", "FR", "DK", "ES", "PT"] as const;

export const reserveSchema = z.object({
  engineId: z.string().regex(/^em-\d{4}$/, "engine"),
  name,
  email,
  phone,
  country: z.enum(countryCodes, { message: "country" }),
  vin,
  notes,
  website: trap,
});

export const sourcingSchema = z.object({
  name,
  email,
  phone: optionalPhone,
  car: z.string().trim().min(3, "car").max(200, "car"),
  codeOrVin: z.string().trim().max(60, "codeOrVin").optional().default(""),
  notes,
  website: trap,
});

export const tradeSchema = z.object({
  company: z.string().trim().min(2, "company").max(160, "company"),
  vatId: z
    .string()
    .trim()
    .transform((v) => v.toUpperCase().replace(/\s+/g, ""))
    .refine((v) => /^[A-Z]{2}[A-Z0-9]{2,13}$/.test(v), "vatId"),
  name,
  email,
  phone,
  volume: z.enum(["1-5", "6-20", "21-50", "50+"], { message: "volume" }),
  website: trap,
});

export const questionSchema = z.object({
  engineId: z.string().regex(/^em-\d{4}$/, "engine"),
  name,
  email,
  question: z.string().trim().min(5, "question").max(2000, "question"),
  website: trap,
});

export { optionalVin };

export type FieldErrors = Record<string, string>;

/** Turn a zod error into { field: messageKey }, first message per field. */
export function fieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
