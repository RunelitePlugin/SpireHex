/**
 * Procedural music sequencer (spec §8) — rides the SAME Web Audio context as
 * the SFX engine (src/game/audio.ts). Plain Phaser-free TS, tripwired via
 * META_FILES. Tracks are pure data like SFX_RECIPES: 4-bar chord progressions
 * with authored 16-step pad/bass patterns; the lead line is generated from
 * SEEDED pentatonic picks (the art-layer rand module — never the built-in
 * RNG, which the game-layer tripwire bans). Headless-safe: without a running
 * context every pump is a silent no-op, so music can never disturb the sim.
 */
import { hashString, mulberry32 } from '../art/rand';
import { audio, type AudioContextLike, type GainLike, type NoiseBufferLike } from './audio';
import { loadSave, writeSave } from './save';

export type MusicTrackId = 'title' | 'ember' | 'frost' | 'verdant' | 'storm' | 'radiant' | 'umbral';

/** A step is a semitone offset from the current bar's chord root; null = rest. */
export type StepNote = number | null;

export interface MusicVoice {
  wave: OscillatorType;
  gain: number;
  /** Seconds to decay to silence (exponential ramp, same envelope as SFX). */
  decay: number;
  /** Octave shift added as 12·octave semitones. */
  octave: number;
  steps: readonly StepNote[];
  /** Play the full triad: [note, note+third(bar), note+7]. */
  chord?: boolean;
}

/** The generated melody voice: seeded picks from a KEY-root pentatonic scale. */
export interface LeadVoice {
  wave: OscillatorType;
  gain: number;
  decay: number;
  octave: number;
  /** Semitone offsets from the TRACK root (not the chord) — key-safe by construction. */
  scale: readonly number[];
  /** Probability a 16th step carries a note (seeded, deterministic). */
  density: number;
}

/** 16th-note noise hat (intensity layer 2 only). */
export interface NoiseVoice {
  gain: number;
  playbackRate: number;
  duration: number;
  steps: readonly (0 | 1)[];
}

export interface MusicTrackDef {
  id: MusicTrackId;
  bpm: number;
  /** Root pitch in Hz (the key's tonic). */
  root: number;
  /** 4 bars of chord-root semitone offsets from the root. */
  progression: readonly number[];
  /** Chord quality per bar: 3 = minor third, 4 = major third. */
  thirds: readonly number[];
  pad: MusicVoice;
  bass: MusicVoice;
  lead: LeadVoice;
  hat: NoiseVoice;
}

export const STEPS_PER_BAR = 16;
/** The seeded lead repeats every 4 loops (16 bars) — long enough to breathe, still deterministic. */
export const LEAD_LOOP_CYCLE = 4;
/** How far ahead pump() schedules (seconds). Pumped every ~100 ms by start(). */
export const SCHEDULE_HORIZON = 0.3;
/**
 * P15 polish (P10-carried "hidden-tab sputter"): background tabs throttle
 * timers to ~1 pump/second, starving a 0.3 s lookahead into audible gaps.
 * A hidden tab schedules 2 s ahead instead — enough to bridge throttled
 * pumps; jitter does not matter when nobody is watching the tab.
 */
export const HIDDEN_SCHEDULE_HORIZON = 2;
/** Master music bus gain — music sits UNDER the SFX (quiet-UI philosophy, art doc). */
export const MUSIC_MASTER_GAIN = 0.6;

export function noteFreq(root: number, semitones: number): number {
  return root * Math.pow(2, semitones / 12);
}

const REST = null;

