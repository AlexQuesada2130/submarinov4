import { create } from "zustand";

export interface Config {
  tamanio: number;
  trail: number;
  difficult: "Facil" | "Intermedio" | "Dificil" | "Personalizado";
}

interface GameState extends Config {
  setConfig: (configuracion: Config) => void;
}

export const ConfiguracionTipos = create<GameState>((set) => ({
  tamanio: 5,
  trail: 2,
  difficult: "Facil",
  setConfig: (configuracion) =>
    set((state) => ({ ...state, ...configuracion })),
}));
