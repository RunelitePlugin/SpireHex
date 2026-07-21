/**
 * P13 scripted builds — RADIANT SUMMITS (biome 5) ONLY. The storm lane's
 * builds live in p13StormBuilds.ts; the pool below is deliberately
 * RE-DECLARED rather than imported so the two lock lanes share ZERO files
 * (P12 integration lesson). A biome-5 player owns the neutral triad plus
 * emberSpire, frostObelisk, thornTotem and the stormPylon earned at level40.
 * Radiant has NO 1.5x counter until biome 6 — the toolkit is the answer.
 * All numbers prototype-measured at seed 1; see the P13 plan evidence table.
 */
import { place, spec, upgrade, type Step } from './harness';

export const P13_OPENING_TYPES_RADIANT: readonly string[] =
  ['watchSentry', 'boulderMortar', 'wardenBeacon', 'emberSpire', 'frostObelisk', 'thornTotem', 'stormPylon'];

export const P13_RADIANT_WINNABILITY: Record<string, Step[]> = {
  level41: [
    place('boulderMortar', 5, 3, 'M1'), place('thornTotem', 7, 5, 'T1'),
    upgrade('M1'), upgrade('M1'), spec('mortarClusterRain', 'M1'),
    upgrade('T1'), upgrade('T1'), spec('thornPlaguebearer', 'T1'),
    place('watchSentry', 10, 5, 'S1'), upgrade('S1'), upgrade('S1'),
  ],
  level42: [
    place('stormPylon', 7, 5, 'P1'), place('frostObelisk', 5, 5, 'F1'),
    upgrade('P1'), upgrade('P1'), spec('stormTempestCoil', 'P1'),
    upgrade('F1'), upgrade('F1'), spec('frostDeepFreeze', 'F1'),
    place('watchSentry', 10, 4, 'S1'), upgrade('S1'), upgrade('S1'), spec('sentryMarksman', 'S1'),
  ],
  level43: [
    place('watchSentry', 5, 5, 'S1'), place('stormPylon', 7, 5, 'P1'),
    upgrade('S1'), upgrade('S1'), spec('sentryMarksman', 'S1'),
    upgrade('P1'), upgrade('P1'), spec('stormTempestCoil', 'P1'),
    place('boulderMortar', 8, 5, 'M1'), upgrade('M1'), upgrade('M1'), spec('mortarColossus', 'M1'),
  ],
  level44: [
    place('boulderMortar', 7, 5, 'M1'), upgrade('M1'), upgrade('M1'), spec('mortarClusterRain', 'M1'),
    place('stormPylon', 3, 3, 'P1'), upgrade('P1'), upgrade('P1'), spec('stormTempestCoil', 'P1'),
    place('wardenBeacon', 8, 6, 'W1'),
    place('watchSentry', 10, 4, 'S1'), upgrade('S1'), upgrade('S1'), spec('sentryMarksman', 'S1'),
    upgrade('W1'), upgrade('W1'),
    place('watchSentry', 11, 7, 'S2'), upgrade('S2'), upgrade('S2'), spec('sentryMarksman', 'S2'),
    place('frostObelisk', 12, 4, 'F1'), upgrade('F1'), upgrade('F1'),
  ],
  level45: [
    place('thornTotem', 6, 3, 'T1'), place('stormPylon', 8, 5, 'P1'),
    upgrade('T1'), upgrade('T1'), spec('thornPlaguebearer', 'T1'),
    upgrade('P1'), upgrade('P1'), spec('stormTempestCoil', 'P1'),
    place('boulderMortar', 9, 5, 'M1'), upgrade('M1'), upgrade('M1'), spec('mortarClusterRain', 'M1'),
  ],
  level46: [
    place('emberSpire', 4, 4, 'E1'), place('stormPylon', 7, 4, 'P1'),
    upgrade('E1'), upgrade('E1'), spec('emberMeteorCaller', 'E1'),
    upgrade('P1'), upgrade('P1'), spec('stormTempestCoil', 'P1'),
    place('watchSentry', 10, 4, 'S1'), upgrade('S1'), upgrade('S1'), spec('sentryMarksman', 'S1'),
    place('frostObelisk', 8, 4, 'F1'), upgrade('F1'), upgrade('F1'),
  ],
  level47: [
    place('boulderMortar', 8, 5, 'M1'), place('stormPylon', 8, 3, 'P1'),
    place('wardenBeacon', 10, 5, 'W1'),
    upgrade('M1'), upgrade('M1'), spec('mortarClusterRain', 'M1'),
    upgrade('P1'), upgrade('P1'), spec('stormTempestCoil', 'P1'),
    place('watchSentry', 5, 4, 'S1'), upgrade('S1'), upgrade('S1'), spec('sentryMarksman', 'S1'),
    place('frostObelisk', 11, 5, 'F1'), upgrade('F1'), upgrade('F1'),
  ],
  level48: [
    place('boulderMortar', 7, 2, 'N1'), place('boulderMortar', 8, 7, 'S1'),
    place('wardenBeacon', 10, 3, 'W1'),
    upgrade('N1'), upgrade('N1'), upgrade('S1'), upgrade('S1'),
    spec('mortarClusterRain', 'N1'),
    place('wardenBeacon', 9, 7, 'W2'),
    spec('mortarClusterRain', 'S1'),
    place('watchSentry', 11, 3, 'X1'), upgrade('X1'), upgrade('X1'), spec('sentryMarksman', 'X1'),
    place('watchSentry', 11, 6, 'X2'), upgrade('X2'), upgrade('X2'), spec('sentryMarksman', 'X2'),
  ],
  level49: [
    place('stormPylon', 7, 5, 'P1'), upgrade('P1'), upgrade('P1'), spec('stormTempestCoil', 'P1'),
    place('boulderMortar', 9, 5, 'M1'), upgrade('M1'), upgrade('M1'), spec('mortarClusterRain', 'M1'),
    place('watchSentry', 10, 4, 'S1'), upgrade('S1'), upgrade('S1'), spec('sentryMarksman', 'S1'),
    place('wardenBeacon', 6, 5, 'W1'), upgrade('W1'), upgrade('W1'),
    place('frostObelisk', 4, 3, 'F1'), upgrade('F1'), upgrade('F1'), spec('frostDeepFreeze', 'F1'),
  ],
  level50: [
    place('boulderMortar', 10, 5, 'M1'), place('stormPylon', 11, 5, 'P1'),
    upgrade('M1'), upgrade('M1'), spec('mortarClusterRain', 'M1'),
    upgrade('P1'), upgrade('P1'), spec('stormTempestCoil', 'P1'),
    place('frostObelisk', 12, 5, 'F1'), upgrade('F1'), upgrade('F1'), spec('frostDeepFreeze', 'F1'),
    place('watchSentry', 13, 5, 'S1'), upgrade('S1'), upgrade('S1'), spec('sentryMarksman', 'S1'),
    place('watchSentry', 14, 5, 'S2'), upgrade('S2'), upgrade('S2'), spec('sentryMarksman', 'S2'),
    place('wardenBeacon', 9, 5, 'W1'), upgrade('W1'), upgrade('W1'),
    place('emberSpire', 8, 5, 'E1'), upgrade('E1'), upgrade('E1'), spec('emberMeteorCaller', 'E1'),
  ],
};

