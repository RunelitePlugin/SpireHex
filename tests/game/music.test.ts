import { describe, expect, it } from 'vitest';
import {
  LEAD_LOOP_CYCLE,
  MUSIC_MASTER_GAIN,
  MUSIC_TRACKS,
  MusicEngine,
  STEPS_PER_BAR,
  leadBar,
  music,
  noteFreq,
  toggleMusic,
  type MusicTrackDef,
} from '../../src/game/music';
import { AudioEngine } from '../../src/game/audio';
import { FakeContext } from './audioFakes';

/** Every pitch the engine can emit for a track — mirrors the engine's note math. */
function reachableFreqs(track: MusicTrackDef): number[] {
  const freqs: number[] = [];
  track.progression.forEach((chordRoot, bar) => {
    for (const voice of [track.pad, track.bass]) {
      for (const n of voice.steps) {
        if (n === null) continue;
        const base = chordRoot + n + 12 * voice.octave;
        const semis = voice.chord === true ? [base, base + track.thirds[bar], base + 7] : [base];
        for (const s of semis) freqs.push(noteFreq(track.root, s));
      }
    }
  });
  for (const s of track.lead.scale) freqs.push(noteFreq(track.root, s + 12 * track.lead.octave));
  return freqs;
}

describe('music track data (spec §8)', () => {
  it('ships the title theme plus one track per shipped biome (P14: +umbral — the set is complete)', () => {
    expect(Object.keys(MUSIC_TRACKS).sort()).toEqual(['ember', 'frost', 'radiant', 'storm', 'title', 'umbral', 'verdant']);
    expect(MUSIC_TRACKS.title.id).toBe('title');
    expect(MUSIC_TRACKS.ember.id).toBe('ember');
    expect(MUSIC_TRACKS.frost.id).toBe('frost');
    expect(MUSIC_TRACKS.verdant.id).toBe('verdant');
    expect(MUSIC_TRACKS.storm.id).toBe('storm');
    expect(MUSIC_TRACKS.radiant.id).toBe('radiant');
    expect(MUSIC_TRACKS.umbral.id).toBe('umbral');
  });

  it('every authored pattern is exactly one 16-step bar', () => {
    for (const track of Object.values(MUSIC_TRACKS)) {
      expect(track.pad.steps).toHaveLength(STEPS_PER_BAR);
      expect(track.bass.steps).toHaveLength(STEPS_PER_BAR);
      expect(track.hat.steps).toHaveLength(STEPS_PER_BAR);
    }
  });

  it('progressions are 4 bars with a minor-or-major third per bar', () => {
    for (const track of Object.values(MUSIC_TRACKS)) {
      expect(track.progression).toHaveLength(4);
      expect(track.thirds).toHaveLength(4);
      for (const third of track.thirds) expect([3, 4]).toContain(third);
    }
  });

  it('keeps every gain inside the quiet-audio bounds (music sits under SFX)', () => {
    expect(MUSIC_MASTER_GAIN).toBeLessThanOrEqual(0.7);
    for (const track of Object.values(MUSIC_TRACKS)) {
      for (const v of [track.pad, track.bass]) {
        expect(v.gain).toBeGreaterThan(0);
        expect(v.gain).toBeLessThanOrEqual(0.2);
        expect(v.decay).toBeGreaterThan(0);
        expect(v.decay).toBeLessThanOrEqual(3.5);
      }
      expect(track.lead.gain).toBeLessThanOrEqual(0.12);
      expect(track.hat.gain).toBeLessThanOrEqual(0.08);
    }
  });

  it('every reachable pitch stays inside exponential-ramp-safe bounds', () => {
    for (const track of Object.values(MUSIC_TRACKS)) {
      for (const f of reachableFreqs(track)) {
        expect(f).toBeGreaterThanOrEqual(40);
        expect(f).toBeLessThanOrEqual(8000);
      }
    }
  });

  it('bpm and root are sane and the ember track is the driving one', () => {
    for (const track of Object.values(MUSIC_TRACKS)) {
      expect(track.bpm).toBeGreaterThanOrEqual(60);
      expect(track.bpm).toBeLessThanOrEqual(140);
      expect(track.root).toBeGreaterThanOrEqual(40);
      expect(track.root).toBeLessThanOrEqual(200);
    }
    expect(MUSIC_TRACKS.ember.bpm).toBeGreaterThan(MUSIC_TRACKS.title.bpm);
  });

  it('the seeded lead is deterministic, non-empty over a loop, and pentatonic-bounded', () => {
    for (const track of Object.values(MUSIC_TRACKS)) {
      const a = [0, 1, 2, 3].map((bar) => leadBar(track, 0, bar));
      const b = [0, 1, 2, 3].map((bar) => leadBar(track, 0, bar));
      expect(a).toEqual(b); // seeded — identical every call
      expect(a).toEqual([0, 1, 2, 3].map((bar) => leadBar(track, LEAD_LOOP_CYCLE, bar))); // 4-loop cycle
      const notes = a.flat().filter((n): n is number => n !== null);
      expect(notes.length).toBeGreaterThan(0); // the melody actually exists
      for (const n of notes) {
        expect(track.lead.scale.map((s) => s + 12 * track.lead.octave)).toContain(n);
      }
      expect(a[0]).toHaveLength(STEPS_PER_BAR);
    }
  });
});

