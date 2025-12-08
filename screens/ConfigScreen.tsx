import { StyleSheet, Text, View, Button, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { ConfiguracionTipos, Config } from "../components/ConfiguracionTipos";
import { Level } from "../components/EstrategiaLevels";

const ConfigScreen = () => {
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
    setGlobalConfig(localConfig);
    navigation.navigate("JuegoScreen");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CONFIGURACIÓN</Text>
      <View style={styles.section}>
        <Text style={styles.label}>Selecciona Dificultad:</Text>
        <View style={styles.buttonsContainer}>
          {(["Facil", "Intermedio", "Dificil"] as const).map((nivel) => (
            <TouchableOpacity
              key={nivel}
              style={[
                styles.levelButton,
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
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Resumen del Nivel</Text>
        <Text style={styles.infoText}>
          📏 Tamaño Tablero: {localConfig.tamanio}x{localConfig.tamanio}
        </Text>
        <Text style={styles.infoText}>
          👀 Rastro Visible: {localConfig.trail} casillas
        </Text>
      </View>
      <TouchableOpacity style={styles.startButton} onPress={startGame}>
        <Text style={styles.startText}>JUGAR</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ConfigScreen;

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
    backgroundColor: "#007AFF",
    borderColor: "#0056b3",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  selectedText: {
    color: "white",
  },
  infoCard: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    marginBottom: 40,
    elevation: 3,
    shadowColor: "#000",
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
    backgroundColor: "#28a745",
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
