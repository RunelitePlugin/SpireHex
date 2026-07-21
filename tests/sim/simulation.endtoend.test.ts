import { describe, expect, it } from 'vitest';
import { CONTENT, LEVELS } from '../../src/content';
import { hexKey, type Axial } from '../../src/sim/hex';
import { Simulation } from '../../src/sim/simulation';
import type { SimEvent } from '../../src/sim/types';
import { placeCmd } from './helpers';

const MAX_TICKS = 30 * 60 * 10; // 10 sim-minutes safety cap

function neighbors(h: Axial): Axial[] {
  return [
    { q: h.q + 1, r: h.r }, { q: h.q - 1, r: h.r }, { q: h.q, r: h.r + 1 },
    { q: h.q, r: h.r - 1 }, { q: h.q + 1, r: h.r - 1 }, { q: h.q - 1, r: h.r + 1 },
  ];
}

function buildableHexesTouchingPath(level = LEVELS.level01): Axial[] {
  const grid = new Set(level.hexes.map(hexKey));
  const path = new Set(level.pathHexes.map(hexKey));
  const seen = new Set<string>();
  const out: Axial[] = [];
  for (const p of level.pathHexes) {
    for (const n of neighbors(p)) {
      const k = hexKey(n);
      if (grid.has(k) && !path.has(k) && !seen.has(k)) {
        seen.add(k);
        out.push(n);
      }
    }
  }
  return out;
}

function playUntilOver(sim: Simulation): SimEvent[] {
  const all: SimEvent[] = [];
  for (let i = 0; i < MAX_TICKS; i++) {
    all.push(...sim.tick());
    if (sim.status === 'building') sim.applyCommand({ type: 'startWave' });
    if (sim.status === 'won' || sim.status === 'lost') break;
  }
  return all;
}

describe('end to end', () => {
  it('loses level01 with no towers', () => {
    const sim = new Simulation(LEVELS.level01, CONTENT, 1);
    sim.applyCommand({ type: 'startWave' });
    playUntilOver(sim);
    expect(sim.status).toBe('lost');
  });

  it('wins level01 with towers on every path-adjacent hex', () => {
    const level = { ...LEVELS.level01, startingGold: 100000 };
    const sim = new Simulation(level, CONTENT, 1);
    for (const hex of buildableHexesTouchingPath()) {
      expect(sim.applyCommand(placeCmd('sunShrine', hex)).ok).toBe(true);
    }
    sim.applyCommand({ type: 'startWave' });
    const events = playUntilOver(sim);
    expect(sim.status).toBe('won');
    expect(events).toContainEqual({ type: 'levelWon' });
    expect(sim.lives).toBe(20);
  });

  it('is fully deterministic: two identical runs produce identical event logs', () => {
    const run = () => {
      const level = { ...LEVELS.level01, startingGold: 100000 };
      const sim = new Simulation(level, CONTENT, 7);
      for (const hex of buildableHexesTouchingPath()) {
        sim.applyCommand(placeCmd('sunShrine', hex));
      }
      sim.applyCommand({ type: 'startWave' });
      return playUntilOver(sim);
    };
    expect(run()).toEqual(run());
  });
});