function makeMusic(state: 'running' | 'suspended' = 'running'): { m: MusicEngine; ctx: FakeContext } {
  const ctx = new FakeContext();
  ctx.state = state;
  return { m: new MusicEngine(() => ctx), ctx };
}

describe('MusicEngine sequencer', () => {
  it('schedules nothing without a context', () => {
    const m = new MusicEngine(() => null);
    m.play('title');
    m.pump();
    expect(m.notesScheduled).toBe(0);
    expect(m.stepIndex).toBe(0);
  });

  it('schedules nothing while the context is suspended (pre-gesture)', () => {
    const { m } = makeMusic('suspended');
    m.play('title');
    m.pump();
    expect(m.notesScheduled).toBe(0);
  });

  it('bar 0 opens on the tonic: bass at the root, pad as a minor triad', () => {
    const { m, ctx } = makeMusic();
    m.play('title');
    m.pump();
    const freqs = ctx.oscillators.map((o) => o.frequency.events[0].value);
    expect(freqs).toContain(110); // A2 bass (sine)
    // pad triad an octave up: A3, C4, E4
    for (const f of [220, 220 * 2 ** (3 / 12), 220 * 2 ** (7 / 12)]) {
      expect(freqs.some((x) => Math.abs(x - f) < 1e-6)).toBe(true);
    }
  });

  it('one pump from t=0 schedules EXACTLY the pattern hits in the horizon — no double-scheduling', () => {
    // Title @72bpm: stepSeconds = 60/72/4 ≈ 0.2083, so a 0.3s horizon from t=0
    // covers steps 0 and 1. Step 0: pad chord (3 oscillators) + bass root (1);
    // step 1: both REST. Intensity 0 mutes lead and hat. Exact total: 4.
    // A sequencer that schedules any step twice would produce 8 and fail here —
    // the presence-only tests above cannot catch that (review finding, P10 T1+2).
    const { m, ctx } = makeMusic();
    m.play('title');
    m.pump();
    expect(ctx.oscillators).toHaveLength(4);
    expect(m.notesScheduled).toBe(4);
    // Re-pumping at the same currentTime must schedule nothing new.
    m.pump();
    expect(ctx.oscillators).toHaveLength(4);
  });

  it('bar 1 follows the progression (F root under the title theme)', () => {
    const { m, ctx } = makeMusic();
    m.play('title');
    // pump across bar 0 into bar 1: 16 steps at 60/72/4 s each ≈ 3.33 s
    for (let t = 0; t <= 3.6; t += 0.25) {
      ctx.currentTime = t;
      m.pump();
    }
    const fRoot = 110 * 2 ** (-4 / 12); // ≈ 87.31 Hz
    const freqs = ctx.oscillators.map((o) => o.frequency.events[0].value);
    expect(freqs.some((x) => Math.abs(x - fRoot) < 1e-6)).toBe(true);
  });

  it('intensity 0 mutes the lead; intensity 1 adds it (ember square voice)', () => {
    const run = (intensity: 0 | 1) => {
      const { m, ctx } = makeMusic();
      m.play('ember');
      m.setIntensity(intensity);
      for (let t = 0; t <= 10; t += 0.25) { ctx.currentTime = t; m.pump(); } // > one full loop
      return ctx.oscillators.filter((o) => o.type === 'square').length;
    };
    expect(run(0)).toBe(0);
    expect(run(1)).toBeGreaterThan(0); // leadBar data test proved notes exist
  });

  it('intensity 2 adds the noise hat (buffer sources fire)', () => {
    const { m, ctx } = makeMusic();
    m.play('ember');
    m.setIntensity(2);
    for (let t = 0; t <= 2; t += 0.25) { ctx.currentTime = t; m.pump(); }
    expect(ctx.sources.length).toBeGreaterThan(0);
  });

  it('muted: steps advance but notesScheduled freezes; unmuting resumes', () => {
    const { m, ctx } = makeMusic();
    m.play('ember');
    m.muted = true;
    for (let t = 0; t <= 2; t += 0.25) { ctx.currentTime = t; m.pump(); }
    expect(m.stepIndex).toBeGreaterThan(0);
    expect(m.notesScheduled).toBe(0);
    m.muted = false;
    for (let t = 2.25; t <= 4; t += 0.25) { ctx.currentTime = t; m.pump(); }
    expect(m.notesScheduled).toBeGreaterThan(0);
  });

  it('two engines pumped identically schedule identical note streams (seeded determinism)', () => {
    const run = () => {
      const { m, ctx } = makeMusic();
      m.play('ember');
      m.setIntensity(2);
      for (let t = 0; t <= 8; t += 0.25) { ctx.currentTime = t; m.pump(); }
      return ctx.oscillators.map((o) => `${o.type}:${o.frequency.events[0].value.toFixed(4)}`);
    };
    const a = run();
    expect(a.length).toBeGreaterThan(0);
    expect(run()).toEqual(a);
  });

  it('play() with the SAME track never restarts; a different track resets to step 0', () => {
    const { m, ctx } = makeMusic();
    m.play('ember');
    for (let t = 0; t <= 1; t += 0.25) { ctx.currentTime = t; m.pump(); }
    const step = m.stepIndex;
    expect(step).toBeGreaterThan(0);
    m.play('ember');
    expect(m.stepIndex).toBe(step); // scene restarts keep the groove
    m.play('title');
    expect(m.stepIndex).toBe(0);
  });

  it('stop() halts scheduling until the next play()', () => {
    const { m, ctx } = makeMusic();
    m.play('ember');
    ctx.currentTime = 0;
    m.pump();
    const n = m.notesScheduled;
    m.stop();
    ctx.currentTime = 1;
    m.pump();
    expect(m.notesScheduled).toBe(n);
  });

  it('AudioEngine exposes its context read-only for the music bus', () => {
    const ctx = new FakeContext();
    const e = new AudioEngine(() => ctx);
    expect(e.context).toBeNull();
    e.unlock();
    expect(e.context).toBe(ctx);
  });
});

