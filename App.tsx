import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

// Importa las pantallas que has creado
import ConfigScreen from "./screens/ConfigScreen";
import GameScreen from "./screens/JuegoScreen";

// 1. Crear el Navegador Stack
const Stack = createStackNavigator();

// Definición de tipos para las rutas (buena práctica TypeScript)
export type RootStackParamList = {
  Config: undefined; // La pantalla inicial no necesita parámetros
  Game: undefined; // La pantalla de juego tampoco necesita (obtiene config de Zustand)
};

export default function App() {
  return (
    // 2. Contenedor principal de navegación
    <NavigationContainer>
      {/* 3. Definición de las pantallas y configuración */}
      <Stack.Navigator
        // 🚨 La pantalla de configuración será la primera en cargarse
        initialRouteName="Config"
      >
        <Stack.Screen
          name="Config"
          component={ConfigScreen}
          options={{
            title: "Configuración de Misión",
            headerShown: false, // Ocultamos la barra superior si no es necesaria
          }}
        />
        <Stack.Screen
          name="Game"
          component={GameScreen}
          options={{
            headerShown: false, // Ocultamos la barra para inmersión 3D
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
