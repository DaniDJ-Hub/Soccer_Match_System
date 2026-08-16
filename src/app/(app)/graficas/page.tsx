"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { useCategoria } from "@/lib/categoria-context";
import { api } from "@/lib/api";
import { BackLink } from "@/components/back-link";

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export default function GraficasPage() {
  const { categoriaId, categoriaNombre } = useCategoria();
  const [partidosDia, setPartidosDia] = useState<{ dia: string; partidos: number }[]>([]);
  const [rendimiento, setRendimiento] = useState<{ mes: number; valor: number }[]>([]);
  const [config, setConfig] = useState({
    costo_credencial: 0, premio_1: 0, premio_2: 0, premio_3: 0, premio_4: 0,
  });
  const [savingConfig, setSavingConfig] = useState(false);

  useEffect(() => {
    if (!categoriaId) return;
    api.getPartidosDia(categoriaId).then(setPartidosDia);
    api.getRendimiento(categoriaId).then(setRendimiento);
    api.getConfig(categoriaId).then((c) => {
      if (c) {
        setConfig({
          costo_credencial: Number(c.costo_credencial) || 0,
          premio_1: Number(c.premio_1) || 0,
          premio_2: Number(c.premio_2) || 0,
          premio_3: Number(c.premio_3) || 0,
          premio_4: Number(c.premio_4) || 0,
        });
      }
    });
  }, [categoriaId]);

  const dataDias = DIAS.map((dia) => ({
    dia: dia.slice(0, 3),
    partidos: partidosDia.find((p) => p.dia === dia)?.partidos || 0,
  }));

  const dataMeses = MESES.map((mes, i) => ({
    mes,
    valor: rendimiento.find((r) => r.mes === i + 1)?.valor ?? 0,
  }));

  async function actualizarPartidosDia(dia: string, partidos: number) {
    if (!categoriaId) return;
    await api.savePartidoDia(categoriaId, dia, partidos);
    setPartidosDia((prev) => {
      const rest = prev.filter((p) => p.dia !== dia);
      return [...rest, { dia, partidos }];
    });
  }

  async function actualizarRendimiento(mes: number, valor: number) {
    if (!categoriaId) return;
    await api.saveRendimiento(categoriaId, mes, valor);
    setRendimiento((prev) => {
      const rest = prev.filter((r) => r.mes !== mes);
      return [...rest, { mes, valor }];
    });
  }

  async function guardarConfig() {
    if (!categoriaId) return;
    setSavingConfig(true);
    try {
      await api.saveConfig({ categoria_id: categoriaId, ...config });
    } finally {
      setSavingConfig(false);
    }
  }

  const ingresoTotal = partidosDia.reduce((s, p) => s + p.partidos, 0) * 2 * config.costo_credencial;
  const premiosTotal = config.premio_1 + config.premio_2 + config.premio_3 + config.premio_4;

  if (!categoriaId) {
    return (
      <div>
        <BackLink href="/menu" label="Volver al menú" />
        <p className="text-text-muted">Selecciona una categoría en el menú.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <BackLink href="/menu" label="Volver al menú" />
      <div>
        <h1 className="font-display text-2xl tracking-wide">📊 Gráficas</h1>
        <p className="text-sm text-text-muted">Categoría: {categoriaNombre}</p>
      </div>

      <div className="card rounded-2xl p-5">
        <h3 className="mb-1 font-display text-lg tracking-wide">Partidos por día</h3>
        <p className="mb-4 text-xs text-text-muted">Edita el número de partidos programados por día de la semana.</p>
        <div className="mb-4 grid grid-cols-4 gap-2 sm:grid-cols-7">
          {DIAS.map((dia) => (
            <div key={dia} className="text-center">
              <label className="mb-1 block text-[10px] text-text-muted">{dia.slice(0, 3)}</label>
              <input
                type="number"
                min={0}
                value={partidosDia.find((p) => p.dia === dia)?.partidos || 0}
                onChange={(e) => actualizarPartidosDia(dia, Number(e.target.value))}
                className="w-full rounded border border-border bg-bg-secondary px-1 py-1 text-center text-sm"
              />
            </div>
          ))}
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer>
            <BarChart data={dataDias}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="dia" stroke="var(--text-muted)" fontSize={12} />
              <YAxis stroke="var(--text-muted)" fontSize={12} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }} />
              <Bar dataKey="partidos" fill="var(--accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card rounded-2xl p-5">
        <h3 className="mb-1 font-display text-lg tracking-wide">Rendimiento mensual</h3>
        <p className="mb-4 text-xs text-text-muted">Indicador de rendimiento / ingreso por mes.</p>
        <div className="h-56 w-full">
          <ResponsiveContainer>
            <LineChart data={dataMeses}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="mes" stroke="var(--text-muted)" fontSize={12} />
              <YAxis stroke="var(--text-muted)" fontSize={12} />
              <Tooltip contentStyle={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }} />
              <Line type="monotone" dataKey="valor" stroke="var(--accent-3)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 grid grid-cols-6 gap-1 sm:grid-cols-12">
          {MESES.map((mes, i) => (
            <div key={mes} className="text-center">
              <label className="mb-1 block text-[9px] text-text-muted">{mes}</label>
              <input
                type="number"
                value={rendimiento.find((r) => r.mes === i + 1)?.valor ?? 0}
                onChange={(e) => actualizarRendimiento(i + 1, Number(e.target.value))}
                className="w-full rounded border border-border bg-bg-secondary px-1 py-1 text-center text-xs"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="card rounded-2xl p-5">
        <h3 className="mb-4 font-display text-lg tracking-wide">Configuración de ingresos</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {(
            [
              ["costo_credencial", "Costo credencial"],
              ["premio_1", "Premio 1°"],
              ["premio_2", "Premio 2°"],
              ["premio_3", "Premio 3°"],
              ["premio_4", "Premio 4°"],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <label className="mb-1 block text-xs text-text-muted">{label}</label>
              <input
                type="number"
                value={config[key]}
                onChange={(e) => setConfig((c) => ({ ...c, [key]: Number(e.target.value) }))}
                className="w-full rounded-lg border border-border bg-bg-secondary px-2 py-1.5 text-sm"
              />
            </div>
          ))}
        </div>
        <button
          onClick={guardarConfig}
          disabled={savingConfig}
          className="mt-4 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90 cursor-pointer disabled:opacity-50"
        >
          {savingConfig ? "Guardando…" : "Guardar configuración"}
        </button>

        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="rounded-lg border border-border bg-bg-secondary p-3">
            <div className="text-text-muted text-xs">Ingreso estimado (credenciales)</div>
            <div className="font-display text-xl text-accent">${ingresoTotal.toLocaleString()}</div>
          </div>
          <div className="rounded-lg border border-border bg-bg-secondary p-3">
            <div className="text-text-muted text-xs">Total en premios</div>
            <div className="font-display text-xl text-accent-2">${premiosTotal.toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
