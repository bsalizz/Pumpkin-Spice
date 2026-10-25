import {
  CatmullRomCurve3,
  Color,
  Group,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  TubeGeometry,
  Vector3,
} from 'three';

import { type ModelGeometries, withNeutralTint } from '../models.ts';
import { createRibbedGeometry } from './ribbed.ts';

const WARM = new Color('#d8601b');
const FROZEN = new Color('#a9bfd0');
const SHEEN_WARM = new Color('#ffb36b');
const SHEEN_FROZEN = new Color('#ffffff');

/**
 * The heirloom pumpkin — the heart of the story. It can freeze over.
 * A procedural stand-in renders at once; the sculpted Blender model replaces it on load.
 */
export class Pumpkin {
  readonly group = new Group();
  private readonly skin: MeshPhysicalMaterial;
  private readonly stalk: MeshStandardMaterial;
  private readonly body: Mesh;
  private readonly stem: Mesh;

  constructor() {
    this.skin = new MeshPhysicalMaterial({
      color: WARM.clone(),
      roughness: 0.48,
      clearcoat: 0.45,
      clearcoatRoughness: 0.35,
      sheen: 0.6,
      sheenRoughness: 0.4,
      sheenColor: SHEEN_WARM.clone(),
      envMapIntensity: 0.9,
      vertexColors: true,
    });
    this.stalk = new MeshStandardMaterial({
      color: new Color('#5a4522'),
      roughness: 0.92,
      vertexColors: true,
    });
    this.body = new Mesh(withNeutralTint(createRibbedGeometry(10, 128)), this.skin);

    const curve = new CatmullRomCurve3([
      new Vector3(0, 0.45, 0),
      new Vector3(0.02, 0.68, 0),
      new Vector3(0.1, 0.86, 0.04),
      new Vector3(0.26, 0.94, 0.08),
    ]);
    this.stem = new Mesh(
      withNeutralTint(new TubeGeometry(curve, 32, 0.075, 12, false)),
      this.stalk,
    );

    this.group.add(this.body, this.stem);
  }

  /** Replaces the stand-in with the Blender model: ribbed body, twisted stem, curling tendril. */
  adopt(model: ModelGeometries): void {
    const body = model.get('Body');
    const stem = model.get('Stem');
    const tendril = model.get('Tendril');
    if (!body || !stem || !tendril) return;

    this.body.geometry.dispose();
    this.body.geometry = body;
    this.stem.geometry.dispose();
    this.stem.geometry = stem;
    this.group.add(new Mesh(tendril, this.stalk));
  }

  /** 0 = ripe autumn orange, 1 = frosted over. */
  setFrost(frost: number): void {
    this.skin.color.copy(WARM).lerp(FROZEN, frost);
    this.skin.sheenColor.copy(SHEEN_WARM).lerp(SHEEN_FROZEN, frost);
    this.skin.roughness = 0.48 + frost * 0.4;
    this.skin.clearcoat = 0.45 + frost * 0.5;
  }
}
