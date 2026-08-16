"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { useCategoria } from "@/lib/categoria-context";
import { api } from "@/lib/api";
import { MODULOS } from "@/lib/modulos";

export default function MenuPage() {
  const { categorias, categoriaId, categoriaNombre, setCategoria, reload } = useCategoria();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<{ id: number; nombre: string } | null>(null);
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<{ id: number; nombre: string } | null>(null);
  const [warning, setWarning] = useState("");
  const warningTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showWarning(msg: string) {
    setWarning(msg);
    if (warningTimeout.current) clearTimeout(warningTimeout.current);
    warningTimeout.current = setTimeout(() => setWarning(""), 3500);
  }

  function openCreate() {
    setEditing(null);
    setNombre("");
    setError("");
    setShowModal(true);
  }

  function openEdit(c: { id: number; nombre: string }) {
    setEditing(c);
    setNombre(c.nombre);
    setError("");
    setShowModal(true);
  }

  async function guardar() {
    const val = nombre.trim();
    if (!val) {
      setError("⚠️ El nombre no puede estar vacío");
      return;
    }
    try {
      if (editing) {
        await api.updateCategoria(editing.id, val);
        if (categoriaId === editing.id) setCategoria({ id: editing.id, nombre: val });
      } else {
        const nueva = await api.createCategoria(val);
        if (!nueva || (nueva as unknown as { error?: string }).error) {
          setError("⚠️ Esta categoría ya existe");
          return;
        }
      }
      setShowModal(false);
      await reload();
    } catch {
      setError("⚠️ Error al guardar, revisa la conexión");
    }
  }

  async function eliminar() {
    if (!confirmDelete) return;
    await api.deleteCategoria(confirmDelete.id);
    if (categoriaId === confirmDelete.id) setCategoria(null);
    setConfirmDelete(null);
    await reload();
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Nueva Categoría
        </button>

        <div className="flex-1 flex-wrap gap-2 flex">
          {categorias.length === 0 && (
            <span className="text-sm text-text-muted">
              Crea tu primera categoría para empezar
            </span>
          )}
          {categorias.map((c) => (
            <div
              key={c.id}
              className={`group flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm cursor-pointer transition ${
                c.id === categoriaId
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border bg-bg-card text-text-secondary hover:bg-bg-card-hover"
              }`}
              onClick={() => setCategoria(c)}
            >
              🏆 {c.nombre}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openEdit(c);
                }}
                className="ml-1 opacity-0 group-hover:opacity-100 cursor-pointer"
              >
                <Pencil className="h-3 w-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmDelete(c);
                }}
                className="opacity-0 group-hover:opacity-100 cursor-pointer"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {categoriaNombre && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-border-accent bg-bg-card px-4 py-2.5 text-sm">
          <span className="h-2 w-2 rounded-full bg-accent" />
          <span className="text-text-secondary">Administrando:</span>
          <span className="font-semibold">{categoriaNombre}</span>
        </div>
      )}

      {warning && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
          <span>{warning}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MODULOS.map((m) => (
          <Link
            key={m.href}
            href={categoriaId ? m.href : "#"}
            onClick={(e) => {
              if (!categoriaId) {
                e.preventDefault();
                setShowModal(false);
                showWarning("⚠️ Selecciona o crea una categoría primero");
              }
            }}
            className="card group rounded-2xl p-6 transition hover:-translate-y-0.5"
            style={{ borderColor: !categoriaId ? undefined : `${m.accent}55` }}
          >
            <div className="text-4xl">{m.icon}</div>
            <div className="mt-3 font-display text-xl tracking-wide">{m.label}</div>
            <div className="text-sm text-text-muted">{m.desc}</div>
          </Link>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card w-full max-w-sm rounded-2xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl tracking-wide">
                {editing ? "✏️ Editar Categoría" : "⚡ Nueva Categoría"}
              </h2>
              <button onClick={() => setShowModal(false)} className="cursor-pointer">
                <X className="h-5 w-5 text-text-muted" />
              </button>
            </div>
            <input
              autoFocus
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && guardar()}
              className="w-full rounded-lg border border-border bg-bg-secondary px-3 py-2.5 outline-none focus:border-accent"
              placeholder="Nombre de la categoría"
            />
            {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
            <button
              onClick={guardar}
              className="mt-4 w-full rounded-lg bg-accent py-2.5 font-semibold text-white hover:opacity-90 cursor-pointer"
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
              ¿Eliminar la categoría <b>{confirmDelete.nombre}</b>? Esto también
              borrará sus equipos y jugadores.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="rounded-lg border border-border px-4 py-2 text-sm cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={eliminar}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white cursor-pointer"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
