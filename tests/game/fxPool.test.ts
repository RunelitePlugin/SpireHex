import { describe, expect, it } from 'vitest';
import { FxPool } from '../../src/game/fxPool';

describe('FxPool', () => {
  it('acquire on an empty pool calls the factory', () => {
    const pool = new FxPool(() => ({ v: 0 }), () => {});
    const a = pool.acquire();
    expect(a).toEqual({ v: 0 });
    expect(pool.created).toBe(1);
  });

  it('release then acquire reuses the same object without a new factory call', () => {
    const pool = new FxPool(() => ({ v: 0 }), () => {});
    const a = pool.acquire();
    pool.release(a);
    expect(pool.acquire()).toBe(a);
    expect(pool.created).toBe(1);
  });

  it('runs the reset hook on every release', () => {
    const resets: number[] = [];
    const pool = new FxPool(() => ({ v: 0 }), (item) => resets.push(item.v));
    const a = pool.acquire();
    a.v = 7;
    pool.release(a);
    expect(resets).toEqual([7]);
    expect(pool.available).toBe(1);
  });

  it('sustained churn allocates only peak concurrency', () => {
    const pool = new FxPool(() => ({}), () => {});
    for (let round = 0; round < 10; round++) {
      const held = [pool.acquire(), pool.acquire(), pool.acquire()];
      for (const h of held) pool.release(h);
    }
    expect(pool.created).toBe(3);
  });
});
