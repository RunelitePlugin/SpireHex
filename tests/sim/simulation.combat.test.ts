import { describe, expect, it } from 'vitest';
import { CONTENT, LEVELS } from '../../src/content';
import { TICK_RATE } from '../../src/sim/constants';
import { Simulation } from '../../src/sim/simulation';
import type { SimEvent } from '../../src/sim/types';
import { placeCmd } from './helpers';

function runTicks(sim: Simulation, n: number): SimEvent[] {
  const all: SimEvent[] = [];
  for (let i = 0; i < n; i++) all.push(...sim.tick());
  return all;
}

// level01 path starts at offset col 0, row 4 => axial {q:-2, r:4}. Hex {q:-1, r:3}
// (offset col 0, row 3) is in the grid, off the path, and adjacent to the path
// start — well inside emberSpire range (150 > hex pitch ~83).
const NEAR_PATH_START = { q: -1, r: 3 };

describe('tower combat', () => {
  it('fires at enemies in range and damages them', () => {
    const sim = new Simulation(LEVELS.level01, CONTENT, 1);
    sim.applyCommand(placeCmd('emberSpire', NEAR_PATH_START));
    sim.applyCommand({ type: 'startWave' });
    const events = runTicks(sim, 2 * TICK_RATE);
    expect(events.some((e) => e.type === 'towerFired')).toBe(true);
    const damaged = sim.enemies.some((e) => e.alive && e.hp < e.maxHp);
    const killed = events.some((e) => e.type === 'enemyKilled');
    expect(damaged || killed).toBe(true);
  });

  it('respects the fire-rate cooldown', () => {
    const sim = new Simulation(LEVELS.level01, CONTENT, 1);
    sim.applyCommand(placeCmd('emberSpire', NEAR_PATH_START));
    sim.applyCommand({ type: 'startWave' });
    const events = runTicks(sim, 4 * TICK_RATE);
    const shots = events.filter((e) => e.type === 'towerFired').length;
    // 3.0 shots/sec over ~4s with targets present: at most ceil(4 * 3.0) + 1
    expect(shots).toBeGreaterThan(4);
    expect(shots).toBeLessThanOrEqual(13);
  });

  it('kills enemies and awards bounty gold', () => {
    const sim = new Simulation(LEVELS.level01, CONTENT, 1);
    sim.applyCommand(placeCmd('emberSpire', NEAR_PATH_START));
    const goldAfterPlacement = sim.gold;
    sim.applyCommand({ type: 'startWave' });
    const events = runTicks(sim, 20 * TICK_RATE);
    const kills = events.filter((e) => e.type === 'enemyKilled');
    expect(kills.length).toBeGreaterThan(0);
    // The countdown can auto-start wave 2 (mixed bounties) inside the 20 s
    // window — sum the actual per-kill bounties instead of assuming gloomlings.
    const earned = kills.reduce((sum, k) => sum + (k.type === 'enemyKilled' ? k.bounty : 0), 0);
    expect(sim.gold).toBe(goldAfterPlacement + earned);
  });

  it('targets the enemy furthest along the path', () => {
    const sim = new Simulation(LEVELS.level01, CONTENT, 1);
    sim.applyCommand(placeCmd('emberSpire', NEAR_PATH_START));
    sim.applyCommand({ type: 'startWave' });
    // let two enemies spawn (0.8s spacing) and pass through range
    let firstTargetId: number | undefined;
    for (let i = 0; i < 3 * TICK_RATE; i++) {
      for (const e of sim.tick()) {
        if (e.type === 'towerFired' && firstTargetId === undefined) firstTargetId = e.enemyId;
      }
    }
    // the first enemy spawned (lowest id among enemies) leads and is hit first
    expect(firstTargetId).toBe(sim.enemies[0].id);
  });

  it('does not fire with no enemies in range', () => {
    const sim = new Simulation(LEVELS.level01, CONTENT, 1);
    sim.applyCommand(placeCmd('emberSpire', NEAR_PATH_START));
    const events = runTicks(sim, TICK_RATE);
    expect(events.some((e) => e.type === 'towerFired')).toBe(false);
  });
});
