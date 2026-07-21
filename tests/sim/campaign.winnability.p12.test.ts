import { describe, expect, it } from 'vitest';
import { CONTENT, LEVELS } from '../../src/content';
import { Simulation } from '../../src/sim/simulation';
import { MAX_TICKS, openingCorpus, runSteps, type Step } from '../balance/harness';
import { L20_ROADLINE, L30_UNFOCUSED, P12_OPENING_FOLLOWUPS, P12_OPENING_HEXES, P12_OPENING_TYPES_FROST, P12_OPENING_TYPES_VERDANT, P12_WINNABILITY_BUILDS } from '../balance/p12Builds';

/**
 * P12 biome 2-3 winnability locks — measured at seed 1 against the plan's
 * prototype. minLives floors are DELIBERATE: update only with fresh batch-run
 * evidence and a comment, never to silence a red test.
 */
const SCRIPTS_FROST: Array<{ levelId: string; minLives: number }> = [
  { levelId: 'level11', minLives: 14 }, // measured 20/20
  { levelId: 'level12', minLives: 14 }, // measured 20/20
  { levelId: 'level13', minLives: 14 }, // measured 20/20
  { levelId: 'level14', minLives: 6 },  // measured 10/20 — first Frostfell fork
  { levelId: 'level15', minLives: 14 }, // measured 20/20
  { levelId: 'level16', minLives: 14 }, // measured 20/20
  { levelId: 'level17', minLives: 14 }, // measured 20/20
  { levelId: 'level18', minLives: 2 },  // measured 5/20 — hardest pre-finale (order lock)
  { levelId: 'level19', minLives: 14 }, // measured 20/20
  { levelId: 'level20', minLives: 8 },  // measured 14/20 with the Rimelord KILLED
];

const SCRIPTS_VERDANT: Array<{ levelId: string; minLives: number }> = [
  { levelId: 'level21', minLives: 14 }, // measured 20/20
  { levelId: 'level22', minLives: 14 }, // measured 20/20
  { levelId: 'level23', minLives: 14 }, // measured 20/20
  { levelId: 'level24', minLives: 6 },  // measured 11/20 — the Rootfork
  { levelId: 'level25', minLives: 14 }, // measured 20/20
  { levelId: 'level26', minLives: 14 }, // measured 20/20
  { levelId: 'level27', minLives: 14 }, // measured 20/20
  { levelId: 'level28', minLives: 4 },  // measured 8/20 — hardest pre-finale (order lock)
  { levelId: 'level29', minLives: 14 }, // measured 20/20
  { levelId: 'level30', minLives: 10 }, // measured 16/20 with the Verdantheart KILLED
];

/** runSteps + event capture: the exact greedy policy, inlined for boss asserts (P11 level10 pattern). */
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

describe('P12 Frostfell winnability (biome-2 pool: neutrals + emberSpire)', () => {
  for (const script of SCRIPTS_FROST) {
    it(`${script.levelId} is winnable with the scripted biome-2 build`, () => {
      const { sim } = runSteps(LEVELS[script.levelId], P12_WINNABILITY_BUILDS[script.levelId]);
      expect(sim.status).toBe('won');
      expect(sim.lives).toBeGreaterThanOrEqual(script.minLives);
    });
  }

  it('level20: the gate-castle build KILLS the Rimelord and its freeze fires', () => {
    const { sim, bossKilled, abilities } = runWithBossEvents('level20', P12_WINNABILITY_BUILDS.level20, 'rimelord');
    expect(sim.status).toBe('won');
    expect(bossKilled).toBe(true);           // measured: killed at 14/20 lives
    expect(abilities).toBeGreaterThanOrEqual(5); // measured 7 freezes — the mechanic engaged
  });

  it('level20 freeze lesson: a road-line spread survives but CANNOT kill the boss', () => {
    const { sim, bossKilled } = runWithBossEvents('level20', L20_ROADLINE, 'rimelord');
    expect(sim.status).toBe('won');          // leak-tanking the 5-life boss stays survivable
    expect(sim.lives).toBeGreaterThanOrEqual(4); // measured 9/20
    expect(bossKilled).toBe(false);          // the freeze lesson has teeth
  });
});

describe('P12 Frostfell opening corpora (16 pairings: neutrals + emberSpire)', () => {
  it('level14 clears at least 2/16 pairings (measured 3/16)', () => {
    const { north, south } = P12_OPENING_HEXES.level14;
    const results = openingCorpus(LEVELS.level14, north, south, P12_OPENING_FOLLOWUPS.level14, P12_OPENING_TYPES_FROST);
    expect(results).toHaveLength(16);
    expect(results.filter((r) => r.status === 'won').length).toBeGreaterThanOrEqual(2);
  });

  it('level18 clears at least 3/16 pairings (measured 5/16)', () => {
    const { north, south } = P12_OPENING_HEXES.level18;
    const results = openingCorpus(LEVELS.level18, north, south, P12_OPENING_FOLLOWUPS.level18, P12_OPENING_TYPES_FROST);
    expect(results).toHaveLength(16);
    expect(results.filter((r) => r.status === 'won').length).toBeGreaterThanOrEqual(3);
  });
});

describe('P12 Verdant Deep winnability (biome-3 pool: neutrals + emberSpire + frostObelisk)', () => {
  for (const script of SCRIPTS_VERDANT) {
    it(`${script.levelId} is winnable with the scripted biome-3 build`, () => {
      const { sim } = runSteps(LEVELS[script.levelId], P12_WINNABILITY_BUILDS[script.levelId]);
      expect(sim.status).toBe('won');
      expect(sim.lives).toBeGreaterThanOrEqual(script.minLives);
    });
  }

  it('level30: the exit-coverage build KILLS the Verdantheart through its regen', () => {
    const { sim, bossKilled, abilities } = runWithBossEvents('level30', P12_WINNABILITY_BUILDS.level30, 'verdantheart');
    expect(sim.status).toBe('won');
    expect(bossKilled).toBe(true);            // measured: killed at 16/20 lives
    expect(abilities).toBeGreaterThanOrEqual(50); // measured 84 (regen ticks + 3 sporeling adds)
  });

  it('level30 regen lesson: without exit coverage the boss heals out — survivable, never killable', () => {
    const { sim, bossKilled } = runWithBossEvents('level30', L30_UNFOCUSED, 'verdantheart');
    expect(sim.status).toBe('won');
    expect(sim.lives).toBeGreaterThanOrEqual(8);  // measured 13/20 — leak-tank stays viable
    expect(bossKilled).toBe(false);
  });
});

describe('P12 Verdant Deep opening corpora (25 pairings: neutrals + emberSpire + frostObelisk)', () => {
  it('level24 clears at least 6/25 pairings (measured 9/25)', () => {
    const { north, south } = P12_OPENING_HEXES.level24;
    const results = openingCorpus(LEVELS.level24, north, south, P12_OPENING_FOLLOWUPS.level24, P12_OPENING_TYPES_VERDANT);
    expect(results).toHaveLength(25);
    expect(results.filter((r) => r.status === 'won').length).toBeGreaterThanOrEqual(6);
  });

  it('level28 clears at least 5/25 pairings (measured 8/25)', () => {
    const { north, south } = P12_OPENING_HEXES.level28;
    const results = openingCorpus(LEVELS.level28, north, south, P12_OPENING_FOLLOWUPS.level28, P12_OPENING_TYPES_VERDANT);
    expect(results).toHaveLength(25);
    expect(results.filter((r) => r.status === 'won').length).toBeGreaterThanOrEqual(5);
  });
});
