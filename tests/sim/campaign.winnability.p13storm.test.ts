import { describe, expect, it } from 'vitest';
import { CONTENT, LEVELS } from '../../src/content';
import { Simulation } from '../../src/sim/simulation';
import { MAX_TICKS, openingCorpus, runSteps, type Step } from '../balance/harness';
import { L40_GATECASTLE, P13_OPENING_TYPES_STORM, P13_STORM_FOLLOWUPS, P13_STORM_OPENING_HEXES, P13_STORM_WINNABILITY } from '../balance/p13StormBuilds';

/**
 * P13 biome-4 winnability locks — measured at seed 1 against the plan's
 * prototype. minLives floors are DELIBERATE: update only with fresh batch-run
 * evidence and a comment, never to silence a red test.
 */
const SCRIPTS_STORM: Array<{ levelId: string; minLives: number }> = [
  { levelId: 'level31', minLives: 14 }, // measured 20/20
  { levelId: 'level32', minLives: 14 }, // measured 20/20
  { levelId: 'level33', minLives: 14 }, // measured 20/20
  { levelId: 'level34', minLives: 3 },  // measured 6/20 — first Storm fork
  { levelId: 'level35', minLives: 14 }, // measured 20/20
  { levelId: 'level36', minLives: 8 },  // measured 14/20
  { levelId: 'level37', minLives: 8 },  // measured 14/20
  { levelId: 'level38', minLives: 2 },  // measured 5/20 — hardest pre-finale (order lock)
  { levelId: 'level39', minLives: 12 }, // measured 18/20
  { levelId: 'level40', minLives: 8 },  // measured 14/20 with the Tempestcaller KILLED
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

describe('P13 Storm Reach winnability (biome-4 pool: neutrals + ember + frost + thorn)', () => {
  for (const script of SCRIPTS_STORM) {
    it(`${script.levelId} is winnable with the scripted biome-4 build`, () => {
      const { sim } = runSteps(LEVELS[script.levelId], P13_STORM_WINNABILITY[script.levelId]);
      expect(sim.status).toBe('won');
      expect(sim.lives).toBeGreaterThanOrEqual(script.minLives);
    });
  }

  it('level40: the freeze-gate build KILLS the Tempestcaller and its blink fires', () => {
    const { sim, bossKilled, abilities } = runWithBossEvents('level40', P13_STORM_WINNABILITY.level40, 'tempestcaller');
    expect(sim.status).toBe('won');
    expect(bossKilled).toBe(true);           // measured: killed at 14/20 lives
    expect(abilities).toBeGreaterThanOrEqual(4); // measured 5 blinks — the mechanic engaged
  });

  it('level40 blink lesson: the same castle WITHOUT Deep Freeze survives but CANNOT kill the boss', () => {
    const { sim, bossKilled } = runWithBossEvents('level40', L40_GATECASTLE, 'tempestcaller');
    expect(sim.status).toBe('won');          // leak-tanking the 5-life boss stays survivable
    expect(sim.lives).toBeGreaterThanOrEqual(4); // measured 9/20
    expect(bossKilled).toBe(false);          // the blink tax has teeth (leaked at 543 hp)
  });
});

describe('P13 Storm opening corpora (36 pairings: neutrals + ember + frost + thorn)', () => {
  it('level34 clears at least 6/36 pairings (measured 9/36)', () => {
    const { north, south } = P13_STORM_OPENING_HEXES.level34;
    const results = openingCorpus(LEVELS.level34, north, south, P13_STORM_FOLLOWUPS.level34, P13_OPENING_TYPES_STORM);
    expect(results).toHaveLength(36);
    expect(results.filter((r) => r.status === 'won').length).toBeGreaterThanOrEqual(6);
  });

  it('level38 clears at least 2/36 pairings (measured 4/36)', () => {
    const { north, south } = P13_STORM_OPENING_HEXES.level38;
    const results = openingCorpus(LEVELS.level38, north, south, P13_STORM_FOLLOWUPS.level38, P13_OPENING_TYPES_STORM);
    expect(results).toHaveLength(36);
    expect(results.filter((r) => r.status === 'won').length).toBeGreaterThanOrEqual(2);
  });
});
