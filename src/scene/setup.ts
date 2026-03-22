import {
  Engine,
  Scene,
  FreeCamera,
  HemisphericLight,
  DirectionalLight,
  Vector3,
} from '@babylonjs/core';
import { CAMERA_MAIN, ENGINE, LIGHTS } from '../const';

export function createEngine(canvas: HTMLCanvasElement): Engine {
  return new Engine(canvas, true, {
    preserveDrawingBuffer: ENGINE.preserveDrawingBuffer,
    stencil: ENGINE.stencil,
  });
}

export function createScene(engine: Engine): Scene {
  return new Scene(engine);
}

export function createRudimentaryCamera(scene: Scene, canvas: HTMLCanvasElement): FreeCamera {
  const camera = new FreeCamera(CAMERA_MAIN.DEFAULT_NAME, new Vector3(3, 3, -6), scene);
  camera.setTarget(Vector3.Zero());
  camera.minZ = CAMERA_MAIN.MIN_Z;
  camera.attachControl(canvas, true);
  scene.activeCamera = camera;
  return camera;
}

export function createLights(scene: Scene): void {
  const hemi = new HemisphericLight(LIGHTS.HEMI_NAME, LIGHTS.HEMI_DIRECTION.clone(), scene);
  hemi.intensity = LIGHTS.HEMI_INTENSITY;
  hemi.groundColor = LIGHTS.HEMI_GROUND_COLOR;

  const keyLight = new DirectionalLight(LIGHTS.KEY_NAME, LIGHTS.KEY_DIRECTION.clone(), scene);
  keyLight.intensity = LIGHTS.KEY_INTENSITY;
  keyLight.diffuse = LIGHTS.KEY_DIFFUSE;
  keyLight.specular = LIGHTS.KEY_SPECULAR;
  keyLight.position = LIGHTS.KEY_POSITION.clone();
}

export type SceneContext = {
  engine: Engine;
  scene: Scene;
  camera: FreeCamera;
};

export function setupScene(canvas: HTMLCanvasElement): SceneContext {
  const engine = createEngine(canvas);
  const scene = createScene(engine);
  const camera = createRudimentaryCamera(scene, canvas);
  createLights(scene);
  return { engine, scene, camera };
}
