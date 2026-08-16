import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const { rows } = await query("SELECT * FROM colores LIMIT 1");
    return NextResponse.json(rows[0] || {});
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { datos } = await req.json();
    await query("DELETE FROM colores");
    await query("INSERT INTO colores (datos) VALUES ($1)", [JSON.stringify(datos)]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
