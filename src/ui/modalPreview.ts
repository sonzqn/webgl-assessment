import '@babylonjs/loaders/glTF';
import {
  AbstractMesh,
  ArcRotateCamera,
  Engine,
  Node,
  Quaternion,
  Scene,
  TransformNode,
  Vector3,
  type Nullable,
} from '@babylonjs/core';
import { MODAL_PREVIEW } from '../const';
import { loadPreviewTemplateMeshes } from '../model/loader';
import { setupEnvironmentLighting } from '../scene/environment';
import { createCamera, createLights } from '../scene/setup';
import { getMeshesWorldBounds } from '../utils/meshBounds';

let previewEngine: Nullable<Engine> = null;
let previewScene: Nullable<Scene> = null;
let previewCamera: Nullable<ArcRotateCamera> = null;
let previewCanvas: Nullable<HTMLCanvasElement> = null;
let previewRoot: Nullable<TransformNode> = null;
let layoutHostCanvas: Nullable<HTMLCanvasElement> = null;
let layoutHostEngine: Nullable<Engine> = null;
let previewContainer: Nullable<HTMLElement> = null;
let resizeObserver: Nullable<ResizeObserver> = null;
let previewVisible = false;
let userHasInteracted = false;

let lastPreviewFrameTime = 0;
let lastPreviewGpuRenderTimeMs = 0;
let previewModelMeshes: AbstractMesh[] = [];
let loadPreviewModelPromise: Promise<void> | null = null;

function collectNodeNames(root: Node): Set<string> {
  const names = new Set<string>();
  const stack: Node[] = [root];
  while (stack.length) {
    const n = stack.pop()!;
    names.add(n.name);
    for (const c of n.getChildren()) stack.push(c);
  }
  return names;
}

function disposePreviewRootTree(): void {
  if (!previewRoot) return;
  const root = previewRoot;
  previewRoot = null;
  root.dispose(false, false);
}

function resizePreviewToContainer(): void {
  if (!previewContainer || !previewEngine) return;
  const w = previewContainer.clientWidth;
  const h = previewContainer.clientHeight;
  if (w < MODAL_PREVIEW.RESIZE_MIN_DIMENSION || h < MODAL_PREVIEW.RESIZE_MIN_DIMENSION) return;
  const dpr = window.devicePixelRatio ?? 1;
  previewEngine.setSize(Math.floor(w * dpr), Math.floor(h * dpr));
}

type PreviewLayoutSlot = { left: number; top: number; width: number; height: number };

type FloatingPreviewLayout = {
  left: number;
  top: number;
  width: number;
  height: number;
  bufW: number;
  bufH: number;
};

function computeFloatingPreviewLayout(
  slot: PreviewLayoutSlot,
  hostRect: DOMRect,
  rw: number,
  rh: number,
): FloatingPreviewLayout | null {
  if (rw <= 0 || rh <= 0) return null;

  const sw = slot.width;
  const sh = slot.height;
  if (
    !Number.isFinite(sw) ||
    !Number.isFinite(sh) ||
    sw < MODAL_PREVIEW.LAYOUT_SLOT_MIN ||
    sh < MODAL_PREVIEW.LAYOUT_SLOT_MIN
  ) {
    return null;
  }

  const sx = hostRect.width / rw;
  const sy = hostRect.height / rh;

  const slotWcss = sw * sx;
  const slotHcss = sh * sy;
  let side = Math.min(slotWcss, slotHcss);
  side = Math.min(
    side,
    hostRect.width * MODAL_PREVIEW.LAYOUT_HOST_MAX_FRACTION,
    hostRect.height * MODAL_PREVIEW.LAYOUT_HOST_MAX_FRACTION,
  );

  if (side < MODAL_PREVIEW.LAYOUT_MIN_SIDE_PX) return null;

  const offsetX = (slotWcss - side) * 0.5;
  const offsetY = (slotHcss - side) * 0.5;

  const dpr = window.devicePixelRatio ?? 1;
  const bufW = Math.max(MODAL_PREVIEW.RESIZE_MIN_DIMENSION, Math.floor(side * dpr));
  const bufH = Math.max(MODAL_PREVIEW.RESIZE_MIN_DIMENSION, Math.floor(side * dpr));

  return {
    left: hostRect.left + slot.left * sx + offsetX,
    top: hostRect.top + slot.top * sy + offsetY,
    width: side,
    height: side,
    bufW,
    bufH,
  };
}

function applyFloatingPreviewDimensions(
  engine: Engine,
  canvas: HTMLCanvasElement,
  layout: FloatingPreviewLayout,
): void {
  canvas.style.display = 'block';
  canvas.style.left = `${Math.round(layout.left)}px`;
  canvas.style.top = `${Math.round(layout.top)}px`;
  canvas.style.width = `${Math.round(layout.width)}px`;
  canvas.style.height = `${Math.round(layout.height)}px`;

  if (canvas.width !== layout.bufW || canvas.height !== layout.bufH) {
    engine.setHardwareScalingLevel(MODAL_PREVIEW.HARDWARE_SCALING_LEVEL);
    engine.setSize(layout.bufW, layout.bufH);
  }
}

