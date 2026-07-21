/**
 * P12 scripted builds (biomes 2-3). Pools model UNLOCK STATE: a biome-2 player
 * owns the neutral triad + the Ember Spire earned at level10; biome 3 adds the
 * Frost Obelisk earned at level20. The sim never gates towers (unlocks are a
 * game-layer palette filter) — the harness models the player instead.
 * All numbers prototype-measured at seed 1; see the P12 plan evidence table.
 */
import { place, spec, upgrade, type Step } from './harness';

export const P12_OPENING_TYPES_FROST: readonly string[] = ['watchSentry', 'boulderMortar', 'wardenBeacon', 'emberSpire'];
export const P12_OPENING_TYPES_VERDANT: readonly string[] = [...P12_OPENING_TYPES_FROST, 'frostObelisk'];

export const P12_WINNABILITY_BUILDS: Record<string, Step[]> = {
  level11: [
    place('boulderMortar', 4, 5, 'M1'), place('emberSpire', 7, 5, 'E1'),
    upgrade('M1'), upgrade('M1'), upgrade('E1'), upgrade('E1'),
    spec('mortarClusterRain', 'M1'),
    place('watchSentry', 10, 5, 'S1'), upgrade('S1'), upgrade('S1'),
  ],
  level12: [
    place('emberSpire', 6, 5, 'E1'), place('boulderMortar', 4, 5, 'M1'),
    upgrade('E1'), upgrade('E1'), upgrade('M1'), upgrade('M1'),
    spec('emberMeteorCaller', 'E1'),
    place('watchSentry', 9, 4, 'S1'), upgrade('S1'), upgrade('S1'),
    spec('mortarClusterRain', 'M1'),
  ],
  level13: [
    place('watchSentry', 6, 4, 'S1'), place('emberSpire', 7, 4, 'E1'),
    upgrade('S1'), upgrade('S1'), upgrade('E1'), upgrade('E1'),
    spec('sentryMarksman', 'S1'),
    place('boulderMortar', 4, 4, 'M1'), upgrade('M1'), upgrade('M1'),
    spec('emberMeteorCaller', 'E1'),
  ],
  level14: [
    place('boulderMortar', 7, 5, 'M1'), place('emberSpire', 4, 4, 'E1'),
    place('wardenBeacon', 9, 4, 'W1'),
    upgrade('M1'), upgrade('M1'), upgrade('E1'), upgrade('E1'),
    spec('mortarClusterRain', 'M1'),
    place('watchSentry', 10, 4, 'S1'), upgrade('S1'), upgrade('S1'),
    spec('sentryMarksman', 'S1'),
    upgrade('W1'), upgrade('W1'),
    place('watchSentry', 5, 4, 'S2'), upgrade('S2'), upgrade('S2'),
  ],
  level15: [
    place('boulderMortar', 5, 4, 'M1'), place('boulderMortar', 8, 4, 'M2'),
    upgrade('M1'), upgrade('M1'), spec('mortarClusterRain', 'M1'),
    place('emberSpire', 6, 5, 'E1'), upgrade('E1'), upgrade('E1'),
    upgrade('M2'), upgrade('M2'), spec('mortarClusterRain', 'M2'),
  ],
  level16: [
    place('emberSpire', 5, 4, 'E1'), place('boulderMortar', 8, 4, 'M1'),
    upgrade('E1'), upgrade('E1'), upgrade('M1'), upgrade('M1'),
    spec('emberMeteorCaller', 'E1'),
    place('watchSentry', 10, 4, 'S1'), upgrade('S1'), upgrade('S1'),
    spec('sentryMarksman', 'S1'), spec('mortarColossus', 'M1'),
    place('wardenBeacon', 7, 5, 'W1'),
  ],
  level17: [
    place('boulderMortar', 8, 4, 'M1'), place('emberSpire', 8, 5, 'E1'),
    place('wardenBeacon', 10, 4, 'W1'),
    upgrade('M1'), upgrade('M1'), upgrade('E1'), upgrade('E1'),
    spec('mortarClusterRain', 'M1'),
    place('watchSentry', 6, 3, 'S1'), upgrade('S1'), upgrade('S1'),
    spec('sentryMarksman', 'S1'), spec('emberMeteorCaller', 'E1'),
    place('watchSentry', 4, 3, 'S2'), upgrade('S2'), upgrade('S2'),
  ],
  level18: [
    place('boulderMortar', 7, 2, 'N1'), place('boulderMortar', 8, 7, 'S1'),
    place('wardenBeacon', 10, 3, 'W1'),
    upgrade('N1'), upgrade('N1'), upgrade('S1'), upgrade('S1'),
    spec('mortarClusterRain', 'N1'),
    place('wardenBeacon', 9, 7, 'W2'),
    spec('mortarClusterRain', 'S1'),
    place('watchSentry', 11, 3, 'N2'), upgrade('N2'), upgrade('N2'),
    spec('sentryMarksman', 'N2'),
    place('watchSentry', 11, 8, 'S2'), upgrade('S2'), upgrade('S2'),
    spec('sentryMarksman', 'S2'),
    place('emberSpire', 4, 3, 'N3'), upgrade('N3'), upgrade('N3'),
  ],
  level19: [
    place('boulderMortar', 6, 5, 'M1'), place('emberSpire', 9, 5, 'E1'),
    place('wardenBeacon', 7, 6, 'W1'),
    upgrade('M1'), upgrade('M1'), upgrade('E1'), upgrade('E1'),
    spec('mortarClusterRain', 'M1'),
    place('watchSentry', 10, 4, 'S1'), upgrade('S1'), upgrade('S1'),
    spec('sentryMarksman', 'S1'), spec('emberMeteorCaller', 'E1'),
    place('watchSentry', 3, 3, 'S2'), upgrade('S2'), upgrade('S2'),
  ],
  level20: [
    place('boulderMortar', 10, 5, 'M1'), place('emberSpire', 11, 5, 'E1'),
    upgrade('E1'), upgrade('E1'), spec('emberMeteorCaller', 'E1'),
    upgrade('M1'), upgrade('M1'), spec('mortarClusterRain', 'M1'),
    place('wardenBeacon', 12, 5, 'W1'), upgrade('W1'), upgrade('W1'),
    place('watchSentry', 13, 5, 'S1'), upgrade('S1'), upgrade('S1'),
    spec('sentryMarksman', 'S1'),
    place('watchSentry', 14, 5, 'S2'), upgrade('S2'), upgrade('S2'),
    spec('sentryMarksman', 'S2'),
    place('emberSpire', 9, 5, 'E2'), upgrade('E2'), upgrade('E2'),
    spec('emberMeteorCaller', 'E2'),
  ],
  // levels 21-30 land with Task 11.
  level21: [
    place('boulderMortar', 4, 4, 'M1'), place('emberSpire', 7, 4, 'E1'),
    upgrade('M1'), upgrade('M1'), upgrade('E1'), upgrade('E1'),
    spec('mortarClusterRain', 'M1'),
    place('frostObelisk', 8, 4, 'F1'), upgrade('F1'), upgrade('F1'),
  ],
  level22: [
    place('frostObelisk', 5, 5, 'F1'), place('boulderMortar', 7, 5, 'M1'),
    upgrade('F1'), upgrade('F1'), upgrade('M1'), upgrade('M1'),
    spec('mortarClusterRain', 'M1'),
    place('watchSentry', 8, 5, 'S1'), upgrade('S1'), upgrade('S1'),
    spec('frostDeepFreeze', 'F1'),
  ],
  level23: [
    place('watchSentry', 4, 4, 'S1'), place('frostObelisk', 6, 4, 'F1'),
    upgrade('S1'), upgrade('S1'), upgrade('F1'), upgrade('F1'),
    spec('sentryMarksman', 'S1'),
    place('boulderMortar', 7, 4, 'M1'), upgrade('M1'), upgrade('M1'),
    spec('mortarColossus', 'M1'),
  ],
  level24: [
    place('boulderMortar', 8, 3, 'N1'), place('boulderMortar', 9, 7, 'S1'),
    place('wardenBeacon', 7, 8, 'W1'),
    upgrade('N1'), upgrade('N1'), upgrade('S1'), upgrade('S1'),
    spec('mortarClusterRain', 'N1'),
    place('watchSentry', 10, 7, 'S2'), upgrade('S2'), upgrade('S2'),
    spec('sentryMarksman', 'S2'),
    upgrade('W1'), upgrade('W1'),
    spec('mortarClusterRain', 'S1'),
    place('watchSentry', 10, 3, 'N2'), upgrade('N2'), upgrade('N2'),
    spec('sentryMarksman', 'N2'),
    place('frostObelisk', 6, 8, 'F1'), upgrade('F1'), upgrade('F1'),
  ],
  level25: [
    place('boulderMortar', 4, 4, 'M1'), place('boulderMortar', 8, 4, 'M2'),
    upgrade('M1'), upgrade('M1'), spec('mortarClusterRain', 'M1'),
    place('frostObelisk', 5, 5, 'F1'), upgrade('F1'), upgrade('F1'),
    upgrade('M2'), upgrade('M2'), spec('mortarClusterRain', 'M2'),
    place('emberSpire', 7, 3, 'E1'), upgrade('E1'), upgrade('E1'),
  ],
  level26: [
    place('watchSentry', 5, 5, 'S1'), place('frostObelisk', 7, 5, 'F1'),
    place('wardenBeacon', 8, 5, 'W1'),
    upgrade('S1'), upgrade('S1'), upgrade('F1'), upgrade('F1'),
    spec('sentryMarksman', 'S1'),
    place('boulderMortar', 8, 4, 'M1'), upgrade('M1'), upgrade('M1'),
    spec('mortarColossus', 'M1'), spec('frostDeepFreeze', 'F1'),
  ],
  level27: [
    place('boulderMortar', 8, 4, 'M1'), place('frostObelisk', 8, 6, 'F1'),
    place('wardenBeacon', 10, 4, 'W1'),
    upgrade('M1'), upgrade('M1'), upgrade('F1'), upgrade('F1'),
    spec('mortarClusterRain', 'M1'),
    place('watchSentry', 6, 5, 'S1'), upgrade('S1'), upgrade('S1'),
    spec('sentryMarksman', 'S1'),
    place('emberSpire', 4, 5, 'E1'), upgrade('E1'), upgrade('E1'),
    spec('emberMeteorCaller', 'E1'),
  ],
  level28: [
    place('boulderMortar', 7, 3, 'N1'), place('boulderMortar', 9, 8, 'S1'),
    place('wardenBeacon', 8, 3, 'W1'),
    upgrade('N1'), upgrade('N1'), upgrade('S1'), upgrade('S1'),
    spec('mortarClusterRain', 'N1'),
    place('wardenBeacon', 8, 8, 'W2'),
    spec('mortarClusterRain', 'S1'),
    place('watchSentry', 12, 4, 'N2'), upgrade('N2'), upgrade('N2'),
    spec('sentryMarksman', 'N2'),
    place('watchSentry', 12, 7, 'S2'), upgrade('S2'), upgrade('S2'),
    spec('sentryMarksman', 'S2'),
    place('frostObelisk', 4, 4, 'N3'), upgrade('N3'), upgrade('N3'),
    spec('frostDeepFreeze', 'N3'),
  ],
  level29: [
    place('boulderMortar', 6, 5, 'M1'), place('frostObelisk', 9, 5, 'F1'),
    place('wardenBeacon', 7, 5, 'W1'),
    upgrade('M1'), upgrade('M1'), upgrade('F1'), upgrade('F1'),
    spec('mortarClusterRain', 'M1'),
    place('watchSentry', 10, 3, 'S1'), upgrade('S1'), upgrade('S1'),
    spec('sentryMarksman', 'S1'),
    place('emberSpire', 4, 5, 'E1'), upgrade('E1'), upgrade('E1'),
    spec('emberMeteorCaller', 'E1'),
  ],
  level30: [
    place('boulderMortar', 5, 5, 'M1'), place('boulderMortar', 12, 5, 'M2'),
    place('wardenBeacon', 6, 6, 'W1'),
    upgrade('M1'), upgrade('M1'), upgrade('M2'), upgrade('M2'),
    spec('mortarClusterRain', 'M1'),
    place('wardenBeacon', 10, 3, 'W2'),
    place('watchSentry', 9, 3, 'S1'), upgrade('S1'), upgrade('S1'),
    spec('sentryMarksman', 'S1'),
    spec('mortarClusterRain', 'M2'),
    place('frostObelisk', 13, 5, 'F1'), upgrade('F1'), upgrade('F1'),
    spec('frostDeepFreeze', 'F1'),
    place('watchSentry', 12, 6, 'S3'), upgrade('S3'), upgrade('S3'),
    spec('sentryMarksman', 'S3'),
    place('watchSentry', 13, 2, 'S2'), upgrade('S2'), upgrade('S2'),
    spec('sentryMarksman', 'S2'),
  ],
};

