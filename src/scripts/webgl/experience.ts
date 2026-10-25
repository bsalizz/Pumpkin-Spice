import type { Color } from 'three';
import {
  AmbientLight,
  NeutralToneMapping,
  DirectionalLight,
  PerspectiveCamera,
  PMREMGenerator,
  PointLight,
  Scene,
  SRGBColorSpace,
  Timer,
  WebGLRenderer,
} from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

import { pointerState, scrollState } from '../state.ts';
import { Director } from './director.ts';
import { Backdrop } from './objects/backdrop.ts';
import { Dust } from './objects/dust.ts';
import { Flacon } from './objects/flacon.ts';
import { Leaves } from './objects/leaves.ts';
import { Pumpkin } from './objects/pumpkin.ts';
import { PostFX } from './postfx.ts';
import { detectQuality, type Quality } from './quality.ts';

const FOV = 35;
const SLOW_FRAME = 1 / 40;
const MIN_DPR = 0.75;

/** Resolves in a fresh task, letting the browser paint and handle input in between. */
const nextTask = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

const damp = (current: number, target: number, lambda: number, delta: number): number =>
  current + (target - current) * (1 - Math.exp(-lambda * delta));

export interface ExperienceOptions {
  readonly canvas: HTMLCanvasElement;
  readonly reducedMotion: boolean;
}

/**
 * Owns the WebGL scene: one renderer, one camera, a handful of hero objects,
 * all choreographed by the scroll-driven {@link Director}.
 */
export class Experience {
  private readonly renderer: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(FOV, 1, 0.1, 60);
  private readonly timer = new Timer();
  private readonly director = new Director();
  private readonly quality: Quality;
  private readonly postfx: PostFX;
  private readonly backdrop = new Backdrop();
  private readonly flacon: Flacon;
  private readonly pumpkin = new Pumpkin();
  private readonly leaves: Leaves;
  private readonly dust: Dust;
  private readonly key = new DirectionalLight('#ffe2b8', 1.4);
  private readonly rim = new PointLight('#ff7a2a', 14, 20, 1.6);
  private readonly ambient = new AmbientLight('#2a1408', 0.35);
  private readonly smoothed = { x: 0, y: 0, velocity: 0 };
  private pixelRatio: number;
  private halfWidth = 2;
  private slowFrames = 0;
  private flaconSpin = 0;
  private readonly reducedMotion: boolean;
  private readonly onResize = (): void => this.resize();

  constructor({ canvas, reducedMotion }: ExperienceOptions) {
    this.reducedMotion = reducedMotion;
    this.quality = detectQuality();
    this.pixelRatio = this.quality.maxDpr;

    this.renderer = new WebGLRenderer({
      canvas,
      antialias: this.pixelRatio < 1.5,
      powerPreference: 'high-performance',
      alpha: false,
      stencil: false,
    });
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.toneMapping = NeutralToneMapping;
    this.renderer.toneMappingExposure = 0.9;

    this.scene.environmentIntensity = 0.55;

    this.flacon = new Flacon();
    this.leaves = new Leaves(this.quality.leaves);
    this.dust = new Dust(this.quality.dust, this.pixelRatio);

    this.key.position.set(3, 5, 4);
    this.rim.position.set(-2.5, 1.5, -2.5);
    this.scene.add(
      this.backdrop.mesh,
      this.flacon.group,
      this.pumpkin.group,
      this.leaves.mesh,
      this.dust.points,
      this.key,
      this.rim,
      this.ambient,
    );

    this.postfx = new PostFX(this.renderer, this.scene, this.camera, this.quality.bloom);
    this.camera.position.set(0, 0, 7);

    this.resize();
    window.addEventListener('resize', this.onResize, { passive: true });
  }

  /** Re-reads section anchors (call after layout changes). */
  measure(): void {
    this.director.measure();
  }

  /**
   * Prepares the GPU in separate tasks so the preloader keeps animating on slow
   * devices, and the first visible frame does not stutter.
   */
  async warmUp(): Promise<void> {
    await nextTask();
    const pmrem = new PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    await nextTask();
    this.director.measure();
    // Programs are keyed by their output target (tone mapping, colour space), so compile
    // against the composer's off-screen buffer the scene is actually rendered into.
    this.renderer.setRenderTarget(this.postfx.sceneTarget);
    const compiled = this.renderer.compileAsync(this.scene, this.camera);
    this.renderer.setRenderTarget(null);
    await compiled;

    await nextTask();
    this.frame();
  }

  start(): void {
    this.timer.connect(document);
    this.timer.reset();
    this.renderer.setAnimationLoop((timestamp) => this.frame(timestamp));
  }

  dispose(): void {
    this.renderer.setAnimationLoop(null);
    this.timer.dispose();
    window.removeEventListener('resize', this.onResize);
    this.postfx.dispose();
    this.renderer.dispose();
  }

  private resize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(this.pixelRatio);
    this.renderer.setSize(width, height, false);
    this.postfx.setSize(width, height, this.pixelRatio);
    this.dust.setPixelRatio(this.pixelRatio);

