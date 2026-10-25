import type { BufferGeometry } from 'three';
import { Color, Group, Mesh, MeshStandardMaterial, OctahedronGeometry } from 'three';

import { type ModelGeometries, withNeutralTint } from '../models.ts';

interface Piece {
  readonly model: 'StarAnise' | 'Cinnamon';
  readonly size: number;
  /** Orbit radius, height and starting angle around the flacon. */
  readonly radius: number;
  readonly height: number;
  readonly phase: number;
  /** Tumble speed around each axis, radians per second. */
  readonly tumble: readonly [number, number, number];
}

const PIECES: readonly Piece[] = [
  {
    model: 'StarAnise',
    size: 0.62,
    radius: 1.2,
    height: 0.75,
    phase: 0.3,
    tumble: [0.2, 0.5, 0.1],
  },
  {
    model: 'Cinnamon',
    size: 0.78,
    radius: 1.3,
    height: -0.55,
    phase: 1.6,
    tumble: [0.3, 0.1, 0.45],
  },
  {
    model: 'StarAnise',
    size: 0.48,
    radius: 1.05,
    height: -1.05,
    phase: 2.9,
    tumble: [-0.4, 0.3, 0.2],
  },
  {
    model: 'Cinnamon',
    size: 0.6,
    radius: 1.15,
    height: 1.15,
    phase: 4.1,
    tumble: [0.15, -0.35, 0.3],
  },
  {
    model: 'StarAnise',
    size: 0.42,
    radius: 1.35,
    height: 0.1,
    phase: 5.2,
    tumble: [0.35, 0.25, -0.3],
  },
];

/**
 * Star anise and cinnamon quills drifting around the flacon — the elixir's ingredients.
 * Placeholders keep the shader warm until the Blender models arrive.
 */
export class Spices {
  readonly group = new Group();
  private readonly meshes: Mesh[];

  constructor() {
    const material = new MeshStandardMaterial({
      color: new Color('#a1491c'),
      roughness: 0.62,
      metalness: 0,
      vertexColors: true,
    });
    const placeholder = withNeutralTint(new OctahedronGeometry(0.01));
    this.meshes = PIECES.map(() => new Mesh(placeholder, material));
    this.group.add(...this.meshes);
  }

  adopt(model: ModelGeometries): void {
    const geometries: Record<Piece['model'], BufferGeometry | undefined> = {
      StarAnise: model.get('StarAnise'),
      Cinnamon: model.get('Cinnamon'),
    };
    this.meshes.forEach((mesh, index) => {
      const geometry = geometries[PIECES[index]?.model ?? 'StarAnise'];
      if (geometry) mesh.geometry = geometry;
    });
  }

  /** `amount` fades the orbit in (0 = gone, 1 = full). */
  update(time: number, amount: number): void {
    this.group.visible = amount > 0.01;
    if (!this.group.visible) return;

    this.meshes.forEach((mesh, index) => {
      const piece = PIECES[index];
      if (!piece) return;
      const angle = piece.phase + time * 0.12;
      const radius = piece.radius * (0.7 + 0.3 * amount);
      mesh.position.set(
        Math.cos(angle) * radius,
        piece.height + Math.sin(time * 0.6 + piece.phase) * 0.08,
        Math.sin(angle) * radius,
      );
      const [x, y, z] = piece.tumble;
      mesh.rotation.set(piece.phase + time * x, time * y, piece.phase * 0.5 + time * z);
      mesh.scale.setScalar(Math.max(0.0001, piece.size * amount));
    });
  }
}
