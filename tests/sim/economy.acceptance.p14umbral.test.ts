import { describe, expect, it } from 'vitest';
import { CONTENT, LEVELS } from '../../src/content';
import { offsetToAxial } from '../../src/content/levelUtils';
import type { Axial } from '../../src/sim/hex';
import { Simulation } from '../../src/sim/simulation';
import type { SimEvent, TowerState } from '../../src/sim/types';
import { placeCmd } from './helpers';

const MAX_TICKS = 30 * 60 * 12; // 12 sim-minutes safety cap

interface BuildScript {
  levelId: string;
  /** The tier-3 branch the spine tower buys once it reaches tier 2. */
  specId: string;
  /** Build order; [0] is the spine tower. All hexes are on-grid, off-path (checked against the level data). */
  build: Array<{ typeId: string; hex: Axial }>;
  /** Per-script lock floor — the biome-6 (sunShrine) margin. */
  minLives: number;
}

const SCRIPTS: BuildScript[] = [
  { levelId: 'level51', specId: 'sunZenithRay', build: [
    { typeId: 'sunShrine', hex: offsetToAxial(5, 3) },      // the tower earned at level50 IS the spine
    { typeId: 'watchSentry', hex: offsetToAxial(7, 5) },
    { typeId: 'boulderMortar', hex: offsetToAxial(11, 3) },
  ], minLives: 8 },                                           // measured: spec @ wave 3/7, won 10/20
];

interface RunResult {
  spine: TowerState;
  /** sim.waveIndex at the moment the spec purchase succeeded (-1 = never). */
  waveAtSpec: number;
  events: SimEvent[];
  sim: Simulation;
}

/**
 * Deterministic policy: every tick try purchases in priority order (first two towers →
 * spine tier 1 → tier 2 → spec → remaining towers), and early-call each wave the moment
 * the sim is back in building — banking the full countdown bonus. Seed 1 throughout.
 */
function runScript(script: BuildScript): RunResult {
  const sim = new Simulation(LEVELS[script.levelId], CONTENT, 1);
  const events: SimEvent[] = [];
  let placed = 0;
  let spineId: number | null = null;
  let waveAtSpec = -1;

  const tryPurchases = (): void => {
    while (placed < Math.min(2, script.build.length)) {
      const next = script.build[placed];
      if (!sim.applyCommand(placeCmd(next.typeId, next.hex)).ok) break;
      if (placed === 0) spineId = sim.towers[sim.towers.length - 1].id;
      placed += 1;
    }
    if (spineId === null) return;
    const spine = sim.towers.find((t) => t.id === spineId);
    if (!spine) return;
    while (spine.tier < 2 && sim.applyCommand({ type: 'upgradeTower', towerId: spineId }).ok) { /* buy tiers */ }
    if (spine.tier === 2 && spine.specId === null
        && sim.applyCommand({ type: 'chooseSpecialization', towerId: spineId, specId: script.specId }).ok) {
      waveAtSpec = sim.waveIndex;
    }
    while (spine.specId !== null && placed < script.build.length) {
      const next = script.build[placed];
      if (!sim.applyCommand(placeCmd(next.typeId, next.hex)).ok) break;
      placed += 1;
    }
  };

  for (let i = 0; i < MAX_TICKS && sim.status !== 'won' && sim.status !== 'lost'; i++) {
    tryPurchases();
    if (sim.status === 'building') sim.applyCommand({ type: 'startWave' }); // early-call: full-countdown bonus
    events.push(...sim.tick());
  }
  const spine = sim.towers.find((t) => t.id === spineId);
  if (!spine) throw new Error(`${script.levelId}: spine tower missing (sold or never placed)`);
  return { spine, waveAtSpec, events, sim };
}

describe('P14 Umbral economy acceptance (biome-legal pool)', () => {
  for (const script of SCRIPTS) {
    it(`${script.levelId} affords tier 2 AND ${script.specId} before the final wave with sensible play`, () => {
      const { spine, waveAtSpec, events, sim } = runScript(script);
      expect(spine.tier).toBe(2);
      expect(spine.specId).toBe(script.specId);
      expect(waveAtSpec).toBeGreaterThanOrEqual(0);
      // Bought strictly before the final wave started (waveIndex is the wave in
      // progress, or the last-cleared wave during a between-wave build phase).
      expect(waveAtSpec).toBeLessThan(sim.level.waves.length - 1);
      // The bonus stream is real: at least one early call banked gold.
      expect(events.some((e) => e.type === 'earlyCallBonus' && e.gold > 0)).toBe(true);
      expect(sim.status).toBe('won');
      expect(sim.lives).toBeGreaterThanOrEqual(script.minLives);
    });
  }
});
