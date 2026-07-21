import { describe, expect, it } from 'vitest';
import { TICK_RATE } from '../../src/sim/constants';
import { Simulation } from '../../src/sim/simulation';
import { enemyDef, makeContent, placeCmd, runTicks, straightLevel, TOWER_HEX, towerDef } from './helpers';

describe('stealth and pierce (radiant)', () => {
  it('non-pierce towers never fire at a stealthed enemy', () => {
    const content = makeContent(
      [towerDef()],
      [enemyDef({ stealth: true })],
    );
    const sim = new Simulation(straightLevel(), content, 1);
    sim.applyCommand(placeCmd('testTower', TOWER_HEX));
    sim.applyCommand({ type: 'startWave' });
    const events = runTicks(sim, 5 * TICK_RATE);
    expect(events.some((e) => e.type === 'towerFired')).toBe(false);
    expect(sim.enemies[0].hp).toBe(sim.enemies[0].maxHp);
  });

  it('pierce towers target stealthed enemies and ignore their armor', () => {
    const content = makeContent(
      [towerDef({ damage: 10, fireRate: 0.05, mechanic: { kind: 'pierce' } })],
      [enemyDef({ hp: 100, armor: 50, stealth: true })],
    );
    const sim = new Simulation(straightLevel(), content, 1);
    sim.applyCommand(placeCmd('testTower', TOWER_HEX));
    sim.applyCommand({ type: 'startWave' });
    const events = runTicks(sim, TICK_RATE);
    expect(events.filter((e) => e.type === 'towerFired')).toHaveLength(1);
    expect(sim.enemies[0].hp).toBe(90); // 10, not max(1, 10 - 50) = 1
  });

  it('non-pierce towers pick the best NON-stealthed target even when a stealthed enemy leads', () => {
    const content = makeContent(
      [towerDef({ fireRate: 0.05 })],
      [
        enemyDef({ id: 'sneak', stealth: true, hp: 1000 }),
        enemyDef({ id: 'walker', hp: 1000 }),
      ],
    );
    // sneak spawns first → always furthest along; walker follows 0.1 s behind.
    const sim = new Simulation(
      straightLevel([
        { entries: [{ enemyId: 'sneak', count: 1, spacing: 0.1 }, { enemyId: 'walker', count: 1, spacing: 0.1 }] },
      ]),
      content,
      1,
    );
    sim.applyCommand(placeCmd('testTower', TOWER_HEX));
    sim.applyCommand({ type: 'startWave' });
    const events = runTicks(sim, TICK_RATE);
    const walker = sim.enemies.find((e) => e.typeId === 'walker')!;
    expect(events).toContainEqual({ type: 'towerFired', towerId: sim.towers[0].id, enemyId: walker.id });
    const sneak = sim.enemies.find((e) => e.typeId === 'sneak')!;
    expect(sneak.hp).toBe(sneak.maxHp);
  });
});
