import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { tipo, ref_id, datos } = await req.json();
    await query(
      `INSERT INTO publico (tipo, ref_id, datos) VALUES ($1,$2,$3)
       ON CONFLICT (tipo, ref_id) DO UPDATE SET datos=$3`,
      [tipo, ref_id, JSON.stringify(datos)]
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
