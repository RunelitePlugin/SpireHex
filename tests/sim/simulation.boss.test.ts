import { describe, expect, it } from 'vitest';
import { Simulation } from '../../src/sim/simulation';
import { enemyDef, makeContent, placeCmd, runTicks, straightLevel, TOWER_HEX, towerDef, twoPathLevel } from './helpers';

/**
 * P11 boss ability sim core: data-driven threshold/timer triggers on `EnemyDef.boss`,
 * dispatched through `Simulation.tickBossAbilities`/`applyBossEffect`. Every scenario
 * below drives a real `Simulation` through `tick()` — no mocking of sim internals — and
 * reads `bossState`/`effects`/`towers` fields directly where white-box inspection is the
 * clearest way to pin exact tick timing (matches the pattern used by the existing
 * effects/curse/splash suites).
 */

describe('boss abilities: hpThreshold triggers', () => {
  it('fires exactly once when hp first crosses the threshold, not again on further damage', () => {
    const content = makeContent([], [
      enemyDef({ id: 'add', hp: 10, speed: 5, bounty: 1, armor: 0 }),
      enemyDef({
        id: 'boss', hp: 1000, speed: 0,
        boss: { abilities: [{ trigger: { kind: 'hpThreshold', pct: 0.5 }, effect: { kind: 'spawnAdds', spawnId: 'add', count: 2 } }] },
      }),
    ]);
    const sim = new Simulation(straightLevel([{ entries: [{ enemyId: 'boss', count: 1, spacing: 0.05 }] }]), content, 1);
    sim.applyCommand({ type: 'startWave' });
    while (sim.enemies.length < 1) sim.tick();
    const boss = sim.enemies[0];

    boss.hp = 400; // below 0.5 * 1000
    let events = sim.tick();
    expect(events.filter((e) => e.type === 'bossAbility')).toHaveLength(1);
    expect(sim.enemies.length).toBe(3); // boss + 2 adds
    expect(boss.bossState!.fired).toEqual([true]);

    boss.hp = 100; // still below threshold — must NOT re-fire
    events = sim.tick();
    expect(events.some((e) => e.type === 'bossAbility')).toBe(false);
    expect(sim.enemies.length).toBe(3);
  });

  it('two independent hpThreshold abilities each fire exactly once, at their own crossing', () => {
    const content = makeContent([], [
      enemyDef({ id: 'add', hp: 10, speed: 5, bounty: 1, armor: 0 }),
      enemyDef({
        id: 'boss', hp: 1000, speed: 0,
        boss: {
          abilities: [
            { trigger: { kind: 'hpThreshold', pct: 0.66 }, effect: { kind: 'spawnAdds', spawnId: 'add', count: 1 } },
            { trigger: { kind: 'hpThreshold', pct: 0.33 }, effect: { kind: 'spawnAdds', spawnId: 'add', count: 1 } },
          ],
        },
      }),
    ]);
    const sim = new Simulation(straightLevel([{ entries: [{ enemyId: 'boss', count: 1, spacing: 0.05 }] }]), content, 1);
    sim.applyCommand({ type: 'startWave' });
    while (sim.enemies.length < 1) sim.tick();
    const boss = sim.enemies[0];

    boss.hp = 650; // below 0.66 * 1000 = 660, above 0.33 * 1000 = 330
    let events = sim.tick();
    expect(events.filter((e) => e.type === 'bossAbility')).toHaveLength(1);
    expect(boss.bossState!.fired).toEqual([true, false]);

    boss.hp = 300; // now below 0.33 * 1000 too
    events = sim.tick();
    expect(events.filter((e) => e.type === 'bossAbility')).toHaveLength(1); // only ability #2 fires this time
    expect(boss.bossState!.fired).toEqual([true, true]);
    expect(sim.enemies.length).toBe(3); // boss + 2 spawnAdds total
  });
});

