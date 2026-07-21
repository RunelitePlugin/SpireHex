/**
 * P13 scripted builds — STORM REACH (biome 4) ONLY. The radiant lane's builds
 * live in p13RadiantBuilds.ts: the two lock lanes share ZERO files by
 * construction (P12 integration lesson — no more cross-lane union merges).
 * Pools model UNLOCK STATE: a biome-4 player owns the neutral triad plus
 * emberSpire (level10), frostObelisk (level20) and thornTotem (level30) —
 * thornTotem is the biome's 1.5x counter. The sim never gates towers
 * (unlocks are a game-layer palette filter) — the harness models the player.
 * All numbers prototype-measured at seed 1; see the P13 plan evidence table.
 */
import { place, spec, upgrade, type Step } from './harness';

export const P13_OPENING_TYPES_STORM: readonly string[] =
  ['watchSentry', 'boulderMortar', 'wardenBeacon', 'emberSpire', 'frostObelisk', 'thornTotem'];

export const P13_STORM_WINNABILITY: Record<string, Step[]> = {
  level31: [
    place('thornTotem', 5, 3, 'T1'), place('boulderMortar', 8, 4, 'M1'),
    upgrade('T1'), upgrade('T1'), spec('thornPlaguebearer', 'T1'),
    upgrade('M1'), upgrade('M1'), spec('mortarClusterRain', 'M1'),
    place('watchSentry', 11, 4, 'S1'), upgrade('S1'), upgrade('S1'),
  ],
  level32: [
    place('frostObelisk', 7, 5, 'F1'), place('thornTotem', 5, 3, 'T1'),
    upgrade('F1'), upgrade('F1'), spec('frostDeepFreeze', 'F1'),
    upgrade('T1'), upgrade('T1'), spec('thornPlaguebearer', 'T1'),
    place('watchSentry', 10, 4, 'S1'), upgrade('S1'), upgrade('S1'), spec('sentryMarksman', 'S1'),
  ],
  level33: [
    place('watchSentry', 6, 5, 'S1'), place('thornTotem', 4, 3, 'T1'),
    upgrade('S1'), upgrade('S1'), spec('sentryMarksman', 'S1'),
    upgrade('T1'), upgrade('T1'), spec('thornPlaguebearer', 'T1'),
    place('boulderMortar', 7, 5, 'M1'), upgrade('M1'), upgrade('M1'), spec('mortarColossus', 'M1'),
  ],
  level34: [
    place('boulderMortar', 7, 5, 'M1'), upgrade('M1'), upgrade('M1'), spec('mortarClusterRain', 'M1'),
    place('thornTotem', 3, 3, 'T1'), upgrade('T1'), upgrade('T1'), spec('thornPlaguebearer', 'T1'),
    place('wardenBeacon', 8, 6, 'W1'),
    place('watchSentry', 10, 4, 'S1'), upgrade('S1'), upgrade('S1'), spec('sentryMarksman', 'S1'),
    upgrade('W1'), upgrade('W1'),
    place('watchSentry', 11, 7, 'S2'), upgrade('S2'), upgrade('S2'),
  ],
  level35: [
    place('thornTotem', 6, 3, 'T1'), place('boulderMortar', 8, 5, 'M1'),
    upgrade('T1'), upgrade('T1'), spec('thornPlaguebearer', 'T1'),
    upgrade('M1'), upgrade('M1'), spec('mortarClusterRain', 'M1'),
    place('thornTotem', 9, 5, 'T2'), upgrade('T2'), upgrade('T2'),
  ],
  level36: [
    place('emberSpire', 5, 4, 'E1'), place('thornTotem', 7, 4, 'T1'),
    upgrade('E1'), upgrade('E1'), spec('emberMeteorCaller', 'E1'),
    upgrade('T1'), upgrade('T1'), spec('thornPlaguebearer', 'T1'),
    place('watchSentry', 10, 4, 'S1'), upgrade('S1'), upgrade('S1'), spec('sentryMarksman', 'S1'),
    place('boulderMortar', 8, 4, 'M1'), upgrade('M1'), upgrade('M1'),
  ],
  level37: [
    place('boulderMortar', 8, 4, 'M1'), upgrade('M1'), upgrade('M1'), spec('mortarClusterRain', 'M1'),
    place('thornTotem', 8, 5, 'T1'), upgrade('T1'), upgrade('T1'), spec('thornPlaguebearer', 'T1'),
    place('watchSentry', 5, 3, 'S1'), upgrade('S1'), upgrade('S1'), spec('sentryMarksman', 'S1'),
    place('wardenBeacon', 10, 5, 'W1'), upgrade('W1'), upgrade('W1'),
    place('frostObelisk', 8, 2, 'F1'), upgrade('F1'), upgrade('F1'),
  ],
  level38: [
    place('boulderMortar', 7, 2, 'N1'), place('boulderMortar', 8, 7, 'S1'),
    place('wardenBeacon', 10, 3, 'W1'),
    upgrade('N1'), upgrade('N1'), upgrade('S1'), upgrade('S1'),
    spec('mortarClusterRain', 'N1'),
    place('wardenBeacon', 9, 7, 'W2'),
    spec('mortarClusterRain', 'S1'),
    place('thornTotem', 11, 3, 'T1'), upgrade('T1'), upgrade('T1'), spec('thornPlaguebearer', 'T1'),
    place('thornTotem', 11, 6, 'T2'), upgrade('T2'), upgrade('T2'), spec('thornPlaguebearer', 'T2'),
    place('watchSentry', 14, 2, 'S2'), upgrade('S2'), upgrade('S2'),
  ],
  level39: [
    place('thornTotem', 7, 5, 'T1'), upgrade('T1'), upgrade('T1'), spec('thornPlaguebearer', 'T1'),
    place('boulderMortar', 9, 5, 'M1'), upgrade('M1'), upgrade('M1'), spec('mortarClusterRain', 'M1'),
    place('watchSentry', 10, 4, 'S1'), upgrade('S1'), upgrade('S1'), spec('sentryMarksman', 'S1'),
    place('wardenBeacon', 6, 5, 'W1'), upgrade('W1'), upgrade('W1'),
    place('frostObelisk', 4, 3, 'F1'), upgrade('F1'), upgrade('F1'), spec('frostDeepFreeze', 'F1'),
  ],
  level40: [
    place('boulderMortar', 12, 5, 'M1'), upgrade('M1'), upgrade('M1'), spec('mortarClusterRain', 'M1'),
    place('thornTotem', 13, 5, 'T1'), upgrade('T1'), upgrade('T1'), spec('thornPlaguebearer', 'T1'),
    place('frostObelisk', 10, 5, 'F1'), upgrade('F1'), upgrade('F1'), spec('frostDeepFreeze', 'F1'),
    place('wardenBeacon', 11, 5, 'W1'), upgrade('W1'), upgrade('W1'),
    place('watchSentry', 13, 3, 'S1'), upgrade('S1'), upgrade('S1'), spec('sentryMarksman', 'S1'),
    place('frostObelisk', 14, 3, 'F2'), upgrade('F2'), upgrade('F2'), spec('frostDeepFreeze', 'F2'),
    place('watchSentry', 14, 5, 'S2'), upgrade('S2'), upgrade('S2'), spec('sentryMarksman', 'S2'),
    place('emberSpire', 12, 3, 'E1'), upgrade('E1'), upgrade('E1'), spec('emberMeteorCaller', 'E1'),
  ],
};

