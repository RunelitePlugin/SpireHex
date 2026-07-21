/**
 * Procedural sound effects (spec §9) — raw Web Audio API, zero external assets.
 *
 * Layer rules: plain Phaser-free TS (tripwired via META_FILES in
 * tests/architecture/simPurity.test.ts). No JS non-seeded RNG calls here (game-layer
 * tripwire) — the Task-2 noise buffer uses the seeded PRNG from src/art/rand. Nothing in
 * src/sim, src/content, or src/art may import this module: their tripwires ban
 * src/game imports wholesale. Headless-safe: with no AudioContext (node/vitest)
 * every call is a silent no-op, so audio can never disturb the deterministic sim.
 */
import type { AttackElement } from '../content/elements';
import { mulberry32 } from '../art/rand';
import { loadSave, writeSave } from './save';

export type SfxId =
  | 'place'      // tower placement lands
  | 'impact'     // shot connects (plays with the firing voice; hitscan combat)
  | 'death'      // enemy killed
  | 'leak'       // enemy reached the exit — the "you are losing lives" alarm
  | 'waveStart'  // a wave begins (manual, early-call, or auto-countdown)
  | 'victory'
  | 'defeat'
  | 'click'      // any UI button
  | `fire-${AttackElement}`; // one firing voice per element family (spec §9)

/** An oscillator sweep: freqStart→freqEnd (exponential) over duration, gain decaying to silence. */
export interface TonePart {
  kind: 'tone';
  wave: OscillatorType;
  freqStart: number;
  freqEnd: number;
  duration: number;
  gain: number;
  /** Seconds after play() this part begins (default 0) — builds jingles/arpeggios. */
  delay?: number;
}

/** A burst from the shared seeded-noise buffer; playbackRate colors it (higher = hissier). */
export interface NoisePart {
  kind: 'noise';
  duration: number;
  gain: number;
  delay?: number;
  playbackRate?: number;
}

export type SfxPart = TonePart | NoisePart;

/**
 * Every SFX is 1–4 data-only parts — tuning a sound never touches engine code.
 * Timbre language mirrors the art doc's element language: fire rasps down,
 * frost chirps up and icy, nature thwips low, storm zaps wide, radiant pings
 * bright, shadow pulses sub-bass.
 */
