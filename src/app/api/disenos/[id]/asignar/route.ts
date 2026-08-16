import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { categorias } = await req.json();
    const lista = Array.isArray(categorias) ? categorias : [];
    await query("UPDATE disenos SET asignado_a=$1, activo_para=$1 WHERE id=$2", [
      lista,
      id,
    ]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
