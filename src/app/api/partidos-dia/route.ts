import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categoriaId = searchParams.get("categoriaId");
    const { rows } = await query(
      "SELECT dia, partidos FROM partidos_dia WHERE categoria_id=$1 ORDER BY dia",
      [categoriaId]
    );
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const { categoria_id, dia, partidos } = await req.json();
    await query(
      `INSERT INTO partidos_dia (categoria_id, dia, partidos) VALUES ($1,$2,$3)
       ON CONFLICT (categoria_id, dia) DO UPDATE SET partidos=$3`,
      [categoria_id, dia, partidos]
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
