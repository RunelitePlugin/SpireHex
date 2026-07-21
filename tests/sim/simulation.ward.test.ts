import { describe, expect, it } from 'vitest';
import { TICK_RATE } from '../../src/sim/constants';
import { axialToWorld } from '../../src/sim/hex';
import { Simulation } from '../../src/sim/simulation';
import { enemyDef, makeContent, placeCmd, runTicks, straightLevel, TOWER_HEX, towerDef } from './helpers';

/** Buildable row r = -1; two well-separated columns so towers never overlap (>2×TOWER_RADIUS apart). */
const WARD_HEX = { q: 3, r: -1 };   // world ≈ (207.85, -72)
const FAR_HEX = { q: 6, r: -1 };    // world ≈ (457.27, -72)
const WARD_WORLD = axialToWorld(WARD_HEX);

function wardTower(revealRadius: number, goldPerWave = 0, id = 'wardTower') {
  return towerDef({ id, mechanic: { kind: 'ward', revealRadius, goldPerWave } });
}

/** Two identical one-dummy waves — wave 1 clears fast, leaving one wave remaining. */
const twoWaveLevel = () =>
  straightLevel([
    { entries: [{ enemyId: 'dummy', count: 1, spacing: 0.1 }] },
    { entries: [{ enemyId: 'dummy', count: 1, spacing: 0.1 }] },
  ]);

/** Tick until the first waveCleared lands. */
function tickUntilWaveCleared(sim: Simulation): ReturnType<Simulation['tick']> {
  for (let guard = 0; guard < 600; guard++) {
    const events = sim.tick();
    if (events.some((e) => e.type === 'waveCleared')) return events;
  }
  throw new Error('wave never cleared');
}

