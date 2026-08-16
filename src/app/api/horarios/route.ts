import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const { rows } = await query("SELECT datos FROM horarios ORDER BY id LIMIT 1");
    if (rows.length === 0) return NextResponse.json({ datos: {} });
    return NextResponse.json({ datos: rows[0].datos });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { datos } = await req.json();
    await query("DELETE FROM horarios");
    await query("INSERT INTO horarios (datos) VALUES ($1)", [
      JSON.stringify(datos || {}),
    ]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
