import { CAMPAIGN } from '../content';
import type { SaveData } from './save';
import { BIOME_FOR_LEVEL_CONTENT, BIOME_TOWER_UNLOCK } from '../content/biomeRoster';
import { DEFAULT_UNLOCKED_TOWERS, SKILL_NODES, SKILL_TREE, TIER_REQUIREMENTS } from '../content/skilltree';
import type { SimModifiers } from '../sim/types';

/**
 * Pure meta-progression math: XP curve, point balances, attempt results.
 * Phaser-free plain TS — node-testable. Never mutates a SaveData input;
 * every function that "changes" the save returns a fresh object.
 */

/** Going from account level n to n+1 costs XP_PER_LEVEL_STEP × min(n, XP_STEP_CAP). */
export const XP_PER_LEVEL_STEP = 100;

/** Step cost stops growing past this level — P11 re-fit for the 60-level campaign + 32-node tree. */
export const XP_STEP_CAP = 12;

/** Winning with at least this many lives earns the once-per-level highLives mastery point. */
export const HIGH_LIVES_THRESHOLD = 18;

/**
 * Total XP to REACH level n: triangular to the cap, linear after. P11 re-fit
 * for 60 levels. For any xp the new level is ≥ the old (steps only got
 * cheaper) — existing saves need no migration, players only gain.
 */
export function totalXpForLevel(n: number): number {
  const c = XP_STEP_CAP;
  if (n <= c + 1) return (XP_PER_LEVEL_STEP * n * (n - 1)) / 2;
  return (XP_PER_LEVEL_STEP * (c + 1) * c) / 2 + XP_PER_LEVEL_STEP * c * (n - c - 1);
}

/** The account level a lifetime XP total puts you at (level 1 at 0 XP). */
export function accountLevelForXp(xp: number): number {
  let level = 1;
  while (totalXpForLevel(level + 1) <= xp) level += 1;
  return level;
}

/** One-time first-clear XP for campaign level INDEX i (0-based): 100, 125, ..., 325. */
export function firstClearXp(levelIndex: number): number {
  return 100 + 25 * levelIndex;
}

/** Each account level past the first grants 1 skill point. */
export function earnedSkillPoints(save: SaveData): number {
  return accountLevelForXp(save.xp) - 1;
}

/** Sum of ranks bought across every skill-tree node. */
export function spentSkillPointsTotal(save: SaveData): number {
  return Object.values(save.spentSkillPoints).reduce((sum, ranks) => sum + ranks, 0);
}

/** Skill points earned but not yet spent on any node rank. */
export function availableSkillPoints(save: SaveData): number {
  return earnedSkillPoints(save) - spentSkillPointsTotal(save);
}

/** One mastery point per true flag across all levels (>=18-lives clears and no-leak clears). */
export function earnedMasteryPoints(save: SaveData): number {
  let points = 0;
  for (const flags of Object.values(save.masteryFlags)) {
    points += (flags.highLives ? 1 : 0) + (flags.noLeak ? 1 : 0);
  }
  return points;
}

/** Mastery points earned but not yet spent mastering any node. */
export function availableMasteryPoints(save: SaveData): number {
  return earnedMasteryPoints(save) - save.masteredNodes.length;
}

export type MasteryAward = 'highLives' | 'noLeak';

export interface AttemptOutcome {
  won: boolean;
  /** Simulation.goldEarned — kill bounties only. */
  goldEarned: number;
  livesRemaining: number;
  /** True if ANY enemy leaked this attempt (BattleScene counts enemyLeaked events). */
  leaked: boolean;
}

export interface AttemptSummary {
  xpEarned: number;
  firstClear: boolean;
  /** Account levels gained by this attempt (= skill points gained). */
  levelsGained: number;
  masteryEarned: MasteryAward[];
  /** Set only when this win unlocked a new element tower (idempotent — omitted on repeat wins). */
  towerUnlocked?: string;
}

// P11: a biome finale is the last level keyed to its biome; winning it unlocks the biome's element tower.
function finaleUnlock(levelId: string): string | null {
  const biome = BIOME_FOR_LEVEL_CONTENT[levelId];
  if (biome === undefined) return null;
  const ids = Object.entries(BIOME_FOR_LEVEL_CONTENT).filter(([, b]) => b === biome).map(([id]) => id);
  return levelId === ids[ids.length - 1] ? BIOME_TOWER_UNLOCK[biome] : null;
}

/**
 * Fold one battle attempt into the save. XP flows from EVERY attempt (win or
 * lose); first-clear bonus and mastery awards require a win and pay once per level.
 */
