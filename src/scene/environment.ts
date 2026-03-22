/** Scene IBL: prefiltered environment for PBR reflections and diffuse lighting. */

import { CubeTexture, Scene } from '@babylonjs/core';
import { ENVIRONMENT } from '../const';

export function setupEnvironmentLighting(scene: Scene): void {
  const env = CubeTexture.CreateFromPrefilteredData(ENVIRONMENT.PREFILTERED_ENV_URL, scene);
  scene.environmentTexture = env;
  scene.environmentIntensity = ENVIRONMENT.INTENSITY;
}
