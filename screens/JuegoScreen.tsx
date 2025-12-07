import { GLView } from "expo-gl";
import { StatusBar } from "expo-status-bar";
import { Renderer, THREE } from "expo-three";
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

import { Submarine } from "../components/submarine";

interface RotatingCube {
  object: THREE.Object3D;
  progress: number;
  originalRotation: THREE.Euler;
}

export default function JuegoScreen() {
  const [total, setTotal] = useState(0);
  const cameraRef = useRef<THREE.PerspectiveCamera | any>(null);
  const clickableObjectsRef = useRef<THREE.Object3D[]>([]);
  const rotatingCubesRef = useRef<RotatingCube[]>([]);

  // Obtenemos las dimensiones reales de la pantalla
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } =
    Dimensions.get("window");

  const panGesture = Gesture.Pan().onUpdate(
    (event: GestureUpdateEvent<PanGestureHandlerEventPayload>) => {
      const camera = cameraRef.current;
      if (!camera) return;
      const speed = 0.1;
      camera.position.x -= event.translationX * speed;
      camera.position.z += event.translationY * speed;
    }
  );

  const tapGesture = Gesture.Tap().onEnd(
    (event: GestureUpdateEvent<TapGestureHandlerEventPayload>) => {
      const camera = cameraRef.current;
      const { absoluteX, absoluteY } = event;

      // ---------------------------------------------------------
      // 1. CORRECCIÓN DE COORDENADAS (Dimensions vs window)
      // ---------------------------------------------------------
      // Usamos SCREEN_WIDTH/HEIGHT porque 'window' no es fiable en nativo
      const x = (absoluteX / SCREEN_WIDTH) * 2 - 1; // <--- CAMBIO AQUI (Usamos variable correcta)
      const y = -(absoluteY / SCREEN_HEIGHT) * 2 + 1; // <--- CAMBIO AQUI (Usamos variable correcta)

      const pointerVector = new THREE.Vector2(x, y);
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(pointerVector, camera);

      const intersects = raycaster.intersectObjects(
        clickableObjectsRef.current,
        true
      );
      if (intersects.length > 0) {
        setTotal(total + 1);
        const firstIntersectedObject = intersects[0].object;

        const mesh = firstIntersectedObject as THREE.Mesh;
        (mesh.material as THREE.MeshBasicMaterial).color.set(0xff0000);

        rotatingCubesRef.current.push({
          object: firstIntersectedObject,
          progress: 0,
          originalRotation: firstIntersectedObject.rotation.clone(),
        });

        console.log("Encontrado:", firstIntersectedObject.name);
      }
    }
  );

  const combinedGesture = Gesture.Race(tapGesture, panGesture);

  return (
    <GestureHandlerRootView>
      <View style={styles.container}>
        <Text style={{ fontSize: 18, textAlign: "center", marginTop: 40 }}>
          Toca un cubo para girarlo o arrastra para mover la cámara {total}
        </Text>
        <StatusBar style="auto" />
      </View>
      <GestureDetector gesture={combinedGesture}>
        <GLView
          style={{ flex: 1 }}
          onContextCreate={async (gl) => {
            // ---------------------------------------------------------
            // 2. CAMBIO DE RENDERER (THREE.WebGLRenderer)
            // ---------------------------------------------------------
            // Usamos el renderer nativo de Three.js pasando el contexto 'gl'
            const renderer = new THREE.WebGLRenderer({ context: gl }); // <--- CAMBIO AQUI (Renderer nativo)

            renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);

            // Opcional: Evitamos que intente acceder al DOM al desmontar
            renderer.dispose = () => {};

            const camera = new THREE.PerspectiveCamera(
              45,
              gl.drawingBufferWidth / gl.drawingBufferHeight, // <--- CAMBIO AQUI (Mejor usar drawingBuffer para aspecto)
              1,
              10000
            );
            camera.position.set(0, 1300, 1);
            camera.lookAt(0, 0, 0);
            cameraRef.current = camera;

            const scene = new THREE.Scene();
            scene.background = new THREE.Color("#000000");

            const gridHelper = new THREE.GridHelper(1000, 20);
            scene.add(gridHelper);

            const mySubmarine = new Submarine(scene);
            await mySubmarine.loadAsync();
            Submarine.current = mySubmarine;

            const ambientLight = new THREE.AmbientLight("#49bbacff", 3);
            scene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight("#9c2d2dff", 3);
            directionalLight.position.set(1, 0.75, 0.5).normalize();
            scene.add(directionalLight);

            for (let i = 0; i < 10; i++) {
              for (let j = 0; j < 10; j++) {
                const boxGeometry = new THREE.BoxGeometry(55, 55, 55);
                const MeshBasicMaterial = new THREE.MeshBasicMaterial({
                  color: "#16034bff",
                  opacity: 0.8,
                  transparent: true,
                });

                const box = new THREE.Mesh(boxGeometry, MeshBasicMaterial);
                box.position.set(i * 60 - 200, 0, j * 60 - 200);
                box.name = `Box_${i}_${j}`;
                scene.add(box);
                clickableObjectsRef.current.push(box);
              }
            }

            const render = () => {
              requestAnimationFrame(render);
              if (Submarine.current) {
                Submarine.current.update();
              }
              rotatingCubesRef.current.forEach((cube, index) => {
                const duration = 20;
                cube.progress += 1 / duration;

                if (cube.progress < 0.5) {
                  cube.object.rotation.y =
                    cube.originalRotation.y + Math.PI * cube.progress * 2;
                } else if (cube.progress <= 1) {
                  const t = (cube.progress - 0.5) * 2;
                  cube.object.rotation.y = THREE.MathUtils.lerp(
                    cube.originalRotation.y + Math.PI,
                    cube.originalRotation.y,
                    t
                  );
                } else {
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
    position: "absolute",
    top: 130,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    zIndex: 1,
  },
});
