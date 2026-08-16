import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ categoriaId: string }> }
) {
  try {
    const { categoriaId } = await params;
    const { rows } = await query(
      "SELECT * FROM config_ingresos WHERE categoria_id=$1",
      [categoriaId]
    );
    return NextResponse.json(rows[0] || null);
  } catch {
    return NextResponse.json(null);
  }
}
