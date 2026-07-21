import { describe, expect, it } from 'vitest';
import { TOWERS } from '../../src/content/towers';
import { TIER_ESCALATIONS } from '../../src/art/tierSprites';
import { towerSpriteGrid, type SpriteGrid } from '../../src/art/sprites';

const ALLOWED_KEYS = '.oswSdmlg';

/** Number of differing pixels between two equal-sized grids. */
const diff = (a: SpriteGrid, b: SpriteGrid): number =>
  a.reduce((n, row, y) => n + [...row].filter((ch, x) => b[y][x] !== ch).length, 0);

describe('tier escalation overlays', () => {
  it('every tower has exactly two escalation overlays; no orphans', () => {
    for (const def of Object.values(TOWERS)) {
      expect(TIER_ESCALATIONS[def.id], def.id).toBeDefined();
      expect(TIER_ESCALATIONS[def.id]).toHaveLength(2);
    }
    expect(Object.keys(TIER_ESCALATIONS).sort()).toEqual(Object.keys(TOWERS).sort());
  });

  it('overlays are 20×20 and use only allowed keys', () => {
    for (const [id, pair] of Object.entries(TIER_ESCALATIONS)) {
      for (const overlay of pair) {
        expect(overlay.length, `${id} height`).toBe(20);
        overlay.forEach((row, i) => expect(row.length, `${id} row ${i}`).toBe(20));
        for (const ch of new Set(overlay.join('').split(''))) {
          expect(ALLOWED_KEYS.includes(ch), `${id}: bad key '${ch}'`).toBe(true);
        }
      }
    }
  });

  it('escalations never touch rows 16–19 (plinth + gem badges own them)', () => {
    for (const [id, pair] of Object.entries(TIER_ESCALATIONS)) {
      for (const overlay of pair) {
        for (let y = 16; y < 20; y++) {
          expect(overlay[y], `${id} row ${y}`).toBe('....................');
        }
      }
    }
  });

  it('every tier step changes at least 12 pixels — the "visibly dramatic" floor', () => {
    for (const def of Object.values(TOWERS)) {
      const t0 = towerSpriteGrid(def.id, 0);
      const t1 = towerSpriteGrid(def.id, 1);
      const t2 = towerSpriteGrid(def.id, 2);
      expect(diff(t0, t1), `${def.id} t0→t1`).toBeGreaterThanOrEqual(12);
      expect(diff(t1, t2), `${def.id} t1→t2`).toBeGreaterThanOrEqual(12);
    }
  });

  it('tier sprites stay pairwise distinct across the whole roster at every tier', () => {
    const all: string[] = [];
    for (const def of Object.values(TOWERS)) {
      for (let tier = 0; tier <= 2; tier++) all.push(towerSpriteGrid(def.id, tier).join('\n'));
    }
    expect(new Set(all).size).toBe(all.length);
  });

  it('escalated tier-2 grids stay bake-safe (all keys resolvable, still 20×20)', () => {
    for (const def of Object.values(TOWERS)) {
      const t2 = towerSpriteGrid(def.id, 2);
      expect(t2.length).toBe(20);
      t2.forEach((row) => expect(row.length).toBe(20));
      for (const ch of new Set(t2.join('').split(''))) {
        expect(ALLOWED_KEYS.includes(ch), `${def.id}: '${ch}'`).toBe(true);
      }
    }
  });
});