    const halfHeight = Math.tan((FOV * Math.PI) / 360) * this.camera.position.z;
    this.halfWidth = halfHeight * this.camera.aspect;
    this.leaves.setBounds(this.halfWidth);
    const aspect = this.backdrop.uniforms['uAspect'];
    if (aspect) aspect.value = this.camera.aspect;
    this.director.measure();
  }

  /** Lowers the resolution when the device cannot keep up. */
  private adapt(delta: number): void {
    this.slowFrames = delta > SLOW_FRAME ? this.slowFrames + 1 : Math.max(0, this.slowFrames - 1);
    if (this.slowFrames > 90 && this.pixelRatio > MIN_DPR) {
      this.pixelRatio = Math.max(MIN_DPR, this.pixelRatio - 0.25);
      this.slowFrames = 0;
      this.resize();
    }
  }

  private frame(timestamp?: number): void {
    this.timer.update(timestamp);
    const delta = Math.min(this.timer.getDelta(), 0.1);
    const pace = this.reducedMotion ? 0.25 : 1;
    const time = this.timer.getElapsed() * pace;
    this.adapt(delta);

    const state = this.director.resolve(window.scrollY, window.innerHeight);
    const s = this.smoothed;
    s.x = damp(s.x, this.reducedMotion ? 0 : pointerState.x, 2.5, delta);
    s.y = damp(s.y, this.reducedMotion ? 0 : pointerState.y, 2.5, delta);
    s.velocity = damp(s.velocity, scrollState.velocity, 4, delta);

    // Camera breathes with the pointer.
    this.camera.position.x = damp(this.camera.position.x, s.x * 0.45, 3, delta);
    this.camera.position.y = damp(this.camera.position.y, s.y * 0.3, 3, delta);
    this.camera.position.z = damp(this.camera.position.z, state.cameraZ, 2, delta);
    this.camera.lookAt(0, 0, 0);

    // Flacon.
    const f = state.flacon;
    const fg = this.flacon.group;
    // Portrait viewports get smaller objects pushed towards the edges, keeping copy legible.
    const portrait = this.camera.aspect < 0.8;
    const fit = portrait
      ? 0.5 + this.camera.aspect * 0.3
      : Math.min(1, 0.55 + this.camera.aspect * 0.45);
    const spread = portrait ? 1.4 : 1;
    fg.position.set(
      damp(fg.position.x, f.x * spread * this.halfWidth, 3, delta),
      damp(fg.position.y, f.y * 2.4, 3, delta),
      damp(fg.position.z, f.z, 3, delta),
    );
    fg.scale.setScalar(damp(fg.scale.x, Math.max(0.0001, f.scale * fit), 3, delta));
    this.flaconSpin += delta * pace * (0.32 + Math.min(Math.abs(s.velocity) * 0.04, 2));
    fg.rotation.set(
      damp(fg.rotation.x, s.y * -0.12, 3, delta),
      this.flaconSpin + s.x * 0.4,
      damp(fg.rotation.z, f.tilt + Math.sin(time * 0.6) * 0.04, 3, delta),
    );
    fg.position.y += Math.sin(time * 0.9) * 0.04;
    fg.visible = fg.scale.x > 0.01;
    this.flacon.update(time, state.glow);

    // Pumpkin.
    const p = state.pumpkin;
    const pg = this.pumpkin.group;
    pg.position.set(
      damp(pg.position.x, p.x * spread * this.halfWidth, 2.5, delta),
      damp(pg.position.y, p.y * 2.4, 2.5, delta),
      damp(pg.position.z, p.z, 2.5, delta),
    );
    pg.scale.setScalar(damp(pg.scale.x, Math.max(0.0001, p.scale * fit), 2.5, delta));
    pg.rotation.y += delta * pace * 0.18;
    pg.rotation.x = Math.sin(time * 0.5) * 0.06 + s.y * -0.1;
    pg.visible = pg.scale.x > 0.01;
    this.pumpkin.setFrost(p.frost);

    // Atmosphere.
    const u = this.backdrop.uniforms;
    if (u['uTime']) u['uTime'].value = time;
    if (u['uScroll']) u['uScroll'].value = scrollState.progress;
    if (u['uGlow']) u['uGlow'].value = state.glow;
    (u['uPointer']?.value as { set: (x: number, y: number) => void } | undefined)?.set(s.x, s.y);
    (u['uDeep']?.value as Color | undefined)?.copy(this.director.deep);
    (u['uMid']?.value as Color | undefined)?.copy(this.director.mid);
    (u['uHighlight']?.value as Color | undefined)?.copy(this.director.glowColor);

    this.rim.color.copy(this.director.glowColor);
    this.rim.intensity = 6 + 12 * state.glow;
    this.key.intensity = 0.9 + 0.7 * state.glow;

    const wind = Math.max(-3, Math.min(3, s.velocity * 0.08)) + s.x * 0.6;
    this.leaves.update(
      delta * pace,
      state.fall,
      wind,
      state.frost,
      this.director.deep,
      this.director.glowColor,
    );
    this.dust.update(delta * pace, time, state.snow, 1 + Math.min(Math.abs(s.velocity) * 0.05, 3));

    this.postfx.render(time, state.glow, state.frost * 0.6);
  }
}