export const MUSIC_TRACKS: Record<MusicTrackId, MusicTrackDef> = {
  // Title: A minor, Am–F–C–G. Gentle, slow, sine/triangle — the vista breathes.
  title: {
    id: 'title',
    bpm: 72,
    root: 110, // A2
    progression: [0, -4, 3, -2], // Am, F, C, G
    thirds: [3, 4, 4, 4],
    pad: {
      wave: 'triangle', gain: 0.1, decay: 3.0, octave: 1, chord: true,
      steps: [0, REST, REST, REST, REST, REST, REST, REST, REST, REST, REST, REST, REST, REST, REST, REST],
    },
    bass: {
      wave: 'sine', gain: 0.16, decay: 0.6, octave: 0,
      steps: [0, REST, REST, REST, REST, REST, REST, REST, 7, REST, REST, REST, REST, REST, REST, REST],
    },
    lead: { wave: 'sine', gain: 0.09, decay: 0.5, octave: 2, scale: [0, 3, 5, 7, 10, 12], density: 0.22 },
    hat: { gain: 0.04, playbackRate: 2.6, duration: 0.03, steps: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0] },
  },
  // Ember Wastes: E minor, Em–C–G–D. Driving quarter-note bass with fifth pickups.
  ember: {
    id: 'ember',
    bpm: 100,
    root: 82.41, // E2
    progression: [0, 8, 3, 10], // Em, C, G, D
    thirds: [3, 4, 4, 4],
    pad: {
      wave: 'triangle', gain: 0.09, decay: 2.4, octave: 1, chord: true,
      steps: [0, REST, REST, REST, REST, REST, REST, REST, REST, REST, REST, REST, REST, REST, REST, REST],
    },
    bass: {
      wave: 'triangle', gain: 0.17, decay: 0.28, octave: 0,
      steps: [0, REST, REST, REST, 0, REST, REST, REST, 0, REST, 7, REST, 0, REST, 7, REST],
    },
    lead: { wave: 'square', gain: 0.06, decay: 0.22, octave: 2, scale: [0, 3, 5, 7, 10, 12], density: 0.35 },
    hat: { gain: 0.05, playbackRate: 2.4, duration: 0.03, steps: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0] },
  },
  // Frostfell: D minor, Dm–Bb–F–C. Slow glassy sines over a sparse walking bass.
  frost: {
    id: 'frost',
    bpm: 84,
    root: 73.42, // D2
    progression: [0, 8, 3, 10], // Dm, Bb, F, C
    thirds: [3, 4, 4, 4],
    pad: {
      wave: 'sine', gain: 0.11, decay: 2.8, octave: 1, chord: true,
      steps: [0, REST, REST, REST, REST, REST, REST, REST, REST, REST, REST, REST, REST, REST, REST, REST],
    },
    bass: {
      wave: 'sine', gain: 0.16, decay: 0.5, octave: 0,
      steps: [0, REST, REST, REST, REST, REST, 7, REST, 0, REST, REST, REST, 12, REST, REST, REST],
    },
    lead: { wave: 'triangle', gain: 0.08, decay: 0.4, octave: 2, scale: [0, 3, 5, 7, 10, 12], density: 0.28 },
    hat: { gain: 0.04, playbackRate: 3.2, duration: 0.025, steps: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0] },
  },
  // Verdant Deep: G minor, Gm–Bb–C–F. Rolling syncopated bass, warm triangle pad.
  verdant: {
    id: 'verdant',
    bpm: 96,
    root: 98.0, // G2
    progression: [0, 3, 5, 10], // Gm, Bb, C, F
    thirds: [3, 4, 4, 4],
    pad: {
      wave: 'triangle', gain: 0.1, decay: 2.6, octave: 1, chord: true,
      steps: [0, REST, REST, REST, REST, REST, REST, REST, REST, REST, REST, REST, REST, REST, REST, REST],
    },
    bass: {
      wave: 'triangle', gain: 0.16, decay: 0.32, octave: 0,
      steps: [0, REST, REST, 0, REST, REST, 7, REST, 0, REST, REST, 5, REST, REST, 3, REST],
    },
    lead: { wave: 'sine', gain: 0.08, decay: 0.35, octave: 2, scale: [0, 3, 5, 7, 10, 12], density: 0.3 },
    hat: { gain: 0.045, playbackRate: 2.2, duration: 0.03, steps: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0] },
  },
  // Storm Reach: E minor, Em-C-Am-B. Driving syncopated bass, sawtooth crackle.
  storm: {
    id: 'storm',
    bpm: 112,
    root: 82.41, // E2
    progression: [0, 8, 5, 7], // Em, C, Am, B
    thirds: [3, 4, 3, 4],
    pad: {
      wave: 'sawtooth', gain: 0.05, decay: 2.2, octave: 1, chord: true,
      steps: [0, REST, REST, REST, REST, REST, REST, REST, REST, REST, REST, REST, REST, REST, REST, REST],
    },
    bass: {
      wave: 'square', gain: 0.11, decay: 0.22, octave: 0,
      steps: [0, REST, 0, REST, REST, 0, REST, 7, 0, REST, 0, REST, REST, 5, REST, 7],
    },
    lead: { wave: 'sawtooth', gain: 0.06, decay: 0.25, octave: 2, scale: [0, 3, 5, 7, 10, 12], density: 0.34 },
    hat: { gain: 0.05, playbackRate: 3.6, duration: 0.02, steps: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0] },
  },
  // Radiant Summits: C major (lydian lift), C-G-Am-F. Bright bell pad, stately walk.
  radiant: {
    id: 'radiant',
    bpm: 90,
    root: 130.81, // C3
    progression: [0, 7, 9, 5], // C, G, Am, F
    thirds: [4, 4, 3, 4],
    pad: {
      wave: 'triangle', gain: 0.12, decay: 3.0, octave: 1, chord: true,
      steps: [0, REST, REST, REST, REST, REST, REST, REST, REST, REST, REST, REST, REST, REST, REST, REST],
    },
    bass: {
      wave: 'sine', gain: 0.15, decay: 0.45, octave: 0,
      steps: [0, REST, REST, REST, 7, REST, REST, REST, 0, REST, REST, REST, 4, REST, 7, REST],
    },
    lead: { wave: 'sine', gain: 0.09, decay: 0.5, octave: 2, scale: [0, 2, 4, 7, 9, 12], density: 0.26 },
    hat: { gain: 0.035, playbackRate: 2.6, duration: 0.03, steps: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0] },
  },
  // Umbral Depths: D minor, Dm-Bb-Gm-A. Slow abyssal pulse, hollow triangle pad.
  umbral: {
    id: 'umbral',
    bpm: 76,
    root: 73.42, // D2
    progression: [0, 8, 5, 7], // Dm, Bb, Gm, A
    thirds: [3, 4, 3, 4],
    pad: {
      wave: 'triangle', gain: 0.1, decay: 3.4, octave: 1, chord: true,
      steps: [0, REST, REST, REST, REST, REST, REST, REST, REST, REST, REST, REST, REST, REST, REST, REST],
    },
    bass: {
      wave: 'sine', gain: 0.16, decay: 0.5, octave: 0,
      steps: [0, REST, REST, REST, REST, REST, 0, REST, REST, REST, 3, REST, REST, REST, 5, REST],
    },
    lead: { wave: 'sine', gain: 0.07, decay: 0.6, octave: 2, scale: [0, 3, 5, 7, 10, 12], density: 0.2 },
    hat: { gain: 0.03, playbackRate: 2.2, duration: 0.035, steps: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0] },
  },
};

