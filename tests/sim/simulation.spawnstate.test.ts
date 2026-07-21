import { describe, expect, it } from 'vitest';
import { TICK_RATE } from '../../src/sim/constants';
import { Simulation } from '../../src/sim/simulation';
import { enemyDef, makeContent, placeCmd, runTicks, straightLevel, TOWER_HEX, towerDef } from './helpers';

describe('enemy and tower state carry combat fields', () => {
  it('spawned enemies carry element, armor, stealth, and an empty effects store', () => {
    const content = makeContent(
      [towerDef()],
      [enemyDef({ id: 'dummy', element: 'frost', armor: 4, stealth: true })],
    );
    const sim = new Simulation(straightLevel(), content, 1);
    sim.applyCommand({ type: 'startWave' });
    runTicks(sim, TICK_RATE); // 1 s — well past the 0.1 s spawn
    expect(sim.enemies).toHaveLength(1);
    const e = sim.enemies[0];
    expect(e.element).toBe('frost');
    expect(e.armor).toBe(4);
    expect(e.stealth).toBe(true);
    expect(e.effects).toEqual({});
  });

  it('defaults stealth to false when the def omits it', () => {
    const content = makeContent([towerDef()], [enemyDef()]);
    const sim = new Simulation(straightLevel(), content, 1);
    sim.applyCommand({ type: 'startWave' });
    runTicks(sim, TICK_RATE);
    expect(sim.enemies[0].stealth).toBe(false);
  });

  it('placed towers start at tier 0', () => {
    const content = makeContent([towerDef()], [enemyDef()]);
    const sim = new Simulation(straightLevel(), content, 1);
    expect(sim.applyCommand(placeCmd('testTower', TOWER_HEX)).ok).toBe(true);
    expect(sim.towers[0].tier).toBe(0);
  });
});
