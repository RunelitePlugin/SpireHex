import { HEX_SIZE } from './constants';

export interface Vec2 {
  x: number;
  y: number;
}

export interface Axial {
  q: number;
  r: number;
}

const SQRT3 = Math.sqrt(3);

export function axialToWorld(h: Axial): Vec2 {
  return { x: HEX_SIZE * SQRT3 * (h.q + h.r / 2), y: HEX_SIZE * 1.5 * h.r };
}

export function worldToAxial(x: number, y: number): Axial {
  const r = y / (HEX_SIZE * 1.5);
  const q = x / (HEX_SIZE * SQRT3) - r / 2;
  return axialRound(q, r);
}

function axialRound(q: number, r: number): Axial {
  const s = -q - r;
  let rq = Math.round(q);
  let rr = Math.round(r);
  const rs = Math.round(s);
  const dq = Math.abs(rq - q);
  const dr = Math.abs(rr - r);
  const ds = Math.abs(rs - s);
  if (dq > dr && dq > ds) rq = -rr - rs;
  else if (dr > ds) rr = -rq - rs;
  return { q: rq, r: rr };
}

export function hexDistance(a: Axial, b: Axial): number {
  return (Math.abs(a.q - b.q) + Math.abs(a.q + a.r - b.q - b.r) + Math.abs(a.r - b.r)) / 2;
}

export function hexKey(h: Axial): string {
  return `${h.q},${h.r}`;
}

export function hexCorners(center: Vec2): Vec2[] {
  const corners: Vec2[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 30);
    corners.push({ x: center.x + HEX_SIZE * Math.cos(angle), y: center.y + HEX_SIZE * Math.sin(angle) });
  }
  return corners;
}

/** The 6 axial neighbor offsets (E, NE, NW, W, SW, SE). */
export const AXIAL_DIRECTIONS: readonly Axial[] = [
  { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
  { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 },
];

/**
 * True iff the disc of `radius` around `center` intersects the hex cell's
 * polygon. Pure deterministic float math: a point inside the (convex) polygon
 * always overlaps; otherwise the min distance to the 6 edge segments is
 * compared strictly (< radius). hexCorners orders corners at angles
 * -30°,30°,…,270°, so consecutive corners wind positively — the interior is
 * the side where every edge cross product is ≥ 0.
 */
export function circleOverlapsHex(center: Vec2, radius: number, hex: Axial): boolean {
  const corners = hexCorners(axialToWorld(hex));
  let inside = true;
  let minDist = Infinity;
  for (let i = 0; i < 6; i++) {
    const a = corners[i];
    const b = corners[(i + 1) % 6];
    const ex = b.x - a.x;
    const ey = b.y - a.y;
    const px = center.x - a.x;
    const py = center.y - a.y;
    if (ex * py - ey * px < 0) inside = false;
    const t = Math.max(0, Math.min(1, (px * ex + py * ey) / (ex * ex + ey * ey)));
    minDist = Math.min(minDist, Math.hypot(px - t * ex, py - t * ey));
  }
  return inside || minDist < radius;
}
