import { describe, expect, it } from 'vitest';
import { Simulation } from '../../src/sim/simulation';
import type { SimModifiers } from '../../src/sim/types';
import { enemyDef, makeContent, placeCmd, straightLevel, TOWER_HEX, towerDef } from './helpers';

/** A sim with one testTower pushed to tier 2 (100 + 50 + 60 gold; 790 left — specA costs 150). */
function tier2Sim(modifiers?: SimModifiers): Simulation {
  const sim = new Simulation(straightLevel(), makeContent([towerDef()], [enemyDef()]), 1, modifiers);
  sim.applyCommand(placeCmd('testTower', TOWER_HEX));
  sim.applyCommand({ type: 'upgradeTower', towerId: 1 });
  sim.applyCommand({ type: 'upgradeTower', towerId: 1 });
  return sim;
}

describe('specialization skill gate', () => {
  it('a bare Simulation (no modifiers) allows specialization — pre-Phase-5 behavior pinned', () => {
    const sim = tier2Sim(); // fourth arg omitted entirely
    expect(sim.applyCommand({ type: 'chooseSpecialization', towerId: 1, specId: 'specA' })).toEqual({ ok: true });
    expect(sim.towers[0].specId).toBe('specA');
  });

  it('explicit specializationsUnlocked: true allows specialization', () => {
    const sim = tier2Sim({ specializationsUnlocked: true });
    expect(sim.applyCommand({ type: 'chooseSpecialization', towerId: 1, specId: 'specA' })).toEqual({ ok: true });
  });

  it('specializationsUnlocked: false rejects with the exact lock error and spends nothing', () => {
    const sim = tier2Sim({ specializationsUnlocked: false });
    const goldBefore = sim.gold;
    const result = sim.applyCommand({ type: 'chooseSpecialization', towerId: 1, specId: 'specA' });
    expect(result).toEqual({ ok: false, error: 'specializations locked' });
    expect(sim.towers[0].specId).toBeNull();
    expect(sim.gold).toBe(goldBefore);
  });
});