// level40 blink lesson: the SAME exit castle minus its two Deep Freeze obelisks.
// Blink advances pathDist directly — it cannot be slowed — so the bare castle's
// window is too short: measured won 9/20 with the boss LEAKING at 543 hp (vs the
// freeze-gate's 14/20 WITH the kill). Do not "fix" this by raising boss hp.
export const L40_GATECASTLE: Step[] = [
  place('boulderMortar', 12, 5, 'M1'), place('thornTotem', 13, 5, 'T1'),
  upgrade('M1'), upgrade('M1'), spec('mortarClusterRain', 'M1'),
  upgrade('T1'), upgrade('T1'), spec('thornPlaguebearer', 'T1'),
  place('wardenBeacon', 11, 5, 'W1'), upgrade('W1'), upgrade('W1'),
  place('watchSentry', 13, 3, 'S1'), upgrade('S1'), upgrade('S1'), spec('sentryMarksman', 'S1'),
  place('watchSentry', 14, 5, 'S2'), upgrade('S2'), upgrade('S2'), spec('sentryMarksman', 'S2'),
  place('emberSpire', 12, 3, 'E1'), upgrade('E1'), upgrade('E1'), spec('emberMeteorCaller', 'E1'),
];

/** Best-coverage opening hexes per Storm dual-road level (offset col,row). */
export const P13_STORM_OPENING_HEXES: Record<string, { north: [number, number]; south: [number, number] }> = {
  level34: { north: [3, 3], south: [7, 5] },
  level38: { north: [7, 2], south: [8, 7] },
};

/**
 * Fixed follow-up spine after the opening pair. PER-LEVEL DATA (prototype
 * finding #4): level34 measured best with the neutral triad (9/36); level38 is
 * unwinnable for spec-less neutrals (0/36) — its spine fields the earned Thorn
 * Totem (the biome counter IS the generic play there), measured 4/36.
 */
export const P13_STORM_FOLLOWUPS: Record<string, Step[]> = {
  level34: [
    place('boulderMortar', 10, 4, 'F1'), place('wardenBeacon', 8, 6, 'F2'), place('watchSentry', 11, 7, 'F3'),
    upgrade('F1'), upgrade('F1'), upgrade('F2'), upgrade('F2'), upgrade('F3'), upgrade('F3'),
  ],
  level38: [
    place('thornTotem', 11, 3, 'F1'), place('wardenBeacon', 9, 7, 'F2'), place('boulderMortar', 11, 6, 'F3'),
    upgrade('F1'), upgrade('F1'), upgrade('F2'), upgrade('F2'), upgrade('F3'), upgrade('F3'),
  ],
};
