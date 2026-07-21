import { describe, expect, it } from 'vitest';
import { computeHitDamage } from '../../src/sim/damage';
import { TICK_RATE } from '../../src/sim/constants';
import { Simulation } from '../../src/sim/simulation';
import { enemyDef, makeContent, placeCmd, runTicks, straightLevel, TOWER_HEX, towerDef } from './helpers';

describe('computeHitDamage', () => {
  it('applies the 1.0 baseline for unrelated elements', () => {
    expect(computeHitDamage(10, 'fire', 'nature', 0, false)).toBe(10);
  });

  it('deals 1.5x to the opposed element', () => {
    expect(computeHitDamage(10, 'fire', 'frost', 0, false)).toBe(15);
  });

  it('deals 0.5x to its own element', () => {
    expect(computeHitDamage(10, 'fire', 'fire', 0, false)).toBe(5);
  });

  it('subtracts flat armor AFTER the element multiplier', () => {
    // 10 * 1.5 - 4 = 11 (multiplier first; armor-first would give (10 - 4) * 1.5 = 9)
    expect(computeHitDamage(10, 'fire', 'frost', 4, false)).toBe(11);
  });

  it('never deals less than 1 per hit', () => {
    expect(computeHitDamage(10, 'fire', 'nature', 50, false)).toBe(1);
  });

  it('ignoreArmor skips armor but keeps the element multiplier', () => {
    expect(computeHitDamage(10, 'fire', 'frost', 50, true)).toBe(15);
  });
});

describe('tower hits use the pipeline', () => {
  it('damages an armored enemy by (base * multiplier) - armor', () => {
    // fire tower vs frost enemy with armor 4: 10 * 1.5 - 4 = 11 per hit
    const content = makeContent(
      [towerDef({ fireRate: 0.05 })], // 20 s cooldown → exactly one shot in this test
      [enemyDef({ hp: 100, element: 'frost', armor: 4 })],
    );
    const sim = new Simulation(straightLevel(), content, 1);
    sim.applyCommand(placeCmd('testTower', TOWER_HEX));
    sim.applyCommand({ type: 'startWave' });
    const events = runTicks(sim, TICK_RATE);
    expect(events.filter((e) => e.type === 'towerFired')).toHaveLength(1);
    expect(sim.enemies[0].hp).toBe(89);
  });

  it('heavily armored enemies still lose at least 1 hp per hit', () => {
    const content = makeContent(
      [towerDef({ fireRate: 0.05 })],
      [enemyDef({ hp: 100, element: 'nature', armor: 50 })],
    );
    const sim = new Simulation(straightLevel(), content, 1);
    sim.applyCommand(placeCmd('testTower', TOWER_HEX));
    sim.applyCommand({ type: 'startWave' });
    runTicks(sim, TICK_RATE);
    expect(sim.enemies[0].hp).toBe(99);
  });
});
