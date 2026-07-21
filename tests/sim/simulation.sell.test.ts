import { describe, expect, it } from 'vitest';
import { Simulation } from '../../src/sim/simulation';
import { enemyDef, makeContent, placeCmd, straightLevel, TOWER_HEX, towerDef } from './helpers';

function freshSim(startingGold = 1000): Simulation {
  const sim = new Simulation(
    { ...straightLevel(), startingGold },
    makeContent([towerDef({ fireRate: 0.05 })], [enemyDef()]),
    1,
  );
  sim.applyCommand(placeCmd('testTower', TOWER_HEX)); // -100
  return sim;
}

describe('sellTower', () => {
  it('refunds 70% of the base cost, removes the tower, and emits towerSold', () => {
    const sim = freshSim();
    expect(sim.gold).toBe(900);
    const res = sim.applyCommand({ type: 'sellTower', towerId: 1 });
    expect(res.ok).toBe(true);
    expect(sim.gold).toBe(970); // +floor(100 × 0.7)
    expect(sim.towers).toHaveLength(0);
    expect(sim.tick()).toContainEqual({ type: 'towerSold', towerId: 1, refund: 70 });
  });

  it('frees the hex for a new tower', () => {
    const sim = freshSim();
    sim.applyCommand({ type: 'sellTower', towerId: 1 });
    const res = sim.applyCommand(placeCmd('testTower', TOWER_HEX));
    expect(res.ok).toBe(true);
    expect(sim.towers[0].id).toBe(2);
  });

  it('refunds 70% of EVERYTHING invested: base + tiers + spec + nodes', () => {
    const sim = freshSim();
    sim.applyCommand({ type: 'upgradeTower', towerId: 1 });                       // -50
    sim.applyCommand({ type: 'upgradeTower', towerId: 1 });                       // -60
    sim.applyCommand({ type: 'chooseSpecialization', towerId: 1, specId: 'specA' }); // -150
    sim.applyCommand({ type: 'buyMinorNode', towerId: 1, node: 'damage' });       // -40
    expect(sim.gold).toBe(600);
    expect(sim.investedGold(sim.towers[0])).toBe(400); // 100+50+60+150+40
    sim.applyCommand({ type: 'sellTower', towerId: 1 });
    expect(sim.gold).toBe(880); // 600 + floor(400 × 0.7)
  });

  it('rounds the refund down', () => {
    const sim = new Simulation(
      { ...straightLevel(), startingGold: 1000 },
      makeContent([towerDef({ cost: 15 })], [enemyDef()]),
      1,
    );
    sim.applyCommand(placeCmd('testTower', TOWER_HEX)); // -15
    sim.applyCommand({ type: 'sellTower', towerId: 1 });
    expect(sim.gold).toBe(995); // 985 + floor(10.5)
  });

  it('rejects selling a tower that is already gone', () => {
    const sim = freshSim();
    sim.applyCommand({ type: 'sellTower', towerId: 1 });
    const res = sim.applyCommand({ type: 'sellTower', towerId: 1 });
    expect(res.ok).toBe(false);
    expect(res.error).toBe('no such tower');
  });
});
