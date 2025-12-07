import { Asset } from "expo-asset";
import { GLTFLoader } from "three-stdlib";
import * as THREE from "three";

export class Submarine {
  public mesh: THREE.Group | any = null;
  private scene: THREE.Scene;
  private modelAsset: any;
  static current: Submarine;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    // Referencia a tu archivo
    this.modelAsset = Asset.fromModule(require("../assets/submarine.glb"));
  }

  // Método para iniciar la carga
  async loadAsync() {
    try {
      // 1. Asegurar que el asset existe en el sistema
      const asset = Asset.fromModule(this.modelAsset);
      await asset.downloadAsync();

      // 2. Cargar el modelo
      const loader = new GLTFLoader();
      loader.load(
        asset.uri || "",
        (gltf: { scene: THREE.Group<THREE.Object3DEventMap> | null }) => {
          this.mesh = gltf.scene;

          // Configuración inicial del submarino
          //this.mesh.rotation.x = Math.PI / 2;
          this.mesh.scale.set(10, 10, 10); // Ajusta la escala
          this.mesh.position.set(0, 0, 0); // Posición inicial

          this.mesh.traverse((child: any) => {
            if (child.isMesh) {
              // Le creamos un "traje" nuevo de color amarillo plástico
              child.material = new THREE.MeshStandardMaterial({
                color: 0xffd700, // Color Oro/Amarillo (Hexadecimal)
                roughness: 0.4, // 0 es espejo, 1 es mate. 0.4 es plástico brillante.
                metalness: 0.3, // Un poco metálico
              });

              child.castShadow = true;
              child.receiveShadow = true;
            }
          });

          // Añadir a la escena automáticamente al terminar de cargar
          this.scene.add(this.mesh);
          console.log("Submarino añadido a la escena");
        },
        undefined,
        (error: any) => console.error("Error cargando submarino:", error)
      );
    } catch (e) {
      console.error("Error en sistema de assets:", e);
    }
  }

  // Método para mover el submarino (lo llamaremos en el loop de renderizado)
  update() {
    if (this.mesh) {
      // Ejemplo: Animación suave de flotación
      this.mesh.position.y = 25 + Math.sin(Date.now() * 0.002) * 2;

      // Aquí pondrás la lógica para moverlo por la cuadrícula más adelante
      // this.mesh.position.x += ...
    }
  }

  // Método helper para moverlo desde fuera
  setPosition(x: number, y: number, z: number) {
    if (this.mesh) this.mesh.position.set(x, y, z);
  }
}
