import { describe, expect, it } from 'vitest';
import {
  SAVE_KEY,
  freshSave,
  loadSave,
  resetSave,
  writeSave,
  type SaveData,
  type StorageLike,
} from '../../src/game/save';

function fakeStorage(): StorageLike & { map: Map<string, string> } {
  const map = new Map<string, string>();
  return {
    map,
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value);
    },
    removeItem: (key) => {
      map.delete(key);
    },
  };
}

function sampleSave(): SaveData {
  return {
    ...freshSave(),
    unlockedLevels: 4,
    xp: 730,
    firstClears: ['level01', 'level02'],
    masteryFlags: { level01: { highLives: true, noLeak: false } },
    spentSkillPoints: { prospecting: 2 },
    masteredNodes: ['prospecting'],
  };
}

describe('save storage', () => {
  it('empty storage loads a fresh save', () => {
    expect(loadSave(fakeStorage())).toEqual(freshSave());
  });

  it('round-trips under the versioned key', () => {
    const storage = fakeStorage();
    writeSave(sampleSave(), storage);
    expect(storage.map.has('spirehex-save-v1')).toBe(true);
    expect(SAVE_KEY).toBe('spirehex-save-v1');
    expect(loadSave(storage)).toEqual(sampleSave());
  });

  it('corrupt JSON falls back to fresh (never throws)', () => {
    const storage = fakeStorage();
    storage.map.set(SAVE_KEY, '{not json');
    expect(loadSave(storage)).toEqual(freshSave());
  });

  it('an unknown version falls back to fresh', () => {
    const storage = fakeStorage();
    storage.map.set(SAVE_KEY, JSON.stringify({ ...sampleSave(), version: 2 }));
    expect(loadSave(storage)).toEqual(freshSave());
  });

  it('a malformed shape falls back to fresh', () => {
    const storage = fakeStorage();
    storage.map.set(SAVE_KEY, JSON.stringify({ version: 1, xp: 'lots' }));
    expect(loadSave(storage)).toEqual(freshSave());
  });

  it('a masteryFlags entry that is not a {highLives, noLeak} object falls back to fresh', () => {
    const storage = fakeStorage();
    storage.map.set(SAVE_KEY, JSON.stringify({ ...sampleSave(), masteryFlags: { level01: null } }));
    expect(loadSave(storage)).toEqual(freshSave());
  });

  it('non-finite xp (Infinity, e.g. from a JSON 1e999 literal) falls back to fresh', () => {
    const storage = fakeStorage();
    // JSON.stringify(Infinity) would just produce "null" — a 1e999 literal in the
    // raw JSON is how a real corrupt save produces xp: Infinity after JSON.parse.
    const raw =
      '{"version":1,"unlockedLevels":4,"xp":1e999,"firstClears":["level01","level02"],' +
      '"masteryFlags":{"level01":{"highLives":true,"noLeak":false}},' +
      '"spentSkillPoints":{"prospecting":2},"masteredNodes":["prospecting"]}';
    storage.map.set(SAVE_KEY, raw);
    expect(loadSave(storage)).toEqual(freshSave());
  });

  it('a spentSkillPoints value that is not a number falls back to fresh', () => {
    const storage = fakeStorage();
    storage.map.set(
      SAVE_KEY,
      JSON.stringify({ ...sampleSave(), spentSkillPoints: { unlockThornTotem: '3' } }),
    );
    expect(loadSave(storage)).toEqual(freshSave());
  });

  it('resetSave removes the key', () => {
    const storage = fakeStorage();
    writeSave(sampleSave(), storage);
    resetSave(storage);
    expect(storage.map.has(SAVE_KEY)).toBe(false);
    expect(loadSave(storage)).toEqual(freshSave());
  });

  it('with no storage at all (node env), load is fresh and write/reset no-op without throwing', () => {
    // In vitest there is no global localStorage — the default-argument path must cope.
    expect(loadSave()).toEqual(freshSave());
    expect(() => writeSave(freshSave())).not.toThrow();
    expect(() => resetSave()).not.toThrow();
    expect(loadSave(null)).toEqual(freshSave());
  });

  it('a pre-Phase-7 v1 save WITHOUT settings loads INTACT (no fresh-save reset), muted defaulting off', () => {
    const storage = fakeStorage();
    const { settings: _drop, ...legacy } = sampleSave();
    storage.map.set(SAVE_KEY, JSON.stringify(legacy)); // exactly what P5/P6 builds wrote
    expect(loadSave(storage)).toEqual({ ...sampleSave(), settings: { muted: false, musicMuted: false } });
  });

  it('round-trips settings.muted = true', () => {
    const storage = fakeStorage();
    writeSave({ ...sampleSave(), settings: { muted: true, musicMuted: false } }, storage);
    expect(loadSave(storage).settings).toEqual({ muted: true, musicMuted: false });
  });

  it('a malformed settings shape (muted not boolean) falls back to fresh', () => {
    const storage = fakeStorage();
    storage.map.set(SAVE_KEY, JSON.stringify({ ...sampleSave(), settings: { muted: 'yes' } }));
    expect(loadSave(storage)).toEqual(freshSave());
  });

  it('settings: null falls back to fresh', () => {
    const storage = fakeStorage();
    storage.map.set(SAVE_KEY, JSON.stringify({ ...sampleSave(), settings: null }));
    expect(loadSave(storage)).toEqual(freshSave());
  });
});