export const SFX_RECIPES: Record<SfxId, readonly SfxPart[]> = {
  click: [{ kind: 'tone', wave: 'square', freqStart: 900, freqEnd: 700, duration: 0.03, gain: 0.12 }],
  place: [
    { kind: 'tone', wave: 'triangle', freqStart: 200, freqEnd: 420, duration: 0.1, gain: 0.25 },
    { kind: 'noise', duration: 0.06, gain: 0.1, playbackRate: 0.9 },
  ],
  impact: [{ kind: 'noise', duration: 0.045, gain: 0.1, playbackRate: 1.6 }],
  death: [
    { kind: 'noise', duration: 0.14, gain: 0.16, playbackRate: 0.7 },
    { kind: 'tone', wave: 'sawtooth', freqStart: 320, freqEnd: 90, duration: 0.13, gain: 0.14 },
  ],
  leak: [
    { kind: 'tone', wave: 'sawtooth', freqStart: 220, freqEnd: 70, duration: 0.35, gain: 0.28 },
    { kind: 'tone', wave: 'square', freqStart: 150, freqEnd: 55, duration: 0.3, gain: 0.16, delay: 0.06 },
  ],
  waveStart: [
    { kind: 'tone', wave: 'triangle', freqStart: 262, freqEnd: 392, duration: 0.16, gain: 0.22 },
    { kind: 'tone', wave: 'triangle', freqStart: 392, freqEnd: 523, duration: 0.2, gain: 0.22, delay: 0.14 },
  ],
  victory: [
    { kind: 'tone', wave: 'triangle', freqStart: 523, freqEnd: 523, duration: 0.16, gain: 0.2 },
    { kind: 'tone', wave: 'triangle', freqStart: 659, freqEnd: 659, duration: 0.16, gain: 0.2, delay: 0.12 },
    { kind: 'tone', wave: 'triangle', freqStart: 784, freqEnd: 784, duration: 0.16, gain: 0.2, delay: 0.24 },
    { kind: 'tone', wave: 'triangle', freqStart: 1047, freqEnd: 1047, duration: 0.4, gain: 0.22, delay: 0.36 },
  ],
  defeat: [
    { kind: 'tone', wave: 'sawtooth', freqStart: 220, freqEnd: 110, duration: 0.4, gain: 0.22 },
    { kind: 'tone', wave: 'sawtooth', freqStart: 165, freqEnd: 82, duration: 0.5, gain: 0.22, delay: 0.22 },
  ],
  'fire-fire': [
    { kind: 'tone', wave: 'sawtooth', freqStart: 480, freqEnd: 150, duration: 0.12, gain: 0.2 },
    { kind: 'noise', duration: 0.06, gain: 0.07, playbackRate: 1.2 },
  ],
  'fire-frost': [{ kind: 'tone', wave: 'sine', freqStart: 880, freqEnd: 1400, duration: 0.09, gain: 0.16 }],
  'fire-nature': [{ kind: 'tone', wave: 'triangle', freqStart: 300, freqEnd: 170, duration: 0.1, gain: 0.18 }],
  'fire-storm': [
    { kind: 'tone', wave: 'square', freqStart: 1300, freqEnd: 160, duration: 0.13, gain: 0.16 },
    { kind: 'noise', duration: 0.05, gain: 0.08, playbackRate: 2 },
  ],
  'fire-radiant': [{ kind: 'tone', wave: 'sine', freqStart: 660, freqEnd: 990, duration: 0.1, gain: 0.16 }],
  'fire-shadow': [{ kind: 'tone', wave: 'sine', freqStart: 150, freqEnd: 65, duration: 0.18, gain: 0.24 }],
  'fire-neutral': [{ kind: 'tone', wave: 'square', freqStart: 420, freqEnd: 300, duration: 0.07, gain: 0.14 }],
};

/**
 * Structural slice of the Web Audio API the engine needs — injectable so vitest
 * drives a fake and the browser passes a real AudioContext.
 */
export interface AudioParamLike {
  setValueAtTime(value: number, time: number): void;
  exponentialRampToValueAtTime(value: number, time: number): void;
}
export interface OscillatorLike {
  type: OscillatorType;
  frequency: AudioParamLike;
  connect(target: unknown): void;
  start(when: number): void;
  stop(when: number): void;
}
export interface BufferSourceLike {
  buffer: unknown;
  playbackRate: AudioParamLike;
  connect(target: unknown): void;
  start(when: number): void;
  stop(when: number): void;
}
export interface GainLike {
  gain: AudioParamLike;
  connect(target: unknown): void;
}
export interface NoiseBufferLike {
  getChannelData(channel: number): Float32Array;
}
export interface AudioContextLike {
  readonly destination: unknown;
  readonly sampleRate: number;
  readonly currentTime: number;
  readonly state: 'suspended' | 'running' | 'closed' | 'interrupted';
  resume(): Promise<void>;
  createGain(): GainLike;
  createOscillator(): OscillatorLike;
  createBuffer(channels: number, length: number, sampleRate: number): NoiseBufferLike;
  createBufferSource(): BufferSourceLike;
}

/** Same-id plays inside this window collapse into one voice (chain hits, swarm deaths, tower volleys). */
export const MIN_REPLAY_GAP = 0.045;

function defaultContextFactory(): AudioContextLike | null {
  // node/vitest (and any browser without Web Audio): audio becomes a silent no-op.
  if (typeof AudioContext === 'undefined') return null;
  try {
    return new AudioContext() as unknown as AudioContextLike;
  } catch {
    // A throwing constructor (context-limit or exotic-browser edge) must never
    // escape the first-gesture unlock listener — audio can never break the game.
    return null;
  }
}

export class AudioEngine {
  /** UI toggle, persisted via SaveData.settings (toggleMute). Muting never tears the context down. */
  muted = false;
  /** Lifetime voices actually started — the headless/browser verification hook (Task 11 asserts on it). */
  played = 0;
  private ctx: AudioContextLike | null = null;
  private noise: NoiseBufferLike | null = null;
  private lastPlayed = new Map<SfxId, number>();
  private primed = false;

