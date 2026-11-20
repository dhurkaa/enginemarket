import { NextResponse } from "next/server";
import { readBody, serverError } from "@/lib/api";
import { lines, salesInbox, sendMail } from "@/lib/mailer";
import { tradeSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

/** POST /api/trade-account: a garage or workshop applies for trade prices. */
export async function POST(req: Request) {
  const body = await readBody(req, tradeSchema);
  if (!body.ok) return body.res;
  const d = body.data;
  try {
    await sendMail({
      to: salesInbox(),
      replyTo: d.email,
      subject: `Trade account: ${d.company} (${d.vatId})`,
      text: lines({ Company: d.company, "VAT ID": d.vatId, Name: d.name, Email: d.email, Phone: d.phone, "Engines a month": d.volume }),
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    return serverError(err);
  }
}
