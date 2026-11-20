import { NextResponse } from "next/server";
import { site } from "@/config/site";
import { readBody, serverError } from "@/lib/api";
import { getEngineById } from "@/lib/stock";
import { AlreadyReservedError, createReservation } from "@/lib/reservations";
import { lines, salesInbox, sendMail } from "@/lib/mailer";
import { reserveSchema } from "@/lib/validation";
import { formatDateTime, formatEur } from "@/lib/format";

export const dynamic = "force-dynamic";

/** POST /api/reserve: hold one engine for 48 hours. 409 when someone else holds it. */
export async function POST(req: Request) {
  const body = await readBody(req, reserveSchema);
  if (!body.ok) return body.res;
  const { engineId, website: _trap, ...buyer } = body.data;
  void _trap;

  const engine = await getEngineById(engineId);
  if (!engine) return NextResponse.json({ errors: { engineId: "engine" } }, { status: 422 });
  if (engine.status === "sold") return NextResponse.json({ error: "sold" }, { status: 409 });

  try {
    const r = await createReservation(engineId, buyer);
    const until = formatDateTime(r.until);
    await sendMail({
      to: salesInbox(),
      replyTo: buyer.email,
      subject: `Reservation ${r.ref}: ${engine.code} ${engine.make} ${engine.family} (${engine.id})`,
      text: lines({
        Reference: r.ref,
        Engine: `${engine.code} ${engine.make} ${engine.family} (${engine.id})`,
        Price: formatEur(engine.priceEur),
        "Held until": until,
        Name: buyer.name,
        Email: buyer.email,
        Phone: buyer.phone,
        "Delivery country": buyer.country,
        VIN: buyer.vin,
        Notes: buyer.notes,
      }),
    });
    await sendMail({
      to: buyer.email,
      subject: `${engine.code} is reserved for you until ${until}`,
      text: [
        `Hello ${buyer.name},`,
        "",
        `We hold ${engine.code} (${engine.make} ${engine.family}) for you until ${until}. Your reference is ${r.ref}.`,
        `We check your VIN ${buyer.vin} against the engine and call you on ${buyer.phone} to confirm the fit.`,
        "Once the fit is confirmed, we send the invoice with the delivery price. You pay by bank transfer.",
        "",
        `${site.name} · ${site.contact.phone} · ${site.contact.email}`,
      ].join("\n"),
    });
    return NextResponse.json({ ref: r.ref, until: r.until }, { status: 201 });
  } catch (err) {
    if (err instanceof AlreadyReservedError) {
      return NextResponse.json({ error: "reserved", until: err.until }, { status: 409 });
    }
    return serverError(err);
  }
}
