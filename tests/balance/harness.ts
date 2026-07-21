/**
 * Phase 7 balance harness: deterministic full-level batch runs, shared by the
 * winnability regression tests, the level02 lesson lock, and the CLI report
 * (scripts/balance-report.ts — `npm run balance`). ONE policy definition means
 * report numbers ARE the regression-test numbers. Seed 1 everywhere.
 */
import { CONTENT } from '../../src/content';
import { offsetToAxial } from '../../src/content/levelUtils';
import type { ContentDb, LevelDef } from '../../src/content/types';
import { axialToWorld, type Vec2 } from '../../src/sim/hex';
import { Simulation } from '../../src/sim/simulation';
import type { SimStatus } from '../../src/sim/types';

/** 12 sim-minutes safety cap — the same bound the P4 tests used. */
export const MAX_TICKS = 30 * 60 * 12;

/**
 * A scripted build step, tagged with a `label` so later steps (upgrades, specs)
 * can find the tower a `place` step created. Hexes are offset (col,row) pairs.
 */
export type Step =
  | { kind: 'place'; typeId: string; pos: Vec2; label: string }
  | { kind: 'upgrade'; label: string }
  | { kind: 'spec'; specId: string; label: string };

export function place(typeId: string, col: number, row: number, label: string): Step {
  // Phase 8 harness-compat contract: (col,row) maps to the HEX-CENTER world
  // position, so every pre-free-placement scripted build, opening corpus, and
  // locked margin runs the exact same sim. Locked by harness.test.ts.
  return { kind: 'place', typeId, pos: axialToWorld(offsetToAxial(col, row)), label };
}
export function upgrade(label: string): Step {
  return { kind: 'upgrade', label };
}
export function spec(specId: string, label: string): Step {
  return { kind: 'spec', specId, label };
}

/**
 * Greedy-in-priority-order execution (verbatim from the P4 winnability test):
 * every tick, scan the whole step list and fire every step that's currently
 * affordable/legal, skipping (not blocking on) any that aren't ready yet.
 * Early-calls every wave the moment the sim is back in building — banking the
 * full countdown bonus. Deterministic: driven only by sim state, seed 1.
 */
export function runSteps(
  level: LevelDef,
  steps: Step[],
  seed = 1,
  content: ContentDb = CONTENT,
  maxTicks = MAX_TICKS,
): { sim: Simulation; ticks: number } {
  const sim = new Simulation(level, content, seed);
  const towerByLabel = new Map<string, number>();
  const done = new Array(steps.length).fill(false);

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
          if (res.ok) towerByLabel.set(step.label, sim.towers[sim.towers.length - 1].id);
        } else if (step.kind === 'upgrade') {
          const id = towerByLabel.get(step.label);
          if (id === undefined) continue;
          res = sim.applyCommand({ type: 'upgradeTower', towerId: id });
        } else {
          const id = towerByLabel.get(step.label);
          if (id === undefined) continue;
          res = sim.applyCommand({ type: 'chooseSpecialization', towerId: id, specId: step.specId });
        }
        if (res.ok) {
          done[i] = true;
          progressed = true;
        }
      }
    }
  };

  let ticks = 0;
  for (let i = 0; i < maxTicks && sim.status !== 'won' && sim.status !== 'lost'; i++) {
    tryAdvance();
    if (sim.status === 'building') sim.applyCommand({ type: 'startWave' }); // early-call: full-countdown bonus
    sim.tick();
    ticks += 1;
  }
  return { sim, ticks };
}

