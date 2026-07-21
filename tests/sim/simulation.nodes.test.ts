import { describe, expect, it } from 'vitest';
import { TICK_RATE } from '../../src/sim/constants';
import { Simulation } from '../../src/sim/simulation';
import { enemyDef, makeContent, placeCmd, runTicks, straightLevel, TOWER_HEX, towerDef } from './helpers';

function freshSim(startingGold = 1000): Simulation {
  const sim = new Simulation(
    { ...straightLevel(), startingGold },
    makeContent([towerDef({ fireRate: 0.05 })], [enemyDef()]),
    1,
  );
  sim.applyCommand(placeCmd('testTower', TOWER_HEX)); // -100 gold
  return sim;
}

describe('buyMinorNode', () => {
  it('charges 40/60/80 for successive ranks of one node, then rejects rank 4', () => {
    const sim = freshSim();
    expect(sim.gold).toBe(900);
    expect(sim.applyCommand({ type: 'buyMinorNode', towerId: 1, node: 'damage' }).ok).toBe(true);
    expect(sim.gold).toBe(860);
    expect(sim.applyCommand({ type: 'buyMinorNode', towerId: 1, node: 'damage' }).ok).toBe(true);
    expect(sim.gold).toBe(800);
    expect(sim.applyCommand({ type: 'buyMinorNode', towerId: 1, node: 'damage' }).ok).toBe(true);
    expect(sim.gold).toBe(720);
    expect(sim.towers[0].nodes.damage).toBe(3);
    const res = sim.applyCommand({ type: 'buyMinorNode', towerId: 1, node: 'damage' });
    expect(res.ok).toBe(false);
    expect(res.error).toBe('node at max rank');
    expect(sim.gold).toBe(720);
  });

  it('each node has its own cost ladder: first rank of a second node still costs 40', () => {
    const sim = freshSim();
    sim.applyCommand({ type: 'buyMinorNode', towerId: 1, node: 'damage' }); // 40
    sim.applyCommand({ type: 'buyMinorNode', towerId: 1, node: 'range' });  // 40, not 60
    expect(sim.gold).toBe(820);
    expect(sim.towers[0].nodes).toEqual({ damage: 1, range: 1, rate: 0 });
  });

  it('emits minorNodeBought with the rank reached', () => {
    const sim = freshSim();
    sim.applyCommand({ type: 'buyMinorNode', towerId: 1, node: 'rate' });
    expect(sim.tick()).toContainEqual({ type: 'minorNodeBought', towerId: 1, node: 'rate', rank: 1 });
  });

  it('a damage node rank actually raises hit damage (+10%)', () => {
    const sim = freshSim();
    sim.applyCommand({ type: 'buyMinorNode', towerId: 1, node: 'damage' });
    sim.applyCommand({ type: 'startWave' });
    runTicks(sim, TICK_RATE); // exactly one shot at fireRate 0.05
    expect(sim.enemies[0].hp).toBeCloseTo(89, 9); // 100 − 10 × 1.1
  });

  it('rejects when gold is short and on unknown towers', () => {
    const sim = freshSim(130); // 130 − 100 = 30 < 40
    const short = sim.applyCommand({ type: 'buyMinorNode', towerId: 1, node: 'damage' });
    expect(short.ok).toBe(false);
    expect(short.error).toBe('not enough gold');
    expect(sim.towers[0].nodes.damage).toBe(0);
    const missing = sim.applyCommand({ type: 'buyMinorNode', towerId: 42, node: 'damage' });
    expect(missing.ok).toBe(false);
    expect(missing.error).toBe('no such tower');
  });
});
