import type { AttackElement } from './elements';
import { deepFreeze } from './freeze';

/**
 * What a skill node does, as plain data. meta.ts folds these into SimModifiers.
 * The sim never reads this file directly.
 *
 * P11: `unlockTower` is gone — unlocks now come from boss kills (biomeRoster,
 * Task 8), not skill points. Repurposed nodes became economy/damage
 * enhancements. `elementDamage.element` is now an AttackElement (neutral
 * mastery lines exist alongside the six elemental ones).
 */
export type SkillEffect =
  | { kind: 'startingGold'; goldPerRank: number }
  | { kind: 'lifeRegen'; livesPerWave: number }
  | { kind: 'earlyCallRate'; bonusPerRank: number }
  | { kind: 'elementDamage'; element: AttackElement; multPerRank: number }
  | { kind: 'specAccess' }
  | { kind: 'ascensionAccess' }
  | { kind: 'bountyMult'; multPerRank: number } // kill bounties × (1 + mult·ranks), rounded
  | { kind: 'wardIncomeMult'; multPerRank: number } // ward wave income × (1 + mult·ranks), floored
  | { kind: 'sellRefundBonus'; bonusPerRank: number }; // SELL_REFUND_RATE + bonus, capped 0.95

export interface SkillNodeDef {
  id: string;
  name: string;
  /** One-line description shown on the skill-tree card (≤ 60 chars). */
  desc: string;
  tier: 1 | 2 | 3 | 4;
  maxRanks: number;
  /** Skill points per rank (all current nodes cost 1). */
  costPerRank: number;
  effect: SkillEffect;
  /**
   * Present = the node can be MASTERED for 1 mastery point: the effect is
   * replaced by this stronger one for ALL owned ranks. Same kind, bigger numbers.
   */
  mastery?: { desc: string; effect: SkillEffect };
}

/** Skill points that must be SPENT in LOWER tiers before a node of this tier can be bought. */
export const TIER_REQUIREMENTS: Record<2 | 3 | 4, number> = { 2: 3, 3: 8, 4: 14 };

/**
 * Towers available with a fresh profile. P11: element towers no longer start
 * unlocked — they're earned by killing each biome's finale boss (Task 8,
 * meta.ts unlockedTowers). These three neutrals are all a new save has.
 */
export const DEFAULT_UNLOCKED_TOWERS: readonly string[] = deepFreeze(['watchSentry', 'boulderMortar', 'wardenBeacon']);

