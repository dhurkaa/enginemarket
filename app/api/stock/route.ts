import { NextResponse, type NextRequest } from "next/server";
import { queryStock } from "@/lib/stock";
import { parseStockQuery } from "@/lib/query";

export const dynamic = "force-dynamic";

/** GET /api/stock?q=&make=&model=&year=&fuel=&grade=A,B&priceMin=&priceMax=&kmMax=&sort=&page= */
export async function GET(req: NextRequest) {
  const page = await queryStock(parseStockQuery(req.nextUrl.searchParams));
  return NextResponse.json(page, { headers: { "Cache-Control": "no-store" } });
}
