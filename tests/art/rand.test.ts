import { describe, expect, it } from 'vitest';
import { hashString, mulberry32 } from '../../src/art/rand';

describe('hashString (FNV-1a 32-bit)', () => {
  it('is stable across runs — pinned values', () => {
    expect(hashString('level01')).toBe(931211730);
    expect(hashString('level02')).toBe(914434111);
  });

  it('differs for different inputs and is always an unsigned 32-bit int', () => {
    expect(hashString('a')).not.toBe(hashString('b'));
    for (const s of ['', 'a', 'level10', 'spirehex']) {
      const h = hashString(s);
      expect(Number.isInteger(h)).toBe(true);
      expect(h).toBeGreaterThanOrEqual(0);
      expect(h).toBeLessThanOrEqual(0xffffffff);
    }
  });
});

describe('mulberry32', () => {
  it('same seed yields the same sequence', () => {
    const a = mulberry32(931211730);
    const b = mulberry32(931211730);
    for (let i = 0; i < 5; i++) expect(a()).toBe(b());
  });

  it('different seeds yield different sequences and outputs stay in [0,1)', () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    expect(a()).not.toBe(b());
    const r = mulberry32(42);
    for (let i = 0; i < 100; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});
