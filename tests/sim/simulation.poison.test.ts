import { describe, expect, it } from 'vitest';
import { DT, TICK_RATE } from '../../src/sim/constants';
import { Simulation } from '../../src/sim/simulation';
import { enemyDef, makeContent, placeCmd, runTicks, straightLevel, TOWER_HEX, towerDef } from './helpers';

// Three enemies 0.05 s apart (0.5 world units at speed 10) — all inside any spread radius.
// The tower fires exactly once (20 s cooldown) at the leader.
function poisonSim(spreadRadius: number): Simulation {
  const content = makeContent(
    [towerDef({ damage: 5, fireRate: 0.05, mechanic: { kind: 'poison', dps: 50, duration: 2, spreadRadius } })],
    [enemyDef({ hp: 8, bounty: 3 })],
  );
  const sim = new Simulation(
    straightLevel([{ entries: [{ enemyId: 'dummy', count: 3, spacing: 0.05 }] }]),
    content,
    1,
  );
  sim.applyCommand(placeCmd('testTower', TOWER_HEX));
  sim.applyCommand({ type: 'startWave' });
  return sim;
}

describe('poison spread', () => {
  it('kills the poisoned leader, spreads once to the nearest enemy, and stops there', () => {
    const sim = poisonSim(200);
    const events = runTicks(sim, 3 * TICK_RATE);
    // Exactly one direct shot was ever fired…
    expect(events.filter((e) => e.type === 'towerFired')).toHaveLength(1);
    // …yet two enemies died: the leader (hit + DoT) and the spread victim (DoT only).
    const kills = events.flatMap((e) => (e.type === 'enemyKilled' ? [e] : []));
    expect(kills).toHaveLength(2);
    expect(kills.map((k) => k.enemyId)).toEqual([sim.enemies[0].id, sim.enemies[1].id]);
    // The spread copy is marked spread:true, so the third enemy is untouched.
    const third = sim.enemies[2];
    expect(third.alive).toBe(true);
    expect(third.hp).toBe(third.maxHp);
    expect(third.effects.poison).toBeUndefined();
  });

  it('awards bounty for both DoT kills', () => {
    const sim = poisonSim(200);
    const goldBefore = sim.gold;
    runTicks(sim, 3 * TICK_RATE);
    expect(sim.gold).toBe(goldBefore + 2 * 3);
  });

  it('does not spread when no living enemy is inside the radius', () => {
    const sim = poisonSim(0.1); // radius smaller than the 0.5-unit gap
    const events = runTicks(sim, 3 * TICK_RATE);
    expect(events.filter((e) => e.type === 'enemyKilled')).toHaveLength(1);
    expect(sim.enemies[1].alive).toBe(true);
    expect(sim.enemies[1].effects.poison).toBeUndefined();
  });

  it('spread does not overwrite an existing poison', () => {
    const sim = poisonSim(200);
    // Advance until the leader and its future spread target (enemy[1]) have both
    // spawned, but before the leader's DoT has killed it — then seed the target
    // with its own stronger, un-spread poison before the spread attempt happens.
    while (sim.enemies.length < 2) sim.tick();
    sim.enemies[1].effects.poison = {
      dps: 50,
      remaining: 1,
      duration: 1,
      spreadRadius: 200,
      spread: false,
    };
    runTicks(sim, 3 * TICK_RATE);
    // The pre-existing poison must survive untouched: spread never clobbers it.
    expect(sim.enemies[1].effects.poison?.dps).toBe(50);
    expect(sim.enemies[1].effects.poison?.spread).toBe(false);
  });

  it('still spreads when the fatal tick coincides exactly with the poison expiring', () => {
    const content = makeContent([], [enemyDef({ hp: 1000, bounty: 9 })]);
    const sim = new Simulation(
      straightLevel([{ entries: [{ enemyId: 'dummy', count: 2, spacing: 0.05 }] }]),
      content,
      1,
    );
    sim.applyCommand({ type: 'startWave' });
    while (sim.enemies.length < 2) sim.tick();
    const [victim, neighbor] = sim.enemies;
    // hp is exactly the last tick's poison damage, and remaining is exactly one tick
    // (DT) — the kill and the expiry land on the same tick. duration stays a normal
    // 2s so the fresh spread copy (which inherits duration, not remaining) doesn't
    // also immediately expire when this same tickEffects pass reaches the neighbor.
    victim.hp = 50 * DT;
    victim.effects.poison = { dps: 50, duration: 2, remaining: DT, spreadRadius: 200, spread: false };
    const goldBefore = sim.gold;
    const events = sim.tick();
    expect(victim.alive).toBe(false);
    const kills = events.filter((e) => e.type === 'enemyKilled');
    expect(kills.map((k) => k.enemyId)).toEqual([victim.id]);
    expect(sim.gold).toBe(goldBefore + 9);
    // The death-spread still landed on the neighbor even though the poison expired
    // on the same tick it killed the victim.
    expect(neighbor.effects.poison).toMatchObject({ dps: 50, spread: true });
  });
});
