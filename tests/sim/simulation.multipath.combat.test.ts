import { describe, expect, it } from 'vitest';
import { Simulation } from '../../src/sim/simulation';
import type { SimEvent } from '../../src/sim/types';
import { enemyDef, makeContent, placeCmd, runTicks, towerDef, twoPathLevel } from './helpers';

// Tower hex between the two roads: {q: 2, r: 1} → world ≈ (207.8, 72): 72 units from either road.
const MID_HEX = { q: 2, r: 1 };
// Tower hex above road 0 only: {q: 2, r: -1} → world ≈ (124.7, -72): 72 from road 0, 216 from road 1.
const NORTH_HEX = { q: 2, r: -1 };

const ONE_EACH_B_FIRST = [
  { entries: [
    { enemyId: 'dummy', count: 1, spacing: 0.1, pathIndex: 1 }, // spawns first → furthest along
    { enemyId: 'dummy', count: 1, spacing: 0.1 },               // path 0, spawns at 0.2 s
  ] },
];

describe('multi-path combat', () => {
  it("targets by 'first' across roads: the enemy furthest along ITS OWN path wins", () => {
    const content = makeContent([towerDef({ damage: 5, range: 250 })], [enemyDef({ speed: 60 })]);
    const sim = new Simulation(twoPathLevel(ONE_EACH_B_FIRST), content, 1);
    sim.applyCommand({ type: 'startWave' });
    runTicks(sim, 8); // both spawned (ticks 3 and 6), no tower yet
    const onB = sim.enemies.find((e) => e.pathIndex === 1)!;
    expect(sim.applyCommand(placeCmd('testTower', MID_HEX)).ok).toBe(true);
    const events = runTicks(sim, 2);
    const fired = events.find((e) => e.type === 'towerFired');
    expect(fired).toBeDefined();
    expect(fired).toMatchObject({ enemyId: onB.id }); // road-1 enemy is ahead → it is the 'first' target
  });

  it('never fires at a road outside its range, while covering the road inside it', () => {
    const content = makeContent([towerDef({ damage: 10, range: 160 })], [enemyDef()]);
    const sim = new Simulation(twoPathLevel(ONE_EACH_B_FIRST), content, 1);
    sim.applyCommand(placeCmd('testTower', NORTH_HEX));
    sim.applyCommand({ type: 'startWave' });
    const events = runTicks(sim, 5 * 30); // 5 s: road-0 enemy takes several hits; road 1 stays 216 units away
    const targets = new Set(events.filter((e): e is Extract<SimEvent, { type: 'towerFired' }> => e.type === 'towerFired').map((e) => e.enemyId));
    const onA = sim.enemies.find((e) => e.pathIndex === 0)!;
    const onB = sim.enemies.find((e) => e.pathIndex === 1)!;
    expect(targets.has(onA.id)).toBe(true);
    expect(targets.has(onB.id)).toBe(false);
    expect(onB.hp).toBe(onB.maxHp); // untouched
  });

  it('chains across roads when the world-space radius reaches the other road', () => {
    // Roads are 144 units apart; chain radius 200 spans them. Primary dies to the second
    // shot and the arc still jumps from its position to the road-1 enemy.
    const chainTower = towerDef({ damage: 50, range: 250, mechanic: { kind: 'chain', targets: 2, radius: 200, falloff: 0.5 } });
    const content = makeContent([chainTower], [enemyDef({ speed: 60 })]);
    const level = twoPathLevel([
      { entries: [
        { enemyId: 'dummy', count: 1, spacing: 0.1 },               // path 0: primary (spawns first, stays ahead)
        { enemyId: 'dummy', count: 1, spacing: 0.1, pathIndex: 1 },
      ] },
    ]);
    const sim = new Simulation(level, content, 1);
    sim.applyCommand(placeCmd('testTower', MID_HEX));
    sim.applyCommand({ type: 'startWave' });
    runTicks(sim, 40); // shot 1 at ≈ tick 3 (A alone, 100→50); shot 2 at ≈ tick 33 kills A and chains to B
    const onA = sim.enemies.find((e) => e.pathIndex === 0)!;
    const onB = sim.enemies.find((e) => e.pathIndex === 1)!;
    expect(onA.alive).toBe(false);
    expect(onB.hp).toBeCloseTo(75, 3); // 50 × 0.5 falloff, fire→nature ×1.0, armor 0
  });

  it('poison death-spread jumps to the nearest enemy on ANY road within its radius', () => {
    const poisonTower = towerDef({ damage: 60, mechanic: { kind: 'poison', dps: 5, duration: 4, spreadRadius: 200 } });
    const content = makeContent([poisonTower], [enemyDef({ speed: 60 })]);
    const level = twoPathLevel([
      { entries: [
        { enemyId: 'dummy', count: 1, spacing: 0.1 },               // path 0: poisoned, dies to shot 2
        { enemyId: 'dummy', count: 1, spacing: 0.1, pathIndex: 1 },
      ] },
    ]);
    const sim = new Simulation(level, content, 1);
    sim.applyCommand(placeCmd('testTower', MID_HEX));
    sim.applyCommand({ type: 'startWave' });
    runTicks(sim, 40); // shot 1: A 100→40 + poison; shot 2 (≈1 s later): A dies → spread crosses to B (dist ≈ 144)
    const onB = sim.enemies.find((e) => e.pathIndex === 1)!;
    expect(onB.alive).toBe(true);
    expect(onB.effects.poison?.spread).toBe(true); // arrived via death-spread, not a direct hit
  });

  it('is deterministic on multi-path levels: identical runs, identical logs', () => {
    const chainTower = towerDef({ damage: 25, range: 250, mechanic: { kind: 'chain', targets: 3, radius: 200, falloff: 0.6 } });
    const content = makeContent([chainTower], [enemyDef({ speed: 60 })]);
    const run = () => {
      const sim = new Simulation(twoPathLevel([
        { entries: [
          { enemyId: 'dummy', count: 3, spacing: 0.4 },
          { enemyId: 'dummy', count: 3, spacing: 0.4, pathIndex: 1 },
        ] },
      ]), content, 5);
      sim.applyCommand(placeCmd('testTower', MID_HEX));
      sim.applyCommand({ type: 'startWave' });
      return runTicks(sim, 20 * 30);
    };
    expect(run()).toEqual(run());
  });
});
