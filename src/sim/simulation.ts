import { DT, TICK_RATE, TOWER_RADIUS } from './constants';
import type { BossEffect, ContentDb, LevelDef, TowerDef, TowerMechanic } from '../content/types';
import type { AttackElement } from '../content/elements';
import { AXIAL_DIRECTIONS, axialToWorld, circleOverlapsHex, hexKey, worldToAxial, type Axial, type Vec2 } from './hex';
import { Path } from './path';
import { createRng } from './rng';
import { MINOR_NODE_BONUS, MINOR_NODE_COSTS, MINOR_NODE_IDS, SELL_REFUND_RATE } from '../content/economy';
import type { Command, CommandResult, EnemyState, MinorNodeId, SimEvent, SimModifiers, SimStatus, TargetingMode, TowerState, TowerStats } from './types';
import { computeHitDamage } from './damage';

/** Current movement speed after the slow status effect (used by sim movement AND the renderer's interpolation). */
export function effectiveSpeed(enemy: EnemyState): number {
  return enemy.effects.slow ? enemy.speed * enemy.effects.slow.factor : enemy.speed;
}

export class Simulation {
  readonly paths: Path[];
  gold: number;
  /** Total kill-bounty gold this attempt — the XP base (excludes starting gold and early-call bonuses). */
  goldEarned = 0;
  lives: number;
  status: SimStatus = 'building';
  waveIndex = -1;
  enemies: EnemyState[] = [];
  towers: TowerState[] = [];

  protected readonly rng: () => number;
  protected readonly gridKeys: Set<string>;
  protected readonly pathKeys: Set<string>;
  protected pendingEvents: SimEvent[] = [];
  protected nextId = 1;
  protected simTime = 0;
  /**
   * Ticks until the next wave auto-starts; null = no countdown (first wave, combat, or level over). Integer — never float seconds.
   * Invariant: countdownTicks !== null implies status === 'building' — it is armed only on wave-clear into building, and cleared by both consumers (the tick() auto-start and the startWave() early call).
   */
  protected countdownTicks: number | null = null;
  protected spawnQueue: Array<{ at: number; typeId: string; pathIndex: number }> = [];

  /**
   * One-deep undo record (Phase 8): the LAST build-phase purchase, undoable at
   * full refund until a wave starts. beginWave and sellTower clear it; actions
   * during combat never set it. Deterministic plain data — replays identically.
   */
  protected undoRecord:
    | { kind: 'place'; towerId: number; refund: number }
    | { kind: 'upgrade'; towerId: number; refund: number }
    | { kind: 'spec'; towerId: number; refund: number }
    | { kind: 'node'; towerId: number; node: MinorNodeId; refund: number }
    | { kind: 'ascend'; towerId: number; refund: number }
    | null = null;

  /** True when the undo button should be live (drives the UI disabled state). */
  get canUndo(): boolean {
    return this.undoRecord !== null;
  }

  /** Resolved meta-progression modifiers; all defaults reproduce pre-Phase-5 behavior exactly. */
  protected readonly mods: {
    extraStartingGold: number;
    lifeRegenPerWave: number;
    earlyCallRateBonus: number;
    elementDamageMult: Partial<Record<AttackElement, number>>;
    specializationsUnlocked: boolean;
    bountyMult: number;
    wardIncomeMult: number;
    sellRefundBonus: number;
    ascensionsUnlocked: boolean;
  };

  constructor(
    readonly level: LevelDef,
    readonly content: ContentDb,
    seed = 1,
    modifiers: SimModifiers = {},
  ) {
    if (level.paths.length === 0) throw new Error('level has no paths');
    this.mods = {
      extraStartingGold: modifiers.extraStartingGold ?? 0,
      lifeRegenPerWave: modifiers.lifeRegenPerWave ?? 0,
      earlyCallRateBonus: modifiers.earlyCallRateBonus ?? 0,
      elementDamageMult: modifiers.elementDamageMult ?? {},
      specializationsUnlocked: modifiers.specializationsUnlocked ?? true,
      bountyMult: modifiers.bountyMult ?? 1,
      wardIncomeMult: modifiers.wardIncomeMult ?? 1,
      sellRefundBonus: modifiers.sellRefundBonus ?? 0,
      ascensionsUnlocked: modifiers.ascensionsUnlocked ?? true,
    };
    this.paths = level.paths.map((chain) => new Path(chain.map(axialToWorld)));
    this.gold = level.startingGold + this.mods.extraStartingGold;
    this.lives = level.lives;
    this.rng = createRng(seed);
    this.gridKeys = new Set(level.hexes.map(hexKey));
    this.pathKeys = new Set(level.pathHexes.map(hexKey));
  }

  /** The first road — convenience for single-path levels and legacy callers. */
  get path(): Path {
    return this.paths[0];
  }

  /** World position of an enemy on ITS OWN road (lookahead lets the renderer interpolate between ticks). */
  enemyPos(enemy: EnemyState, lookahead = 0): Vec2 {
    return this.paths[enemy.pathIndex].pointAt(enemy.pathDist + lookahead);
  }

