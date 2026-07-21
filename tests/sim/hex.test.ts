import { describe, expect, it } from 'vitest';
import { HEX_SIZE } from '../../src/sim/constants';
import { axialToWorld, hexCorners, hexDistance, hexKey, worldToAxial } from '../../src/sim/hex';

describe('hex math (pointy-top axial)', () => {
  it('places the origin hex at world (0,0)', () => {
    expect(axialToWorld({ q: 0, r: 0 })).toEqual({ x: 0, y: 0 });
  });

  it('spaces q-neighbors horizontally by sqrt(3)*size', () => {
    const p = axialToWorld({ q: 1, r: 0 });
    expect(p.x).toBeCloseTo(Math.sqrt(3) * HEX_SIZE);
    expect(p.y).toBeCloseTo(0);
  });

  it('round-trips world -> axial for hex centers', () => {
    for (const h of [{ q: 0, r: 0 }, { q: 3, r: -2 }, { q: -4, r: 5 }, { q: 7, r: 7 }]) {
      const p = axialToWorld(h);
      expect(worldToAxial(p.x, p.y)).toEqual(h);
    }
  });

  it('snaps points near a center to that hex', () => {
    const p = axialToWorld({ q: 2, r: 1 });
    expect(worldToAxial(p.x + HEX_SIZE * 0.3, p.y - HEX_SIZE * 0.2)).toEqual({ q: 2, r: 1 });
  });

  it('computes hex distance', () => {
    expect(hexDistance({ q: 0, r: 0 }, { q: 0, r: 0 })).toBe(0);
    expect(hexDistance({ q: 0, r: 0 }, { q: 3, r: 0 })).toBe(3);
    expect(hexDistance({ q: 0, r: 0 }, { q: -2, r: -1 })).toBe(3);
  });

  it('keys hexes uniquely', () => {
    expect(hexKey({ q: 2, r: -3 })).toBe('2,-3');
  });

  it('produces 6 corners at distance HEX_SIZE from center', () => {
    const corners = hexCorners({ x: 100, y: 50 });
    expect(corners).toHaveLength(6);
    for (const c of corners) {
      expect(Math.hypot(c.x - 100, c.y - 50)).toBeCloseTo(HEX_SIZE);
    }
  });
});
