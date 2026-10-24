import {
  Color,
  DoubleSide,
  InstancedBufferAttribute,
  InstancedMesh,
  Matrix4,
  Shape,
  ShapeGeometry,
  ShaderMaterial,
  Vector2,
} from 'three';

/** Right half of a maple leaf outline, from the stem up to the apex (unit size). */
const MAPLE_HALF: readonly [number, number][] = [
  [0.03, -0.95],
  [0.03, -0.56],
  [0.2, -0.62],
  [0.36, -0.48],
  [0.62, -0.6],
  [0.56, -0.34],
  [0.96, -0.16],
  [0.74, -0.04],
  [0.88, 0.2],
  [0.6, 0.17],
  [0.64, 0.44],
  [0.42, 0.3],
  [0.38, 0.64],
  [0.2, 0.48],
  [0.12, 0.74],
  [0, 1],
];

/** Symmetric maple leaf with five lobes and a short stem. */
function mapleShape(size: number): Shape {
  const left = MAPLE_HALF.slice(0, -1)
    .reverse()
    .map(([x, y]) => [-x, y] as const);
  const points = [...MAPLE_HALF, ...left].map(([x, y]) => new Vector2(x * size, y * size));
  return new Shape(points);
}

const vertexShader = /* glsl */ `
  attribute vec4 aRand;
  attribute vec3 aColor;
  uniform float uFall;
  uniform float uWind;
  uniform vec3 uBounds;
  varying vec3 vColor;
  varying vec2 vLocal;
  varying float vShade;
  varying float vDepth;
  varying float vSeed;

  mat3 rotation(vec3 a) {
    float cx = cos(a.x), sx = sin(a.x);
    float cy = cos(a.y), sy = sin(a.y);
    float cz = cos(a.z), sz = sin(a.z);
    return mat3(cy * cz, cy * sz, -sy,
                sx * sy * cz - cx * sz, sx * sy * sz + cx * cz, sx * cy,
                cx * sy * cz + sx * sz, cx * sy * sz - sx * cz, cx * cy);
  }

  void main() {
    vLocal = position.xy;
    vColor = aColor;
    vSeed = aRand.w;

    float speed = 0.55 + aRand.y * 0.9;
    float clock = uFall * speed + aRand.w * 40.0;

    vec3 local = position * (0.7 + aRand.z * 0.9);
    // Flutter: bend the blade along its width.
    local.z += sin(local.x * 9.0 + clock * 3.0) * 0.035 + local.x * local.x * 1.6;

    vec3 spin = vec3(clock * (0.6 + aRand.x), clock * (0.9 + aRand.y * 0.8), clock * 0.35 + aRand.w * 6.28);
    mat3 rot = rotation(spin);
    vec3 world = rot * local;
    vShade = abs((rot * vec3(0.0, 0.0, 1.0)).z) * 0.7 + 0.3;

    vec3 origin = (aRand.xyz - 0.5) * 2.0 * uBounds;
    origin.y = mod(origin.y - clock * 0.55 + uBounds.y, uBounds.y * 2.0) - uBounds.y;
    origin.x += sin(clock * 0.8 + aRand.w * 12.0) * 0.7 + uWind * (0.4 + aRand.z);
    origin.x = mod(origin.x + uBounds.x, uBounds.x * 2.0) - uBounds.x;
    origin.z += sin(clock * 0.5 + aRand.x * 6.0) * 0.4;

    vec4 mv = modelViewMatrix * vec4(origin + world, 1.0);
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  uniform float uFrost;
  uniform vec3 uFog;
  uniform vec3 uLight;
  varying vec3 vColor;
  varying vec2 vLocal;
  varying float vShade;
  varying float vDepth;
  varying float vSeed;

  void main() {
    float r = length(vLocal);
    float a = atan(vLocal.y, vLocal.x);
    // Midrib plus four lateral veins radiating from the stem.
    float veins = 1.0 - smoothstep(0.0, 0.012, abs(vLocal.x)) * 1.0;
    veins = max(veins, 1.0 - smoothstep(0.0, 0.05, abs(sin((a + 1.5708) * 2.5)) * r * 6.0));
    vec3 color = vColor * (0.9 - veins * 0.35);
    color *= 0.75 + 0.35 * smoothstep(0.25, 0.0, r);

    vec3 ice = vec3(0.78, 0.88, 0.96);
    color = mix(color, ice * (0.7 + 0.3 * vSeed), uFrost * 0.85);
    color *= vShade;
    color += uLight * pow(vShade, 6.0) * 0.25;

    float fog = smoothstep(4.0, 15.0, vDepth);
    color = mix(color, uFog, fog * 0.85);
    gl_FragColor = vec4(color, 1.0);
  }
`;

const LEAF_COLORS = ['#c2361a', '#e0611d', '#f08a24', '#b8251c', '#d9a034', '#8e2a14', '#e8782a'];

/** GPU-animated falling maple leaves; the CPU only advances a few uniforms. */
export class Leaves {
  readonly mesh: InstancedMesh<ShapeGeometry, ShaderMaterial>;
  private fallClock = 0;
  private windClock = 0;

  constructor(count: number) {
    const geometry = new ShapeGeometry(mapleShape(0.16), 6);
    const rand = new Float32Array(count * 4);
    const colors = new Float32Array(count * 3);
    const color = new Color();
    for (let i = 0; i < count; i += 1) {
      rand.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
      color.set(LEAF_COLORS[i % LEAF_COLORS.length] ?? '#e0611d');
      colors.set([color.r, color.g, color.b], i * 3);
    }
    geometry.setAttribute('aRand', new InstancedBufferAttribute(rand, 4));
    geometry.setAttribute('aColor', new InstancedBufferAttribute(colors, 3));

    const material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      side: DoubleSide,
      uniforms: {
        uFall: { value: 0 },
        uWind: { value: 0 },
        uFrost: { value: 0 },
        uBounds: { value: [7, 5, 6] },
        uFog: { value: new Color() },
        uLight: { value: new Color('#ffd28a') },
      },
    });

    this.mesh = new InstancedMesh(geometry, material, count);
    const identity = new Matrix4();
    for (let i = 0; i < count; i += 1) this.mesh.setMatrixAt(i, identity);
    this.mesh.frustumCulled = false;
    this.mesh.position.z = -1;
  }

  /** Integrates speed so mood changes never make leaves jump. */
  update(delta: number, fall: number, wind: number, frost: number, fog: Color, light: Color): void {
    this.fallClock += delta * fall;
    this.windClock += (wind - this.windClock) * Math.min(1, delta * 2);
    const uniforms = this.mesh.material.uniforms;
    if (uniforms['uFall']) uniforms['uFall'].value = this.fallClock;
    if (uniforms['uWind']) uniforms['uWind'].value = this.windClock;
    if (uniforms['uFrost']) uniforms['uFrost'].value = frost;
    (uniforms['uFog']?.value as Color | undefined)?.copy(fog);
    (uniforms['uLight']?.value as Color | undefined)?.copy(light);
  }

  setBounds(halfWidth: number): void {
    const bounds = this.mesh.material.uniforms['uBounds'];
    if (bounds) bounds.value = [Math.max(4, halfWidth * 1.6), 5, 6];
  }
}
