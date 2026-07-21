import { describe, expect, it } from 'vitest';
import { TICK_RATE } from '../../src/sim/constants';
import { Simulation } from '../../src/sim/simulation';
import type { SimEvent } from '../../src/sim/types';
import { enemyDef, makeContent, placeCmd, runTicks, straightLevel, TOWER_HEX, towerDef } from './helpers';

// One-shot killer tower: waves clear within a second of their last spawn.
const CONTENT = makeContent([towerDef({ damage: 1000 })], [enemyDef()]);
const TWO_WAVES = [
  { entries: [{ enemyId: 'dummy', count: 1, spacing: 0.1 }] },
  { entries: [{ enemyId: 'dummy', count: 1, spacing: 0.1 }] },
];

/** Tick until waveCleared fires (throws if it never does). Returns all events seen. */
function tickUntilCleared(sim: Simulation, cap = 600): SimEvent[] {
  const all: SimEvent[] = [];
  for (let i = 0; i < cap; i++) {
    const events = sim.tick();
    all.push(...events);
    if (events.some((e) => e.type === 'waveCleared')) return all;
  }
  throw new Error('wave never cleared');
}

/** Sim with the killer tower placed and wave 0 started and cleared. */
function clearedWaveZero(): Simulation {
  const sim = new Simulation(straightLevel(TWO_WAVES), CONTENT, 1);
  expect(sim.applyCommand(placeCmd('testTower', TOWER_HEX)).ok).toBe(true);
  expect(sim.applyCommand({ type: 'startWave' }).ok).toBe(true);
  tickUntilCleared(sim);
  expect(sim.status).toBe('building');
  return sim;
}

describe('wave countdown and early call', () => {
  it('runs no countdown before the first wave (unlimited build phase)', () => {
    const sim = new Simulation(straightLevel(TWO_WAVES), CONTENT, 1);
    expect(sim.countdown).toBeNull();
    const events = runTicks(sim, 15 * TICK_RATE);
    expect(events.filter((e) => e.type === 'waveStarted')).toHaveLength(0);
    expect(sim.status).toBe('building');
  });

  it('starts a full countdown the moment a wave clears with waves remaining', () => {
    const sim = clearedWaveZero();
    expect(sim.countdown).toBe(10); // set on the clearing tick; first decrement is next tick
  });

  it('auto-starts the next wave when the countdown expires, paying no bonus', () => {
    const sim = clearedWaveZero();
    const goldBefore = sim.gold;
    const events = runTicks(sim, 10 * TICK_RATE); // exactly waveCountdown in ticks
    expect(events).toContainEqual({ type: 'waveStarted', waveIndex: 1 });
    expect(events.filter((e) => e.type === 'earlyCallBonus')).toHaveLength(0);
    expect(sim.gold).toBe(goldBefore); // auto-start pays nothing
    expect(sim.countdown).toBeNull();
  });

  it('does not auto-start before the countdown expires', () => {
    const sim = clearedWaveZero();
    const events = runTicks(sim, 10 * TICK_RATE - 2);
    expect(events.filter((e) => e.type === 'waveStarted')).toHaveLength(0);
    expect(sim.status).toBe('building');
  });

  it('grants floor(remaining × rate) gold on an early call and emits earlyCallBonus', () => {
    const sim = clearedWaveZero();
    runTicks(sim, 5 * TICK_RATE); // burn 5 s: exactly 150 ticks = 5 s remain
    expect(sim.earlyCallBonus()).toBe(15); // 5 s × 3 g/s
    const goldBefore = sim.gold;
    expect(sim.applyCommand({ type: 'startWave' }).ok).toBe(true);
    expect(sim.gold).toBe(goldBefore + 15);
    expect(sim.countdown).toBeNull();
    const events = sim.tick();
    expect(events).toContainEqual({ type: 'earlyCallBonus', gold: 15, remaining: 5 });
    expect(events).toContainEqual({ type: 'waveStarted', waveIndex: 1 });
  });

  it('pays no bonus when the first wave is called (no countdown was running)', () => {
    const sim = new Simulation(straightLevel(TWO_WAVES), CONTENT, 1);
    expect(sim.earlyCallBonus()).toBe(0);
    const goldBefore = sim.gold;
    sim.applyCommand({ type: 'startWave' });
    expect(sim.gold).toBe(goldBefore);
    expect(sim.tick().filter((e) => e.type === 'earlyCallBonus')).toHaveLength(0);
  });

  it('runs no countdown after the final wave clears — the level is won', () => {
    const sim = clearedWaveZero();
    runTicks(sim, 3 * TICK_RATE);
    sim.applyCommand({ type: 'startWave' }); // early-call the last wave
    tickUntilCleared(sim);
    expect(sim.status).toBe('won');
    expect(sim.countdown).toBeNull();
  });

  it('is deterministic through an auto-start: identical runs, identical logs', () => {
    const run = () => {
      const sim = new Simulation(straightLevel(TWO_WAVES), CONTENT, 3);
      sim.applyCommand(placeCmd('testTower', TOWER_HEX));
      sim.applyCommand({ type: 'startWave' });
      return runTicks(sim, 15 * TICK_RATE); // covers wave 0, the countdown, and auto-started wave 1
    };
    expect(run()).toEqual(run());
  });
});
