import { describe, expect, it } from 'vitest';
import { ATTACK_ELEMENT_IDS } from '../../src/content/elements';
import { AudioEngine, MIN_REPLAY_GAP, SFX_RECIPES, type SfxId } from '../../src/game/audio';
import { FakeContext } from './audioFakes';

const EVENT_IDS: SfxId[] = ['place', 'impact', 'death', 'leak', 'waveStart', 'victory', 'defeat', 'click'];

describe('sfx recipes (spec §9 coverage)', () => {
  it('covers every core action and exactly one firing voice per element family', () => {
    const expected = new Set<string>([...EVENT_IDS, ...ATTACK_ELEMENT_IDS.map((e) => `fire-${e}`)]);
    expect(new Set(Object.keys(SFX_RECIPES))).toEqual(expected);
  });

  it('keeps every part inside Web-Audio-safe, ear-safe bounds', () => {
    for (const [id, parts] of Object.entries(SFX_RECIPES)) {
      expect(parts.length, id).toBeGreaterThanOrEqual(1);
      expect(parts.length, id).toBeLessThanOrEqual(4);
      for (const part of parts) {
        expect(part.duration, id).toBeGreaterThan(0);
        expect(part.duration, id).toBeLessThanOrEqual(0.5);
        expect(part.gain, id).toBeGreaterThan(0);
        expect(part.gain, id).toBeLessThanOrEqual(0.3);
        expect(part.delay ?? 0, id).toBeGreaterThanOrEqual(0);
        if (part.kind === 'tone') {
          // exponentialRampToValueAtTime rejects non-positive endpoints — keep frequencies well clear.
          expect(part.freqStart, id).toBeGreaterThanOrEqual(40);
          expect(part.freqStart, id).toBeLessThanOrEqual(8000);
          expect(part.freqEnd, id).toBeGreaterThanOrEqual(40);
          expect(part.freqEnd, id).toBeLessThanOrEqual(8000);
        } else {
          expect(part.playbackRate ?? 1, id).toBeGreaterThan(0);
        }
      }
    }
  });

  it('finishes every effect within a second (game sounds must never smear)', () => {
    for (const [id, parts] of Object.entries(SFX_RECIPES)) {
      const end = Math.max(...parts.map((p) => (p.delay ?? 0) + p.duration));
      expect(end, id).toBeLessThanOrEqual(1.0);
    }
  });
});

function makeEngine(): { e: AudioEngine; ctx: FakeContext } {
  const ctx = new FakeContext();
  return { e: new AudioEngine(() => ctx), ctx };
}

