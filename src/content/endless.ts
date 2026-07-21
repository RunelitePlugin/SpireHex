/**
 * Endless free play (spec §9) — generated ENTIRELY data-side. A seeded, pure
 * generator turns a beaten campaign level into an infinite scaling wave
 * stream plus hp/bounty-scaled enemy VARIANTS in a run-local ContentDb. The
 * Simulation is untouched: it consumes these exactly like authored content.
 * Constants are prototype-tuned (see the P10 plan's evidence table): the
 * reference build clears ~27-30 waves, a minimal build ~10-12, every run
 * eventually dies. Determinism: every wave is a pure function of
 * (levelId, attempt, waveIndex) — replays and records are exact.
 */
import type { ContentDb, EnemyDef, LevelDef, WaveDef } from './types';
import { createRng } from '../sim/rng';
import { CONTENT } from './index';
import { BIOME_FAMILY, BIOME_FOR_LEVEL_CONTENT } from './biomeRoster';

/** Enemy hp multiplier per tier step. Outruns bounty growth: every run ends. */
export const ENDLESS_HP_GROWTH = 1.22;
/** Bounty multiplier per tier step. Above hp growth's income share so deep boards stay fundable. */
export const ENDLESS_BOUNTY_GROWTH = 1.28;
/** Waves per hp tier. */
export const ENDLESS_TIER_WAVES = 5;
/** Variant tiers generated up front (wave 195+ reuses the cap — academic; runs end far earlier). */
export const ENDLESS_MAX_TIER = 40;
/** Wave composition budget: BASE + PER_WAVE·waveIndex "points" spent on enemy groups. */
export const ENDLESS_BASE_POINTS = 20;
export const ENDLESS_POINTS_PER_WAVE = 5;
/** How many generated waves the level keeps ahead of the sim (see extendEndlessLevel). */
export const ENDLESS_LOOKAHEAD = 3;

/**
 * FNV-1a 32-bit string hash. Deliberately duplicated from the art-layer rand
 * module: the content tripwire bans art imports here, and the sim's rng module
 * only seeds from numbers. Six lines; locked by the seed-separation test.
 */
