import { create } from "zustand";

export interface Tiro {
  id: string;
  coordenada: string;
  resultado: string;
}

interface GameState {
  disparos: number;
  historial: Tiro[];
  agregarTiro: (x: number, y: number, resultado: string) => void;
  reiniciarJuego: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  disparos: 0,
  historial: [],
  agregarTiro: (x, y, resultado) =>
    set((state) => ({
      disparos: state.disparos + 1,
      historial: [
        { id: Date.now().toString(), coordenada: `${x},${y}`, resultado },
        ...state.historial,
      ],
    })),
  reiniciarJuego: () => set({ disparos: 0, historial: [] }),
}));
