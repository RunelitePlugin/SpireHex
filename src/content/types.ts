import type { Axial } from '../sim/hex';
import type { AttackElement, ElementId } from './elements';

export interface EnemyDef {
  id: string;
  name: string;
  hp: number;
  speed: number;
  bounty: number;
  livesCost: number;
  element: ElementId;
  /** Flat damage reduction applied AFTER the element multiplier; hits always deal at least 1. */
  armor: number;
  /** Stealthed enemies are untargetable except by 'pierce' (radiant) towers. */
  stealth?: boolean;
  /** P11: boss ability program — threshold/timer triggers driving the 8 boss effects. */
  boss?: BossDef;
}

/** P11 boss ability triggers. hpThreshold fires ONCE when hp/maxHp first drops to/below pct; timer fires every periodTicks ticks, first fire after one full period. */
export type BossTrigger =
  | { kind: 'hpThreshold'; pct: number }      // fires ONCE when hp/maxHp first ≤ pct
  | { kind: 'timer'; periodTicks: number };   // fires every periodTicks ticks, first fire after one full period

/** P11 boss abilities. Data-driven, deterministic, zero RNG. */
export type BossEffect =
  | { kind: 'split'; spawnId: string; count: number }      // spawn count at the boss's position, trailing behind
  | { kind: 'spawnAdds'; spawnId: string; count: number }  // same mechanics, different read (regen bosses)
  | { kind: 'regen'; amount: number }                      // heal, capped at maxHp
  | { kind: 'blink'; distance: number }                    // jump forward `distance` world units
  | { kind: 'freezeTowers'; radius: number; durationTicks: number }   // towers in radius stop firing
  | { kind: 'shield'; durationTicks: number }              // damage-immune window (direct hits AND DoT)
  | { kind: 'stealthPhase'; durationTicks: number }        // temporarily stealthed (ward/pierce rules apply)
  | { kind: 'curseTowers'; radius: number; damageFactor: number; durationTicks: number }; // towers deal ×factor

export interface BossAbilityDef { trigger: BossTrigger; effect: BossEffect; }
export interface BossDef { abilities: BossAbilityDef[]; }

/** Per-element signature mechanic parameters. Data only — sim logic reads these, never hardcodes them. */
export type TowerMechanic =
  | { kind: 'none' }
  | { kind: 'burn'; dps: number; duration: number }
  | { kind: 'slow'; factor: number; duration: number }
  | { kind: 'poison'; dps: number; duration: number; spreadRadius: number }
  | { kind: 'chain'; targets: number; radius: number; falloff: number }
  | { kind: 'pierce' }
  | { kind: 'curse'; currentHpPct: number; vulnMultiplier: number; vulnDuration: number }
  /**
   * Hybrid: the tower ALTERNATES element every shot (driven by TowerState.shots —
   * even counts fire elements[0], odd fire elements[1]; fully deterministic).
   * No on-hit status, no armor pierce, and it does NOT reveal stealth.
   */
  | { kind: 'dualElement'; elements: [ElementId, ElementId] }
  /**
   * Support: the tower never shoots. Every OTHER tower within `radius`
   * (center-to-center world distance) gets fireRate × (1 + fireRateBonus).
   * Multiple auras compose multiplicatively.
   */
  | { kind: 'aura'; radius: number; fireRateBonus: number }
  /** P11 neutral splash: full damage to the target, damage × falloff to every other enemy within radius of the impact. */
  | { kind: 'splash'; radius: number; falloff: number }
  /** P11 neutral utility: never shoots; reveals stealth within revealRadius; pays goldPerWave on each wave clear (not the last). */
  | { kind: 'ward'; revealRadius: number; goldPerWave: number };

/** Tier-4 capstone: absolute stats replacing the spec's; mechanic omitted = inherit the spec's. */
export interface AscensionDef {
  id: string;
  name: string;
  cost: number;
  damage: number;
  range: number;
  fireRate: number;
  mechanic?: TowerMechanic;
}

/** A tier-3 exclusive specialization: absolute stats (like a tier) plus its own mechanic. */
export interface SpecDef {
  id: string;
  name: string;
  cost: number;
  damage: number;
  range: number;
  fireRate: number;
  mechanic: TowerMechanic;
  /** P11 Task 6: tier-4 capstone, permanent once purchased via ascendTower. */
  ascension: AscensionDef;
}

/** Absolute stats replacing the previous tier's; mechanic omitted = inherit from the tier below/base. */
export interface TowerTierDef {
  cost: number;
  damage: number;
  range: number;
  fireRate: number;
  mechanic?: TowerMechanic;
}

export interface TowerDef {
  id: string;
  name: string;
  element: AttackElement;
  cost: number;
  range: number;
  damage: number;
  fireRate: number;
  mechanic: TowerMechanic;
  /** Exactly two purchasable tier upgrades (tier 1 and tier 2). */
  tiers: [TowerTierDef, TowerTierDef];
  /**
   * Exactly four tier-3 specializations; the player picks ONE per tower
   * instance (requires tier 2), which locks the other three.
   */
  specializations: [SpecDef, SpecDef, SpecDef, SpecDef];
}

export interface WaveEntry {
  enemyId: string;
  count: number;
  spacing: number;
  /** Index into LevelDef.paths for the road this group marches. Omitted = 0. */
  pathIndex?: number;
}

export interface WaveDef {
  entries: WaveEntry[];
}

export interface LevelDef {
  id: string;
  name: string;
  /** One-line descriptor shown on the level-select card (≤ 48 chars). */
  blurb: string;
  /**
   * Tactical hint (spec §6): present IFF this level debuts an enemy type
   * (enforced by tests/content/hints.test.ts, debut set derived from waves).
   * ≤ 60 chars, one line. Shown small on the level card and as a quiet
   * auto-fading banner at battle start.
   */
  hint?: string;
  hexes: Axial[];
  pathHexes: Axial[];
  /** One waypoint chain per road. Every level has at least one; multi-path maps have several. */
  paths: Axial[][];
  startingGold: number;
  lives: number;
  /** Seconds after a wave clears before the next wave auto-starts. The FIRST wave never auto-starts. */
  waveCountdown: number;
  /** Early-call bonus rate: gold per remaining countdown second (total floored) when the player calls the wave early. */
  earlyCallRate: number;
  waves: WaveDef[];
}

export interface ContentDb {
  enemies: Record<string, EnemyDef>;
  towers: Record<string, TowerDef>;
}
