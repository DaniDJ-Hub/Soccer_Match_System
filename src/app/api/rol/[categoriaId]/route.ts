import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ categoriaId: string }> }
) {
  try {
    const { categoriaId } = await params;
    const { rows } = await query("SELECT * FROM rol WHERE categoria_id=$1", [
      categoriaId,
    ]);
    return NextResponse.json(rows[0] || {});
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ categoriaId: string }> }
) {
  try {
    const { categoriaId } = await params;
    await query("DELETE FROM rol WHERE categoria_id=$1", [categoriaId]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
