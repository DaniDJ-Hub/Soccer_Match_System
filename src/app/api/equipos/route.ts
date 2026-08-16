import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categoriaId = searchParams.get("categoriaId");
    if (!categoriaId) return NextResponse.json([], { status: 200 });
    const { rows } = await query(
      "SELECT * FROM equipos WHERE categoria_id=$1 ORDER BY id",
      [categoriaId]
    );
    return NextResponse.json(rows);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { nombre, categoria_id, color, escudo } = await req.json();
    const { rows } = await query(
      "INSERT INTO equipos (nombre, categoria_id, color, escudo) VALUES ($1,$2,$3,$4) RETURNING *",
      [nombre, categoria_id, color || null, escudo || null]
    );
    return NextResponse.json(rows[0], { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