export function applyAttempt(
  save: SaveData,
  levelId: string,
  outcome: AttemptOutcome,
): { save: SaveData; summary: AttemptSummary } {
  const levelBefore = accountLevelForXp(save.xp);
  const firstClear = outcome.won && !save.firstClears.includes(levelId);
  // Only campaign levels reach here (BattleScene plays CAMPAIGN entries); the
  // max(0, ...) guard keeps a hypothetical unknown id from going negative.
  const levelIndex = Math.max(0, CAMPAIGN.findIndex((l) => l.id === levelId));
  const xpEarned = outcome.goldEarned + (firstClear ? firstClearXp(levelIndex) : 0);

  const flags = save.masteryFlags[levelId] ?? { highLives: false, noLeak: false };
  const masteryEarned: MasteryAward[] = [];
  if (outcome.won && outcome.livesRemaining >= HIGH_LIVES_THRESHOLD && !flags.highLives) masteryEarned.push('highLives');
  if (outcome.won && !outcome.leaked && !flags.noLeak) masteryEarned.push('noLeak');

  const unlock = outcome.won ? finaleUnlock(levelId) : null;
  const towerUnlocked = unlock !== null && !save.unlockedElementTowers.includes(unlock) ? unlock : undefined;

  const next: SaveData = {
    ...save,
    xp: save.xp + xpEarned,
    firstClears: firstClear ? [...save.firstClears, levelId] : save.firstClears,
    masteryFlags:
      masteryEarned.length > 0
        ? {
            ...save.masteryFlags,
            [levelId]: {
              highLives: flags.highLives || masteryEarned.includes('highLives'),
              noLeak: flags.noLeak || masteryEarned.includes('noLeak'),
            },
          }
        : save.masteryFlags,
    unlockedElementTowers:
      towerUnlocked !== undefined ? [...save.unlockedElementTowers, towerUnlocked] : save.unlockedElementTowers,
  };
  return {
    save: next,
    summary: {
      xpEarned,
      firstClear,
      levelsGained: accountLevelForXp(next.xp) - levelBefore,
      masteryEarned,
      ...(towerUnlocked !== undefined ? { towerUnlocked } : {}),
    },
  };
}

/** Skill points spent in tiers BELOW `tier` (gates buying into `tier`). */
export function pointsSpentBelowTier(save: SaveData, tier: 2 | 3 | 4): number {
  return SKILL_TREE.filter((n) => n.tier < tier).reduce(
    (sum, n) => sum + (save.spentSkillPoints[n.id] ?? 0) * n.costPerRank,
    0,
  );
}

export type PurchaseResult = { ok: true; save: SaveData } | { ok: false; error: string };

/** Buy one rank of a node. Pure: returns a new save on success. */
export function buyNode(save: SaveData, nodeId: string): PurchaseResult {
  const node = SKILL_NODES[nodeId];
  if (!node) return { ok: false, error: `unknown node: ${nodeId}` };
  const ranks = save.spentSkillPoints[nodeId] ?? 0;
  if (ranks >= node.maxRanks) return { ok: false, error: 'node at max rank' };
  if (node.tier !== 1) {
    const required = TIER_REQUIREMENTS[node.tier];
    if (pointsSpentBelowTier(save, node.tier) < required) {
      return { ok: false, error: `requires ${required} points spent in lower tiers` };
    }
  }
  if (availableSkillPoints(save) < node.costPerRank) return { ok: false, error: 'not enough skill points' };
  return {
    ok: true,
    save: { ...save, spentSkillPoints: { ...save.spentSkillPoints, [nodeId]: ranks + 1 } },
  };
}

/** Spend 1 mastery point to upgrade an owned masterable node. Pure. */
export function masterNode(save: SaveData, nodeId: string): PurchaseResult {
  const node = SKILL_NODES[nodeId];
  if (!node) return { ok: false, error: `unknown node: ${nodeId}` };
  if (!node.mastery) return { ok: false, error: 'node cannot be mastered' };
  if ((save.spentSkillPoints[nodeId] ?? 0) === 0) return { ok: false, error: 'buy the node first' };
  if (save.masteredNodes.includes(nodeId)) return { ok: false, error: 'already mastered' };
  if (availableMasteryPoints(save) < 1) return { ok: false, error: 'not enough mastery points' };
  return { ok: true, save: { ...save, masteredNodes: [...save.masteredNodes, nodeId] } };
}

/**
 * Fold the owned skill tree into plain-data SimModifiers. Every field is set
 * EXPLICITLY — in particular specializationsUnlocked/ascensionsUnlocked are
 * false until their respective gate node is owned (the sim's own defaults
 * are true; the UI must always pass this built object so the gates apply).
 */
