import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

// 👇 IMPORTANTE: Importamos el store para leer los datos reales
import { useGameStore } from "../context/Context";

const MovimientosScreen = () => {
  const navigation = useNavigation();

  // 👇 LEEMOS EL HISTORIAL DEL STORE (Ya no usamos datos falsos)
  const historial = useGameStore((state) => state.historial);

  useEffect(() => {
    navigation.setOptions({
      title: "Historial de Tiros",
    });
  }, [navigation]);

  const handleVolver = () => {
    navigation.goBack();
  };

  const renderItem = ({ item }: { item: any }) => {
    // Colores por defecto (Agua)
    let color = "#007bff";
    let emoji = "💧";

    // Lógica de colores según el resultado que guardaste en el store
    if (item.resultado === "Tocado" || item.resultado === "Blanco") {
      color = "#28a745"; // Verde (Acierto)
      emoji = "💥";
    } else if (item.resultado === "Rastro de Submarino") {
      color = "#ffc107"; // Amarillo
      emoji = "🟡";
    } else if (item.resultado === "Hundido") {
      color = "#dc3545"; // Rojo
      emoji = "☠️";
    }

    return (
      <View style={styles.movimientoItem}>
        <Text style={[styles.movimientoTexto, { color }]}>
          {emoji} {item.resultado} ({item.coordenada})
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Mostramos cuántos tiros llevamos en el título */}
      <Text style={styles.titulo}>📜 Historial ({historial.length})</Text>

      <FlatList
        data={historial}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20, color: "#666" }}>
            No hay tiros aún. ¡Ve a jugar!
          </Text>
        }
      />

      <TouchableOpacity style={styles.botonVolver} onPress={handleVolver}>
        <Text style={styles.textoBoton}>Volver al Juego</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
    paddingTop: 50,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  movimientoItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  movimientoTexto: { fontSize: 16, fontWeight: "600" },
  botonVolver: {
    marginTop: 20,
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  textoBoton: { color: "white", fontWeight: "bold", fontSize: 16 },
});

export default MovimientosScreen;
