import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { nombre, color, escudo } = await req.json();
    const { rows } = await query(
      "UPDATE equipos SET nombre=$1, color=$2, escudo=$3 WHERE id=$4 RETURNING *",
      [nombre, color || null, escudo || null, id]
    );
    return NextResponse.json(rows[0]);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await query("DELETE FROM equipos WHERE id=$1", [id]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
