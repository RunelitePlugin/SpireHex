import { describe, expect, it } from 'vitest';
import { LEVELS } from '../../src/content';
import { offsetToAxial } from '../../src/content/levelUtils';
import { axialToWorld } from '../../src/sim/hex';
import { enemyDef, makeContent, straightLevel, towerDef } from '../sim/helpers';
import { openingCorpus, place, runSteps, summarize, upgrade } from './harness';

describe('balance harness policy', () => {
  it('defers unaffordable steps and retries them as bounty gold arrives (greedy-in-priority-order)', () => {
    const level = { ...straightLevel([{ entries: [{ enemyId: 'dummy', count: 6, spacing: 0.5 }] }]), startingGold: 100 };
    const content = makeContent([towerDef()], [enemyDef({ hp: 10, bounty: 30 })]);
    const { sim, ticks } = runSteps(level, [
      place('testTower', 1, -1, 'T'), // offsetToAxial(1,-1) = {q:2,r:-1} = helpers.TOWER_HEX — on-grid, off-path
      upgrade('T'),                   // 50g — unaffordable at start, bought from bounties mid-wave
    ], 1, content);
    expect(sim.status).toBe('won');
    expect(sim.towers[0].tier).toBe(1);
    expect(ticks).toBeGreaterThan(0);
  });

  it('opening corpus is deterministic: identical results across runs', () => {
    const a = openingCorpus(LEVELS.level07, [7, 2], [10, 6], [], ['emberSpire']);
    const b = openingCorpus(LEVELS.level07, [7, 2], [10, 6], [], ['emberSpire']);
    expect(a).toHaveLength(1);
    expect(summarize(a)).toBe(summarize(b));
  });

  it('place(col,row) maps to hex-center world coordinates (free-placement compat contract)', () => {
    const step = place('emberSpire', 7, 2, 'X');
    if (step.kind !== 'place') throw new Error('expected a place step');
    expect(step.pos).toEqual(axialToWorld(offsetToAxial(7, 2)));
  });
});
