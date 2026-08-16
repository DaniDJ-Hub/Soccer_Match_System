export type DisenoRow = {
  id: number;
  nombre: string | null;
  datos: Record<string, unknown>;
  asignado_a: string[];
  activo_para: string[];
};

// Flatten datos JSONB into the row object so frontend reads d.bgColor1 directly,
// mirroring the original Express backend's flattenDisenos().
export function flattenDisenos(rows: DisenoRow[]) {
  return rows.map((r) => {
    const datos = typeof r.datos === "object" && r.datos ? r.datos : {};
    return { ...datos, ...r, datos };
  });
}