function fnv1a(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Per-wave PRNG seed from (levelId, attempt, wave) — the spec §9 determinism contract. */
export function endlessSeed(levelId: string, attempt: number, wave: number): number {
  return (fnv1a(`${levelId}:endless:${attempt}`) ^ Math.imul(wave + 1, 0x9e3779b9)) >>> 0;
}

/** Variant enemy id for an hp tier; tier 1 is the bare campaign enemy. */
export function variantId(baseId: string, tier: number): string {
  return tier <= 1 ? baseId : `${baseId}@${tier}`;
}

/** Strip a variant suffix — the render layer keys textures off the base id. */
export function baseEnemyId(id: string): string {
  return id.split('@')[0];
}

/** Hp tier for a 0-based wave index: +1 every ENDLESS_TIER_WAVES, capped. */
export function hpTier(wave: number): number {
  return Math.min(ENDLESS_MAX_TIER, 1 + Math.floor(wave / ENDLESS_TIER_WAVES));
}

/**
 * P11: the enemy ids this map's endless mode may send — the level's BIOME
 * FAMILY, never bosses (prototype: a single-type level roster made endless
 * degenerate — the reference build outlived the 80-wave probe cap). The
 * wave-derived fallback keeps scratch/test levels working.
 */
export function endlessRoster(base: LevelDef): string[] {
  const biome = BIOME_FOR_LEVEL_CONTENT[base.id];
  if (biome !== undefined) return [...BIOME_FAMILY[biome]].sort();
  const ids = new Set<string>();
  for (const w of base.waves) for (const e of w.entries) ids.add(e.enemyId);
  return [...ids].sort();
}

/** Budget weight of one enemy (armor-adjusted hp / 20) — heavies cost more points. */
function weightOf(def: EnemyDef): number {
  return Math.max(1, Math.round((def.hp * (1 + def.armor * 0.1)) / 20));
}

/** Base intra-group spacing by bulk: chaff streams, heavies march. */
function spacingOf(def: EnemyDef): number {
  return Math.min(0.9, Math.max(0.15, 0.2 + def.hp / 200));
}

/**
 * One generated wave: 2-4 groups sharing a linear point budget, hp tier via
 * variant ids, spacing compressing 1% per wave. Stealth rules: none before
 * wave 4 (radiant is unaffordable that early), at most one group per wave.
 * P15: `roster` overrides the draw pool (Rainbow Mode cycles it per wave);
 * the default is exactly the pre-P15 behavior — every existing lock unmoved.
 */
export function endlessWave(base: LevelDef, attempt: number, wave: number, content: ContentDb = CONTENT, roster: readonly string[] = endlessRoster(base)): WaveDef {
  const rng = createRng(endlessSeed(base.id, attempt, wave));
  const full = roster;
  const open = full.filter((id) => content.enemies[id].stealth !== true);
  let stealthLeft = wave < 4 ? 0 : 1;
  const tier = hpTier(wave);
  const points = ENDLESS_BASE_POINTS + ENDLESS_POINTS_PER_WAVE * wave;
  const groups = 2 + (wave >= 4 ? 1 : 0) + (wave >= 12 ? 1 : 0);
  const share = points / groups;
  const entries: WaveDef['entries'] = [];
  for (let g = 0; g < groups; g++) {
    const pool = stealthLeft > 0 ? full : open.length > 0 ? open : full;
    const id = pool[Math.floor(rng() * pool.length)];
    const def = content.enemies[id];
    if (def.stealth === true) stealthLeft -= 1;
    const count = Math.max(2, Math.min(30, Math.round(share / weightOf(def))));
    const spacing = Math.max(0.12, Number((spacingOf(def) * Math.pow(0.99, wave)).toFixed(3)));
    const pathIndex = base.paths.length > 1 ? Math.floor(rng() * base.paths.length) : 0;
    entries.push({ enemyId: variantId(id, tier), count, spacing, pathIndex });
  }
  return { entries };
}

/**
 * Run-local ContentDb: campaign enemies plus hp/bounty-scaled variants for
 * every roster enemy at tiers 2..ENDLESS_MAX_TIER (~200 small records, built
 * once per run). The frozen campaign CONTENT is never touched.
 */
export function endlessContent(base: LevelDef, content: ContentDb = CONTENT, roster: readonly string[] = endlessRoster(base)): ContentDb {
  const enemies: Record<string, EnemyDef> = { ...content.enemies };
  for (const id of roster) {
    const def = content.enemies[id];
    for (let t = 2; t <= ENDLESS_MAX_TIER; t++) {
      enemies[variantId(id, t)] = {
        ...def,
        id: variantId(id, t),
        hp: Math.max(1, Math.round(def.hp * Math.pow(ENDLESS_HP_GROWTH, t - 1))),
        bounty: Math.max(1, Math.round(def.bounty * Math.pow(ENDLESS_BOUNTY_GROWTH, t - 1))),
      };
    }
  }
  return { enemies, towers: content.towers };
}

/** A generated endless run-level. NOT frozen: the waves array is topped up during play. */
export interface EndlessLevel extends LevelDef {
  endless: { baseId: string; attempt: number };
}

/**
 * Build the run level: campaign geometry/economy, generated waves. The sim's
 * only win path compares waveIndex against waves.length — keeping the array
 * ENDLESS_LOOKAHEAD ahead (extendEndlessLevel on every waveStarted) makes
 * 'won' unreachable, so an endless run can only end in defeat. Sim untouched.
 */
export function makeEndlessLevel(base: LevelDef, attempt: number, content: ContentDb = CONTENT): EndlessLevel {
  const level: EndlessLevel = {
    ...base,
    id: `${base.id}-endless`,
    blurb: 'Endless — hold as long as you can.',
    hint: undefined,
    waves: [],
    endless: { baseId: base.id, attempt },
  };
  extendEndlessLevel(level, base, ENDLESS_LOOKAHEAD, content);
  return level;
}

/** Append generated waves until the level holds at least `upTo`. Pure append; idempotent. */
export function extendEndlessLevel(level: EndlessLevel, base: LevelDef, upTo: number, content: ContentDb = CONTENT): void {
  while (level.waves.length < upTo) {
    level.waves.push(endlessWave(base, level.endless.attempt, level.waves.length, content));
  }
}
