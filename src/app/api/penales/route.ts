import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { categoria_id, datos } = await req.json();
    await query(
      `INSERT INTO penales (categoria_id, datos) VALUES ($1,$2)
       ON CONFLICT (categoria_id) DO UPDATE SET datos=$2`,
      [categoria_id, JSON.stringify(datos)]
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
