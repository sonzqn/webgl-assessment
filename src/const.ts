import { Color3, Vector3 } from '@babylonjs/core';

export const APP = {
  CANVAS_ID: 'renderCanvas',
  LOADING_ID: 'loading',
  FPS_ID: 'fps',
  HIDDEN_CLASS: 'hidden',
  LOAD_ERROR_MESSAGE: 'Failed to load. See console.',
} as const;

export const CAMERA_MAIN = {
  DEFAULT_NAME: 'camera',
  /** Radians — 45° yaw - diagonal view*/
  ALPHA: Math.PI / 4,
  /** 90° - ~35.264° from horizontal (arcsin(1/√3)) - isometric-style polar angle*/
  BETA: Math.PI / 2 - Math.asin(1 / Math.sqrt(3)),
  DEFAULT_RADIUS: 6,
  WHEEL_PRECISION: 50,
  MIN_Z: 0.1,
  LOWER_RADIUS_LIMIT: 3,
  UPPER_RADIUS_LIMIT: 15,
  PANNING_DISTANCE_LIMIT: 10,
} as const;

export const ENGINE = {
  preserveDrawingBuffer: true,
  stencil: true,
} as const;

/** Image-based lighting: prefiltered `.env` in `public/`.*/
export const ENVIRONMENT = {
  PREFILTERED_ENV_URL: '/environmentSpecular.env',
  /** Scales IBL diffuse + specular; tune against {@link LIGHTS}. */
  INTENSITY: 0.85,
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
  FILL_NAME: 'fillLight',
  FILL_DIRECTION: new Vector3(1, -0.55, -0.45).normalize(),
  FILL_INTENSITY: 0.32,
  FILL_POSITION: new Vector3(-4, 6, 4),
  RIM_NAME: 'rimLight',
  RIM_DIRECTION: new Vector3(0.85, -0.15, 0.92).normalize(),
  RIM_INTENSITY: 0.85,
  RIM_DIFFUSE: new Color3(0.55, 0.78, 1),
  RIM_SPECULAR: new Color3(0.5, 0.75, 0.98),
  RIM_POSITION: new Vector3(-7, 5, -6),
} as const;

export const MODEL = {
  BASE_URL: '/',
  FILE: 'Falcon FG FGX Chassis Full.glb',
} as const;

export const SELECTION = {
  CLICK_DRAG_THRESHOLD_PX: 6,
  HIGHLIGHT_COLOR_RGB: new Color3(0.2, 0.6, 1),
  PULSE_MIN: 0.5,
  PULSE_MAX: 1,
  PULSE_HZ: 0.5,
  HIGHLIGHT_LAYER_NAME: 'selectionHighlight',
  HIGHLIGHT_BLUR_HORIZONTAL: 0.75,
  HIGHLIGHT_BLUR_VERTICAL: 0.75,
  OUTLINE_LAYER_NAME: 'selectionOutline',
  /** MSAA samples on the outline render target (1 = off; 4 ≈ antialiased like the sample). */
  OUTLINE_MAIN_TEXTURE_SAMPLES: 1,
  OUTLINE_THICKNESS: 1,
} as const;

export const RED_MATERIAL = {
  /** Below this max RGB channel, surface treated as black / non-red */
  MAX_CHANNEL_FOR_BLACK: 0.03,
  /** Normalized g/b must be below this when r dominates */
  CHANNEL_DOMINANCE_MAX: 0.2,
} as const;

export const NAMING = {
  GLTF_PRIMITIVE_SUFFIX: /_primitive\d+$/i,
  /** Strip trailing `.001`-style suffix (parts lookup). */
  DUPLICATE_SUFFIX: /\.\d+$/,
  /** Remove any `.digits` segments in display names (deriveNameFromRoot). */
  DUPLICATE_SEGMENTS_GLOBAL: /\.\d+/g,
} as const;
