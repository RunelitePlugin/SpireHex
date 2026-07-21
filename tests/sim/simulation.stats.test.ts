import { describe, expect, it } from 'vitest';
import { Simulation } from '../../src/sim/simulation';
import type { TowerDef } from '../../src/content/types';
import { CONTENT } from '../../src/content';
import { enemyDef, makeContent, placeCmd, specDef, straightLevel, TOWER_HEX, towerDef } from './helpers';

function simWith(def: TowerDef = towerDef()): Simulation {
  const sim = new Simulation(straightLevel(), makeContent([def], [enemyDef()]), 1);
  sim.applyCommand(placeCmd('testTower', TOWER_HEX));
  return sim;
}

describe('statsFor spec + node resolution', () => {
  it('still resolves tiers absolutely when no spec is chosen (phase 2 behavior)', () => {
    const sim = simWith();
    sim.towers[0].tier = 2;
    expect(sim.statsFor(sim.towers[0]).damage).toBe(40);
  });

  it('a chosen spec replaces stats absolutely and carries its own mechanic', () => {
    const def = towerDef({
      mechanic: { kind: 'slow', factor: 0.5, duration: 1 },
      specializations: [
        specDef({ id: 'burny', damage: 77, range: 210, fireRate: 2.5, mechanic: { kind: 'burn', dps: 9, duration: 2 } }),
        specDef({ id: 'b' }), specDef({ id: 'c' }), specDef({ id: 'd' }),
      ],
    });
    const sim = simWith(def);
    sim.towers[0].tier = 2;
    sim.towers[0].specId = 'burny';
    const stats = sim.statsFor(sim.towers[0]);
    expect(stats.damage).toBe(77);
    expect(stats.range).toBe(210);
    expect(stats.fireRate).toBe(2.5);
    expect(stats.mechanic).toEqual({ kind: 'burn', dps: 9, duration: 2 });
  });

  it('minor nodes multiply the resolved stats (+10% dmg, +8% range, +8% rate per rank)', () => {
    const sim = simWith();
    sim.towers[0].nodes = { damage: 2, range: 3, rate: 1 };
    const stats = sim.statsFor(sim.towers[0]);
    expect(stats.damage).toBeCloseTo(12, 9);    // 10 × 1.2
    expect(stats.range).toBeCloseTo(496, 9);    // 400 × 1.24
    expect(stats.fireRate).toBeCloseTo(1.08, 9); // 1 × 1.08
  });

  it('nodes apply on top of a chosen spec', () => {
    const sim = simWith();
    sim.towers[0].tier = 2;
    sim.towers[0].specId = 'specA'; // helpers: damage 80
    sim.towers[0].nodes = { damage: 1, range: 0, rate: 0 };
    expect(sim.statsFor(sim.towers[0]).damage).toBeCloseTo(88, 9);
  });

  it('accepts the def as a parameter and resolves identically', () => {
    const def = towerDef();
    const sim = simWith(def);
    sim.towers[0].tier = 1;
    expect(sim.statsFor(sim.towers[0], def)).toEqual(sim.statsFor(sim.towers[0]));
  });
});

describe('real content through statsFor', () => {
  it('resolves emberSpire Duskfire: dual fire/shadow with its own stats', () => {
    const sim = new Simulation(
      straightLevel([{ entries: [{ enemyId: 'gloomling', count: 1, spacing: 0.1 }] }]),
      CONTENT,
      1,
    );
    sim.applyCommand(placeCmd('emberSpire', TOWER_HEX));
    sim.towers[0].tier = 2;
    sim.towers[0].specId = 'emberDuskfire';
    const stats = sim.statsFor(sim.towers[0]);
    expect(stats.mechanic).toEqual({ kind: 'dualElement', elements: ['fire', 'shadow'] });
    expect(stats.damage).toBe(34);
  });
});
