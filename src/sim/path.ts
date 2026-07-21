import type { Vec2 } from './hex';

function catmullRom(p0: Vec2, p1: Vec2, p2: Vec2, p3: Vec2, t: number): Vec2 {
  const t2 = t * t;
  const t3 = t2 * t;
  return {
    x:
      0.5 *
      (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
    y:
      0.5 *
      (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
  };
}

export class Path {
  readonly points: Vec2[] = [];
  readonly length: number;
  private readonly cum: number[] = [];

  constructor(waypoints: Vec2[], samplesPerSegment = 16) {
    if (waypoints.length < 2) throw new Error('Path needs at least 2 waypoints');
    const pts = [waypoints[0], ...waypoints, waypoints[waypoints.length - 1]];
    for (let i = 0; i < waypoints.length - 1; i++) {
      const [p0, p1, p2, p3] = [pts[i], pts[i + 1], pts[i + 2], pts[i + 3]];
      const last = i === waypoints.length - 2;
      const n = last ? samplesPerSegment + 1 : samplesPerSegment;
      for (let s = 0; s < n; s++) {
        this.points.push(catmullRom(p0, p1, p2, p3, s / samplesPerSegment));
      }
    }
    let total = 0;
    this.cum.push(0);
    for (let i = 1; i < this.points.length; i++) {
      total += Math.hypot(this.points[i].x - this.points[i - 1].x, this.points[i].y - this.points[i - 1].y);
      this.cum.push(total);
    }
    this.length = total;
  }

  pointAt(dist: number): Vec2 {
    const d = Math.min(Math.max(dist, 0), this.length);
    let lo = 0;
    let hi = this.cum.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (this.cum[mid] < d) lo = mid + 1;
      else hi = mid;
    }
    if (lo === 0) return { ...this.points[0] };
    const segLen = this.cum[lo] - this.cum[lo - 1];
    const t = segLen === 0 ? 0 : (d - this.cum[lo - 1]) / segLen;
    const a = this.points[lo - 1];
    const b = this.points[lo];
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
  }
}
