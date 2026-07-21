import { describe, expect, it } from 'vitest';
import { TICK_RATE } from '../../src/sim/constants';
import { Simulation } from '../../src/sim/simulation';
import { TOWER_HEX, enemyDef, makeContent, placeCmd, runTicks, straightLevel, towerDef } from './helpers';

const CONTENT = makeContent([towerDef()], [enemyDef()]);

function freshSim(): Simulation {
  return new Simulation(straightLevel(), CONTENT, 1);
}

describe('undo command (one-deep, full refund, build-phase only)', () => {
  it('undoes the last placement: tower removed, full cost refunded, event emitted', () => {
    const sim = freshSim();
    sim.applyCommand(placeCmd('testTower', TOWER_HEX));
    expect(sim.gold).toBe(900);
    const res = sim.applyCommand({ type: 'undo' });
    expect(res.ok).toBe(true);
    expect(sim.towers).toHaveLength(0);
    expect(sim.gold).toBe(1000);
    expect(sim.tick()).toContainEqual({ type: 'undoApplied', kind: 'place', towerId: 1, refund: 100 });
  });

  it('undoes the last upgrade: tier reverted, tier cost refunded, tower kept', () => {
    const sim = freshSim();
    sim.applyCommand(placeCmd('testTower', TOWER_HEX));
    sim.applyCommand({ type: 'upgradeTower', towerId: 1 });
    expect(sim.gold).toBe(850);
    expect(sim.applyCommand({ type: 'undo' }).ok).toBe(true);
    expect(sim.towers).toHaveLength(1);
    expect(sim.towers[0].tier).toBe(0);
    expect(sim.gold).toBe(900);
  });

  it('undoes a specialization: mechanic and stats revert, investedGold drops, cost refunded', () => {
    const sim = freshSim();
    sim.applyCommand(placeCmd('testTower', TOWER_HEX));
    sim.applyCommand({ type: 'upgradeTower', towerId: 1 });
    sim.applyCommand({ type: 'upgradeTower', towerId: 1 });
    sim.applyCommand({ type: 'chooseSpecialization', towerId: 1, specId: 'specA' });
    expect(sim.gold).toBe(640); // 1000 - 100 - 50 - 60 - 150
    expect(sim.statsFor(sim.towers[0]).damage).toBe(80);
    expect(sim.applyCommand({ type: 'undo' }).ok).toBe(true);
    expect(sim.towers[0].specId).toBeNull();
    expect(sim.statsFor(sim.towers[0]).damage).toBe(40); // back to tier-2 stats
    expect(sim.investedGold(sim.towers[0])).toBe(210);   // 100 + 50 + 60
    expect(sim.gold).toBe(790);
  });

  it('undoes a minor node purchase: rank reverted, rank cost refunded', () => {
    const sim = freshSim();
    sim.applyCommand(placeCmd('testTower', TOWER_HEX));
    sim.applyCommand({ type: 'buyMinorNode', towerId: 1, node: 'damage' });
    expect(sim.gold).toBe(860); // 1000 - 100 - 40
    expect(sim.applyCommand({ type: 'undo' }).ok).toBe(true);
    expect(sim.towers[0].nodes.damage).toBe(0);
    expect(sim.gold).toBe(900);
  });

  it('is one level deep: only the most recent action reverts, then nothing', () => {
    const sim = freshSim();
    sim.applyCommand(placeCmd('testTower', TOWER_HEX));
    sim.applyCommand({ type: 'upgradeTower', towerId: 1 });
    expect(sim.applyCommand({ type: 'undo' }).ok).toBe(true);  // reverts the upgrade
    expect(sim.towers).toHaveLength(1);                        // the place is NOT undone
    expect(sim.applyCommand({ type: 'undo' })).toEqual({ ok: false, error: 'nothing to undo' });
  });

  it('clears the record when a wave starts manually', () => {
    const sim = freshSim();
    sim.applyCommand(placeCmd('testTower', TOWER_HEX));
    sim.applyCommand({ type: 'startWave' });
    expect(sim.applyCommand({ type: 'undo' })).toEqual({ ok: false, error: 'nothing to undo' });
  });

  it('clears the record when the countdown auto-starts the next wave', () => {
    const fast = makeContent([towerDef()], [enemyDef({ speed: 400 })]); // crosses in ~2.5 s
    const sim = new Simulation(
      straightLevel([
        { entries: [{ enemyId: 'dummy', count: 1, spacing: 0.1 }] },
        { entries: [{ enemyId: 'dummy', count: 1, spacing: 0.1 }] },
      ]),
      fast, 1,
    );
    sim.applyCommand({ type: 'startWave' });
    runTicks(sim, 4 * TICK_RATE); // wave 1 leaks out; back to building with the 10 s countdown armed
    expect(sim.status).toBe('building');
    sim.applyCommand(placeCmd('testTower', TOWER_HEX));
    expect(sim.canUndo).toBe(true);
    runTicks(sim, 10 * TICK_RATE + 2); // countdown fires beginWave on its own
    expect(sim.applyCommand({ type: 'undo' })).toEqual({ ok: false, error: 'nothing to undo' });
  });

  it('selling clears the record, and selling itself is never undoable', () => {
    const sim = freshSim();
    sim.applyCommand(placeCmd('testTower', TOWER_HEX));                  // tower 1
    sim.applyCommand(placeCmd('testTower', { q: 4, r: -1 }));            // tower 2 — the record
    sim.applyCommand({ type: 'sellTower', towerId: 1 });
    expect(sim.applyCommand({ type: 'undo' })).toEqual({ ok: false, error: 'nothing to undo' });
    expect(sim.towers).toHaveLength(1); // tower 2 untouched — undo did nothing
  });

  it('actions taken during combat never create a record', () => {
    const sim = freshSim();
    sim.applyCommand({ type: 'startWave' });
    expect(sim.applyCommand(placeCmd('testTower', TOWER_HEX)).ok).toBe(true);
    expect(sim.canUndo).toBe(false);
    expect(sim.applyCommand({ type: 'undo' })).toEqual({ ok: false, error: 'nothing to undo' });
  });

  it('exposes canUndo for the UI button state', () => {
    const sim = freshSim();
    expect(sim.canUndo).toBe(false);
    sim.applyCommand(placeCmd('testTower', TOWER_HEX));
    expect(sim.canUndo).toBe(true);
    sim.applyCommand({ type: 'undo' });
    expect(sim.canUndo).toBe(false);
  });

  it('rejects undo once the level is over', () => {
    const fast = makeContent([towerDef()], [enemyDef({ speed: 400 })]);
    const sim = new Simulation({ ...straightLevel(), lives: 1 }, fast, 1);
    sim.applyCommand(placeCmd('testTower', { q: 4, r: -1 })); // far from the path start; record exists
    sim.applyCommand({ type: 'startWave' });
    runTicks(sim, 4 * TICK_RATE); // the dummy leaks; 1 life -> lost
    expect(sim.status).toBe('lost');
    expect(sim.applyCommand({ type: 'undo' })).toEqual({ ok: false, error: 'level over' });
  });
});