export function buildModifiers(save: SaveData): SimModifiers {
  let extraStartingGold = 0;
  let lifeRegenPerWave = 0;
  let earlyCallRateBonus = 0;
  let specializationsUnlocked = false;
  let bountyMult = 1;
  let wardIncomeMult = 1;
  let sellRefundBonus = 0;
  let ascensionsUnlocked = false;
  const elementDamageMult: NonNullable<SimModifiers['elementDamageMult']> = {};
  for (const node of SKILL_TREE) {
    const ranks = save.spentSkillPoints[node.id] ?? 0;
    if (ranks === 0) continue;
    const effect = save.masteredNodes.includes(node.id) && node.mastery ? node.mastery.effect : node.effect;
    switch (effect.kind) {
      case 'startingGold':
        extraStartingGold += effect.goldPerRank * ranks;
        break;
      case 'lifeRegen':
        lifeRegenPerWave += effect.livesPerWave * ranks;
        break;
      case 'earlyCallRate':
        earlyCallRateBonus += effect.bonusPerRank * ranks;
        break;
      case 'elementDamage':
        elementDamageMult[effect.element] = (elementDamageMult[effect.element] ?? 1) * (1 + effect.multPerRank * ranks);
        break;
      case 'specAccess':
        specializationsUnlocked = true;
        break;
      case 'bountyMult':
        bountyMult *= 1 + effect.multPerRank * ranks;
        break;
      case 'wardIncomeMult':
        wardIncomeMult *= 1 + effect.multPerRank * ranks;
        break;
      case 'sellRefundBonus':
        sellRefundBonus += effect.bonusPerRank * ranks;
        break;
      case 'ascensionAccess':
        ascensionsUnlocked = true;
        break;
      default: {
        // Exhaustiveness guard: a new SkillEffect kind without a case is a compile error.
        const exhaustive: never = effect;
        throw new Error(`unhandled skill effect: ${JSON.stringify(exhaustive)}`);
      }
    }
  }
  return {
    extraStartingGold,
    lifeRegenPerWave,
    earlyCallRateBonus,
    elementDamageMult,
    specializationsUnlocked,
    bountyMult,
    wardIncomeMult,
    sellRefundBonus,
    ascensionsUnlocked,
  };
}

/** Endless XP per cleared wave w (1-based): 10, 12, 14… capped at 40. */
export const ENDLESS_WAVE_XP_BASE = 10;
export const ENDLESS_WAVE_XP_STEP = 2;
export const ENDLESS_WAVE_XP_CAP = 40;
/** Waves at or below your previous best pay 20% — farming tapers, pushing pays (spec §9). */
export const ENDLESS_REFARM_RATE = 0.2;

export function endlessWaveXp(wave: number): number {
  return Math.min(ENDLESS_WAVE_XP_CAP, ENDLESS_WAVE_XP_BASE + ENDLESS_WAVE_XP_STEP * (wave - 1));
}

/** Total XP for a run that cleared `wavesCleared` waves against a previous best. */
export function endlessRunXp(wavesCleared: number, prevBest: number): number {
  let xp = 0;
  for (let w = 1; w <= wavesCleared; w++) {
    xp += endlessWaveXp(w) * (w > prevBest ? 1 : ENDLESS_REFARM_RATE);
  }
  return Math.round(xp);
}

export interface EndlessSummary {
  xpEarned: number;
  newRecord: boolean;
  bestWave: number;
}

/** Fold a finished endless run into the save. Pure. No first-clear, no mastery — endless is the side dish. */
export function applyEndlessAttempt(
  save: SaveData,
  levelId: string,
  wavesCleared: number,
): { save: SaveData; summary: EndlessSummary } {
  const rec = save.endless[levelId] ?? { bestWave: 0, runs: 0 };
  const xpEarned = endlessRunXp(wavesCleared, rec.bestWave);
  const newRecord = wavesCleared > rec.bestWave;
  const bestWave = Math.max(rec.bestWave, wavesCleared);
  return {
    save: {
      ...save,
      xp: save.xp + xpEarned,
      endless: { ...save.endless, [levelId]: { ...rec, bestWave } },
    },
    summary: { xpEarned, newRecord, bestWave },
  };
}

/**
 * P15: Rainbow Mode gate (spec §9) — unlocked once EVERY campaign level has a
 * first clear ("completing all six biomes"). firstClears, not unlockedLevels:
 * recordWin caps at CAMPAIGN.length and would hide the final level's clear
 * (the same trap the endless button dodged in P10).
 */
export function rainbowUnlocked(save: SaveData): boolean {
  return CAMPAIGN.every((l) => save.firstClears.includes(l.id));
}

/** Bump the run counter BEFORE play: attempt N is reproducible forever from (levelId, N). Pure. */
export function recordEndlessRunStart(save: SaveData, levelId: string): { save: SaveData; attempt: number } {
  const rec = save.endless[levelId] ?? { bestWave: 0, runs: 0 };
  const attempt = rec.runs + 1;
  return {
    save: { ...save, endless: { ...save.endless, [levelId]: { ...rec, runs: attempt } } },
    attempt,
  };
}

/**
 * Tower ids the palette may show. P11: skill-tree unlock nodes are gone —
 * element towers unlock via boss kills, recorded in the save's
 * unlockedElementTowers (Task 8: applyAttempt, save.ts migration).
 */
export function unlockedTowers(save: SaveData): string[] {
  return [...DEFAULT_UNLOCKED_TOWERS, ...save.unlockedElementTowers];
}
