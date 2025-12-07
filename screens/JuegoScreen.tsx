import { GLView } from "expo-gl";
import { StatusBar } from "expo-status-bar";
import * as THREE from "three";
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
import { ConfiguracionTipos } from "../components/ConfiguracionTipos";
import Renderer from "expo-three/build/Renderer";

interface RotatingCube {
  object: THREE.Object3D;
  progress: number;
  originalRotation: THREE.Euler;
  originalColor: THREE.Color;
}

export default function JuegoScreen() {
  const navigation = useNavigation();
  const config = ConfiguracionTipos((state) => state);
  const [disparos, setDisparos] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  //Colores
  const COLOR_AGUA = "#001133"; // Azul muy oscuro (Casi negro/marino)
  const COLOR_DISPARO = "#ff0000"; // Rojo intenso
  const COLOR_MUERTO = "#333333"; // Gris oscuro (Casilla destruida/humo)

  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const clickableObjectsRef = useRef<THREE.Object3D[]>([]);
  const rotatingCubesRef = useRef<RotatingCube[]>([]);

  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } =
    Dimensions.get("window");

  const panGesture = Gesture.Pan().onUpdate(
    (event: GestureUpdateEvent<PanGestureHandlerEventPayload>) => {
      const camera = cameraRef.current;
      if (!camera) return;
      const speed = 0.5;
      camera.position.x -= event.translationX * speed;
      camera.position.z += event.translationY * speed;
    }
  );

  const tapGesture = Gesture.Tap().onEnd(
    (event: GestureUpdateEvent<TapGestureHandlerEventPayload>) => {
      const camera = cameraRef.current;
      if (!camera) return;

      const { absoluteX, absoluteY } = event;
      const x = (absoluteX / SCREEN_WIDTH) * 2 - 1;
      const y = -(absoluteY / SCREEN_HEIGHT) * 2 + 1;

      const pointerVector = new THREE.Vector2(x, y);
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(pointerVector, camera);

      const intersects = raycaster.intersectObjects(
        clickableObjectsRef.current,
        true
      );

      if (intersects.length > 0) {
        setDisparos((prev) => prev + 1);
        const firstIntersectedObject = intersects[0].object;
        const mesh = firstIntersectedObject as THREE.Mesh;

        if (mesh.material) {
          const material = mesh.material as THREE.MeshBasicMaterial;
          const originalColor = material.color.clone(); //Color tiros
          material.color.set(COLOR_DISPARO);

          rotatingCubesRef.current.push({
            object: firstIntersectedObject,
            progress: 0,
            originalRotation: firstIntersectedObject.rotation.clone(), //Color rastro
            originalColor: material.color.set(COLOR_MUERTO),
          });
        }
      }
    }
  );

  const combinedGesture = Gesture.Race(tapGesture, panGesture);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.hudContainer}>
        <Text style={styles.hudText}>
          Disparos: {disparos} | Nivel: {config.difficult}
        </Text>
      </View>

      <GestureDetector gesture={combinedGesture}>
        <GLView
          style={{ flex: 1 }}
          onContextCreate={async (gl) => {
            try {
              const renderer = new Renderer({ gl });
              renderer.dispose = () => {};

              renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);

              const scene = new THREE.Scene(); //Color de fondo
              scene.background = new THREE.Color("#000000");

              const camera = new THREE.PerspectiveCamera(
                45,
                gl.drawingBufferWidth / gl.drawingBufferHeight,
                1,
                10000
              );
              camera.position.set(0, config.tamanio * 150 + 600, 100);
              camera.lookAt(0, 0, 0);
              cameraRef.current = camera;

              const ambientLight = new THREE.AmbientLight("#49bbac", 3);
              scene.add(ambientLight);
              const directionalLight = new THREE.DirectionalLight("#9c2d2d", 3);
              directionalLight.position.set(1, 0.75, 0.5).normalize();
              scene.add(directionalLight);

              const gridHelper = new THREE.GridHelper(2000, 50);
              scene.add(gridHelper);

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
                    //Color de los cubos
                    color: COLOR_AGUA,
                    opacity: 0.8,
                    transparent: true,
                  });
                  const box = new THREE.Mesh(boxGeometry, mat);
                  box.position.set(
                    i * totalSize - offset,
                    0,
                    j * totalSize - offset
                  );
                  scene.add(box);
                  clickableObjectsRef.current.push(box);
                }
              }

              const mySubmarine = new Submarine(scene);
              mySubmarine
                .loadAsync()
                .then(() => {
                  Submarine.current = mySubmarine;
                })
                .catch((err) => {
                  console.error(err);
                  setErrorMsg("Error cargando 3D");
                });

              const render = () => {
                requestAnimationFrame(render);

                if (Submarine.current) {
                  Submarine.current.update();
                }

                rotatingCubesRef.current.forEach((cube, index) => {
                  cube.progress += 0.02;
                  if (cube.progress <= 1) {
                    cube.object.rotation.y =
                      cube.originalRotation.y + Math.PI * cube.progress;
                    const mesh = cube.object as THREE.Mesh;
                    (mesh.material as THREE.MeshBasicMaterial).color.lerp(
                      cube.originalColor,
                      0.05
                    );
                  } else {
                    cube.object.rotation.copy(cube.originalRotation);
                    const mesh = cube.object as THREE.Mesh;
                    (mesh.material as THREE.MeshBasicMaterial).color.set(
                      cube.originalColor
                    );
                    rotatingCubesRef.current.splice(index, 1);
                  }
                });

                renderer.render(scene, camera);
                gl.endFrameEXP();
              };

              render();
            } catch (e) {
              console.error("Error fatal en GLView:", e);
              setErrorMsg("Error iniciando motor 3D");
            }
          }}
        />
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
});
