import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categoriaId = searchParams.get("categoriaId");
    const { rows } = await query(
      "SELECT mes, valor FROM rendimiento WHERE categoria_id=$1 ORDER BY mes",
      [categoriaId]
    );
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const { categoria_id, mes, valor } = await req.json();
    await query(
      `INSERT INTO rendimiento (categoria_id, mes, valor) VALUES ($1,$2,$3)
       ON CONFLICT (categoria_id, mes) DO UPDATE SET valor=$3`,
      [categoria_id, mes, valor]
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
