import {
  Color,
  Euler,
  Group,
  InstancedMesh,
  Matrix4,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Quaternion,
  SphereGeometry,
  Vector3,
} from 'three';

import { type ModelGeometries, withNeutralTint } from '../models.ts';

/** Heirloom varieties: Rouge vif, Cinderella white, Jarrahdale, Golden, Musquée. */
const VARIETIES = ['#d8601b', '#ece0c8', '#9fb3ad', '#e0a03a', '#b8471a'] as const;
const FROST_TINT = new Color('#c4d4e2');
const WHITE = new Color('#ffffff');

interface Planted {
  /** `x` is a fraction of the visible half-width at the pumpkin's depth. */
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly size: number;
  /** Height relative to width: below 1 is squat, above 1 is tall. */
  readonly shape: number;
  readonly variety: number;
}

/** Kept to the edges and the distance, so copy in the middle stays legible. */
const PLANTED: readonly Planted[] = [
  { x: -0.8, y: -1.25, z: -1.4, size: 0.55, shape: 0.85, variety: 1 },
  { x: 0.8, y: -1.2, z: -1.7, size: 0.62, shape: 0.8, variety: 2 },
  { x: -0.52, y: -1.55, z: -3.1, size: 0.46, shape: 1.2, variety: 3 },
  { x: 0.5, y: -1.65, z: -3.4, size: 0.5, shape: 1, variety: 0 },
  { x: -0.95, y: 0.95, z: -4.4, size: 0.42, shape: 1, variety: 4 },
  { x: 0.92, y: 1.05, z: -4.1, size: 0.36, shape: 1.1, variety: 1 },
  { x: 0.1, y: -1.95, z: -5, size: 0.62, shape: 0.9, variety: 4 },
  { x: -0.25, y: 1.45, z: -6, size: 0.4, shape: 1, variety: 3 },
  { x: 0.68, y: -0.2, z: -6.4, size: 0.44, shape: 1.05, variety: 2 },
];

const smooth = (t: number): number => {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
};

/**
 * A field of heirloom pumpkins around the story: one instanced draw for the bodies,
 * one for the stems. They rise one by one as the patch fades in, and frost over with
 * the world.
 */
export class PumpkinPatch {
  readonly group = new Group();
  private readonly skin: MeshPhysicalMaterial;
  private readonly bodies: InstancedMesh;
  private readonly stems: InstancedMesh;
  private readonly matrix = new Matrix4();
  private readonly quaternion = new Quaternion();
  private readonly euler = new Euler();
  private readonly position = new Vector3();
  private readonly scale = new Vector3();

  constructor() {
    this.skin = new MeshPhysicalMaterial({
      color: WHITE.clone(),
      roughness: 0.5,
      clearcoat: 0.35,
      clearcoatRoughness: 0.4,
      sheen: 0.5,
      sheenRoughness: 0.45,
      sheenColor: new Color('#ffcf9a'),
      envMapIntensity: 0.8,
      vertexColors: true,
    });
    const stalk = new MeshStandardMaterial({
      color: new Color('#5a4522'),
      roughness: 0.92,
      vertexColors: true,
    });
    const placeholder = withNeutralTint(new SphereGeometry(0.01, 6, 4));
    this.bodies = new InstancedMesh(placeholder, this.skin, PLANTED.length);
    this.stems = new InstancedMesh(placeholder, stalk, PLANTED.length);

    const colour = new Color();
    PLANTED.forEach((pumpkin, index) => {
      this.bodies.setColorAt(index, colour.set(VARIETIES[pumpkin.variety] ?? VARIETIES[0]));
    });
    // Instances move every frame and spread across the view; skip per-object culling.
    this.bodies.frustumCulled = false;
    this.stems.frustumCulled = false;
    this.group.add(this.bodies, this.stems);
  }

  adopt(model: ModelGeometries): void {
    const body = model.get('Body');
    const stem = model.get('Stem');
    if (!body || !stem) return;
    this.bodies.geometry = body;
    this.stems.geometry = stem;
  }

  /**
   * @param amount     0 = no patch, 1 = every pumpkin risen
   * @param frost      0 = autumn, 1 = frozen
   * @param halfWidth  visible half-width at the origin
   * @param cameraZ    camera distance, to widen the layout with depth
   */
  update(time: number, amount: number, frost: number, halfWidth: number, cameraZ: number): void {
    this.group.visible = amount > 0.01;
    if (!this.group.visible) return;

    this.skin.color.copy(WHITE).lerp(FROST_TINT, frost);
    this.skin.roughness = 0.5 + frost * 0.35;

    PLANTED.forEach((pumpkin, index) => {
      const start = (index / PLANTED.length) * 0.5;
      const risen = smooth((amount - start) / 0.5);
      const depth = (cameraZ - pumpkin.z) / cameraZ;
      this.position.set(
        pumpkin.x * halfWidth * depth,
        pumpkin.y + (1 - risen) * -1.2 + Math.sin(time * 0.5 + index) * 0.04,
        pumpkin.z,
      );
      this.euler.set(
        Math.sin(time * 0.3 + index) * 0.08,
        index * 1.7 + time * 0.08,
        Math.cos(time * 0.25 + index) * 0.06,
      );
      this.quaternion.setFromEuler(this.euler);
      const size = Math.max(0.0001, pumpkin.size * risen);
      this.scale.set(size, size * pumpkin.shape, size);
      this.matrix.compose(this.position, this.quaternion, this.scale);
      this.bodies.setMatrixAt(index, this.matrix);
      this.stems.setMatrixAt(index, this.matrix);
    });
    this.bodies.instanceMatrix.needsUpdate = true;
    this.stems.instanceMatrix.needsUpdate = true;
  }
}
