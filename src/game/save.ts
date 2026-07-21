/**
 * Versioned local save (spec §6). Phaser-free plain TS — node-testable.
 * Shape + fresh factory live here from Task 6; storage I/O (localStorage with
 * an injectable StorageLike) is added in the save-persistence task.
 */
import { SKILL_NODES } from '../content/skilltree';

export interface LevelMasteryFlags {
  /** Won the level with >= 18 lives (HIGH_LIVES_THRESHOLD) — awarded once. */
  highLives: boolean;
  /** Won the level with zero leaks — awarded once. */
  noLeak: boolean;
}

/** Per-map endless free-play record (spec §9). runs feeds the deterministic attempt seed. */
export interface EndlessRecord {
  bestWave: number;
  runs: number;
}

/** Player-facing options persisted with progress (spec §6: "campaign progress, skill tree, settings"). */
export interface SaveSettings {
  /** Sound effects off. Default false — audio on. */
  muted: boolean;
  /** Music sequencer off, independent of SFX (spec §8). Default false — music on. */
  musicMuted: boolean;
}

export interface SaveData {
  version: 1;
  /** Mirror of campaign.ts unlockedLevelCount(): the first N campaign levels are playable. */
  unlockedLevels: number;
  /** Lifetime account XP (kill bounties + first-clear bonuses). */
  xp: number;
  /** Level ids whose one-time first-clear XP bonus has been paid. */
  firstClears: string[];
  /** Per-level once-only mastery achievements. */
  masteryFlags: Record<string, LevelMasteryFlags>;
  /** Skill-tree node id → ranks bought. */
  spentSkillPoints: Record<string, number>;
  /** Node ids upgraded with a mastery point. */
  masteredNodes: string[];
  /**
   * P7 DECISION — extend v1, don't bump: `settings` is OPTIONAL on the wire
   * (StoredSaveData) with an unambiguous absence-default (muted:false = exact
   * pre-P7 behavior), validated when present, normalized on load. A v2 +
   * migration would buy nothing — no existing field changes shape or meaning.
   * Version bumps stay reserved for breaking/ambiguous changes.
   */
  settings: SaveSettings;
  /**
   * P10: endless free-play records, keyed by campaign level id. Lenient v1
   * extension (P7 pattern): optional on the wire, absence = {}, validated
   * when present. No version bump — no existing field changes meaning.
   */
  endless: Record<string, EndlessRecord>;
  /**
   * P11: element tower ids earned by killing biome finale bosses (Task 8;
   * see meta.ts unlockedTowers/applyAttempt). Lenient v1 extension (P7
   * pattern): optional on the wire. Absence-default depends on whether the
   * save shows real progress — see loadSave's migration comment — so, unlike
   * settings/endless, a fresh save and a migrated legacy save can differ.
   */
  unlockedElementTowers: string[];
}

export function freshSave(): SaveData {
  return {
    version: 1,
    unlockedLevels: 1,
    xp: 0,
    firstClears: [],
    masteryFlags: {},
    spentSkillPoints: {},
    masteredNodes: [],
    settings: { muted: false, musicMuted: false },
    endless: {},
    unlockedElementTowers: [],
  };
}

export const SAVE_KEY = 'spirehex-save-v1';
export const SAVE_VERSION = 1;

/** On the wire musicMuted is optional (P7-era v1 saves lack it); absent = false. */
type StoredSaveSettings = Omit<SaveSettings, 'musicMuted'> & { musicMuted?: boolean };

/** What actually sits in storage: settings is optional (pre-Phase-7 v1 saves lack it). */
type StoredSaveData = Omit<SaveData, 'settings' | 'endless' | 'unlockedElementTowers'> & {
  settings?: StoredSaveSettings;
  endless?: Record<string, EndlessRecord>;
  unlockedElementTowers?: string[];
};

/** The subset of the Web Storage API the save layer needs — injectable for node tests. */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** Browser localStorage when it exists; null in node/vitest (load → fresh, write → no-op). */
function defaultStorage(): StorageLike | null {
  return typeof localStorage === 'undefined' ? null : localStorage;
}

/** One mastery-flags entry: both fields must be actual booleans, not just present. */
function isValidMasteryFlags(value: unknown): value is LevelMasteryFlags {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.highLives === 'boolean' && typeof v.noLeak === 'boolean';
}

/** Settings entry: when present it must be an object with a boolean muted, and, if present, a boolean musicMuted. */
function isValidSettings(value: unknown): value is StoredSaveSettings {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.muted === 'boolean' && (v.musicMuted === undefined || typeof v.musicMuted === 'boolean');
}

