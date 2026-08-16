"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api, type Categoria } from "@/lib/api";

type Ctx = {
  categorias: Categoria[];
  categoriaId: number | null;
  categoriaNombre: string | null;
  setCategoria: (c: Categoria | null) => void;
  reload: () => Promise<void>;
  loading: boolean;
};

const CategoriaContext = createContext<Ctx | null>(null);

export function CategoriaProvider({ children }: { children: ReactNode }) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [categoriaNombre, setCategoriaNombre] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    setLoading(true);
    try {
      const cats = await api.getCategorias();
      setCategorias(cats);
      const savedName =
        typeof window !== "undefined"
          ? localStorage.getItem("categoriaSeleccionada")
          : null;
      if (savedName) {
        const found = cats.find((c) => c.nombre === savedName);
        if (found) {
          setCategoriaId(found.id);
          setCategoriaNombre(found.nombre);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const setCategoria = (c: Categoria | null) => {
    setCategoriaId(c?.id ?? null);
    setCategoriaNombre(c?.nombre ?? null);
    if (typeof window !== "undefined") {
      if (c) localStorage.setItem("categoriaSeleccionada", c.nombre);
      else localStorage.removeItem("categoriaSeleccionada");
    }
  };

  return (
    <CategoriaContext.Provider
      value={{ categorias, categoriaId, categoriaNombre, setCategoria, reload, loading }}
    >
      {children}
    </CategoriaContext.Provider>
  );
}

export function useCategoria() {
  const ctx = useContext(CategoriaContext);
  if (!ctx) throw new Error("useCategoria must be used inside CategoriaProvider");
  return ctx;
}