  /** Seconds until the next wave auto-starts, or null when no countdown is running. */
  get countdown(): number | null {
    return this.countdownTicks === null ? null : this.countdownTicks / TICK_RATE;
  }

  /** Gold the player would bank by calling the next wave right now: floor(remaining seconds × effective rate). */
  earlyCallBonus(): number {
    if (this.countdownTicks === null) return 0;
    return Math.floor((this.countdownTicks / TICK_RATE) * (this.level.earlyCallRate + this.mods.earlyCallRateBonus));
  }

  applyCommand(cmd: Command): CommandResult {
    switch (cmd.type) {
      case 'placeTower':
        return this.placeTower(cmd.towerTypeId, cmd.pos);
      case 'startWave':
        return this.startWave();
      case 'upgradeTower':
        return this.upgradeTower(cmd.towerId);
      case 'chooseSpecialization':
        return this.chooseSpecialization(cmd.towerId, cmd.specId);
      case 'buyMinorNode':
        return this.buyMinorNode(cmd.towerId, cmd.node);
      case 'sellTower':
        return this.sellTower(cmd.towerId);
      case 'setTargeting':
        return this.setTargeting(cmd.towerId, cmd.mode);
      case 'ascendTower':
        return this.ascendTower(cmd.towerId);
      case 'undo':
        return this.undo();
      default: {
        // Exhaustiveness guard: adding a Command variant without a case is a compile error.
        const exhaustive: never = cmd;
        return { ok: false, error: `unknown command: ${JSON.stringify(exhaustive)}` };
      }
    }
  }

  private startWave(): CommandResult {
    if (this.status !== 'building') return { ok: false, error: 'wave already active or level over' };
    if (this.waveIndex + 1 >= this.level.waves.length) return { ok: false, error: 'no waves left' };
    if (this.countdownTicks !== null) {
      // Early call (Kingdom Rush model): bonus gold scales with the countdown time skipped.
      const bonus = this.earlyCallBonus();
      this.gold += bonus;
      this.pendingEvents.push({ type: 'earlyCallBonus', gold: bonus, remaining: this.countdownTicks / TICK_RATE });
      this.countdownTicks = null;
    }
    this.beginWave(this.pendingEvents);
    return { ok: true };
  }

  /** Shared wave-start: schedules spawns and flips to combat. Callers validate preconditions. */
  private beginWave(events: SimEvent[]): void {
    this.undoRecord = null;
    this.waveIndex += 1;
    const wave = this.level.waves[this.waveIndex];
    let t = this.simTime;
    for (const entry of wave.entries) {
      for (let i = 0; i < entry.count; i++) {
        t += entry.spacing;
        this.spawnQueue.push({ at: t, typeId: entry.enemyId, pathIndex: entry.pathIndex ?? 0 });
      }
    }
    this.status = 'combat';
    events.push({ type: 'waveStarted', waveIndex: this.waveIndex });
  }

  /**
   * Free-placement validation (Phase 8) — pure, no mutation, no RNG. THE single
   * legality source: the placeTower command and the renderer's ghost tint both
   * use it, so what glows green is exactly what the sim accepts.
   *
   * Legal iff the circular footprint (TOWER_RADIUS) lies entirely on open
   * ground — the containing cell, plus every neighbor cell the circle
   * overlaps, must be on-grid and off-path — and the footprint clears every
   * existing tower (strict 2·TOWER_RADIUS center distance). Cells beyond the
   * 6 neighbors can never matter: a distance-2 cell's polygon stays ≥
   * 3·HEX_SIZE − 2·HEX_SIZE = 48 > TOWER_RADIUS away (hex.geometry tests).
   */
  validatePlacement(towerTypeId: string, pos: Vec2): CommandResult {
    // Mirror placeTower's game-over gate so the ghost can never glow green
    // for a placement the command would refuse (single-legality-source contract).
    if (this.status === 'won' || this.status === 'lost') return { ok: false, error: 'level over' };
    const def = this.content.towers[towerTypeId];
    if (!def) return { ok: false, error: `unknown tower: ${towerTypeId}` };
    if (!Number.isFinite(pos.x) || !Number.isFinite(pos.y)) return { ok: false, error: 'invalid position' };
    const cell = worldToAxial(pos.x, pos.y);
    const cells: Axial[] = [cell, ...AXIAL_DIRECTIONS.map((d) => ({ q: cell.q + d.q, r: cell.r + d.r }))];
    for (const c of cells) {
      // The containing cell is always checked (the point is in it); neighbors only if touched.
      if (c !== cell && !circleOverlapsHex(pos, TOWER_RADIUS, c)) continue;
      const key = hexKey(c);
      if (!this.gridKeys.has(key)) return { ok: false, error: 'outside grid' };
      if (this.pathKeys.has(key)) return { ok: false, error: 'on path' };
    }
    for (const t of this.towers) {
      if (Math.hypot(t.pos.x - pos.x, t.pos.y - pos.y) < TOWER_RADIUS * 2) {
        return { ok: false, error: 'overlaps tower' };
      }
    }
    if (this.gold < def.cost) return { ok: false, error: 'not enough gold' };
    return { ok: true };
  }

