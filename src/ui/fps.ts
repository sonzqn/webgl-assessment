/** DOM FPS readout using {@link Engine.getFps}. */

import type { Engine, Scene } from '@babylonjs/core';

export function initFpsDisplay(engine: Engine, scene: Scene, element: HTMLElement): void {
  const periodMs = 250;
  let last = 0;
  scene.onAfterRenderObservable.add(() => {
    const now = performance.now();
    if (now - last < periodMs) return;
    last = now;
    element.textContent = `${Math.round(engine.getFps())} FPS`;
  });
}