/** One endless record: both fields must be finite numbers (guards the JSON Infinity trap). */
function isValidEndlessRecord(value: unknown): value is EndlessRecord {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.bestWave === 'number' && Number.isFinite(v.bestWave) &&
    typeof v.runs === 'number' && Number.isFinite(v.runs)
  );
}

/**
 * Structural check — corrupt or foreign data must NEVER crash the game, only
 * reset it. Validates nested members too (not just top-level shape): a
 * malformed masteryFlags/spentSkillPoints entry, or a non-finite xp/
 * unlockedLevels (e.g. JSON.parse('1e999') === Infinity, which is a `number`
 * by typeof but would otherwise slip through and hang the game at boot).
 */
function isSaveData(data: unknown): data is StoredSaveData {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;
  return (
    d.version === SAVE_VERSION &&
    typeof d.unlockedLevels === 'number' && Number.isFinite(d.unlockedLevels) &&
    typeof d.xp === 'number' && Number.isFinite(d.xp) &&
    Array.isArray(d.firstClears) && d.firstClears.every((v) => typeof v === 'string') &&
    typeof d.masteryFlags === 'object' && d.masteryFlags !== null &&
    Object.values(d.masteryFlags).every(isValidMasteryFlags) &&
    typeof d.spentSkillPoints === 'object' && d.spentSkillPoints !== null &&
    Object.values(d.spentSkillPoints).every((v) => typeof v === 'number' && Number.isFinite(v)) &&
    Array.isArray(d.masteredNodes) && d.masteredNodes.every((v) => typeof v === 'string') &&
    (d.settings === undefined || isValidSettings(d.settings)) &&
    (d.endless === undefined ||
      (typeof d.endless === 'object' && d.endless !== null && Object.values(d.endless).every(isValidEndlessRecord))) &&
    (d.unlockedElementTowers === undefined ||
      (Array.isArray(d.unlockedElementTowers) && d.unlockedElementTowers.every((v) => typeof v === 'string')))
  );
}

/** Pre-P11 element tower defaults — what a fresh profile started with before boss-kill unlocks existed. */
const LEGACY_DEFAULTS = ['emberSpire', 'frostObelisk', 'sunShrine'];
/** Retired skill-tree unlock nodes → the element tower each one used to unlock. */
const LEGACY_UNLOCK_NODES: Record<string, string> = {
  unlockThornTotem: 'thornTotem', unlockStormPylon: 'stormPylon', unlockUmbraMonolith: 'umbraMonolith',
};

/**
 * Load the save, falling back to a fresh one on ANY problem (no storage,
 * missing key, corrupt JSON, wrong version, malformed shape). Future schema
 * versions add migration cases here BEFORE the isSaveData check.
 */
export function loadSave(storage: StorageLike | null = defaultStorage()): SaveData {
  if (!storage) return freshSave();
  try {
    const raw = storage.getItem(SAVE_KEY);
    if (raw === null) return freshSave();
    const data: unknown = JSON.parse(raw);
    if (!isSaveData(data)) return freshSave();
    // P11 migration: legacy saves (no unlockedElementTowers, but real progress) KEEP
    // every element tower they had — the old defaults plus each bought unlock node.
    // Fresh saves start neutral-only. Orphaned node ids (the retired unlock nodes)
    // are dropped from spentSkillPoints, which automatically refunds the points.
    const isLegacy = data.unlockedElementTowers === undefined
      && (data.firstClears.length > 0 || data.unlockedLevels > 1);
    const legacyTowers = [
      ...LEGACY_DEFAULTS,
      ...Object.entries(LEGACY_UNLOCK_NODES)
        .filter(([nodeId]) => (data.spentSkillPoints[nodeId] ?? 0) > 0)
        .map(([, towerId]) => towerId),
    ];
    const spentSkillPoints = Object.fromEntries(
      Object.entries(data.spentSkillPoints).filter(([id]) => SKILL_NODES[id] !== undefined),
    );
    return {
      ...data,
      spentSkillPoints,
      unlockedElementTowers: data.unlockedElementTowers ?? (isLegacy ? legacyTowers : []),
      settings: { muted: data.settings?.muted ?? false, musicMuted: data.settings?.musicMuted ?? false },
      endless: data.endless ?? {},
    };
  } catch {
    return freshSave();
  }
}

export function writeSave(save: SaveData, storage: StorageLike | null = defaultStorage()): void {
  if (!storage) return;
  try {
    storage.setItem(SAVE_KEY, JSON.stringify(save));
  } catch {
    // Storage full or blocked — play continues unsaved rather than crashing.
  }
}

export function resetSave(storage: StorageLike | null = defaultStorage()): void {
  if (!storage) return;
  try {
    storage.removeItem(SAVE_KEY);
  } catch {
    // ignore
  }
}
