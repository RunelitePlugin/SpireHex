import { describe, expect, it } from 'vitest';
import { ATTACK_ELEMENT_IDS, ELEMENT_IDS, ELEMENT_MATRIX, OPPOSED } from '../../src/content/elements';
import { CONTENT } from '../../src/content';

describe('element matrix', () => {
  it('defines exactly 6 defender elements and 7 attacker elements', () => {
    expect(ELEMENT_IDS).toEqual(['fire', 'frost', 'nature', 'storm', 'radiant', 'shadow']);
    expect(ATTACK_ELEMENT_IDS).toEqual([...ELEMENT_IDS, 'neutral']);
  });

  it('is complete: all 42 attacker × defender entries exist and are positive numbers', () => {
    let count = 0;
    for (const attacker of ATTACK_ELEMENT_IDS) {
      for (const defender of ELEMENT_IDS) {
        const m = ELEMENT_MATRIX[attacker][defender];
        expect(typeof m, `${attacker} vs ${defender}`).toBe('number');
        expect(m).toBeGreaterThan(0);
        count += 1;
      }
    }
    expect(count).toBe(42);
  });

  it('neutral deals exactly 1.0 against everything (spec §4: reliable, never optimal)', () => {
    for (const defender of ELEMENT_IDS) expect(ELEMENT_MATRIX.neutral[defender]).toBe(1.0);
  });

  it('no enemy is ever neutral (attacker-only element)', () => {
    for (const e of Object.values(CONTENT.enemies)) expect(ELEMENT_IDS).toContain(e.element);
  });

  it('pairs are reciprocal: the opposed of my opposed is me', () => {
    for (const el of ELEMENT_IDS) {
      expect(OPPOSED[OPPOSED[el]]).toBe(el);
      expect(OPPOSED[el]).not.toBe(el);
    }
  });

  it('attacking the opposed element deals 1.5x — symmetric across each pair', () => {
    for (const el of ELEMENT_IDS) {
      expect(ELEMENT_MATRIX[el][OPPOSED[el]]).toBe(1.5);
      expect(ELEMENT_MATRIX[OPPOSED[el]][el]).toBe(1.5);
    }
  });

  it('an element resists itself: own-element attacks deal 0.5x', () => {
    for (const el of ELEMENT_IDS) {
      expect(ELEMENT_MATRIX[el][el]).toBe(0.5);
    }
  });

  it('everything else is the 1.0 baseline', () => {
    for (const attacker of ELEMENT_IDS) {
      for (const defender of ELEMENT_IDS) {
        if (defender === attacker || defender === OPPOSED[attacker]) continue;
        expect(ELEMENT_MATRIX[attacker][defender], `${attacker} vs ${defender}`).toBe(1.0);
      }
    }
  });
});
