import {
  AmbientLight,
  BoxGeometry,
  CanvasTexture,
  Color,
  DirectionalLight,
  Group,
  Mesh,
  MeshStandardMaterial,
  NeutralToneMapping,
  NoColorSpace,
  PerspectiveCamera,
  PMREMGenerator,
  PointLight,
  RepeatWrapping,
  Scene,
  SRGBColorSpace,
  Timer,
  WebGLRenderer,
} from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

import pumpkinModelUrl from '../../assets/models/pumpkin.glb?url';
import spicesModelUrl from '../../assets/models/spices.glb?url';
import type { CardTemplate } from '../../lib/card/payload.ts';
import { loadGeometries } from '../webgl/models.ts';
import { Dust } from '../webgl/objects/dust.ts';
import { Leaves } from '../webgl/objects/leaves.ts';
import { Pumpkin } from '../webgl/objects/pumpkin.ts';
import { Spices } from '../webgl/objects/spices.ts';
import { detectQuality, type Quality } from '../webgl/quality.ts';
import {
  CARD_ASPECT,
  CARD_FONTS,
  createFace,
  type Face,
  grainCanvas,
  paintBack,
  paintCover,
  paintInside,
  paintMessage,
} from './paint.ts';
import { THEMES, type CardTheme, type Weather } from './themes.ts';

/** Everything printed on the card, already localised and resolved. */
export interface CardContent {
  readonly template: CardTemplate;
  readonly headline: string;
  readonly quote: string;
  readonly caption: string;
  readonly to: string;
  readonly greeting: string;
  readonly message: string;
  readonly closing: string;
  readonly signature: string;
  readonly brand: string;
  readonly product: string;
  readonly motto: string;
  readonly address: string;
}

export interface StageOptions {
  readonly canvas: HTMLCanvasElement;
  /**
   * The area of the canvas the card is framed into. The canvas itself stays full-bleed,
   * so leaves and pumpkins can drift behind the copy around it.
   */
  readonly focus: HTMLElement;
  readonly photos: Readonly<Record<CardTemplate, string>>;
  readonly reducedMotion: boolean;
  /** Breathing room around the card; 1 = edge to edge. */
  readonly margin: number;
  readonly onOpenChange?: (open: boolean) => void;
}

const FOV = 30;
const HEIGHT = CARD_ASPECT;
const THICKNESS = 0.01;
/** How far the cover swings: just short of flat, so the spread keeps a fold. */
const OPEN_ANGLE = Math.PI * 0.93;
const TAP_DISTANCE = 8;
const TAP_TIME = 450;
/** Below this frame width the open card shows its message page; above, the whole spread. */
const SPREAD_MIN_WIDTH = 560;
const SLOW_FRAME = 1 / 40;
const MIN_DPR = 0.75;

const TEXTURE_WIDTH: Record<Quality['tier'], number> = {
  high: 1536,
  medium: 1280,
  low: 1024,
  software: 768,
};

interface WeatherMix {
  readonly leaves: number;
  readonly dust: number;
  readonly snow: number;
  readonly ember: string;
}

const WEATHER: Record<Weather, WeatherMix> = {
  leaves: { leaves: 1, dust: 0.6, snow: 0, ember: '#ffb257' },
  embers: { leaves: 0, dust: 1.6, snow: 0, ember: '#ff7a30' },
  snow: { leaves: 0, dust: 1, snow: 1, ember: '#ffb257' },
  gold: { leaves: 0.35, dust: 0.5, snow: 0, ember: '#ffd98a' },
  steam: { leaves: 0.25, dust: 0.35, snow: 0, ember: '#ffe9cf' },
};

/** Where the floating pumpkins hang around the card: position and size. */
const PUMPKIN_SPOTS = [
  { x: -0.95, y: -0.95, z: -0.9, size: 0.42 },
  { x: 1.05, y: 1, z: -1.6, size: 0.26 },
] as const;