// P11 neutral-roster winnability builds (moved off the retired element spines
// after the biome-1 conversion — Task 9 retuned every level for neutrals-only
// play). Prototype-measured at seed 1; see the P11 plan's evidence table.
export const WINNABILITY_BUILDS: Record<string, Step[]> = {
  level01: [
    place('boulderMortar', 5, 3, 'M1'), place('watchSentry', 8, 3, 'S1'),
    upgrade('M1'), upgrade('M1'), upgrade('S1'), upgrade('S1'),
    place('watchSentry', 2, 3, 'S2'), upgrade('S2'), upgrade('S2'),
    spec('mortarClusterRain', 'M1'),
  ],
  level02: [
    place('boulderMortar', 4, 3, 'M1'), place('watchSentry', 2, 2, 'S1'),
    upgrade('M1'), upgrade('M1'), spec('mortarClusterRain', 'M1'),
    place('watchSentry', 6, 4, 'S2'), upgrade('S1'), upgrade('S1'), upgrade('S2'), upgrade('S2'),
  ],
  level03: [
    place('boulderMortar', 6, 3, 'M1'), place('watchSentry', 4, 3, 'S1'),
    upgrade('M1'), upgrade('M1'), spec('mortarColossus', 'M1'),
    place('boulderMortar', 7, 5, 'M2'), upgrade('M2'), upgrade('M2'),
    upgrade('S1'), upgrade('S1'),
  ],
  level04: [
    place('watchSentry', 10, 4, 'S1'), place('wardenBeacon', 8, 4, 'W1'),
    place('boulderMortar', 4, 4, 'M1'),
    upgrade('S1'), upgrade('S1'), upgrade('M1'), upgrade('M1'),
    spec('sentryMarksman', 'S1'),
    place('watchSentry', 7, 3, 'S2'), upgrade('S2'), upgrade('S2'),
  ],
  level05: [
    place('boulderMortar', 4, 3, 'M1'), place('boulderMortar', 8, 5, 'M2'),
    upgrade('M1'), upgrade('M1'), spec('mortarClusterRain', 'M1'),
    place('wardenBeacon', 5, 5, 'W1'),
    upgrade('M2'), upgrade('M2'), spec('mortarClusterRain', 'M2'),
    place('watchSentry', 10, 4, 'S1'), upgrade('S1'), upgrade('S1'),
  ],
  level06: [
    place('watchSentry', 7, 4, 'S1'), place('boulderMortar', 4, 2, 'M1'),
    upgrade('S1'), upgrade('S1'), spec('sentryGatling', 'S1'),
    place('watchSentry', 11, 3, 'S2'), upgrade('M1'), upgrade('M1'),
    upgrade('S2'), upgrade('S2'), place('wardenBeacon', 9, 4, 'W1'),
  ],
  level07: [
    place('boulderMortar', 7, 2, 'N1'), place('boulderMortar', 10, 6, 'S1'),
    place('wardenBeacon', 9, 6, 'W1'),
    place('watchSentry', 9, 3, 'N2'),
    upgrade('N1'), upgrade('N1'), upgrade('S1'), upgrade('S1'),
    spec('mortarClusterRain', 'N1'),
    upgrade('N2'), upgrade('N2'),
    spec('mortarClusterRain', 'S1'),
    place('watchSentry', 12, 7, 'S3'), upgrade('S3'), upgrade('S3'),
  ],
  level08: [
    place('boulderMortar', 5, 2, 'N1'), place('boulderMortar', 4, 6, 'S1'),
    place('watchSentry', 6, 7, 'S2'),
    upgrade('N1'), upgrade('N1'), upgrade('S1'), upgrade('S1'),
    upgrade('S2'), upgrade('S2'),
    place('wardenBeacon', 3, 2, 'N2'),
    place('watchSentry', 4, 8, 'S3'),
    upgrade('S3'), upgrade('S3'),
    spec('mortarColossus', 'N1'),
    spec('mortarClusterRain', 'S1'),
    spec('sentryGatling', 'S2'),
    place('wardenBeacon', 8, 7, 'W2'),
  ],
  level09: [
    place('boulderMortar', 8, 4, 'M1'), place('watchSentry', 4, 2, 'S1'),
    place('wardenBeacon', 7, 4, 'W1'),
    upgrade('M1'), upgrade('M1'), spec('mortarClusterRain', 'M1'),
    place('boulderMortar', 11, 2, 'M2'), upgrade('M2'), upgrade('M2'),
    upgrade('S1'), upgrade('S1'), spec('sentryGatling', 'S1'),
    place('watchSentry', 12, 5, 'S2'), upgrade('S2'), upgrade('S2'),
    spec('mortarColossus', 'M2'),
  ],
  // The boss-focused finale build: two Marksman nests stacked on the boss river.
  level10: [
    place('boulderMortar', 4, 3, 'N1'), place('boulderMortar', 5, 7, 'S1'),
    place('watchSentry', 12, 6, 'S2'),
    upgrade('N1'), upgrade('N1'), upgrade('S1'), upgrade('S1'),
    upgrade('S2'), upgrade('S2'),
    place('wardenBeacon', 2, 3, 'N2'), place('watchSentry', 12, 3, 'N3'),
    upgrade('N3'), upgrade('N3'),
    spec('mortarColossus', 'N1'),
    spec('mortarClusterRain', 'S1'),
    spec('sentryMarksman', 'N3'),
    place('watchSentry', 9, 4, 'N4'), upgrade('N4'), upgrade('N4'),
    spec('sentryMarksman', 'N4'),
    place('watchSentry', 10, 6, 'S3'), upgrade('S3'), upgrade('S3'),
    spec('sentryGatling', 'S3'),
  ],
};

