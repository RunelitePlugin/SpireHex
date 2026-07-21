import { describe, expect, it } from 'vitest';
import { DT, TICK_RATE } from '../../src/sim/constants';
import { Simulation } from '../../src/sim/simulation';
import { enemyDef, makeContent, placeCmd, runTicks, straightLevel, TOWER_HEX, towerDef } from './helpers';

describe('curse (shadow)', () => {
  it('adds percent-of-CURRENT-hp bonus damage and amplifies the follow-up hit', () => {
    const content = makeContent(
      [towerDef({ damage: 10, fireRate: 1, mechanic: { kind: 'curse', currentHpPct: 0.1, vulnMultiplier: 2, vulnDuration: 3 } })],
      [enemyDef({ hp: 1000 })],
    );
    const sim = new Simulation(straightLevel(), content, 1);
    sim.applyCommand(placeCmd('testTower', TOWER_HEX));
    sim.applyCommand({ type: 'startWave' });

    // Hit 1 (no vulnerability yet): 10 + 0.1 * 1000 = 110 → hp 890
    let fired = 0;
    while (fired < 1) fired += sim.tick().filter((e) => e.type === 'towerFired').length;
    const enemy = sim.enemies[0];
    expect(enemy.hp).toBeCloseTo(890, 5);
    expect(enemy.effects.vulnerability).toEqual({ multiplier: 2, remaining: 3 });

    // Hit 2 (1 s later, vulnerability active): (10 + 0.1 * 890) * 2 = 198 → hp 692
    while (fired < 2) fired += sim.tick().filter((e) => e.type === 'towerFired').length;
    expect(enemy.hp).toBeCloseTo(692, 5);
  });

  it('vulnerability expires after its duration', () => {
    const content = makeContent(
      [towerDef({ damage: 10, fireRate: 1, mechanic: { kind: 'curse', currentHpPct: 0.1, vulnMultiplier: 2, vulnDuration: 0.5 } })],
      [enemyDef({ hp: 1000 })],
    );
    const sim = new Simulation(straightLevel(), content, 1);
    sim.applyCommand(placeCmd('testTower', TOWER_HEX));
    sim.applyCommand({ type: 'startWave' });

    let fired = 0;
    while (fired < 1) fired += sim.tick().filter((e) => e.type === 'towerFired').length;
    const enemy = sim.enemies[0];
    expect(enemy.hp).toBeCloseTo(890, 5);

    // The 0.5 s debuff is gone before the second shot 1 s later:
    // hit 2 = 10 + 0.1 * 890 = 99 → hp 791
    while (fired < 2) fired += sim.tick().filter((e) => e.type === 'towerFired').length;
    expect(enemy.hp).toBeCloseTo(791, 5);
    expect(enemy.effects.vulnerability).toEqual({ multiplier: 2, remaining: 0.5 }); // reapplied by hit 2
  });

  it('vulnerability amplifies hits from OTHER towers too', () => {
    const content = makeContent(
      [
        towerDef({ id: 'curser', damage: 10, fireRate: 0.05, mechanic: { kind: 'curse', currentHpPct: 0, vulnMultiplier: 2, vulnDuration: 10 } }),
        towerDef({ id: 'plain', damage: 10, fireRate: 0.05 }),
      ],
      [enemyDef({ hp: 1000 })],
    );
    const sim = new Simulation(straightLevel(), content, 1);
    // Both towers fire once. Towers update in placement order, so the curser lands first.
    sim.applyCommand(placeCmd('curser', TOWER_HEX));
    sim.applyCommand(placeCmd('plain', { q: 3, r: -1 }));
    sim.applyCommand({ type: 'startWave' });
    runTicks(sim, TICK_RATE);
    // curser: 10 (pct 0, no vuln yet) → applies vuln; plain same tick: 10 * 2 = 20.
    expect(sim.enemies[0].hp).toBeCloseTo(1000 - 10 - 20, 5);
  });

  it('does not amplify burn DoT ticks even on a cursed (vulnerable) enemy', () => {
    const content = makeContent([], [enemyDef({ hp: 1000 })]);
    const sim = new Simulation(straightLevel(), content, 1);
    sim.applyCommand({ type: 'startWave' });
    while (sim.enemies.length < 1) sim.tick();
    const enemy = sim.enemies[0];
    enemy.effects.burn = { dps: 50, remaining: 1 };
    enemy.effects.vulnerability = { multiplier: 3, remaining: 5 };
    const hpBefore = enemy.hp;
    sim.tick();
    // Vulnerability amplifies direct hits only, never DoT ticks: plain dps * DT, no multiplier.
    expect(enemy.hp).toBeCloseTo(hpBefore - 50 * DT, 5);
  });

  it('amplifies chain-link damage through the pipeline when the link target is already cursed', () => {
    const content = makeContent(
      [towerDef({
        damage: 40, range: 400, fireRate: 0.05, element: 'storm',
        mechanic: { kind: 'chain', targets: 1, radius: 300, falloff: 0.5 },
      })],
      // storm attacking nature (opposed) = 1.5x; armor 4 applies (chain isn't armor-piercing).
      [enemyDef({ hp: 1000, element: 'nature', armor: 4 })],
    );
    const sim = new Simulation(
      straightLevel([{ entries: [{ enemyId: 'dummy', count: 2, spacing: 0.05 }] }]),
      content,
      1,
    );
    sim.applyCommand({ type: 'startWave' });
    while (sim.enemies.length < 2) sim.tick();
    // enemies[0] is the primary (spawned first, furthest along); curse enemies[1] up front
    // so the chain link damage it takes is amplified.
    sim.enemies[1].effects.vulnerability = { multiplier: 2, remaining: 10 };
    sim.applyCommand(placeCmd('testTower', TOWER_HEX));
    runTicks(sim, 10 * TICK_RATE);
    // link: base 40 * falloff 0.5 = 20; * matrix(storm→nature) 1.5 = 30; - armor 4 = 26; * vuln 2 = 52.
    expect(sim.enemies[1].hp).toBeCloseTo(1000 - 52, 5);
  });
});
