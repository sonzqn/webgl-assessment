import type { AbstractMesh, Node } from '@babylonjs/core';
import { NAMING } from '../const';

/**
 * If the user picked a single primitive mesh, find the parent
 * node so the whole component can be highlighted.
 */
export function resolveComponentRoot(selected: AbstractMesh): Node {
  let node: Node = selected;
  while (NAMING.GLTF_PRIMITIVE_SUFFIX.test(node.name) && node.parent) {
    node = node.parent;
  }
  return node;
}
