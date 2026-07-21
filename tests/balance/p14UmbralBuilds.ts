/**
 * P14 scripted builds — UMBRAL DEPTHS (biome 6). Single-biome phase: one lock
 * lane, one builds file (the P13 pre-split discipline carries over trivially).
 * Pools model UNLOCK STATE: a biome-6 player owns the neutral triad plus ALL
 * FIVE earned element towers — sunShrine (earned at level50) is the biome's
 * 1.5x counter AND its stealth answer (pierce sees through the dark).
 * The sim never gates towers (unlocks are a game-layer palette filter).
 * All numbers prototype-measured at seed 1; see the P14 plan evidence table.
 */
import { place, spec, upgrade, type Step } from './harness';

export const P14_OPENING_TYPES_UMBRAL: readonly string[] =
  ['watchSentry', 'boulderMortar', 'wardenBeacon', 'emberSpire', 'frostObelisk', 'thornTotem', 'stormPylon', 'sunShrine'];

export const P14_UMBRAL_WINNABILITY: Record<string, Step[]> = {
  level51: [
    place('sunShrine', 5, 3, 'R1'), place('boulderMortar', 7, 5, 'M1'),
    upgrade('R1'), upgrade('R1'), spec('sunZenithRay', 'R1'),
    upgrade('M1'), upgrade('M1'), spec('mortarClusterRain', 'M1'),
    place('watchSentry', 11, 3, 'S1'), upgrade('S1'), upgrade('S1'),
  ],
  level52: [
    place('frostObelisk', 8, 3, 'F1'), place('stormPylon', 4, 3, 'P1'),
    upgrade('F1'), upgrade('F1'), spec('frostDeepFreeze', 'F1'),
    upgrade('P1'), upgrade('P1'), spec('stormTempestCoil', 'P1'),
    place('sunShrine', 11, 3, 'R1'), upgrade('R1'), upgrade('R1'), spec('sunZenithRay', 'R1'),
    place('watchSentry', 6, 5, 'S1'), upgrade('S1'), upgrade('S1'),
  ],
  level53: [
    place('sunShrine', 7, 4, 'R1'), place('watchSentry', 4, 4, 'S1'),
    upgrade('R1'), upgrade('R1'), spec('sunJudgement', 'R1'),
    upgrade('S1'), upgrade('S1'), spec('sentryMarksman', 'S1'),
    place('boulderMortar', 10, 4, 'M1'), upgrade('M1'), upgrade('M1'), spec('mortarColossus', 'M1'),
  ],
  level54: [
    place('boulderMortar', 7, 4, 'M1'), upgrade('M1'), upgrade('M1'), spec('mortarClusterRain', 'M1'),
    place('sunShrine', 7, 5, 'R1'), upgrade('R1'), upgrade('R1'), spec('sunZenithRay', 'R1'),
    place('wardenBeacon', 9, 5, 'W1'),
    place('watchSentry', 10, 4, 'S1'), upgrade('S1'), upgrade('S1'), spec('sentryMarksman', 'S1'),
    upgrade('W1'), upgrade('W1'),
    place('watchSentry', 4, 4, 'S2'), upgrade('S2'), upgrade('S2'),
  ],
  level55: [
    place('sunShrine', 6, 4, 'R1'), place('boulderMortar', 8, 4, 'M1'),
    upgrade('R1'), upgrade('R1'), spec('sunZenithRay', 'R1'),
    upgrade('M1'), upgrade('M1'), spec('mortarClusterRain', 'M1'),
    place('thornTotem', 4, 4, 'T1'), upgrade('T1'), upgrade('T1'), spec('thornPlaguebearer', 'T1'),
  ],
  level56: [
    place('sunShrine', 7, 4, 'R1'), place('watchSentry', 9, 4, 'S1'),
    upgrade('R1'), upgrade('R1'), spec('sunJudgement', 'R1'),
    upgrade('S1'), upgrade('S1'), spec('sentryMarksman', 'S1'),
    place('boulderMortar', 5, 4, 'M1'), upgrade('M1'), upgrade('M1'), spec('mortarColossus', 'M1'),
    place('frostObelisk', 11, 4, 'F1'), upgrade('F1'), upgrade('F1'),
  ],
  level57: [
    place('boulderMortar', 8, 5, 'M1'), upgrade('M1'), upgrade('M1'), spec('mortarClusterRain', 'M1'),
    place('sunShrine', 8, 3, 'R1'), upgrade('R1'), upgrade('R1'), spec('sunZenithRay', 'R1'),
    place('wardenBeacon', 10, 6, 'W1'), upgrade('W1'), upgrade('W1'),
    place('watchSentry', 5, 3, 'S1'), upgrade('S1'), upgrade('S1'), spec('sentryMarksman', 'S1'),
    place('frostObelisk', 4, 3, 'F1'), upgrade('F1'), upgrade('F1'),
  ],
  level58: [
    place('boulderMortar', 7, 2, 'N1'), place('boulderMortar', 7, 7, 'S1'),
    place('wardenBeacon', 9, 6, 'W1'),
    upgrade('N1'), upgrade('N1'), upgrade('S1'), upgrade('S1'),
    spec('mortarClusterRain', 'N1'),
    spec('mortarClusterRain', 'S1'),
    place('sunShrine', 12, 7, 'R1'), upgrade('R1'), upgrade('R1'), spec('sunZenithRay', 'R1'),
    place('sunShrine', 11, 5, 'R2'), upgrade('R2'), upgrade('R2'), spec('sunJudgement', 'R2'),
    place('watchSentry', 13, 2, 'S2'), upgrade('S2'), upgrade('S2'), spec('sentryMarksman', 'S2'),
  ],
  level59: [
    place('sunShrine', 7, 4, 'R1'), upgrade('R1'), upgrade('R1'), spec('sunZenithRay', 'R1'),
    place('boulderMortar', 9, 5, 'M1'), upgrade('M1'), upgrade('M1'), spec('mortarClusterRain', 'M1'),
    place('watchSentry', 10, 4, 'S1'), upgrade('S1'), upgrade('S1'), spec('sentryMarksman', 'S1'),
    place('wardenBeacon', 6, 5, 'W1'), upgrade('W1'), upgrade('W1'),
    place('frostObelisk', 12, 5, 'F1'), upgrade('F1'), upgrade('F1'), spec('frostDeepFreeze', 'F1'),
  ],
  level60: [
    place('boulderMortar', 12, 5, 'M1'), upgrade('M1'), upgrade('M1'), spec('mortarClusterRain', 'M1'),
    place('wardenBeacon', 13, 7, 'W1'), upgrade('W1'), upgrade('W1'),
    place('sunShrine', 13, 5, 'R1'), upgrade('R1'), upgrade('R1'), spec('sunJudgement', 'R1'),
    place('thornTotem', 10, 5, 'T1'), upgrade('T1'), upgrade('T1'), spec('thornPlaguebearer', 'T1'),
    place('frostObelisk', 11, 5, 'F1'), upgrade('F1'), upgrade('F1'), spec('frostDeepFreeze', 'F1'),
    place('emberSpire', 14, 3, 'E1'), upgrade('E1'), upgrade('E1'), spec('emberMeteorCaller', 'E1'),
    place('frostObelisk', 14, 5, 'F2'), upgrade('F2'), upgrade('F2'), spec('frostDeepFreeze', 'F2'),
  ],
};

