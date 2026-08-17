"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { login, isLoggedIn } from "@/lib/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isLoggedIn()) router.replace("/menu");
  }, [router]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!usuario.trim() || !password) {
      setError("⚠️ Completa usuario y contraseña");
      return;
    }
    if (login(usuario, password)) {
      router.replace("/menu");
    } else {
      setError("⚠️ Usuario o contraseña incorrectos");
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg-primary px-4">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-accent-3/10 blur-3xl" />

      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <form
        onSubmit={handleSubmit}
        className="card shadow-elevated relative w-full max-w-sm rounded-2xl p-8"
      >
        <div className="mb-6 text-center">
          <div className="text-5xl"></div>
          <h1 className="font-display mt-2 text-3xl tracking-wide">
            FUT 7 · SOCCER
          </h1>
          <p className="text-sm text-text-muted">Inicia sesión para continuar</p>
        </div>

        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-secondary">
          Usuario
        </label>
        <input
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          className="mb-4 w-full rounded-lg border border-border bg-bg-secondary px-3 py-2.5 text-text-primary outline-none focus:border-accent"
          placeholder="jaguar"
          autoFocus
        />

        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-secondary">
          Contraseña
        </label>
        <div className="relative mb-2">
          <input
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-border bg-bg-secondary px-3 py-2.5 pr-10 text-text-primary outline-none focus:border-accent"
            placeholder="••••••••"
          />
          <button
            type="button"
            aria-label={showPw ? "Ocultar contraseña" : "Mostrar contraseña"}
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted cursor-pointer"
          >
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {error && <p className="mb-2 text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          className="mt-4 w-full rounded-lg bg-accent py-2.5 font-semibold text-white transition hover:opacity-90 cursor-pointer"
        >
          Entrar
        </button>

        <p className="mt-4 text-center text-xs text-text-muted">
          Demo: usuario <span className="font-mono">jaguar</span> · contraseña{" "}
          <span className="font-mono">jaguar123</span>
        </p>
      </form>
    </div>
  );
}