describe('P15: hidden-tab scheduling horizon', () => {
  it('a hidden tab schedules ~2s of steps ahead (bridging throttled pumps); visible stays at 0.3s', () => {
    // Title @72bpm: stepSeconds ~= 0.2083 — a 0.3s horizon covers 2 steps,
    // the 2s hidden horizon covers 10. stepIndex IS the lookahead measure
    // (notesScheduled is not: later title steps are RESTs).
    const { m } = makeMusic();
    m.play('title');
    m.pump();
    expect(m.stepIndex).toBe(2);
    const hidden = makeMusic();
    hidden.m.play('title');
    hidden.m.isHidden = () => true;
    hidden.m.pump();
    expect(hidden.m.stepIndex).toBe(10);
    // A second hidden pump from the same clock never double-schedules.
    hidden.m.pump();
    expect(hidden.m.stepIndex).toBe(10);
  });
});

describe('toggleMusic', () => {
  it('flips the engine mute and returns the new state', () => {
    const before = music.muted;
    expect(toggleMusic()).toBe(!before);
    expect(music.muted).toBe(!before);
    toggleMusic(); // restore for other tests
  });

  it('double-toggle restores the original state', () => {
    const before = music.muted;
    toggleMusic();
    toggleMusic();
    expect(music.muted).toBe(before);
  });
});