// level50 shield lesson: the SAME firepower with NO Deep Freeze — the Luminarch
// walks its shield windows out of tower range and leaks at 3047 hp (measured
// won 9/20). With the slow, the same castle holds it through 14 shield cycles
// and kills at 14/20: vs a WALKING boss, slow recovers ~3000 hp of exposure.
export const L50_NOSLOW: Step[] = [
  place('boulderMortar', 10, 5, 'M1'), place('stormPylon', 11, 5, 'P1'),
  upgrade('M1'), upgrade('M1'), spec('mortarClusterRain', 'M1'),
  upgrade('P1'), upgrade('P1'), spec('stormTempestCoil', 'P1'),
  place('watchSentry', 13, 5, 'S1'), upgrade('S1'), upgrade('S1'), spec('sentryMarksman', 'S1'),
  place('watchSentry', 14, 5, 'S2'), upgrade('S2'), upgrade('S2'), spec('sentryMarksman', 'S2'),
  place('wardenBeacon', 9, 5, 'W1'), upgrade('W1'), upgrade('W1'),
  place('emberSpire', 8, 5, 'E1'), upgrade('E1'), upgrade('E1'), spec('emberMeteorCaller', 'E1'),
  place('watchSentry', 12, 3, 'S3'), upgrade('S3'), upgrade('S3'), spec('sentryMarksman', 'S3'),
];

/** Best-coverage opening hexes per Radiant dual-road level (offset col,row). */
export const P13_RADIANT_OPENING_HEXES: Record<string, { north: [number, number]; south: [number, number] }> = {
  level44: { north: [3, 3], south: [7, 5] },
  level48: { north: [7, 2], south: [8, 7] },
};

/** Fixed generic follow-up spine after the opening pair (neutral triad — measured best for both radiant forks). */
export const P13_RADIANT_FOLLOWUPS: Record<string, Step[]> = {
  level44: [
    place('boulderMortar', 10, 4, 'F1'), place('wardenBeacon', 8, 6, 'F2'), place('watchSentry', 11, 7, 'F3'),
    upgrade('F1'), upgrade('F1'), upgrade('F2'), upgrade('F2'), upgrade('F3'), upgrade('F3'),
  ],
  level48: [
    place('boulderMortar', 11, 3, 'F1'), place('wardenBeacon', 9, 7, 'F2'), place('watchSentry', 11, 6, 'F3'),
    upgrade('F1'), upgrade('F1'), upgrade('F2'), upgrade('F2'), upgrade('F3'), upgrade('F3'),
  ],
};
