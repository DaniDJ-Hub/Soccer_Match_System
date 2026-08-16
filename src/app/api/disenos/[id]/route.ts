import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { nombre, datos, asignado_a, ...rest } = body;
    const datosToStore = datos && typeof datos === "object" ? datos : rest;
    const nombreFinal = nombre || datosToStore.nombre || "Sin nombre";
    const { rows } = await query(
      "UPDATE disenos SET nombre=$1, datos=$2, asignado_a=COALESCE($3, asignado_a) WHERE id=$4 RETURNING *",
      [nombreFinal, JSON.stringify(datosToStore), asignado_a || null, id]
    );
    if (!rows[0]) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ ...datosToStore, ...rows[0], datos: datosToStore });
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
    await query("DELETE FROM disenos WHERE id=$1", [id]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