describe('boss abilities: split/spawnAdds spawn mechanics', () => {
  it('split spawn offsets decrease by 14 behind the boss, clamped at 0', () => {
    const content = makeContent([], [
      enemyDef({ id: 'add', hp: 10, speed: 0, bounty: 1, armor: 0 }),
      enemyDef({
        id: 'boss', hp: 1000, speed: 0,
        boss: { abilities: [{ trigger: { kind: 'hpThreshold', pct: 0.5 }, effect: { kind: 'split', spawnId: 'add', count: 3 } }] },
      }),
    ]);
    const sim = new Simulation(straightLevel([{ entries: [{ enemyId: 'boss', count: 1, spacing: 0.05 }] }]), content, 1);
    sim.applyCommand({ type: 'startWave' });
    while (sim.enemies.length < 1) sim.tick();
    const boss = sim.enemies[0];
    boss.pathDist = 5; // near the road start: all three offsets clamp to 0
    boss.hp = 400;
    sim.tick();
    const spawns = sim.enemies.filter((e) => e.typeId === 'add');
    expect(spawns).toHaveLength(3);
    expect(spawns.map((s) => s.pathDist)).toEqual([0, 0, 0]);
  });

  it('split spawns inherit the boss pathIndex and are real enemies (killable, bounty-paying)', () => {
    const content = makeContent([], [
      enemyDef({ id: 'add', hp: 10, speed: 0, bounty: 7, armor: 0 }),
      enemyDef({
        id: 'boss', hp: 1000, speed: 0,
        boss: { abilities: [{ trigger: { kind: 'hpThreshold', pct: 0.5 }, effect: { kind: 'split', spawnId: 'add', count: 3 } }] },
      }),
    ]);
    const sim = new Simulation(
      twoPathLevel([{ entries: [{ enemyId: 'boss', count: 1, spacing: 0.05, pathIndex: 1 }] }]),
      content,
      1,
    );
    sim.applyCommand({ type: 'startWave' });
    while (sim.enemies.length < 1) sim.tick();
    const boss = sim.enemies[0];
    boss.pathDist = 50; // far enough along that offsets never clamp: 50-14, 50-28, 50-42
    boss.hp = 400;
    sim.tick();
    const spawns = sim.enemies.filter((e) => e.typeId === 'add');
    expect(spawns).toHaveLength(3);
    expect(spawns.map((s) => s.pathDist)).toEqual([36, 22, 8]);
    expect(spawns.every((s) => s.pathIndex === 1)).toBe(true);

    const goldBefore = sim.gold;
    spawns[0].hp = 0;
    const events = sim.tick();
    expect(events.some((e) => e.type === 'enemyKilled' && e.enemyId === spawns[0].id && e.bounty === 7)).toBe(true);
    expect(sim.gold).toBe(goldBefore + 7);
  });
});

describe('boss abilities: timer trigger', () => {
  it('fires first after exactly periodTicks ticks (measured from spawn), then every period after that', () => {
    const content = makeContent([], [
      enemyDef({
        id: 'boss', hp: 1_000_000, speed: 0,
        boss: { abilities: [{ trigger: { kind: 'timer', periodTicks: 5 }, effect: { kind: 'regen', amount: 1 } }] },
      }),
    ]);
    const sim = new Simulation(straightLevel([{ entries: [{ enemyId: 'boss', count: 1, spacing: 0.05 }] }]), content, 1);
    sim.applyCommand({ type: 'startWave' });
    let tick = 0;
    let spawnTick = -1;
    const fireTicks: number[] = [];
    while (fireTicks.length < 3) {
      tick += 1;
      const events = sim.tick();
      if (spawnTick === -1 && events.some((e) => e.type === 'enemySpawned')) spawnTick = tick;
      if (events.some((e) => e.type === 'bossAbility')) fireTicks.push(tick);
    }
    // The spawn tick itself already runs tickBossAbilities once (the snapshot includes
    // enemies spawned earlier in the SAME tick), so the first interval is periodTicks - 1;
    // every later reset happens mid-tick, AFTER that tick's decrement, so subsequent
    // intervals are the full periodTicks.
    expect(fireTicks[0] - spawnTick).toBe(4);
    expect(fireTicks[1] - fireTicks[0]).toBe(5);
    expect(fireTicks[2] - fireTicks[1]).toBe(5);
  });
});