  constructor(private readonly createContext: () => AudioContextLike | null = defaultContextFactory) {}

  /** 'none' until unlock() succeeds — then the underlying AudioContext state. */
  get contextState(): string {
    return this.ctx === null ? 'none' : this.ctx.state;
  }

  /** The live context (null until unlock) — the music sequencer's bus rides the same context. */
  get context(): AudioContextLike | null {
    return this.ctx;
  }

  /**
   * Create/resume the context. MUST first be called from a user-gesture handler
   * (browser autoplay policy) — main.ts installs one-shot capture listeners
   * (pointerdown/keydown/touchend) for exactly this. Inside that first gesture
   * it also starts a 1-sample silent buffer: the iOS pattern that unmutes the
   * page's audio channel. Idempotent; safe to call anywhere afterward.
   */
  unlock(): void {
    if (this.ctx === null) {
      this.ctx = this.createContext();
      this.primed = false;
    }
    const ctx = this.ctx;
    if (ctx === null) return;
    if (!this.primed) {
      const prime = ctx.createBufferSource();
      prime.buffer = ctx.createBuffer(1, 1, ctx.sampleRate); // one silent sample
      prime.connect(ctx.destination);
      prime.start(0);
      prime.stop(ctx.currentTime + 0.02);
      this.primed = true;
    }
    this.resume();
  }

  /**
   * Resume an EXISTING context from any resumable state — 'suspended' and iOS's
   * 'interrupted' alike (anything that is not running and not closed). Never
   * creates a context: safe outside user gestures (visibilitychange).
   */
  resume(): void {
    const ctx = this.ctx;
    if (ctx !== null && ctx.state !== 'running' && ctx.state !== 'closed') void ctx.resume();
  }

  /** Fire-and-forget. Silent no-op when muted, still locked, or headless. */
  play(id: SfxId): void {
    const ctx = this.ctx;
    if (this.muted || ctx === null || ctx.state !== 'running') return;
    const now = ctx.currentTime;
    const last = this.lastPlayed.get(id);
    if (last !== undefined && now - last < MIN_REPLAY_GAP) return;
    this.lastPlayed.set(id, now);
    for (const part of SFX_RECIPES[id]) this.playPart(ctx, part, now + (part.delay ?? 0));
    this.played += 1;
  }

  private playPart(ctx: AudioContextLike, part: SfxPart, t0: number): void {
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(part.gain, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + part.duration); // decay to silence
    gain.connect(ctx.destination);
    if (part.kind === 'tone') {
      const osc = ctx.createOscillator();
      osc.type = part.wave;
      osc.frequency.setValueAtTime(part.freqStart, t0);
      osc.frequency.exponentialRampToValueAtTime(part.freqEnd, t0 + part.duration);
      osc.connect(gain);
      osc.start(t0);
      osc.stop(t0 + part.duration + 0.02);
    } else {
      const src = ctx.createBufferSource();
      src.buffer = this.noiseBuffer(ctx);
      src.playbackRate.setValueAtTime(part.playbackRate ?? 1, t0);
      src.connect(gain);
      src.start(t0);
      src.stop(t0 + part.duration + 0.02);
    }
  }

  /** Half a second of white noise, seeded and deterministic — never the built-in RNG — built once per context. */
  private noiseBuffer(ctx: AudioContextLike): NoiseBufferLike {
    if (this.noise === null) {
      const length = Math.ceil(ctx.sampleRate * 0.5);
      const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      const rng = mulberry32(0xa0d10);
      for (let i = 0; i < length; i++) data[i] = rng() * 2 - 1;
      this.noise = buffer;
    }
    return this.noise;
  }
}

/** THE game-wide audio engine. main.ts unlocks it and seeds `muted` from the save (Task 4). */
export const audio = new AudioEngine();

/** Flip mute, persist it into the save's settings, return the new muted state (drives button labels). */
export function toggleMute(): boolean {
  audio.muted = !audio.muted;
  const save = loadSave();
  save.settings.muted = audio.muted;
  writeSave(save);
  return audio.muted;
}
