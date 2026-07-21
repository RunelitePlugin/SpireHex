import { describe, expect, it } from 'vitest';
import { Simulation } from '../../src/sim/simulation';
import type { TargetingMode } from '../../src/sim/types';
import { enemyDef, makeContent, placeCmd, runTicks, straightLevel, TOWER_HEX, towerDef } from './helpers';

/**
 * Two enemies spawn on the same tick (spacings 0.01 + 0.01 < one 1/30 s tick):
 * brute (id 2): hp 500, speed 5 — trails, tanky. weakling (id 3): hp 30, speed 50 — leads, frail.
 * The tower (id 1, fireRate 0.05) fires exactly once in the first 30 ticks.
 */
function duel(mode?: TargetingMode): Simulation {
  const content = makeContent(
    [towerDef({ fireRate: 0.05 })],
    [enemyDef({ id: 'brute', hp: 500, speed: 5 }), enemyDef({ id: 'weakling', hp: 30, speed: 50 })],
  );
  const level = straightLevel([
    { entries: [{ enemyId: 'brute', count: 1, spacing: 0.01 }, { enemyId: 'weakling', count: 1, spacing: 0.01 }] },
  ]);
  const sim = new Simulation(level, content, 1);
  sim.applyCommand(placeCmd('testTower', TOWER_HEX));
  if (mode) expect(sim.applyCommand({ type: 'setTargeting', towerId: 1, mode }).ok).toBe(true);
  sim.applyCommand({ type: 'startWave' });
  return sim;
}

function firstShotTarget(sim: Simulation): number {
  const fired = runTicks(sim, 30).find((e) => e.type === 'towerFired');
  if (!fired || fired.type !== 'towerFired') throw new Error('tower never fired');
  return fired.enemyId;
}

describe('setTargeting + pickTarget priorities', () => {
  it('defaults to first: furthest along the path', () => {
    expect(firstShotTarget(duel())).toBe(3); // weakling leads
  });

  it('last: closest to spawn', () => {
    expect(firstShotTarget(duel('last'))).toBe(2); // brute trails
  });

  it('strong: highest current hp', () => {
    expect(firstShotTarget(duel('strong'))).toBe(2); // brute, hp 500
  });

  it('weak: lowest current hp', () => {
    expect(firstShotTarget(duel('weak'))).toBe(3); // weakling, hp 30
  });

  it('breaks all ties by lowest enemy id', () => {
    // Two identical enemies spawn the same tick: same hp, same pathDist.
    const content = makeContent([towerDef({ fireRate: 0.05 })], [enemyDef({ id: 'brute', hp: 500, speed: 5 })]);
    const level = straightLevel([{ entries: [{ enemyId: 'brute', count: 2, spacing: 0.01 }] }]);
    const sim = new Simulation(level, content, 1);
    sim.applyCommand(placeCmd('testTower', TOWER_HEX));
    sim.applyCommand({ type: 'setTargeting', towerId: 1, mode: 'strong' });
    sim.applyCommand({ type: 'startWave' });
    expect(firstShotTarget(sim)).toBe(2); // lowest id wins the tie
  });

  it('setTargeting mutates state and rejects unknown towers', () => {
    const sim = duel();
    expect(sim.towers[0].targeting).toBe('first');
    sim.applyCommand({ type: 'setTargeting', towerId: 1, mode: 'weak' });
    expect(sim.towers[0].targeting).toBe('weak');
    const res = sim.applyCommand({ type: 'setTargeting', towerId: 9, mode: 'weak' });
    expect(res.ok).toBe(false);
    expect(res.error).toBe('no such tower');
  });
});
