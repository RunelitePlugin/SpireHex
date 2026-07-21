import { describe, expect, it } from 'vitest';
import {
  HIGH_LIVES_THRESHOLD,
  accountLevelForXp,
  applyAttempt,
  applyEndlessAttempt,
  availableMasteryPoints,
  availableSkillPoints,
  buyNode,
  buildModifiers,
  earnedSkillPoints,
  endlessRunXp,
  endlessWaveXp,
  firstClearXp,
  masterNode,
  pointsSpentBelowTier,
  rainbowUnlocked,
  recordEndlessRunStart,
  totalXpForLevel,
  unlockedTowers,
} from '../../src/game/meta';
import { freshSave, type SaveData } from '../../src/game/save';
import { CAMPAIGN } from '../../src/content';

/** Old (pre-P11) triangular curve, kept only as a comparison baseline for the monotonicity test. */
function oldTotalXpForLevel(n: number): number {
  return (100 * n * (n - 1)) / 2;
}
function oldAccountLevelForXp(xp: number): number {
  let level = 1;
  while (oldTotalXpForLevel(level + 1) <= xp) level += 1;
  return level;
}

function save(overrides: Partial<SaveData> = {}): SaveData {
  return { ...freshSave(), ...overrides };
}

describe('XP curve and points', () => {
  it('triangular curve: level n→n+1 costs 100·n', () => {
    expect(totalXpForLevel(1)).toBe(0);
    expect(totalXpForLevel(2)).toBe(100);
    expect(totalXpForLevel(3)).toBe(300);
    expect(totalXpForLevel(4)).toBe(600);
  });

  it('accountLevelForXp inverts the curve', () => {
    expect(accountLevelForXp(0)).toBe(1);
    expect(accountLevelForXp(99)).toBe(1);
    expect(accountLevelForXp(100)).toBe(2);
    expect(accountLevelForXp(299)).toBe(2);
    expect(accountLevelForXp(300)).toBe(3);
    expect(accountLevelForXp(600)).toBe(4);
  });

  it('P11 re-fit: totalXpForLevel(13) is identical to the old triangular curve', () => {
    expect(totalXpForLevel(13)).toBe(7800);
    expect(totalXpForLevel(13)).toBe(oldTotalXpForLevel(13));
  });

  it('P11 re-fit: totalXpForLevel(14) is the first linear-cap step (100 × 12 more)', () => {
    expect(totalXpForLevel(14)).toBe(9000);
  });

  it('P11 re-fit: the new level mapping is never BELOW the old one for any fixed xp', () => {
    for (const xp of [0, 500, 7800, 50000]) {
      expect(accountLevelForXp(xp)).toBeGreaterThanOrEqual(oldAccountLevelForXp(xp));
    }
  });

  it('skill points earned = account level − 1; fresh profile has none', () => {
    expect(earnedSkillPoints(save())).toBe(0);
    expect(earnedSkillPoints(save({ xp: 300 }))).toBe(2);
    expect(availableSkillPoints(save({ xp: 300, spentSkillPoints: { prospecting: 1 } }))).toBe(1);
  });

  it('first-clear bonus grows down the campaign', () => {
    expect(firstClearXp(0)).toBe(100);
    expect(firstClearXp(9)).toBe(325);
  });

  it('mastery points: earned from flags, minus mastered nodes', () => {
    const s = save({
      masteryFlags: { level01: { highLives: true, noLeak: true }, level02: { highLives: true, noLeak: false } },
      masteredNodes: ['prospecting'],
    });
    expect(availableMasteryPoints(s)).toBe(2); // 3 earned − 1 spent
  });
});

