import { Color3, Vector3 } from '@babylonjs/core';

export const APP = {
  CANVAS_ID: 'renderCanvas',
  LOADING_ID: 'loading',
  HIDDEN_CLASS: 'hidden',
} as const;

export const CAMERA_MAIN = {
  DEFAULT_NAME: 'camera',
  MIN_Z: 0.1,
} as const;

export const ENGINE = {
  preserveDrawingBuffer: true,
  stencil: true,
} as const;

export const LIGHTS = {
  HEMI_NAME: 'hemi',
  HEMI_DIRECTION: new Vector3(0, 1, 0),
  HEMI_INTENSITY: 0.55,
  HEMI_GROUND_COLOR: new Color3(0.28, 0.28, 0.32),
  KEY_NAME: 'keyLight',
  KEY_DIRECTION: new Vector3(-1.35, -1.1, -0.35).normalize(),
  KEY_INTENSITY: 2.35,
  KEY_DIFFUSE: new Color3(1, 0.9, 0.72),
  KEY_SPECULAR: new Color3(1, 0.92, 0.8),
  KEY_POSITION: new Vector3(6, 9, 5),
} as const;
