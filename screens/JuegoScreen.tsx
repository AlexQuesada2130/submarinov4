import { GLView } from "expo-gl";
import { StatusBar } from "expo-status-bar";
import { Renderer, THREE } from "expo-three"; // Mantenemos el import para utilidades, pero usaremos el Renderer nativo de THREE
import { useRef, useState } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
  GestureUpdateEvent,
  PanGestureHandlerEventPayload,
  TapGestureHandlerEventPayload,
} from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";

import { Submarine } from "../components/submarine";

// Importamos Zustand para saber el tamaño del tablero
import { configuracionTipos } from "../components/ConfiguracionTipos";

interface RotatingCube {
  object: THREE.Object3D;
  progress: number;
  originalRotation: THREE.Euler;
  originalColor: THREE.Color;
}

export default function JuegoScreen() {
  const navigation = useNavigation();
  const config = configuracionTipos((state) => state); // Leemos la configuración (NxN)

  const [disparos, setDisparos] = useState(0);
  const cameraRef = useRef<THREE.PerspectiveCamera | any>(null);
  const clickableObjectsRef = useRef<THREE.Object3D[]>([]);
  const rotatingCubesRef = useRef<RotatingCube[]>([]);

  // ---------------------------------------------------------
  // ARREGLO 1: Usar Dimensions en lugar de window
  // ---------------------------------------------------------
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } =
    Dimensions.get("window");

  const panGesture = Gesture.Pan().onUpdate(
    (event: GestureUpdateEvent<PanGestureHandlerEventPayload>) => {
      const camera = cameraRef.current;
      if (!camera) return;
      const speed = 0.5; // Velocidad ajustada
      camera.position.x -= event.translationX * speed;
      camera.position.z += event.translationY * speed;
    }
  );

  const tapGesture = Gesture.Tap().onEnd(
    (event: GestureUpdateEvent<TapGestureHandlerEventPayload>) => {
      const camera = cameraRef.current;
      if (!camera) return;

      const { absoluteX, absoluteY } = event;

      // ---------------------------------------------------------
      // ARREGLO 2: Coordenadas corregidas para Raycaster
      // ---------------------------------------------------------
      const x = (absoluteX / SCREEN_WIDTH) * 2 - 1; // <--- ARREGLADO (Antes window.innerWidth)
      const y = -(absoluteY / SCREEN_HEIGHT) * 2 + 1; // <--- ARREGLADO (Antes window.innerHeight)

      const pointerVector = new THREE.Vector2(x, y);
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(pointerVector, camera);

      const intersects = raycaster.intersectObjects(
        clickableObjectsRef.current,
        true
      );

      if (intersects.length > 0) {
        setDisparos(disparos + 1);
        const firstIntersectedObject = intersects[0].object;
        const mesh = firstIntersectedObject as THREE.Mesh;

        // Guardamos el color original antes de cambiarlo
        const material = mesh.material as THREE.MeshBasicMaterial;
        const originalColor = material.color.clone();

        material.color.set(0xff0000); // Rojo al impacto

        rotatingCubesRef.current.push({
          object: firstIntersectedObject,
          progress: 0,
          originalRotation: firstIntersectedObject.rotation.clone(),
          originalColor: originalColor, // Para futura animación de vuelta
        });

        console.log("Impacto en:", firstIntersectedObject.name);
      }
    }
  );

  const combinedGesture = Gesture.Race(tapGesture, panGesture);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.hudContainer}>
        <Text style={styles.hudText}>
          Disparos: {disparos} | Tablero: {config.tamanio}x{config.tamanio}
        </Text>
      </View>

      <GestureDetector gesture={combinedGesture}>
        <GLView
          style={{ flex: 1 }}
          onContextCreate={async (gl) => {
            // ---------------------------------------------------------
            // ARREGLO 3: Usar THREE.WebGLRenderer (Soluciona crash document.getElementById)
            // ---------------------------------------------------------
            const renderer = new THREE.WebGLRenderer({ context: gl }); // <--- ARREGLADO
            renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);

            // Parche de seguridad extra
            renderer.dispose = () => {};

            const camera = new THREE.PerspectiveCamera(
              45,
              gl.drawingBufferWidth / gl.drawingBufferHeight,
              1,
              10000
            );
            // Ajustamos la cámara según el tamaño del tablero
            camera.position.set(0, config.tamanio * 150 + 800, 100);
            camera.lookAt(0, 0, 0);
            cameraRef.current = camera;

            const scene = new THREE.Scene();
            scene.background = new THREE.Color("#000000");

            // Grid y Luces
            const gridHelper = new THREE.GridHelper(2000, 50);
            scene.add(gridHelper);
            const ambientLight = new THREE.AmbientLight("#49bbac", 3);
            scene.add(ambientLight);
            const directionalLight = new THREE.DirectionalLight("#9c2d2d", 3);
            directionalLight.position.set(1, 0.75, 0.5).normalize();
            scene.add(directionalLight);

            // Cargar Submarino
            const mySubmarine = new Submarine(scene);
            await mySubmarine.loadAsync();
            Submarine.current = mySubmarine;

            // ---------------------------------------------------------
            // GENERACIÓN DE TABLERO NxN (Basado en Config)
            // ---------------------------------------------------------
            clickableObjectsRef.current = [];
            const boxSize = 55;
            const gap = 10;
            const totalSize = boxSize + gap;
            const offset = (config.tamanio * totalSize) / 2 - totalSize / 2;

            for (let i = 0; i < config.tamanio; i++) {
              for (let j = 0; j < config.tamanio; j++) {
                const boxGeometry = new THREE.BoxGeometry(
                  boxSize,
                  boxSize,
                  boxSize
                );
                const mat = new THREE.MeshBasicMaterial({
                  color: "#16034b",
                  opacity: 0.8,
                  transparent: true,
                });

                const box = new THREE.Mesh(boxGeometry, mat);
                // Centramos el tablero en 0,0
                box.position.set(
                  i * totalSize - offset,
                  0,
                  j * totalSize - offset
                );
                box.name = `Celda_${i}_${j}`;

                scene.add(box);
                clickableObjectsRef.current.push(box);
              }
            }

            const render = () => {
              requestAnimationFrame(render);

              if (Submarine.current) {
                Submarine.current.update();
              }

              // Animación de cubos impactados
              rotatingCubesRef.current.forEach((cube, index) => {
                cube.progress += 0.02; // Velocidad animación

                if (cube.progress <= 1) {
                  // Rotación
                  cube.object.rotation.y =
                    cube.originalRotation.y + Math.PI * cube.progress;
                  // Interpolación de color (regresa a azul)
                  const mesh = cube.object as THREE.Mesh;
                  (mesh.material as THREE.MeshBasicMaterial).color.lerp(
                    new THREE.Color("#16034b"),
                    0.02
                  );
                } else {
                  // Fin animación
                  cube.object.rotation.copy(cube.originalRotation);
                  rotatingCubesRef.current.splice(index, 1);
                }
              });

              renderer.render(scene, camera);
              gl.endFrameEXP(); // <--- IMPORTANTE: Finalizar frame en Expo
            };

            render();
          }}
        />
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
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
});
