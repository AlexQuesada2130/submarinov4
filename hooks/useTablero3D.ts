// hooks/useTablero3D.ts
import { useRef, useEffect } from "react";
import * as THREE from "three";
import { Submarine } from "../components/submarine";

export const useTablero3D = (
  config: any,
  posicionSubmarino: any,
  rastro: any
) => {
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const clickableObjectsRef = useRef<THREE.Object3D[]>([]);
  const rotatingCubesRef = useRef<any[]>([]);
  const sceneRef = useRef<THREE.Scene | null>(null);

  const COLORS = {
    AGUA: "#001133",
    DISPARO: "#ff0000",
    MUERTO: "#333333",
    RASTRO: "#FFD700",
    VICTORIA: "#00FF00",
  };

  // Función para resetear visuales (al reiniciar juego)
  const resetTableroVisual = () => {
    rotatingCubesRef.current = [];
    clickableObjectsRef.current.forEach((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.material) {
        const material = mesh.material as THREE.MeshBasicMaterial;
        material.color.set(COLORS.AGUA);
      }
      obj.rotation.set(0, 0, 0);
    });
  };

  // Efecto: Mover Submarino
  useEffect(() => {
    if (Submarine.current && Submarine.current.mesh) {
      Submarine.current.mesh.visible = false;
      const boxSize = 55;
      const gap = 10;
      const totalSize = boxSize + gap;
      const offset = (config.tamanio * totalSize) / 2 - totalSize / 2;
      const worldX = posicionSubmarino.x * totalSize - offset;
      const worldZ = posicionSubmarino.y * totalSize - offset;
      Submarine.current.mesh.position.set(worldX, 0, worldZ);
    }
  }, [posicionSubmarino]);

  // Efecto: Pintar Rastro
  useEffect(() => {
    clickableObjectsRef.current.forEach((object) => {
      const gridX = object.userData.x;
      const gridY = object.userData.y;
      const esParteDelRastro = rastro.some(
        (p: any) => p.x === gridX && p.y === gridY
      );

      if (esParteDelRastro) {
        const mesh = object as THREE.Mesh;
        const material = mesh.material as THREE.MeshBasicMaterial;
        if (material.color.getHex() === new THREE.Color(COLORS.AGUA).getHex()) {
          material.color.set(COLORS.RASTRO);
        }
      }
    });
  }, [rastro]);

  return {
    cameraRef,
    clickableObjectsRef,
    rotatingCubesRef,
    COLORS,
    resetTableroVisual,
    sceneRef,
  };
};
