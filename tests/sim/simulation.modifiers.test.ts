import { describe, expect, it } from 'vitest';
import { Simulation } from '../../src/sim/simulation';
import type { SimEvent } from '../../src/sim/types';
import { enemyDef, makeContent, placeCmd, runTicks, straightLevel, TOWER_HEX, towerDef } from './helpers';

/** Two identical one-dummy waves — wave 1 clears fast, arming the 10 s countdown. */
const twoWaveLevel = () =>
  straightLevel([
    { entries: [{ enemyId: 'dummy', count: 1, spacing: 0.1 }] },
    { entries: [{ enemyId: 'dummy', count: 1, spacing: 0.1 }] },
  ]);

/** Tick until the first waveCleared lands; at that instant countdown is exactly level.waveCountdown. */
function tickUntilWaveCleared(sim: Simulation): void {
  for (let guard = 0; guard < 600; guard++) {
    if (sim.tick().some((e) => e.type === 'waveCleared')) return;
  }
  throw new Error('wave never cleared');
}

describe('sim modifiers: starting gold and early-call rate', () => {
  it('adds extraStartingGold to the level starting gold', () => {
    const sim = new Simulation(straightLevel(), makeContent([towerDef()], [enemyDef()]), 1, {
      extraStartingGold: 40,
    });
    expect(sim.gold).toBe(1040); // straightLevel starts at 1000
  });

  it('bare constructor and empty modifiers are bit-for-bit identical (Phase 4 behavior pinned)', () => {
    const play = (sim: Simulation): SimEvent[] => {
      sim.applyCommand(placeCmd('testTower', TOWER_HEX));
      sim.applyCommand({ type: 'startWave' });
      return runTicks(sim, 300);
    };
    const bare = new Simulation(straightLevel(), makeContent([towerDef()], [enemyDef()]), 1);
    const empty = new Simulation(straightLevel(), makeContent([towerDef()], [enemyDef()]), 1, {});
    expect(play(empty)).toEqual(play(bare));
    expect(empty.gold).toBe(bare.gold);
    expect(empty.lives).toBe(bare.lives);
  });

  it('earlyCallRateBonus raises the quoted early-call bonus', () => {
    const sim = new Simulation(twoWaveLevel(), makeContent([towerDef({ damage: 1000 })], [enemyDef()]), 1, {
      earlyCallRateBonus: 1,
    });
    sim.applyCommand(placeCmd('testTower', TOWER_HEX));
    sim.applyCommand({ type: 'startWave' });
    tickUntilWaveCleared(sim);
    expect(sim.countdown).toBe(10);
    expect(sim.earlyCallBonus()).toBe(40); // floor(10 × (3 base + 1 bonus)); 30 without the modifier
  });

  it('an early call banks the boosted bonus and reports it in the event', () => {
    const sim = new Simulation(twoWaveLevel(), makeContent([towerDef({ damage: 1000 })], [enemyDef()]), 1, {
      earlyCallRateBonus: 1,
    });
    sim.applyCommand(placeCmd('testTower', TOWER_HEX));
    sim.applyCommand({ type: 'startWave' });
    tickUntilWaveCleared(sim);
    const goldBefore = sim.gold;
    sim.applyCommand({ type: 'startWave' }); // early call at exactly 10 s remaining
    expect(sim.gold).toBe(goldBefore + 40);
    const events = sim.tick(); // pending events flush on the next tick
    expect(events.some((e) => e.type === 'earlyCallBonus' && e.gold === 40)).toBe(true);
  });
});

