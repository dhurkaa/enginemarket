import "server-only";
import { NextResponse } from "next/server";
import type { z } from "zod";
import { fieldErrors } from "@/lib/validation";

/** Read a JSON (or form-encoded) body and check it; a 422 lists the fields to fix. */
export async function readBody<S extends z.ZodTypeAny>(
  req: Request,
  schema: S,
): Promise<{ ok: true; data: z.output<S> } | { ok: false; res: NextResponse }> {
  let raw: unknown;
  try {
    const type = req.headers.get("content-type") ?? "";
    raw = type.includes("application/json") ? await req.json() : Object.fromEntries((await req.formData()).entries());
  } catch {
    return { ok: false, res: NextResponse.json({ error: "bad request" }, { status: 400 }) };
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, res: NextResponse.json({ errors: fieldErrors(parsed.error) }, { status: 422 }) };
  }
  return { ok: true, data: parsed.data };
}

export const serverError = (err: unknown) => {
  console.error(err);
  return NextResponse.json({ error: "not sent" }, { status: 502 });
};
