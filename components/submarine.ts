import { Asset } from "expo-asset";
import * as THREE from "three";
import { GLTFLoader } from "three-stdlib";

export class Submarine {
  public mesh: THREE.Group | null = null;
  private scene: THREE.Scene;
  private localUri: any;
  static current: Submarine | null = null;
  position: any;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.localUri = require("../assets/submarine.glb");
  }

  async loadAsync(): Promise<void> {
    // 1. Descargar el asset al sistema de archivos del móvil
    const asset = Asset.fromModule(this.localUri);
    await asset.downloadAsync();
    // 2. Retornamos una promesa que no se resuelve hasta que Three.js termine
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();

      loader.load(
        asset.uri || "",
        (gltf) => {
          this.mesh = gltf.scene;

          // Configuración inicial
          this.mesh.scale.set(10, 10, 10);
          this.mesh.position.set(0, 0, 0);

          // Aplicar materiales
          this.mesh.traverse((child: any) => {
            if (child.isMesh) {
              child.material = new THREE.MeshStandardMaterial({
                color: 0xffd700, // Amarillo Submarino
                roughness: 0.4,
                metalness: 0.3,
              });
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });

          this.scene.add(this.mesh);
          console.log("✅ Submarino cargado y añadido");
          resolve(); // ¡Avisamos que ya terminó!
        },
        undefined, // onProgress
        (error) => {
          console.error("❌ Error cargando modelo GLB:", error);
          reject(error);
        }
      );
    });
  }

  update() {
    if (this.mesh) {
      // Animación suave de flotación
      const time = Date.now() * 0.002;
      this.mesh.position.y = Math.sin(time) * 5; // Flota entre -5 y 5
    }
  }

  setPosition(x: number, y: number, z: number) {
    if (this.mesh) this.mesh.position.set(x, y, z);
  }
}
