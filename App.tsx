import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import ConfigScreen from "./screens/ConfigScreen";
import JuegoScreen from "./screens/JuegoScreen";

const Stack = createStackNavigator();

export type RootStackParamList = {
  Config: undefined;
  Game: undefined;
};

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Config">
        <Stack.Screen
          name="Config"
          component={ConfigScreen}
          options={{
            title: "Configuración de Misión",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Game"
          component={JuegoScreen}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
