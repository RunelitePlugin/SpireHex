import { describe, expect, it } from 'vitest';
import { TICK_RATE } from '../../src/sim/constants';
import { Simulation } from '../../src/sim/simulation';
import type { Command } from '../../src/sim/types';
import { enemyDef, makeContent, placeCmd, runTicks, straightLevel, TOWER_HEX, towerDef } from './helpers';

// helpers.towerDef defaults: cost 100, damage 10, tiers [{cost 50, damage 20}, {cost 60, damage 40}]
function freshSim(startingGold = 1000): Simulation {
  const content = makeContent([towerDef({ fireRate: 0.05 })], [enemyDef({ hp: 90 })]);
  const sim = new Simulation({ ...straightLevel(), startingGold }, content, 1);
  sim.applyCommand(placeCmd('testTower', TOWER_HEX));
  return sim;
}

describe('upgradeTower', () => {
  it('buys the next tier, charges gold, and emits towerUpgraded on the next tick', () => {
    const sim = freshSim();
    const towerId = sim.towers[0].id;
    expect(sim.gold).toBe(900);
    const res = sim.applyCommand({ type: 'upgradeTower', towerId });
    expect(res.ok).toBe(true);
    expect(sim.gold).toBe(850);
    expect(sim.towers[0].tier).toBe(1);
    expect(sim.tick()).toContainEqual({ type: 'towerUpgraded', towerId, tier: 1 });
  });

  it('applies the tier stats: tier-1 damage (20) leaves the 90 hp enemy at 70 after one hit', () => {
    const sim = freshSim();
    sim.applyCommand({ type: 'upgradeTower', towerId: sim.towers[0].id });
    sim.applyCommand({ type: 'startWave' });
    const events = runTicks(sim, TICK_RATE);
    expect(events.filter((e) => e.type === 'towerFired')).toHaveLength(1);
    expect(sim.enemies[0].hp).toBe(70); // base damage 10 would leave 80
  });

  it('allows exactly two upgrades, then rejects', () => {
    const sim = freshSim();
    const towerId = sim.towers[0].id;
    expect(sim.applyCommand({ type: 'upgradeTower', towerId }).ok).toBe(true);
    expect(sim.applyCommand({ type: 'upgradeTower', towerId }).ok).toBe(true);
    expect(sim.towers[0].tier).toBe(2);
    const res = sim.applyCommand({ type: 'upgradeTower', towerId });
    expect(res.ok).toBe(false);
    expect(res.error).toBe('already at max tier');
    expect(sim.gold).toBe(900 - 50 - 60);
  });

  it('rejects an unknown tower id', () => {
    const sim = freshSim();
    const res = sim.applyCommand({ type: 'upgradeTower', towerId: 999 });
    expect(res.ok).toBe(false);
    expect(res.error).toBe('no such tower');
  });

  it('rejects when gold is short and charges nothing', () => {
    const sim = freshSim(100); // placement eats all 100 gold
    expect(sim.gold).toBe(0);
    const res = sim.applyCommand({ type: 'upgradeTower', towerId: sim.towers[0].id });
    expect(res.ok).toBe(false);
    expect(res.error).toBe('not enough gold');
    expect(sim.towers[0].tier).toBe(0);
  });

  it('rejects a malformed command at runtime via the exhaustive switch default', () => {
    const sim = freshSim();
    const res = sim.applyCommand({ type: 'selfDestruct' } as unknown as Command);
    expect(res.ok).toBe(false);
  });

  it("tier mechanic inheritance: a tier that omits mechanic keeps the nearest lower tier's mechanic", () => {
    const content = makeContent(
      [
        towerDef({
          tiers: [
            { cost: 50, damage: 20, range: 400, fireRate: 1, mechanic: { kind: 'burn', dps: 30, duration: 1 } },
            { cost: 60, damage: 40, range: 400, fireRate: 1 }, // omits mechanic: should inherit tier 1's burn, not base 'none'
          ],
        }),
      ],
      [enemyDef()],
    );
    const sim = new Simulation({ ...straightLevel(), startingGold: 1000 }, content, 1);
    sim.applyCommand(placeCmd('testTower', TOWER_HEX));
    const towerId = sim.towers[0].id;
    expect(sim.applyCommand({ type: 'upgradeTower', towerId }).ok).toBe(true);
    expect(sim.applyCommand({ type: 'upgradeTower', towerId }).ok).toBe(true);
    expect(sim.towers[0].tier).toBe(2);

    sim.applyCommand({ type: 'startWave' });
    runTicks(sim, TICK_RATE);

    expect(sim.enemies[0].effects.burn).toBeDefined();
    expect(sim.enemies[0].effects.burn?.dps).toBe(30);
  });
});