  private placeTower(towerTypeId: string, pos: Vec2): CommandResult {
    if (this.status === 'won' || this.status === 'lost') return { ok: false, error: 'level over' };
    const valid = this.validatePlacement(towerTypeId, pos);
    if (!valid.ok) return valid;
    const def = this.content.towers[towerTypeId];
    this.gold -= def.cost;
    const tower: TowerState = {
      id: this.nextId++, typeId: towerTypeId, pos: { x: pos.x, y: pos.y }, cooldown: 0, tier: 0,
      specId: null, nodes: { damage: 0, range: 0, rate: 0 }, shots: 0, targeting: 'first',
      frozenTicks: 0, curseTicks: 0, curseFactor: 1, ascended: false,
    };
    this.towers.push(tower);
    // Copy, never share, the live Vec2 — an event consumer mutating ev.pos must not reach sim state.
    this.pendingEvents.push({ type: 'towerPlaced', towerId: tower.id, typeId: towerTypeId, pos: { x: tower.pos.x, y: tower.pos.y } });
    if (this.status === 'building') this.undoRecord = { kind: 'place', towerId: tower.id, refund: def.cost };
    return { ok: true };
  }

  private upgradeTower(towerId: number): CommandResult {
    if (this.status === 'won' || this.status === 'lost') return { ok: false, error: 'level over' };
    const tower = this.towers.find((t) => t.id === towerId);
    if (!tower) return { ok: false, error: 'no such tower' };
    const def = this.content.towers[tower.typeId];
    if (tower.tier >= def.tiers.length) return { ok: false, error: 'already at max tier' };
    const next = def.tiers[tower.tier];
    if (this.gold < next.cost) return { ok: false, error: 'not enough gold' };
    this.gold -= next.cost;
    tower.tier += 1;
    if (this.status === 'building') this.undoRecord = { kind: 'upgrade', towerId: tower.id, refund: next.cost };
    this.pendingEvents.push({ type: 'towerUpgraded', towerId: tower.id, tier: tower.tier });
    return { ok: true };
  }

  private chooseSpecialization(towerId: number, specId: string): CommandResult {
    if (this.status === 'won' || this.status === 'lost') return { ok: false, error: 'level over' };
    // Meta-gate: tier-3 specialization ACCESS is a skill-tree unlock. Default TRUE so a
    // bare sim (and all pre-Phase-5 tests) is ungated; the UI passes the saved value.
    if (!this.mods.specializationsUnlocked) return { ok: false, error: 'specializations locked' };
    const tower = this.towers.find((t) => t.id === towerId);
    if (!tower) return { ok: false, error: 'no such tower' };
    const def = this.content.towers[tower.typeId];
    const spec = def.specializations?.find((s) => s.id === specId);
    if (!spec) return { ok: false, error: 'unknown specialization' };
    if (tower.tier < def.tiers.length) return { ok: false, error: 'requires tier 2' };
    if (tower.specId !== null) return { ok: false, error: 'specialization already chosen' };
    if (this.gold < spec.cost) return { ok: false, error: 'not enough gold' };
    this.gold -= spec.cost;
    tower.specId = specId;
    if (this.status === 'building') this.undoRecord = { kind: 'spec', towerId, refund: spec.cost };
    this.pendingEvents.push({ type: 'specializationChosen', towerId, specId });
    return { ok: true };
  }

  /**
   * P11 Task 6: tier-4 capstone. Requires a chosen spec, the ascensionsUnlocked
   * meta-gate (default TRUE, same bare-sim convention as specializationsUnlocked),
   * and gold. Permanent — no un-ascend outside the one-deep undo.
   */
  private ascendTower(towerId: number): CommandResult {
    if (this.status === 'won' || this.status === 'lost') return { ok: false, error: 'level over' };
    if (!this.mods.ascensionsUnlocked) return { ok: false, error: 'ascensions locked' };
    const tower = this.towers.find((t) => t.id === towerId);
    if (!tower) return { ok: false, error: 'no such tower' };
    if (tower.specId === null) return { ok: false, error: 'requires a specialization' };
    if (tower.ascended) return { ok: false, error: 'already ascended' };
    const def = this.content.towers[tower.typeId];
    const spec = def.specializations.find((s) => s.id === tower.specId)!;
    if (this.gold < spec.ascension.cost) return { ok: false, error: 'not enough gold' };
    this.gold -= spec.ascension.cost;
    tower.ascended = true;
    if (this.status === 'building') this.undoRecord = { kind: 'ascend', towerId, refund: spec.ascension.cost };
    this.pendingEvents.push({ type: 'towerAscended', towerId, specId: tower.specId });
    return { ok: true };
  }

