import { NAMING } from '../const';

export interface PartInfo {
  id: string;
  name: string;
  description: string;
  attributes: Record<string, string>;
}

export interface PartsData {
  parts: PartInfo[];
}

/** Parts indexed by id (matches mesh/root node names from the 3D model). */
let partsById: Map<string, PartInfo> = new Map();

export function setPartsData(data: PartsData): void {
  partsById = new Map();
  for (const part of data.parts) {
    partsById.set(part.id, part);
  }
}

/** Normalize mesh name by stripping duplicate suffix (e.g. .001, .002). */
function stripDuplicateSuffix(name: string): string {
  return name.replace(NAMING.DUPLICATE_SUFFIX, '');
}

/** Look up root node name. */
export function getPartByRootName(rootName: string): PartInfo | undefined {
  return partsById.get(stripDuplicateSuffix(rootName));
}

/**
 * Resolved part from `parts.json`.
 */
export function getPartByRootNameOrFallback(rootName: string): PartInfo {
  return (
    getPartByRootName(rootName) ?? {
      id: rootName,
      name: rootName,
      description: '',
      attributes: {},
    }
  );
}
