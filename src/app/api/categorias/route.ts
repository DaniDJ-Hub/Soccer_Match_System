import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const { rows } = await query("SELECT * FROM categorias ORDER BY id");
    return NextResponse.json(rows);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { nombre } = await req.json();
    const { rows } = await query(
      "INSERT INTO categorias (nombre) VALUES ($1) RETURNING *",
      [nombre]
    );
    return NextResponse.json(rows[0], { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
