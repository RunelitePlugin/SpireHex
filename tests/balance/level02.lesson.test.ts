import { describe, expect, it } from 'vitest';
import { LEVELS } from '../../src/content';
import { place, runSteps, upgrade, type Step } from './harness';

/**
 * P11 splash lesson lock (replaces the P7 element lesson — neutral towers have
 * no 0.5× trap). Equal-lean-gold wave-4 board states: single-target-only
 * bleeds on the 2×40@0.09 flood; one mortar erases it. Measured at seed 1:
 * sentry-lean 6/20, mortar-lean 20/20. Bounds move only with fresh evidence.
 */
const SENTRY_LEAN: Step[] = [
  place('watchSentry', 4, 3, 'A'), place('watchSentry', 2, 2, 'B'), upgrade('A'), upgrade('B'),
];
const MORTAR_LEAN: Step[] = [
  place('boulderMortar', 4, 3, 'A'), place('watchSentry', 2, 2, 'B'), upgrade('A'),
];

describe('level02 splash lesson', () => {
  it('a sentry-only lean build bleeds on the mite flood but still wins (beginner mercy)', () => {
    const { sim } = runSteps(LEVELS.level02, SENTRY_LEAN);
    expect(sim.status).toBe('won');
    expect(sim.lives).toBeLessThanOrEqual(12); // measured 6/20
  });
  it('the same gold with a Boulder Mortar cruises', () => {
    const { sim } = runSteps(LEVELS.level02, MORTAR_LEAN);
    expect(sim.status).toBe('won');
    expect(sim.lives).toBeGreaterThanOrEqual(18); // measured 20/20
  });
});
