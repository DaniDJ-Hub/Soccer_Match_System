import { NextResponse } from "next/server";
import { query } from "@/lib/db";

async function activar(req: Request, id: string) {
  const { categoria } = await req.json();
  if (!categoria) {
    return NextResponse.json({ error: "categoria required" }, { status: 400 });
  }
  await query(
    `UPDATE disenos SET
      asignado_a = array_append(COALESCE(asignado_a,'{}'), $1),
      activo_para = array_append(COALESCE(activo_para,'{}'), $1)
     WHERE id=$2 AND NOT ($1 = ANY(COALESCE(asignado_a,'{}')))`,
    [categoria, id]
  );
  return NextResponse.json({ ok: true });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    return await activar(req, id);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    return await activar(req, id);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