describe('applyAttempt', () => {
  it('a loss still earns bounty XP but never first-clear or mastery', () => {
    const { save: next, summary } = applyAttempt(save(), 'level01', {
      won: false, goldEarned: 73, livesRemaining: 20, leaked: false,
    });
    expect(summary).toEqual({ xpEarned: 73, firstClear: false, levelsGained: 0, masteryEarned: [] });
    expect(next.xp).toBe(73);
    expect(next.firstClears).toEqual([]);
    expect(next.masteryFlags).toEqual({});
  });

  it('the first win adds the one-time first-clear bonus and records it', () => {
    const { save: next, summary } = applyAttempt(save(), 'level01', {
      won: true, goldEarned: 50, livesRemaining: 10, leaked: true,
    });
    expect(summary.xpEarned).toBe(150); // 50 bounty + firstClearXp(0)
    expect(summary.firstClear).toBe(true);
    expect(summary.levelsGained).toBe(1); // 150 XP crosses the level-2 line at 100
    expect(next.firstClears).toEqual(['level01']);
  });

  it('a repeat win pays no first-clear bonus', () => {
    const first = applyAttempt(save(), 'level01', { won: true, goldEarned: 50, livesRemaining: 10, leaked: true });
    const { summary } = applyAttempt(first.save, 'level01', { won: true, goldEarned: 50, livesRemaining: 10, leaked: true });
    expect(summary.xpEarned).toBe(50);
    expect(summary.firstClear).toBe(false);
  });

  it('a strong win earns both mastery awards, once per level ever', () => {
    const { save: next, summary } = applyAttempt(save(), 'level03', {
      won: true, goldEarned: 10, livesRemaining: HIGH_LIVES_THRESHOLD, leaked: false,
    });
    expect(summary.masteryEarned).toEqual(['highLives', 'noLeak']);
    expect(next.masteryFlags.level03).toEqual({ highLives: true, noLeak: true });
    const again = applyAttempt(next, 'level03', { won: true, goldEarned: 10, livesRemaining: 20, leaked: false });
    expect(again.summary.masteryEarned).toEqual([]);
  });

  it('a great-looking LOSS earns no mastery (finishing means winning)', () => {
    const { summary } = applyAttempt(save(), 'level01', {
      won: false, goldEarned: 10, livesRemaining: 20, leaked: false,
    });
    expect(summary.masteryEarned).toEqual([]);
  });

  it('never mutates its input save', () => {
    const input = save();
    const snapshot = JSON.parse(JSON.stringify(input)) as SaveData;
    applyAttempt(input, 'level01', { won: true, goldEarned: 50, livesRemaining: 20, leaked: false });
    expect(input).toEqual(snapshot);
  });

  it('a partially-earned mastery (one flag already true) awards only the new flag', () => {
    const withHighLives = save({
      masteryFlags: { level01: { highLives: true, noLeak: false } },
    });
    const { save: next, summary } = applyAttempt(withHighLives, 'level01', {
      won: true, goldEarned: 10, livesRemaining: 20, leaked: false,
    });
    expect(summary.masteryEarned).toEqual(['noLeak']);
    expect(next.masteryFlags.level01).toEqual({ highLives: true, noLeak: true });
  });

  it('winning the biome finale (level10) unlocks the biome element tower and reports it in the summary', () => {
    const { save: next, summary } = applyAttempt(save(), 'level10', {
      won: true, goldEarned: 10, livesRemaining: 20, leaked: false,
    });
    expect(next.unlockedElementTowers).toEqual(['emberSpire']);
    expect(summary.towerUnlocked).toBe('emberSpire');
  });

  it('a second finale win adds nothing further (idempotent) and reports no towerUnlocked', () => {
    const first = applyAttempt(save(), 'level10', { won: true, goldEarned: 10, livesRemaining: 20, leaked: false });
    const { save: next, summary } = applyAttempt(first.save, 'level10', {
      won: true, goldEarned: 10, livesRemaining: 20, leaked: false,
    });
    expect(next.unlockedElementTowers).toEqual(['emberSpire']);
    expect(summary.towerUnlocked).toBeUndefined();
    expect('towerUnlocked' in summary).toBe(false);
  });

  it('winning a non-finale level (level05) unlocks nothing', () => {
    const { save: next, summary } = applyAttempt(save(), 'level05', {
      won: true, goldEarned: 10, livesRemaining: 20, leaked: false,
    });
    expect(next.unlockedElementTowers).toEqual([]);
    expect(summary.towerUnlocked).toBeUndefined();
  });

  it('losing the finale unlocks nothing', () => {
    const { save: next, summary } = applyAttempt(save(), 'level10', {
      won: false, goldEarned: 10, livesRemaining: 5, leaked: true,
    });
    expect(next.unlockedElementTowers).toEqual([]);
    expect(summary.towerUnlocked).toBeUndefined();
  });
});

