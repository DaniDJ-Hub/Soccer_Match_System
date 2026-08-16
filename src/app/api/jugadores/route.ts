import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const equipoId = searchParams.get("equipoId");
    if (!equipoId) return NextResponse.json([], { status: 200 });
    const { rows } = await query(
      "SELECT * FROM jugadores WHERE equipo_id=$1 ORDER BY id",
      [equipoId]
    );
    return NextResponse.json(rows);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { nombre, numero, equipo_id, foto } = await req.json();
    const { rows } = await query(
      "INSERT INTO jugadores (nombre, numero, equipo_id, foto) VALUES ($1,$2,$3,$4) RETURNING *",
      [nombre, numero || null, equipo_id, foto || null]
    );
    return NextResponse.json(rows[0], { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
