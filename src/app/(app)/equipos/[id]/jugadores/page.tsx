"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Pencil, Trash2, X, UserX, UserCheck } from "lucide-react";
import { api, type Jugador, type Equipo } from "@/lib/api";
import { useCategoria } from "@/lib/categoria-context";

export default function JugadoresPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const equipoId = Number(params.id);
  const { categoriaId } = useCategoria();

  const [equipo, setEquipo] = useState<Equipo | null>(null);
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Jugador | null>(null);
  const [form, setForm] = useState({ nombre: "", numero: "", foto: "" });
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<Jugador | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [jugs, equipos] = await Promise.all([
        api.getJugadores(equipoId),
        categoriaId ? api.getEquipos(categoriaId) : Promise.resolve<Equipo[]>([]),
      ]);
      setJugadores(jugs);
      setEquipo(equipos.find((e) => e.id === equipoId) || null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [equipoId, categoriaId]);

  function openCreate() {
    setEditing(null);
    setForm({ nombre: "", numero: "", foto: "" });
    setError("");
    setShowModal(true);
  }

  function openEdit(j: Jugador) {
    setEditing(j);
    setForm({ nombre: j.nombre, numero: j.numero?.toString() || "", foto: j.foto || "" });
    setError("");
    setShowModal(true);
  }

  async function guardar() {
    if (!form.nombre.trim()) {
      setError("⚠️ El nombre es obligatorio");
      return;
    }
    try {
      const payload = {
        nombre: form.nombre.trim(),
        numero: form.numero ? Number(form.numero) : null,
        foto: form.foto || null,
      };
      if (editing) {
        await api.updateJugador(editing.id, payload);
      } else {
        await api.createJugador({ ...payload, equipo_id: equipoId });
      }
      setShowModal(false);
      await load();
    } catch {
      setError("⚠️ Error al guardar");
    }
  }

  async function toggleBaja(j: Jugador) {
    await api.updateJugador(j.id, { baja: !j.baja } as Partial<Jugador>);
    await load();
  }

  async function eliminar() {
    if (!confirmDelete) return;
    await api.deleteJugador(confirmDelete.id);
    setConfirmDelete(null);
    await load();
  }

  return (
    <div>
      <button
        onClick={() => router.push("/equipos")}
        className="mb-4 flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a equipos
      </button>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl tracking-wide">
            🧑‍🤝‍🧑 Jugadores {equipo ? `· ${equipo.nombre}` : ""}
          </h1>
          <p className="text-sm text-text-muted">{jugadores.length} jugador(es) registrados</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90 cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Nuevo Jugador
        </button>
      </div>

      {loading ? (
        <p className="text-text-muted">Cargando…</p>
      ) : jugadores.length === 0 ? (
        <p className="text-text-muted">Aún no hay jugadores en este equipo.</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-bg-card text-left text-text-muted">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {jugadores.map((j) => (
                <tr key={j.id} className={`border-t border-border ${j.baja ? "opacity-50" : ""}`}>
                  <td className="px-4 py-3 font-mono">{j.numero ?? "—"}</td>
                  <td className="px-4 py-3 flex items-center gap-2">
                    {j.foto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={j.foto} alt={j.nombre} className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-secondary text-xs">
                        {j.nombre.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    {j.nombre}
                  </td>
                  <td className="px-4 py-3">
                    {j.baja ? (
                      <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-xs text-red-400">Baja</span>
                    ) : (
                      <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs text-accent">Activo</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => toggleBaja(j)} className="cursor-pointer p-1 text-text-muted hover:text-text-primary" title={j.baja ? "Reactivar" : "Dar de baja"}>
                        {j.baja ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                      </button>
                      <button onClick={() => openEdit(j)} className="cursor-pointer p-1 text-text-muted hover:text-text-primary">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => setConfirmDelete(j)} className="cursor-pointer p-1 text-text-muted hover:text-red-400">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card w-full max-w-sm rounded-2xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl tracking-wide">
                {editing ? "✏️ Editar Jugador" : "⚡ Nuevo Jugador"}
              </h2>
              <button onClick={() => setShowModal(false)} className="cursor-pointer">
                <X className="h-5 w-5 text-text-muted" />
              </button>
            </div>

            <label className="mb-1 block text-xs font-semibold uppercase text-text-secondary">Nombre</label>
            <input
              autoFocus
              value={form.nombre}
              onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
              className="mb-4 w-full rounded-lg border border-border bg-bg-secondary px-3 py-2.5 outline-none focus:border-accent"
              placeholder="Nombre completo"
            />

            <label className="mb-1 block text-xs font-semibold uppercase text-text-secondary">Número</label>
            <input
              type="number"
              value={form.numero}
              onChange={(e) => setForm((f) => ({ ...f, numero: e.target.value }))}
              className="mb-4 w-full rounded-lg border border-border bg-bg-secondary px-3 py-2.5 outline-none focus:border-accent"
              placeholder="10"
            />

            <label className="mb-1 block text-xs font-semibold uppercase text-text-secondary">URL de foto (opcional)</label>
            <input
              value={form.foto}
              onChange={(e) => setForm((f) => ({ ...f, foto: e.target.value }))}
              className="mb-2 w-full rounded-lg border border-border bg-bg-secondary px-3 py-2.5 outline-none focus:border-accent"
              placeholder="https://…"
            />

            {error && <p className="mb-2 text-sm text-red-400">{error}</p>}
            <button
              onClick={guardar}
              className="mt-2 w-full rounded-lg bg-accent py-2.5 font-semibold text-white hover:opacity-90 cursor-pointer"
            >
              Guardar
            </button>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card w-full max-w-sm rounded-2xl p-6 text-center">
            <p className="mb-4">
              ¿Eliminar a <b>{confirmDelete.nombre}</b>?
            </p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setConfirmDelete(null)} className="rounded-lg border border-border px-4 py-2 text-sm cursor-pointer">
                Cancelar
              </button>
              <button onClick={eliminar} className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white cursor-pointer">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
