import type { Camera, Scene, WebGLRenderer, WebGLRenderTarget } from 'three';
import { Vector2 } from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

/** Final grade in display space: chromatic fringe, frost desaturation, grain. */
const FinishShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uFrost: { value: 0 },
    uAberration: { value: 0.0012 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uFrost;
    uniform float uAberration;
    varying vec2 vUv;

    float rand(vec2 co) {
      return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec2 dir = vUv - 0.5;
      float amount = uAberration * (0.4 + length(dir) * 2.0);
      vec3 color;
      color.r = texture2D(tDiffuse, vUv + dir * amount).r;
      color.g = texture2D(tDiffuse, vUv).g;
      color.b = texture2D(tDiffuse, vUv - dir * amount).b;

      float luma = dot(color, vec3(0.299, 0.587, 0.114));
      vec3 cold = vec3(luma) * vec3(0.86, 0.95, 1.08);
      color = mix(color, cold, uFrost * 0.65);

      color += (rand(vUv * 1000.0 + fract(uTime)) - 0.5) * 0.045;
      gl_FragColor = vec4(color, 1.0);
    }
  `,
};

export class PostFX {
  private readonly composer: EffectComposer;
  private readonly bloom: UnrealBloomPass | null;
  private readonly finish: ShaderPass;

  constructor(renderer: WebGLRenderer, scene: Scene, camera: Camera, withBloom: boolean) {
    this.composer = new EffectComposer(renderer);
    this.composer.addPass(new RenderPass(scene, camera));
    this.bloom = withBloom ? new UnrealBloomPass(new Vector2(256, 256), 0.35, 0.55, 0.86) : null;
    if (this.bloom) this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());
    this.finish = new ShaderPass(FinishShader);
    this.composer.addPass(this.finish);
  }

  /** Off-screen target the scene is rendered into; shaders must be compiled against it. */
  get sceneTarget(): WebGLRenderTarget {
    return this.composer.readBuffer;
  }

  setSize(width: number, height: number, pixelRatio: number): void {
    this.composer.setPixelRatio(pixelRatio);
    this.composer.setSize(width, height);
    this.bloom?.resolution.set(width / 2, height / 2);
  }

  render(time: number, glow: number, frost: number): void {
    if (this.bloom) this.bloom.strength = 0.18 + glow * 0.22;
    const u = this.finish.uniforms;
    if (u['uTime']) u['uTime'].value = time;
    if (u['uFrost']) u['uFrost'].value = frost;
    this.composer.render();
  }

  dispose(): void {
    this.composer.dispose();
  }
}