/** The three neutral starter towers — the opening-corpus pairing pool (P11). */
export const OPENING_TYPES: readonly string[] = ['watchSentry', 'boulderMortar', 'wardenBeacon'];

/** Best-coverage opening hexes per dual-road level (offset col,row) — same hexes the winnability builds open on. */
export const OPENING_HEXES: Record<'level07' | 'level08', { north: [number, number]; south: [number, number] }> = {
  level07: { north: [7, 2], south: [10, 6] },
  level08: { north: [5, 2], south: [4, 6] },
};

/** Fixed generic follow-up spine after the opening pair (P11 neutral triad, tiered up greedily). */
export const OPENING_FOLLOWUPS: Record<'level07' | 'level08', Step[]> = {
  level07: [
    place('boulderMortar', 9, 3, 'F1'), place('watchSentry', 4, 7, 'F2'), place('wardenBeacon', 9, 6, 'F3'),
    upgrade('F1'), upgrade('F1'), upgrade('F2'), upgrade('F2'), upgrade('F3'), upgrade('F3'),
  ],
  // Centered warden (6,4) reaches BOTH veins' middle legs — the fixed spine's stealth answer.
  level08: [
    place('boulderMortar', 6, 7, 'F1'), place('wardenBeacon', 6, 4, 'F2'), place('watchSentry', 4, 8, 'F3'),
    upgrade('F1'), upgrade('F1'), upgrade('F2'), upgrade('F2'), upgrade('F3'), upgrade('F3'),
  ],
};

export interface OpeningResult {
  north: string;
  south: string;
  status: SimStatus;
  lives: number;
  /** 1-based wave in progress (or last cleared) when the run ended. */
  endedAtWave: number;
}

/**
 * The P7 opening corpus: every (north, south) pairing of base towers on the
 * level's two best-coverage hexes, upgraded greedily, then a FIXED generic
 * follow-up spine. Absolute win rates are pessimistic (a human adapts the
 * follow-up to the opening); the value is COMPARATIVE — level vs level,
 * retune vs baseline, always at seed 1.
 */
export function openingCorpus(
  level: LevelDef,
  north: [number, number],
  south: [number, number],
  followUp: Step[],
  types: readonly string[] = OPENING_TYPES,
): OpeningResult[] {
  const results: OpeningResult[] = [];
  for (const n of types) {
    for (const s of types) {
      const steps: Step[] = [
        place(n, north[0], north[1], 'N1'),
        place(s, south[0], south[1], 'S1'),
        upgrade('N1'), upgrade('S1'), upgrade('N1'), upgrade('S1'),
        ...followUp,
      ];
      const { sim } = runSteps(level, steps);
      results.push({ north: n, south: s, status: sim.status, lives: sim.lives, endedAtWave: sim.waveIndex + 1 });
    }
  }
  return results;
}

/** One-line corpus digest: win count + per-pairing outcomes (W<lives>, L(w<wave>), or T(w<wave>) for a MAX_TICKS timeout). */
export function summarize(results: OpeningResult[]): string {
  const wins = results.filter((r) => r.status === 'won').length;
  const rows = results.map((r) => {
    // A run that hits MAX_TICKS ends with status still 'building'/'combat' —
    // print it as T, not L, so a future stall can't masquerade as a balance loss.
    const tag = r.status === 'won' ? `W${r.lives}` : r.status === 'lost' ? `L(w${r.endedAtWave})` : `T(w${r.endedAtWave})`;
    return `${r.north.slice(0, 4)}/${r.south.slice(0, 4)}:${tag}`;
  });
  return `${wins}/${results.length} win | ${rows.join(' ')}`;
}