export const SKILL_TREE: readonly SkillNodeDef[] = deepFreeze([
  // ---- Tier 1: the basics ----
  {
    id: 'prospecting', name: 'Prospecting', desc: '+20 starting gold per rank.',
    tier: 1, maxRanks: 2, costPerRank: 1, effect: { kind: 'startingGold', goldPerRank: 20 },
    mastery: { desc: '+30 starting gold per rank.', effect: { kind: 'startingGold', goldPerRank: 30 } },
  },
  {
    id: 'fieldMedicine', name: 'Field Medicine', desc: 'Regain 1 life after each cleared wave.',
    tier: 1, maxRanks: 1, costPerRank: 1, effect: { kind: 'lifeRegen', livesPerWave: 1 },
    mastery: { desc: 'Regain 2 lives after each cleared wave.', effect: { kind: 'lifeRegen', livesPerWave: 2 } },
  },
  {
    id: 'boldCommander', name: 'Bold Commander', desc: '+1 gold/s early-call bonus rate.',
    tier: 1, maxRanks: 1, costPerRank: 1, effect: { kind: 'earlyCallRate', bonusPerRank: 1 },
    mastery: { desc: '+2 gold/s early-call bonus rate.', effect: { kind: 'earlyCallRate', bonusPerRank: 2 } },
  },
  {
    id: 'neutralDrills', name: 'Neutral Drills', desc: 'Neutral towers deal +5% damage per rank.',
    tier: 1, maxRanks: 2, costPerRank: 1, effect: { kind: 'elementDamage', element: 'neutral', multPerRank: 0.05 },
    mastery: { desc: 'Neutral towers deal +8% damage per rank.', effect: { kind: 'elementDamage', element: 'neutral', multPerRank: 0.08 } },
  },
  {
    id: 'scavenger', name: 'Scavenger', desc: 'Kill bounties pay +4% per rank.',
    tier: 1, maxRanks: 2, costPerRank: 1, effect: { kind: 'bountyMult', multPerRank: 0.04 },
    mastery: { desc: 'Kill bounties pay +6% per rank.', effect: { kind: 'bountyMult', multPerRank: 0.06 } },
  },
  {
    id: 'salvage', name: 'Salvage', desc: 'Selling refunds +10% of invested gold.',
    tier: 1, maxRanks: 1, costPerRank: 1, effect: { kind: 'sellRefundBonus', bonusPerRank: 0.1 },
    mastery: { desc: 'Selling refunds +15% of invested gold.', effect: { kind: 'sellRefundBonus', bonusPerRank: 0.15 } },
  },
  {
    id: 'wardenTithe', name: "Warden's Tithe", desc: 'Ward towers earn +15% gold per rank.',
    tier: 1, maxRanks: 2, costPerRank: 1, effect: { kind: 'wardIncomeMult', multPerRank: 0.15 },
    mastery: { desc: 'Ward towers earn +25% gold per rank.', effect: { kind: 'wardIncomeMult', multPerRank: 0.25 } },
  },
  // ---- Tier 2: specialization + element mastery ----
  {
    id: 'specializations', name: 'Specializations', desc: 'Unlock tier-3 tower specializations.',
    tier: 2, maxRanks: 1, costPerRank: 1, effect: { kind: 'specAccess' },
  },
  {
    id: 'fireMastery', name: 'Fire Mastery', desc: 'Fire towers deal +5% damage per rank.',
    tier: 2, maxRanks: 2, costPerRank: 1, effect: { kind: 'elementDamage', element: 'fire', multPerRank: 0.05 },
    mastery: { desc: 'Fire towers deal +8% damage per rank.', effect: { kind: 'elementDamage', element: 'fire', multPerRank: 0.08 } },
  },
  {
    id: 'frostMastery', name: 'Frost Mastery', desc: 'Frost towers deal +5% damage per rank.',
    tier: 2, maxRanks: 2, costPerRank: 1, effect: { kind: 'elementDamage', element: 'frost', multPerRank: 0.05 },
    mastery: { desc: 'Frost towers deal +8% damage per rank.', effect: { kind: 'elementDamage', element: 'frost', multPerRank: 0.08 } },
  },
  {
    id: 'natureMastery', name: 'Nature Mastery', desc: 'Nature towers deal +5% damage per rank.',
    tier: 2, maxRanks: 2, costPerRank: 1, effect: { kind: 'elementDamage', element: 'nature', multPerRank: 0.05 },
    mastery: { desc: 'Nature towers deal +8% damage per rank.', effect: { kind: 'elementDamage', element: 'nature', multPerRank: 0.08 } },
  },
  {
    id: 'stormMastery', name: 'Storm Mastery', desc: 'Storm towers deal +5% damage per rank.',
    tier: 2, maxRanks: 2, costPerRank: 1, effect: { kind: 'elementDamage', element: 'storm', multPerRank: 0.05 },
    mastery: { desc: 'Storm towers deal +8% damage per rank.', effect: { kind: 'elementDamage', element: 'storm', multPerRank: 0.08 } },
  },
  {
    id: 'radiantMastery', name: 'Radiant Mastery', desc: 'Radiant towers deal +5% damage per rank.',
    tier: 2, maxRanks: 2, costPerRank: 1, effect: { kind: 'elementDamage', element: 'radiant', multPerRank: 0.05 },
    mastery: { desc: 'Radiant towers deal +8% damage per rank.', effect: { kind: 'elementDamage', element: 'radiant', multPerRank: 0.08 } },
  },
  {
    id: 'shadowMastery', name: 'Shadow Mastery', desc: 'Shadow towers deal +5% damage per rank.',
    tier: 2, maxRanks: 2, costPerRank: 1, effect: { kind: 'elementDamage', element: 'shadow', multPerRank: 0.05 },
    mastery: { desc: 'Shadow towers deal +8% damage per rank.', effect: { kind: 'elementDamage', element: 'shadow', multPerRank: 0.08 } },
  },
  {
    id: 'prospectingII', name: 'Deep Prospecting', desc: '+30 starting gold per rank.',
    tier: 2, maxRanks: 2, costPerRank: 1, effect: { kind: 'startingGold', goldPerRank: 30 },
  },
  // ---- Tier 3: deeper lines ----
  {
    id: 'fireMasteryII', name: 'Fire Mastery II', desc: 'Fire towers deal a further +8% per rank.',
    tier: 3, maxRanks: 2, costPerRank: 1, effect: { kind: 'elementDamage', element: 'fire', multPerRank: 0.08 },
  },
  {
    id: 'frostMasteryII', name: 'Frost Mastery II', desc: 'Frost towers deal a further +8% per rank.',
    tier: 3, maxRanks: 2, costPerRank: 1, effect: { kind: 'elementDamage', element: 'frost', multPerRank: 0.08 },
  },
  {
    id: 'natureMasteryII', name: 'Nature Mastery II', desc: 'Nature towers deal a further +8% per rank.',
    tier: 3, maxRanks: 2, costPerRank: 1, effect: { kind: 'elementDamage', element: 'nature', multPerRank: 0.08 },
  },
  {
    id: 'stormMasteryII', name: 'Storm Mastery II', desc: 'Storm towers deal a further +8% per rank.',
    tier: 3, maxRanks: 2, costPerRank: 1, effect: { kind: 'elementDamage', element: 'storm', multPerRank: 0.08 },
  },
  {
    id: 'radiantMasteryII', name: 'Radiant Mastery II', desc: 'Radiant towers deal a further +8% per rank.',
    tier: 3, maxRanks: 2, costPerRank: 1, effect: { kind: 'elementDamage', element: 'radiant', multPerRank: 0.08 },
  },
  {
    id: 'shadowMasteryII', name: 'Shadow Mastery II', desc: 'Shadow towers deal a further +8% per rank.',
    tier: 3, maxRanks: 2, costPerRank: 1, effect: { kind: 'elementDamage', element: 'shadow', multPerRank: 0.08 },
  },
  {
    id: 'neutralDrillsII', name: 'Neutral Drills II', desc: 'Neutral towers deal a further +6% per rank.',
    tier: 3, maxRanks: 2, costPerRank: 1, effect: { kind: 'elementDamage', element: 'neutral', multPerRank: 0.06 },
  },
  {
    id: 'fieldMedicineII', name: 'Field Surgery', desc: 'Regain 1 more life after each cleared wave.',
    tier: 3, maxRanks: 1, costPerRank: 1, effect: { kind: 'lifeRegen', livesPerWave: 1 },
  },
  {
    id: 'boldCommanderII', name: 'War Tempo', desc: '+2 gold/s early-call bonus rate.',
    tier: 3, maxRanks: 1, costPerRank: 1, effect: { kind: 'earlyCallRate', bonusPerRank: 2 },
  },
  {
    id: 'scavengerII', name: 'Plunderer', desc: 'Kill bounties pay a further +5% per rank.',
    tier: 3, maxRanks: 2, costPerRank: 1, effect: { kind: 'bountyMult', multPerRank: 0.05 },
  },
  {
    id: 'wardenTitheII', name: 'Golden Wards', desc: 'Ward towers earn a further +30% gold.',
    tier: 3, maxRanks: 1, costPerRank: 1, effect: { kind: 'wardIncomeMult', multPerRank: 0.3 },
  },
  // ---- Tier 4: capstones ----
  {
    id: 'ascensions', name: 'Ascensions', desc: 'Unlock tier-4 tower ascensions.',
    tier: 4, maxRanks: 1, costPerRank: 1, effect: { kind: 'ascensionAccess' },
  },
  {
    id: 'goldenAge', name: 'Golden Age', desc: '+100 starting gold.',
    tier: 4, maxRanks: 1, costPerRank: 1, effect: { kind: 'startingGold', goldPerRank: 100 },
  },
  {
    id: 'bountyLord', name: 'Bounty Lord', desc: 'Kill bounties pay a further +10%.',
    tier: 4, maxRanks: 1, costPerRank: 1, effect: { kind: 'bountyMult', multPerRank: 0.1 },
  },
  {
    id: 'ironConstitution', name: 'Iron Constitution', desc: 'Regain 2 more lives after each cleared wave.',
    tier: 4, maxRanks: 1, costPerRank: 1, effect: { kind: 'lifeRegen', livesPerWave: 2 },
  },
  {
    id: 'timeIsGold', name: 'Time Is Gold', desc: '+3 gold/s early-call bonus rate.',
    tier: 4, maxRanks: 1, costPerRank: 1, effect: { kind: 'earlyCallRate', bonusPerRank: 3 },
  },
  {
    id: 'neutralParagon', name: 'Neutral Paragon', desc: 'Neutral towers deal a further +10% damage.',
    tier: 4, maxRanks: 1, costPerRank: 1, effect: { kind: 'elementDamage', element: 'neutral', multPerRank: 0.1 },
  },
]);

/** Lookup by node id (same frozen objects as SKILL_TREE). */
export const SKILL_NODES: Record<string, SkillNodeDef> = deepFreeze(
  Object.fromEntries(SKILL_TREE.map((n) => [n.id, n])),
);
