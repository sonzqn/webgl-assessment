import {
  Color3,
  InstancedMesh,
  Mesh,
  MultiMaterial,
  PBRMaterial,
  type AbstractMesh,
  type Material,
  type Nullable,
} from '@babylonjs/core';
import { RED_MATERIAL } from '../const';

/**
 * True when base color is red-dominant: `r` strictly dominates both `g` and `b`.
 * (e.g. maroon / desaturated red paint). No yellow-specific logic.
 */
function isRedSurfaceColor(c: Color3): boolean {
  const { r, g, b } = c;

  // find max value
  const max = Math.max(r, g, b);

  // if max too close to 0 (black), return false
  if (max < RED_MATERIAL.MAX_CHANNEL_FOR_BLACK) return false;

  // max component normalization
  const mcn = new Color3(r / max, g / max, b / max);
  return mcn.g < RED_MATERIAL.CHANNEL_DOMINANCE_MAX && mcn.b < RED_MATERIAL.CHANNEL_DOMINANCE_MAX;
}

function materialBaseColorIsRed(mat: Nullable<Material>): boolean {
  if (!mat) return false;

  if (mat instanceof MultiMaterial) {
    return (mat.subMaterials ?? []).some((sm) => materialBaseColorIsRed(sm ?? null));
  }

  if (mat instanceof PBRMaterial) {
    const isRed = isRedSurfaceColor(mat.albedoColor);
    if (isRed) mat.needDepthPrePass = true;
    return isRed;
  }

  return false;
}

function primaryMaterial(mesh: AbstractMesh): Nullable<Material> {
  if (mesh instanceof Mesh) return mesh.material;
  if (mesh instanceof InstancedMesh) return mesh.sourceMesh.material;
  return null;
}

export function meshIsRedComponent(mesh: AbstractMesh): boolean {
  if (mesh.getTotalVertices() <= 0) return false;
  return materialBaseColorIsRed(primaryMaterial(mesh));
}

/**
 * Only meshes whose material base color (PBR albedo / Standard diffuse) reads as red
 * stay pickable; others are not pickable so rays can reach red parts behind gray shells.
 */
export function applyRedComponentPickability(meshes: AbstractMesh[]): void {
  const flags = meshes.map((m) => meshIsRedComponent(m));
  for (let i = 0; i < meshes.length; i++) {
    const mesh = meshes[i]!;
    mesh.isPickable = flags[i]!;
  }
}
