import { describe, expect, it } from 'vitest';
import { Simulation } from '../../src/sim/simulation';
import { enemyDef, makeContent, placeCmd, runTicks, straightLevel, TOWER_HEX, towerDef } from './helpers';

describe('goldEarned (bounty tracking for XP)', () => {
  it('starts at zero', () => {
    const sim = new Simulation(straightLevel(), makeContent([towerDef()], [enemyDef()]), 1);
    expect(sim.goldEarned).toBe(0);
  });

  it('accumulates the bounty of every kill', () => {
    const sim = new Simulation(
      straightLevel([{ entries: [{ enemyId: 'dummy', count: 3, spacing: 0.1 }] }]),
      makeContent([towerDef({ damage: 1000 })], [enemyDef()]),
      1,
    );
    sim.applyCommand(placeCmd('testTower', TOWER_HEX));
    sim.applyCommand({ type: 'startWave' });
    runTicks(sim, 300);
    expect(sim.status).toBe('won');
    expect(sim.goldEarned).toBe(15); // 3 dummies × 5 bounty
  });

  it('does not count early-call bonus gold', () => {
    const sim = new Simulation(
      straightLevel([
        { entries: [{ enemyId: 'dummy', count: 1, spacing: 0.1 }] },
        { entries: [{ enemyId: 'dummy', count: 1, spacing: 0.1 }] },
      ]),
      makeContent([towerDef({ damage: 1000 })], [enemyDef()]),
      1,
    );
    sim.applyCommand(placeCmd('testTower', TOWER_HEX));
    sim.applyCommand({ type: 'startWave' });
    for (let guard = 0; guard < 600; guard++) {
      if (sim.tick().some((e) => e.type === 'waveCleared')) break;
    }
    sim.applyCommand({ type: 'startWave' }); // early call banks bonus gold...
    expect(sim.goldEarned).toBe(5); // ...but only the wave-1 kill counts
  });

  it('leaks add nothing', () => {
    const sim = new Simulation(
      straightLevel([{ entries: [{ enemyId: 'dummy', count: 1, spacing: 0.1 }] }]),
      makeContent([towerDef()], [enemyDef({ speed: 600 })]), // sprints the ~998-length path in <2 s
      1,
    );
    sim.applyCommand({ type: 'startWave' }); // no towers placed
    const events = runTicks(sim, 100);
    expect(events.some((e) => e.type === 'enemyLeaked')).toBe(true);
    expect(sim.goldEarned).toBe(0);
  });
});
