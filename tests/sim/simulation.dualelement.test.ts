import { describe, expect, it } from 'vitest';
import { Simulation } from '../../src/sim/simulation';
import type { SimEvent } from '../../src/sim/types';
import { enemyDef, makeContent, placeCmd, runTicks, straightLevel, TOWER_HEX, towerDef } from './helpers';

/**
 * fireRate 30 → cooldown 1/30 s = exactly one tick, so the tower fires every tick
 * once the enemy spawns (tick 4 with the default 0.1 s spacing).
 */
function dualSim(enemyOverrides = {}): Simulation {
  const content = makeContent(
    [towerDef({ fireRate: 30, mechanic: { kind: 'dualElement', elements: ['fire', 'frost'] } })],
    [enemyDef({ element: 'frost', hp: 100, ...enemyOverrides })],
  );
  const sim = new Simulation(straightLevel(), content, 1);
  sim.applyCommand(placeCmd('testTower', TOWER_HEX));
  sim.applyCommand({ type: 'startWave' });
  return sim;
}

describe('dualElement mechanic', () => {
  it('alternates element every shot: fire (1.5×), frost (0.5×), fire (1.5×) vs a frost enemy', () => {
    const sim = dualSim();
    runTicks(sim, 5); // enemy spawns tick 3 (simTime crosses 0.1s); shots fire ticks 3, 4, 5
    expect(sim.towers[0].shots).toBe(3);
    expect(sim.enemies[0].hp).toBe(100 - 15 - 5 - 15); // 10×1.5, 10×0.5, 10×1.5
  });

  it('applies no on-hit status effect', () => {
    const sim = dualSim();
    runTicks(sim, 6);
    expect(sim.enemies[0].effects).toEqual({});
  });

  it('does not reveal stealth (pierce-only rule unchanged)', () => {
    const sim = dualSim({ stealth: true });
    const events = runTicks(sim, 30);
    expect(events.filter((e) => e.type === 'towerFired')).toHaveLength(0);
    expect(sim.towers[0].shots).toBe(0);
  });

  it('is deterministic: two identical runs produce identical event logs', () => {
    const run = (): SimEvent[] => runTicks(dualSim(), 60);
    expect(run()).toEqual(run());
  });
});