/**
 * The seeded 16-step lead line for one bar. Pure and deterministic: keyed by
 * (track, loop mod LEAD_LOOP_CYCLE, bar), so the melody evolves across a
 * 16-bar super-loop and then repeats exactly.
 */
export function leadBar(track: MusicTrackDef, loop: number, bar: number): StepNote[] {
  const lead = track.lead;
  const rng = mulberry32(hashString(`${track.id}:lead:${loop % LEAD_LOOP_CYCLE}:${bar}`));
  const steps: StepNote[] = [];
  for (let s = 0; s < STEPS_PER_BAR; s++) {
    if (rng() < lead.density) steps.push(lead.scale[Math.floor(rng() * lead.scale.length)] + 12 * lead.octave);
    else steps.push(REST);
  }
  return steps;
}

/**
 * Lookahead step scheduler (the standard Web Audio pattern): a coarse timer
 * calls pump(), which schedules every 16th-note strictly inside a short
 * horizon using the context clock — jitter-free playback from a 100 ms timer.
 * Intensity layers (spec §8): 0 = pad+bass (calm/building), 1 = +lead
 * (combat), 2 = +hat (heavy pressure). Muting freezes notesScheduled while
 * steps keep advancing, so unmute rejoins the groove in phase.
 */
export class MusicEngine {
  /** UI toggle, persisted via SaveData.settings.musicMuted (toggleMusic). */
  muted = false;
  /** Lifetime voices scheduled — the headless/browser verification hook (Task 12 asserts on it). */
  notesScheduled = 0;
  private intensity: 0 | 1 | 2 = 0;
  private trackId: MusicTrackId | null = null;
  private step = 0;
  private nextTime: number | null = null;
  private master: GainLike | null = null;
  private masterCtx: AudioContextLike | null = null;
  private noise: NoiseBufferLike | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly getContext: () => AudioContextLike | null = () => audio.context) {}

  /** Overridable for node tests (no document there). See HIDDEN_SCHEDULE_HORIZON. */
  isHidden: () => boolean = () => typeof document !== 'undefined' && document.hidden;

  get stepIndex(): number {
    return this.step;
  }

  /** Switch tracks. Same-id calls are no-ops so scene restarts never stutter the groove. */
  play(id: MusicTrackId): void {
    if (this.trackId === id) return;
    this.trackId = id;
    this.step = 0;
    this.nextTime = null;
  }

  stop(): void {
    this.trackId = null;
    this.nextTime = null;
  }

  setIntensity(level: 0 | 1 | 2): void {
    this.intensity = level;
  }

  /** Browser driver: a coarse timer pumping the scheduler. Idempotent; never used in tests. */
  start(intervalMs = 100): void {
    if (this.timer !== null) return;
    this.timer = setInterval(() => this.pump(), intervalMs);
  }

  /** Schedule all steps inside the horizon. Silent no-op when locked, suspended, or trackless. */
  pump(): void {
    const ctx = this.getContext();
    if (ctx === null || ctx.state !== 'running' || this.trackId === null) return;
    const track = MUSIC_TRACKS[this.trackId];
    const stepDur = 60 / track.bpm / 4;
    // (Re)anchor when starting or after falling behind (hidden tab, long suspension).
    if (this.nextTime === null || this.nextTime < ctx.currentTime) this.nextTime = ctx.currentTime + 0.05;
    const horizon = ctx.currentTime + (this.isHidden() ? HIDDEN_SCHEDULE_HORIZON : SCHEDULE_HORIZON);
    while (this.nextTime < horizon) {
      if (!this.muted) this.scheduleStep(ctx, track, this.step, this.nextTime);
      this.step += 1;
      this.nextTime += stepDur;
    }
  }

  private scheduleStep(ctx: AudioContextLike, track: MusicTrackDef, step: number, t: number): void {
    const stepInBar = step % STEPS_PER_BAR;
    const bar = Math.floor(step / STEPS_PER_BAR) % track.progression.length;
    const loop = Math.floor(step / (STEPS_PER_BAR * track.progression.length));
    const chordRoot = track.progression[bar];
    const third = track.thirds[bar];
    this.voiceNote(ctx, track, track.pad, stepInBar, chordRoot, third, t);
    this.voiceNote(ctx, track, track.bass, stepInBar, chordRoot, third, t);
    if (this.intensity >= 1) {
      const note = leadBar(track, loop, bar)[stepInBar];
      if (note !== null) this.tone(ctx, track.lead.wave, noteFreq(track.root, note), track.lead.gain, track.lead.decay, t);
    }
    if (this.intensity >= 2 && track.hat.steps[stepInBar] === 1) this.hatHit(ctx, track.hat, t);
  }

  private voiceNote(
    ctx: AudioContextLike,
    track: MusicTrackDef,
    voice: MusicVoice,
    stepInBar: number,
    chordRoot: number,
    third: number,
    t: number,
  ): void {
    const n = voice.steps[stepInBar];
    if (n === null) return;
    const base = chordRoot + n + 12 * voice.octave;
    const semis = voice.chord === true ? [base, base + third, base + 7] : [base];
    for (const s of semis) this.tone(ctx, voice.wave, noteFreq(track.root, s), voice.gain, voice.decay, t);
  }

  private tone(ctx: AudioContextLike, wave: OscillatorType, freq: number, gain: number, decay: number, t: number): void {
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + decay);
    g.connect(this.masterFor(ctx));
    const osc = ctx.createOscillator();
    osc.type = wave;
    osc.frequency.setValueAtTime(freq, t);
    osc.connect(g);
    osc.start(t);
    osc.stop(t + decay + 0.02);
    this.notesScheduled += 1;
  }

  private hatHit(ctx: AudioContextLike, hat: NoiseVoice, t: number): void {
    const g = ctx.createGain();
    g.gain.setValueAtTime(hat.gain, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + hat.duration);
    g.connect(this.masterFor(ctx));
    const src = ctx.createBufferSource();
    src.buffer = this.noiseFor(ctx);
    src.playbackRate.setValueAtTime(hat.playbackRate, t);
    src.connect(g);
    src.start(t);
    src.stop(t + hat.duration + 0.02);
    this.notesScheduled += 1;
  }

  /** One master bus per context; rebuilt if the context is ever replaced. */
  private masterFor(ctx: AudioContextLike): GainLike {
    if (this.masterCtx !== ctx || this.master === null) {
      this.master = ctx.createGain();
      this.master.gain.setValueAtTime(MUSIC_MASTER_GAIN, ctx.currentTime);
      this.master.connect(ctx.destination);
      this.masterCtx = ctx;
      this.noise = null;
    }
    return this.master;
  }

  /** Seeded noise for the hat — deterministic, never the built-in RNG. */
  private noiseFor(ctx: AudioContextLike): NoiseBufferLike {
    if (this.noise === null) {
      const length = Math.ceil(ctx.sampleRate * 0.5);
      const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      const rng = mulberry32(0xa0d11);
      for (let i = 0; i < length; i++) data[i] = rng() * 2 - 1;
      this.noise = buffer;
    }
    return this.noise;
  }
}

/** THE game-wide music engine. main.ts seeds `muted` from the save and starts the pump timer. */
export const music = new MusicEngine();

/** Flip music mute (separate from SFX), persist it, return the new state (drives button labels). */
export function toggleMusic(): boolean {
  music.muted = !music.muted;
  const save = loadSave();
  save.settings.musicMuted = music.muted;
  writeSave(save);
  return music.muted;
}
