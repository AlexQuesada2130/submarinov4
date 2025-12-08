import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

// Si tienes tipos definidos, úsalos, si no, usa estos básicos
interface Tiro {
  id: string;
  coordenada: string;
  resultado: "Agua" | "Rastro de Submarino" | "Blanco";
}

// Datos de prueba (O usa tu estado global aquí)
const historialDeTiros: Tiro[] = [
  { id: "1", coordenada: "2,2", resultado: "Blanco" },
  { id: "2", coordenada: "3,8", resultado: "Rastro de Submarino" },
];

const MovimientosScreen = () => {
  const navigation = useNavigation();

  // 🔴 EL ERROR SOLÍA ESTAR AQUÍ:
  // Si tenías navigation.setOptions(...) aquí suelto, eso causaba el crash.

  // ✅ LA SOLUCIÓN: Usar useEffect
  useEffect(() => {
    navigation.setOptions({
      title: "Historial de Tiros", // O cualquier configuración que necesites
    });
  }, [navigation]);

  const handleVolver = () => {
    navigation.goBack();
  };

  const renderItem = ({ item }: { item: Tiro }) => {
    let color = "#007bff";
    let emoji = "💧";
    if (item.resultado === "Blanco") {
      color = "#28a745";
      emoji = "💥";
    } else if (item.resultado === "Rastro de Submarino") {
      color = "#ffc107";
      emoji = "🟡";
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
      <Text style={styles.titulo}>📜 Historial</Text>

      <FlatList
        data={historialDeTiros}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={{ textAlign: "center" }}>No hay tiros aún.</Text>
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
