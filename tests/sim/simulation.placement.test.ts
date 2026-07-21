import { beforeEach, describe, expect, it } from 'vitest';
import { CONTENT, LEVELS } from '../../src/content';
import { axialToWorld } from '../../src/sim/hex';
import { Simulation } from '../../src/sim/simulation';
import { placeCmd } from './helpers';

describe('tower placement (free, footprint-validated)', () => {
  let sim: Simulation;
  const OPEN = { q: 1, r: 1 }; // interior open hex of level01 (offset col 1, row 1)
  const OPEN_POS = axialToWorld(OPEN);
  const PATH_HEX = LEVELS.level01.pathHexes[0]; // {q:-2, r:4}

  beforeEach(() => {
    sim = new Simulation(LEVELS.level01, CONTENT, 1);
  });

  it('starts with level gold and lives and building status', () => {
    expect(sim.gold).toBe(300);
    expect(sim.lives).toBe(20);
    expect(sim.status).toBe('building');
    expect(sim.towers).toHaveLength(0);
  });

  it('places at an open hex center, charges gold, and the event carries the world position', () => {
    const res = sim.applyCommand(placeCmd('emberSpire', OPEN));
    expect(res.ok).toBe(true);
    expect(sim.gold).toBe(200);
    expect(sim.towers).toHaveLength(1);
    expect(sim.towers[0].pos).toEqual(OPEN_POS);
    expect(sim.tick()).toContainEqual({ type: 'towerPlaced', towerId: 1, typeId: 'emberSpire', pos: OPEN_POS });
  });

  it('rejects a center on a path hex', () => {
    const res = sim.applyCommand(placeCmd('emberSpire', PATH_HEX));
    expect(res).toEqual({ ok: false, error: 'on path' });
    expect(sim.gold).toBe(300);
  });

  it('rejects a center far outside the grid', () => {
    expect(sim.applyCommand(placeCmd('emberSpire', { q: 99, r: 99 }))).toEqual({ ok: false, error: 'outside grid' });
  });

  it('rejects without enough gold', () => {
    // emberSpire costs 100; row 1 is fully open and every-other-column keeps footprints clear.
    for (const q of [1, 3, 5]) expect(sim.applyCommand(placeCmd('emberSpire', { q, r: 1 })).ok).toBe(true);
    expect(sim.applyCommand(placeCmd('emberSpire', { q: 7, r: 1 }))).toEqual({ ok: false, error: 'not enough gold' });
    expect(sim.towers).toHaveLength(3);
  });

  it('rejects unknown tower types', () => {
    expect(sim.applyCommand(placeCmd('nope', OPEN)).ok).toBe(false);
  });

  // --- footprint boundary pins (validatePlacement is also the ghost's legality source) ---
  // Geometry: open {q:-1,r:3} borders path {q:-2,r:4}; open {q:0,r:0} sits on the
  // board's top-left edge (rows r<0 are off-grid).

  it('accepts every open hex center of level01 (hex centers always legal)', () => {
    const path = new Set(LEVELS.level01.pathHexes.map((h) => `${h.q},${h.r}`));
    for (const hex of LEVELS.level01.hexes) {
      if (path.has(`${hex.q},${hex.r}`)) continue;
      expect(sim.validatePlacement('emberSpire', axialToWorld(hex)).ok, `${hex.q},${hex.r}`).toBe(true);
    }
  });

  it('rejects a footprint clipping a path hex (2 units off-center toward the road)', () => {
    const open = axialToWorld({ q: -1, r: 3 });
    const road = axialToWorld({ q: -2, r: 4 });
    const d = Math.hypot(road.x - open.x, road.y - open.y); // one hex pitch ≈ 83.14
    const p = { x: open.x + (2 * (road.x - open.x)) / d, y: open.y + (2 * (road.y - open.y)) / d };
    // At the center the road edge is 41.57 away (legal); 2 units closer it is 39.57 < 40.
    expect(sim.validatePlacement('emberSpire', p)).toEqual({ ok: false, error: 'on path' });
  });

  it('rejects a footprint clipping the board edge (2 units off-center toward off-grid)', () => {
    const open = axialToWorld({ q: 0, r: 0 });
    const off = axialToWorld({ q: 0, r: -1 });
    const d = Math.hypot(off.x - open.x, off.y - open.y);
    const p = { x: open.x + (2 * (off.x - open.x)) / d, y: open.y + (2 * (off.y - open.y)) / d };
    expect(sim.validatePlacement('emberSpire', p)).toEqual({ ok: false, error: 'outside grid' });
  });

  it('accepts an off-center point straddling open hexes (positioning freedom)', () => {
    const a = axialToWorld({ q: 1, r: 1 });
    const b = axialToWorld({ q: 2, r: 1 });
    const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    expect(sim.validatePlacement('emberSpire', mid).ok).toBe(true);
    expect(sim.applyCommand({ type: 'placeTower', towerTypeId: 'emberSpire', pos: mid }).ok).toBe(true);
    expect(sim.towers[0].pos).toEqual(mid);
  });

  it('enforces footprint spacing between towers: 79 units overlaps, 80 clears', () => {
    sim.applyCommand(placeCmd('emberSpire', OPEN));
    expect(sim.validatePlacement('emberSpire', { x: OPEN_POS.x + 79, y: OPEN_POS.y }))
      .toEqual({ ok: false, error: 'overlaps tower' });
    expect(sim.validatePlacement('emberSpire', { x: OPEN_POS.x + 80, y: OPEN_POS.y }).ok).toBe(true);
    // Adjacent hex centers stay co-placeable (pitch 83.14 > 80) — the harness guarantee.
    expect(sim.applyCommand(placeCmd('emberSpire', { q: 2, r: 1 })).ok).toBe(true);
  });

  it('rejects non-finite positions', () => {
    expect(sim.validatePlacement('emberSpire', { x: Number.NaN, y: 0 }))
      .toEqual({ ok: false, error: 'invalid position' });
    expect(sim.applyCommand({ type: 'placeTower', towerTypeId: 'emberSpire', pos: { x: Number.NaN, y: 0 } }).ok).toBe(false);
  });
});
