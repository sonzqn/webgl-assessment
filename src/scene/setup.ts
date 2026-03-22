import {
  Engine,
  Scene,
  FreeCamera,
  HemisphericLight,
  DirectionalLight,
  Vector3,
  type Node,
} from '@babylonjs/core';
import { CAMERA_MAIN, ENGINE, LIGHTS } from '../const';
import { setupEnvironmentLighting } from './environment';

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
  const camera = new FreeCamera(CAMERA_MAIN.DEFAULT_NAME, new Vector3(5, 4, -9), scene);
  camera.setTarget(Vector3.Zero());
  camera.minZ = CAMERA_MAIN.MIN_Z;
  camera.attachControl(canvas, true);
  scene.activeCamera = camera;
  return camera;
}

export function createLights(scene: Scene, parent?: Node): void {
  const hemi = new HemisphericLight(LIGHTS.HEMI_NAME, LIGHTS.HEMI_DIRECTION.clone(), scene);
  hemi.intensity = LIGHTS.HEMI_INTENSITY;
  hemi.groundColor = LIGHTS.HEMI_GROUND_COLOR;
  if (parent) {
    hemi.parent = parent;
  }

  const keyLight = new DirectionalLight(LIGHTS.KEY_NAME, LIGHTS.KEY_DIRECTION.clone(), scene);
  keyLight.intensity = LIGHTS.KEY_INTENSITY;
  keyLight.diffuse = LIGHTS.KEY_DIFFUSE;
  keyLight.specular = LIGHTS.KEY_SPECULAR;
  if (parent) {
    keyLight.parent = parent;
  } else {
    keyLight.position = LIGHTS.KEY_POSITION.clone();
  }

  const fillLight = new DirectionalLight(LIGHTS.FILL_NAME, LIGHTS.FILL_DIRECTION.clone(), scene);
  fillLight.intensity = LIGHTS.FILL_INTENSITY;
  if (parent) {
    fillLight.parent = parent;
  } else {
    fillLight.position = LIGHTS.FILL_POSITION.clone();
  }

  const rimLight = new DirectionalLight(LIGHTS.RIM_NAME, LIGHTS.RIM_DIRECTION.clone(), scene);
  rimLight.intensity = LIGHTS.RIM_INTENSITY;
  rimLight.diffuse = LIGHTS.RIM_DIFFUSE;
  rimLight.specular = LIGHTS.RIM_SPECULAR;
  if (parent) {
    rimLight.parent = parent;
  } else {
    rimLight.position = LIGHTS.RIM_POSITION.clone();
  }
}

export type SceneContext = {
  engine: Engine;
  scene: Scene;
  camera: FreeCamera;
};

export function setupScene(canvas: HTMLCanvasElement): SceneContext {
  const engine = createEngine(canvas);
  const scene = createScene(engine);
  setupEnvironmentLighting(scene);
  const camera = createRudimentaryCamera(scene, canvas);
  createLights(scene);
  return { engine, scene, camera };
}
