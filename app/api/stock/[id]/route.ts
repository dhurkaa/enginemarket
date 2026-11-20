import { NextResponse } from "next/server";
import { getEngineById } from "@/lib/stock";

export const dynamic = "force-dynamic";

/** GET /api/stock/em-0006: the engine's live status, polled by its page every few seconds. */
export async function GET(_req: Request, ctx: RouteContext<"/api/stock/[id]">) {
  const { id } = await ctx.params;
  const e = await getEngineById(id);
  if (!e) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(
    { id: e.id, status: e.status, reservedUntil: e.reservedUntil },
    { headers: { "Cache-Control": "no-store" } },
  );
}