describe('buyNode', () => {
  it('rejects with no available points', () => {
    expect(buyNode(save(), 'salvage')).toEqual({ ok: false, error: 'not enough skill points' });
  });

  it('buys a rank and derives the reduced balance', () => {
    const res = buyNode(save({ xp: 300 }), 'scavenger'); // 2 points available, scavenger maxRanks 2
    if (!res.ok) throw new Error(res.error);
    expect(res.save.spentSkillPoints).toEqual({ scavenger: 1 });
    expect(availableSkillPoints(res.save)).toBe(1);
  });

  it('rejects past maxRanks', () => {
    const s = save({ xp: 2100, spentSkillPoints: { prospecting: 2 } }); // prospecting maxRanks 2
    expect(buyNode(s, 'prospecting')).toEqual({ ok: false, error: 'node at max rank' });
  });

  it('gates tier 2 behind TIER_REQUIREMENTS[2] points spent below tier 2', () => {
    const under = save({ xp: 2100, spentSkillPoints: { salvage: 1, boldCommander: 1 } });
    expect(pointsSpentBelowTier(under, 2)).toBe(2);
    expect(buyNode(under, 'fireMastery')).toEqual({ ok: false, error: 'requires 3 points spent in lower tiers' });
    const met = save({ xp: 2100, spentSkillPoints: { salvage: 1, boldCommander: 1, prospecting: 1 } });
    expect(buyNode(met, 'fireMastery').ok).toBe(true);
  });

  it('gates tier 3 and tier 4 behind their own cumulative requirements', () => {
    // 7 ranks spent below tier 3 — one short of TIER_REQUIREMENTS[3] = 8.
    const under = save({
      xp: 50000,
      spentSkillPoints: {
        prospecting: 2, fieldMedicine: 1, boldCommander: 1, neutralDrills: 2, scavenger: 1,
      },
    });
    expect(pointsSpentBelowTier(under, 3)).toBe(7);
    expect(buyNode(under, 'fireMasteryII')).toEqual({ ok: false, error: 'requires 8 points spent in lower tiers' });
    const met = save({
      xp: 50000,
      spentSkillPoints: {
        prospecting: 2, fieldMedicine: 1, boldCommander: 1, neutralDrills: 2, scavenger: 2,
      },
    });
    expect(pointsSpentBelowTier(met, 3)).toBe(8);
    expect(buyNode(met, 'fireMasteryII').ok).toBe(true);

    const underT4 = save({ xp: 50000, spentSkillPoints: { ...met.spentSkillPoints, fireMasteryII: 1 } }); // 9 below tier 4
    expect(pointsSpentBelowTier(underT4, 4)).toBe(9);
    expect(buyNode(underT4, 'ascensions')).toEqual({ ok: false, error: 'requires 14 points spent in lower tiers' });
  });

  it('rejects unknown node ids', () => {
    expect(buyNode(save({ xp: 2100 }), 'nope')).toEqual({ ok: false, error: 'unknown node: nope' });
  });
});

