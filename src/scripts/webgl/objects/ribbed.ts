import { SphereGeometry, Vector3 } from 'three';

/**
 * A pumpkin-like body: a sphere with vertical ribs, squashed and dimpled at
 * the poles. Shared by the hero pumpkin and the gold stopper of the flacon.
 */
export function createRibbedGeometry(ribs = 10, segments = 96): SphereGeometry {
  const geometry = new SphereGeometry(1, segments, Math.round(segments * 0.7));
  const position = geometry.attributes['position'];
  if (!position) return geometry;

  const v = new Vector3();
  for (let i = 0; i < position.count; i += 1) {
    v.fromBufferAttribute(position, i).normalize();
    const angle = Math.atan2(v.z, v.x);
    const rib = Math.abs(Math.cos((angle * ribs) / 2)) ** 0.55;
    const pole = Math.exp(-(((1 - Math.abs(v.y)) * 5) ** 2));
    const radius = 1 - 0.1 * (1 - rib) * (1 - Math.abs(v.y) ** 4);
    position.setXYZ(i, v.x * radius, v.y * 0.74 * (1 - 0.32 * pole), v.z * radius);
  }

  geometry.computeVertexNormals();
  return geometry;
}
