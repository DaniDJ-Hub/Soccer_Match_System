"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown, LogOut, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useCategoria } from "@/lib/categoria-context";
import { logout } from "@/lib/auth";
import { MODULOS } from "@/lib/modulos";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { categorias, categoriaNombre, setCategoria } = useCategoria();
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg-primary/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
        <Link href="/menu" className="flex items-center gap-2">
          <span className="text-2xl">🐆</span>
          <div className="leading-tight">
            <div className="font-display text-lg tracking-wide sm:text-xl">
              FUT 7 · EL JAGUAR
            </div>
            <div className="text-[10px] uppercase tracking-widest text-text-muted">
              Sistema de gestión
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {MODULOS.map((m) => {
            const active = pathname?.startsWith(m.href) ?? false;
            return (
              <Link
                key={m.href}
                href={m.href}
                className={`rounded-full px-3 py-1.5 text-sm transition ${
                  active
                    ? "bg-accent/15 text-accent"
                    : "text-text-secondary hover:bg-bg-card-hover hover:text-text-primary"
                }`}
              >
                {m.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          aria-label={mobileOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-bg-card text-text-secondary transition hover:bg-bg-card-hover cursor-pointer md:hidden"
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>

        <div className="relative ml-auto">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full border border-border bg-bg-card px-3 py-1.5 text-sm text-text-secondary transition hover:bg-bg-card-hover cursor-pointer"
          >
            🏆 {categoriaNombre ?? "Selecciona categoría"}
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          {open && (
            <div className="shadow-elevated absolute right-0 z-40 mt-2 w-56 rounded-xl border border-border bg-bg-secondary p-1">
              {categorias.length === 0 && (
                <div className="px-3 py-2 text-xs text-text-muted">
                  Sin categorías aún
                </div>
              )}
              {categorias.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setCategoria(c);
                    setOpen(false);
                  }}
                  className={`block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-bg-card-hover cursor-pointer ${
                    c.nombre === categoriaNombre ? "text-accent" : "text-text-primary"
                  }`}
                >
                  {c.nombre}
                </button>
              ))}
            </div>
          )}
        </div>

        <ThemeToggle />

        <button
          onClick={() => {
            logout();
            router.replace("/login");
          }}
          className="flex items-center gap-1.5 rounded-full border border-border bg-bg-card px-3 py-1.5 text-sm text-text-secondary transition hover:bg-bg-card-hover cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" /> Salir
        </button>
      </div>

      {mobileOpen && (
        <nav className="border-t border-border px-4 py-2 sm:px-6 md:hidden">
          <div className="flex flex-col gap-1">
            {MODULOS.map((m) => {
              const active = pathname?.startsWith(m.href) ?? false;
              return (
                <Link
                  key={m.href}
                  href={m.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                    active
                      ? "bg-accent/15 text-accent"
                      : "text-text-secondary hover:bg-bg-card-hover hover:text-text-primary"
                  }`}
                >
                  <span>{m.icon}</span> {m.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
