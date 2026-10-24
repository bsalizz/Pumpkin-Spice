import {
  Color,
  CylinderGeometry,
  DoubleSide,
  Group,
  InstancedMesh,
  LatheGeometry,
  Matrix4,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  OctahedronGeometry,
  PlaneGeometry,
  ShaderMaterial,
  Quaternion,
  TubeGeometry,
  CatmullRomCurve3,
  Vector2,
  Vector3,
  Euler,
} from 'three';

import { createLabelTexture } from './label.ts';
import { createRibbedGeometry } from './ribbed.ts';

const FACETS = 10;
const BODY_RADIUS = 0.56;
const FILL_LEVEL = 0.3;

/** Outer silhouette of the crystal body, bottom to lip. */
const PROFILE: readonly [number, number][] = [
  [0, -1.3],
  [0.44, -1.3],
  [0.53, -1.26],
  [0.56, -1.16],
  [0.56, 0.42],
  [0.52, 0.6],
  [0.38, 0.8],
  [0.22, 0.94],
  [0.17, 1.02],
  [0.17, 1.12],
  [0.21, 1.15],
  [0.21, 1.2],
  [0, 1.2],
];

const liquidVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vLocal;
  void main() {
    vLocal = position;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const liquidFragment = /* glsl */ `
  uniform float uTime;
  uniform float uGlow;
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vLocal;
  void main() {
    float facing = clamp(dot(normalize(vNormal), normalize(vView)), 0.0, 1.0);
    // Light pools in the core of the volume; edges fall into deep amber.
    vec3 deep = vec3(0.03, 0.004, 0.0);
    vec3 core = vec3(0.62, 0.13, 0.008);
    float depth = smoothstep(-1.3, ${FILL_LEVEL.toFixed(2)}, vLocal.y);
    float caustic = sin(vLocal.y * 14.0 + uTime * 1.3 + sin(vLocal.x * 9.0 + uTime) * 1.5) * 0.5 + 0.5;
    float glow = pow(facing, 4.0);
    vec3 color = mix(deep, core, glow * (0.35 + 0.65 * depth));
    // Hot honeyed core and slow caustic bands.
    color += vec3(0.85, 0.36, 0.05) * pow(facing, 12.0) * 0.4 * depth;
    color += core * caustic * glow * 0.14;
    color *= 0.7 + 0.35 * uGlow;
    // Meniscus glint at the surface.
    color += vec3(1.0, 0.8, 0.5) * smoothstep(${(FILL_LEVEL - 0.04).toFixed(2)}, ${FILL_LEVEL.toFixed(2)}, vLocal.y) * 0.6;
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const FLAKES = 70;

/**
 * The hero object: a faceted crystal flacon holding glowing amber elixir with
 * suspended gold flakes, closed by a sculpted gold pumpkin stopper.
 */
export class Flacon {
  readonly group = new Group();
  private readonly flakes: InstancedMesh;
  private readonly flakeData: { base: Vector3; speed: number; phase: number }[] = [];
  private readonly liquidMaterial: ShaderMaterial;
  private readonly matrix = new Matrix4();
  private readonly quaternion = new Quaternion();
  private readonly euler = new Euler();
  private readonly scaleVec = new Vector3();
  private readonly tmp = new Vector3();

  constructor() {
    const points = PROFILE.map(([x, y]) => new Vector2(x, y));

    // Crystal is shaded as a reflective shell over the liquid: facets catch the
    // environment and a faint iridescence, while the elixir glows through untouched.
    const glassMaterial = new MeshPhysicalMaterial({
      color: new Color('#ffd9a8'),
      metalness: 0.1,
      roughness: 0.03,
      transparent: true,
      opacity: 0.12,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
      specularIntensity: 1,
      iridescence: 0.35,
      iridescenceIOR: 1.6,
      envMapIntensity: 1.3,
      flatShading: true,
      depthWrite: false,
    });

    const body = new Mesh(new LatheGeometry(points, FACETS), glassMaterial);
    // Rotate so a flat facet faces the camera and carries the label.
    body.rotation.y = Math.PI / FACETS;
    body.renderOrder = 2;

    const liquidPoints = PROFILE.filter(([, y]) => y < FILL_LEVEL).map(
      ([x, y]) => new Vector2(Math.max(0, x * 0.88), y * 0.94),
    );
    liquidPoints.push(new Vector2(BODY_RADIUS * 0.88, FILL_LEVEL), new Vector2(0, FILL_LEVEL));
    this.liquidMaterial = new ShaderMaterial({
      vertexShader: liquidVertex,
      fragmentShader: liquidFragment,
      uniforms: { uTime: { value: 0 }, uGlow: { value: 1 } },
    });
    const liquid = new Mesh(new LatheGeometry(liquidPoints, FACETS), this.liquidMaterial);
    liquid.rotation.y = Math.PI / FACETS;

    const gold = new MeshStandardMaterial({
      color: new Color('#e2b55a'),
      metalness: 1,
      roughness: 0.22,
      envMapIntensity: 1.4,
    });

    const collar = new Mesh(new CylinderGeometry(0.27, 0.27, 0.12, 48), gold);
    collar.position.y = 1.24;

    const stopper = new Mesh(createRibbedGeometry(8, 48), gold);
    stopper.scale.setScalar(0.36);
    stopper.position.y = 1.5;

    const stemCurve = new CatmullRomCurve3([
      new Vector3(0, 1.68, 0),
      new Vector3(0.02, 1.8, 0),
      new Vector3(0.09, 1.88, 0.02),
      new Vector3(0.17, 1.9, 0.03),
    ]);
    const stem = new Mesh(new TubeGeometry(stemCurve, 24, 0.035, 10, false), gold);

    const labelTexture = createLabelTexture();
    const label = new Mesh(
      new PlaneGeometry(0.5, 0.625),
      new MeshStandardMaterial({
        map: labelTexture,
        metalness: 0.45,
        roughness: 0.35,
        side: DoubleSide,
      }),
    );
    label.position.set(0, -0.42, BODY_RADIUS * Math.cos(Math.PI / FACETS) + 0.006);

    this.flakes = new InstancedMesh(new OctahedronGeometry(0.018, 0), gold, FLAKES);
    for (let i = 0; i < FLAKES; i += 1) {
      const radius = Math.sqrt(Math.random()) * 0.4;
      const angle = Math.random() * Math.PI * 2;
      this.flakeData.push({
        base: new Vector3(
          Math.cos(angle) * radius,
          -1.15 + Math.random() * (FILL_LEVEL + 1.05),
          Math.sin(angle) * radius,
        ),
        speed: 0.2 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
      });
    }

    this.group.add(liquid, this.flakes, body, label, collar, stopper, stem);
  }

  /** Animates the suspended gold flakes and the liquid's inner glow. */
  update(time: number, glow: number): void {
    this.flakeData.forEach((flake, index) => {
      const t = time * flake.speed + flake.phase;
      this.tmp.set(
        flake.base.x + Math.sin(t) * 0.05,
        flake.base.y + Math.sin(t * 0.7) * 0.08,
        flake.base.z + Math.cos(t) * 0.05,
      );
      this.euler.set(t, t * 1.3, t * 0.6);
      this.quaternion.setFromEuler(this.euler);
      this.scaleVec.setScalar(0.6 + 0.4 * Math.sin(t * 2.1));
      this.matrix.compose(this.tmp, this.quaternion, this.scaleVec);
      this.flakes.setMatrixAt(index, this.matrix);
    });
    this.flakes.instanceMatrix.needsUpdate = true;
    const u = this.liquidMaterial.uniforms;
    if (u['uTime']) u['uTime'].value = time;
    if (u['uGlow']) u['uGlow'].value = glow;
  }
}
