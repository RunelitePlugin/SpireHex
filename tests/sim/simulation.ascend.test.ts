import { describe, expect, it } from 'vitest';
import { Simulation } from '../../src/sim/simulation';
import type { SimModifiers } from '../../src/sim/types';
import { enemyDef, makeContent, placeCmd, specDef, straightLevel, TOWER_HEX, towerDef } from './helpers';

/**
 * Tower at tier 2 with specA chosen, ready to ascend.
 * Gold spent to get here: 100 (base) + 50 (t1) + 60 (t2) + 150 (specA) = 360.
 * Ascending specA (helpers' ascSpecA) costs a further 300.
 */
function ascendReady(startingGold = 1000, modifiers?: SimModifiers): Simulation {
  const sim = new Simulation(
    { ...straightLevel(), startingGold },
    makeContent([towerDef({ fireRate: 0.05 })], [enemyDef()]),
    1,
    modifiers,
  );
  sim.applyCommand(placeCmd('testTower', TOWER_HEX));
  sim.applyCommand({ type: 'upgradeTower', towerId: 1 });
  sim.applyCommand({ type: 'upgradeTower', towerId: 1 });
  sim.applyCommand({ type: 'chooseSpecialization', towerId: 1, specId: 'specA' });
  return sim;
}

describe('ascendTower', () => {
  it('rejects a tower with no specialization chosen', () => {
    const sim = new Simulation(straightLevel(), makeContent([towerDef()], [enemyDef()]), 1);
    sim.applyCommand(placeCmd('testTower', TOWER_HEX));
    const res = sim.applyCommand({ type: 'ascendTower', towerId: 1 });
    expect(res).toEqual({ ok: false, error: 'requires a specialization' });
    expect(sim.towers[0].ascended).toBe(false);
  });

  it('rejects when already ascended', () => {
    const sim = ascendReady();
    sim.applyCommand({ type: 'ascendTower', towerId: 1 });
    const res = sim.applyCommand({ type: 'ascendTower', towerId: 1 });
    expect(res).toEqual({ ok: false, error: 'already ascended' });
  });

  it('ascensionsUnlocked: false rejects with the exact lock error and spends nothing', () => {
    const sim = ascendReady(1000, { ascensionsUnlocked: false });
    const goldBefore = sim.gold;
    const res = sim.applyCommand({ type: 'ascendTower', towerId: 1 });
    expect(res).toEqual({ ok: false, error: 'ascensions locked' });
    expect(sim.towers[0].ascended).toBe(false);
    expect(sim.gold).toBe(goldBefore);
  });

  it('a bare Simulation (no modifiers) allows ascension — bare-sim convention pinned', () => {
    const sim = ascendReady();
    expect(sim.applyCommand({ type: 'ascendTower', towerId: 1 })).toEqual({ ok: true });
  });

  it('rejects when gold is short and charges nothing', () => {
    const sim = ascendReady(360); // 360 - 360 (base/t1/t2/spec) = 0 < 300 (ascension cost)
    expect(sim.gold).toBe(0);
    const res = sim.applyCommand({ type: 'ascendTower', towerId: 1 });
    expect(res).toEqual({ ok: false, error: 'not enough gold' });
    expect(sim.towers[0].ascended).toBe(false);
    expect(sim.gold).toBe(0);
  });

  it('success charges gold, sets ascended, and emits towerAscended on the next tick', () => {
    const sim = ascendReady();
    expect(sim.gold).toBe(640);
    const res = sim.applyCommand({ type: 'ascendTower', towerId: 1 });
    expect(res).toEqual({ ok: true });
    expect(sim.gold).toBe(340); // 640 - 300 (ascSpecA)
    expect(sim.towers[0].ascended).toBe(true);
    expect(sim.tick()).toContainEqual({ type: 'towerAscended', towerId: 1, specId: 'specA' });
  });

  it("stats become the ascension's through statsFor", () => {
    const sim = ascendReady();
    sim.applyCommand({ type: 'ascendTower', towerId: 1 });
    const stats = sim.statsFor(sim.towers[0]);
    expect(stats.damage).toBe(160); // helpers ascSpecA
    expect(stats.range).toBe(400);
    expect(stats.fireRate).toBe(1);
  });

  it('mechanic override applies when the ascension specifies one', () => {
    const def = towerDef({
      fireRate: 0.05,
      specializations: [
        specDef({
          id: 'burnSpec', mechanic: { kind: 'burn', dps: 10, duration: 2 },
          ascension: {
            id: 'ascBurnSpec', name: 'Ascended Burn', cost: 300, damage: 200, range: 400, fireRate: 1,
            mechanic: { kind: 'burn', dps: 99, duration: 5 },
          },
        }),
        specDef({ id: 'specB' }),
        specDef({ id: 'specC' }),
        specDef({ id: 'specD' }),
      ],
    });
    const sim = new Simulation(straightLevel(), makeContent([def], [enemyDef()]), 1);
    sim.applyCommand(placeCmd('testTower', TOWER_HEX));
    sim.applyCommand({ type: 'upgradeTower', towerId: 1 });
    sim.applyCommand({ type: 'upgradeTower', towerId: 1 });
    sim.applyCommand({ type: 'chooseSpecialization', towerId: 1, specId: 'burnSpec' });
    sim.applyCommand({ type: 'ascendTower', towerId: 1 });
    expect(sim.statsFor(sim.towers[0]).mechanic).toEqual({ kind: 'burn', dps: 99, duration: 5 });
  });

  it('mechanic inherits the spec\'s when the ascension omits it', () => {
    const sim = ascendReady(); // helpers specA: mechanic none, ascSpecA has no mechanic override
    sim.applyCommand({ type: 'ascendTower', towerId: 1 });
    expect(sim.statsFor(sim.towers[0]).mechanic).toEqual({ kind: 'none' });
  });

  it('minor nodes still multiply on top of ascension stats', () => {
    const sim = ascendReady();
    sim.applyCommand({ type: 'ascendTower', towerId: 1 });
    sim.applyCommand({ type: 'buyMinorNode', towerId: 1, node: 'damage' });
    expect(sim.statsFor(sim.towers[0]).damage).toBeCloseTo(160 * 1.1);
  });

  it('undo restores gold and un-ascends the tower', () => {
    const sim = ascendReady();
    sim.applyCommand({ type: 'ascendTower', towerId: 1 });
    expect(sim.gold).toBe(340);
    const res = sim.applyCommand({ type: 'undo' });
    expect(res).toEqual({ ok: true });
    expect(sim.gold).toBe(640);
    expect(sim.towers[0].ascended).toBe(false);
    expect(sim.tick()).toContainEqual({ type: 'undoApplied', kind: 'ascend', towerId: 1, refund: 300 });
  });

  it('investedGold includes the ascension cost once ascended', () => {
    const sim = ascendReady();
    expect(sim.investedGold(sim.towers[0])).toBe(360); // 100 + 50 + 60 + 150
    sim.applyCommand({ type: 'ascendTower', towerId: 1 });
    expect(sim.investedGold(sim.towers[0])).toBe(660); // + 300 ascSpecA
  });
});