const damp = (current: number, target: number, lambda: number, delta: number): number =>
  current + (target - current) * (1 - Math.exp(-lambda * delta));
const clamp = (value: number, limit: number): number => Math.max(-limit, Math.min(limit, value));
const easeOut = (t: number): number => 1 - (1 - Math.min(1, Math.max(0, t))) ** 3;

/** Resolves when the card fonts are usable, or after a short grace period. */
function fontsReady(): Promise<unknown> {
  const fonts = Promise.all(CARD_FONTS.map((font) => document.fonts.load(font, 'AaŐőÉ')));
  return Promise.race([fonts, new Promise((resolve) => setTimeout(resolve, 2500))]);
}

class PrintedFace {
  readonly face: Face;
  readonly material: MeshStandardMaterial;
  private readonly map: CanvasTexture;
  private readonly surface: CanvasTexture;
  private key = '';

  constructor(width: number, grain: CanvasTexture, anisotropy: number) {
    this.face = createFace(width);
    this.map = new CanvasTexture(this.face.color);
    this.map.colorSpace = SRGBColorSpace;
    this.map.anisotropy = anisotropy;
    this.surface = new CanvasTexture(this.face.surface);
    this.surface.colorSpace = NoColorSpace;
    this.material = new MeshStandardMaterial({
      map: this.map,
      roughnessMap: this.surface,
      metalnessMap: this.surface,
      roughness: 1,
      metalness: 1,
      bumpMap: grain,
      bumpScale: 0.35,
      envMapIntensity: 1.5,
    });
  }

  /** Repaints only when what is printed actually changed. */
  paint(key: string, painter: (face: Face) => void): void {
    if (key === this.key) return;
    this.key = key;
    painter(this.face);
    this.map.needsUpdate = true;
    this.surface.needsUpdate = true;
  }
}

/**
 * A folded greeting card in a small autumn world. The cover hinges open on its left
 * edge; the card can be dragged around (and flipped over), tilted with the phone and
 * tapped open. Weather, light and the floating pumpkins follow the chosen design.
 */
export class CardStage {
  private readonly canvas: HTMLCanvasElement;
  private readonly renderer: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(FOV, 1, 0.1, 40);
  private readonly timer = new Timer();
  private readonly quality: Quality;
  private readonly options: StageOptions;

  private readonly root = new Group();
  private readonly spread = new Group();
  private readonly hinge = new Group();
  private readonly cover: PrintedFace;
  private readonly inside: PrintedFace;
  private readonly message: PrintedFace;
  private readonly back: PrintedFace;
  private readonly edge: MeshStandardMaterial;

  private readonly leaves: Leaves;
  private readonly dust: Dust;
  private readonly pumpkins = [new Pumpkin(), new Pumpkin()];
  private readonly spices = new Spices();
  private readonly key = new DirectionalLight('#ffe0b0', 2);
  private readonly rim = new PointLight('#ff7a2a', 7, 12, 1.4);
  private readonly ambient = new AmbientLight('#3a2418', 0.7);
  private readonly fog = new Color();
  private readonly light = new Color();
  private readonly target = {
    light: new Color(),
    rim: new Color(),
    fog: new Color(),
    ember: new Color(),
  };

  private readonly photos = new Map<string, HTMLImageElement | null>();
  private content: CardContent | null = null;
  private theme: CardTheme = THEMES.october;
  private weather = { leaves: 0, dust: 0, snow: 0, frost: 0 };

  private readonly motion = {
    open: 0,
    openVelocity: 0,
    openTarget: 0,
    yaw: 0,
    yawVelocity: 0,
    restYaw: 0,
    pitch: 0,
    pitchVelocity: 0,
    hoverX: 0,
    hoverY: 0,
    tiltX: 0,
    tiltY: 0,
    intro: 0,
  };
  private readonly hover = { x: 0, y: 0 };
  private readonly tilt = { x: 0, y: 0, baseBeta: Number.NaN, baseGamma: Number.NaN };
  private drag: {
    id: number;
    x: number;
    y: number;
    startX: number;
    startY: number;
    start: number;
    last: number;
    moved: boolean;
  } | null = null;