  private buyMinorNode(towerId: number, node: MinorNodeId): CommandResult {
    if (this.status === 'won' || this.status === 'lost') return { ok: false, error: 'level over' };
    const tower = this.towers.find((t) => t.id === towerId);
    if (!tower) return { ok: false, error: 'no such tower' };
    const rank = tower.nodes[node];
    if (rank >= MINOR_NODE_COSTS.length) return { ok: false, error: 'node at max rank' };
    const cost = MINOR_NODE_COSTS[rank];
    if (this.gold < cost) return { ok: false, error: 'not enough gold' };
    this.gold -= cost;
    tower.nodes[node] += 1;
    if (this.status === 'building') this.undoRecord = { kind: 'node', towerId, node, refund: cost };
    this.pendingEvents.push({ type: 'minorNodeBought', towerId, node, rank: tower.nodes[node] });
    return { ok: true };
  }

  /** Total gold ever spent on this tower: base + purchased tiers + spec + minor node ranks. */
  investedGold(tower: TowerState): number {
    const def = this.content.towers[tower.typeId];
    let total = def.cost;
    for (let t = 0; t < tower.tier; t++) total += def.tiers[t].cost;
    if (tower.specId !== null) {
      const spec = def.specializations?.find((s) => s.id === tower.specId);
      if (spec) total += spec.cost;
      if (tower.ascended && spec) total += spec.ascension.cost;
    }
    for (const node of MINOR_NODE_IDS) {
      for (let r = 0; r < tower.nodes[node]; r++) total += MINOR_NODE_COSTS[r];
    }
    return total;
  }

  /** Effective sell-refund fraction: SELL_REFUND_RATE + the skill-tree bonus, capped at 0.95. Public so the sell button's label shares the command's exact rate. */
  sellRefundRate(): number {
    return Math.min(0.95, SELL_REFUND_RATE + this.mods.sellRefundBonus);
  }

  /** Ward wave-income after the wardIncomeMult skill modifier, floored once over the summed base (payout site: the wave-clear branch in tick()). */
  wardIncome(baseIncome: number): number {
    return Math.floor(baseIncome * this.mods.wardIncomeMult);
  }

  private sellTower(towerId: number): CommandResult {
    if (this.status === 'won' || this.status === 'lost') return { ok: false, error: 'level over' };
    const tower = this.towers.find((t) => t.id === towerId);
    if (!tower) return { ok: false, error: 'no such tower' };
    const refund = Math.floor(this.investedGold(tower) * this.sellRefundRate());
    this.gold += refund;
    this.towers.splice(this.towers.indexOf(tower), 1);
    this.undoRecord = null; // selling invalidates (and is never) an undo target
    this.pendingEvents.push({ type: 'towerSold', towerId, refund });
    return { ok: true };
  }

  private undo(): CommandResult {
    if (this.status === 'won' || this.status === 'lost') return { ok: false, error: 'level over' };
    const rec = this.undoRecord;
    if (rec === null) return { ok: false, error: 'nothing to undo' };
    const tower = this.towers.find((t) => t.id === rec.towerId);
    if (!tower) return { ok: false, error: 'undo target missing' }; // unreachable: sells clear the record
    switch (rec.kind) {
      case 'place':
        this.towers.splice(this.towers.indexOf(tower), 1);
        break;
      case 'upgrade':
        tower.tier -= 1;
        break;
      case 'spec':
        tower.specId = null;
        break;
      case 'node':
        tower.nodes[rec.node] -= 1;
        break;
      case 'ascend':
        tower.ascended = false;
        break;
    }
    this.gold += rec.refund; // FULL refund — undo is regret-free until the wave starts
    this.undoRecord = null;  // one-deep: consumed
    this.pendingEvents.push({ type: 'undoApplied', kind: rec.kind, towerId: rec.towerId, refund: rec.refund });
    return { ok: true };
  }

  private setTargeting(towerId: number, mode: TargetingMode): CommandResult {
    if (this.status === 'won' || this.status === 'lost') return { ok: false, error: 'level over' };
    const tower = this.towers.find((t) => t.id === towerId);
    if (!tower) return { ok: false, error: 'no such tower' };
    tower.targeting = mode; // no event: the renderer reads tower.targeting from state
    return { ok: true };
  }

  tick(): SimEvent[] {
    const events = this.pendingEvents;
    this.pendingEvents = [];
    if (this.status === 'won' || this.status === 'lost') return events;
    this.simTime += DT;

    // Between-wave auto-start: the countdown runs only while building; at zero the next wave begins on its own.
    if (this.countdownTicks !== null && this.status === 'building') {
      this.countdownTicks -= 1;
      if (this.countdownTicks <= 0) {
        this.countdownTicks = null;
        this.beginWave(events);
      }
    }

    while (this.spawnQueue.length > 0 && this.spawnQueue[0].at <= this.simTime) {
      const { typeId, pathIndex } = this.spawnQueue.shift()!;
      const def = this.content.enemies[typeId];
      const enemy: EnemyState = {
        id: this.nextId++, typeId, hp: def.hp, maxHp: def.hp, pathDist: 0, pathIndex, speed: def.speed, alive: true,
        element: def.element, armor: def.armor, stealth: def.stealth === true, effects: {},
        ...(def.boss ? { bossState: {
          fired: def.boss.abilities.map(() => false),
          timers: def.boss.abilities.map((a) => (a.trigger.kind === 'timer' ? a.trigger.periodTicks : 0)),
        } } : {}),
      };
      this.enemies.push(enemy);
      events.push({ type: 'enemySpawned', enemyId: enemy.id, typeId });
    }

    this.tickEffects(events);
    this.tickBossAbilities(events);

    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      enemy.pathDist += effectiveSpeed(enemy) * DT;
      if (enemy.pathDist >= this.paths[enemy.pathIndex].length) {
        enemy.alive = false;
        const def = this.content.enemies[enemy.typeId];
        this.lives -= def.livesCost;
        events.push({ type: 'enemyLeaked', enemyId: enemy.id, livesLost: def.livesCost });
        if (this.lives <= 0) {
          this.status = 'lost';
          events.push({ type: 'levelLost' });
          return events;
        }
      }
    }