// level60 stealth lessons — the pair the finale teaches (both prototype-measured):
// 1. L60_NOPIERCE: the EXACT kill castle with its one pierce tower (sunShrine
//    Judgement) swapped for an equal-cost stormPylon Thunderlance. The warden
//    still reveals the south-road nullwraith escorts, so the castle SURVIVES —
//    but the warden's 200 reveal cannot reach the boss road, so every
//    stealthPhase window blanks all targeted damage on the boss: it walks.
//    Survives-but-cannot-kill. Do not "fix" this by raising boss hp.
//    Deliberately burst-flavored: DoT burns through stealth (a DoT castle
//    measured 16/20 WITH a kill), so adding burn/poison here would erase
//    the lesson this lock exists to teach.
export const L60_NOPIERCE: Step[] = [
  place('boulderMortar', 12, 5, 'M1'), upgrade('M1'), upgrade('M1'), spec('mortarClusterRain', 'M1'),
  place('wardenBeacon', 13, 7, 'W1'), upgrade('W1'), upgrade('W1'),
  place('stormPylon', 13, 5, 'P1'), upgrade('P1'), upgrade('P1'), spec('stormThunderlance', 'P1'),
  place('thornTotem', 10, 5, 'T1'), upgrade('T1'), upgrade('T1'), spec('thornPlaguebearer', 'T1'),
  place('frostObelisk', 11, 5, 'F1'), upgrade('F1'), upgrade('F1'), spec('frostDeepFreeze', 'F1'),
  place('watchSentry', 14, 3, 'S1'), upgrade('S1'), upgrade('S1'), spec('sentryMarksman', 'S1'),
  place('frostObelisk', 14, 5, 'F2'), upgrade('F2'), upgrade('F2'), spec('frostDeepFreeze', 'F2'),
];

