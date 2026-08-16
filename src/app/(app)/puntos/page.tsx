"use client";

import { useEffect, useMemo, useState } from "react";
import { useCategoria } from "@/lib/categoria-context";
import { api, type Equipo, type Partido } from "@/lib/api";
import { BackLink } from "@/components/back-link";
import { Skeleton } from "@/components/skeleton";

type Fila = {
  nombre: string;
  pj: number; pg: number; pe: number; pp: number;
  gf: number; gc: number; dg: number; pts: number;
};

export default function PuntosPage() {
  const { categoriaId, categoriaNombre } = useCategoria();
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [jornadas, setJornadas] = useState<Partido[][]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!categoriaId) return;
    setLoading(true);
    Promise.all([api.getEquipos(categoriaId), api.getRol(categoriaId)])
      .then(([eqs, rol]) => {
        setEquipos(eqs);
        setJornadas(rol.jornadas || []);
      })
      .finally(() => setLoading(false));
  }, [categoriaId]);

  const tabla = useMemo<Fila[]>(() => {
    const map = new Map<string, Fila>();
    equipos.forEach((e) =>
      map.set(e.nombre, { nombre: e.nombre, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dg: 0, pts: 0 })
    );
    jornadas.flat().forEach((p) => {
      if (!p.jugado || p.golesLocal === null || p.golesVisitante === null) return;
      const local = map.get(p.local);
      const vis = map.get(p.visitante);
      if (!local || !vis) return;
      local.pj++; vis.pj++;
      local.gf += p.golesLocal; local.gc += p.golesVisitante;
      vis.gf += p.golesVisitante; vis.gc += p.golesLocal;
      if (p.golesLocal > p.golesVisitante) {
        local.pg++; local.pts += 3; vis.pp++;
      } else if (p.golesLocal < p.golesVisitante) {
        vis.pg++; vis.pts += 3; local.pp++;
      } else {
        local.pe++; vis.pe++; local.pts += 1; vis.pts += 1;
      }
    });
    map.forEach((f) => (f.dg = f.gf - f.gc));
    return Array.from(map.values()).sort((a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf);
  }, [equipos, jornadas]);

  if (!categoriaId) {
    return (
      <div>
        <BackLink href="/menu" label="Volver al menú" />
        <p className="text-text-muted">Selecciona una categoría en el menú.</p>
      </div>
    );
  }

  return (
    <div>
      <BackLink href="/menu" label="Volver al menú" />
      <div className="mb-6">
        <h1 className="font-display text-2xl tracking-wide">🏆 Tabla de Posiciones</h1>
        <p className="text-sm text-text-muted">
          Categoría: {categoriaNombre} · calculada a partir de los partidos marcados como jugados en Rol de Juegos
        </p>
      </div>

      {loading ? (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-bg-card text-left text-text-muted">
              <tr>
                <th className="px-3 py-3">#</th>
                <th className="px-3 py-3">Equipo</th>
                <th className="px-3 py-3 text-center">PJ</th>
                <th className="px-3 py-3 text-center">G</th>
                <th className="px-3 py-3 text-center">E</th>
                <th className="px-3 py-3 text-center">P</th>
                <th className="px-3 py-3 text-center">GF</th>
                <th className="px-3 py-3 text-center">GC</th>
                <th className="px-3 py-3 text-center">DG</th>
                <th className="px-3 py-3 text-center font-bold">Pts</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="px-3 py-2.5">
                    <Skeleton className="h-6 w-6 rounded-full" />
                  </td>
                  <td className="px-3 py-2.5">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <td key={j} className="px-3 py-2.5 text-center">
                      <Skeleton className="mx-auto h-4 w-6" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : tabla.length === 0 ? (
        <p className="text-text-muted">Sin equipos registrados.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-bg-card text-left text-text-muted">
              <tr>
                <th className="px-3 py-3">#</th>
                <th className="px-3 py-3">Equipo</th>
                <th className="px-3 py-3 text-center">PJ</th>
                <th className="px-3 py-3 text-center">G</th>
                <th className="px-3 py-3 text-center">E</th>
                <th className="px-3 py-3 text-center">P</th>
                <th className="px-3 py-3 text-center">GF</th>
                <th className="px-3 py-3 text-center">GC</th>
                <th className="px-3 py-3 text-center">DG</th>
                <th className="px-3 py-3 text-center font-bold">Pts</th>
              </tr>
            </thead>
            <tbody>
              {tabla.map((f, idx) => (
                <tr key={f.nombre} className="border-t border-border">
                  <td className="px-3 py-2.5">
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        idx === 0 ? "bg-yellow-400/20 text-yellow-400" : "text-text-muted"
                      }`}
                    >
                      {idx + 1}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 font-medium">{f.nombre}</td>
                  <td className="px-3 py-2.5 text-center">{f.pj}</td>
                  <td className="px-3 py-2.5 text-center">{f.pg}</td>
                  <td className="px-3 py-2.5 text-center">{f.pe}</td>
                  <td className="px-3 py-2.5 text-center">{f.pp}</td>
                  <td className="px-3 py-2.5 text-center">{f.gf}</td>
                  <td className="px-3 py-2.5 text-center">{f.gc}</td>
                  <td className="px-3 py-2.5 text-center">{f.dg}</td>
                  <td className="px-3 py-2.5 text-center font-bold text-accent">{f.pts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
