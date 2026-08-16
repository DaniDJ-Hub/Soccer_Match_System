import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const {
      categoria_id,
      jornadas,
      equipos_en_rol,
      partidos_jugados,
      jornadas_jugadas,
      jornadas_doradas,
      partidos_agregados,
      partidos_movidos,
      jornada_actual_marcada,
      sugerencia_fija,
    } = await req.json();

    await query(
      `
      INSERT INTO rol (categoria_id, jornadas, equipos_en_rol, partidos_jugados,
        jornadas_jugadas, jornadas_doradas, partidos_agregados, partidos_movidos,
        jornada_actual_marcada, sugerencia_fija)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      ON CONFLICT (categoria_id) DO UPDATE SET
        jornadas=$2, equipos_en_rol=$3, partidos_jugados=$4,
        jornadas_jugadas=$5, jornadas_doradas=$6, partidos_agregados=$7,
        partidos_movidos=$8, jornada_actual_marcada=$9, sugerencia_fija=$10
    `,
      [
        categoria_id,
        JSON.stringify(jornadas || []),
        JSON.stringify(equipos_en_rol || []),
        JSON.stringify(partidos_jugados || {}),
        JSON.stringify(jornadas_jugadas || []),
        JSON.stringify(jornadas_doradas || []),
        JSON.stringify(partidos_agregados || {}),
        JSON.stringify(partidos_movidos || {}),
        jornada_actual_marcada ?? null,
        sugerencia_fija ? JSON.stringify(sugerencia_fija) : null,
      ]
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
