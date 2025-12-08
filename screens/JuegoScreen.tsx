import { GLView } from "expo-gl";
import * as THREE from "three";
import { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Modal } from "react-native";
import {
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import Renderer from "expo-three/build/Renderer";
import { Submarine } from "../components/submarine";
import { ConfiguracionTipos } from "../components/ConfiguracionTipos";
import { useGameStore } from "../context/Context";
import { useJuegoGestures } from "../hooks/useJuegoGestures";
import { useTablero3D } from "../hooks/useTablero3D";

//Code para fixear errores de ejecución
const dummyDOMElement = {
  remove: () => {},
  appendChild: () => {},
  insertBefore: () => {},
  setAttribute: () => {},
  style: {},
  addEventListener: () => {},
  removeEventListener: () => {},
};
if (typeof document === "undefined") {
  global.document = {
    getElementById: () => dummyDOMElement,
    createElement: () => dummyDOMElement,
    body: dummyDOMElement,
    head: dummyDOMElement,
  } as any;
}

export default function JuegoScreen() {
  const navigation = useNavigation<any>();
  const config = ConfiguracionTipos((state) => state);

  // Contexto Global
  const {
    disparos,
    agregarTiro,
    reiniciarJuego,
    posicionSubmarino,
    rastro,
    moverSubmarino,
    victoria,
    setVictoria,
  } = useGameStore();

  // 1. Hook de Lógica 3D y Tablero
  const {
    cameraRef,
    clickableObjectsRef,
    rotatingCubesRef,
    COLORS,
    resetTableroVisual,
  } = useTablero3D(config, posicionSubmarino, rastro);

  // 2. Hook de Gestos
  const combinedGesture = useJuegoGestures(
    cameraRef,
    clickableObjectsRef,
    rotatingCubesRef,
    posicionSubmarino,
    rastro,
    config,
    { agregarTiro, setVictoria, moverSubmarino, COLORS } // Acciones
  );

  // Inicialización del juego
  useEffect(() => {
    reiniciarJuego(config.tamanio);
  }, []);

  const handleContextCreate = async (gl: any) => {
    try {
      const renderer = new Renderer({ gl });
      renderer.dispose = () => {};
      renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);

      const scene = new THREE.Scene();
      scene.background = new THREE.Color("#191818ff");

      const camera = new THREE.PerspectiveCamera(
        45,
        gl.drawingBufferWidth / gl.drawingBufferHeight,
        0.1,
        10000
      );
      camera.position.set(0, config.tamanio * 70 + 300, 50);
      camera.lookAt(0, 0, 0);
      cameraRef.current = camera;

      // Luces
      scene.add(new THREE.AmbientLight("#49bbac", 3));
      const dLight = new THREE.DirectionalLight("#9c2d2d", 3);
      dLight.position.set(1, 0.75, 0.5).normalize();
      scene.add(dLight);
      scene.add(new THREE.GridHelper(2000, 50));

      // Creación del tablero (Reutilizando tu lógica)
      clickableObjectsRef.current = [];
      const boxSize = 55;
      const gap = 10;
      const totalSize = boxSize + gap;
      const offset = (config.tamanio * totalSize) / 2 - totalSize / 2;
      const geometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);

      for (let i = 0; i < config.tamanio; i++) {
        for (let j = 0; j < config.tamanio; j++) {
          const mat = new THREE.MeshBasicMaterial({
            color: COLORS.AGUA,
            opacity: 0.8,
            transparent: true,
          });
          const box = new THREE.Mesh(geometry, mat);
          box.userData = { x: i, y: j };
          box.position.set(i * totalSize - offset, 0, j * totalSize - offset);
          scene.add(box);
          clickableObjectsRef.current.push(box);
        }
      }

      // Cargar Submarino
      const mySubmarine = new Submarine(scene);
      await mySubmarine.loadAsync();
      if (mySubmarine.mesh) mySubmarine.mesh.visible = false;

      Submarine.current = mySubmarine;

      // Render Loop
      const render = () => {
        requestAnimationFrame(render);
        if (Submarine.current) Submarine.current.update();

        // Animación de disparos (Tu lógica original)
        rotatingCubesRef.current.forEach((item: any, index: number) => {
          item.progress += 0.02;
          const mesh = item.object as THREE.Mesh;
          const mat = mesh.material as THREE.MeshBasicMaterial;

          if (item.progress <= 1) {
            mesh.rotation.y = item.originalRotation.y + Math.PI * item.progress;
            mat.color.lerp(item.originalColor, 0.05);
          } else {
            mesh.rotation.copy(item.originalRotation);
            mat.color.set(item.originalColor);
            rotatingCubesRef.current.splice(index, 1);
          }
        });

        renderer.render(scene, camera);
        gl.endFrameEXP();
      };
      render();
    } catch (e) {
      console.error("Error GLView:", e);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Modal
        animationType="fade"
        transparent={true}
        visible={victoria}
        onRequestClose={() => setVictoria(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>¡VICTORIA!</Text>
            <Text style={styles.modalText}>
              Has hundido el submarino en ({posicionSubmarino.x},{" "}
              {posicionSubmarino.y}).
            </Text>
            <TouchableOpacity
              style={[styles.boton, { backgroundColor: "#00ff9dff" }]}
              onPress={() => {
                setVictoria(false);
                reiniciarJuego(config.tamanio);
                resetTableroVisual();
              }}
            >
              <Text style={styles.textoBoton}>Jugar Otra Vez</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.hudContainer}>
        <Text style={styles.hudText}>
          Disparos: {disparos} | Nivel: {config.difficult}
        </Text>
      </View>

      <GestureDetector gesture={combinedGesture}>
        <View style={{ flex: 1, position: "relative" }}>
          <GLView style={{ flex: 1 }} onContextCreate={handleContextCreate} />

          <View style={styles.botonesContainer}>
            <TouchableOpacity
              style={[styles.boton, { backgroundColor: "#00ff9dff" }]}
              onPress={() => navigation.navigate("ListaTiros")}
            >
              <Text style={styles.textoBoton}>Lista de Tiros</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.boton, { backgroundColor: "#00ff9dff" }]}
              onPress={() => navigation.navigate("Config")}
            >
              <Text style={styles.textoBoton}>Volver a Configuración</Text>
            </TouchableOpacity>
          </View>
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  hudContainer: {
    position: "absolute",
    top: 50,
    width: "100%",
    alignItems: "center",
    zIndex: 10,
    pointerEvents: "none",
  },
  hudText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textShadowColor: "black",
    textShadowRadius: 5,
  },
  botonesContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 20,
    paddingHorizontal: 10,
    backgroundColor: "#111",
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  boton: { padding: 12, borderRadius: 8, width: "45%", alignItems: "center" },
  textoBoton: { color: "white", fontWeight: "bold" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    elevation: 10,
  },
  modalTitle: {
    fontSize: 30,
    marginBottom: 20,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  modalText: { fontSize: 18, marginBottom: 20, textAlign: "center" },
});
