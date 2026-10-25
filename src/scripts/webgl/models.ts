import type { BufferGeometry, Mesh } from 'three';
import { Float32BufferAttribute } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

/** The meshes of a glTF model, keyed by the object names given in Blender. */
export type ModelGeometries = ReadonlyMap<string, BufferGeometry>;

let loader: GLTFLoader | undefined;

/** Loads a meshopt-compressed model built by `blender/build_models.py`. */
export async function loadGeometries(url: string): Promise<ModelGeometries> {
  loader ??= new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const gltf = await loader.loadAsync(url);
  const geometries = new Map<string, BufferGeometry>();
  gltf.scene.traverse((node) => {
    const mesh = node as Mesh;
    if (mesh.isMesh) geometries.set(mesh.name, mesh.geometry);
  });
  return geometries;
}

/**
 * Gives a stand-in geometry the same RGBA colour attribute the Blender models carry,
 * so swapping in the real model later reuses the already compiled shader program.
 */
export function withNeutralTint<T extends BufferGeometry>(geometry: T): T {
  const count = geometry.getAttribute('position').count;
  geometry.setAttribute(
    'color',
    new Float32BufferAttribute(new Float32Array(count * 4).fill(1), 4),
  );
  return geometry;
}
