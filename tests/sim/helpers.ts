import type { ContentDb, EnemyDef, LevelDef, SpecDef, TowerDef, WaveDef } from '../../src/content/types';
import { axialToWorld, type Axial } from '../../src/sim/hex';
import { Simulation } from '../../src/sim/simulation';
import type { Command, SimEvent } from '../../src/sim/types';

/** Off-path hex adjacent to the straight test path (world ≈ (124.7, -72)). */
export const TOWER_HEX: Axial = { q: 2, r: -1 };

/**
 * A straight west→east path along axial r = 0, q = 0..12 (world length ≈ 998),
 * with buildable rows at r = -1 and r = 1. Default: one 'dummy' enemy at t ≈ 0.1 s.
 */
export function straightLevel(
  waves: WaveDef[] = [{ entries: [{ enemyId: 'dummy', count: 1, spacing: 0.1 }] }],
): LevelDef {
  const hexes: Axial[] = [];
  for (let r = -1; r <= 1; r++) {
    for (let q = 0; q <= 12; q++) hexes.push({ q, r });
  }
  const path: Axial[] = [];
  for (let q = 0; q <= 12; q++) path.push({ q, r: 0 });
  return {
    id: 'testLevel', name: 'Test Level', blurb: 'Test level.',
    hexes, pathHexes: path, paths: [path],
    startingGold: 1000, lives: 20, waveCountdown: 10, earlyCallRate: 3,
    waves,
  };
}

/**
 * Two parallel west→east roads. Path 0 runs along r = 0 (q 0..12, world length ≈ 998);
 * path 1 runs along r = 2, offset one column so equal pathDist ⇒ equal world x (Δy = 144).
 * `bCols` shortens road 1 (bCols = 6 ⇒ length ≈ 499). Buildable ground on rows -1, 1, 3.
 */
export function twoPathLevel(
  waves: WaveDef[] = [{ entries: [{ enemyId: 'dummy', count: 1, spacing: 0.1 }] }],
  bCols = 12,
): LevelDef {
  const hexes: Axial[] = [];
  for (let r = -1; r <= 3; r++) {
    for (let q = -2; q <= 12; q++) hexes.push({ q, r });
  }
  const pathA: Axial[] = [];
  for (let q = 0; q <= 12; q++) pathA.push({ q, r: 0 });
  const pathB: Axial[] = [];
  for (let c = 0; c <= bCols; c++) pathB.push({ q: c - 1, r: 2 });
  return {
    id: 'twoPathLevel', name: 'Two Path Level', blurb: 'Two parallel test roads.',
    hexes, pathHexes: [...pathA, ...pathB], paths: [pathA, pathB],
    startingGold: 1000, lives: 20, waves,
    waveCountdown: 10, earlyCallRate: 3,
  };
}

/** Slow neutral crawler: takes ~100 s to cross the test path, so tests never race leaks. */
export function enemyDef(overrides: Partial<EnemyDef> = {}): EnemyDef {
  return {
    id: 'dummy', name: 'Dummy', hp: 100, speed: 10, bounty: 5, livesCost: 1,
    element: 'nature', armor: 0,
    ...overrides,
  };
}

/** Minimal specialization; override what the test cares about. specA is the cheap plain-damage default. */
export function specDef(overrides: Partial<SpecDef> = {}): SpecDef {
  return {
    id: 'specA', name: 'Spec A', cost: 150,
    damage: 80, range: 400, fireRate: 1,
    mechanic: { kind: 'none' },
    ascension: { id: 'ascSpecA', name: 'Ascended Spec A', cost: 300, damage: 160, range: 400, fireRate: 1 },
    ...overrides,
  };
}

/** Fire tower with no mechanic and long range; override what the test cares about. */
export function towerDef(overrides: Partial<TowerDef> = {}): TowerDef {
  return {
    id: 'testTower', name: 'Test Tower', element: 'fire',
    cost: 100, range: 400, damage: 10, fireRate: 1,
    mechanic: { kind: 'none' },
    tiers: [
      { cost: 50, damage: 20, range: 400, fireRate: 1 },
      { cost: 60, damage: 40, range: 400, fireRate: 1 },
    ],
    specializations: [
      specDef(),
      specDef({ id: 'specB', name: 'Spec B', cost: 200, damage: 60, fireRate: 2 }),
      specDef({ id: 'specC', name: 'Spec C', cost: 180, damage: 50, range: 500 }),
      specDef({ id: 'specD', name: 'Spec D', cost: 160, damage: 40, fireRate: 1.5 }),
    ],
    ...overrides,
  };
}

export function makeContent(towers: TowerDef[], enemies: EnemyDef[]): ContentDb {
  return {
    towers: Object.fromEntries(towers.map((t) => [t.id, t])),
    enemies: Object.fromEntries(enemies.map((e) => [e.id, e])),
  };
}

export function runTicks(sim: Simulation, n: number): SimEvent[] {
  const all: SimEvent[] = [];
  for (let i = 0; i < n; i++) all.push(...sim.tick());
  return all;
}

/** Free-placement sugar: a placeTower command at a hex CENTER — the pre-P8 semantics. */
export function placeCmd(towerTypeId: string, hex: Axial): Command {
  return { type: 'placeTower', towerTypeId, pos: axialToWorld(hex) };
}