  private readonly view = { width: 1, height: 1 };
  private readonly focusRect = { x: 0, y: 0, width: 1, height: 1 };
  private spreadLayout = false;
  private pixelRatio: number;
  private slowFrames = 0;
  private running = false;
  private visible = true;
  private readonly resizeObserver: ResizeObserver;
  private readonly intersection: IntersectionObserver;

  constructor(options: StageOptions) {
    this.options = options;
    this.canvas = options.canvas;
    this.quality = detectQuality();
    this.pixelRatio = this.quality.maxDpr;

    this.renderer = new WebGLRenderer({
      canvas: this.canvas,
      antialias: this.pixelRatio < 1.5,
      alpha: true,
      powerPreference: 'high-performance',
      stencil: false,
    });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.toneMapping = NeutralToneMapping;
    this.renderer.toneMappingExposure = 1;
    this.scene.environmentIntensity = 0.7;

    const anisotropy = Math.min(8, this.renderer.capabilities.getMaxAnisotropy());
    const grain = new CanvasTexture(grainCanvas());
    grain.colorSpace = NoColorSpace;
    grain.wrapS = RepeatWrapping;
    grain.wrapT = RepeatWrapping;
    grain.repeat.set(3, 3 * HEIGHT);

    const width = TEXTURE_WIDTH[this.quality.tier];
    this.cover = new PrintedFace(width, grain, anisotropy);
    this.inside = new PrintedFace(width, grain, anisotropy);
    this.message = new PrintedFace(width, grain, anisotropy);
    this.back = new PrintedFace(width, grain, anisotropy);
    this.edge = new MeshStandardMaterial({ color: '#efe2cc', roughness: 0.9 });

    this.buildCard();

    this.leaves = new Leaves(Math.round(this.quality.leaves * 0.5));
    this.dust = new Dust(Math.round(this.quality.dust * 0.5), this.pixelRatio);
    this.dust.points.position.z = -2.5;

    this.placeOrnaments();

    this.key.position.set(2.2, 3, 4);
    this.rim.position.set(-1.6, 1.4, -1.8);
    this.scene.add(
      this.root,
      this.leaves.mesh,
      this.dust.points,
      this.spices.group,
      ...this.pumpkins.map((pumpkin) => pumpkin.group),
      this.key,
      this.rim,
      this.ambient,
    );

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.canvas);
    this.resizeObserver.observe(options.focus);
    this.intersection = new IntersectionObserver(([entry]) => {
      this.visible = entry?.isIntersecting ?? true;
      this.syncLoop();
    });
    this.intersection.observe(this.canvas);
    this.bindPointer();
    this.resize();
  }

  get isOpen(): boolean {
    return this.motion.openTarget === 1;
  }

  /** Paints the first card and compiles every shader before the stage is shown. */
  async prepare(content: CardContent): Promise<void> {
    await fontsReady();
    const pmrem = new PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    await Promise.race([
      this.loadPhoto(content.template),
      new Promise((resolve) => setTimeout(resolve, 3000)),
    ]);
    this.setContent(content, false);
    this.snapToTheme();
    await this.renderer.compileAsync(this.scene, this.camera);
  }

  start(): void {
    this.timer.connect(document);
    this.timer.reset();
    this.running = true;
    this.syncLoop();
    void this.loadModels();
  }

  /** Updates the printed card; `spin` turns it once to show off a new design. */
  setContent(content: CardContent, spin = true): void {
    const previous = this.content?.template;
    this.content = content;
    this.theme = THEMES[content.template];
    if (spin && previous && previous !== content.template && !this.options.reducedMotion) {
      this.motion.restYaw += Math.PI * 2;
    }
    this.paint();
  }

  setOpen(open: boolean): void {
    const target = open ? 1 : 0;
    if (target === this.motion.openTarget) return;
    this.motion.openTarget = target;
    this.options.onOpenChange?.(open);
  }

  toggle(): void {
    this.setOpen(!this.isOpen);
  }

  /** Plays the arrival again: the card flies in closed. */
  replay(): void {
    this.setOpen(false);
    if (!this.options.reducedMotion) this.motion.intro = 0;
  }

  /** Follows the phone's tilt. Must be called from a user gesture on iOS. */
  async enableTilt(): Promise<void> {
    const request = (
      DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }
    ).requestPermission;
    try {
      if (typeof request === 'function' && (await request()) !== 'granted') return;
    } catch {
      return;
    }
    window.addEventListener('deviceorientation', this.onOrientation, { passive: true });
  }

  dispose(): void {
    this.running = false;
    this.renderer.setAnimationLoop(null);
    this.timer.dispose();
    this.resizeObserver.disconnect();
    this.intersection.disconnect();
    window.removeEventListener('deviceorientation', this.onOrientation);
    this.renderer.dispose();
  }

  private buildCard(): void {
    const geometry = new BoxGeometry(1, HEIGHT, THICKNESS);
    const edges = [this.edge, this.edge, this.edge, this.edge];
    // BoxGeometry face order: +x, −x, +y, −y, +z (front), −z (back).
    const base = new Mesh(geometry, [...edges, this.message.material, this.back.material]);
    const cover = new Mesh(geometry, [...edges, this.cover.material, this.inside.material]);
    cover.position.x = 0.5;
    this.hinge.position.set(-0.5, 0, THICKNESS * 1.05);
    this.hinge.add(cover);
    this.spread.add(base, this.hinge);
    this.root.add(this.spread);
  }

  private placeOrnaments(): void {
    this.pumpkins.forEach((pumpkin, index) => {
      const spot = PUMPKIN_SPOTS[index];
      if (spot) pumpkin.group.scale.setScalar(spot.size);
    });
    // Leaves fall mostly behind the card, so they never hide the words for long.
    this.leaves.mesh.position.z = -3.5;
    // Spices circle the card in the picture plane, never in front of the words.
    this.spices.group.rotation.x = Math.PI / 2;
    this.spices.group.scale.setScalar(1.2);
    this.spices.group.position.z = -0.4;
  }

  private async loadModels(): Promise<void> {
    try {
      const [pumpkin, spices] = await Promise.all([
        loadGeometries(pumpkinModelUrl),
        loadGeometries(spicesModelUrl),
      ]);
      for (const item of this.pumpkins) item.adopt(pumpkin);
      this.spices.adopt(spices);
    } catch (error) {
      console.warn('3D models unavailable, keeping the procedural stand-ins.', error);
    }
  }

  private loadPhoto(template: CardTemplate): Promise<void> {
    if (this.photos.has(template)) return Promise.resolve();
    this.photos.set(template, null);
    const image = new Image();
    image.decoding = 'async';
    image.src = this.options.photos[template];
    return image
      .decode()
      .then(() => {
        this.photos.set(template, image);
        if (this.content?.template === template) this.paint();
      })
      .catch(() => console.warn(`[card] photo for "${template}" failed to load`));
  }

  private paint(): void {
    const content = this.content;
    if (!content) return;
    const theme = this.theme;
    const photo = this.photos.get(content.template) ?? null;
    if (!this.photos.has(content.template)) void this.loadPhoto(content.template);
    const width = this.cover.face.color.width;
    const loaded = photo ? 1 : 0;

    this.cover.paint(
      JSON.stringify([content.template, content.headline, content.to, loaded]),
      (face) =>
        paintCover(
          width,
          {
            theme,
            photo,
            headline: content.headline,
            to: content.to,
            brand: content.brand,
            product: content.product,
          },
          face,
        ),
    );
    this.inside.paint(JSON.stringify([content.template, content.quote, loaded]), (face) =>
      paintInside(width, { theme, photo, quote: content.quote, caption: content.caption }, face),
    );
    this.message.paint(
      JSON.stringify([
        content.template,
        content.greeting,
        content.message,
        content.closing,
        content.signature,
      ]),
      (face) =>
        paintMessage(
          width,
          {
            theme,
            greeting: content.greeting,
            message: content.message,
            closing: content.closing,
            signature: content.signature,
            brand: content.brand,
          },
          face,
        ),
    );
    this.back.paint(JSON.stringify([content.template, content.motto]), (face) =>
      paintBack(
        width,
        {
          theme,
          brand: content.brand,
          product: content.product,
          motto: content.motto,
          address: content.address,
        },
        face,
      ),
    );
    this.edge.color.set(theme.paper);
  }

  /** Jumps lights and weather to the current theme (no cross-fade on first show). */
  private snapToTheme(): void {
    const mix = WEATHER[this.theme.weather];
    this.weather = { leaves: mix.leaves, dust: mix.dust, snow: mix.snow, frost: this.theme.frost };
    this.light.set(this.theme.light);
    this.rim.color.set(this.theme.rim);
    this.fog.set(this.theme.night);
  }

  private bindPointer(): void {
    const canvas = this.canvas;
    canvas.addEventListener('pointerdown', (event) => {
      if (event.button !== 0 || this.drag) return;
      const now = performance.now();
      this.drag = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        startX: event.clientX,
        startY: event.clientY,
        start: now,
        last: now,
        moved: false,
      };
      this.motion.yawVelocity = 0;
      this.motion.pitchVelocity = 0;
    });

    canvas.addEventListener('pointermove', (event) => {
      const rect = canvas.getBoundingClientRect();
      if (event.pointerType === 'mouse') {
        this.hover.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.hover.y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      }
      const drag = this.drag;
      if (!drag || drag.id !== event.pointerId) return;
      const now = performance.now();
      const dt = Math.max(1, now - drag.last) / 1000;
      const dx = event.clientX - drag.x;
      const dy = event.clientY - drag.y;
      drag.x = event.clientX;
      drag.y = event.clientY;
      drag.last = now;
      if (Math.hypot(drag.x - drag.startX, drag.y - drag.startY) > TAP_DISTANCE) {
        if (!drag.moved) canvas.setPointerCapture(event.pointerId);
        drag.moved = true;
      }
      if (!drag.moved) return;
      const yaw = (dx / rect.width) * 3.4;
      const pitch = (dy / rect.height) * 1.6;
      const m = this.motion;
      m.yaw += yaw;
      m.pitch = clamp(m.pitch + pitch, 0.55);
      m.yawVelocity = damp(m.yawVelocity, yaw / dt, 18, dt);
      m.pitchVelocity = damp(m.pitchVelocity, pitch / dt, 18, dt);
    });

    const release = (event: PointerEvent, cancelled: boolean): void => {
      const drag = this.drag;
      if (!drag || drag.id !== event.pointerId) return;
      this.drag = null;
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
      const m = this.motion;
      if (!cancelled && !drag.moved && performance.now() - drag.start < TAP_TIME) {
        this.tap();
        return;
      }
      // Throwing the card can flip it over: settle on whichever side it lands.
      m.restYaw = Math.round((m.yaw + m.yawVelocity * 0.25) / Math.PI) * Math.PI;
    };
    canvas.addEventListener('pointerup', (event) => release(event, false));
    canvas.addEventListener('pointercancel', (event) => release(event, true));
    canvas.addEventListener('pointerleave', () => {
      this.hover.x = 0;
      this.hover.y = 0;
    });
  }

  private tap(): void {
    const m = this.motion;
    if (Math.cos(m.restYaw) < 0) {
      // Showing the back: turn the card face up first.
      m.restYaw += Math.PI;
      return;
    }
    this.toggle();
  }

  private readonly onOrientation = (event: DeviceOrientationEvent): void => {
    if (event.beta === null || event.gamma === null) return;
    const t = this.tilt;
    if (Number.isNaN(t.baseBeta)) {
      t.baseBeta = event.beta;
      t.baseGamma = event.gamma;
    }
    // Slowly re-centre, so the way the phone is held becomes the new neutral.
    t.baseBeta += (event.beta - t.baseBeta) * 0.01;
    t.baseGamma += (event.gamma - t.baseGamma) * 0.01;
    t.x = clamp(((event.gamma - t.baseGamma) * Math.PI) / 180, 0.4);
    t.y = clamp(((event.beta - t.baseBeta) * Math.PI) / 180, 0.35);
  };

  private syncLoop(): void {
    const active = this.running && this.visible;
    this.renderer.setAnimationLoop(active ? (time) => this.frame(time) : null);
  }

  private resize(): void {
    const canvas = this.canvas.getBoundingClientRect();
    const focus = this.options.focus.getBoundingClientRect();
    const width = Math.max(1, canvas.width);
    const height = Math.max(1, canvas.height);
    Object.assign(this.view, { width, height });
    Object.assign(this.focusRect, {
      x: focus.left - canvas.left,
      y: focus.top - canvas.top,
      width: Math.max(1, focus.width),
      height: Math.max(1, focus.height),
    });
    this.spreadLayout =
      this.focusRect.width >= SPREAD_MIN_WIDTH &&
      this.focusRect.width / this.focusRect.height >= 0.75;
    // Shift the projection so the world origin sits at the centre of the focus frame.
    this.camera.aspect = width / height;
    this.camera.setViewOffset(
      width,
      height,
      width / 2 - (this.focusRect.x + this.focusRect.width / 2),
      height / 2 - (this.focusRect.y + this.focusRect.height / 2),
      width,
      height,
    );
    this.renderer.setPixelRatio(this.pixelRatio);
    this.renderer.setSize(width, height, false);
    this.dust.setPixelRatio(this.pixelRatio);
  }

  private adapt(delta: number): void {
    this.slowFrames = delta > SLOW_FRAME ? this.slowFrames + 1 : Math.max(0, this.slowFrames - 1);
    if (this.slowFrames > 90 && this.pixelRatio > MIN_DPR) {
      this.pixelRatio = Math.max(MIN_DPR, this.pixelRatio - 0.25);
      this.slowFrames = 0;
      this.resize();
    }
  }

  private frame(timestamp: number): void {
    this.timer.update(timestamp);
    const delta = Math.min(this.timer.getDelta(), 0.1);
    const reduced = this.options.reducedMotion;
    const time = this.timer.getElapsed() * (reduced ? 0.25 : 1);
    this.adapt(delta);

    const m = this.motion;
    m.intro = reduced ? 1 : Math.min(1, m.intro + delta / 1.8);
    const arrival = easeOut(m.intro);

    // Opening: a slightly under-damped spring, so the cover settles with a little sway.
    const stiffness = reduced ? 160 : 42;
    m.openVelocity += (m.openTarget - m.open) * stiffness * delta;
    m.openVelocity *= Math.exp(-(reduced ? 25 : 9) * delta);
    m.open = Math.min(1.04, Math.max(-0.02, m.open + m.openVelocity * delta));

    if (!this.drag) {
      m.yawVelocity += (m.restYaw - m.yaw) * 26 * delta;
      m.yawVelocity *= Math.exp(-7 * delta);
      m.yaw += m.yawVelocity * delta;
      m.pitchVelocity += -m.pitch * 30 * delta;
      m.pitchVelocity *= Math.exp(-8 * delta);
      m.pitch += m.pitchVelocity * delta;
    }
    m.hoverX = damp(m.hoverX, reduced ? 0 : this.hover.x, 3, delta);
    m.hoverY = damp(m.hoverY, reduced ? 0 : this.hover.y, 3, delta);
    m.tiltX = damp(m.tiltX, this.tilt.x, 6, delta);
    m.tiltY = damp(m.tiltY, this.tilt.y, 6, delta);

    const spread = this.spreadLayout;
    const open = Math.max(0, m.open);
    this.hinge.rotation.y = -m.open * OPEN_ANGLE;
    // Wide frames show the whole spread; narrow ones keep the message page centred.
    this.spread.position.x = spread ? open * 0.49 : 0;

    const idle = reduced ? 0 : 1;
    this.root.rotation.set(
      m.pitch + m.hoverY * 0.12 + m.tiltY * 0.6 + Math.sin(time * 0.7) * 0.025 * idle,
      m.yaw + m.hoverX * 0.18 + m.tiltX * 0.7 + (1 - arrival) * -1.4,
      Math.sin(time * 0.5) * 0.015 * idle,
    );
    this.root.position.set(
      0,
      Math.sin(time * 0.9) * 0.03 * idle - (1 - arrival) * 1.2,
      (1 - arrival) * -2.5,
    );

    this.frameCamera(spread ? 1 + open * 0.98 : 1, delta);
    this.updateWorld(delta, time);
    this.renderer.render(this.scene, this.camera);
  }

  /** Keeps the card (closed or open) fully in view, at any aspect ratio. */
  private frameCamera(width: number, delta: number): void {
    const tanHalf = Math.tan((FOV * Math.PI) / 360);
    const { view, focusRect: frame } = this;
    const aspect = view.width / view.height;
    const distance =
      Math.max(
        (HEIGHT / 2 / tanHalf) * (view.height / frame.height),
        (width / 2 / (tanHalf * aspect)) * (view.width / frame.width),
      ) * this.options.margin;
    const camera = this.camera;
    camera.position.z =
      camera.position.z === 0 ? distance : damp(camera.position.z, distance, 3, delta);
    camera.position.x = damp(camera.position.x, this.motion.hoverX * -0.08, 2, delta);
    camera.position.y = damp(camera.position.y, this.motion.hoverY * 0.06, 2, delta);
    camera.lookAt(0, 0, 0);
    this.leaves.setBounds(tanHalf * camera.position.z * aspect);
  }

  private updateWorld(delta: number, time: number): void {
    const theme = this.theme;
    const mix = WEATHER[theme.weather];
    const w = this.weather;
    w.leaves = damp(w.leaves, mix.leaves, 1.5, delta);
    w.dust = damp(w.dust, mix.dust, 1.5, delta);
    w.snow = damp(w.snow, mix.snow, 1.5, delta);
    w.frost = damp(w.frost, theme.frost, 1.5, delta);

    this.target.light.set(theme.light);
    this.target.rim.set(theme.rim);
    this.target.fog.set(theme.night);
    const blend = 1 - Math.exp(-2 * delta);
    this.light.lerp(this.target.light, blend);
    this.rim.color.lerp(this.target.rim, blend);
    this.fog.lerp(this.target.fog, blend);
    this.key.color.copy(this.light);

    const pace = this.options.reducedMotion ? 0.2 : 1;
    this.leaves.mesh.visible = w.leaves > 0.02;
    this.leaves.update(delta * pace, w.leaves, 0.3, w.frost, this.fog, this.light);
    const ember = this.dust.points.material.uniforms['uEmber']?.value as Color | undefined;
    ember?.lerp(this.target.ember.set(mix.ember), blend);
    this.dust.points.visible = w.dust > 0.02;
    this.dust.update(delta * pace, time, w.snow, w.dust);

    this.spices.update(time, 1);
    this.pumpkins.forEach((pumpkin, index) => {
      const spot = PUMPKIN_SPOTS[index];
      if (!spot) return;
      pumpkin.setFrost(w.frost);
      pumpkin.group.position.set(spot.x, spot.y + Math.sin(time * 0.8 + index * 2) * 0.05, spot.z);
      pumpkin.group.rotation.set(
        Math.sin(time * 0.4 + index) * 0.12,
        time * (0.18 + index * 0.1) + index * 2,
        Math.cos(time * 0.3 + index) * 0.08,
      );
    });
  }
}
