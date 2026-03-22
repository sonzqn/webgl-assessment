/** Web UI modal: Displays part info and a 3D preview scene. */

import { AbstractMesh, Engine, type Node, type Scene, type Vector3 } from '@babylonjs/core';
import { MODAL } from '../const';
import type { PartInfo } from '../data/parts';
import { clearSelection } from '../interaction/selection';
import {
  canDrawModalPreview,
  hideModalPreview,
  initModalPreview,
  renderModalPreviewFrame,
  syncModalPreviewLayout,
  updateModalPreviewRootNode,
} from './modalPreview';

let initialized = false;

let modalPanel: HTMLElement | null = null;
let partNameEl: HTMLElement | null = null;
let descriptionEl: HTMLElement | null = null;
let attributesEl: HTMLElement | null = null;
let previewSlot: HTMLElement | null = null;

function fillAttributesList(part: PartInfo): void {
  if (!attributesEl) return;
  attributesEl.replaceChildren();
  const entries = Object.entries(part.attributes ?? {});
  for (const [k, v] of entries) {
    const dt = document.createElement('dt');
    dt.textContent = k;
    const dd = document.createElement('dd');
    dd.textContent = v;
    attributesEl.append(dt, dd);
  }
}

function setModalText(part: PartInfo): void {
  if (!partNameEl || !descriptionEl || !attributesEl) return;
  partNameEl.textContent = part.name;
  descriptionEl.textContent = part.description;
  fillAttributesList(part);
}

export function initModal(scene: Scene, _camera: unknown): void {
  if (initialized) return;
  initialized = true;

  modalPanel = document.getElementById(MODAL.PANEL_ID);
  partNameEl = document.getElementById(MODAL.PART_NAME_ID);
  descriptionEl = document.getElementById(MODAL.DESCRIPTION_ID);
  attributesEl = document.getElementById(MODAL.ATTRIBUTES_ID);
  previewSlot = document.getElementById(MODAL.PREVIEW_SLOT_ID);

  const hostCanvas = scene.getEngine().getRenderingCanvas() as HTMLCanvasElement | null;
  if (hostCanvas && previewSlot) {
    initModalPreview(
      hostCanvas,
      scene.getEngine() as Engine,
      previewSlot,
    );
  } else if (hostCanvas) {
    initModalPreview(hostCanvas, scene.getEngine() as Engine);
  }

  const closeBtn = document.getElementById(MODAL.CLOSE_BUTTON_ID);
  if (closeBtn) closeBtn.addEventListener('click', hidePartModal);

  scene.onAfterRenderObservable.add(() => {
    if (!modalPanel || !previewSlot) return;
    const visible = modalPanel.classList.contains('visible');
    if (visible && canDrawModalPreview()) {
      const rect = previewSlot.getBoundingClientRect();
      syncModalPreviewLayout(
        visible,
        { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
        1,
      );
      renderModalPreviewFrame();
    }
  });
}

export function showPartModal(
  part: PartInfo,
  rootNode: Node,
  _selectedMesh: AbstractMesh,
  _pickedPoint: Vector3 | null,
): void {
  if (!modalPanel || !partNameEl || !descriptionEl || !attributesEl) return;

  setModalText(part);

  modalPanel.classList.add('visible');
  modalPanel.setAttribute('aria-hidden', 'false');

  updateModalPreviewRootNode(rootNode);
}

export function hidePartModal(): void {
  if (!modalPanel) return;

  modalPanel.classList.remove('visible');
  modalPanel.setAttribute('aria-hidden', 'true');
  hideModalPreview();
  clearSelection();
}