// level20 freeze lesson: the SAME firepower spread down the road — each freeze
// catches exactly the towers currently shooting the boss. Measured: won 9/20,
// boss NOT killed (vs the gate-castle's 14/20 WITH the kill).
export const L20_ROADLINE: Step[] = [
  place('boulderMortar', 4, 5, 'M1'), place('emberSpire', 10, 5, 'E1'),
  place('wardenBeacon', 9, 4, 'W1'), upgrade('W1'), upgrade('W1'),
  upgrade('M1'), upgrade('M1'), upgrade('E1'), upgrade('E1'),
  spec('mortarClusterRain', 'M1'),
  place('watchSentry', 3, 5, 'S1'), upgrade('S1'), upgrade('S1'),
  spec('sentryMarksman', 'S1'),
  place('emberSpire', 12, 5, 'E2'), upgrade('E2'), upgrade('E2'),
  spec('emberMeteorCaller', 'E1'), spec('emberMeteorCaller', 'E2'),
  place('watchSentry', 7, 5, 'S2'), upgrade('S2'), upgrade('S2'),
  spec('sentryMarksman', 'S2'),
];

/** Best-coverage opening hexes per P12 dual-road level (offset col,row). */
export const P12_OPENING_HEXES: Record<string, { north: [number, number]; south: [number, number] }> = {
  level14: { north: [9, 4], south: [7, 5] },
  level18: { north: [7, 2], south: [8, 7] },
  level24: { north: [8, 3], south: [9, 7] },
  level28: { north: [7, 3], south: [9, 8] },
};