describe('masterNode', () => {
  const oneMasteryPoint = () =>
    save({
      xp: 300,
      spentSkillPoints: { prospecting: 1 },
      masteryFlags: { level01: { highLives: true, noLeak: false } },
    });

  it('masters an owned masterable node for 1 mastery point', () => {
    const res = masterNode(oneMasteryPoint(), 'prospecting');
    if (!res.ok) throw new Error(res.error);
    expect(res.save.masteredNodes).toEqual(['prospecting']);
    expect(availableMasteryPoints(res.save)).toBe(0);
  });

  it('rejects: unowned node, non-masterable node, double-master, no points', () => {
    expect(masterNode(save({ masteryFlags: { level01: { highLives: true, noLeak: true } } }), 'prospecting'))
      .toEqual({ ok: false, error: 'buy the node first' });
    expect(masterNode(oneMasteryPoint(), 'specializations'))
      .toEqual({ ok: false, error: 'node cannot be mastered' });
    const mastered = masterNode(oneMasteryPoint(), 'prospecting');
    if (!mastered.ok) throw new Error(mastered.error);
    expect(masterNode(mastered.save, 'prospecting')).toEqual({ ok: false, error: 'already mastered' });
    expect(masterNode(save({ xp: 300, spentSkillPoints: { prospecting: 1 } }), 'prospecting'))
      .toEqual({ ok: false, error: 'not enough mastery points' });
  });
});

describe('buildModifiers and unlockedTowers', () => {
  it('a fresh save yields explicit no-op modifiers with specializations and ascensions LOCKED', () => {
    expect(buildModifiers(save())).toEqual({
      extraStartingGold: 0,
      lifeRegenPerWave: 0,
      earlyCallRateBonus: 0,
      elementDamageMult: {},
      specializationsUnlocked: false,
      bountyMult: 1,
      wardIncomeMult: 1,
      sellRefundBonus: 0,
      ascensionsUnlocked: false,
    });
  });

  it('sums ranks into modifier values', () => {
    const mods = buildModifiers(save({
      spentSkillPoints: { prospecting: 2, fieldMedicine: 1, boldCommander: 1, fireMastery: 2, specializations: 1 },
    }));
    expect(mods.extraStartingGold).toBe(40);
    expect(mods.lifeRegenPerWave).toBe(1);
    expect(mods.earlyCallRateBonus).toBe(1);
    expect(mods.elementDamageMult).toEqual({ fire: 1.1 }); // 1 + 0.05 × 2
    expect(mods.specializationsUnlocked).toBe(true);
  });

  it('folds the new P11 kinds: bountyMult, wardIncomeMult, sellRefundBonus, ascensionAccess', () => {
    const mods = buildModifiers(save({
      spentSkillPoints: { scavenger: 2, wardenTithe: 2, salvage: 1, ascensions: 1 },
    }));
    expect(mods.bountyMult).toBeCloseTo(1.08); // 1 + 0.04 × 2
    expect(mods.wardIncomeMult).toBeCloseTo(1.3); // 1 + 0.15 × 2
    expect(mods.sellRefundBonus).toBeCloseTo(0.1);
    expect(mods.ascensionsUnlocked).toBe(true);
  });

  it('ascensionsUnlocked stays false until the ascensions node is owned (mirrors specAccess)', () => {
    expect(buildModifiers(save({ spentSkillPoints: { goldenAge: 1 } })).ascensionsUnlocked).toBe(false);
  });

  it('a mastered node uses its enhanced effect for ALL ranks', () => {
    const mods = buildModifiers(save({
      spentSkillPoints: { prospecting: 2, fieldMedicine: 1 },
      masteredNodes: ['prospecting', 'fieldMedicine'],
    }));
    expect(mods.extraStartingGold).toBe(60); // 30 × 2 ranks
    expect(mods.lifeRegenPerWave).toBe(2);
  });

  it('unlockedTowers is the three neutral defaults plus whatever element towers the save has earned via boss kills', () => {
    expect(unlockedTowers(save())).toEqual(['watchSentry', 'boulderMortar', 'wardenBeacon']);
    expect(unlockedTowers(save({ spentSkillPoints: { prospecting: 2, scavenger: 2 } })))
      .toEqual(['watchSentry', 'boulderMortar', 'wardenBeacon']);
    expect(unlockedTowers(save({ unlockedElementTowers: ['emberSpire'] })))
      .toEqual(['watchSentry', 'boulderMortar', 'wardenBeacon', 'emberSpire']);
  });
});

