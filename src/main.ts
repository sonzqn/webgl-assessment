import './styles.css';
import { MeshBuilder, StandardMaterial, Color3 } from '@babylonjs/core';
import { APP } from './const';
import { setupScene } from './scene/setup';

const canvas = document.getElementById(APP.CANVAS_ID) as HTMLCanvasElement;
const loadingEl = document.getElementById(APP.LOADING_ID);
if (!canvas) throw new Error(`Canvas #${APP.CANVAS_ID} not found`);

function main(): void {
  const { engine, scene } = setupScene(canvas);

  const box = MeshBuilder.CreateBox('placeholder', { size: 1.2 }, scene);
  const mat = new StandardMaterial('placeholderMat', scene);
  mat.diffuseColor = new Color3(0.35, 0.55, 0.95);
  mat.specularColor = new Color3(0.2, 0.2, 0.25);
  box.material = mat;

  if (loadingEl) loadingEl.classList.add(APP.HIDDEN_CLASS);

  engine.runRenderLoop(() => scene.render());
  window.addEventListener('resize', () => engine.resize());
}

main();
