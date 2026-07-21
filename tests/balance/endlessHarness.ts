/**
 * Endless probe harness (P10): the SAME greedy policy as runSteps (one policy
 * definition — harness.ts), on pre-generated endless waves with a raised tick
 * cap (deep runs exceed the campaign's 12-sim-minute bound). Level01, seed 1.
 * The reference build mirrors a strong campaign clear: 5 towers, 4 specs, NO
 * minor nodes (prototype-proven: greedy node buys starve the core build).
 */
import { CAMPAIGN } from '../../src/content';
import { endlessContent, endlessWave } from '../../src/content/endless';
import { rainbowContent, rainbowWave } from '../../src/content/rainbow';
import { RAINBOW_LEVEL } from '../../src/content/levels/rainbow';
import type { LevelDef, WaveDef } from '../../src/content/types';
import type { SimStatus } from '../../src/sim/types';
import { place, runSteps, spec, upgrade, type Step } from './harness';

export const ENDLESS_PROBE_WAVES = 80;
/** 30 sim-minutes — attempt 1's 30-wave run needs ~21.5k ticks. */
export const ENDLESS_MAX_TICKS = 30 * 60 * 30;

export const ENDLESS_REFERENCE_BUILD: Step[] = [
  place('emberSpire', 7, 4, 'E1'),
  place('frostObelisk', 9, 5, 'F1'),
  upgrade('E1'), upgrade('E1'),
  place('sunShrine', 4, 3, 'R1'), // radiant before the wave-4 stealth gate opens
  upgrade('F1'), upgrade('F1'), upgrade('R1'), upgrade('R1'),
  spec('emberMeteorCaller', 'E1'),
  place('stormPylon', 10, 5, 'S1'),
  upgrade('S1'), upgrade('S1'),
  spec('frostDeepFreeze', 'F1'),
  spec('sunZenithRay', 'R1'),
  spec('stormOvercharge', 'S1'),
  place('emberSpire', 2, 3, 'E2'),
  upgrade('E2'), upgrade('E2'),
  spec('emberDuskfire', 'E2'),
];

export const ENDLESS_MINIMAL_BUILD: Step[] = [
  place('emberSpire', 7, 4, 'E1'),
  place('frostObelisk', 9, 5, 'F1'),
  upgrade('E1'), upgrade('E1'),
];

/** P11: what a fresh neutral-only profile fields in endless after its first clears. */
export const ENDLESS_NEUTRAL_REFERENCE_BUILD: Step[] = [
  place('boulderMortar', 7, 4, 'M1'), place('watchSentry', 9, 5, 'S1'),
  upgrade('M1'), upgrade('M1'),
  place('wardenBeacon', 4, 3, 'W1'),
  upgrade('S1'), upgrade('S1'), upgrade('W1'), upgrade('W1'),
  spec('mortarClusterRain', 'M1'),
  place('boulderMortar', 10, 5, 'M2'),
  upgrade('M2'), upgrade('M2'),
  spec('mortarColossus', 'M2'),
  spec('sentryGatling', 'S1'),
  place('watchSentry', 2, 3, 'S2'),
  upgrade('S2'), upgrade('S2'),
  spec('sentryMarksman', 'S2'),
];
export const ENDLESS_NEUTRAL_MINIMAL_BUILD: Step[] = [
  place('boulderMortar', 7, 4, 'M1'), place('watchSentry', 9, 5, 'S1'),
  upgrade('M1'), upgrade('M1'),
];