describe('settings.musicMuted (P10 lenient v1 extension)', () => {
  it('fresh save defaults musicMuted false', () => {
    expect(freshSave().settings.musicMuted).toBe(false);
  });

  it('a stored settings object WITHOUT musicMuted loads with the default (P7-era save)', () => {
    const storage = fakeStorage();
    const legacy = { ...freshSave(), settings: { muted: true } };
    storage.map.set(SAVE_KEY, JSON.stringify(legacy));
    const loaded = loadSave(storage);
    expect(loaded.settings.muted).toBe(true);
    expect(loaded.settings.musicMuted).toBe(false);
  });

  it('a non-boolean musicMuted rejects the whole save (established convention)', () => {
    const storage = fakeStorage();
    const bad = { ...freshSave(), settings: { muted: false, musicMuted: 'yes' } };
    storage.map.set(SAVE_KEY, JSON.stringify(bad));
    expect(loadSave(storage)).toEqual(freshSave());
  });

  it('musicMuted round-trips through write/load', () => {
    const storage = fakeStorage();
    const save = freshSave();
    save.settings.musicMuted = true;
    writeSave(save, storage);
    expect(loadSave(storage).settings.musicMuted).toBe(true);
  });
});

describe('unlockedElementTowers (P11 lenient v1 extension + legacy migration)', () => {
  it('fresh save has an empty unlockedElementTowers list', () => {
    expect(freshSave().unlockedElementTowers).toEqual([]);
  });

  it('round-trips a non-empty unlockedElementTowers list', () => {
    const storage = fakeStorage();
    const s = { ...sampleSave(), unlockedElementTowers: ['emberSpire', 'thornTotem'] };
    writeSave(s, storage);
    expect(loadSave(storage).unlockedElementTowers).toEqual(['emberSpire', 'thornTotem']);
  });

  it('a non-array unlockedElementTowers field rejects the whole save (falls back to fresh)', () => {
    const storage = fakeStorage();
    storage.map.set(SAVE_KEY, JSON.stringify({ ...sampleSave(), unlockedElementTowers: 'nope' }));
    expect(loadSave(storage)).toEqual(freshSave());
  });

  it('migration (a): legacy save with clears and a bought unlock node keeps the legacy defaults plus the bought tower, and strips the orphaned node id from spentSkillPoints', () => {
    const storage = fakeStorage();
    const legacy: Record<string, unknown> = {
      ...sampleSave(),
      firstClears: ['level01'],
      spentSkillPoints: { prospecting: 2, unlockThornTotem: 1 },
    };
    delete legacy.unlockedElementTowers;
    storage.map.set(SAVE_KEY, JSON.stringify(legacy));
    const loaded = loadSave(storage);
    expect(loaded.unlockedElementTowers).toEqual(['emberSpire', 'frostObelisk', 'sunShrine', 'thornTotem']);
    expect(loaded.spentSkillPoints).toEqual({ prospecting: 2 });
  });

  it('migration (b): xp alone (no clears, unlockedLevels still 1) is NOT progress — no legacy towers', () => {
    const storage = fakeStorage();
    const legacy: Record<string, unknown> = {
      ...freshSave(),
      xp: 500,
      firstClears: [],
      unlockedLevels: 1,
    };
    delete legacy.unlockedElementTowers;
    storage.map.set(SAVE_KEY, JSON.stringify(legacy));
    expect(loadSave(storage).unlockedElementTowers).toEqual([]);
  });

  it('migration (c): a truly fresh stored save (no progress at all) loads with an empty list', () => {
    const storage = fakeStorage();
    const fresh: Record<string, unknown> = { ...freshSave() };
    delete fresh.unlockedElementTowers;
    storage.map.set(SAVE_KEY, JSON.stringify(fresh));
    expect(loadSave(storage).unlockedElementTowers).toEqual([]);
  });

  it('migration (d): a save WITH the field present keeps it verbatim, but still strips orphaned skill node ids', () => {
    const storage = fakeStorage();
    const stored = {
      ...sampleSave(),
      unlockedElementTowers: ['emberSpire'],
      spentSkillPoints: { prospecting: 2, unlockStormPylon: 1 },
    };
    storage.map.set(SAVE_KEY, JSON.stringify(stored));
    const loaded = loadSave(storage);
    expect(loaded.unlockedElementTowers).toEqual(['emberSpire']);
    expect(loaded.spentSkillPoints).toEqual({ prospecting: 2 });
  });
});

describe('endless records (P10 lenient v1 extension)', () => {
  it('fresh save has an empty endless record map', () => {
    expect(freshSave().endless).toEqual({});
  });

  it('a stored save WITHOUT endless loads with the default (pre-P10 save)', () => {
    const storage = fakeStorage();
    const legacy: Record<string, unknown> = { ...freshSave() };
    delete legacy.endless;
    storage.map.set(SAVE_KEY, JSON.stringify(legacy));
    expect(loadSave(storage).endless).toEqual({});
  });

  it('a malformed endless record (non-finite bestWave) rejects the whole save', () => {
    const storage = fakeStorage();
    const bad = { ...freshSave(), endless: { level01: { bestWave: 1e999, runs: 1 } } };
    storage.map.set(SAVE_KEY, JSON.stringify(bad));
    expect(loadSave(storage)).toEqual(freshSave());
  });

  it('endless records round-trip', () => {
    const storage = fakeStorage();
    const save = freshSave();
    save.endless = { level01: { bestWave: 17, runs: 3 } };
    writeSave(save, storage);
    expect(loadSave(storage).endless).toEqual({ level01: { bestWave: 17, runs: 3 } });
  });
});

describe('P15: the rainbow endless record', () => {
  it("round-trips save.endless.rainbow (same map, no new fields — 'rainbow' is just a key)", () => {
    const storage = fakeStorage();
    const s = freshSave();
    s.endless.rainbow = { bestWave: 17, runs: 3 };
    writeSave(s, storage);
    expect(loadSave(storage).endless.rainbow).toEqual({ bestWave: 17, runs: 3 });
  });
});