describe('AudioEngine', () => {
  it('starts locked: play() before unlock is a silent no-op', () => {
    const { e, ctx } = makeEngine();
    e.play('click');
    expect(e.played).toBe(0);
    expect(ctx.oscillators).toHaveLength(0);
    expect(e.contextState).toBe('none');
  });

  it('unlock() creates and resumes the context (user-gesture autoplay unlock), idempotently', () => {
    const { e, ctx } = makeEngine();
    e.unlock();
    expect(ctx.state).toBe('running');
    expect(e.contextState).toBe('running');
    e.unlock();
    expect(e.contextState).toBe('running');
  });

  it('plays a tone recipe: typed oscillator started with a decaying gain envelope', () => {
    const { e, ctx } = makeEngine();
    e.unlock();
    e.play('click');
    expect(e.played).toBe(1);
    expect(ctx.oscillators).toHaveLength(1);
    expect(ctx.oscillators[0].started).toBe(true);
    expect(ctx.oscillators[0].type).toBe('square');
    expect(ctx.oscillators[0].frequency.events[0]).toEqual({ kind: 'set', value: 900, time: 0 });
    expect(ctx.gains[0].gain.events[0]).toEqual({ kind: 'set', value: 0.12, time: 0 });
    expect(ctx.gains[0].gain.events[1]).toEqual({ kind: 'ramp', value: 0.001, time: 0.03 });
  });

  it('plays noise parts from ONE shared buffer built once per context (prime buffer aside)', () => {
    const { e, ctx } = makeEngine();
    e.unlock(); // creates buffers[0]: the 1-sample silent prime
    e.play('impact');
    ctx.currentTime = 1;
    e.play('impact');
    expect(ctx.sources).toHaveLength(3); // prime + two noise voices
    expect(ctx.buffers).toHaveLength(2); // prime + ONE shared noise buffer
    expect(ctx.sources[1].buffer).toBe(ctx.sources[2].buffer);
    expect(ctx.sources[1].buffer).not.toBe(ctx.sources[0].buffer);
  });

  it('noise is seeded and deterministic across engines (never Math.random)', () => {
    const a = makeEngine();
    a.e.unlock();
    a.e.play('impact');
    const b = makeEngine();
    b.e.unlock();
    b.e.play('impact');
    expect(Array.from(a.ctx.buffers[1].slice(0, 16))).toEqual(Array.from(b.ctx.buffers[1].slice(0, 16)));
    expect(a.ctx.buffers[1].some((v) => v !== 0)).toBe(true);
  });

  it('collapses same-id bursts inside MIN_REPLAY_GAP; different ids always pass', () => {
    const { e, ctx } = makeEngine();
    e.unlock();
    e.play('death');
    e.play('death'); // same-tick swarm burst — collapsed
    e.play('leak');
    expect(e.played).toBe(2);
    ctx.currentTime = MIN_REPLAY_GAP;
    e.play('death');
    expect(e.played).toBe(3);
  });

  it('muted play is a no-op that keeps the context alive', () => {
    const { e, ctx } = makeEngine();
    e.unlock();
    e.muted = true;
    e.play('victory');
    expect(e.played).toBe(0);
    expect(ctx.oscillators).toHaveLength(0);
    e.muted = false;
    e.play('victory');
    expect(e.played).toBe(1);
  });

  it('a null context factory (headless node) never throws', () => {
    const e = new AudioEngine(() => null);
    e.unlock();
    e.play('waveStart');
    expect(e.contextState).toBe('none');
    expect(e.played).toBe(0);
  });

  it('unlock() starts a silent 1-sample prime buffer inside the gesture (iOS unmute)', () => {
    const { e, ctx } = makeEngine();
    e.unlock();
    expect(ctx.sources).toHaveLength(1);
    expect(ctx.sources[0].started).toBe(true);
    expect(ctx.buffers[0]).toHaveLength(1);
    expect(ctx.buffers[0][0]).toBe(0); // silent — never audible
  });

  it('unlock() primes only once per context', () => {
    const { e, ctx } = makeEngine();
    e.unlock();
    e.unlock();
    expect(ctx.sources).toHaveLength(1);
  });

  it("unlock() resumes an 'interrupted' context (iOS call/Siri) — any non-closed, non-running state", () => {
    const { e, ctx } = makeEngine();
    e.unlock();
    ctx.state = 'interrupted';
    e.unlock();
    expect(ctx.state).toBe('running');
  });

  it('resume() resumes an existing interrupted context but never creates one', () => {
    const headless = new AudioEngine(() => null);
    headless.resume(); // must not throw, must not create
    expect(headless.contextState).toBe('none');
    const { e, ctx } = makeEngine();
    e.resume(); // no context yet — still none
    expect(e.contextState).toBe('none');
    e.unlock();
    ctx.state = 'interrupted';
    e.resume();
    expect(ctx.state).toBe('running');
  });

  it('play stays silent while interrupted and works again after resume()', () => {
    const { e, ctx } = makeEngine();
    e.unlock();
    e.play('click');
    expect(e.played).toBe(1);
    ctx.state = 'interrupted';
    e.play('click');
    expect(e.played).toBe(1); // engine refuses non-running contexts
    e.resume();
    ctx.currentTime = 1;
    e.play('click');
    expect(e.played).toBe(2);
  });
});
