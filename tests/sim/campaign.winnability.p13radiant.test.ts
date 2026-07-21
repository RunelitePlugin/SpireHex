import { describe, expect, it } from 'vitest';
import { CONTENT, LEVELS } from '../../src/content';
import { Simulation } from '../../src/sim/simulation';
import { MAX_TICKS, openingCorpus, runSteps, type Step } from '../balance/harness';
import { L50_NOSLOW, P13_OPENING_TYPES_RADIANT, P13_RADIANT_FOLLOWUPS, P13_RADIANT_OPENING_HEXES, P13_RADIANT_WINNABILITY } from '../balance/p13RadiantBuilds';

/**
 * P13 biome-5 winnability locks — measured at seed 1 against the plan's
 * prototype. minLives floors are DELIBERATE: update only with fresh batch-run
 * evidence and a comment, never to silence a red test.
 */
const SCRIPTS_RADIANT: Array<{ levelId: string; minLives: number }> = [
  { levelId: 'level41', minLives: 14 }, // measured 20/20
  { levelId: 'level42', minLives: 14 }, // measured 20/20
  { levelId: 'level43', minLives: 14 }, // measured 20/20
  { levelId: 'level44', minLives: 3 },  // measured 6/20 — Split Halo fork + veilseraph debut
  { levelId: 'level45', minLives: 14 }, // measured 20/20
  { levelId: 'level46', minLives: 8 },  // measured 14/20
  { levelId: 'level47', minLives: 14 }, // measured 20/20
  { levelId: 'level48', minLives: 4 },  // measured 7/20 — hardest pre-finale (order lock)
  { levelId: 'level49', minLives: 12 }, // measured 18/20
  { levelId: 'level50', minLives: 8 },  // measured 14/20 with the Luminarch KILLED
];

/** runSteps + event capture: the exact greedy policy, inlined for boss asserts (P11/P12 pattern). */
function runWithBossEvents(levelId: string, steps: Step[], bossId: string) {
  const sim = new Simulation(LEVELS[levelId], CONTENT, 1);
  const byLabel = new Map<string, number>();
  const done = new Array(steps.length).fill(false);
  let bossKilled = false;
  let abilities = 0;
  const tryAdvance = (): void => {
    let progressed = true;
    while (progressed) {
      progressed = false;
      for (let i = 0; i < steps.length; i++) {
        if (done[i]) continue;
        const step = steps[i];
        let res;
        if (step.kind === 'place') {
          res = sim.applyCommand({ type: 'placeTower', towerTypeId: step.typeId, pos: step.pos });
          if (res.ok) byLabel.set(step.label, sim.towers[sim.towers.length - 1].id);
        } else if (step.kind === 'upgrade') {
          const id = byLabel.get(step.label);
          if (id === undefined) continue;
          res = sim.applyCommand({ type: 'upgradeTower', towerId: id });
        } else {
          const id = byLabel.get(step.label);
          if (id === undefined) continue;
          res = sim.applyCommand({ type: 'chooseSpecialization', towerId: id, specId: step.specId });
        }
        if (res.ok) { done[i] = true; progressed = true; }
      }
    }
  };
  for (let i = 0; i < MAX_TICKS * 2 && sim.status !== 'won' && sim.status !== 'lost'; i++) {
    tryAdvance();
    if (sim.status === 'building') sim.applyCommand({ type: 'startWave' });
    for (const ev of sim.tick()) {
      if (ev.type === 'bossAbility') abilities += 1;
      if (ev.type === 'enemyKilled'
          && sim.enemies.find((e) => e.id === ev.enemyId)?.typeId === bossId) bossKilled = true;
    }
  }
  return { sim, bossKilled, abilities };
}

describe('P13 Radiant Summits winnability (biome-5 pool: neutrals + four element towers)', () => {
  for (const script of SCRIPTS_RADIANT) {
    it(`${script.levelId} is winnable with the scripted biome-5 build`, () => {
      const { sim } = runSteps(LEVELS[script.levelId], P13_RADIANT_WINNABILITY[script.levelId]);
      expect(sim.status).toBe('won');
      expect(sim.lives).toBeGreaterThanOrEqual(script.minLives);
    });
  }

  it('level50: the Deep-Freeze outlast build KILLS the Luminarch through its shield cycles', () => {
    const { sim, bossKilled, abilities } = runWithBossEvents('level50', P13_RADIANT_WINNABILITY.level50, 'luminarch');
    expect(sim.status).toBe('won');
    expect(bossKilled).toBe(true);            // measured: killed at 14/20 lives
    expect(abilities).toBeGreaterThanOrEqual(10); // measured 14 shield windows — the mechanic engaged
  });

  it('level50 shield lesson: the same castle WITHOUT slow survives but CANNOT kill the boss', () => {
    const { sim, bossKilled } = runWithBossEvents('level50', L50_NOSLOW, 'luminarch');
    expect(sim.status).toBe('won');           // leak-tanking the 5-life boss stays survivable
    expect(sim.lives).toBeGreaterThanOrEqual(4); // measured 9/20
    expect(bossKilled).toBe(false);           // shields walk it out of range (leaked at 3047 hp)
  });
});

describe('P13 Radiant opening corpora (49 pairings: neutrals + four element towers)', () => {
  it('level44 clears at least 9/49 pairings (measured 14/49)', () => {
    const { north, south } = P13_RADIANT_OPENING_HEXES.level44;
    const results = openingCorpus(LEVELS.level44, north, south, P13_RADIANT_FOLLOWUPS.level44, P13_OPENING_TYPES_RADIANT);
    expect(results).toHaveLength(49);
    expect(results.filter((r) => r.status === 'won').length).toBeGreaterThanOrEqual(9);
  });

  it('level48 clears at least 2/49 pairings (measured 3/49)', () => {
    const { north, south } = P13_RADIANT_OPENING_HEXES.level48;
    const results = openingCorpus(LEVELS.level48, north, south, P13_RADIANT_FOLLOWUPS.level48, P13_OPENING_TYPES_RADIANT);
    expect(results).toHaveLength(49);
    expect(results.filter((r) => r.status === 'won').length).toBeGreaterThanOrEqual(2);
  });
});
