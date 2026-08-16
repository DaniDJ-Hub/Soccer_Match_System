export type Categoria = { id: number; nombre: string };
export type Equipo = {
  id: number;
  nombre: string;
  categoria_id: number;
  color: string | null;
  escudo: string | null;
};
export type Jugador = {
  id: number;
  nombre: string;
  numero: number | null;
  equipo_id: number;
  foto: string | null;
  baja: boolean;
};
export type Partido = {
  local: string;
  visitante: string;
  golesLocal: number | null;
  golesVisitante: number | null;
  jugado: boolean;
};
export type RolData = {
  id?: number;
  categoria_id?: number;
  jornadas?: Partido[][];
  equipos_en_rol?: string[];
  partidos_jugados?: Record<string, unknown>;
  jornadas_jugadas?: number[];
  jornadas_doradas?: number[];
};
export type HorarioItem = {
  id: string;
  dia: string;
  hora: string;
  equipoLocal: string;
  equipoVisitante: string;
  cancha?: string;
};

async function j<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  // categorias
  getCategorias: () => fetch("/api/categorias").then((r) => j<Categoria[]>(r)),
  createCategoria: (nombre: string) =>
    fetch("/api/categorias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre }),
    }).then((r) => j<Categoria>(r)),
  updateCategoria: (id: number, nombre: string) =>
    fetch(`/api/categorias/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre }),
    }).then((r) => j<Categoria>(r)),
  deleteCategoria: (id: number) =>
    fetch(`/api/categorias/${id}`, { method: "DELETE" }).then((r) => j(r)),

  // equipos
  getEquipos: (categoriaId: number | string) =>
    fetch(`/api/equipos?categoriaId=${categoriaId}`).then((r) => j<Equipo[]>(r)),
  createEquipo: (data: Partial<Equipo>) =>
    fetch("/api/equipos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => j<Equipo>(r)),
  updateEquipo: (id: number, data: Partial<Equipo>) =>
    fetch(`/api/equipos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => j<Equipo>(r)),
  deleteEquipo: (id: number) =>
    fetch(`/api/equipos/${id}`, { method: "DELETE" }).then((r) => j(r)),

  // jugadores
  getJugadores: (equipoId: number | string) =>
    fetch(`/api/jugadores?equipoId=${equipoId}`).then((r) => j<Jugador[]>(r)),
  createJugador: (data: Partial<Jugador>) =>
    fetch("/api/jugadores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => j<Jugador>(r)),
  updateJugador: (id: number, data: Partial<Jugador>) =>
    fetch(`/api/jugadores/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => j<Jugador>(r)),
  deleteJugador: (id: number) =>
    fetch(`/api/jugadores/${id}`, { method: "DELETE" }).then((r) => j(r)),

  // rol
  getRol: (categoriaId: number | string) =>
    fetch(`/api/rol/${categoriaId}`).then((r) => j<RolData>(r)),
  saveRol: (data: RolData) =>
    fetch("/api/rol", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => j(r)),

  // goles / penales (free-form JSON blobs, keyed by categoria)
  getGoles: (categoriaId: number | string) =>
    fetch(`/api/goles/${categoriaId}`).then((r) => j<{ datos?: Record<string, unknown> }>(r)),
  saveGoles: (categoria_id: number, datos: unknown) =>
    fetch("/api/goles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoria_id, datos }),
    }).then((r) => j(r)),

  // horarios (single JSON blob)
  getHorarios: () => fetch("/api/horarios").then((r) => j<{ datos: Record<string, HorarioItem[]> }>(r)),
  saveHorarios: (datos: Record<string, HorarioItem[]>) =>
    fetch("/api/horarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ datos }),
    }).then((r) => j(r)),

  // graficas
  getPartidosDia: (categoriaId: number | string) =>
    fetch(`/api/partidos-dia?categoriaId=${categoriaId}`).then((r) =>
      j<{ dia: string; partidos: number }[]>(r)
    ),
  savePartidoDia: (categoria_id: number, dia: string, partidos: number) =>
    fetch("/api/partidos-dia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoria_id, dia, partidos }),
    }).then((r) => j(r)),

  getRendimiento: (categoriaId: number | string) =>
    fetch(`/api/rendimiento?categoriaId=${categoriaId}`).then((r) =>
      j<{ mes: number; valor: number }[]>(r)
    ),
  saveRendimiento: (categoria_id: number, mes: number, valor: number) =>
    fetch("/api/rendimiento", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoria_id, mes, valor }),
    }).then((r) => j(r)),

  getConfig: (categoriaId: number | string) =>
    fetch(`/api/config/${categoriaId}`).then((r) => j<Record<string, number> | null>(r)),
  saveConfig: (data: {
    categoria_id: number;
    costo_credencial: number;
    premio_1: number;
    premio_2: number;
    premio_3: number;
    premio_4: number;
  }) =>
    fetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => j(r)),
};
