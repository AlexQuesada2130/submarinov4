import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import ConfigScreen from "./screens/ConfigScreen";
import JuegoScreen from "./screens/JuegoScreen";
import { useAssets } from "expo-asset";
import { ActivityIndicator, View } from "react-native";
import MovimientosScreen from "./screens/MovimientosScreen";

const Stack = createStackNavigator();

export default function App() {
  const [assets] = useAssets([require("./assets/submarine.glb")]);

  if (!assets) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Config">
        <Stack.Screen
          name="Config"
          component={ConfigScreen}
          options={{
            title: "CONFIGURACION",
            headerShown: false,
          }}
        />
        <Stack.Screen name="JuegoScreen" component={JuegoScreen} />
        <Stack.Screen name="ListaTiros" component={MovimientosScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
