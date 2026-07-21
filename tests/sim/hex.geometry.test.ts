import { describe, expect, it } from 'vitest';
import { HEX_SIZE, TOWER_RADIUS } from '../../src/sim/constants';
import { AXIAL_DIRECTIONS, axialToWorld, circleOverlapsHex } from '../../src/sim/hex';

const INRADIUS = (HEX_SIZE * Math.sqrt(3)) / 2; // ≈ 41.5692
const PITCH = HEX_SIZE * Math.sqrt(3);          // ≈ 83.1384
const ORIGIN = { q: 0, r: 0 };

describe('footprint geometry (Phase 8 free placement)', () => {
  it('derives TOWER_RADIUS from hex geometry: under the inradius, twice under the pitch', () => {
    expect(TOWER_RADIUS).toBe(40);
    // (1) hex centers always legal: the footprint fits strictly inside one hex.
    expect(TOWER_RADIUS).toBeLessThan(INRADIUS);
    // (2) adjacent hex centers co-placeable: harness/back-compat guarantee.
    expect(2 * TOWER_RADIUS).toBeLessThan(PITCH);
  });

  it('a point inside a hex overlaps it at any radius', () => {
    expect(circleOverlapsHex(axialToWorld(ORIGIN), 0.001, ORIGIN)).toBe(true);
    expect(circleOverlapsHex({ x: 30, y: 20 }, 0.001, ORIGIN)).toBe(true); // off-center, still inside
  });

  it('uses a strict edge threshold: r+0.01 outside an edge misses, r-0.01 overlaps', () => {
    // The hex's flat right edge faces +x at distance INRADIUS from the center.
    expect(circleOverlapsHex({ x: INRADIUS + TOWER_RADIUS + 0.01, y: 0 }, TOWER_RADIUS, ORIGIN)).toBe(false);
    expect(circleOverlapsHex({ x: INRADIUS + TOWER_RADIUS - 0.01, y: 0 }, TOWER_RADIUS, ORIGIN)).toBe(true);
  });

  it('a footprint at a hex center stays inside its own hex: overlaps it and none of the 6 neighbors', () => {
    const c = axialToWorld(ORIGIN);
    expect(circleOverlapsHex(c, TOWER_RADIUS, ORIGIN)).toBe(true);
    for (const d of AXIAL_DIRECTIONS) {
      expect(circleOverlapsHex(c, TOWER_RADIUS, { q: d.q, r: d.r }), `dir ${d.q},${d.r}`).toBe(false);
    }
  });

  it('handles the vertex region, not just edges', () => {
    // The hex's top vertex sits at (0, -HEX_SIZE) — a pointy tip, farther out than any edge.
    expect(circleOverlapsHex({ x: 0, y: -HEX_SIZE - TOWER_RADIUS - 5 }, TOWER_RADIUS, ORIGIN)).toBe(false);
    expect(circleOverlapsHex({ x: 0, y: -HEX_SIZE - TOWER_RADIUS + 5 }, TOWER_RADIUS, ORIGIN)).toBe(true);
  });

  it('distance-2 hexes can never touch a footprint (validation may stop at the 6 neighbors)', () => {
    // Nearest distance-2 center is 3·HEX_SIZE = 144 (e.g. axial Δ (1,1)); a position is ≤ 48
    // (circumradius) from its containing cell's center and the far hex's polygon reaches 48
    // back toward it, leaving ≥ 144 − 48 − 48 = 48 > TOWER_RADIUS.
    const far = axialToWorld({ q: 1, r: 1 });
    expect(Math.hypot(far.x, far.y)).toBeCloseTo(3 * HEX_SIZE, 6);
    expect(3 * HEX_SIZE - 2 * HEX_SIZE).toBeGreaterThan(TOWER_RADIUS);
    // Empirical spot-check from the worst on-cell position (48 toward the far hex):
    expect(circleOverlapsHex({ x: (far.x * 48) / 144, y: (far.y * 48) / 144 }, TOWER_RADIUS, { q: 1, r: 1 })).toBe(false);
  });
});