function createPreviewDomCanvas(container: HTMLElement | null): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.id = MODAL_PREVIEW.CANVAS_ID;
  Object.assign(canvas.style, MODAL_PREVIEW.CANVAS_STYLE);

  if (container) {
    container.appendChild(canvas);
  } else {
    Object.assign(canvas.style, MODAL_PREVIEW.FLOATING_CANVAS_STYLE);
    document.body.appendChild(canvas);
  }
  return canvas;
}

function createPreviewEngineAndScene(canvas: HTMLCanvasElement): void {
  previewEngine = new Engine(canvas, MODAL_PREVIEW.ENGINE_ANTIALIAS, {
    ...MODAL_PREVIEW.ENGINE_OPTIONS,
  });
  previewEngine.setHardwareScalingLevel(MODAL_PREVIEW.HARDWARE_SCALING_LEVEL);

  previewScene = new Scene(previewEngine);
  setupEnvironmentLighting(previewScene);

  previewCamera = createCamera(previewScene, canvas, { ...MODAL_PREVIEW.CAMERA_OPTIONS });
  createLights(previewScene, previewCamera);
}

function attachPreviewUserInteraction(canvas: HTMLCanvasElement): void {
  const onUserInteract = (): void => {
    userHasInteracted = true;
  };
  canvas.addEventListener('pointerdown', onUserInteract);
  canvas.addEventListener('wheel', onUserInteract, { passive: true });
}

function attachPreviewResizeObserver(container: HTMLElement): void {
  resizePreviewToContainer();
  resizeObserver = new ResizeObserver(() => resizePreviewToContainer());
  resizeObserver.observe(container);
}

export function initModalPreview(
  hostCanvas: HTMLCanvasElement,
  hostEngine: Engine,
  webUIContainer?: HTMLElement,
): void {
  if (previewEngine) return;

  layoutHostCanvas = hostCanvas;
  layoutHostEngine = hostEngine;
  previewContainer = webUIContainer ?? null;

  const canvas = createPreviewDomCanvas(previewContainer);
  previewCanvas = canvas;

  createPreviewEngineAndScene(canvas);
  attachPreviewUserInteraction(canvas);

  if (previewContainer) {
    attachPreviewResizeObserver(previewContainer);
  }
}

export async function loadPreviewModel(): Promise<void> {
  if (loadPreviewModelPromise) return loadPreviewModelPromise;
  if (!previewScene) return;

  loadPreviewModelPromise = (async () => {
    previewModelMeshes = await loadPreviewTemplateMeshes(previewScene!);
  })();
  return loadPreviewModelPromise;
}

function layoutPreviewInContainer(): void {
  if (!previewCanvas || !previewEngine) return;
  previewVisible = true;
  previewCanvas.style.display = 'block';
  resizePreviewToContainer();
}

function layoutPreviewFloatingOverHost(slot: PreviewLayoutSlot): void {
  if (!previewCanvas || !previewEngine || !layoutHostCanvas || !layoutHostEngine) return;

  const hostRect = layoutHostCanvas.getBoundingClientRect();
  const rw = layoutHostEngine.getRenderWidth(true);
  const rh = layoutHostEngine.getRenderHeight(true);
  const layout = computeFloatingPreviewLayout(slot, hostRect, rw, rh);
  if (!layout) {
    previewCanvas.style.display = 'none';
    return;
  }

  previewVisible = true;
  applyFloatingPreviewDimensions(previewEngine, previewCanvas, layout);
}

export function syncModalPreviewLayout(
  visible: boolean,
  slot: { left: number; top: number; width: number; height: number } | null,
  opacity = 1,
): void {
  previewVisible = false;
  if (!previewCanvas || !previewEngine) return;

  if (!visible) {
    previewCanvas.style.display = 'none';
    return;
  }

  previewCanvas.style.opacity = String(Math.max(0, Math.min(1, opacity)));

  if (previewContainer) {
    layoutPreviewInContainer();
    return;
  }

  if (!layoutHostCanvas || !layoutHostEngine || !slot) {
    previewCanvas.style.display = 'none';
    return;
  }

  layoutPreviewFloatingOverHost(slot);
}

function buildPreviewCloneTree(
  rootNode: Node,
  scene: Scene,
  sourceMeshes: AbstractMesh[],
): { spin: TransformNode; content: TransformNode } {
  const names = collectNodeNames(rootNode);
  const scale = new Vector3();
  const rot = new Quaternion();
  const pos = new Vector3();

  const spin = new TransformNode(MODAL_PREVIEW.NODE_SPIN, scene);
  const content = new TransformNode(MODAL_PREVIEW.NODE_CONTENT, scene);
  content.parent = spin;
  previewRoot = spin;

  for (const mesh of sourceMeshes) {
    if (names.has(mesh.name)) {
      const clone = mesh.clone(
        mesh.name + MODAL_PREVIEW.CLONE_NAME_SUFFIX,
        content,
      ) as AbstractMesh;
      clone.setEnabled(true);
      if (clone.material) clone.material.needDepthPrePass = true;
      clone.computeWorldMatrix(true);
      const wm = mesh.getWorldMatrix();
      wm.decompose(scale, rot, pos);
      clone.scaling.copyFrom(scale);
      clone.rotationQuaternion = rot.clone();
      clone.position.copyFrom(pos);
      clone.parent = content;
    }
  }

  return { spin, content };
}

