import { describe, expect, it } from 'vitest';
import { Simulation } from '../../src/sim/simulation';
import { enemyDef, makeContent, placeCmd, straightLevel, TOWER_HEX, towerDef } from './helpers';

/** Tower at tier 2, ready to specialize. Gold: start − 100 (base) − 50 (t1) − 60 (t2). */
function specReady(startingGold = 1000): Simulation {
  const sim = new Simulation(
    { ...straightLevel(), startingGold },
    makeContent([towerDef({ fireRate: 0.05 })], [enemyDef()]),
    1,
  );
  sim.applyCommand(placeCmd('testTower', TOWER_HEX));
  sim.applyCommand({ type: 'upgradeTower', towerId: 1 });
  sim.applyCommand({ type: 'upgradeTower', towerId: 1 });
  return sim;
}

describe('chooseSpecialization', () => {
  it('charges the spec cost, sets specId, and emits specializationChosen on the next tick', () => {
    const sim = specReady();
    expect(sim.gold).toBe(790);
    const res = sim.applyCommand({ type: 'chooseSpecialization', towerId: 1, specId: 'specA' });
    expect(res.ok).toBe(true);
    expect(sim.gold).toBe(640); // specA costs 150
    expect(sim.towers[0].specId).toBe('specA');
    expect(sim.tick()).toContainEqual({ type: 'specializationChosen', towerId: 1, specId: 'specA' });
  });

  it('the chosen spec drives statsFor', () => {
    const sim = specReady();
    sim.applyCommand({ type: 'chooseSpecialization', towerId: 1, specId: 'specA' });
    expect(sim.statsFor(sim.towers[0]).damage).toBe(80); // helpers specA
  });

  it('rejects below tier 2', () => {
    const sim = new Simulation(straightLevel(), makeContent([towerDef()], [enemyDef()]), 1);
    sim.applyCommand(placeCmd('testTower', TOWER_HEX));
    sim.applyCommand({ type: 'upgradeTower', towerId: 1 }); // tier 1 only
    const res = sim.applyCommand({ type: 'chooseSpecialization', towerId: 1, specId: 'specA' });
    expect(res.ok).toBe(false);
    expect(res.error).toBe('requires tier 2');
    expect(sim.towers[0].specId).toBeNull();
  });

  it('rejects a spec id that does not belong to the tower', () => {
    const sim = specReady();
    const res = sim.applyCommand({ type: 'chooseSpecialization', towerId: 1, specId: 'nope' });
    expect(res.ok).toBe(false);
    expect(res.error).toBe('unknown specialization');
  });

  it('checks spec existence before the tier gate: an unknown specId on a tier-1 tower is "unknown specialization", not "requires tier 2"', () => {
    const sim = new Simulation(straightLevel(), makeContent([towerDef()], [enemyDef()]), 1);
    sim.applyCommand(placeCmd('testTower', TOWER_HEX));
    sim.applyCommand({ type: 'upgradeTower', towerId: 1 }); // tier 1 only — below the tier-2 requirement
    const res = sim.applyCommand({ type: 'chooseSpecialization', towerId: 1, specId: 'nope' });
    expect(res.ok).toBe(false);
    expect(res.error).toBe('unknown specialization');
  });

  it('choosing locks the other branches: a second choice is rejected and charges nothing', () => {
    const sim = specReady();
    sim.applyCommand({ type: 'chooseSpecialization', towerId: 1, specId: 'specA' });
    const res = sim.applyCommand({ type: 'chooseSpecialization', towerId: 1, specId: 'specB' });
    expect(res.ok).toBe(false);
    expect(res.error).toBe('specialization already chosen');
    expect(sim.towers[0].specId).toBe('specA');
    expect(sim.gold).toBe(640);
  });

  it('rejects when gold is short and charges nothing', () => {
    const sim = specReady(300); // 300 − 210 = 90 < 150
    const res = sim.applyCommand({ type: 'chooseSpecialization', towerId: 1, specId: 'specA' });
    expect(res.ok).toBe(false);
    expect(res.error).toBe('not enough gold');
    expect(sim.gold).toBe(90);
    expect(sim.towers[0].specId).toBeNull();
  });

  it('rejects an unknown tower id', () => {
    const sim = specReady();
    const res = sim.applyCommand({ type: 'chooseSpecialization', towerId: 99, specId: 'specA' });
    expect(res.ok).toBe(false);
    expect(res.error).toBe('no such tower');
  });
});