    this.updateTowers(events);

    if (this.status === 'combat' && this.spawnQueue.length === 0 && this.enemies.every((e) => !e.alive)) {
      events.push({ type: 'waveCleared', waveIndex: this.waveIndex });
      if (this.waveIndex + 1 >= this.level.waves.length) {
        this.status = 'won';
        events.push({ type: 'levelWon' });
      } else {
        this.status = 'building';
        // P11: ward income pays out on every wave clear WITH WAVES REMAINING (same timing rule as life regen).
        let baseIncome = 0;
        for (const t of this.towers) {
          const m = this.resolvedMechanic(t, this.content.towers[t.typeId]);
          if (m.kind === 'ward') baseIncome += m.goldPerWave;
        }
        // Integration seam (T2 emission ∘ T7 modifier): the skill tree's
        // wardIncomeMult applies to the summed base, floored once.
        const income = this.wardIncome(baseIncome);
        if (income > 0) {
          this.gold += income;
          events.push({ type: 'wardIncome', gold: income });
        }
        // Meta-progression: life regen applies BETWEEN waves only — never after the
        // final wave (victory lives are the mastery measure) — capped at level.lives.
        if (this.mods.lifeRegenPerWave > 0) {
          this.lives = Math.min(this.level.lives, this.lives + this.mods.lifeRegenPerWave);
        }
        // Kingdom Rush countdown: the next wave auto-starts after level.waveCountdown seconds (integer ticks — deterministic).
        this.countdownTicks = Math.max(1, Math.round(this.level.waveCountdown * TICK_RATE));
      }
    }
    return events;
  }

  /** Mechanic after tier/spec resolution only — no stat math, no allocation. Used by the aura scan. */
  private resolvedMechanic(tower: TowerState, def: TowerDef): TowerMechanic {
    let mechanic = def.mechanic;
    for (let t = 0; t < tower.tier; t++) {
      const m = def.tiers[t].mechanic;
      if (m) mechanic = m;
    }
    if (tower.specId !== null) {
      const spec = def.specializations?.find((s) => s.id === tower.specId);
      if (spec) mechanic = spec.mechanic;
    }
    if (tower.ascended && tower.specId !== null) {
      const spec = def.specializations?.find((s) => s.id === tower.specId);
      if (spec?.ascension.mechanic) mechanic = spec.ascension.mechanic;
    }
    return mechanic;
  }

  /** Stats from the tower's own def/tiers/spec/nodes — before aura buffs from neighbors. */
  private ownStats(tower: TowerState, def: TowerDef): TowerStats {
    let { damage, range, fireRate } = def;
    for (let t = 0; t < tower.tier; t++) {
      const tier = def.tiers[t];
      damage = tier.damage;
      range = tier.range;
      fireRate = tier.fireRate;
    }
    if (tower.specId !== null) {
      const spec = def.specializations?.find((s) => s.id === tower.specId);
      if (spec) ({ damage, range, fireRate } = spec);
    }
    if (tower.ascended && tower.specId !== null) {
      const spec = def.specializations?.find((s) => s.id === tower.specId);
      if (spec) ({ damage, range, fireRate } = spec.ascension);
    }
    damage *= 1 + MINOR_NODE_BONUS.damage * tower.nodes.damage;
    range *= 1 + MINOR_NODE_BONUS.range * tower.nodes.range;
    fireRate *= 1 + MINOR_NODE_BONUS.rate * tower.nodes.rate;
    // Meta-progression: per-element damage boost, keyed by the TOWER's element (def.element).
    // A dual-element tower gets its base element's multiplier on BOTH alternating shots.
    damage *= this.mods.elementDamageMult[def.element] ?? 1;
    return { damage, range, fireRate, mechanic: this.resolvedMechanic(tower, def) };
  }

  /**
   * Effective stats: base → tiers (absolute) → spec (absolute, own mechanic) →
   * minor nodes (multiplicative) → aura buffs (multiplicative).
   * Aura composition: every OTHER aura tower within its radius multiplies fireRate
   * by (1 + bonus). Multiplicative composition is order-independent; the scan walks
   * the towers array (placement order), which is deterministic.
   */
  statsFor(tower: TowerState, def: TowerDef = this.content.towers[tower.typeId]): TowerStats {
    const stats = this.ownStats(tower, def);
    for (const other of this.towers) {
      if (other.id === tower.id) continue; // an aura never buffs itself
      const m = this.resolvedMechanic(other, this.content.towers[other.typeId]);
      if (m.kind !== 'aura') continue;
      if (Math.hypot(other.pos.x - tower.pos.x, other.pos.y - tower.pos.y) > m.radius) continue;
      stats.fireRate *= 1 + m.fireRateBonus;
    }
    return stats;
  }

  protected updateTowers(events: SimEvent[]): void {
    for (const tower of this.towers) {
      if (tower.frozenTicks > 0) { tower.frozenTicks -= 1; continue; } // boss freeze: tower fully inert
      if (tower.curseTicks > 0) { tower.curseTicks -= 1; if (tower.curseTicks === 0) tower.curseFactor = 1; }
      tower.cooldown = Math.max(0, tower.cooldown - DT);
      if (tower.cooldown > 0) continue;
      const def = this.content.towers[tower.typeId];
      const stats = this.statsFor(tower, def);
      if (stats.mechanic.kind === 'aura' || stats.mechanic.kind === 'ward') continue; // support towers never shoot
      const target = this.pickTarget(tower, stats.range, stats.mechanic);
      if (!target) continue;
      tower.cooldown = 1 / stats.fireRate;
      // Dual-element hybrids alternate deterministically: even shot counts (0, 2, ...)
      // fire elements[0], odd counts fire elements[1]. Plain counter, no RNG.
      const element = stats.mechanic.kind === 'dualElement' ? stats.mechanic.elements[tower.shots % 2] : def.element;
      tower.shots += 1;
      const damage = stats.damage * (tower.curseTicks > 0 ? tower.curseFactor : 1); // boss curseTowers
      const impact = this.enemyPos(target); // captured BEFORE the hit — splash radiates from the impact even if it kills
      this.hitEnemy(tower, element, stats.mechanic, target, damage, events);
      if (stats.mechanic.kind === 'chain') {
        this.chainFrom(tower, def.element, stats.mechanic, target, damage, events);
      }
      if (stats.mechanic.kind === 'splash') {
        this.splashFrom(tower, element, stats.mechanic, target, impact, damage, events);
      }
    }
  }

  /** True when a beats b under the given mode. ALL ties are broken by lowest enemy id (determinism). */
  private beats(mode: TargetingMode, a: EnemyState, b: EnemyState): boolean {
    let key: number;
    switch (mode) {
      case 'first':  key = a.pathDist - b.pathDist; break; // furthest along the path wins
      case 'last':   key = b.pathDist - a.pathDist; break; // closest to spawn wins
      case 'strong': key = a.hp - b.hp; break;             // highest current hp wins
      case 'weak':   key = b.hp - a.hp; break;             // lowest current hp wins
      default: {
        // Exhaustiveness guard: a new TargetingMode without a case is a compile error.
        const exhaustive: never = mode;
        throw new Error(`unknown targeting mode: ${JSON.stringify(exhaustive)}`);
      }
    }
    return key > 0 || (key === 0 && a.id < b.id); // ties: lowest enemy id (determinism)
  }

  private pickTarget(tower: TowerState, range: number, mechanic: TowerMechanic): EnemyState | undefined {
    let target: EnemyState | undefined;
    const seesStealth = mechanic.kind === 'pierce'; // radiant reveals what others cannot see
    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      if (this.isStealthed(enemy) && !seesStealth && !this.isRevealed(enemy)) continue;
      const p = this.enemyPos(enemy);
      if (Math.hypot(p.x - tower.pos.x, p.y - tower.pos.y) > range) continue;
      if (!target || this.beats(tower.targeting, enemy, target)) target = enemy;
    }
    return target;
  }

  private hitEnemy(
    tower: TowerState,
    element: AttackElement,
    mechanic: TowerMechanic,
    enemy: EnemyState,
    baseDamage: number,
    events: SimEvent[],
  ): void {
    if (enemy.effects.shield) {
      events.push({ type: 'towerFired', towerId: tower.id, enemyId: enemy.id });
      return; // shield window: immune to everything
    }
    let dmg = computeHitDamage(baseDamage, element, enemy.element, enemy.armor, mechanic.kind === 'pierce');
    // Shadow bonus: % of CURRENT hp, added after the pipeline (bypasses armor/matrix).
    if (mechanic.kind === 'curse') dmg += enemy.hp * mechanic.currentHpPct;
    // Vulnerability amplifies direct hits only (never DoT ticks), and never the hit that applies it.
    if (enemy.effects.vulnerability) dmg *= enemy.effects.vulnerability.multiplier;
    enemy.hp -= dmg;
    events.push({ type: 'towerFired', towerId: tower.id, enemyId: enemy.id });
    if (enemy.hp <= 0) {
      this.killEnemy(enemy, events);
      return;
    }
    // Stack-refresh: overwrite resets duration; damage never stacks.
    switch (mechanic.kind) {
      case 'burn':
        enemy.effects.burn = { dps: mechanic.dps, remaining: mechanic.duration };
        break;
      case 'slow':
        enemy.effects.slow = { factor: mechanic.factor, remaining: mechanic.duration };
        break;
      case 'poison':
        enemy.effects.poison = {
          dps: mechanic.dps,
          duration: mechanic.duration,
          remaining: mechanic.duration,
          spreadRadius: mechanic.spreadRadius,
          spread: false,
        };
        break;
      case 'curse':
        enemy.effects.vulnerability = { multiplier: mechanic.vulnMultiplier, remaining: mechanic.vulnDuration };
        break;
      case 'none':
      case 'pierce':
      case 'chain':
      case 'dualElement':
      case 'aura':
      case 'splash':
      case 'ward':
        break; // no on-hit status effect
      default: {
        // Exhaustiveness guard: a new TowerMechanic kind without a case is a compile error.
        const exhaustive: never = mechanic;
        throw new Error(`unhandled mechanic: ${JSON.stringify(exhaustive)}`);
      }
    }
  }

  private chainFrom(
    tower: TowerState,
    element: AttackElement,
    mechanic: Extract<TowerMechanic, { kind: 'chain' }>,
    primary: EnemyState,
    baseDamage: number,
    events: SimEvent[],
  ): void {
    const origin = this.enemyPos(primary);
    const candidates: Array<{ enemy: EnemyState; dist: number }> = [];
    for (const enemy of this.enemies) {
      if (!enemy.alive || enemy.id === primary.id || this.isStealthed(enemy)) continue;
      const p = this.enemyPos(enemy);
      const dist = Math.hypot(p.x - origin.x, p.y - origin.y);
      if (dist <= mechanic.radius) candidates.push({ enemy, dist });
    }
    // Deterministic: nearest first; ties broken by lowest enemy id.
    candidates.sort((a, b) => a.dist - b.dist || a.enemy.id - b.enemy.id);
    let dmg = baseDamage;
    for (const { enemy } of candidates.slice(0, mechanic.targets)) {
      dmg *= mechanic.falloff;
      this.hitEnemy(tower, element, mechanic, enemy, dmg, events);
    }
  }

  /** P11 splash: every OTHER living enemy within radius of the impact takes damage × falloff. Indiscriminate: hits stealth too. */
  private splashFrom(
    tower: TowerState,
    element: AttackElement,
    mechanic: Extract<TowerMechanic, { kind: 'splash' }>,
    primary: EnemyState,
    impact: Vec2,
    baseDamage: number,
    events: SimEvent[],
  ): void {
    const dmg = baseDamage * mechanic.falloff;
    for (const enemy of this.enemies) {
      if (!enemy.alive || enemy.id === primary.id) continue;
      const p = this.enemyPos(enemy);
      if (Math.hypot(p.x - impact.x, p.y - impact.y) > mechanic.radius) continue;
      this.hitEnemy(tower, element, mechanic, enemy, dmg, events);
    }
  }

  /** P11: true when a ward tower's reveal radius covers this enemy (stealth becomes targetable by everyone). Pure. */
  isRevealed(enemy: EnemyState): boolean {
    const p = this.enemyPos(enemy);
    for (const t of this.towers) {
      const m = this.resolvedMechanic(t, this.content.towers[t.typeId]);
      if (m.kind !== 'ward') continue;
      if (Math.hypot(t.pos.x - p.x, t.pos.y - p.y) <= m.revealRadius) return true;
    }
    return false;
  }

  private killEnemy(enemy: EnemyState, events: SimEvent[]): void {
    enemy.alive = false;
    const bounty = Math.round(this.content.enemies[enemy.typeId].bounty * this.mods.bountyMult);
    this.gold += bounty;
    this.goldEarned += bounty;
    events.push({ type: 'enemyKilled', enemyId: enemy.id, bounty });

    // Nature signature: an un-spread poison jumps once to the nearest living
    // enemy within its spread radius, with a fresh duration.
    const poison = enemy.effects.poison;
    if (poison && !poison.spread) {
      const origin = this.enemyPos(enemy);
      let best: { enemy: EnemyState; dist: number } | undefined;
      for (const other of this.enemies) {
        if (!other.alive || other.id === enemy.id) continue;
        const p = this.enemyPos(other);
        const dist = Math.hypot(p.x - origin.x, p.y - origin.y);
        if (dist > poison.spreadRadius) continue;
        // Deterministic: nearest wins; ties broken by lowest enemy id.
        if (!best || dist < best.dist || (dist === best.dist && other.id < best.enemy.id)) {
          best = { enemy: other, dist };
        }
      }
      // spread never clobbers an existing poison (tower-applied or prior spread);
      // if the nearest candidate is already poisoned, the spread fizzles here — it
      // does not retarget to the next-nearest enemy.
      if (best && !best.enemy.effects.poison) {
        best.enemy.effects.poison = { ...poison, remaining: poison.duration, spread: true };
      }
    }
  }

  private tickEffects(events: SimEvent[]): void {
    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      const fx = enemy.effects;
      if (fx.shield) {
        fx.shield.remaining -= DT;
        if (fx.shield.remaining <= 0) delete fx.shield;
        continue; // shield blocks DoT ticks too — NOTE: this PAUSES burn/poison/slow timers (they resume with time remaining), effectively extending status durations across shield windows. Deliberate; matters for Luminarch (P13) burn-counter balance.
      }
      if (fx.stealthPhase) {
        fx.stealthPhase.remaining -= DT;
        if (fx.stealthPhase.remaining <= 0) delete fx.stealthPhase;
      }
      if (fx.burn) {
        enemy.hp -= fx.burn.dps * DT;
        fx.burn.remaining -= DT;
        if (fx.burn.remaining <= 0) delete fx.burn;
      }
      // Don't delete an expiring poison yet: if this same tick is lethal, killEnemy
      // below needs to still see it to trigger the death-spread. Deletion happens
      // afterward, only for enemies that survive the tick.
      let poisonExpired = false;
      if (fx.poison) {
        enemy.hp -= fx.poison.dps * DT;
        fx.poison.remaining -= DT;
        poisonExpired = fx.poison.remaining <= 0;
      }
      if (fx.slow) {
        fx.slow.remaining -= DT;
        if (fx.slow.remaining <= 0) delete fx.slow;
      }
      if (fx.vulnerability) {
        fx.vulnerability.remaining -= DT;
        if (fx.vulnerability.remaining <= 0) delete fx.vulnerability;
      }
      if (enemy.hp <= 0) {
        this.killEnemy(enemy, events);
        continue;
      }
      if (poisonExpired) delete fx.poison;
    }
  }

  /** P11 boss ability execution: threshold abilities fire once when hp crosses; timer abilities fire every period. */
  private tickBossAbilities(events: SimEvent[]): void {
    // Snapshot: enemies spawned by an effect THIS tick are not evaluated until the next tick.
    const current = this.enemies.filter((e) => e.alive && e.bossState !== undefined);
    for (const enemy of current) {
      const def = this.content.enemies[enemy.typeId];
      if (!def.boss || !enemy.bossState) continue;
      def.boss.abilities.forEach((ability, i) => {
        const st = enemy.bossState!;
        let fire = false;
        if (ability.trigger.kind === 'hpThreshold') {
          if (!st.fired[i] && enemy.hp <= enemy.maxHp * ability.trigger.pct) { st.fired[i] = true; fire = true; }
        } else {
          st.timers[i] -= 1;
          if (st.timers[i] <= 0) { st.timers[i] = ability.trigger.periodTicks; fire = true; }
        }
        if (fire) this.applyBossEffect(enemy, ability.effect, events);
      });
    }
  }

  private applyBossEffect(enemy: EnemyState, effect: BossEffect, events: SimEvent[]): void {
    switch (effect.kind) {
      case 'split':
      case 'spawnAdds': {
        const def = this.content.enemies[effect.spawnId];
        for (let k = 0; k < effect.count; k++) {
          const spawn: EnemyState = {
            id: this.nextId++, typeId: effect.spawnId, hp: def.hp, maxHp: def.hp,
            pathDist: Math.max(0, enemy.pathDist - 14 * (k + 1)), pathIndex: enemy.pathIndex,
            speed: def.speed, alive: true, element: def.element, armor: def.armor,
            stealth: def.stealth === true, effects: {},
            ...(def.boss ? { bossState: {
              fired: def.boss.abilities.map(() => false),
              timers: def.boss.abilities.map((a) => (a.trigger.kind === 'timer' ? a.trigger.periodTicks : 0)),
            } } : {}),
          };
          this.enemies.push(spawn);
          events.push({ type: 'enemySpawned', enemyId: spawn.id, typeId: spawn.typeId });
        }
        break;
      }
      case 'regen':
        enemy.hp = Math.min(enemy.maxHp, enemy.hp + effect.amount);
        break;
      case 'blink':
        enemy.pathDist += effect.distance;
        break;
      case 'freezeTowers': {
        const p = this.enemyPos(enemy);
        for (const t of this.towers) {
          if (Math.hypot(t.pos.x - p.x, t.pos.y - p.y) <= effect.radius) t.frozenTicks = effect.durationTicks;
        }
        break;
      }
      case 'shield':
        enemy.effects.shield = { remaining: effect.durationTicks * DT };
        break;
      case 'stealthPhase':
        enemy.effects.stealthPhase = { remaining: effect.durationTicks * DT };
        break;
      case 'curseTowers': {
        const p = this.enemyPos(enemy);
        for (const t of this.towers) {
          if (Math.hypot(t.pos.x - p.x, t.pos.y - p.y) <= effect.radius) {
            t.curseTicks = effect.durationTicks; t.curseFactor = effect.damageFactor;
          }
        }
        break;
      }
      default: {
        const exhaustive: never = effect;
        throw new Error(`unhandled boss effect: ${JSON.stringify(exhaustive)}`);
      }
    }
    events.push({ type: 'bossAbility', enemyId: enemy.id, effect: effect.kind });
  }

  /** Effective stealth: baked stealth OR an active boss stealth phase. */
  private isStealthed(enemy: EnemyState): boolean {
    return enemy.stealth || enemy.effects.stealthPhase !== undefined;
  }
}
