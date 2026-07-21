import { describe, expect, it } from 'vitest';
import { Simulation } from '../../src/sim/simulation';
import { enemyDef, makeContent, placeCmd, straightLevel, TOWER_HEX, towerDef } from './helpers';

/**
 * Splash mortar: element 'neutral' (1.0× against everything), long cooldown so it fires
 * exactly once inside the test window. radius 60, falloff 0.5 — matches the plan's example.
 */
function mortarSim(waveEntries: Array<{ enemyId: string; count: number; spacing: number }>) {
  const content = makeContent(
    [towerDef({
      id: 'mortar', element: 'neutral', damage: 30, range: 400, fireRate: 0.05,
      mechanic: { kind: 'splash', radius: 60, falloff: 0.5 },
    })],
    [
      enemyDef({ id: 'dummy', hp: 200, speed: 0, armor: 0 }),
      enemyDef({ id: 'sneaky', hp: 200, speed: 0, armor: 0, stealth: true }),
    ],
  );
  const sim = new Simulation(straightLevel([{ entries: waveEntries }]), content, 1);
  sim.applyCommand({ type: 'startWave' });
  return sim;
}

describe('splash (boulder mortar)', () => {
  it('damages every other living enemy within radius of the impact at damage × falloff, leaving enemies outside untouched', () => {
    const sim = mortarSim([
      { enemyId: 'dummy', count: 1, spacing: 0.05 },
      { enemyId: 'dummy', count: 1, spacing: 0.05 },
      { enemyId: 'dummy', count: 1, spacing: 0.05 },
    ]);
    while (sim.enemies.length < 3) sim.tick();
    const [primary, inRadius, outOfRadius] = sim.enemies;
    primary.pathDist = 300;      // furthest along → 'first' target → impact point
    inRadius.pathDist = 260;     // 40 units behind: inside the 60-unit radius
    outOfRadius.pathDist = 100;  // 200 units behind: outside the 60-unit radius
    sim.applyCommand(placeCmd('mortar', TOWER_HEX));
    const events = sim.tick();
    expect(events.filter((e) => e.type === 'towerFired')).toHaveLength(2); // primary + splash link
    expect(primary.hp).toBe(200 - 30);              // full damage, neutral 1.0×, armor 0
    expect(inRadius.hp).toBe(200 - 15);              // 30 × 0.5 falloff
    expect(outOfRadius.hp).toBe(200);                // untouched
  });

  it('still splashes from the captured impact point when the primary hit is a killing blow', () => {
    const sim = mortarSim([
      { enemyId: 'dummy', count: 1, spacing: 0.05 },
      { enemyId: 'dummy', count: 1, spacing: 0.05 },
    ]);
    while (sim.enemies.length < 2) sim.tick();
    const [primary, inRadius] = sim.enemies;
    primary.hp = 10; // dies to the 30-damage primary hit
    primary.maxHp = 200;
    primary.pathDist = 300;
    inRadius.pathDist = 260; // 40 units behind the impact
    sim.applyCommand(placeCmd('mortar', TOWER_HEX));
    const events = sim.tick();
    expect(primary.alive).toBe(false);
    expect(events.some((e) => e.type === 'enemyKilled' && e.enemyId === primary.id)).toBe(true);
    expect(inRadius.hp).toBe(200 - 15); // splash still radiates from the captured impact
  });

  it('damages a stealthed enemy inside the blast even though it cannot be targeted directly', () => {
    const sim = mortarSim([
      { enemyId: 'dummy', count: 1, spacing: 0.05 },
      { enemyId: 'sneaky', count: 1, spacing: 0.05 },
    ]);
    while (sim.enemies.length < 2) sim.tick();
    const [primary, sneaky] = sim.enemies;
    primary.pathDist = 300; // non-stealth, so it's the only targetable enemy under 'first'
    sneaky.pathDist = 260;  // 40 units behind the impact, inside radius, but stealthed
    sim.applyCommand(placeCmd('mortar', TOWER_HEX));
    const events = sim.tick();
    // pickTarget never chose the stealthed enemy directly (splash is the only reason it got hit).
    const fired = events.filter((e) => e.type === 'towerFired');
    expect(fired).toHaveLength(2); // primary hit + splash link on the stealthed enemy
    expect(sneaky.hp).toBe(200 - 15);
  });

  it('applies no status effect from a splash hit (the splash case in the status switch is a no-op)', () => {
    const sim = mortarSim([
      { enemyId: 'dummy', count: 1, spacing: 0.05 },
      { enemyId: 'dummy', count: 1, spacing: 0.05 },
    ]);
    while (sim.enemies.length < 2) sim.tick();
    const [primary, inRadius] = sim.enemies;
    primary.pathDist = 300;
    inRadius.pathDist = 260;
    sim.applyCommand(placeCmd('mortar', TOWER_HEX));
    sim.tick();
    expect(inRadius.hp).toBeLessThan(200); // sanity: it was actually hit
    expect(inRadius.effects).toEqual({});
    expect(primary.effects).toEqual({});
  });
});
