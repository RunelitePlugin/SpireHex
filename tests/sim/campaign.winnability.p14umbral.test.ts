import { describe, expect, it } from 'vitest';
import { CONTENT, LEVELS } from '../../src/content';
import { Simulation } from '../../src/sim/simulation';
import { MAX_TICKS, openingCorpus, runSteps, type Step } from '../balance/harness';
import {
  L60_DARKCASTLE,
  L60_NOPIERCE,
  P14_OPENING_TYPES_UMBRAL,
  P14_UMBRAL_FOLLOWUPS,
  P14_UMBRAL_OPENING_HEXES,
  P14_UMBRAL_WINNABILITY,
} from '../balance/p14UmbralBuilds';

/**
 * P14 biome-6 winnability locks — measured at seed 1 against the plan's
 * prototype. minLives floors are DELIBERATE: update only with fresh batch-run
 * evidence and a comment, never to silence a red test.
 */
const SCRIPTS_UMBRAL: Array<{ levelId: string; minLives: number }> = [
  { levelId: 'level51', minLives: 14 }, // measured 20/20
  { levelId: 'level52', minLives: 13 }, // measured 19/20
  { levelId: 'level53', minLives: 14 }, // measured 20/20
  { levelId: 'level54', minLives: 3 },  // measured 5/20 — the Veilsplit fork
  { levelId: 'level55', minLives: 14 }, // measured 20/20
  { levelId: 'level56', minLives: 14 }, // measured 20/20
  { levelId: 'level57', minLives: 12 }, // measured 18/20
  { levelId: 'level58', minLives: 2 },  // measured 5/20 — hardest pre-finale (order lock)
  { levelId: 'level59', minLives: 14 }, // measured 20/20
  { levelId: 'level60', minLives: 8 },  // measured 15/20 with the Umbrageist KILLED
];

/** runSteps + event capture: the exact greedy policy, inlined for boss asserts (P11-P13 pattern). */
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

describe('P14 Umbral Depths winnability (biome-6 pool: neutrals + all five element towers)', () => {
  for (const script of SCRIPTS_UMBRAL) {
    it(`${script.levelId} is winnable with the scripted biome-6 build`, () => {
      const { sim } = runSteps(LEVELS[script.levelId], P14_UMBRAL_WINNABILITY[script.levelId]);
      expect(sim.status).toBe('won');
      expect(sim.lives).toBeGreaterThanOrEqual(script.minLives);
    });
  }

  it('level60: the reveal castle KILLS the Umbrageist through its stealth windows', () => {
    const { sim, bossKilled, abilities } = runWithBossEvents('level60', P14_UMBRAL_WINNABILITY.level60, 'umbrageist');
    expect(sim.status).toBe('won');
    expect(bossKilled).toBe(true);            // measured: killed at 15/20 lives
    expect(abilities).toBeGreaterThanOrEqual(10); // measured 12 (10 stealth windows + 2 curses)
  });

  it('level60 stealth lesson: the burst castle without pierce SURVIVES but cannot kill the boss', () => {
    const { sim, bossKilled } = runWithBossEvents('level60', L60_NOPIERCE, 'umbrageist');
    expect(sim.status).toBe('won');           // leak-tanking the 5-life boss stays survivable
    expect(sim.lives).toBeGreaterThanOrEqual(3); // measured 6/20
    expect(bossKilled).toBe(false);           // the stealth tax has teeth (leaked at 2047 hp)
  });

  it('level60 reveal lesson: a castle with NO reveal at all LOSES outright', () => {
    const { sim, bossKilled } = runWithBossEvents('level60', L60_DARKCASTLE, 'umbrageist');
    expect(sim.status).toBe('lost');          // 14 lives of unseen nullwraith leaks end the run
    expect(bossKilled).toBe(false);
  });
});

describe('P14 Umbral opening corpora (64 pairings: neutrals + all five element towers)', () => {
  it('level54 clears at least 18/64 pairings (measured 26/64)', () => {
    const { north, south } = P14_UMBRAL_OPENING_HEXES.level54;
    const results = openingCorpus(LEVELS.level54, north, south, P14_UMBRAL_FOLLOWUPS.level54, P14_OPENING_TYPES_UMBRAL);
    expect(results).toHaveLength(64);
    expect(results.filter((r) => r.status === 'won').length).toBeGreaterThanOrEqual(18);
  });

  it('level58 clears at least 8/64 pairings (measured 12/64)', () => {
    const { north, south } = P14_UMBRAL_OPENING_HEXES.level58;
    const results = openingCorpus(LEVELS.level58, north, south, P14_UMBRAL_FOLLOWUPS.level58, P14_OPENING_TYPES_UMBRAL);
    expect(results).toHaveLength(64);
    expect(results.filter((r) => r.status === 'won').length).toBeGreaterThanOrEqual(8);
  });
});
