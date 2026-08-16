import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ tipo: string; id: string }> }
) {
  try {
    const { tipo, id } = await params;
    const { rows } = await query(
      "SELECT datos FROM publico WHERE tipo=$1 AND ref_id=$2",
      [tipo, id]
    );
    if (!rows[0]) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json(rows[0].datos);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
