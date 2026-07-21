import { describe, expect, it } from 'vitest';
import { AXIAL_DIRECTIONS, axialToWorld, hexCorners, hexDistance, type Axial } from '../../src/sim/hex';
import { HEX_SIZE } from '../../src/sim/constants';
import { EDGE_DIRS, edgeRimQuad, wallEdges } from '../../src/game/boardDecor';
import { LEVELS } from '../../src/content';

/** Independent count: 6 edges per path hex minus 2 per adjacent path pair. */
function expectedWallCount(pathHexes: readonly Axial[]): number {
  let pairs = 0;
  for (let i = 0; i < pathHexes.length; i++) {
    for (let j = i + 1; j < pathHexes.length; j++) {
      if (hexDistance(pathHexes[i], pathHexes[j]) === 1) pairs++;
    }
  }
  return pathHexes.length * 6 - pairs * 2;
}

describe('EDGE_DIRS', () => {
  it('edge k points at the neighbor whose center lies beyond that edge midpoint', () => {
    const center = axialToWorld({ q: 0, r: 0 });
    const corners = hexCorners(center);
    for (let k = 0; k < 6; k++) {
      const a = corners[k];
      const b = corners[(k + 1) % 6];
      const mid = { x: (a.x + b.x) / 2 - center.x, y: (a.y + b.y) / 2 - center.y };
      const n = axialToWorld(EDGE_DIRS[k]);
      // Neighbor center is exactly 2× the edge-midpoint offset.
      expect(n.x).toBeCloseTo(mid.x * 2, 6);
      expect(n.y).toBeCloseTo(mid.y * 2, 6);
    }
    expect(new Set(EDGE_DIRS)).toEqual(new Set(AXIAL_DIRECTIONS));
  });
});

describe('wallEdges', () => {
  it('a lone path hex is walled on all six edges', () => {
    expect(wallEdges([{ q: 0, r: 0 }])).toHaveLength(6);
  });

  it('a straight 3-hex corridor omits exactly the shared edges', () => {
    const line: Axial[] = [{ q: 0, r: 0 }, { q: 1, r: 0 }, { q: 2, r: 0 }];
    const edges = wallEdges(line);
    expect(edges).toHaveLength(14); // 18 - 2 shared pairs × 2 edges
    const middle = edges.filter((e) => e.hex.q === 1 && e.hex.r === 0).map((e) => e.edge).sort();
    expect(middle).toEqual([1, 2, 4, 5]); // E (0) and W (3) neighbors are path
  });

  it('matches the independent pair-count formula on level01 (single winding road)', () => {
    expect(wallEdges(LEVELS.level01.pathHexes)).toHaveLength(expectedWallCount(LEVELS.level01.pathHexes));
  });

  it('matches the formula on level07 (deduped multi-path union with junctions)', () => {
    expect(wallEdges(LEVELS.level07.pathHexes)).toHaveLength(expectedWallCount(LEVELS.level07.pathHexes));
  });
});

describe('edgeRimQuad', () => {
  it('returns a quad hugging the edge, inset toward the hex center', () => {
    const center = axialToWorld({ q: 0, r: 0 });
    const quad = edgeRimQuad({ q: 0, r: 0 }, 0, 9);
    const dist = (p: { x: number; y: number }) => Math.hypot(p.x - center.x, p.y - center.y);
    // Outer pair are the true corners (distance HEX_SIZE); inner pair are strictly closer.
    expect(dist(quad[0])).toBeCloseTo(HEX_SIZE, 6);
    expect(dist(quad[1])).toBeCloseTo(HEX_SIZE, 6);
    expect(dist(quad[2])).toBeLessThan(dist(quad[1]));
    expect(dist(quad[3])).toBeLessThan(dist(quad[0]));
  });
});
