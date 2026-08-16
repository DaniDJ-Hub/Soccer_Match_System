"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, X, Users } from "lucide-react";
import { useCategoria } from "@/lib/categoria-context";
import { api, type Equipo } from "@/lib/api";

const COLORES_SUGERIDOS = [
  "#22c55e", "#3b82f6", "#ef4444", "#eab308", "#a855f7",
  "#06b6d4", "#f97316", "#ec4899", "#64748b", "#84cc16",
];

export default function EquiposPage() {
  const { categoriaId, categoriaNombre } = useCategoria();
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Equipo | null>(null);
  const [form, setForm] = useState({ nombre: "", color: COLORES_SUGERIDOS[0], escudo: "" });
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<Equipo | null>(null);

  async function load() {
    if (!categoriaId) return;
    setLoading(true);
    try {
      setEquipos(await api.getEquipos(categoriaId));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoriaId]);

  function openCreate() {
    setEditing(null);
    setForm({ nombre: "", color: COLORES_SUGERIDOS[0], escudo: "" });
    setError("");
    setShowModal(true);
  }

  function openEdit(eq: Equipo) {
    setEditing(eq);
    setForm({ nombre: eq.nombre, color: eq.color || COLORES_SUGERIDOS[0], escudo: eq.escudo || "" });
    setError("");
    setShowModal(true);
  }

  async function guardar() {
    if (!form.nombre.trim()) {
      setError("⚠️ El nombre es obligatorio");
      return;
    }
    if (!categoriaId) return;
    try {
      if (editing) {
        await api.updateEquipo(editing.id, form);
      } else {
        await api.createEquipo({ ...form, categoria_id: categoriaId });
      }
      setShowModal(false);
      await load();
    } catch {
      setError("⚠️ Error al guardar");
    }
  }

  async function eliminar() {
    if (!confirmDelete) return;
    await api.deleteEquipo(confirmDelete.id);
    setConfirmDelete(null);
    await load();
  }

  if (!categoriaId) {
    return (
      <p className="text-text-muted">
        Selecciona una categoría en el menú para gestionar sus equipos.
      </p>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl tracking-wide">👥 Equipos</h1>
          <p className="text-sm text-text-muted">Categoría: {categoriaNombre}</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90 cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Nuevo Equipo
        </button>
      </div>

      {loading ? (
        <p className="text-text-muted">Cargando…</p>
      ) : equipos.length === 0 ? (
        <p className="text-text-muted">Aún no hay equipos en esta categoría.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {equipos.map((eq) => (
            <div key={eq.id} className="card rounded-2xl p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {eq.escudo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={eq.escudo}
                      alt={eq.nombre}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white"
                      style={{ background: eq.color || "#334155" }}
                    >
                      {eq.nombre.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="font-semibold">{eq.nombre}</div>
                    <div
                      className="mt-1 h-2 w-14 rounded-full"
                      style={{ background: eq.color || "#334155" }}
                    />
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(eq)} className="cursor-pointer p-1 text-text-muted hover:text-text-primary">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => setConfirmDelete(eq)} className="cursor-pointer p-1 text-text-muted hover:text-red-400">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <Link
                href={`/equipos/${eq.id}/jugadores`}
                className="mt-4 flex items-center justify-center gap-1.5 rounded-lg border border-border py-2 text-sm text-text-secondary transition hover:bg-bg-card-hover"
              >
                <Users className="h-3.5 w-3.5" /> Ver jugadores
              </Link>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card w-full max-w-sm rounded-2xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl tracking-wide">
                {editing ? "✏️ Editar Equipo" : "⚡ Nuevo Equipo"}
              </h2>
              <button onClick={() => setShowModal(false)} className="cursor-pointer">
                <X className="h-5 w-5 text-text-muted" />
              </button>
            </div>

            <label className="mb-1 block text-xs font-semibold uppercase text-text-secondary">
              Nombre
            </label>
            <input
              autoFocus
              value={form.nombre}
              onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
              className="mb-4 w-full rounded-lg border border-border bg-bg-secondary px-3 py-2.5 outline-none focus:border-accent"
              placeholder="Ej. Los Tigres"
            />

            <label className="mb-1 block text-xs font-semibold uppercase text-text-secondary">
              Color
            </label>
            <div className="mb-4 flex flex-wrap gap-2">
              {COLORES_SUGERIDOS.map((c) => (
                <button
                  key={c}
                  onClick={() => setForm((f) => ({ ...f, color: c }))}
                  className="h-7 w-7 rounded-full cursor-pointer ring-offset-2 ring-offset-bg-card"
                  style={{
                    background: c,
                    outline: form.color === c ? `2px solid ${c}` : "none",
                    outlineOffset: "2px",
                  }}
                />
              ))}
              <input
                type="color"
                value={form.color}
                onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                className="h-7 w-7 cursor-pointer bg-transparent"
              />
            </div>

            <label className="mb-1 block text-xs font-semibold uppercase text-text-secondary">
              URL del escudo (opcional)
            </label>
            <input
              value={form.escudo}
              onChange={(e) => setForm((f) => ({ ...f, escudo: e.target.value }))}
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
              ¿Eliminar el equipo <b>{confirmDelete.nombre}</b> y todos sus jugadores?
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
