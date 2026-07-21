import { describe, expect, it } from 'vitest';
import { Path } from '../../src/sim/path';

describe('Path', () => {
  it('has length equal to the straight distance for collinear waypoints', () => {
    const p = new Path([{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 200, y: 0 }]);
    expect(p.length).toBeCloseTo(200, 0);
  });

  it('starts at the first waypoint and ends at the last', () => {
    const p = new Path([{ x: 0, y: 0 }, { x: 100, y: 50 }, { x: 200, y: 0 }]);
    expect(p.pointAt(0).x).toBeCloseTo(0);
    expect(p.pointAt(0).y).toBeCloseTo(0);
    expect(p.pointAt(p.length).x).toBeCloseTo(200);
    expect(p.pointAt(p.length).y).toBeCloseTo(0);
  });

  it('clamps out-of-range distances', () => {
    const p = new Path([{ x: 0, y: 0 }, { x: 100, y: 0 }]);
    expect(p.pointAt(-50)).toEqual(p.pointAt(0));
    expect(p.pointAt(9999)).toEqual(p.pointAt(p.length));
  });

  it('moves monotonically forward along x for a left-to-right path', () => {
    const p = new Path([{ x: 0, y: 0 }, { x: 100, y: 40 }, { x: 200, y: -40 }, { x: 300, y: 0 }]);
    let lastX = -1;
    for (let d = 0; d <= p.length; d += p.length / 50) {
      const pt = p.pointAt(d);
      expect(pt.x).toBeGreaterThan(lastX);
      lastX = pt.x;
    }
  });

  it('passes near interior waypoints (smoothed, within one hex)', () => {
    const wp = { x: 100, y: 50 };
    const p = new Path([{ x: 0, y: 0 }, wp, { x: 200, y: 0 }]);
    let best = Infinity;
    for (let d = 0; d <= p.length; d += 1) {
      const pt = p.pointAt(d);
      best = Math.min(best, Math.hypot(pt.x - wp.x, pt.y - wp.y));
    }
    expect(best).toBeLessThan(10);
  });
});
