import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Points,
  ShaderMaterial,
} from 'three';

const vertexShader = /* glsl */ `
  attribute vec4 aRand;
  uniform float uClock;
  uniform float uSnow;
  uniform float uPixelRatio;
  uniform float uTime;
  varying float vAlpha;

  void main() {
    vec3 p = (aRand.xyz - 0.5) * vec3(14.0, 10.0, 10.0);
    float speed = 0.3 + aRand.w * 0.7;
    // Embers rise; snow falls. Both wrap around the volume.
    float travel = uClock * speed;
    p.y = mod(p.y + travel + 5.0, 10.0) - 5.0;
    p.x += sin(uTime * 0.4 + aRand.w * 30.0) * 0.35;
    p.z += cos(uTime * 0.3 + aRand.x * 30.0) * 0.35;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float size = mix(2.2, 4.5, uSnow) * (0.5 + aRand.w);
    gl_PointSize = size * uPixelRatio * (8.0 / -mv.z);
    vAlpha = (0.35 + 0.65 * abs(sin(uTime * (0.8 + aRand.x * 2.0) + aRand.y * 40.0))) * smoothstep(16.0, 4.0, -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  uniform vec3 uEmber;
  uniform vec3 uSnowColor;
  uniform float uSnow;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float disc = smoothstep(0.5, 0.0, d);
    vec3 color = mix(uEmber, uSnowColor, uSnow);
    gl_FragColor = vec4(color * disc * vAlpha, disc * vAlpha);
  }
`;

/** Glowing spice embers that turn into snow when the story freezes. */
export class Dust {
  readonly points: Points<BufferGeometry, ShaderMaterial>;
  private clock = 0;

  constructor(count: number, pixelRatio: number) {
    const geometry = new BufferGeometry();
    const rand = new Float32Array(count * 4);
    for (let i = 0; i < rand.length; i += 1) rand[i] = Math.random();
    geometry.setAttribute('position', new BufferAttribute(new Float32Array(count * 3), 3));
    geometry.setAttribute('aRand', new BufferAttribute(rand, 4));

    const material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: {
        uClock: { value: 0 },
        uTime: { value: 0 },
        uSnow: { value: 0 },
        uPixelRatio: { value: pixelRatio },
        uEmber: { value: new Color('#ffb257') },
        uSnowColor: { value: new Color('#dfeaf4') },
      },
    });

    this.points = new Points(geometry, material);
    this.points.frustumCulled = false;
  }

  update(delta: number, time: number, snow: number, boost: number): void {
    // Rising (+) for embers, falling (−) for snow.
    this.clock += delta * (0.35 * (1 - snow) - 0.6 * snow) * boost;
    const u = this.points.material.uniforms;
    if (u['uClock']) u['uClock'].value = this.clock;
    if (u['uTime']) u['uTime'].value = time;
    if (u['uSnow']) u['uSnow'].value = snow;
  }

  setPixelRatio(pixelRatio: number): void {
    const u = this.points.material.uniforms['uPixelRatio'];
    if (u) u.value = pixelRatio;
  }
}