function normalizePreviewContent(content: TransformNode): void {
  content.computeWorldMatrix(true);
  let centerW = getMeshesWorldBounds(content.getChildMeshes(MODAL_PREVIEW.MESHES_DEEP)).center;
  for (const mesh of content.getChildMeshes(MODAL_PREVIEW.MESHES_DEEP)) {
    mesh.position.subtractInPlace(centerW);
  }

  content.computeWorldMatrix(true);
  content.normalizeToUnitCube(true, false);

  content.computeWorldMatrix(true);
  centerW = getMeshesWorldBounds(content.getChildMeshes(MODAL_PREVIEW.MESHES_DEEP)).center;
  if (
    centerW.lengthSquared() > MODAL_PREVIEW.CENTER_EPSILON_SQ &&
    Number.isFinite(centerW.x) &&
    Number.isFinite(centerW.y) &&
    Number.isFinite(centerW.z)
  ) {
    content.position.subtractInPlace(centerW);
  }

  content.computeWorldMatrix(true);
}

function fitOrbitCameraToContent(camera: ArcRotateCamera, content: TransformNode): void {
  const { min, max } = content.getHierarchyBoundingVectors(true);
  const extent = Vector3.Distance(min, max);
  const boundRadius = extent * 0.5;
  const halfFov = camera.fov * 0.5;
  const tanHalf = Math.max(Math.tan(halfFov), MODAL_PREVIEW.TAN_HALF_FOV_FLOOR);
  const margin = MODAL_PREVIEW.FRAMING_MARGIN;
  const orbitRadius = Math.max(
    MODAL_PREVIEW.MIN_ORBIT_RADIUS,
    (boundRadius * margin) / tanHalf,
  );
  const closestRadius = orbitRadius * MODAL_PREVIEW.ZOOM_LOWER_RADIUS_FACTOR;
  const farthestRadius = orbitRadius * MODAL_PREVIEW.ZOOM_UPPER_RADIUS_FACTOR;
  camera.lowerRadiusLimit = closestRadius;
  camera.upperRadiusLimit = farthestRadius;
  camera.radius = Math.min(
    camera.upperRadiusLimit,
    Math.max(closestRadius, orbitRadius),
  );
}

let previewUpdateChain: Promise<void> = Promise.resolve();

async function updateModalPreviewRootNodeImpl(rootNode: Node): Promise<void> {
  if (!previewScene || !previewCamera) return;

  userHasInteracted = false;
  lastPreviewFrameTime = 0;
  lastPreviewGpuRenderTimeMs = 0;

  await loadPreviewModel();
  if (previewModelMeshes.length === 0) return;

  disposePreviewRootTree();

  const { spin, content } = buildPreviewCloneTree(
    rootNode,
    previewScene,
    previewModelMeshes,
  );
  normalizePreviewContent(content);
  fitOrbitCameraToContent(previewCamera, content);

  spin.position.copyFromFloats(0, 0, 0);
  spin.rotationQuaternion = null;
  spin.rotation.copyFromFloats(0, 0, 0);
  spin.scaling.copyFromFloats(1, 1, 1);
}

export function updateModalPreviewRootNode(rootNode: Node): Promise<void> {
  const op = updateModalPreviewRootNodeImpl(rootNode);
  previewUpdateChain = previewUpdateChain.then(
    () => op,
    () => op,
  );
  return op;
}

export function canDrawModalPreview(): boolean {
  return previewRoot != null && previewRoot.getChildMeshes(MODAL_PREVIEW.MESHES_DEEP).length > 0;
}

export function renderModalPreviewFrame(): void {
  if (!previewVisible || !previewScene || !previewEngine || !canDrawModalPreview()) return;

  if (previewRoot && !userHasInteracted) {
    const t = performance.now() / 1000;
    const dt = lastPreviewFrameTime > 0 ? t - lastPreviewFrameTime : MODAL_PREVIEW.DEFAULT_FRAME_DT;
    lastPreviewFrameTime = t;
    previewRoot.rotation.y += MODAL_PREVIEW.AUTO_ROTATE_SPEED * dt;

    const cap = MODAL_PREVIEW.PREVIEW_MAX_FPS_WHEN_IDLE;
    if (cap > 0) {
      const nowMs = performance.now();
      const minIntervalMs = 1000 / cap;
      if (nowMs - lastPreviewGpuRenderTimeMs < minIntervalMs) return;
    }
  } else {
    lastPreviewFrameTime = performance.now() / 1000;
  }

  lastPreviewGpuRenderTimeMs = performance.now();
  previewScene.render();
}

export function hideModalPreview(): void {
  previewVisible = false;
  if (previewCanvas) previewCanvas.style.display = 'none';
}