// 2. L60_DARKCASTLE: NO reveal of any kind — no warden AND no pierce. The
//    nullwraith escort waves walk the south road unseen (14 lives of stealth
//    leaks alone) and the level is LOST before the boss matters. In the Umbral
//    finale, reveal is not an optimization — it is survival.
export const L60_DARKCASTLE: Step[] = [
  place('boulderMortar', 12, 5, 'M1'), upgrade('M1'), upgrade('M1'), spec('mortarClusterRain', 'M1'),
  place('stormPylon', 13, 5, 'P1'), upgrade('P1'), upgrade('P1'), spec('stormThunderlance', 'P1'),
  place('thornTotem', 10, 5, 'T1'), upgrade('T1'), upgrade('T1'), spec('thornPlaguebearer', 'T1'),
  place('frostObelisk', 11, 5, 'F1'), upgrade('F1'), upgrade('F1'), spec('frostDeepFreeze', 'F1'),
  place('emberSpire', 14, 3, 'E1'), upgrade('E1'), upgrade('E1'), spec('emberMeteorCaller', 'E1'),
  place('frostObelisk', 14, 5, 'F2'), upgrade('F2'), upgrade('F2'), spec('frostDeepFreeze', 'F2'),
];

/** Best-coverage opening hexes per Umbral dual-road level (offset col,row). */
export const P14_UMBRAL_OPENING_HEXES: Record<string, { north: [number, number]; south: [number, number] }> = {
  level54: { north: [7, 4], south: [7, 5] },
  level58: { north: [7, 2], south: [7, 7] },
};

/**
 * Fixed follow-up spine after the opening pair. PER-LEVEL DATA (P13 finding
 * #4 carried): both Umbral forks field the earned Sun Shrine in the spine —
 * the counter IS the generic play in the finale biome.
 */
export const P14_UMBRAL_FOLLOWUPS: Record<string, Step[]> = {
  level54: [
    place('sunShrine', 9, 5, 'F1'), place('wardenBeacon', 10, 4, 'F2'), place('boulderMortar', 4, 4, 'F3'),
    upgrade('F1'), upgrade('F1'), upgrade('F2'), upgrade('F2'), upgrade('F3'), upgrade('F3'),
  ],
  level58: [
    place('sunShrine', 12, 7, 'F1'), place('wardenBeacon', 9, 6, 'F2'), place('boulderMortar', 13, 2, 'F3'),
    upgrade('F1'), upgrade('F1'), upgrade('F2'), upgrade('F2'), upgrade('F3'), upgrade('F3'),
  ],
};