describe('P12: biome finale tower unlocks', () => {
  const win = { won: true, goldEarned: 100, livesRemaining: 15, leaked: true };

  it('winning level20 unlocks frostObelisk (once)', () => {
    const { summary, save: after } = applyAttempt(save(), 'level20', win);
    expect(summary.towerUnlocked).toBe('frostObelisk');
    expect(after.unlockedElementTowers).toContain('frostObelisk');
    const again = applyAttempt(after, 'level20', win);
    expect(again.summary.towerUnlocked).toBeUndefined();
  });

  it('winning level30 unlocks thornTotem; winning level19/level29 unlocks nothing', () => {
    expect(applyAttempt(save(), 'level30', win).summary.towerUnlocked).toBe('thornTotem');
    expect(applyAttempt(save(), 'level19', win).summary.towerUnlocked).toBeUndefined();
    expect(applyAttempt(save(), 'level29', win).summary.towerUnlocked).toBeUndefined();
  });

  it('a biome-3 profile fields neutrals + ember + frost in the palette filter', () => {
    expect(unlockedTowers(save({ unlockedElementTowers: ['emberSpire', 'frostObelisk'] })))
      .toEqual(['watchSentry', 'boulderMortar', 'wardenBeacon', 'emberSpire', 'frostObelisk']);
  });
});

describe('P13: biome finale tower unlocks', () => {
  const win = { won: true, goldEarned: 100, livesRemaining: 15, leaked: true };

  it('winning level40 unlocks stormPylon (once)', () => {
    const { summary, save: after } = applyAttempt(save(), 'level40', win);
    expect(summary.towerUnlocked).toBe('stormPylon');
    expect(after.unlockedElementTowers).toContain('stormPylon');
    const again = applyAttempt(after, 'level40', win);
    expect(again.summary.towerUnlocked).toBeUndefined();
  });

  it('winning level50 unlocks sunShrine; winning level39/level49 unlocks nothing', () => {
    expect(applyAttempt(save(), 'level50', win).summary.towerUnlocked).toBe('sunShrine');
    expect(applyAttempt(save(), 'level39', win).summary.towerUnlocked).toBeUndefined();
    expect(applyAttempt(save(), 'level49', win).summary.towerUnlocked).toBeUndefined();
  });

  it('a biome-5 profile fields neutrals + all four earned element towers in the palette filter', () => {
    expect(unlockedTowers(save({ unlockedElementTowers: ['emberSpire', 'frostObelisk', 'thornTotem', 'stormPylon'] })))
      .toEqual(['watchSentry', 'boulderMortar', 'wardenBeacon', 'emberSpire', 'frostObelisk', 'thornTotem', 'stormPylon']);
  });
});

describe('P14: the campaign-finale tower unlock', () => {
  const win = { won: true, goldEarned: 100, livesRemaining: 15, leaked: true };

  it('winning level60 unlocks umbraMonolith (once)', () => {
    const { summary, save: after } = applyAttempt(save(), 'level60', win);
    expect(summary.towerUnlocked).toBe('umbraMonolith');
    expect(after.unlockedElementTowers).toContain('umbraMonolith');
    const again = applyAttempt(after, 'level60', win);
    expect(again.summary.towerUnlocked).toBeUndefined();
  });

  it('winning level59 unlocks nothing — only the finale pays the shadow tower', () => {
    expect(applyAttempt(save(), 'level59', win).summary.towerUnlocked).toBeUndefined();
  });

  it('a campaign-complete profile fields all nine towers in the palette filter', () => {
    expect(unlockedTowers(save({ unlockedElementTowers: ['emberSpire', 'frostObelisk', 'thornTotem', 'stormPylon', 'sunShrine', 'umbraMonolith'] })))
      .toEqual(['watchSentry', 'boulderMortar', 'wardenBeacon', 'emberSpire', 'frostObelisk', 'thornTotem', 'stormPylon', 'sunShrine', 'umbraMonolith']);
  });
});