/** P12: what a biome-2 player fields in level11 endless — neutrals + the earned Ember Spire. */
export const P12_ENDLESS_L11_REF: Step[] = [
  place('boulderMortar', 4, 5, 'M1'), place('emberSpire', 7, 5, 'E1'),
  upgrade('M1'), upgrade('M1'),
  place('wardenBeacon', 5, 5, 'W1'),
  upgrade('E1'), upgrade('E1'), upgrade('W1'), upgrade('W1'),
  spec('mortarClusterRain', 'M1'),
  place('watchSentry', 10, 5, 'S1'), upgrade('S1'), upgrade('S1'),
  spec('sentryMarksman', 'S1'),
  spec('emberMeteorCaller', 'E1'),
  place('watchSentry', 8, 5, 'S2'), upgrade('S2'), upgrade('S2'),
  spec('sentryGatling', 'S2'),
];
export const P12_ENDLESS_L11_MIN: Step[] = [
  place('boulderMortar', 4, 5, 'M1'), place('emberSpire', 7, 5, 'E1'),
  upgrade('M1'), upgrade('M1'),
];
/** P12: biome-3 profile on level21 — adds the earned Frost Obelisk. */
export const P12_ENDLESS_L21_REF: Step[] = [
  place('boulderMortar', 4, 4, 'M1'), place('emberSpire', 7, 4, 'E1'),
  upgrade('M1'), upgrade('M1'),
  place('wardenBeacon', 5, 4, 'W1'),
  upgrade('E1'), upgrade('E1'), upgrade('W1'), upgrade('W1'),
  spec('mortarClusterRain', 'M1'),
  place('frostObelisk', 8, 4, 'F1'), upgrade('F1'), upgrade('F1'),
  spec('frostDeepFreeze', 'F1'),
  spec('emberMeteorCaller', 'E1'),
  place('watchSentry', 10, 4, 'S1'), upgrade('S1'), upgrade('S1'),
  spec('sentryMarksman', 'S1'),
];
export const P12_ENDLESS_L21_MIN: Step[] = [
  place('boulderMortar', 4, 4, 'M1'), place('emberSpire', 7, 4, 'E1'),
  upgrade('M1'), upgrade('M1'),
];

/** P13: what a biome-4 player fields in level31 endless — neutrals + ember/frost/thorn. */
export const P13_ENDLESS_L31_REF: Step[] = [
  place('boulderMortar', 5, 3, 'M1'), place('thornTotem', 8, 4, 'T1'),
  upgrade('M1'), upgrade('M1'),
  place('wardenBeacon', 4, 3, 'W1'),
  upgrade('T1'), upgrade('T1'), upgrade('W1'), upgrade('W1'),
  spec('mortarClusterRain', 'M1'),
  spec('thornPlaguebearer', 'T1'),
  place('frostObelisk', 7, 4, 'F1'), upgrade('F1'), upgrade('F1'),
  spec('frostDeepFreeze', 'F1'),
  place('watchSentry', 10, 4, 'S1'), upgrade('S1'), upgrade('S1'),
  spec('sentryMarksman', 'S1'),
];
export const P13_ENDLESS_L31_MIN: Step[] = [
  place('boulderMortar', 5, 3, 'M1'), place('thornTotem', 8, 4, 'T1'),
  upgrade('M1'), upgrade('M1'),
];
/** P13: biome-5 profile on level41 — adds the Storm Pylon earned at level40. */
export const P13_ENDLESS_L41_REF: Step[] = [
  place('boulderMortar', 5, 3, 'M1'), place('stormPylon', 7, 5, 'P1'),
  upgrade('M1'), upgrade('M1'),
  place('wardenBeacon', 4, 3, 'W1'),
  upgrade('P1'), upgrade('P1'), upgrade('W1'), upgrade('W1'),
  spec('mortarClusterRain', 'M1'),
  spec('stormTempestCoil', 'P1'),
  place('thornTotem', 8, 4, 'T1'), upgrade('T1'), upgrade('T1'),
  spec('thornPlaguebearer', 'T1'),
  place('watchSentry', 10, 4, 'S1'), upgrade('S1'), upgrade('S1'),
  spec('sentryMarksman', 'S1'),
];
export const P13_ENDLESS_L41_MIN: Step[] = [
  place('boulderMortar', 5, 3, 'M1'), place('stormPylon', 7, 5, 'P1'),
  upgrade('M1'), upgrade('M1'),
];

