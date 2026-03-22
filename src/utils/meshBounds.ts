/** World-space AABB helpers for meshes. */

import { Vector3, type AbstractMesh } from '@babylonjs/core';

export type MeshesWorldBounds = {
  min: Vector3;
  max: Vector3;
  center: Vector3;
};

/**
 * Returns world-space AABB min, max, and center for the given meshes.
 */
export function getMeshesWorldBounds(meshes: AbstractMesh[]): MeshesWorldBounds {
  if (meshes.length === 0) {
    const z = Vector3.Zero();
    return { min: z.clone(), max: z.clone(), center: z.clone() };
  }

  let minX = Infinity;
  let minY = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let maxZ = -Infinity;

  for (const mesh of meshes) {
    mesh.computeWorldMatrix(true);
    mesh.refreshBoundingInfo(false, false);
    const box = mesh.getBoundingInfo().boundingBox;
    for (const corner of box.vectorsWorld) {
      minX = Math.min(minX, corner.x);
      minY = Math.min(minY, corner.y);
      minZ = Math.min(minZ, corner.z);
      maxX = Math.max(maxX, corner.x);
      maxY = Math.max(maxY, corner.y);
      maxZ = Math.max(maxZ, corner.z);
    }
  }

  if (!Number.isFinite(minX) || !Number.isFinite(maxX)) {
    const z = Vector3.Zero();
    return { min: z.clone(), max: z.clone(), center: z.clone() };
  }

  const min = new Vector3(minX, minY, minZ);
  const max = new Vector3(maxX, maxY, maxZ);
  const center = new Vector3((minX + maxX) * 0.5, (minY + maxY) * 0.5, (minZ + maxZ) * 0.5);
  return { min, max, center };
}
