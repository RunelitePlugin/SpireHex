import { describe, expect, it } from 'vitest';
import { BIOME_FAMILY } from '../../src/content/biomeRoster';
import { CAMPAIGN, CONTENT, LEVELS } from '../../src/content';
import { endlessContent, endlessRoster, endlessWave, makeEndlessLevel } from '../../src/content/endless';
import {
  ENDLESS_MINIMAL_BUILD,
  ENDLESS_NEUTRAL_MINIMAL_BUILD,
  ENDLESS_NEUTRAL_REFERENCE_BUILD,
  ENDLESS_REFERENCE_BUILD,
  P12_ENDLESS_L11_MIN,
  P12_ENDLESS_L11_REF,
  P12_ENDLESS_L21_MIN,
  P12_ENDLESS_L21_REF,
  P13_ENDLESS_L31_MIN,
  P13_ENDLESS_L31_REF,
  P13_ENDLESS_L41_MIN,
  P13_ENDLESS_L41_REF,
  P14_ENDLESS_L51_MIN,
  P14_ENDLESS_L51_REF,
  runEndlessProbe,
  P15_RAINBOW_MIN,
  P15_RAINBOW_REF,
  runRainbowProbe,
} from './endlessHarness';

// Shared across tests — each probe run is deterministic (seed 1) and fast.
const ref1 = runEndlessProbe(ENDLESS_REFERENCE_BUILD, 1);
const min1 = runEndlessProbe(ENDLESS_MINIMAL_BUILD, 1);
const neutralRef1 = runEndlessProbe(ENDLESS_NEUTRAL_REFERENCE_BUILD, 1);
const neutralMin1 = runEndlessProbe(ENDLESS_NEUTRAL_MINIMAL_BUILD, 1);

// P11 family-roster re-lock (roster is now the 6-enemy Ember family on every
// map): element ref measured 29/27/26 (was 30/29/27); minimal 10 (was 12).
describe('endless scaling (level01, seed 1) — prototype-locked', () => {
  it('reference build, attempt 1: clears exactly 29 waves, then LOSES (scaling has teeth)', () => {
    expect(ref1.status).toBe('lost');
    expect(ref1.wavesCleared).toBe(29);
  });

  it('reference build attempts 2-3 stay inside the 22-34 survival envelope (measured 27, 26)', () => {
    for (const attempt of [2, 3]) {
      const r = runEndlessProbe(ENDLESS_REFERENCE_BUILD, attempt);
      expect(r.status).toBe('lost');
      expect(r.wavesCleared).toBeGreaterThanOrEqual(22);
      expect(r.wavesCleared).toBeLessThanOrEqual(34);
    }
  });

  it('minimal build dies in the 8-16 band (measured 10) — depth must be earned', () => {
    expect(min1.status).toBe('lost');
    expect(min1.wavesCleared).toBeGreaterThanOrEqual(8);
    expect(min1.wavesCleared).toBeLessThanOrEqual(16);
  });

  it('the reference build outlives the minimal build by at least 10 waves', () => {
    expect(ref1.wavesCleared - min1.wavesCleared).toBeGreaterThanOrEqual(10);
  });

  // P11 NEUTRAL roster re-lock: a fresh neutral-only profile, same family pool.
  it('NEUTRAL reference build attempts 1-3 stay inside the 14-30 band (measured 18, 18, 26)', () => {
    expect(neutralRef1.status).toBe('lost');
    expect(neutralRef1.wavesCleared).toBeGreaterThanOrEqual(14);
    expect(neutralRef1.wavesCleared).toBeLessThanOrEqual(30);
    for (const attempt of [2, 3]) {
      const r = runEndlessProbe(ENDLESS_NEUTRAL_REFERENCE_BUILD, attempt);
      expect(r.status).toBe('lost');
      expect(r.wavesCleared).toBeGreaterThanOrEqual(14);
      expect(r.wavesCleared).toBeLessThanOrEqual(30);
    }
  });

  it('NEUTRAL minimal build dies in the 8-16 band (measured 10); NEUTRAL ref outlives it by ≥ 6', () => {
    expect(neutralMin1.status).toBe('lost');
    expect(neutralMin1.wavesCleared).toBeGreaterThanOrEqual(8);
    expect(neutralMin1.wavesCleared).toBeLessThanOrEqual(16);
    expect(neutralRef1.wavesCleared - neutralMin1.wavesCleared).toBeGreaterThanOrEqual(6);
  });

  it('generating endless data leaves campaign content byte-identical (neutrality)', () => {
    const contentBefore = JSON.stringify(CONTENT);
    const levelsBefore = JSON.stringify(LEVELS);
    makeEndlessLevel(CAMPAIGN[0], 1);
    endlessContent(CAMPAIGN[3]);
    for (let k = 0; k < 20; k++) endlessWave(CAMPAIGN[6], 2, k);
    expect(JSON.stringify(CONTENT)).toBe(contentBefore);
    expect(JSON.stringify(LEVELS)).toBe(levelsBefore);
  });

  it('endlessRoster(level10) contains NO boss-flagged enemy (boss-exclusion pin)', () => {
    const roster = endlessRoster(LEVELS.level10);
    for (const id of roster) expect(CONTENT.enemies[id].boss).toBeUndefined();
  });

  it('endlessRoster(level01) equals the sorted Ember family (degeneration regression pin)', () => {
    expect(endlessRoster(LEVELS.level01)).toEqual([...BIOME_FAMILY.ember].sort());
  });
});

