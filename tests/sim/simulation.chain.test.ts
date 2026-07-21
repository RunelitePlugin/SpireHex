import { describe, expect, it } from 'vitest';
import { TICK_RATE } from '../../src/sim/constants';
import { Simulation } from '../../src/sim/simulation';
import { enemyDef, makeContent, placeCmd, runTicks, straightLevel, TOWER_HEX, towerDef } from './helpers';

// Range 100 forces the pack to march into range together before the first (and only,
// 20 s cooldown) shot: 4 enemies spawn 0.05 s apart, i.e. 0.5 world units apart.
function chainSim(): Simulation {
  const content = makeContent(
    [towerDef({ damage: 40, range: 100, fireRate: 0.05, mechanic: { kind: 'chain', targets: 2, radius: 300, falloff: 0.5 } })],
    [enemyDef({ hp: 1000 })],
  );
  const sim = new Simulation(
    straightLevel([{ entries: [{ enemyId: 'dummy', count: 4, spacing: 0.05 }] }]),
    content,
    1,
  );
  sim.applyCommand(placeCmd('testTower', TOWER_HEX));
  sim.applyCommand({ type: 'startWave' });
  return sim;
}

describe('chain (storm)', () => {
  it('hits the primary at full damage and up to N nearest others at falloff', () => {
    const sim = chainSim();
    // ~10 s is plenty for the pack (speed 10) to walk into the 100-unit range.
    const events = runTicks(sim, 10 * TICK_RATE);
    const fired = events.filter((e) => e.type === 'towerFired');
    expect(fired).toHaveLength(3); // primary + 2 links
    const [e1, e2, e3, e4] = sim.enemies;
    expect(e1.hp).toBeCloseTo(1000 - 40, 5);        // primary (furthest along)
    expect(e2.hp).toBeCloseTo(1000 - 40 * 0.5, 5);  // nearest link: falloff^1
    expect(e3.hp).toBeCloseTo(1000 - 40 * 0.25, 5); // next: falloff^2
    expect(e4.hp).toBe(1000);                        // beyond the 2-target cap
  });

  it('chains through the damage pipeline (element multiplier + armor apply per link)', () => {
    const content = makeContent(
      [towerDef({ damage: 40, range: 100, fireRate: 0.05, mechanic: { kind: 'chain', targets: 1, radius: 300, falloff: 0.5 } })],
      // fire tower vs frost enemies with armor 4 → primary 40*1.5-4 = 56, link 20*1.5-4 = 26
      [enemyDef({ hp: 1000, element: 'frost', armor: 4 })],
    );
    const sim = new Simulation(
      straightLevel([{ entries: [{ enemyId: 'dummy', count: 2, spacing: 0.05 }] }]),
      content,
      1,
    );
    sim.applyCommand(placeCmd('testTower', TOWER_HEX));
    sim.applyCommand({ type: 'startWave' });
    runTicks(sim, 10 * TICK_RATE);
    expect(sim.enemies[0].hp).toBeCloseTo(1000 - 56, 5);
    expect(sim.enemies[1].hp).toBeCloseTo(1000 - 26, 5);
  });

  it('breaks a chain-link distance tie by the lower enemy id', () => {
    const content = makeContent(
      [towerDef({ damage: 40, range: 400, fireRate: 0.05, mechanic: { kind: 'chain', targets: 1, radius: 300, falloff: 0.5 } })],
      [enemyDef({ hp: 1000 })],
    );
    const sim = new Simulation(
      straightLevel([{ entries: [{ enemyId: 'dummy', count: 3, spacing: 0.05 }] }]),
      content,
      1,
    );
    sim.applyCommand({ type: 'startWave' });
    while (sim.enemies.length < 3) sim.tick();
    // Force an exact tie: pull enemy[2] up to enemy[1]'s pathDist, so both sit at the
    // same distance from the primary (enemy[0], which stays furthest along).
    sim.enemies[2].pathDist = sim.enemies[1].pathDist;
    sim.applyCommand(placeCmd('testTower', TOWER_HEX));
    const events = runTicks(sim, 5 * TICK_RATE);
    const fired = events.filter((e) => e.type === 'towerFired');
    expect(fired).toHaveLength(2); // primary + 1 link (targets: 1)
    expect(sim.enemies[1].hp).toBeCloseTo(1000 - 40 * 0.5, 5); // lower id wins the tie
    expect(sim.enemies[2].hp).toBe(1000); // higher id, untouched
  });

  it('awards bounty when a chain-link kill is lethal', () => {
    const content = makeContent(
      [towerDef({ damage: 40, range: 400, fireRate: 0.05, mechanic: { kind: 'chain', targets: 1, radius: 300, falloff: 0.5 } })],
      [enemyDef({ id: 'leader', hp: 1000, bounty: 5 }), enemyDef({ id: 'follower', hp: 15, bounty: 9 })],
    );
    const sim = new Simulation(
      straightLevel([{ entries: [
        { enemyId: 'leader', count: 1, spacing: 0.05 },
        { enemyId: 'follower', count: 1, spacing: 0.05 },
      ] }]),
      content,
      1,
    );
    sim.applyCommand({ type: 'startWave' });
    // Wait for both to spawn before placing the tower, so the very first shot's chain
    // has a link candidate available (the tower fires on the earliest eligible tick).
    while (sim.enemies.length < 2) sim.tick();
    sim.applyCommand(placeCmd('testTower', TOWER_HEX));
    const goldBefore = sim.gold;
    const events = runTicks(sim, 10 * TICK_RATE);
    // leader spawns first (furthest along) and becomes the primary at full 40 dmg — survives.
    // follower is the only chain candidate: link dmg 40*0.5=20, lethal at hp 15.
    const kills = events.filter((e) => e.type === 'enemyKilled');
    expect(kills).toHaveLength(1);
    expect(kills[0]).toMatchObject({ bounty: 9 });
    expect(sim.gold).toBe(goldBefore + 9);
  });
});
