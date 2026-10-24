import { Color, Mesh, PlaneGeometry, ShaderMaterial, Vector2 } from 'three';

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.9999, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uScroll;
  uniform float uGlow;
  uniform float uAspect;
  uniform vec2 uPointer;
  uniform vec3 uDeep;
  uniform vec3 uMid;
  uniform vec3 uHighlight;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    mat2 rotate = mat2(0.8, -0.6, 0.6, 0.8);
    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p);
      p = rotate * p * 2.02;
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    vec2 uv = vUv - 0.5;
    uv.x *= uAspect;
    vec2 p = uv * 2.2;
    float t = uTime * 0.035;

    // Domain-warped smoke drifting upwards as the page scrolls.
    vec2 q = vec2(fbm(p + vec2(0.0, t - uScroll * 1.6)), fbm(p + vec2(5.2, 1.3 - t)));
    vec2 r = vec2(fbm(p + 3.5 * q + vec2(1.7, 9.2) + t), fbm(p + 3.5 * q + vec2(8.3, 2.8) - t));
    float smoke = fbm(p + 3.0 * r);

    float halo = smoothstep(1.25, 0.0, length(uv - uPointer * 0.08 - vec2(0.0, 0.06)));
    vec3 color = mix(uDeep, uMid, clamp(smoke * smoke * 1.9, 0.0, 1.0));
    color = mix(color, uHighlight, clamp(pow(smoke, 3.5) * 1.1 * halo * uGlow, 0.0, 0.8));
    color += uHighlight * halo * halo * 0.05 * uGlow;
    color *= 0.4 + 0.6 * smoothstep(1.4, 0.1, length(uv));
    // Deepen the shadows so the scene reads as candle-lit noir.
    color = pow(color, vec3(1.3)) * 1.1;

    gl_FragColor = vec4(color, 1.0);
  }
`;

/** Full-screen domain-warped smoke, painted behind everything. */
export class Backdrop {
  readonly mesh: Mesh<PlaneGeometry, ShaderMaterial>;

  constructor() {
    const material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        uTime: { value: 0 },
        uScroll: { value: 0 },
        uGlow: { value: 1 },
        uAspect: { value: 1 },
        uPointer: { value: new Vector2() },
        uDeep: { value: new Color() },
        uMid: { value: new Color() },
        uHighlight: { value: new Color() },
      },
    });
    this.mesh = new Mesh(new PlaneGeometry(2, 2), material);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = -10;
  }

  get uniforms(): ShaderMaterial['uniforms'] {
    return this.mesh.material.uniforms;
  }
}
