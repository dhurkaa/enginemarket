import { NextResponse } from "next/server";
import { readBody, serverError } from "@/lib/api";
import { getEngineById } from "@/lib/stock";
import { lines, salesInbox, sendMail } from "@/lib/mailer";
import { questionSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

/** POST /api/question: a question about one engine, mailed to sales. */
export async function POST(req: Request) {
  const body = await readBody(req, questionSchema);
  if (!body.ok) return body.res;
  const { engineId, name, email, question } = body.data;
  const engine = await getEngineById(engineId);
  if (!engine) return NextResponse.json({ errors: { engineId: "engine" } }, { status: 422 });
  try {
    await sendMail({
      to: salesInbox(),
      replyTo: email,
      subject: `Question about ${engine.code} (${engine.id}) from ${name}`,
      text: lines({ Engine: `${engine.code} ${engine.make} ${engine.family} (${engine.id})`, Name: name, Email: email, Question: question }),
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    return serverError(err);
  }
}
