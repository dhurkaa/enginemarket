import { NextResponse } from "next/server";
import { readBody, serverError } from "@/lib/api";
import { lines, salesInbox, sendMail } from "@/lib/mailer";
import { sourcingSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

/** POST /api/sourcing: "Can't find your engine? We'll find it." */
export async function POST(req: Request) {
  const body = await readBody(req, sourcingSchema);
  if (!body.ok) return body.res;
  const d = body.data;
  try {
    await sendMail({
      to: salesInbox(),
      replyTo: d.email,
      subject: `Engine search: ${d.codeOrVin || d.car} for ${d.name}`,
      text: lines({ Name: d.name, Email: d.email, Phone: d.phone, Car: d.car, "Engine code or VIN": d.codeOrVin, Notes: d.notes }),
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    return serverError(err);
  }
}