/** Fixed generic follow-up spine after the opening pair (neutral triad — pool-agnostic). */
export const P12_OPENING_FOLLOWUPS: Record<string, Step[]> = {
  level14: [
    place('boulderMortar', 7, 5, 'F1'), place('wardenBeacon', 9, 4, 'F2'), place('watchSentry', 10, 4, 'F3'),
    upgrade('F1'), upgrade('F1'), upgrade('F2'), upgrade('F2'), upgrade('F3'), upgrade('F3'),
  ],
  level18: [
    place('boulderMortar', 10, 3, 'F1'), place('wardenBeacon', 9, 7, 'F2'), place('watchSentry', 11, 8, 'F3'),
    upgrade('F1'), upgrade('F1'), upgrade('F2'), upgrade('F2'), upgrade('F3'), upgrade('F3'),
  ],
  level24: [
    place('boulderMortar', 10, 7, 'F1'), place('wardenBeacon', 7, 8, 'F2'), place('watchSentry', 10, 3, 'F3'),
    upgrade('F1'), upgrade('F1'), upgrade('F2'), upgrade('F2'), upgrade('F3'), upgrade('F3'),
  ],
  level28: [
    place('boulderMortar', 12, 4, 'F1'), place('wardenBeacon', 8, 8, 'F2'), place('watchSentry', 12, 7, 'F3'),
    upgrade('F1'), upgrade('F1'), upgrade('F2'), upgrade('F2'), upgrade('F3'), upgrade('F3'),
  ],
};

// level30 regen lesson: solid mid-board defense with NO exit coverage — the boss
// stalls at the doorstep, heals, and walks out. Measured: won 13/20, boss NOT killed.
export const L30_UNFOCUSED: Step[] = [
  place('boulderMortar', 5, 5, 'M1'), place('boulderMortar', 6, 5, 'M2'),
  place('wardenBeacon', 6, 6, 'W1'),
  upgrade('M1'), upgrade('M1'), upgrade('M2'), upgrade('M2'),
  spec('mortarClusterRain', 'M1'),
  place('wardenBeacon', 10, 3, 'W2'),
  place('watchSentry', 9, 3, 'S1'), upgrade('S1'), upgrade('S1'),
  spec('sentryMarksman', 'S1'),
  spec('mortarClusterRain', 'M2'),
  place('frostObelisk', 7, 5, 'F1'), upgrade('F1'), upgrade('F1'),
  spec('frostDeepFreeze', 'F1'),
  place('watchSentry', 8, 2, 'S2'), upgrade('S2'), upgrade('S2'),
  spec('sentryMarksman', 'S2'),
];

