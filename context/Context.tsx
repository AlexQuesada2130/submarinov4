import { create } from "zustand";

export interface Tiro {
  id: string;
  coordenada: string;
  resultado: string;
}

interface Coordenada {
  x: number;
  y: number;
}

interface GameState {
  disparos: number;
  historial: Tiro[];
  posicionSubmarino: Coordenada;
  rastro: Coordenada[];
  victoria: boolean;

  // Acciones
  agregarTiro: (x: number, y: number, resultado: string) => void;
  reiniciarJuego: (tamanoGrid: number) => void;
  moverSubmarino: (tamanoGrid: number) => void;
  setVictoria: (gano: boolean) => void;
}

export const useGameStore = create<GameState>((set) => ({
  disparos: 0,
  historial: [],
  posicionSubmarino: { x: 0, y: 0 },
  rastro: [],
  victoria: false,

  agregarTiro: (x, y, resultado) =>
    set((state) => ({
      disparos: state.disparos + 1,
      historial: [
        { id: Date.now().toString(), coordenada: `${x},${y}`, resultado },
        ...state.historial,
      ],
    })),

  setVictoria: (gano) => set({ victoria: gano }),

  reiniciarJuego: (tamanoGrid) => {
    const startX = Math.floor(Math.random() * tamanoGrid);
    const startY = Math.floor(Math.random() * tamanoGrid);
    set({
      disparos: 0,
      historial: [],
      rastro: [],
      victoria: false,
      posicionSubmarino: { x: startX, y: startY },
    });
  },

  moverSubmarino: (tamanoGrid) =>
    set((state) => {
      // Si ya ganó, no movemos nada
      if (state.victoria) return state;

      // 1. Guardar rastro
      const nuevoRastro = [...state.rastro, state.posicionSubmarino];
      if (nuevoRastro.length > 5) nuevoRastro.shift();

      // 2. Mover aleatoriamente
      const current = state.posicionSubmarino;
      const moves = [
        { x: 0, y: 1 },
        { x: 0, y: -1 },
        { x: 1, y: 0 },
        { x: -1, y: 0 },
      ];
      const validMoves = moves
        .map((m) => ({ x: current.x + m.x, y: current.y + m.y }))
        .filter(
          (pos) =>
            pos.x >= 0 && pos.x < tamanoGrid && pos.y >= 0 && pos.y < tamanoGrid
        );

      if (validMoves.length === 0) return state;

      const nextPos = validMoves[Math.floor(Math.random() * validMoves.length)];

      return {
        rastro: nuevoRastro,
        posicionSubmarino: nextPos,
      };
    }),
}));
