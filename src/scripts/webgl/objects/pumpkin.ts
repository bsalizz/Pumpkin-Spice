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

import { createRibbedGeometry } from './ribbed.ts';

const WARM = new Color('#d8601b');
const FROZEN = new Color('#a9bfd0');
const SHEEN_WARM = new Color('#ffb36b');
const SHEEN_FROZEN = new Color('#ffffff');

/** The heirloom pumpkin — the heart of the story. It can freeze over. */
export class Pumpkin {
  readonly group = new Group();
  private readonly skin: MeshPhysicalMaterial;

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
    });
    const body = new Mesh(createRibbedGeometry(10, 128), this.skin);

    const curve = new CatmullRomCurve3([
      new Vector3(0, 0.45, 0),
      new Vector3(0.02, 0.68, 0),
      new Vector3(0.1, 0.86, 0.04),
      new Vector3(0.26, 0.94, 0.08),
    ]);
    const stem = new Mesh(
      new TubeGeometry(curve, 32, 0.075, 12, false),
      new MeshStandardMaterial({ color: new Color('#4d3b1c'), roughness: 0.92 }),
    );

    this.group.add(body, stem);
  }

  /** 0 = ripe autumn orange, 1 = frosted over. */
  setFrost(frost: number): void {
    this.skin.color.copy(WARM).lerp(FROZEN, frost);
    this.skin.sheenColor.copy(SHEEN_WARM).lerp(SHEEN_FROZEN, frost);
    this.skin.roughness = 0.48 + frost * 0.4;
    this.skin.clearcoat = 0.45 + frost * 0.5;
  }
}
