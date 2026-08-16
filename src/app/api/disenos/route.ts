import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { flattenDisenos, type DisenoRow } from "@/lib/disenos";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categoria = searchParams.get("categoria");
    if (categoria) {
      const { rows } = await query<DisenoRow>(
        "SELECT * FROM disenos WHERE $1 = ANY(asignado_a) OR asignado_a = '{}' ORDER BY id",
        [categoria]
      );
      return NextResponse.json(flattenDisenos(rows));
    }
    const { rows } = await query<DisenoRow>("SELECT * FROM disenos ORDER BY id");
    return NextResponse.json(flattenDisenos(rows));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nombre, datos, asignado_a, ...rest } = body;
    const datosToStore = datos && typeof datos === "object" ? datos : rest;
    const nombreFinal = nombre || datosToStore.nombre || "Sin nombre";
    const { rows } = await query(
      "INSERT INTO disenos (nombre, datos, asignado_a) VALUES ($1,$2,$3) RETURNING *",
      [nombreFinal, JSON.stringify(datosToStore), asignado_a || []]
    );
    return NextResponse.json(
      { ...datosToStore, ...rows[0], datos: datosToStore },
      { status: 201 }
    );
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
