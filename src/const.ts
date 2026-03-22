import { Color3, Vector3 } from '@babylonjs/core';

const publicBase = import.meta.env.BASE_URL;

export const APP = {
  CANVAS_ID: 'renderCanvas',
  LOADING_ID: 'loading',
  FPS_ID: 'fps',
  PARTS_JSON_URL: `${publicBase}parts.json`,
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
  PREFILTERED_ENV_URL: `${publicBase}environmentSpecular.env`,
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
  BASE_URL: publicBase,
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

export const MODAL = {
  PANEL_ID: 'modal-panel',
  PART_NAME_ID: 'modal-part-name',
  DESCRIPTION_ID: 'modal-description',
  ATTRIBUTES_ID: 'modal-attributes',
  PREVIEW_SLOT_ID: 'modal-preview-slot',
  CLOSE_BUTTON_ID: 'modal-close',
} as const;

export const MODAL_PREVIEW = {
  AUTO_ROTATE_SPEED: 0.3,
  MESHES_DEEP: false,
  CANVAS_ID: 'modal-part-preview-canvas',
  CANVAS_STYLE: {
    width: '100%',
    height: '100%',
    display: 'block',
    borderRadius: '6px',
    boxSizing: 'border-box',
  } as const,
  FLOATING_CANVAS_STYLE: {
    position: 'fixed',
    pointerEvents: 'auto',
    zIndex: '4',
    display: 'none',
  } as const,
  ENGINE_ANTIALIAS: true,
  ENGINE_OPTIONS: {
    preserveDrawingBuffer: true,
    stencil: false,
    antialias: true,
  } as const,
  HARDWARE_SCALING_LEVEL: 1,
  CAMERA_OPTIONS: {
    name: 'modalPreviewCam',
    radius: 2.5,
    fov: 0.88,
    minZ: 0.001,
    maxZ: 100000,
    wheelPrecision: 80,
    pinchPrecision: 80,
    lowerRadiusLimit: 0.2,
    upperRadiusLimit: 20,
    panningSensibility: 0,
  } as const,
  RESIZE_MIN_DIMENSION: 2,
  LAYOUT_SLOT_MIN: 2,
  LAYOUT_HOST_MAX_FRACTION: 0.95,
  LAYOUT_MIN_SIDE_PX: 8,
  CENTER_EPSILON_SQ: 1e-10,
  TAN_HALF_FOV_FLOOR: 1e-4,
  FRAMING_MARGIN: 1.38,
  MIN_ORBIT_RADIUS: 0.55,
  ZOOM_LOWER_RADIUS_FACTOR: 0.45,
  ZOOM_UPPER_RADIUS_FACTOR: 2.75,
  NODE_SPIN: 'modalPreviewSpin',
  NODE_CONTENT: 'modalPreviewContent',
  CLONE_NAME_SUFFIX: '_clone',
  DEFAULT_FRAME_DT: 1 / 60,
  PREVIEW_MAX_FPS_WHEN_IDLE: 30,
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
