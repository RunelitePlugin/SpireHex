import { describe, expect, it } from 'vitest';
import { CONTENT, LEVELS } from '../../src/content';
import { DT, TICK_RATE } from '../../src/sim/constants';
import { Simulation } from '../../src/sim/simulation';
import type { SimEvent } from '../../src/sim/types';

function runTicks(sim: Simulation, n: number): SimEvent[] {
  const all: SimEvent[] = [];
  for (let i = 0; i < n; i++) all.push(...sim.tick());
  return all;
}

describe('waves and movement', () => {
  it('starts wave 0 on command and emits waveStarted', () => {
    const sim = new Simulation(LEVELS.level01, CONTENT, 1);
    const res = sim.applyCommand({ type: 'startWave' });
    expect(res.ok).toBe(true);
    expect(sim.status).toBe('combat');
    const events = sim.tick();
    expect(events).toContainEqual({ type: 'waveStarted', waveIndex: 0 });
  });

  it('rejects startWave while a wave is active', () => {
    const sim = new Simulation(LEVELS.level01, CONTENT, 1);
    sim.applyCommand({ type: 'startWave' });
    expect(sim.applyCommand({ type: 'startWave' }).ok).toBe(false);
  });

  it('spawns the full first wave over time with correct spacing', () => {
    const sim = new Simulation(LEVELS.level01, CONTENT, 1);
    sim.applyCommand({ type: 'startWave' });
    const events = runTicks(sim, Math.ceil(0.4 * 12 * TICK_RATE) + 2);
    const spawns = events.filter((e) => e.type === 'enemySpawned');
    expect(spawns).toHaveLength(12);
    expect(sim.enemies.filter((e) => e.alive)).toHaveLength(12);
  });

  it('moves enemies forward along the path each tick', () => {
    const sim = new Simulation(LEVELS.level01, CONTENT, 1);
    sim.applyCommand({ type: 'startWave' });
    // first spawn happens at t = spacing (0.4s); run past it before measuring
    runTicks(sim, Math.ceil(0.4 * TICK_RATE) + 1);
    expect(sim.enemies.length).toBeGreaterThan(0);
    const before = sim.enemies[0].pathDist;
    sim.tick();
    const after = sim.enemies[0].pathDist;
    expect(after - before).toBeCloseTo(CONTENT.enemies.gloomling.speed * DT, 5);
  });

  it('leaks enemies at the end of the path, costing lives', () => {
    const sim = new Simulation(LEVELS.level01, CONTENT, 1);
    sim.applyCommand({ type: 'startWave' });
    const travelTicks = Math.ceil((sim.path.length / CONTENT.enemies.gloomling.speed) * TICK_RATE);
    const events = runTicks(sim, travelTicks + 6 * TICK_RATE);
    const leaks = events.filter((e) => e.type === 'enemyLeaked');
    expect(leaks).toHaveLength(12);
    expect(sim.lives).toBe(20 - 12);
    expect(sim.enemies.filter((e) => e.alive)).toHaveLength(0);
  });

  it('returns to building and emits waveCleared after a leaked-out wave', () => {
    const sim = new Simulation(LEVELS.level01, CONTENT, 1);
    sim.applyCommand({ type: 'startWave' });
    const travelTicks = Math.ceil((sim.path.length / CONTENT.enemies.gloomling.speed) * TICK_RATE);
    const events = runTicks(sim, travelTicks + 6 * TICK_RATE);
    expect(events).toContainEqual({ type: 'waveCleared', waveIndex: 0 });
    expect(sim.status).toBe('building');
  });

  it('loses the level when lives reach zero', () => {
    const level = { ...LEVELS.level01, lives: 3 };
    const sim = new Simulation(level, CONTENT, 1);
    sim.applyCommand({ type: 'startWave' });
    const travelTicks = Math.ceil((sim.path.length / CONTENT.enemies.gloomling.speed) * TICK_RATE);
    const events = runTicks(sim, travelTicks + 6 * TICK_RATE);
    expect(events).toContainEqual({ type: 'levelLost' });
    expect(sim.status).toBe('lost');
    expect(sim.lives).toBeLessThanOrEqual(0);
  });
});
