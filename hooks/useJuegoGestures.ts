// hooks/useJuegoGestures.ts
import { Gesture } from "react-native-gesture-handler";
import * as THREE from "three";
import { Dimensions, Vibration } from "react-native";
import { Submarine } from "../components/submarine";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export const useJuegoGestures = (
  cameraRef: any,
  clickableObjectsRef: any,
  rotatingCubesRef: any,
  posicionSubmarino: any,
  rastro: any,
  config: any,
  actions: any
) => {
  const panGesture = Gesture.Pan().onUpdate((event) => {
    const camera = cameraRef.current;
    if (!camera) return;
    const speed = 0.5;
    camera.position.x -= event.translationX * speed;
    camera.position.z += event.translationY * speed;
  });

  const tapGesture = Gesture.Tap().onEnd((event) => {
    const camera = cameraRef.current;
    if (!camera) return;

    const { absoluteX, absoluteY } = event;
    const x = (absoluteX / SCREEN_WIDTH) * 2 - 1;
    const y = -(absoluteY / SCREEN_HEIGHT) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
    const intersects = raycaster.intersectObjects(
      clickableObjectsRef.current,
      true
    );

    if (intersects.length > 0) {
      const object = intersects[0].object as THREE.Mesh;
      const gridX = object.userData.x;
      const gridY = object.userData.y;

      const esBlanco =
        gridX === posicionSubmarino.x && gridY === posicionSubmarino.y;
      const esRastro = rastro.some((p: any) => p.x === gridX && p.y === gridY);

      let resultado = "Agua";
      if (esBlanco) {
        resultado = "Blanco";
        Vibration.vibrate(1000);
        actions.setVictoria(true);
        if (Submarine.current && Submarine.current.mesh) {
          Submarine.current.mesh.visible = true;
        }
      } else {
        Vibration.vibrate(100);

        if (esRastro) {
          resultado = "Rastro de Submarino";
        }
      }

      actions.agregarTiro(gridX, gridY, resultado);

      if (object.material) {
        const material = object.material as THREE.MeshBasicMaterial;
        if (esBlanco) material.color.set(actions.COLORS.VICTORIA);
        else if (esRastro) material.color.set(actions.COLORS.RASTRO);
        else material.color.set(actions.COLORS.DISPARO);

        rotatingCubesRef.current.push({
          object: object,
          progress: 0,
          originalRotation: object.rotation.clone(),
          originalColor: new THREE.Color(actions.COLORS.MUERTO),
        });
      }

      if (!esBlanco) {
        actions.moverSubmarino(config.tamanio);
      }
    }
  });

  return Gesture.Race(tapGesture, panGesture);
};
