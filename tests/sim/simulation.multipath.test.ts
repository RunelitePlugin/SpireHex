import { describe, expect, it } from 'vitest';
import { TICK_RATE } from '../../src/sim/constants';
import { Simulation } from '../../src/sim/simulation';
import { enemyDef, makeContent, placeCmd, runTicks, towerDef, twoPathLevel } from './helpers';

const CONTENT = makeContent([towerDef()], [enemyDef()]);

/** One enemy on each road: entry 0 spawns at 0.1 s on path 0, entry 1 at 0.2 s on path 1. */
const ONE_EACH = [
  { entries: [
    { enemyId: 'dummy', count: 1, spacing: 0.1 },               // no pathIndex → defaults to 0
    { enemyId: 'dummy', count: 1, spacing: 0.1, pathIndex: 1 },
  ] },
];

describe('multi-path movement', () => {
  it('builds one Path per waypoint chain and aliases path to paths[0]', () => {
    const sim = new Simulation(twoPathLevel(), CONTENT, 1);
    expect(sim.paths).toHaveLength(2);
    expect(sim.path).toBe(sim.paths[0]);
    expect(sim.paths[1].length).toBeCloseTo(sim.paths[0].length, 3); // parallel equal roads
  });

  it('spawns each wave entry on its assigned path, defaulting to path 0', () => {
    const sim = new Simulation(twoPathLevel(ONE_EACH), CONTENT, 1);
    sim.applyCommand({ type: 'startWave' });
    runTicks(sim, TICK_RATE);
    expect(sim.enemies).toHaveLength(2);
    expect(sim.enemies[0].pathIndex).toBe(0);
    expect(sim.enemies[1].pathIndex).toBe(1);
  });

  it('positions each enemy on its own road: enemyPos differs by the row gap', () => {
    const sim = new Simulation(twoPathLevel(ONE_EACH), CONTENT, 1);
    sim.applyCommand({ type: 'startWave' });
    runTicks(sim, 2 * TICK_RATE);
    const a = sim.enemyPos(sim.enemies[0]);
    const b = sim.enemyPos(sim.enemies[1]);
    expect(a.y).toBeCloseTo(0, 3);   // road 0 runs along world y = 0
    expect(b.y).toBeCloseTo(144, 3); // road 1 runs along world y = 144
    expect(sim.enemies[0].pathDist).toBeGreaterThan(0);
    expect(sim.enemies[1].pathDist).toBeGreaterThan(0);
  });

  it('leaks an enemy at the end of ITS OWN shorter road while the other marches on', () => {
    const level = twoPathLevel(ONE_EACH, 6); // road 1 ≈ 499 world units, road 0 ≈ 998
    const fast = makeContent([towerDef()], [enemyDef({ speed: 100 })]);
    const sim = new Simulation(level, fast, 1);
    sim.applyCommand({ type: 'startWave' });
    const events = runTicks(sim, 6 * TICK_RATE); // road-1 leak at ≈ 5.2 s; road-0 crossing takes ≈ 10 s
    expect(events.filter((e) => e.type === 'enemyLeaked')).toHaveLength(1);
    expect(sim.enemies.find((e) => e.pathIndex === 1)?.alive).toBe(false);
    expect(sim.enemies.find((e) => e.pathIndex === 0)?.alive).toBe(true);
    expect(sim.lives).toBe(19);
  });

  it('blocks tower placement on every road, not just the first', () => {
    const sim = new Simulation(twoPathLevel(), CONTENT, 1);
    const res = sim.applyCommand(placeCmd('testTower', { q: 2, r: 2 })); // road 1 hex
    expect(res.ok).toBe(false);
    expect(res.error).toBe('on path');
  });
});
