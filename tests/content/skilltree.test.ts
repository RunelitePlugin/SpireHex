import { describe, expect, it } from 'vitest';
import { ATTACK_ELEMENT_IDS } from '../../src/content/elements';
import {
  DEFAULT_UNLOCKED_TOWERS,
  SKILL_NODES,
  SKILL_TREE,
  TIER_REQUIREMENTS,
} from '../../src/content/skilltree';

/** Per-tier { nodeCount, rankTotal } census locked by the P11 design (32 nodes / 51 ranks). */
const TIER_CENSUS: Record<number, { nodes: number; ranks: number }> = {
  1: { nodes: 7, ranks: 11 },
  2: { nodes: 8, ranks: 15 },
  3: { nodes: 11, ranks: 19 },
  4: { nodes: 6, ranks: 6 },
};

describe('skill tree v2 content', () => {
  it('has exactly 32 nodes with unique ids, mirrored in SKILL_NODES', () => {
    expect(SKILL_TREE.length).toBe(32);
    const ids = SKILL_TREE.map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const node of SKILL_TREE) expect(SKILL_NODES[node.id]).toBe(node);
  });

  it('every node is tier 1-4 with sane ranks, cost, and a short desc', () => {
    for (const node of SKILL_TREE) {
      expect([1, 2, 3, 4]).toContain(node.tier);
      expect(node.maxRanks).toBeGreaterThanOrEqual(1);
      expect(node.costPerRank).toBe(1);
      expect(node.desc.length).toBeLessThanOrEqual(60);
    }
  });

  it('per-tier node and rank counts match the locked census (7/11, 8/15, 11/19, 6/6)', () => {
    for (const tier of [1, 2, 3, 4] as const) {
      const nodes = SKILL_TREE.filter((n) => n.tier === tier);
      const ranks = nodes.reduce((sum, n) => sum + n.maxRanks, 0);
      expect(nodes.length, `tier ${tier} node count`).toBe(TIER_CENSUS[tier].nodes);
      expect(ranks, `tier ${tier} rank total`).toBe(TIER_CENSUS[tier].ranks);
    }
  });

  it('total ranks across the whole tree is 51', () => {
    const total = SKILL_TREE.reduce((sum, n) => sum + n.maxRanks, 0);
    expect(total).toBe(51);
  });

  it('every elementDamage node names a real attacker element', () => {
    for (const node of SKILL_TREE) {
      if (node.effect.kind === 'elementDamage') expect(ATTACK_ELEMENT_IDS).toContain(node.effect.element);
      if (node.mastery?.effect.kind === 'elementDamage') expect(ATTACK_ELEMENT_IDS).toContain(node.mastery.effect.element);
    }
  });

  it('no node uses the removed unlockTower kind', () => {
    for (const node of SKILL_TREE) {
      expect(node.effect.kind).not.toBe('unlockTower');
      expect(node.mastery?.effect.kind).not.toBe('unlockTower');
    }
  });

  it('exactly one specAccess node (tier 2) and one ascensionAccess node (tier 4)', () => {
    const specAccess = SKILL_TREE.filter((n) => n.effect.kind === 'specAccess');
    const ascensionAccess = SKILL_TREE.filter((n) => n.effect.kind === 'ascensionAccess');
    expect(specAccess).toHaveLength(1);
    expect(specAccess[0].tier).toBe(2);
    expect(ascensionAccess).toHaveLength(1);
    expect(ascensionAccess[0].tier).toBe(4);
  });

  it('TIER_REQUIREMENTS gates are reachable: ranks strictly below each tier meet its requirement', () => {
    expect(TIER_REQUIREMENTS).toEqual({ 2: 3, 3: 8, 4: 14 });
    for (const tier of [2, 3, 4] as const) {
      const ranksBelow = SKILL_TREE.filter((n) => n.tier < tier).reduce((sum, n) => sum + n.maxRanks, 0);
      expect(ranksBelow, `ranks below tier ${tier}`).toBeGreaterThanOrEqual(TIER_REQUIREMENTS[tier]);
    }
  });

  it('a mastery variant always keeps its node effect kind and is strictly stronger', () => {
    for (const node of SKILL_TREE) {
      if (!node.mastery) continue;
      expect(node.mastery.effect.kind).toBe(node.effect.kind);
    }
    // Spot-check the enhanced numbers the design locks in:
    const prospecting = SKILL_NODES.prospecting;
    expect(prospecting.effect).toEqual({ kind: 'startingGold', goldPerRank: 20 });
    expect(prospecting.mastery?.effect).toEqual({ kind: 'startingGold', goldPerRank: 30 });
  });

  it('masterable set is pinned: the 7 tier-1 nodes + the 6 tier-2 element masteries', () => {
    const masterable = SKILL_TREE.filter((n) => n.mastery).map((n) => n.id).sort();
    expect(masterable).toEqual(
      [
        'boldCommander',
        'fieldMedicine',
        'fireMastery',
        'frostMastery',
        'natureMastery',
        'neutralDrills',
        'prospecting',
        'radiantMastery',
        'salvage',
        'scavenger',
        'shadowMastery',
        'stormMastery',
        'wardenTithe',
      ].sort(),
    );
    expect(masterable).toHaveLength(13);
  });

  it('DEFAULT_UNLOCKED_TOWERS is the three neutral starters (P11 Task 8: element towers now unlock via boss kills)', () => {
    expect(DEFAULT_UNLOCKED_TOWERS).toEqual(['watchSentry', 'boulderMortar', 'wardenBeacon']);
  });

  it('is deep-frozen', () => {
    expect(Object.isFrozen(SKILL_TREE)).toBe(true);
    expect(Object.isFrozen(SKILL_NODES.prospecting)).toBe(true);
    expect(Object.isFrozen(SKILL_NODES.prospecting.effect)).toBe(true);
    expect(Object.isFrozen(SKILL_NODES.ascensions)).toBe(true);
    expect(Object.isFrozen(SKILL_NODES.ascensions.effect)).toBe(true);
  });
});
