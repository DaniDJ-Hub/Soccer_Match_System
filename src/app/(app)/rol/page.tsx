"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Save, Star } from "lucide-react";
import { useCategoria } from "@/lib/categoria-context";
import { api, type Equipo, type Partido } from "@/lib/api";
import { BackLink } from "@/components/back-link";
import { Skeleton } from "@/components/skeleton";
import { Button } from "@/components/button";

export default function RolPage() {
  const { categoriaId, categoriaNombre } = useCategoria();
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [jornadas, setJornadas] = useState<Partido[][]>([]);
  const [doradas, setDoradas] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [nuevoLocal, setNuevoLocal] = useState<Record<number, string>>({});
  const [nuevoVisitante, setNuevoVisitante] = useState<Record<number, string>>({});

  async function load() {
    if (!categoriaId) return;
    setLoading(true);
    try {
      const [eqs, rol] = await Promise.all([
        api.getEquipos(categoriaId),
        api.getRol(categoriaId),
      ]);
      setEquipos(eqs);
      setJornadas(rol.jornadas || []);
      setDoradas(rol.jornadas_doradas || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoriaId]);

  async function persist(next: Partido[][], nextDoradas = doradas) {
    if (!categoriaId) return;
    setSaving(true);
    try {
      await api.saveRol({
        categoria_id: categoriaId,
        jornadas: next,
        jornadas_doradas: nextDoradas,
        equipos_en_rol: equipos.map((e) => e.nombre),
      });
    } finally {
      setSaving(false);
    }
  }

  function agregarJornada() {
    const next = [...jornadas, []];
    setJornadas(next);
    persist(next);
  }

  function eliminarJornada(idx: number) {
    const next = jornadas.filter((_, i) => i !== idx);
    setJornadas(next);
    persist(next);
  }

  function toggleDorada(idx: number) {
    const next = doradas.includes(idx) ? doradas.filter((i) => i !== idx) : [...doradas, idx];
    setDoradas(next);
    persist(jornadas, next);
  }

  function agregarPartido(jIdx: number) {
    const local = nuevoLocal[jIdx];
    const visitante = nuevoVisitante[jIdx];
    if (!local || !visitante || local === visitante) return;
    const next = jornadas.map((j, i) =>
      i === jIdx
        ? [...j, { local, visitante, golesLocal: null, golesVisitante: null, jugado: false }]
        : j
    );
    setJornadas(next);
    persist(next);
    setNuevoLocal((s) => ({ ...s, [jIdx]: "" }));
    setNuevoVisitante((s) => ({ ...s, [jIdx]: "" }));
  }

  function actualizarPartido(jIdx: number, pIdx: number, patch: Partial<Partido>) {
    const next = jornadas.map((j, i) =>
      i === jIdx ? j.map((p, k) => (k === pIdx ? { ...p, ...patch } : p)) : j
    );
    setJornadas(next);
  }

  function guardarPartido() {
    persist(jornadas);
  }

  function eliminarPartido(jIdx: number, pIdx: number) {
    const next = jornadas.map((j, i) => (i === jIdx ? j.filter((_, k) => k !== pIdx) : j));
    setJornadas(next);
    persist(next);
  }

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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl tracking-wide">📅 Rol de Juegos</h1>
          <p className="text-sm text-text-muted">
            Categoría: {categoriaNombre} {saving && "· guardando…"}
          </p>
        </div>
        <Button onClick={agregarJornada}>
          <Plus className="h-4 w-4" /> Nueva Jornada
        </Button>
      </div>

      {loading ? (
        <div className="space-y-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="card rounded-2xl p-5">
              <Skeleton className="mb-3 h-6 w-28" />
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : equipos.length < 2 ? (
        <p className="text-text-muted">Necesitas al menos 2 equipos para generar un rol.</p>
      ) : jornadas.length === 0 ? (
        <p className="text-text-muted">Aún no hay jornadas. Crea la primera.</p>
      ) : (
        <div className="space-y-6">
          {jornadas.map((jornada, jIdx) => (
            <div key={jIdx} className="card rounded-2xl p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-display text-lg tracking-wide">
                  Jornada {jIdx + 1}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleDorada(jIdx)}
                    className={`cursor-pointer p-1.5 rounded-full ${
                      doradas.includes(jIdx) ? "text-yellow-400" : "text-text-muted"
                    }`}
                    title="Marcar jornada dorada"
                    aria-label={
                      doradas.includes(jIdx)
                        ? `Quitar jornada ${jIdx + 1} de dorada`
                        : `Marcar jornada ${jIdx + 1} como dorada`
                    }
                    aria-pressed={doradas.includes(jIdx)}
                  >
                    <Star className="h-4 w-4" fill={doradas.includes(jIdx) ? "currentColor" : "none"} />
                  </button>
                  <button
                    aria-label={`Eliminar jornada ${jIdx + 1}`}
                    onClick={() => eliminarJornada(jIdx)}
                    className="cursor-pointer p-1.5 text-text-muted hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {jornada.map((p, pIdx) => (
                  <div
                    key={pIdx}
                    className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-bg-secondary px-3 py-2 text-sm"
                  >
                    <span className="min-w-[90px] font-medium">{p.local}</span>
                    <input
                      type="number"
                      value={p.golesLocal ?? ""}
                      onChange={(e) =>
                        actualizarPartido(jIdx, pIdx, {
                          golesLocal: e.target.value === "" ? null : Number(e.target.value),
                        })
                      }
                      onBlur={guardarPartido}
                      className="w-14 rounded border border-border bg-bg-card px-2 py-1 text-center"
                      placeholder="-"
                    />
                    <span className="text-text-muted">vs</span>
                    <input
                      type="number"
                      value={p.golesVisitante ?? ""}
                      onChange={(e) =>
                        actualizarPartido(jIdx, pIdx, {
                          golesVisitante: e.target.value === "" ? null : Number(e.target.value),
                        })
                      }
                      onBlur={guardarPartido}
                      className="w-14 rounded border border-border bg-bg-card px-2 py-1 text-center"
                      placeholder="-"
                    />
                    <span className="min-w-[90px] font-medium">{p.visitante}</span>

                    <label className="ml-auto flex items-center gap-1.5 text-xs text-text-muted">
                      <input
                        type="checkbox"
                        checked={p.jugado}
                        onChange={(e) => {
                          actualizarPartido(jIdx, pIdx, { jugado: e.target.checked });
                          persist(jornadas);
                        }}
                      />
                      Jugado
                    </label>
                    <button
                      aria-label={`Guardar partido ${p.local} vs ${p.visitante}`}
                      onClick={guardarPartido}
                      className="cursor-pointer p-1 text-text-muted hover:text-accent"
                    >
                      <Save className="h-3.5 w-3.5" />
                    </button>
                    <button
                      aria-label={`Eliminar partido ${p.local} vs ${p.visitante}`}
                      onClick={() => eliminarPartido(jIdx, pIdx)}
                      className="cursor-pointer p-1 text-text-muted hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex flex-wrap items-end gap-2">
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase text-text-secondary">
                    Local
                  </label>
                  <select
                    value={nuevoLocal[jIdx] || ""}
                    onChange={(e) => setNuevoLocal((s) => ({ ...s, [jIdx]: e.target.value }))}
                    className="rounded-lg border border-border bg-bg-secondary px-2 py-1.5 text-sm"
                  >
                    <option value="">Selecciona…</option>
                    {equipos.map((e) => (
                      <option key={e.id} value={e.nombre}>{e.nombre}</option>
                    ))}
                  </select>
                </div>
                <span className="pb-2 text-text-muted text-sm">vs</span>
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase text-text-secondary">
                    Visitante
                  </label>
                  <select
                    value={nuevoVisitante[jIdx] || ""}
                    onChange={(e) => setNuevoVisitante((s) => ({ ...s, [jIdx]: e.target.value }))}
                    className="rounded-lg border border-border bg-bg-secondary px-2 py-1.5 text-sm"
                  >
                    <option value="">Selecciona…</option>
                    {equipos.map((e) => (
                      <option key={e.id} value={e.nombre}>{e.nombre}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => agregarPartido(jIdx)}
                  className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm text-text-secondary hover:bg-bg-card-hover cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Agregar partido
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
