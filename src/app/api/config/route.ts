import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const {
      categoria_id,
      costo_credencial,
      premio_1,
      premio_2,
      premio_3,
      premio_4,
    } = await req.json();
    const { rows } = await query(
      `INSERT INTO config_ingresos (categoria_id, costo_credencial, premio_1, premio_2, premio_3, premio_4)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (categoria_id) DO UPDATE SET
         costo_credencial=$2, premio_1=$3, premio_2=$4, premio_3=$5, premio_4=$6
       RETURNING *`,
      [
        categoria_id,
        costo_credencial || 0,
        premio_1 || 0,
        premio_2 || 0,
        premio_3 || 0,
        premio_4 || 0,
      ]
    );
    return NextResponse.json(rows[0]);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
