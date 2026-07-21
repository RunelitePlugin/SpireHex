import { describe, expect, it } from 'vitest';
import { Simulation } from '../../src/sim/simulation';
import { enemyDef, makeContent, placeCmd, straightLevel, TOWER_HEX, towerDef } from './helpers';

describe('phase 3 tower state', () => {
  it('initializes new towers unspecialized, node-free, shot-zero, targeting first', () => {
    const sim = new Simulation(straightLevel(), makeContent([towerDef()], [enemyDef()]), 1);
    expect(sim.applyCommand(placeCmd('testTower', TOWER_HEX)).ok).toBe(true);
    const t = sim.towers[0];
    expect(t.specId).toBeNull();
    expect(t.nodes).toEqual({ damage: 0, range: 0, rate: 0 });
    expect(t.shots).toBe(0);
    expect(t.targeting).toBe('first');
  });
});
