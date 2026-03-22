import './styles.css';
import { APP } from './const';
import { setupSelection } from './interaction/selection';
import { loadModel } from './model/loader';
import { setupScene } from './scene/setup';
import { initFpsDisplay } from './ui/fps';

const canvas = document.getElementById(APP.CANVAS_ID) as HTMLCanvasElement;
const loadingEl = document.getElementById(APP.LOADING_ID);
if (!canvas) throw new Error(`Canvas #${APP.CANVAS_ID} not found`);

async function main(): Promise<void> {
  const { engine, scene } = setupScene(canvas);
  const fpsEl = document.getElementById(APP.FPS_ID);
  if (fpsEl) initFpsDisplay(engine, scene, fpsEl);

  await loadModel(scene);

  if (loadingEl) loadingEl.classList.add(APP.HIDDEN_CLASS);

  setupSelection(scene);

  engine.runRenderLoop(() => scene.render());
  window.addEventListener('resize', () => engine.resize());
}

main().catch((err) => {
  console.error(err);
  if (loadingEl) {
    loadingEl.textContent = APP.LOAD_ERROR_MESSAGE;
    loadingEl.classList.remove(APP.HIDDEN_CLASS);
  }
});