describe('ward (support/reveal/income)', () => {
  it('never fires — towerFired is never emitted for a ward tower, and its cooldown stays untouched', () => {
    const sim = new Simulation(
      straightLevel(),
      makeContent([wardTower(100, 5)], [enemyDef()]),
      1,
    );
    sim.applyCommand(placeCmd('wardTower', TOWER_HEX));
    sim.applyCommand({ type: 'startWave' });
    const events = runTicks(sim, 5 * TICK_RATE); // plenty of time for the dummy to walk into range
    expect(events.some((e) => e.type === 'towerFired')).toBe(false);
    expect(sim.towers[0].cooldown).toBe(0);
  });

  it('reveals a stealth enemy within revealRadius, making it targetable by a plain none tower', () => {
    const content = makeContent(
      [wardTower(80), towerDef({ id: 'sentry', mechanic: { kind: 'none' }, damage: 10, fireRate: 20, range: 300 })],
      [enemyDef({ id: 'sneaky', hp: 100, speed: 0, stealth: true })],
    );
    const sim = new Simulation(straightLevel([{ entries: [{ enemyId: 'sneaky', count: 1, spacing: 0.05 }] }]), content, 1);
    sim.applyCommand({ type: 'startWave' });
    while (sim.enemies.length < 1) sim.tick();
    sim.enemies[0].pathDist = WARD_WORLD.x; // same x as the ward tower → distance 72 (< revealRadius 80)
    sim.applyCommand(placeCmd('wardTower', WARD_HEX));
    sim.applyCommand(placeCmd('sentry', FAR_HEX));
    const events = sim.tick();
    expect(events.some((e) => e.type === 'towerFired' && e.enemyId === sim.enemies[0].id)).toBe(true);
    expect(sim.enemies[0].hp).toBeLessThan(100);
  });

  it('leaves a stealth enemy outside revealRadius untargetable', () => {
    const content = makeContent(
      [wardTower(50), towerDef({ id: 'sentry', mechanic: { kind: 'none' }, damage: 10, fireRate: 20, range: 300 })],
      [enemyDef({ id: 'sneaky', hp: 100, speed: 0, stealth: true })],
    );
    const sim = new Simulation(straightLevel([{ entries: [{ enemyId: 'sneaky', count: 1, spacing: 0.05 }] }]), content, 1);
    sim.applyCommand({ type: 'startWave' });
    while (sim.enemies.length < 1) sim.tick();
    sim.enemies[0].pathDist = WARD_WORLD.x; // same x, distance 72 (> revealRadius 50) — stays hidden
    sim.applyCommand(placeCmd('wardTower', WARD_HEX));
    sim.applyCommand(placeCmd('sentry', FAR_HEX));
    const events = sim.tick();
    expect(events.some((e) => e.type === 'towerFired')).toBe(false);
    expect(sim.enemies[0].hp).toBe(100);
  });

  it('pierce towers keep targeting stealth regardless of ward reveal (unaffected either way)', () => {
    const content = makeContent(
      [wardTower(50), towerDef({ id: 'radiant', mechanic: { kind: 'pierce' }, damage: 10, fireRate: 20, range: 300 })],
      [enemyDef({ id: 'sneaky', hp: 100, armor: 50, speed: 0, stealth: true })],
    );
    const sim = new Simulation(straightLevel([{ entries: [{ enemyId: 'sneaky', count: 1, spacing: 0.05 }] }]), content, 1);
    sim.applyCommand({ type: 'startWave' });
    while (sim.enemies.length < 1) sim.tick();
    sim.enemies[0].pathDist = WARD_WORLD.x; // distance 72 > revealRadius 50 — NOT revealed by the ward
    sim.applyCommand(placeCmd('wardTower', WARD_HEX));
    sim.applyCommand(placeCmd('radiant', FAR_HEX));
    const events = sim.tick();
    expect(events.some((e) => e.type === 'towerFired' && e.enemyId === sim.enemies[0].id)).toBe(true);
    expect(sim.enemies[0].hp).toBe(90); // pierce ignores armor: 100 - 10
  });

  it('isRevealed is pure — calling it twice mutates nothing', () => {
    const content = makeContent([wardTower(80)], [enemyDef({ id: 'sneaky', hp: 100, speed: 0, stealth: true })]);
    const sim = new Simulation(straightLevel([{ entries: [{ enemyId: 'sneaky', count: 1, spacing: 0.05 }] }]), content, 1);
    sim.applyCommand({ type: 'startWave' });
    while (sim.enemies.length < 1) sim.tick();
    sim.enemies[0].pathDist = WARD_WORLD.x;
    sim.applyCommand(placeCmd('wardTower', WARD_HEX));
    const enemiesBefore = JSON.stringify(sim.enemies);
    const towersBefore = JSON.stringify(sim.towers);
    expect(sim.isRevealed(sim.enemies[0])).toBe(true);
    expect(sim.isRevealed(sim.enemies[0])).toBe(true);
    expect(JSON.stringify(sim.enemies)).toBe(enemiesBefore);
    expect(JSON.stringify(sim.towers)).toBe(towersBefore);
  });

  it('pays gold on a wave clear WITH waves remaining, summed across every ward tower, and fires wardIncome', () => {
    const content = makeContent(
      [
        towerDef({ id: 'killer', damage: 1000, fireRate: 20, range: 400, mechanic: { kind: 'none' } }),
        wardTower(80, 5, 'wardA'),
        wardTower(80, 7, 'wardB'),
      ],
      [enemyDef()],
    );
    const sim = new Simulation(twoWaveLevel(), content, 1);
    sim.applyCommand(placeCmd('killer', TOWER_HEX));
    sim.applyCommand(placeCmd('wardA', WARD_HEX));
    sim.applyCommand(placeCmd('wardB', FAR_HEX));
    const goldBefore = sim.gold;
    sim.applyCommand({ type: 'startWave' });
    const events = tickUntilWaveCleared(sim);
    expect(sim.status).toBe('building'); // one wave still remains
    const income = events.find((e) => e.type === 'wardIncome');
    expect(income).toMatchObject({ gold: 12 }); // 5 + 7
    expect(sim.gold).toBe(goldBefore + 5 /* bounty */ + 12 /* ward income */);
  });

  it('pays NO income after the final wave clear', () => {
    const content = makeContent(
      [
        towerDef({ id: 'killer', damage: 1000, fireRate: 20, range: 400, mechanic: { kind: 'none' } }),
        wardTower(80, 5, 'wardA'),
      ],
      [enemyDef()],
    );
    const sim = new Simulation(straightLevel(), content, 1); // single wave — this clear wins the level
    sim.applyCommand(placeCmd('killer', TOWER_HEX));
    sim.applyCommand(placeCmd('wardA', WARD_HEX));
    const goldBefore = sim.gold;
    sim.applyCommand({ type: 'startWave' });
    const events = tickUntilWaveCleared(sim);
    expect(sim.status).toBe('won');
    expect(events.some((e) => e.type === 'wardIncome')).toBe(false);
    expect(sim.gold).toBe(goldBefore + 5); // bounty only, no ward income
  });

  it('determinism: two sims, same seed and commands, one with splash+ward towers → identical enemies+gold after 300 ticks', () => {
    const content = () =>
      makeContent(
        [
          towerDef({
            id: 'mortar', element: 'neutral', damage: 30, range: 200, fireRate: 1.3,
            mechanic: { kind: 'splash', radius: 60, falloff: 0.5 },
          }),
          wardTower(80, 5),
        ],
        [enemyDef({ hp: 200 })],
      );
    const play = (): { enemies: string; gold: number } => {
      const sim = new Simulation(
        straightLevel([
          { entries: [{ enemyId: 'dummy', count: 5, spacing: 0.3 }] },
          { entries: [{ enemyId: 'dummy', count: 5, spacing: 0.3 }] },
        ]),
        content(),
        1,
      );
      sim.applyCommand(placeCmd('mortar', TOWER_HEX));
      sim.applyCommand(placeCmd('wardTower', WARD_HEX));
      sim.applyCommand({ type: 'startWave' });
      runTicks(sim, 300);
      return { enemies: JSON.stringify(sim.enemies), gold: sim.gold };
    };
    const a = play();
    const b = play();
    expect(a.enemies).toBe(b.enemies);
    expect(a.gold).toBe(b.gold);
  });
});