describe('boss effects: regen / blink', () => {
  it('regen heals but never exceeds maxHp', () => {
    const content = makeContent([], [
      enemyDef({
        id: 'boss', hp: 1000, speed: 0,
        boss: { abilities: [{ trigger: { kind: 'timer', periodTicks: 3 }, effect: { kind: 'regen', amount: 500 } }] },
      }),
    ]);
    const sim = new Simulation(straightLevel([{ entries: [{ enemyId: 'boss', count: 1, spacing: 0.05 }] }]), content, 1);
    sim.applyCommand({ type: 'startWave' });
    while (sim.enemies.length < 1) sim.tick();
    const boss = sim.enemies[0];
    boss.hp = 800;
    let fired = false;
    for (let i = 0; i < 10 && !fired; i++) {
      fired = sim.tick().some((e) => e.type === 'bossAbility' && e.effect === 'regen');
    }
    expect(fired).toBe(true);
    expect(boss.hp).toBe(1000); // 800 + 500, clamped to maxHp
  });

  it('blink advances pathDist by exactly `distance`', () => {
    const content = makeContent([], [
      enemyDef({
        id: 'boss', hp: 1000, speed: 0,
        boss: { abilities: [{ trigger: { kind: 'hpThreshold', pct: 1 }, effect: { kind: 'blink', distance: 25 } }] },
      }),
    ]);
    const sim = new Simulation(straightLevel([{ entries: [{ enemyId: 'boss', count: 1, spacing: 0.05 }] }]), content, 1);
    sim.applyCommand({ type: 'startWave' });
    while (sim.enemies.length < 1) sim.tick(); // pct:1 fires the same tick the boss spawns
    expect(sim.enemies[0].pathDist).toBe(25); // 0 + 25; speed 0, so no extra movement
  });

  it('a blink that carries the boss past the exit leaks it via the normal movement/leak check that same tick', () => {
    const content = makeContent([], [
      enemyDef({
        id: 'boss', hp: 1000, speed: 0, livesCost: 3,
        boss: { abilities: [{ trigger: { kind: 'hpThreshold', pct: 0.5 }, effect: { kind: 'blink', distance: 50 } }] },
      }),
    ]);
    const sim = new Simulation(straightLevel([{ entries: [{ enemyId: 'boss', count: 1, spacing: 0.05 }] }]), content, 1);
    sim.applyCommand({ type: 'startWave' });
    while (sim.enemies.length < 1) sim.tick();
    const boss = sim.enemies[0];
    boss.pathDist = sim.path.length - 20; // 20 units short of the exit
    boss.hp = 400; // below the 0.5 threshold — arms the blink on the next tick
    const livesBefore = sim.lives;
    const events = sim.tick(); // blink (+50) fires, then the SAME tick's movement/leak check runs
    expect(events.some((e) => e.type === 'bossAbility' && e.effect === 'blink')).toBe(true);
    expect(events.some((e) => e.type === 'enemyLeaked' && e.enemyId === boss.id)).toBe(true);
    expect(boss.alive).toBe(false);
    expect(sim.lives).toBe(livesBefore - 3);
  });
});

describe('boss effect: freezeTowers', () => {
  it('stops an in-radius tower from firing for durationTicks, then it resumes; an out-of-radius tower is unaffected', () => {
    const content = makeContent(
      [towerDef({ id: 'plain', damage: 5, fireRate: 30, range: 2000, mechanic: { kind: 'none' }, element: 'neutral' })],
      [enemyDef({
        id: 'boss', hp: 1_000_000, speed: 0,
        boss: { abilities: [{ trigger: { kind: 'hpThreshold', pct: 1 }, effect: { kind: 'freezeTowers', radius: 150, durationTicks: 5 } }] },
      })],
    );
    const sim = new Simulation(straightLevel([{ entries: [{ enemyId: 'boss', count: 1, spacing: 0.05 }] }]), content, 1);
    sim.applyCommand(placeCmd('plain', TOWER_HEX));        // ~144 units from the boss (path start): inside radius 150
    sim.applyCommand(placeCmd('plain', { q: 10, r: -1 })); // ~793 units away: outside radius 150
    const insideId = sim.towers[0].id;
    const outsideId = sim.towers[1].id;
    sim.applyCommand({ type: 'startWave' });

    const fired = { inside: 0, outside: 0 };
    for (let i = 0; i < 5; i++) {
      for (const e of sim.tick()) {
        if (e.type !== 'towerFired') continue;
        if (e.towerId === insideId) fired.inside += 1;
        if (e.towerId === outsideId) fired.outside += 1;
      }
    }
    expect(fired.inside).toBe(0);              // frozen for the whole window
    expect(fired.outside).toBeGreaterThan(0);  // unaffected, keeps firing

    const resumed = runTicks(sim, 5);
    expect(resumed.some((e) => e.type === 'towerFired' && e.towerId === insideId)).toBe(true);
  });
});

