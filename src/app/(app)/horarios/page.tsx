"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useCategoria } from "@/lib/categoria-context";
import { api, type Equipo, type HorarioItem } from "@/lib/api";

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export default function HorariosPage() {
  const { categoriaId, categoriaNombre } = useCategoria();
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [scheduleMap, setScheduleMap] = useState<Record<string, HorarioItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ dia: DIAS[0], hora: "17:00", equipoLocal: "", equipoVisitante: "", cancha: "" });

  const items = categoriaNombre ? scheduleMap[categoriaNombre] || [] : [];

  async function load() {
    setLoading(true);
    try {
      const [eqs, horarios] = await Promise.all([
        categoriaId ? api.getEquipos(categoriaId) : Promise.resolve<Equipo[]>([]),
        api.getHorarios(),
      ]);
      setEquipos(eqs);
      setScheduleMap(horarios.datos || {});
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoriaId]);

  async function persist(next: Record<string, HorarioItem[]>) {
    setScheduleMap(next);
    await api.saveHorarios(next);
  }

  function agregar() {
    if (!categoriaNombre || !form.equipoLocal || !form.equipoVisitante) return;
    const item: HorarioItem = { id: crypto.randomUUID(), ...form };
    const next = { ...scheduleMap, [categoriaNombre]: [...items, item] };
    persist(next);
    setForm((f) => ({ ...f, equipoLocal: "", equipoVisitante: "" }));
  }

  function eliminar(id: string) {
    if (!categoriaNombre) return;
    const next = { ...scheduleMap, [categoriaNombre]: items.filter((i) => i.id !== id) };
    persist(next);
  }

  if (!categoriaId) {
    return <p className="text-text-muted">Selecciona una categoría en el menú.</p>;
  }

  const agrupado = DIAS.map((dia) => ({ dia, partidos: items.filter((i) => i.dia === dia) }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl tracking-wide">⏰ Horarios</h1>
        <p className="text-sm text-text-muted">Categoría: {categoriaNombre}</p>
      </div>

      <div className="card mb-6 rounded-2xl p-5">
        <h3 className="mb-3 font-display text-lg tracking-wide">Programar partido</h3>
        <div className="flex flex-wrap gap-2">
          <select
            value={form.dia}
            onChange={(e) => setForm((f) => ({ ...f, dia: e.target.value }))}
            className="rounded-lg border border-border bg-bg-secondary px-2 py-1.5 text-sm"
          >
            {DIAS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <input
            type="time"
            value={form.hora}
            onChange={(e) => setForm((f) => ({ ...f, hora: e.target.value }))}
            className="rounded-lg border border-border bg-bg-secondary px-2 py-1.5 text-sm"
          />
          <select
            value={form.equipoLocal}
            onChange={(e) => setForm((f) => ({ ...f, equipoLocal: e.target.value }))}
            className="rounded-lg border border-border bg-bg-secondary px-2 py-1.5 text-sm"
          >
            <option value="">Local…</option>
            {equipos.map((e) => (
              <option key={e.id} value={e.nombre}>{e.nombre}</option>
            ))}
          </select>
          <span className="self-center text-text-muted text-sm">vs</span>
          <select
            value={form.equipoVisitante}
            onChange={(e) => setForm((f) => ({ ...f, equipoVisitante: e.target.value }))}
            className="rounded-lg border border-border bg-bg-secondary px-2 py-1.5 text-sm"
          >
            <option value="">Visitante…</option>
            {equipos.map((e) => (
              <option key={e.id} value={e.nombre}>{e.nombre}</option>
            ))}
          </select>
          <input
            value={form.cancha}
            onChange={(e) => setForm((f) => ({ ...f, cancha: e.target.value }))}
            placeholder="Cancha (opcional)"
            className="rounded-lg border border-border bg-bg-secondary px-2 py-1.5 text-sm"
          />
          <button
            onClick={agregar}
            className="flex items-center gap-1 rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-white hover:opacity-90 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" /> Agregar
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-text-muted">Cargando…</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agrupado.map(({ dia, partidos }) => (
            <div key={dia} className="card rounded-2xl p-4">
              <h4 className="mb-2 font-display tracking-wide text-accent-3">{dia}</h4>
              {partidos.length === 0 ? (
                <p className="text-xs text-text-muted">Sin partidos</p>
              ) : (
                <div className="space-y-2">
                  {partidos
                    .sort((a, b) => a.hora.localeCompare(b.hora))
                    .map((p) => (
                      <div key={p.id} className="flex items-center justify-between rounded-lg border border-border bg-bg-secondary px-3 py-2 text-sm">
                        <div>
                          <div className="font-mono text-xs text-text-muted">{p.hora} {p.cancha && `· ${p.cancha}`}</div>
                          <div>{p.equipoLocal} <span className="text-text-muted">vs</span> {p.equipoVisitante}</div>
                        </div>
                        <button onClick={() => eliminar(p.id)} className="cursor-pointer text-text-muted hover:text-red-400">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