describe('P12 endless family rosters (level11 frost / level21 verdant, seed 1) — prototype-locked', () => {
  it('level11 frost ref: attempt 1 clears exactly 37 then LOSES; attempts 2-3 in 32-46 (measured 40, 39)', () => {
    const a1 = runEndlessProbe(P12_ENDLESS_L11_REF, 1, 10);
    expect(a1.status).toBe('lost');
    expect(a1.wavesCleared).toBe(37);
    for (const attempt of [2, 3]) {
      const r = runEndlessProbe(P12_ENDLESS_L11_REF, attempt, 10);
      expect(r.status).toBe('lost');
      expect(r.wavesCleared).toBeGreaterThanOrEqual(32);
      expect(r.wavesCleared).toBeLessThanOrEqual(46);
    }
  });

  it('level11 minimal dies in 8-16 (measured 12); ref outlives it by ≥ 15', () => {
    const min = runEndlessProbe(P12_ENDLESS_L11_MIN, 1, 10);
    expect(min.status).toBe('lost');
    expect(min.wavesCleared).toBeGreaterThanOrEqual(8);
    expect(min.wavesCleared).toBeLessThanOrEqual(16);
    expect(runEndlessProbe(P12_ENDLESS_L11_REF, 1, 10).wavesCleared - min.wavesCleared).toBeGreaterThanOrEqual(15);
  });

  it('level21 verdant ref: attempt 1 clears exactly 45 then LOSES; attempts 2-3 in 34-50 (measured 42, 39)', () => {
    const a1 = runEndlessProbe(P12_ENDLESS_L21_REF, 1, 20);
    expect(a1.status).toBe('lost');
    expect(a1.wavesCleared).toBe(45);
    for (const attempt of [2, 3]) {
      const r = runEndlessProbe(P12_ENDLESS_L21_REF, attempt, 20);
      expect(r.status).toBe('lost');
      expect(r.wavesCleared).toBeGreaterThanOrEqual(34);
      expect(r.wavesCleared).toBeLessThanOrEqual(50);
    }
  });

  it('level21 minimal dies in 8-16 (measured 11); ref outlives it by ≥ 15', () => {
    const min = runEndlessProbe(P12_ENDLESS_L21_MIN, 1, 20);
    expect(min.status).toBe('lost');
    expect(min.wavesCleared).toBeGreaterThanOrEqual(8);
    expect(min.wavesCleared).toBeLessThanOrEqual(16);
    expect(runEndlessProbe(P12_ENDLESS_L21_REF, 1, 20).wavesCleared - min.wavesCleared).toBeGreaterThanOrEqual(15);
  });

  it('endlessRoster of a frost and a verdant map equals its sorted family; no boss-flagged member', () => {
    expect(endlessRoster(LEVELS.level14)).toEqual([...BIOME_FAMILY.frost].sort());
    expect(endlessRoster(LEVELS.level24)).toEqual([...BIOME_FAMILY.verdant].sort());
    for (const id of [...endlessRoster(LEVELS.level20), ...endlessRoster(LEVELS.level30)]) {
      expect(CONTENT.enemies[id].boss, id).toBeUndefined();
    }
  });
});