describe('boss effect: shield', () => {
  it('makes the boss immune to direct hits while active', () => {
    const content = makeContent(
      [towerDef({ id: 'plain', damage: 50, fireRate: 30, range: 1000, mechanic: { kind: 'none' }, element: 'neutral' })],
      [enemyDef({
        id: 'boss', hp: 1000, speed: 0,
        boss: { abilities: [{ trigger: { kind: 'hpThreshold', pct: 1 }, effect: { kind: 'shield', durationTicks: 50 } }] },
      })],
    );
    const sim = new Simulation(straightLevel([{ entries: [{ enemyId: 'boss', count: 1, spacing: 0.05 }] }]), content, 1);
    sim.applyCommand(placeCmd('plain', TOWER_HEX));
    sim.applyCommand({ type: 'startWave' });
    const events = runTicks(sim, 10);
    expect(events.some((e) => e.type === 'towerFired')).toBe(true);  // the tower does fire...
    expect(sim.enemies[0].hp).toBe(1000);                             // ...but the shield absorbs everything
  });

  it('blocks burn DoT ticks too, and expires after durationTicks so hp and the burn timer resume', () => {
    const content = makeContent([], [
      enemyDef({
        id: 'boss', hp: 1000, speed: 0,
        // periodTicks kept well clear of durationTicks: reapplying the shield always
        // overwrites (stack-refresh), so a tight period would re-arm it before the
        // expiry was ever externally observable between tick() calls.
        boss: { abilities: [{ trigger: { kind: 'timer', periodTicks: 15 }, effect: { kind: 'shield', durationTicks: 5 } }] },
      }),
    ]);
    const sim = new Simulation(straightLevel([{ entries: [{ enemyId: 'boss', count: 1, spacing: 0.05 }] }]), content, 1);
    sim.applyCommand({ type: 'startWave' });
    while (sim.enemies.length < 1) sim.tick();
    const boss = sim.enemies[0];
    boss.effects.burn = { dps: 60, remaining: 1000 }; // long-lived DoT — never naturally expires during this test

    let shieldTick = -1;
    for (let i = 0; i < 25 && shieldTick === -1; i++) {
      const events = sim.tick();
      if (events.some((e) => e.type === 'bossAbility' && e.effect === 'shield')) shieldTick = i;
    }
    expect(shieldTick).toBeGreaterThanOrEqual(0);
    expect(boss.effects.shield).toBeDefined();

    const hpAtShield = boss.hp;
    const burnRemainingAtShield = boss.effects.burn.remaining;
    sim.tick(); // one more tick while the shield is active: both hp and the burn timer are frozen
    expect(boss.hp).toBe(hpAtShield);
    expect(boss.effects.burn!.remaining).toBe(burnRemainingAtShield);

    let guard = 0;
    while (boss.effects.shield && guard < 20) { sim.tick(); guard += 1; }
    expect(boss.effects.shield).toBeUndefined();

    const hpAfterExpiry = boss.hp;
    sim.tick(); // burn resumes ticking now that the shield is gone
    expect(boss.hp).toBeLessThan(hpAfterExpiry);
  });
});