describe('sim modifiers: life regen and element damage', () => {
  it('regains lives when a wave clears with waves remaining', () => {
    const sim = new Simulation(twoWaveLevel(), makeContent([towerDef({ damage: 1000 })], [enemyDef()]), 1, {
      lifeRegenPerWave: 2,
    });
    sim.applyCommand(placeCmd('testTower', TOWER_HEX));
    sim.lives = 15; // pretend earlier leaks
    sim.applyCommand({ type: 'startWave' });
    tickUntilWaveCleared(sim);
    expect(sim.status).toBe('building');
    expect(sim.lives).toBe(17);
  });

  it('never regens above the level starting lives', () => {
    const sim = new Simulation(twoWaveLevel(), makeContent([towerDef({ damage: 1000 })], [enemyDef()]), 1, {
      lifeRegenPerWave: 2,
    });
    sim.applyCommand(placeCmd('testTower', TOWER_HEX));
    sim.lives = 19;
    sim.applyCommand({ type: 'startWave' });
    tickUntilWaveCleared(sim);
    expect(sim.lives).toBe(20); // capped at level.lives, not 21
  });

  it('does NOT regen after the final wave — victory lives stay honest for mastery', () => {
    const sim = new Simulation(straightLevel(), makeContent([towerDef({ damage: 1000 })], [enemyDef()]), 1, {
      lifeRegenPerWave: 2,
    });
    sim.applyCommand(placeCmd('testTower', TOWER_HEX));
    sim.lives = 15;
    sim.applyCommand({ type: 'startWave' });
    tickUntilWaveCleared(sim); // single wave: this clear wins the level
    expect(sim.status).toBe('won');
    expect(sim.lives).toBe(15);
  });

  it('elementDamageMult scales statsFor damage for a matching tower element', () => {
    const sim = new Simulation(straightLevel(), makeContent([towerDef()], [enemyDef()]), 1, {
      elementDamageMult: { fire: 1.1 }, // testTower is fire
    });
    sim.applyCommand(placeCmd('testTower', TOWER_HEX));
    expect(sim.statsFor(sim.towers[0]).damage).toBeCloseTo(11); // base 10 × 1.1
  });

  it('leaves towers of other elements untouched', () => {
    const sim = new Simulation(straightLevel(), makeContent([towerDef()], [enemyDef()]), 1, {
      elementDamageMult: { frost: 1.1 },
    });
    sim.applyCommand(placeCmd('testTower', TOWER_HEX));
    expect(sim.statsFor(sim.towers[0]).damage).toBe(10);
  });
});

describe('sim modifiers: P11 bounty / ward income / sell refund', () => {
  it('bountyMult scales kill bounties, rounded', () => {
    // enemyDef() default bounty is 5; 5 × 1.25 = 6.25 → rounds to 6.
    const sim = new Simulation(
      straightLevel([{ entries: [{ enemyId: 'dummy', count: 1, spacing: 0.1 }] }]),
      makeContent([towerDef({ damage: 1000 })], [enemyDef({ bounty: 5 })]),
      1,
      { bountyMult: 1.25 },
    );
    sim.applyCommand(placeCmd('testTower', TOWER_HEX));
    sim.applyCommand({ type: 'startWave' });
    const events = runTicks(sim, 300);
    expect(events).toContainEqual({ type: 'enemyKilled', enemyId: 2, bounty: 6 });
    expect(sim.goldEarned).toBe(6);
  });

  it('bountyMult of 1 (default) reproduces the un-rounded base bounty exactly', () => {
    const sim = new Simulation(
      straightLevel([{ entries: [{ enemyId: 'dummy', count: 1, spacing: 0.1 }] }]),
      makeContent([towerDef({ damage: 1000 })], [enemyDef({ bounty: 5 })]),
      1,
    );
    sim.applyCommand(placeCmd('testTower', TOWER_HEX));
    sim.applyCommand({ type: 'startWave' });
    runTicks(sim, 300);
    expect(sim.goldEarned).toBe(5);
  });

  it('wardIncome floors income × wardIncomeMult (P11 seam for the Task 2 ward payout)', () => {
    const sim = new Simulation(straightLevel(), makeContent([towerDef()], [enemyDef()]), 1, {
      wardIncomeMult: 1.3,
    });
    expect(sim.wardIncome(10)).toBe(13); // 10 × 1.3, exact
    expect(sim.wardIncome(15)).toBe(19); // 15 × 1.3 = 19.5 → floored
  });

  it('wardIncome defaults to an exact pass-through (wardIncomeMult 1)', () => {
    const sim = new Simulation(straightLevel(), makeContent([towerDef()], [enemyDef()]), 1);
    expect(sim.wardIncome(37)).toBe(37);
  });

  it('sellRefundBonus raises the refund rate above SELL_REFUND_RATE', () => {
    const sim = new Simulation(
      { ...straightLevel(), startingGold: 1000 },
      makeContent([towerDef({ cost: 100 })], [enemyDef()]),
      1,
      { sellRefundBonus: 0.1 },
    );
    sim.applyCommand(placeCmd('testTower', TOWER_HEX)); // gold now 900
    sim.applyCommand({ type: 'sellTower', towerId: 1 });
    expect(sim.gold).toBe(980); // 900 + floor(100 × 0.8)
  });

  it('sellRefundBonus caps the effective refund rate at 0.95', () => {
    const sim = new Simulation(
      { ...straightLevel(), startingGold: 1000 },
      makeContent([towerDef({ cost: 100 })], [enemyDef()]),
      1,
      { sellRefundBonus: 0.9 }, // 0.7 + 0.9 = 1.6, capped to 0.95
    );
    sim.applyCommand(placeCmd('testTower', TOWER_HEX)); // gold now 900
    sim.applyCommand({ type: 'sellTower', towerId: 1 });
    expect(sim.gold).toBe(995); // 900 + floor(100 × 0.95)
  });
});
