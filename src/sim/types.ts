import type { AttackElement, ElementId } from '../content/elements';
import type { Vec2 } from './hex';
import type { BossEffect, TowerMechanic } from '../content/types';

export type SimStatus = 'building' | 'combat' | 'won' | 'lost';

/** Fully resolved effective stats for a tower (base → tiers → spec → ascension → nodes → auras). */
export interface TowerStats {
  damage: number;
  range: number;
  fireRate: number;
  mechanic: TowerMechanic;
}

/**
 * Pure-data status effects, ticked at the fixed 30 Hz step.
 * Stack-refresh semantics: reapplying an effect overwrites it (resets duration),
 * it never stacks damage. The renderer reads these for tinting (Phase 6 does it properly).
 */
export interface EnemyEffects {
  burn?: { dps: number; remaining: number };
  slow?: { factor: number; remaining: number };
  poison?: { dps: number; duration: number; remaining: number; spreadRadius: number; spread: boolean };
  vulnerability?: { multiplier: number; remaining: number };
  /** P11 boss shield: damage-immune window, blocks direct hits AND DoT ticks. */
  shield?: { remaining: number };
  /** P11 boss stealth phase: temporary stealth (ward/pierce rules still apply). */
  stealthPhase?: { remaining: number };
}

export interface EnemyState {
  id: number;
  typeId: string;
  hp: number;
  maxHp: number;
  pathDist: number;
  /** Index into Simulation.paths for the road this enemy marches. */
  pathIndex: number;
  speed: number;
  alive: boolean;
  element: ElementId;
  armor: number;
  stealth: boolean;
  effects: EnemyEffects;
  /** P11: boss ability program state, present iff the enemy's EnemyDef has `boss`. Parallel to `abilities`. */
  bossState?: { fired: boolean[]; timers: number[] };
}

/** Targeting priority. first = furthest along the path, last = closest to spawn, strong/weak = highest/lowest current hp. */
export type TargetingMode = 'first' | 'last' | 'strong' | 'weak';

/** The three free-spend minor node types on every tower instance. */
export type MinorNodeId = 'damage' | 'range' | 'rate';

export interface TowerState {
  id: number;
  typeId: string;
  pos: Vec2;
  cooldown: number;
  /** 0 = base; 1 and 2 are the purchasable tier upgrades. */
  tier: number;
  /** Chosen tier-3 specialization id; null until picked (picking requires tier 2 and is permanent). */
  specId: string | null;
  /** Minor node ranks (0–3 each), multiplicative on the resolved stats. */
  nodes: Record<MinorNodeId, number>;
  /** Lifetime shots fired — drives deterministic dual-element alternation. */
  shots: number;
  targeting: TargetingMode;
  /** P11 boss freezeTowers: ticks remaining fully inert (no cooldown decay, no firing). */
  frozenTicks: number;
  /** P11 boss curseTowers: ticks remaining with damage scaled by curseFactor. */
  curseTicks: number;
  /** P11 boss curseTowers: active damage multiplier while curseTicks > 0; 1 otherwise. */
  curseFactor: number;
  /** P11 Task 6: tier-4 ascension purchased for the chosen spec. Requires specId !== null; permanent. */
  ascended: boolean;
}

export type Command =
  | { type: 'placeTower'; towerTypeId: string; pos: Vec2 }
  | { type: 'startWave' }
  | { type: 'upgradeTower'; towerId: number }
  | { type: 'chooseSpecialization'; towerId: number; specId: string }
  | { type: 'buyMinorNode'; towerId: number; node: MinorNodeId }
  | { type: 'sellTower'; towerId: number }
  | { type: 'setTargeting'; towerId: number; mode: TargetingMode }
  | { type: 'ascendTower'; towerId: number }
  | { type: 'undo' };

export interface CommandResult {
  ok: boolean;
  error?: string;
}

export type SimEvent =
  | { type: 'towerPlaced'; towerId: number; typeId: string; pos: Vec2 }
  | { type: 'towerUpgraded'; towerId: number; tier: number }
  | { type: 'specializationChosen'; towerId: number; specId: string }
  | { type: 'minorNodeBought'; towerId: number; node: MinorNodeId; rank: number }
  | { type: 'towerSold'; towerId: number; refund: number }
  | { type: 'undoApplied'; kind: 'place' | 'upgrade' | 'spec' | 'node' | 'ascend'; towerId: number; refund: number }
  | { type: 'enemySpawned'; enemyId: number; typeId: string }
  | { type: 'enemyKilled'; enemyId: number; bounty: number }
  | { type: 'enemyLeaked'; enemyId: number; livesLost: number }
  | { type: 'towerFired'; towerId: number; enemyId: number }
  | { type: 'waveStarted'; waveIndex: number }
  | { type: 'waveCleared'; waveIndex: number }
  | { type: 'earlyCallBonus'; gold: number; remaining: number }
  | { type: 'wardIncome'; gold: number }
  | { type: 'levelWon' }
  | { type: 'levelLost' }
  | { type: 'bossAbility'; enemyId: number; effect: BossEffect['kind'] }
  | { type: 'towerAscended'; towerId: number; specId: string };

/**
 * Account-level meta-progression effects (skill tree), passed into the
 * Simulation as PLAIN DATA. Every field defaults to "no effect" —
 * `new Simulation(level, content, seed)` behaves exactly as before Phase 5.
 * Note the one asymmetric default: specializationsUnlocked defaults to TRUE
 * (a bare sim is ungated; the UI passes an explicit value from the save).
 * Tower availability is deliberately NOT here — locked towers are hidden by
 * the palette (UI-side); the sim never validates tower unlocks.
 */
export interface SimModifiers {
  /** Added to level.startingGold at construction. Default 0. */
  extraStartingGold?: number;
  /** Lives regained each time a wave clears WITH WAVES REMAINING, capped at level.lives. Default 0. */
  lifeRegenPerWave?: number;
  /** Added to level.earlyCallRate (gold per remaining second on an early call). Default 0. */
  earlyCallRateBonus?: number;
  /** Damage multiplier per TOWER element (keyed by TowerDef.element). Absent key = 1. */
  elementDamageMult?: Partial<Record<AttackElement, number>>;
  /** When false, chooseSpecialization is rejected with 'specializations locked'. Default TRUE. */
  specializationsUnlocked?: boolean;
  /** Kill-bounty multiplier: bounty × this, rounded. Default 1. */
  bountyMult?: number;
  /** Ward wave-income multiplier: income × this, floored. Default 1. */
  wardIncomeMult?: number;
  /** Extra sell-refund fraction added to SELL_REFUND_RATE, capped at 0.95. Default 0. */
  sellRefundBonus?: number;
  /** When false, ascendTower (P11 Task 6) is rejected. Default TRUE (mirrors specializationsUnlocked). */
  ascensionsUnlocked?: boolean;
}
