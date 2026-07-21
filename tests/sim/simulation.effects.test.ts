import { describe, expect, it } from 'vitest';
import { DT, TICK_RATE } from '../../src/sim/constants';
import { Simulation, effectiveSpeed } from '../../src/sim/simulation';
import { enemyDef, makeContent, placeCmd, runTicks, straightLevel, TOWER_HEX, towerDef } from './helpers';

describe('burn (fire DoT)', () => {
  it('ticks dps damage for the duration after a single hit, then expires', () => {
    // One shot only (20 s cooldown): 1 direct + 30 dps * 1 s burn = ~31 total.
    const content = makeContent(
      [towerDef({ damage: 1, fireRate: 0.05, mechanic: { kind: 'burn', dps: 30, duration: 1 } })],
      [enemyDef({ hp: 100 })],
    );
    const sim = new Simulation(straightLevel(), content, 1);
    sim.applyCommand(placeCmd('testTower', TOWER_HEX));
    sim.applyCommand({ type: 'startWave' });
    runTicks(sim, 3 * TICK_RATE); // 3 s — burn (1 s) has long expired
    // ~69 hp left; the ±1 window tolerates one tick of float drift on the DoT timer.
    expect(sim.enemies[0].hp).toBeGreaterThanOrEqual(68);
    expect(sim.enemies[0].hp).toBeLessThanOrEqual(70);
  });

  it('refreshes on reapply instead of stacking', () => {
    // Hits every 0.5 s each reapply a 30 dps / 1 s burn. Over ~3 s the burn is
    // continuously active: ≈ 6 direct + ≈ 87 burn. Stacking would roughly double+ that.
    const content = makeContent(
      [towerDef({ damage: 1, fireRate: 2, mechanic: { kind: 'burn', dps: 30, duration: 1 } })],
      [enemyDef({ hp: 500 })],
    );
    const sim = new Simulation(straightLevel(), content, 1);
    sim.applyCommand(placeCmd('testTower', TOWER_HEX));
    sim.applyCommand({ type: 'startWave' });
    runTicks(sim, 3 * TICK_RATE + 3);
    const lost = 500 - sim.enemies[0].hp;
    expect(lost).toBeGreaterThan(80);   // burn clearly active the whole time
    expect(lost).toBeLessThan(115);     // but never stacked
  });

  it('awards bounty and emits enemyKilled when the DoT lands the kill', () => {
    const content = makeContent(
      [towerDef({ damage: 1, fireRate: 0.05, mechanic: { kind: 'burn', dps: 30, duration: 1 } })],
      [enemyDef({ hp: 5, bounty: 7 })],
    );
    const sim = new Simulation(straightLevel(), content, 1);
    sim.applyCommand(placeCmd('testTower', TOWER_HEX));
    const goldAfterPlacement = sim.gold;
    sim.applyCommand({ type: 'startWave' });
    const events = runTicks(sim, TICK_RATE);
    expect(events).toContainEqual({ type: 'enemyKilled', enemyId: sim.enemies[0].id, bounty: 7 });
    expect(sim.gold).toBe(goldAfterPlacement + 7);
  });
});

describe('slow (frost)', () => {
  it('multiplies movement speed while active and expires after its duration', () => {
    const content = makeContent(
      [towerDef({ damage: 1, fireRate: 0.05, mechanic: { kind: 'slow', factor: 0.5, duration: 0.5 } })],
      [enemyDef({ hp: 1000, speed: 60 })],
    );
    const sim = new Simulation(straightLevel(), content, 1);
    sim.applyCommand(placeCmd('testTower', TOWER_HEX));
    sim.applyCommand({ type: 'startWave' });
    // Run until the (single) shot lands.
    let fired = false;
    while (!fired) fired = sim.tick().some((e) => e.type === 'towerFired');
    const enemy = sim.enemies[0];
    expect(enemy.effects.slow).toEqual({ factor: 0.5, remaining: 0.5 });
    expect(effectiveSpeed(enemy)).toBe(30);

    const before = enemy.pathDist;
    sim.tick();
    expect(enemy.pathDist - before).toBeCloseTo(60 * 0.5 * DT, 5);

    runTicks(sim, TICK_RATE); // 1 s later the 0.5 s slow has expired
    expect(enemy.effects.slow).toBeUndefined();
    const b2 = enemy.pathDist;
    sim.tick();
    expect(enemy.pathDist - b2).toBeCloseTo(60 * DT, 5);
  });
});