describe('P13 endless family rosters (level31 storm / level41 radiant, seed 1) — prototype-locked', () => {
  it('level31 storm ref: attempt 1 clears exactly 37 then LOSES; attempts 2-3 in 31-43 (measured 36, 38)', () => {
    const a1 = runEndlessProbe(P13_ENDLESS_L31_REF, 1, 30);
    expect(a1.status).toBe('lost');
    expect(a1.wavesCleared).toBe(37);
    for (const attempt of [2, 3]) {
      const r = runEndlessProbe(P13_ENDLESS_L31_REF, attempt, 30);
      expect(r.status).toBe('lost');
      expect(r.wavesCleared).toBeGreaterThanOrEqual(31);
      expect(r.wavesCleared).toBeLessThanOrEqual(43);
    }
  });

  it('level31 minimal dies in 8-16 (measured 11); ref outlives it by ≥ 15 (measured 26)', () => {
    const min = runEndlessProbe(P13_ENDLESS_L31_MIN, 1, 30);
    expect(min.status).toBe('lost');
    expect(min.wavesCleared).toBeGreaterThanOrEqual(8);
    expect(min.wavesCleared).toBeLessThanOrEqual(16);
    expect(runEndlessProbe(P13_ENDLESS_L31_REF, 1, 30).wavesCleared - min.wavesCleared).toBeGreaterThanOrEqual(15);
  });

  it('level41 radiant ref: attempt 1 clears exactly 37 then LOSES; attempts 2-3 in 27-43 (measured 32, 37)', () => {
    const a1 = runEndlessProbe(P13_ENDLESS_L41_REF, 1, 40);
    expect(a1.status).toBe('lost');
    expect(a1.wavesCleared).toBe(37);
    for (const attempt of [2, 3]) {
      const r = runEndlessProbe(P13_ENDLESS_L41_REF, attempt, 40);
      expect(r.status).toBe('lost');
      expect(r.wavesCleared).toBeGreaterThanOrEqual(27);
      expect(r.wavesCleared).toBeLessThanOrEqual(43);
    }
  });

  it('level41 minimal dies in 8-16 (measured 11); ref outlives it by ≥ 15 (measured 26)', () => {
    const min = runEndlessProbe(P13_ENDLESS_L41_MIN, 1, 40);
    expect(min.status).toBe('lost');
    expect(min.wavesCleared).toBeGreaterThanOrEqual(8);
    expect(min.wavesCleared).toBeLessThanOrEqual(16);
    expect(runEndlessProbe(P13_ENDLESS_L41_REF, 1, 40).wavesCleared - min.wavesCleared).toBeGreaterThanOrEqual(15);
  });

  it('endlessRoster of a storm and a radiant map equals its sorted family; no boss-flagged member', () => {
    expect(endlessRoster(LEVELS.level34)).toEqual([...BIOME_FAMILY.storm].sort());
    expect(endlessRoster(LEVELS.level44)).toEqual([...BIOME_FAMILY.radiant].sort());
    for (const id of [...endlessRoster(LEVELS.level40), ...endlessRoster(LEVELS.level50)]) {
      expect(CONTENT.enemies[id].boss, id).toBeUndefined();
    }
  });
});

describe('P14 endless family roster (level51 umbral, seed 1) — prototype-locked', () => {
  it('level51 umbral ref: attempt 1 clears exactly 36 then LOSES; attempts 2-3 in 26-41 (measured 31, 31)', () => {
    const a1 = runEndlessProbe(P14_ENDLESS_L51_REF, 1, 50);
    expect(a1.wavesCleared).toBe(36);
    expect(a1.status).toBe('lost');
    for (const attempt of [2, 3]) {
      const r = runEndlessProbe(P14_ENDLESS_L51_REF, attempt, 50);
      expect(r.wavesCleared, `attempt ${attempt}`).toBeGreaterThanOrEqual(26);
      expect(r.wavesCleared, `attempt ${attempt}`).toBeLessThanOrEqual(41);
      expect(r.status).toBe('lost');
    }
  });

  it('level51 minimal dies in 8-16 (measured 14); ref outlives it by >= 15 (measured 22)', () => {
    const min = runEndlessProbe(P14_ENDLESS_L51_MIN, 1, 50);
    expect(min.wavesCleared).toBeGreaterThanOrEqual(8);
    expect(min.wavesCleared).toBeLessThanOrEqual(16);
    expect(min.status).toBe('lost');
    expect(runEndlessProbe(P14_ENDLESS_L51_REF, 1, 50).wavesCleared - min.wavesCleared).toBeGreaterThanOrEqual(15);
  });

  it('endlessRoster of an umbral map equals its sorted family; no boss-flagged member', () => {
    const roster = endlessRoster(LEVELS.level51);
    expect(roster).toEqual([...BIOME_FAMILY.umbral].sort());
    for (const id of roster) expect(CONTENT.enemies[id].boss, id).toBeUndefined();
  });
});

describe('P15 Rainbow Mode survival (the Prismatic Causeway, seed 1) — prototype-locked', () => {
  it('rainbow ref: attempt 1 clears exactly 41 then LOSES; attempts 2-3 in 35-49 (measured 40, 44)', () => {
    const a1 = runRainbowProbe(P15_RAINBOW_REF, 1);
    expect(a1.wavesCleared).toBe(41);
    expect(a1.status).toBe('lost');
    for (const attempt of [2, 3]) {
      const r = runRainbowProbe(P15_RAINBOW_REF, attempt);
      expect(r.wavesCleared, `attempt ${attempt}`).toBeGreaterThanOrEqual(35);
      expect(r.wavesCleared, `attempt ${attempt}`).toBeLessThanOrEqual(49);
      expect(r.status).toBe('lost');
    }
  }, 30000); // three ~50k-tick runs — the 5s default trips under parallel suite load

  it('rainbow minimal dies in 15-25 (measured 21); ref outlives it by >= 15 (measured 20)', () => {
    const min = runRainbowProbe(P15_RAINBOW_MIN, 1);
    expect(min.wavesCleared).toBeGreaterThanOrEqual(15);
    expect(min.wavesCleared).toBeLessThanOrEqual(25);
    expect(min.status).toBe('lost');
    expect(runRainbowProbe(P15_RAINBOW_REF, 1).wavesCleared - min.wavesCleared).toBeGreaterThanOrEqual(15);
  }, 30000);
});