describe('boss effect: stealthPhase', () => {
  it('blocks a none-mechanic tower, but a pierce tower can still target it', () => {
    const content = makeContent(
      [
        towerDef({ id: 'plain', damage: 5, fireRate: 30, range: 1000, mechanic: { kind: 'none' }, element: 'neutral' }),
        towerDef({ id: 'radiant', damage: 5, fireRate: 30, range: 1000, mechanic: { kind: 'pierce' }, element: 'neutral' }),
      ],
      [enemyDef({
        id: 'boss', hp: 1_000_000, speed: 0,
        boss: { abilities: [{ trigger: { kind: 'hpThreshold', pct: 1 }, effect: { kind: 'stealthPhase', durationTicks: 50 } }] },
      })],
    );
    const noneSim = new Simulation(straightLevel([{ entries: [{ enemyId: 'boss', count: 1, spacing: 0.05 }] }]), content, 1);
    noneSim.applyCommand(placeCmd('plain', TOWER_HEX));
    noneSim.applyCommand({ type: 'startWave' });
    const noneEvents = runTicks(noneSim, 5);
    expect(noneSim.enemies[0].effects.stealthPhase).toBeDefined();
    expect(noneEvents.some((e) => e.type === 'towerFired')).toBe(false);

    const pierceSim = new Simulation(straightLevel([{ entries: [{ enemyId: 'boss', count: 1, spacing: 0.05 }] }]), content, 1);
    pierceSim.applyCommand(placeCmd('radiant', TOWER_HEX));
    pierceSim.applyCommand({ type: 'startWave' });
    const pierceEvents = runTicks(pierceSim, 5);
    expect(pierceSim.enemies[0].effects.stealthPhase).toBeDefined();
    expect(pierceEvents.some((e) => e.type === 'towerFired')).toBe(true);
  });

  it('expires after durationTicks, letting a blocked none-mechanic tower resume targeting', () => {
    const content = makeContent(
      [towerDef({ id: 'plain', damage: 5, fireRate: 30, range: 1000, mechanic: { kind: 'none' }, element: 'neutral' })],
      [enemyDef({
        id: 'boss', hp: 1_000_000, speed: 0,
        boss: { abilities: [{ trigger: { kind: 'hpThreshold', pct: 1 }, effect: { kind: 'stealthPhase', durationTicks: 5 } }] },
      })],
    );
    const sim = new Simulation(straightLevel([{ entries: [{ enemyId: 'boss', count: 1, spacing: 0.05 }] }]), content, 1);
    sim.applyCommand(placeCmd('plain', TOWER_HEX));
    sim.applyCommand({ type: 'startWave' });
    const blocked = runTicks(sim, 3);
    expect(blocked.some((e) => e.type === 'towerFired')).toBe(false);

    let guard = 0;
    while (sim.enemies[0].effects.stealthPhase && guard < 20) { sim.tick(); guard += 1; }
    expect(sim.enemies[0].effects.stealthPhase).toBeUndefined();

    const resumed = runTicks(sim, 3);
    expect(resumed.some((e) => e.type === 'towerFired')).toBe(true);
  });

  it('a ward tower reveal lets a none-mechanic tower target the boss during its stealthPhase', () => {
    const content = makeContent(
      [
        towerDef({ id: 'plain', damage: 5, fireRate: 30, range: 1000, mechanic: { kind: 'none' }, element: 'neutral' }),
        towerDef({ id: 'warden', damage: 0, range: 1000, fireRate: 1, mechanic: { kind: 'ward', revealRadius: 1000, goldPerWave: 0 }, element: 'neutral' }),
      ],
      [enemyDef({
        id: 'boss', hp: 1_000_000, speed: 0,
        boss: { abilities: [{ trigger: { kind: 'hpThreshold', pct: 1 }, effect: { kind: 'stealthPhase', durationTicks: 50 } }] },
      })],
    );
    const sim = new Simulation(straightLevel([{ entries: [{ enemyId: 'boss', count: 1, spacing: 0.05 }] }]), content, 1);
    sim.applyCommand(placeCmd('plain', TOWER_HEX));
    sim.applyCommand(placeCmd('warden', { q: 4, r: -1 }));
    sim.applyCommand({ type: 'startWave' });
    const events = runTicks(sim, 5);
    expect(sim.enemies[0].effects.stealthPhase).toBeDefined();
    expect(events.some((e) => e.type === 'towerFired')).toBe(true);
  });
});

