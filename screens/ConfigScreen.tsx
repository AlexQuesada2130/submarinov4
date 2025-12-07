import { StyleSheet, Text, View, Button, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Config } from "../components/configuracionTipos";
import { Level } from "../components/estrategiaLevels";

const config = () => {
  const navigation = useNavigation<any>();
  const setGlobalConfig = ConfiguracionTipos((state) => state.setConfig);

  const [localConfig, setLocalConfig] = useState<Config>(
    Level.getInstance().crearLevel("Facil")
  );

  const botonPrestablecido = (level: "Facil" | "Intermedio" | "Dificil") => {
    const newConfig = Level.getInstance().crearLevel(level);
    setLocalConfig(newConfig);
  };

  const startGame = () => {
    // Guardamos la configuración en el estado global (Zustand)
    setGlobalConfig(localConfig);
    // Navegamos a la pantalla de juego
    navigation.navigate("Game");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CONFIGURACIÓN</Text>

      {/* Sección de Selección de Dificultad */}
      <View style={styles.section}>
        <Text style={styles.label}>Selecciona Dificultad:</Text>

        <View style={styles.buttonsContainer}>
          {(["Facil", "Intermedio", "Dificil"] as const).map((nivel) => (
            <TouchableOpacity
              key={nivel}
              style={[
                styles.levelButton,
                // Cambia el color si es la opción seleccionada
                localConfig.difficult === nivel && styles.selectedButton,
              ]}
              onPress={() => botonPrestablecido(nivel)}
            >
              <Text
                style={[
                  styles.buttonText,
                  localConfig.difficult === nivel && styles.selectedText,
                ]}
              >
                {nivel}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Sección de Información (Muestra los datos de la estrategia seleccionada) */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Resumen del Nivel</Text>
        <Text style={styles.infoText}>
          📏 Tamaño Tablero: {localConfig.tamanio}x{localConfig.tamanio}
        </Text>
        <Text style={styles.infoText}>
          👀 Rastro Visible: {localConfig.trail} casillas
        </Text>
      </View>

      {/* Botón de Inicio */}
      <TouchableOpacity style={styles.startButton} onPress={startGame}>
        <Text style={styles.startText}>JUGAR</Text>
      </TouchableOpacity>
    </View>
  );
};

export default config;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#f4f4f4",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 40,
    color: "#333",
  },
  section: {
    marginBottom: 30,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
    color: "#555",
    fontWeight: "600",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  levelButton: {
    flex: 1,
    paddingVertical: 15,
    backgroundColor: "#ddd",
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  selectedButton: {
    backgroundColor: "#007AFF", // Azul cuando está seleccionado
    borderColor: "#0056b3",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  selectedText: {
    color: "white", // Texto blanco al seleccionar
  },
  infoCard: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    marginBottom: 40,
    elevation: 3, // Sombra en Android
    shadowColor: "#000", // Sombra en iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#333",
  },
  infoText: {
    fontSize: 16,
    marginBottom: 5,
    color: "#555",
    textAlign: "center",
  },
  startButton: {
    backgroundColor: "#28a745", // Verde
    padding: 15,
    borderRadius: 30,
    alignItems: "center",
    elevation: 5,
  },
  startText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 1,
  },
});
function ConfiguracionTipos(arg0: (state: any) => any) {
  throw new Error("Function not implemented.");
}
