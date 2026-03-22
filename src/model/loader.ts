/** Model loading: import GLB from public folder*/

import '@babylonjs/loaders/glTF';
import { ImportMeshAsync, Scene, type AbstractMesh } from '@babylonjs/core';
import { MODEL } from '../const';
import { getMeshesWorldBounds } from '../utils/meshBounds';
import { applyRedComponentPickability } from './redComponents';

let modelBinaryPromise: Promise<ArrayBuffer> | null = null;

export function preloadModelBinary(): Promise<ArrayBuffer> {
  if (!modelBinaryPromise) {
    modelBinaryPromise = fetch(`${MODEL.BASE_URL}${MODEL.FILE}`).then((r) => {
      if (!r.ok) throw new Error(`Failed to load model: ${r.status} ${r.statusText}`);
      return r.arrayBuffer();
    });
  }
  return modelBinaryPromise;
}

/** Translate meshes so the combined world AABB center is at the scene origin. */
function centerMeshesAtBoundingBoxOrigin(meshes: AbstractMesh[]): void {
  const { center: boxCenter } = getMeshesWorldBounds(meshes);
  for (const m of meshes) {
    const abs = m.getAbsolutePosition();
    m.setAbsolutePosition(abs.subtract(boxCenter));
  }
}

function modelFilePluginExtension(): string {
  const dot = MODEL.FILE.lastIndexOf('.');
  return dot >= 0 ? MODEL.FILE.slice(dot).toLowerCase() : '.glb';
}

async function importModelMeshesFromBuffer(scene: Scene, data: ArrayBuffer): Promise<AbstractMesh[]> {
  const result = await ImportMeshAsync(new Uint8Array(data), scene, {
    meshNames: '',
    rootUrl: MODEL.BASE_URL,
    name: MODEL.FILE,
    pluginExtension: modelFilePluginExtension(),
  });
  return result.meshes.filter((m) => m.getTotalVertices() > 0);
}

export async function loadModel(scene: Scene): Promise<AbstractMesh[]> {
  const data = await preloadModelBinary();
  const meshes = await importModelMeshesFromBuffer(scene, data);
  centerMeshesAtBoundingBoxOrigin(meshes);
  applyRedComponentPickability(meshes);
  return meshes;
}
