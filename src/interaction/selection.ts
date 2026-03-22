/** Mesh picking, highlight + outline; red pickable meshes only. */

import {
  AbstractMesh,
  HighlightLayer,
  Mesh,
  Scene,
  SelectionOutlineLayer,
  type Node,
} from '@babylonjs/core';
import { SELECTION } from '../const';
import { resolveComponentRoot } from '../model/componentRoot';

let clearSelectionRef: (() => void) | null = null;

export function clearSelection(): void {
  clearSelectionRef?.();
}

function getClientXY(evt: unknown): { x: number; y: number } {
  const pe = evt as PointerEvent;
  return {
    x: typeof pe?.clientX === 'number' ? pe.clientX : 0,
    y: typeof pe?.clientY === 'number' ? pe.clientY : 0,
  };
}

function createConfiguredHighlightLayer(scene: Scene): HighlightLayer {
  const layer = new HighlightLayer(SELECTION.HIGHLIGHT_LAYER_NAME, scene, {
    blurHorizontalSize: SELECTION.HIGHLIGHT_BLUR_HORIZONTAL,
    blurVerticalSize: SELECTION.HIGHLIGHT_BLUR_VERTICAL,
  });
  layer.innerGlow = false;
  layer.outerGlow = true;
  return layer;
}

function createConfiguredSelectionOutlineLayer(scene: Scene): SelectionOutlineLayer {
  const layer = new SelectionOutlineLayer(SELECTION.OUTLINE_LAYER_NAME, scene, {
    mainTextureSamples: SELECTION.OUTLINE_MAIN_TEXTURE_SAMPLES,
  });
  layer.outlineColor = SELECTION.HIGHLIGHT_COLOR_RGB.clone();
  layer.outlineThickness = SELECTION.OUTLINE_THICKNESS;
  return layer;
}

function setHighlightSelection(highlightLayer: HighlightLayer, meshes: AbstractMesh[]): void {
  highlightLayer.removeAllMeshes();
  const color = SELECTION.HIGHLIGHT_COLOR_RGB.clone();
  for (const m of meshes) {
    if (m instanceof Mesh) highlightLayer.addMesh(m, color);
  }
}

function applyOutlineIntensity(outlineLayer: SelectionOutlineLayer, meshes: AbstractMesh[]): void {
  for (const m of meshes) outlineLayer.setEffectIntensity(m, 1);
}

function subscribeHighlightPulse(
  scene: Scene,
  highlightLayer: HighlightLayer,
  getSelectedMeshes: () => AbstractMesh[],
): void {
  scene.onBeforeRenderObservable.add(() => {
    if (getSelectedMeshes().length === 0) return;
    const t = (performance.now() / 1000) * Math.PI * 2 * SELECTION.PULSE_HZ;
    const intensity =
      SELECTION.PULSE_MIN + (SELECTION.PULSE_MAX - SELECTION.PULSE_MIN) * (0.5 + 0.5 * Math.sin(t));
    highlightLayer.blurHorizontalSize = SELECTION.HIGHLIGHT_BLUR_HORIZONTAL * intensity;
    highlightLayer.blurVerticalSize = SELECTION.HIGHLIGHT_BLUR_VERTICAL * intensity;
  });
}

function getComponentMeshes(root: Node): AbstractMesh[] {
  const list: AbstractMesh[] = [];
  if (root instanceof AbstractMesh) list.push(root);
  list.push(...root.getChildMeshes(false));
  return list;
}

type PendingSelection = {
  startX: number;
  startY: number;
  wasDragged: boolean;
  target: import('@babylonjs/core').Nullable<AbstractMesh>;
};

function attachSelectionHoverCursor(
  scene: Scene,
  canvas: HTMLCanvasElement | null,
): (evt: unknown) => void {
  const updateHoverCursor = (evt: unknown): void => {
    if (!canvas) return;
    const pe = evt as PointerEvent;
    if (typeof pe.buttons === 'number' && pe.buttons !== 0) {
      canvas.style.cursor = '';
      return;
    }
    const pick = scene.pick(scene.pointerX, scene.pointerY);
    canvas.style.cursor = pick.hit ? 'pointer' : '';
  };

  canvas?.addEventListener('pointerleave', () => {
    canvas.style.cursor = '';
  });

  return updateHoverCursor;
}

type SelectionPointerDeps = {
  highlightLayer: HighlightLayer;
  outlineLayer: SelectionOutlineLayer;
  selectedMeshes: AbstractMesh[];
  updateHoverCursor: (evt: unknown) => void;
};

function attachSelectionPointerHandlers(scene: Scene, deps: SelectionPointerDeps): void {
  let pendingSelection: PendingSelection | null = null;

  scene.onPointerDown = (evt, pickInfo) => {
    const pickedMesh = pickInfo?.hit ? pickInfo.pickedMesh : null;
    if (!pickedMesh) return;

    const target = pickedMesh;
    if (deps.selectedMeshes.includes(target)) return;

    const pe = evt as PointerEvent;
    if (typeof pe?.button === 'number' && pe.button !== 0) return;

    const { x, y } = getClientXY(evt);

    pendingSelection = {
      startX: x,
      startY: y,
      wasDragged: false,
      target,
    };
  };

  scene.onPointerMove = (evt) => {
    if (pendingSelection?.target && !pendingSelection.wasDragged) {
      const { x, y } = getClientXY(evt);
      const dx = x - pendingSelection.startX;
      const dy = y - pendingSelection.startY;
      if (
        dx * dx + dy * dy >
        SELECTION.CLICK_DRAG_THRESHOLD_PX * SELECTION.CLICK_DRAG_THRESHOLD_PX
      ) {
        pendingSelection.wasDragged = true;
      }
    }
    deps.updateHoverCursor(evt);
  };

  scene.onPointerUp = (evt) => {
    if (!pendingSelection?.target || pendingSelection.wasDragged) {
      pendingSelection = null;
      deps.updateHoverCursor(evt);
      return;
    }

    const target = pendingSelection.target;
    pendingSelection = null;

    const root = resolveComponentRoot(target);
    const meshesToOutline = getComponentMeshes(root);

    deps.outlineLayer.clearSelection();
    deps.highlightLayer.removeAllMeshes();
    deps.selectedMeshes.length = 0;
    deps.selectedMeshes.push(...meshesToOutline);
    if (deps.selectedMeshes.length > 0) {
      deps.outlineLayer.addSelection(deps.selectedMeshes);
      applyOutlineIntensity(deps.outlineLayer, deps.selectedMeshes);
      setHighlightSelection(deps.highlightLayer, deps.selectedMeshes);
    }

    deps.updateHoverCursor(evt);
  };
}

export function setupSelection(scene: Scene): void {
  const highlightLayer = createConfiguredHighlightLayer(scene);
  const outlineLayer = createConfiguredSelectionOutlineLayer(scene);

  const selectedMeshes: AbstractMesh[] = [];

  clearSelectionRef = () => {
    outlineLayer.clearSelection();
    highlightLayer.removeAllMeshes();
    selectedMeshes.length = 0;
  };

  subscribeHighlightPulse(scene, highlightLayer, () => selectedMeshes);

  const canvas = scene.getEngine().getRenderingCanvas() as HTMLCanvasElement | null;
  const updateHoverCursor = attachSelectionHoverCursor(scene, canvas);

  attachSelectionPointerHandlers(scene, {
    highlightLayer,
    outlineLayer,
    selectedMeshes,
    updateHoverCursor,
  });
}
