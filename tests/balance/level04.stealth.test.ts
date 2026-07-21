import { describe, expect, it } from 'vitest';
import { LEVELS } from '../../src/content';
import { WINNABILITY_BUILDS, place, runSteps, spec, upgrade, type Step } from './harness';

/**
 * P11 ward lesson: duskstalkers are UNTARGETABLE without a warden (no radiant
 * tower exists in a fresh neutral profile), and level04 fields 36 stealth
 * lives — a no-warden build cannot win, structurally. Measured: lost, 0/20.
 */
const NO_WARDEN: Step[] = [
  place('watchSentry', 10, 4, 'S1'), place('boulderMortar', 4, 4, 'M1'),
  upgrade('S1'), upgrade('S1'), upgrade('M1'), upgrade('M1'),
  spec('sentryMarksman', 'S1'),
  place('watchSentry', 7, 3, 'S2'), upgrade('S2'), upgrade('S2'),
];

describe('level04 stealth structural lock', () => {
  it('level04 without a warden LOSES; the warden build wins (winnability lock)', () => {
    const { sim } = runSteps(LEVELS.level04, NO_WARDEN);
    expect(sim.status).toBe('lost');
    const withWarden = runSteps(LEVELS.level04, WINNABILITY_BUILDS.level04);
    expect(withWarden.sim.status).toBe('won'); // measured 20/20
  });
});
