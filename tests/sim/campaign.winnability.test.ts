import { describe, expect, it } from 'vitest';
import { CONTENT, LEVELS } from '../../src/content';
import { Simulation } from '../../src/sim/simulation';
import {
  MAX_TICKS,
  OPENING_FOLLOWUPS,
  OPENING_HEXES,
  WINNABILITY_BUILDS,
  openingCorpus,
  runSteps,
} from '../balance/harness';

/**
 * Multi-path winnability regression (Phase 4 final-review ticket; builds and
 * policy now live in tests/balance/harness.ts so `npm run balance` reports the
 * exact same runs). P11: re-locked to the neutral-roster campaign retune
 * (Task 9) — all ten levels, seed 1. minLives floors are DELIBERATE — update
 * only with fresh batch-run evidence and a comment, never to silence a red test.
 */
const SCRIPTS: Array<{ levelId: string; minLives: number }> = [
  // P11 neutral-roster conversion, measured at seed 1 (see the P11 plan evidence table).
  { levelId: 'level01', minLives: 14 }, // measured 20/20
  { levelId: 'level02', minLives: 14 }, // measured 20/20
  { levelId: 'level03', minLives: 14 }, // measured 20/20
  { levelId: 'level04', minLives: 14 }, // measured 20/20
  { levelId: 'level05', minLives: 14 }, // measured 20/20
  { levelId: 'level06', minLives: 14 }, // measured 20/20
  { levelId: 'level07', minLives: 10 }, // measured 16/20
  { levelId: 'level08', minLives: 4 },  // measured 8/20 — hardest pre-finale (order lock)
  { levelId: 'level09', minLives: 14 }, // measured 20/20
  { levelId: 'level10', minLives: 6 },  // measured 10/20 with the boss KILLED
];

describe('multi-path campaign winnability (Phase 4 final-review ticket)', () => {
  for (const script of SCRIPTS) {
    it(`${script.levelId} is winnable with a scripted dual-road build`, () => {
      const { sim } = runSteps(LEVELS[script.levelId], WINNABILITY_BUILDS[script.levelId]);
      expect(sim.status).toBe('won');
      expect(sim.lives).toBeGreaterThan(0);
      expect(sim.lives).toBeGreaterThanOrEqual(script.minLives);
    });
  }

  it('level10: the scripted build KILLS the Cinderlord (never leak-tanks) and both splits fire', () => {
    const sim = new Simulation(LEVELS.level10, CONTENT, 1);
    const steps = WINNABILITY_BUILDS.level10;
    const byLabel = new Map<string, number>();
    const done = new Array(steps.length).fill(false);
    let splits = 0; let bossKilled = false;
    // tryAdvance: the EXACT greedy loop from harness.runSteps, inlined so this test
    // can read sim.tick() events (runSteps does not expose them).
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
    for (let i = 0; i < MAX_TICKS && sim.status !== 'won' && sim.status !== 'lost'; i++) {
      tryAdvance();
      if (sim.status === 'building') sim.applyCommand({ type: 'startWave' });
      for (const ev of sim.tick()) {
        if (ev.type === 'bossAbility' && ev.effect === 'split') splits += 1;
        if (ev.type === 'enemyKilled'
            && sim.enemies.find((e) => e.id === ev.enemyId)?.typeId === 'cinderlord') bossKilled = true;
      }
    }
    expect(sim.status).toBe('won');
    expect(bossKilled).toBe(true);  // measured: killed at 10/20 lives
    expect(splits).toBe(2);         // 66% and 33% thresholds both crossed
  });

  // P11 opening corpora: every (north, south) pairing of the 3 neutral starters
  // on the level's two best-coverage hexes, upgraded greedily, then a fixed
  // follow-up spine (see tests/balance/harness.ts). 9 pairings each.
  it('level07 opening corpus clears at least 3/9 pairings (measured 4/9)', () => {
    const { north, south } = OPENING_HEXES.level07;
    const results = openingCorpus(LEVELS.level07, north, south, OPENING_FOLLOWUPS.level07);
    expect(results).toHaveLength(9);
    expect(results.filter((r) => r.status === 'won').length).toBeGreaterThanOrEqual(3);
  });

  it('level08 opening corpus (centered-warden spine) clears at least 2/9 pairings (measured 3/9)', () => {
    const { north, south } = OPENING_HEXES.level08;
    const results = openingCorpus(LEVELS.level08, north, south, OPENING_FOLLOWUPS.level08);
    expect(results).toHaveLength(9);
    expect(results.filter((r) => r.status === 'won').length).toBeGreaterThanOrEqual(2);
  });
});