/** P14: the campaign-complete profile on level51 endless — neutrals + all five element towers. */
export const P14_ENDLESS_L51_REF: Step[] = [
  place('boulderMortar', 7, 5, 'M1'), place('sunShrine', 5, 3, 'R1'),
  upgrade('M1'), upgrade('M1'),
  place('wardenBeacon', 9, 5, 'W1'),
  upgrade('R1'), upgrade('R1'), upgrade('W1'), upgrade('W1'),
  spec('mortarClusterRain', 'M1'),
  spec('sunZenithRay', 'R1'),
  place('frostObelisk', 3, 3, 'F1'), upgrade('F1'), upgrade('F1'),
  spec('frostDeepFreeze', 'F1'),
  place('watchSentry', 11, 3, 'S1'), upgrade('S1'), upgrade('S1'),
  spec('sentryMarksman', 'S1'),
];
export const P14_ENDLESS_L51_MIN: Step[] = [
  place('boulderMortar', 7, 5, 'M1'), place('sunShrine', 5, 3, 'R1'),
  upgrade('M1'), upgrade('M1'),
];

/** P15: the everything-earned profile on Rainbow — neutrals + all SIX element towers in reach. */
export const P15_RAINBOW_REF: Step[] = [
  place('boulderMortar', 6, 4, 'M1'), place('sunShrine', 8, 4, 'R1'),
  upgrade('M1'), upgrade('M1'),
  place('wardenBeacon', 4, 4, 'W1'),
  upgrade('R1'), upgrade('R1'), upgrade('W1'), upgrade('W1'),
  spec('mortarClusterRain', 'M1'),
  spec('sunZenithRay', 'R1'),
  place('frostObelisk', 6, 3, 'F1'), upgrade('F1'), upgrade('F1'),
  spec('frostDeepFreeze', 'F1'),
  place('watchSentry', 8, 5, 'S1'), upgrade('S1'), upgrade('S1'),
  spec('sentryMarksman', 'S1'),
];
export const P15_RAINBOW_MIN: Step[] = [
  place('boulderMortar', 6, 4, 'M1'), place('sunShrine', 8, 4, 'R1'),
  upgrade('M1'), upgrade('M1'),
];

export interface EndlessProbeResult {
  wavesCleared: number;
  status: SimStatus;
  ticks: number;
}

export function runEndlessProbe(steps: Step[], attempt: number, baseIndex = 0): EndlessProbeResult {
  const base = CAMPAIGN[baseIndex]; // default level01 — every pre-P12 lock unchanged
  const content = endlessContent(base);
  const waves: WaveDef[] = [];
  for (let k = 0; k < ENDLESS_PROBE_WAVES; k++) waves.push(endlessWave(base, attempt, k, content));
  const level: LevelDef = { ...base, id: `${base.id}-endless-probe`, hint: undefined, waves };
  const { sim, ticks } = runSteps(level, steps, 1, content, ENDLESS_MAX_TICKS);
  return {
    wavesCleared: sim.status === 'lost' ? sim.waveIndex : sim.waveIndex + 1,
    status: sim.status,
    ticks,
  };
}

/** 45 sim-minutes: Rainbow ref runs go ~10 waves deeper than campaign endless (bigger
 * map, nine-tower profile) — the 30-min endless cap ended attempt-3 mid-combat. */
export const RAINBOW_MAX_TICKS = 30 * 60 * 45;

/** P15: Rainbow probe — same policy as runEndlessProbe, waves from the biome cycle. */
export function runRainbowProbe(steps: Step[], attempt: number): EndlessProbeResult {
  const content = rainbowContent();
  const waves: WaveDef[] = [];
  for (let k = 0; k < ENDLESS_PROBE_WAVES; k++) waves.push(rainbowWave(attempt, k, content));
  const level: LevelDef = { ...RAINBOW_LEVEL, id: 'rainbow-endless-probe', hint: undefined, waves };
  const { sim, ticks } = runSteps(level, steps, 1, content, RAINBOW_MAX_TICKS);
  return {
    wavesCleared: sim.status === 'lost' ? sim.waveIndex : sim.waveIndex + 1,
    status: sim.status,
    ticks,
  };
}
