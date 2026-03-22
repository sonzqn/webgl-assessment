import './styles.css';
import { APP } from './const';
import { setPartsData, type PartsData } from './data/parts';
import { setupSelection } from './interaction/selection';
import { loadModel } from './model/loader';
import { setupScene } from './scene/setup';
import { initFpsDisplay } from './ui/fps';
import { initModal } from './ui/modal';
import { loadPreviewModel } from './ui/modalPreview';

const canvas = document.getElementById(APP.CANVAS_ID) as HTMLCanvasElement;
const loadingEl = document.getElementById(APP.LOADING_ID);
if (!canvas) throw new Error(`Canvas #${APP.CANVAS_ID} not found`);

async function loadPartsData(): Promise<void> {
  try {
    const res = await fetch(APP.PARTS_JSON_URL);
    if (res.ok) {
      const data = (await res.json()) as PartsData;
      setPartsData(data);
    }
  } catch {
    console.warn('Could not load parts.json');
  }
}

async function main(): Promise<void> {
  const { engine, scene, camera } = setupScene(canvas);
  const fpsEl = document.getElementById(APP.FPS_ID);
  if (fpsEl) initFpsDisplay(engine, scene, fpsEl);
  initModal(scene, camera);

  await loadModel(scene);

  if (loadingEl) loadingEl.classList.add(APP.HIDDEN_CLASS);

  setupSelection(scene);

  engine.runRenderLoop(() => scene.render());
  window.addEventListener('resize', () => engine.resize());

  // Load preview model and parts data
  await loadPartsData();
  await loadPreviewModel();
}

main().catch((err) => {
  console.error(err);
  if (loadingEl) {
    loadingEl.textContent = APP.LOAD_ERROR_MESSAGE;
    loadingEl.classList.remove(APP.HIDDEN_CLASS);
  }
});
