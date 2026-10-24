import { moodState, type Mood } from '../state.ts';

/** D minor, voiced warm and open. Frequencies in Hz. */
const CHORDS: readonly (readonly number[])[] = [
  [73.42, 146.83, 174.61, 220.0, 261.63], // Dm9
  [58.27, 116.54, 146.83, 174.61, 220.0], // Bbmaj7
  [49.0, 98.0, 146.83, 174.61, 233.08], // Gm9
  [55.0, 110.0, 146.83, 196.0, 220.0], // Asus
];

/** D minor pentatonic for the falling "leaf" notes. */
const BELLS = [587.33, 698.46, 783.99, 880.0, 1046.5, 1174.66, 1396.91];

const MOOD_TONE: Record<Mood, { cutoff: number; bellChance: number }> = {
  october: { cutoff: 900, bellChance: 0.55 },
  ember: { cutoff: 1400, bellChance: 0.7 },
  frost: { cutoff: 420, bellChance: 0.25 },
  forever: { cutoff: 1100, bellChance: 0.6 },
};

const CHORD_SECONDS = 9;
const MASTER_LEVEL = 0.42;

/**
 * A small generative score: a slow pad, autumn wind and sparse bell notes like
 * falling leaves. Built entirely with Web Audio — no audio files to download.
 */
export class AmbientScore {
  private readonly ctx: AudioContext;
  private readonly master: GainNode;
  private readonly reverb: ConvolverNode;
  private readonly padFilter: BiquadFilterNode;
  private timers: number[] = [];
  private chordIndex = 0;
  private playing = false;

  constructor() {
    this.ctx = new AudioContext();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(this.ctx.destination);

    this.reverb = this.ctx.createConvolver();
    this.reverb.buffer = this.impulse(4.5, 2.6);
    const wet = this.ctx.createGain();
    wet.gain.value = 0.7;
    this.reverb.connect(wet).connect(this.master);

    this.padFilter = this.ctx.createBiquadFilter();
    this.padFilter.type = 'lowpass';
    this.padFilter.frequency.value = MOOD_TONE.october.cutoff;
    this.padFilter.Q.value = 0.7;
    this.padFilter.connect(this.master);
    this.padFilter.connect(this.reverb);

    this.startWind();
  }

  get isPlaying(): boolean {
    return this.playing;
  }

  async play(): Promise<void> {
    await this.ctx.resume();
    this.playing = true;
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setTargetAtTime(MASTER_LEVEL, now, 1.2);
    this.nextChord();
    this.scheduleBell();
    this.timers.push(window.setInterval(() => this.followMood(), 500));
  }

  pause(): void {
    this.playing = false;
    this.timers.forEach((id) => window.clearTimeout(id));
    this.timers = [];
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setTargetAtTime(0, now, 0.4);
    window.setTimeout(() => {
      if (!this.playing) void this.ctx.suspend();
    }, 2000);
  }

  private followMood(): void {
    const tone = MOOD_TONE[moodState.current];
    this.padFilter.frequency.setTargetAtTime(tone.cutoff, this.ctx.currentTime, 1.5);
  }

  private nextChord(): void {
    if (!this.playing) return;
    const chord = CHORDS[this.chordIndex % CHORDS.length] ?? CHORDS[0] ?? [];
    this.chordIndex += 1;
    const start = this.ctx.currentTime;
    const end = start + CHORD_SECONDS + 3;

    chord.forEach((frequency, voice) => {
      [-6, 6].forEach((detune) => {
        const osc = this.ctx.createOscillator();
        osc.type = voice === 0 ? 'sine' : 'triangle';
        osc.frequency.value = frequency;
        osc.detune.value = detune;
        const gain = this.ctx.createGain();
        const level = voice === 0 ? 0.09 : 0.035;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(level, start + 3);
        gain.gain.setValueAtTime(level, end - 3);
        gain.gain.linearRampToValueAtTime(0, end);
        osc.connect(gain).connect(this.padFilter);
        osc.start(start);
        osc.stop(end + 0.1);
      });
    });

    this.timers.push(window.setTimeout(() => this.nextChord(), CHORD_SECONDS * 1000));
  }

  private scheduleBell(): void {
    if (!this.playing) return;
    if (Math.random() < MOOD_TONE[moodState.current].bellChance) this.bell();
    const wait = 1400 + Math.random() * 2600;
    this.timers.push(window.setTimeout(() => this.scheduleBell(), wait));
  }

  private bell(): void {
    const frequency = BELLS[Math.floor(Math.random() * BELLS.length)] ?? 880;
    const start = this.ctx.currentTime;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.05, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 4);
    const pan = this.ctx.createStereoPanner();
    pan.pan.value = Math.random() * 1.4 - 0.7;
    gain.connect(pan);
    pan.connect(this.reverb);
    pan.connect(this.master);

    [1, 2.01, 3.98].forEach((ratio, partial) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = frequency * ratio;
      const partialGain = this.ctx.createGain();
      partialGain.gain.value = [1, 0.35, 0.12][partial] ?? 0.1;
      osc.connect(partialGain).connect(gain);
      osc.start(start);
      osc.stop(start + 4.2);
    });
  }

  private startWind(): void {
    const length = this.ctx.sampleRate * 4;
    const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let brown = 0;
    for (let i = 0; i < length; i += 1) {
      brown = (brown + 0.02 * (Math.random() * 2 - 1)) / 1.02;
      data[i] = brown * 3.5;
    }
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const band = this.ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.frequency.value = 500;
    band.Q.value = 0.6;

    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoDepth = this.ctx.createGain();
    lfoDepth.gain.value = 260;
    lfo.connect(lfoDepth).connect(band.frequency);

    const gain = this.ctx.createGain();
    gain.gain.value = 0.16;
    source.connect(band).connect(gain).connect(this.master);
    source.start();
    lfo.start();
  }

  private impulse(seconds: number, decay: number): AudioBuffer {
    const length = Math.floor(this.ctx.sampleRate * seconds);
    const buffer = this.ctx.createBuffer(2, length, this.ctx.sampleRate);
    for (let channel = 0; channel < 2; channel += 1) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < length; i += 1) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** decay;
      }
    }
    return buffer;
  }
}

/** Wires the header sound toggle; the audio graph is created on first press. */
export function initSoundToggle(): void {
  const button = document.querySelector<HTMLButtonElement>('[data-sound]');
  if (!button || typeof AudioContext === 'undefined') {
    button?.remove();
    return;
  }

  let score: AmbientScore | null = null;
  button.addEventListener('click', () => {
    score ??= new AmbientScore();
    const turningOn = !score.isPlaying;
    if (turningOn) void score.play();
    else score.pause();
    button.setAttribute('aria-pressed', String(turningOn));
    button.setAttribute(
      'aria-label',
      (turningOn ? button.dataset['labelOff'] : button.dataset['labelOn']) ?? '',
    );
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && score?.isPlaying) {
      score.pause();
      button.setAttribute('aria-pressed', 'false');
      button.setAttribute('aria-label', button.dataset['labelOn'] ?? '');
    }
  });
}
