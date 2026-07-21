/**
 * Board decoration geometry (P9): which path-hex edges get carved rim walls,
 * and where the rim quads sit. PURE render decoration — derived from
 * LevelDef.pathHexes only; placement and pathing never read this. Phaser-free
 * (listed in the meta-purity tripwire) so it stays headless-testable.
 */
import { AXIAL_DIRECTIONS, axialToWorld, hexCorners, hexKey, type Axial, type Vec2 } from '../sim/hex';

/**
 * hexCorners puts corner k at angle 60k−30°, so edge k (corners k→k+1) borders
 * the neighbor in this order: E, SE, SW, W, NW, NE. Pinned by the
 * edge-midpoint direction test in tests/game/boardDecor.test.ts.
 */
export const EDGE_DIRS: readonly Axial[] = [
  AXIAL_DIRECTIONS[0], // k=0 → E
  AXIAL_DIRECTIONS[5], // k=1 → SE
  AXIAL_DIRECTIONS[4], // k=2 → SW
  AXIAL_DIRECTIONS[3], // k=3 → W
  AXIAL_DIRECTIONS[2], // k=4 → NW
  AXIAL_DIRECTIONS[1], // k=5 → NE
];

export interface WallEdge {
  hex: Axial;
  /** Edge index 0–5 (hexCorners order). Edges 3–5 face left/up → lit cap. */
  edge: number;
}

/** Every path-hex edge NOT shared with another path hex — the carved rim. */
export function wallEdges(pathHexes: readonly Axial[]): WallEdge[] {
  const pathKeys = new Set(pathHexes.map(hexKey));
  const out: WallEdge[] = [];
  for (const hex of pathHexes) {
    for (let edge = 0; edge < 6; edge++) {
      const n = { q: hex.q + EDGE_DIRS[edge].q, r: hex.r + EDGE_DIRS[edge].r };
      if (!pathKeys.has(hexKey(n))) out.push({ hex, edge });
    }
  }
  return out;
}

/** The edge segment plus its inset toward the hex center: [outerA, outerB, innerB, innerA]. */
export function edgeRimQuad(hex: Axial, edge: number, depth: number): [Vec2, Vec2, Vec2, Vec2] {
  const center = axialToWorld(hex);
  const corners = hexCorners(center);
  const a = corners[edge];
  const b = corners[(edge + 1) % 6];
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const len = Math.hypot(center.x - mx, center.y - my);
  const ux = (center.x - mx) / len;
  const uy = (center.y - my) / len;
  return [a, b, { x: b.x + ux * depth, y: b.y + uy * depth }, { x: a.x + ux * depth, y: a.y + uy * depth }];
}
