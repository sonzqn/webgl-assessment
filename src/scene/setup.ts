/** Scene setup: engine, scene, camera, and lights. */

import {
  Engine,
  Scene,
  ArcRotateCamera,
  HemisphericLight,
  DirectionalLight,
  Vector3,
  type Node,
} from '@babylonjs/core';
import { CAMERA_MAIN, ENGINE, LIGHTS } from '../const';
import { setupEnvironmentLighting } from './environment';

export type CreateCameraOptions = {
  name?: string;
  radius?: number;
  fov?: number;
  minZ?: number;
  maxZ?: number;
  wheelPrecision?: number;
  pinchPrecision?: number;
  lowerRadiusLimit?: number;
  upperRadiusLimit?: number;
  panningSensibility?: number;
  /** Default true */
  attachControl?: boolean;
};

export function createEngine(canvas: HTMLCanvasElement): Engine {
  return new Engine(canvas, true, {
    preserveDrawingBuffer: ENGINE.preserveDrawingBuffer,
    stencil: ENGINE.stencil,
  });
}

export function createScene(engine: Engine): Scene {
  return new Scene(engine);
}

export function createCamera(
  scene: Scene,
  canvas: HTMLCanvasElement,
  options?: CreateCameraOptions,
): ArcRotateCamera {
  const camera = new ArcRotateCamera(
    options?.name ?? CAMERA_MAIN.DEFAULT_NAME,
    CAMERA_MAIN.ALPHA,
    CAMERA_MAIN.BETA,
    options?.radius ?? CAMERA_MAIN.DEFAULT_RADIUS,
    Vector3.Zero(),
    scene,
  );

  if (options?.fov !== undefined) {
    camera.fov = options.fov;
  }
  if (options?.maxZ !== undefined) {
    camera.maxZ = options.maxZ;
  }

  camera.wheelPrecision = options?.wheelPrecision ?? CAMERA_MAIN.WHEEL_PRECISION;
  camera.minZ = options?.minZ ?? CAMERA_MAIN.MIN_Z;
  if (options?.pinchPrecision !== undefined) {
    camera.pinchPrecision = options.pinchPrecision;
  }
  camera.lowerRadiusLimit = options?.lowerRadiusLimit ?? CAMERA_MAIN.LOWER_RADIUS_LIMIT;
  camera.upperRadiusLimit = options?.upperRadiusLimit ?? CAMERA_MAIN.UPPER_RADIUS_LIMIT;

  if (options?.panningSensibility !== undefined) {
    camera.panningSensibility = options.panningSensibility;
  } else {
    camera.panningOriginTarget = Vector3.Zero();
    camera.panningDistanceLimit = CAMERA_MAIN.PANNING_DISTANCE_LIMIT;
  }

  if (options?.attachControl !== false) {
    camera.attachControl(canvas, true);
  }

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
  camera: ArcRotateCamera;
};

export function setupScene(canvas: HTMLCanvasElement): SceneContext {
  const engine = createEngine(canvas);
  const scene = createScene(engine);
  setupEnvironmentLighting(scene);
  const camera = createCamera(scene, canvas);
  createLights(scene);
  return { engine, scene, camera };
}
