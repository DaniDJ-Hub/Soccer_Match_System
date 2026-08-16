"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Trash2, X, Users, Palette } from "lucide-react";
import { useCategoria } from "@/lib/categoria-context";
import { api, type Equipo } from "@/lib/api";
import { BackLink } from "@/components/back-link";
import { Skeleton } from "@/components/skeleton";
import { Button } from "@/components/button";
import { ConfirmDialog } from "@/components/confirm-dialog";

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
      <div>
        <BackLink href="/menu" label="Volver al menú" />
        <p className="text-text-muted">
          Selecciona una categoría en el menú para gestionar sus equipos.
        </p>
      </div>
    );
  }

  return (
    <div>
      <BackLink href="/menu" label="Volver al menú" />
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl tracking-wide">👥 Equipos</h1>
          <p className="text-sm text-text-muted">Categoría: {categoriaNombre}</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Nuevo Equipo
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-2 w-14 rounded-full" />
                </div>
              </div>
              <Skeleton className="mt-4 h-9 w-full" />
            </div>
          ))}
        </div>
      ) : equipos.length === 0 ? (
        <p className="text-text-muted">Aún no hay equipos en esta categoría.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {equipos.map((eq) => (
            <div key={eq.id} className="card rounded-2xl p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {eq.escudo ? (
                    <Image
                      src={eq.escudo}
                      alt={eq.nombre}
                      width={48}
                      height={48}
                      unoptimized
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
                  <button
                    aria-label={`Editar equipo ${eq.nombre}`}
                    onClick={() => openEdit(eq)}
                    className="cursor-pointer p-1 text-text-muted hover:text-text-primary"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    aria-label={`Eliminar equipo ${eq.nombre}`}
                    onClick={() => setConfirmDelete(eq)}
                    className="cursor-pointer p-1 text-text-muted hover:text-red-400"
                  >
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
          <div className="card shadow-elevated w-full max-w-sm rounded-2xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display text-xl tracking-wide">
                {editing ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {editing ? "Editar Equipo" : "Nuevo Equipo"}
              </h2>
              <button aria-label="Cerrar" onClick={() => setShowModal(false)} className="cursor-pointer">
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
                  aria-label={`Color ${c}`}
                  aria-pressed={form.color === c}
                  onClick={() => setForm((f) => ({ ...f, color: c }))}
                  className="h-7 w-7 rounded-full cursor-pointer ring-offset-2 ring-offset-bg-card"
                  style={{
                    background: c,
                    outline: form.color === c ? `2px solid ${c}` : "none",
                    outlineOffset: "2px",
                  }}
                />
              ))}
              <label
                className="relative flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-border"
                style={{
                  background: COLORES_SUGERIDOS.includes(form.color) ? "var(--bg-secondary)" : form.color,
                  outline: !COLORES_SUGERIDOS.includes(form.color) ? `2px solid ${form.color}` : "none",
                  outlineOffset: "2px",
                }}
                title="Color personalizado"
              >
                <Palette className="h-3.5 w-3.5 text-white/80 mix-blend-difference" />
                <input
                  type="color"
                  aria-label="Color personalizado"
                  value={form.color}
                  onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
              </label>
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
            <Button block onClick={guardar} className="mt-2">
              Guardar
            </Button>
          </div>
        </div>
      )}

      {confirmDelete && (
        <ConfirmDialog
          message={
            <>
              ¿Eliminar el equipo <b>{confirmDelete.nombre}</b> y todos sus jugadores?
            </>
          }
          onCancel={() => setConfirmDelete(null)}
          onConfirm={eliminar}
        />
      )}
    </div>
  );
}