describe('endless XP taper (spec §9)', () => {
  it('endlessWaveXp climbs 10, 12, 14… and caps at 40', () => {
    expect(endlessWaveXp(1)).toBe(10);
    expect(endlessWaveXp(2)).toBe(12);
    expect(endlessWaveXp(16)).toBe(40);
    expect(endlessWaveXp(30)).toBe(40);
  });

  it('a record-pushing run pays full rate (4 fresh waves = 52 XP)', () => {
    expect(endlessRunXp(4, 0)).toBe(10 + 12 + 14 + 16);
  });

  it('re-farmed waves pay 20% (same 4 waves at best>=4 = 10 XP)', () => {
    expect(endlessRunXp(4, 4)).toBe(Math.round((10 + 12 + 14 + 16) * 0.2));
    expect(endlessRunXp(4, 2)).toBe(Math.round((10 + 12) * 0.2 + 14 + 16));
  });

  it('applyEndlessAttempt: record climbs monotonically and flags newRecord', () => {
    let save = freshSave();
    const first = applyEndlessAttempt(save, 'level01', 6);
    expect(first.summary.newRecord).toBe(true);
    expect(first.save.endless.level01.bestWave).toBe(6);
    const worse = applyEndlessAttempt(first.save, 'level01', 3);
    expect(worse.summary.newRecord).toBe(false);
    expect(worse.save.endless.level01.bestWave).toBe(6); // never regresses
  });

  it('applyEndlessAttempt adds XP and is pure (input save untouched)', () => {
    const save = freshSave();
    const snapshot = JSON.stringify(save);
    const { save: next, summary } = applyEndlessAttempt(save, 'level01', 4);
    expect(summary.xpEarned).toBe(52);
    expect(next.xp).toBe(52);
    expect(JSON.stringify(save)).toBe(snapshot);
  });

  it('recordEndlessRunStart increments runs and returns the attempt number', () => {
    const a = recordEndlessRunStart(freshSave(), 'level01');
    expect(a.attempt).toBe(1);
    expect(a.save.endless.level01).toEqual({ bestWave: 0, runs: 1 });
    const b = recordEndlessRunStart(a.save, 'level01');
    expect(b.attempt).toBe(2);
    expect(b.save.endless.level01.runs).toBe(2);
  });
});

describe('P15: the Rainbow Mode gate and record', () => {
  const allClears = CAMPAIGN.map((l) => l.id);

  it('unlocks only when EVERY campaign level has a first clear', () => {
    expect(rainbowUnlocked(save())).toBe(false);
    expect(rainbowUnlocked(save({ firstClears: allClears.slice(0, 59) }))).toBe(false); // 59/60: level60 missing
    expect(rainbowUnlocked(save({ firstClears: allClears }))).toBe(true);
  });

  it('unlockedLevels alone does not unlock it — firstClears is the gate (recordWin caps at 60)', () => {
    expect(rainbowUnlocked(save({ unlockedLevels: 60 }))).toBe(false);
  });

  it("records live under the 'rainbow' endless key: attempt counter, best wave, tapered XP", () => {
    const started = recordEndlessRunStart(save(), 'rainbow');
    expect(started.attempt).toBe(1);
    expect(started.save.endless.rainbow).toEqual({ bestWave: 0, runs: 1 });
    const { save: after, summary } = applyEndlessAttempt(started.save, 'rainbow', 12);
    expect(after.endless.rainbow).toEqual({ bestWave: 12, runs: 1 });
    expect(summary.newRecord).toBe(true);
    expect(summary.xpEarned).toBe(endlessRunXp(12, 0));
    // Re-farming below the record tapers, exactly like per-level endless.
    const again = applyEndlessAttempt(after, 'rainbow', 10);
    expect(again.save.endless.rainbow.bestWave).toBe(12);
    expect(again.summary.xpEarned).toBe(endlessRunXp(10, 12));
  });
});