describe('boss effect: curseTowers', () => {
  it('scales tower damage by damageFactor while cursed, then restores full damage', () => {
    const content = makeContent(
      [towerDef({ id: 'plain', damage: 10, fireRate: 30, range: 1000, mechanic: { kind: 'none' }, element: 'neutral' })],
      [enemyDef({
        id: 'boss', hp: 1_000_000, speed: 0,
        boss: { abilities: [{ trigger: { kind: 'hpThreshold', pct: 1 }, effect: { kind: 'curseTowers', radius: 150, damageFactor: 0.5, durationTicks: 5 } }] },
      })],
    );
    const sim = new Simulation(straightLevel([{ entries: [{ enemyId: 'boss', count: 1, spacing: 0.05 }] }]), content, 1);
    sim.applyCommand(placeCmd('plain', TOWER_HEX)); // ~144 units from the boss: inside radius 150
    sim.applyCommand({ type: 'startWave' });

    // The spawn tick and the pct:1 curse firing are the SAME tick() call — but that
    // call may not be the very first one (spawn timing depends on wave spacing vs. DT).
    let events1: ReturnType<typeof sim.tick> = [];
    while (sim.enemies.length < 1) events1 = sim.tick();
    expect(events1.some((e) => e.type === 'bossAbility' && e.effect === 'curseTowers')).toBe(true);
    const enemy = sim.enemies[0];
    expect(enemy.hp).toBe(1_000_000 - 5); // 10 * 0.5 damageFactor

    const tower = sim.towers[0];
    let guard = 0;
    while (tower.curseTicks > 0 && guard < 10) { sim.tick(); guard += 1; }
    expect(tower.curseTicks).toBe(0);

    const hpBefore = enemy.hp;
    sim.tick();
    expect(hpBefore - enemy.hp).toBe(10); // full damage restored, curseFactor back to 1
  });
});

describe('boss determinism and non-boss enemies', () => {
  it('two identical sims with a timer+threshold boss produce identical enemy state after 400 ticks', () => {
    function bossContent() {
      return makeContent(
        [towerDef({ id: 'plain', damage: 20, fireRate: 2, range: 1000, mechanic: { kind: 'none' }, element: 'neutral' })],
        [
          enemyDef({ id: 'add', hp: 20, speed: 15, bounty: 2, armor: 0 }),
          enemyDef({
            id: 'boss', hp: 300, speed: 15, bounty: 50, armor: 0,
            boss: {
              abilities: [
                { trigger: { kind: 'timer', periodTicks: 20 }, effect: { kind: 'regen', amount: 1 } },
                { trigger: { kind: 'hpThreshold', pct: 0.5 }, effect: { kind: 'split', spawnId: 'add', count: 2 } },
              ],
            },
          }),
        ],
      );
    }
    function runBossSim(): Simulation {
      const sim = new Simulation(straightLevel([{ entries: [{ enemyId: 'boss', count: 1, spacing: 0.05 }] }]), bossContent(), 1);
      sim.applyCommand(placeCmd('plain', TOWER_HEX));
      sim.applyCommand({ type: 'startWave' });
      for (let i = 0; i < 400; i++) sim.tick();
      return sim;
    }
    const a = runBossSim();
    const b = runBossSim();
    expect(JSON.stringify(a.enemies)).toBe(JSON.stringify(b.enemies));
  });

  it('non-boss enemies never allocate bossState', () => {
    const content = makeContent([], [enemyDef({ id: 'plain' })]);
    const sim = new Simulation(straightLevel([{ entries: [{ enemyId: 'plain', count: 1, spacing: 0.05 }] }]), content, 1);
    sim.applyCommand({ type: 'startWave' });
    while (sim.enemies.length < 1) sim.tick();
    expect(sim.enemies[0].bossState).toBeUndefined();
  });
});
