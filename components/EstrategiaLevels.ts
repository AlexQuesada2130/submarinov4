import { Config } from "./ConfiguracionTipos";

interface DifficultStrategy {
  getSettings(): Config;
}

class FacilStrategy implements DifficultStrategy {
  getSettings(): Config {
    return {
      tamanio: 5,
      trail: 2,
      difficult: "Facil",
    };
  }
}

class IntermedioStrategy implements DifficultStrategy {
  getSettings(): Config {
    return {
      tamanio: 7,
      trail: 3,
      difficult: "Intermedio",
    };
  }
}

class DificilStrategy implements DifficultStrategy {
  getSettings(): Config {
    return {
      tamanio: 10,
      trail: 4,
      difficult: "Dificil",
    };
  }
}

export class Level {
  private static instance: Level;

  private constructor() {}

  public static getInstance(): Level {
    if (!Level.instance) {
      Level.instance = new Level();
    }
    return Level.instance;
  }

  public crearLevel(type: "Facil" | "Intermedio" | "Dificil"): Config {
    let strategy: any;

    switch (type) {
      case "Facil":
        strategy = new FacilStrategy();
        break;
      case "Intermedio":
        strategy = new IntermedioStrategy();
        break;
      case "Dificil":
        strategy = new DificilStrategy();
        break;
      default:
        "Error al elegir configuración";
    }
    return strategy.getSettings();
  }
}
