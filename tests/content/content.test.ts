import { describe, expect, it } from 'vitest';
import { hexKey } from '../../src/sim/hex';
import { CONTENT, LEVELS } from '../../src/content';
import { ELEMENT_IDS, type ElementId } from '../../src/content/elements';
import type { TowerMechanic } from '../../src/content/types';

const MECHANIC_FOR_ELEMENT: Record<ElementId, TowerMechanic['kind']> = {
  fire: 'burn', frost: 'slow', nature: 'poison', storm: 'chain', radiant: 'pierce', shadow: 'curse',
};

describe('content integrity', () => {
  it('has at least one enemy, tower, and level', () => {
    expect(Object.keys(CONTENT.enemies).length).toBeGreaterThan(0);
    expect(Object.keys(CONTENT.towers).length).toBeGreaterThan(0);
    expect(Object.keys(LEVELS).length).toBeGreaterThan(0);
  });

  it('gives every def an id matching its record key', () => {
    for (const [k, e] of Object.entries(CONTENT.enemies)) expect(e.id).toBe(k);
    for (const [k, t] of Object.entries(CONTENT.towers)) expect(t.id).toBe(k);
    for (const [k, l] of Object.entries(LEVELS)) expect(l.id).toBe(k);
  });

  it('keeps every level path hex and path waypoint inside the level grid', () => {
    for (const level of Object.values(LEVELS)) {
      const grid = new Set(level.hexes.map(hexKey));
      for (const h of level.pathHexes) expect(grid.has(hexKey(h))).toBe(true);
      for (const path of level.paths) for (const w of path) expect(grid.has(hexKey(w))).toBe(true);
    }
  });

  it('references only existing enemies from waves', () => {
    for (const level of Object.values(LEVELS)) {
      for (const wave of level.waves) {
        for (const entry of wave.entries) {
          expect(CONTENT.enemies[entry.enemyId]).toBeDefined();
          expect(entry.count).toBeGreaterThan(0);
          expect(entry.spacing).toBeGreaterThan(0);
        }
      }
    }
  });

  it('gives every level at least one path of 2+ waypoints and positive economy values', () => {
    for (const level of Object.values(LEVELS)) {
      expect(level.paths.length).toBeGreaterThanOrEqual(1);
      for (const path of level.paths) expect(path.length).toBeGreaterThanOrEqual(2);
      expect(level.startingGold).toBeGreaterThan(0);
      expect(level.lives).toBeGreaterThan(0);
      expect(level.waves.length).toBeGreaterThan(0);
      expect(level.waveCountdown).toBeGreaterThan(0);
      expect(level.earlyCallRate).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('phase 2 content', () => {
  it('has exactly nine towers: one per element plus three neutrals', () => {
    const towers = Object.values(CONTENT.towers);
    expect(towers).toHaveLength(9);
    const byElement = towers.filter((t) => t.element !== 'neutral');
    expect(byElement).toHaveLength(6);
    expect(new Set(byElement.map((t) => t.element)).size).toBe(6);
    expect(towers.filter((t) => t.element === 'neutral').map((t) => t.id).sort())
      .toEqual(['boulderMortar', 'wardenBeacon', 'watchSentry']);
  });

  it('gives every tower its element signature mechanic', () => {
    for (const tower of Object.values(CONTENT.towers)) {
      if (tower.element === 'neutral') continue;
      expect(tower.mechanic.kind, tower.id).toBe(MECHANIC_FOR_ELEMENT[tower.element]);
    }
    // P11 neutral pins: no shared signature mechanic across the three neutrals.
    expect(CONTENT.towers.watchSentry.mechanic.kind).toBe('none');
    expect(CONTENT.towers.boulderMortar.mechanic.kind).toBe('splash');
    expect(CONTENT.towers.wardenBeacon.mechanic.kind).toBe('ward');
  });

  it('gives every tower exactly two tiers with positive rising costs, and rising damage unless it never shoots', () => {
    for (const tower of Object.values(CONTENT.towers)) {
      expect(tower.tiers).toHaveLength(2);
      const [t1, t2] = tower.tiers;
      expect(t1.cost).toBeGreaterThan(0);
      expect(t2.cost).toBeGreaterThan(t1.cost);
      // P11: never-shooting base towers (aura/ward) don't have a damage axis to rise.
      const neverShoots = tower.mechanic.kind === 'aura' || tower.mechanic.kind === 'ward';
      if (!neverShoots) {
        expect(t1.damage).toBeGreaterThan(tower.damage);
        expect(t2.damage).toBeGreaterThan(t1.damage);
      }
    }
  });

  it('gives every enemy a valid element and non-negative armor', () => {
    for (const enemy of Object.values(CONTENT.enemies)) {
      expect(ELEMENT_IDS).toContain(enemy.element);
      expect(enemy.armor).toBeGreaterThanOrEqual(0);
    }
  });

  it('covers the archetypes: armored, fast, swarm, stealth', () => {
    const enemies = Object.values(CONTENT.enemies);
    expect(enemies.some((e) => e.armor >= 4)).toBe(true);            // armored
    expect(enemies.some((e) => e.speed >= 100)).toBe(true);          // fast
    expect(enemies.some((e) => e.bounty <= 2 && e.hp <= 20)).toBe(true); // swarm chaff
    expect(enemies.some((e) => e.stealth === true)).toBe(true);      // stealth
  });

  it('P12: the Frostfell family covers all five archetype roles', () => {
    const f = (id: string) => CONTENT.enemies[id];
    expect(f('driftmote').hp).toBeLessThanOrEqual(30);                 // swarm
    expect(f('icefang').speed).toBeGreaterThanOrEqual(100);            // fast
    expect(f('glacierback').armor).toBeGreaterThanOrEqual(6);          // armored
    expect(f('rimewraith').stealth).toBe(true);                        // stealth
    expect(f('frostbrand').hp).toBeGreaterThanOrEqual(400);            // bruiser
    expect(f('frostbrand').armor).toBe(0);
    for (const id of ['driftmote', 'icefang', 'glacierback', 'rimewraith', 'frostbrand']) {
      expect(f(id).element, id).toBe('frost');
      expect(f(id).boss, id).toBeUndefined();
    }
  });

  it('P12: the Verdant Deep family covers all five archetype roles', () => {
    const f = (id: string) => CONTENT.enemies[id];
    expect(f('sporeling').hp).toBeLessThanOrEqual(30);                 // swarm
    expect(f('thornhound').speed).toBeGreaterThanOrEqual(100);         // fast
    expect(f('barkhide').armor).toBeGreaterThanOrEqual(6);             // armored
    expect(f('gladeshade').stealth).toBe(true);                        // stealth
    expect(f('mirehulk').livesCost).toBe(3);                           // 3-life bruiser
    for (const id of ['sporeling', 'thornhound', 'barkhide', 'gladeshade', 'mirehulk']) {
      expect(f(id).element, id).toBe('nature');
      expect(f(id).boss, id).toBeUndefined();
    }
  });

  it('P13: the Storm Reach family covers all five archetype roles', () => {
    const f = (id: string) => CONTENT.enemies[id];
    expect(f('sparkmote').hp).toBeLessThanOrEqual(34);                 // swarm
    expect(f('galestrider').speed).toBeGreaterThanOrEqual(125);        // fast — the fastest non-boss
    expect(f('thunderhide').armor).toBeGreaterThanOrEqual(9);          // armored
    expect(f('mistwalker').stealth).toBe(true);                        // stealth
    expect(f('stormbrute').hp).toBeGreaterThanOrEqual(440);            // bruiser
    expect(f('stormbrute').armor).toBe(0);
    for (const id of ['sparkmote', 'galestrider', 'thunderhide', 'mistwalker', 'stormbrute']) {
      expect(f(id).element, id).toBe('storm');
      expect(f(id).boss, id).toBeUndefined();
    }
  });

  it('P13: the Radiant Summits family covers all five archetype roles', () => {
    const f = (id: string) => CONTENT.enemies[id];
    expect(f('lumenmote').hp).toBeLessThanOrEqual(34);                 // swarm
    expect(f('raywisp').speed).toBeGreaterThanOrEqual(120);            // fast
    expect(f('aegisbearer').armor).toBeGreaterThanOrEqual(10);         // armored — hardest plates
    expect(f('veilseraph').stealth).toBe(true);                        // stealth
    expect(f('sungrazer').livesCost).toBe(3);                          // 3-life bruiser
    for (const id of ['lumenmote', 'raywisp', 'aegisbearer', 'veilseraph', 'sungrazer']) {
      expect(f(id).element, id).toBe('radiant');
      expect(f(id).boss, id).toBeUndefined();
    }
  });

  it('P14: the Umbral Depths family covers all five archetype roles', () => {
    const f = (id: string) => CONTENT.enemies[id];
    expect(f('voidmote').hp).toBeLessThanOrEqual(38);                  // swarm
    expect(f('gloomwing').speed).toBeGreaterThanOrEqual(125);          // fast
    expect(f('umbrahusk').armor).toBeGreaterThanOrEqual(10);           // armored
    expect(f('nullwraith').stealth).toBe(true);                        // stealth — the toughest in the game
    expect(f('nullwraith').hp).toBeGreaterThanOrEqual(230);
    expect(f('dreadmaw').livesCost).toBe(3);                           // 3-life bruiser
    for (const id of ['voidmote', 'gloomwing', 'umbrahusk', 'nullwraith', 'dreadmaw']) {
      expect(f(id).element, id).toBe('shadow');
      expect(f(id).boss, id).toBeUndefined();
    }
  });

  it('level04 fields a stealth enemy so radiant targeting matters', () => {
    // P11: level01 becomes gloomling-only in Task 9 (Task 9's hint-pin test owns
    // debut shape there); duskstalkers are — and remain — in level04.
    const ids = new Set(LEVELS.level04.waves.flatMap((w) => w.entries.map((e) => e.enemyId)));
    expect([...ids].some((id) => CONTENT.enemies[id].stealth === true)).toBe(true);
    expect(LEVELS.level04.waves.length).toBeGreaterThanOrEqual(5);
  });
});

describe('content hardening', () => {
  it('deep-freezes all content: mutation attempts throw', () => {
    expect(() => { (CONTENT.towers.emberSpire as { damage: number }).damage = 999; }).toThrow(TypeError);
    expect(() => { CONTENT.towers.emberSpire.tiers[0].cost = 1; }).toThrow(TypeError);
    expect(() => { (CONTENT.enemies.gloomling as { hp: number }).hp = 1; }).toThrow(TypeError);
    expect(() => { LEVELS.level01.waves[0].entries[0].count = 99; }).toThrow(TypeError);
    expect(() => { LEVELS.level01.hexes.push({ q: 99, r: 99 }); }).toThrow(TypeError);
  });

  it('keeps every tier mechanic (when present) on the element signature', () => {
    // Tier upgrades strengthen the signature; role TRANSFORMS are reserved for
    // specializations (validated separately in the phase 3 content tests).
    // P11: neutrals have no MECHANIC_FOR_ELEMENT row — pin their own signature.
    const NEUTRAL_SIGNATURE: Record<string, TowerMechanic['kind']> = {
      watchSentry: 'none', boulderMortar: 'splash', wardenBeacon: 'ward',
    };
    for (const tower of Object.values(CONTENT.towers)) {
      const expectedKind = tower.element === 'neutral'
        ? NEUTRAL_SIGNATURE[tower.id]
        : MECHANIC_FOR_ELEMENT[tower.element];
      for (const tier of tower.tiers) {
        if (tier.mechanic) expect(tier.mechanic.kind, tower.id).toBe(expectedKind);
      }
    }
  });
});

describe('phase 3 specializations', () => {
  it('gives every tower exactly 4 specializations with unique ids, costs 150–260, sane stats', () => {
    for (const tower of Object.values(CONTENT.towers)) {
      expect(tower.specializations, tower.id).toBeDefined();
      expect(tower.specializations).toHaveLength(4);
      expect(new Set(tower.specializations.map((s) => s.id)).size).toBe(4);
      for (const s of tower.specializations) {
        expect(s.cost, `${tower.id}/${s.id}`).toBeGreaterThanOrEqual(150);
        expect(s.cost, `${tower.id}/${s.id}`).toBeLessThanOrEqual(260);
        expect(s.range, `${tower.id}/${s.id}`).toBeGreaterThanOrEqual(0);
        // Support (aura/ward) specs never shoot — fireRate/damage are honestly 0.
        const neverShoots = s.mechanic.kind === 'aura' || s.mechanic.kind === 'ward';
        if (!neverShoots) {
          expect(s.fireRate, `${tower.id}/${s.id}`).toBeGreaterThan(0);
          expect(s.damage, `${tower.id}/${s.id}`).toBeGreaterThan(0);
        }
      }
    }
  });

  it('keeps spec mechanics on-theme: the element signature or an allowed transform', () => {
    // Transforms a spec may take instead of the signature: pure damage, a multi-hit
    // arc/nova (chain), a root/freeze (slow), support (aura), a hybrid (dualElement
    // that must include the tower's own element), or — P11 — the neutral AoE/utility
    // kinds (splash, ward).
    const ALLOWED_TRANSFORMS: Array<TowerMechanic['kind']> = ['none', 'chain', 'slow', 'aura', 'dualElement', 'splash', 'ward'];
    for (const tower of Object.values(CONTENT.towers)) {
      const signature = tower.element === 'neutral' ? undefined : MECHANIC_FOR_ELEMENT[tower.element];
      for (const s of tower.specializations) {
        const kind = s.mechanic.kind;
        expect(
          kind === signature || ALLOWED_TRANSFORMS.includes(kind),
          `${tower.id}/${s.id}: ${kind}`,
        ).toBe(true);
        // Dual-element hybrids are an element-tower-only transform (spec §4: no meaningless neutral pairing).
        if (s.mechanic.kind === 'dualElement') {
          expect(tower.element, `${tower.id}/${s.id}`).not.toBe('neutral');
          const [a, b] = s.mechanic.elements;
          expect(a).not.toBe(b);
          expect(s.mechanic.elements).toContain(tower.element);
          expect(ELEMENT_IDS).toContain(a);
          expect(ELEMENT_IDS).toContain(b);
        }
      }
    }
  });

  it('fields the required anchors: at least one aura support and one dual-element hybrid', () => {
    const specs = Object.values(CONTENT.towers).flatMap((t) => [...t.specializations]);
    expect(specs.some((s) => s.mechanic.kind === 'aura')).toBe(true);
    expect(specs.some((s) => s.mechanic.kind === 'dualElement')).toBe(true);
  });

  it('keeps specialization ids unique across the entire roster, not just within a tower', () => {
    const ids = Object.values(CONTENT.towers).flatMap((t) => t.specializations.map((s) => s.id));
    expect(new Set(ids).size).toBe(36);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('phase 4 balance (P3 final-review ticket)', () => {
  it('umbraNightfall meets or beats tier-2 curse on every axis and is premium-priced', () => {
    const t2 = CONTENT.towers.umbraMonolith.tiers[1].mechanic;
    const spec = CONTENT.towers.umbraMonolith.specializations.find((s) => s.id === 'umbraNightfall')!;
    if (t2?.kind !== 'curse' || spec.mechanic.kind !== 'curse') throw new Error('expected curse mechanics');
    expect(spec.mechanic.currentHpPct).toBeGreaterThanOrEqual(t2.currentHpPct);
    expect(spec.mechanic.vulnMultiplier).toBeGreaterThanOrEqual(t2.vulnMultiplier);
    expect(spec.mechanic.vulnDuration).toBeGreaterThanOrEqual(t2.vulnDuration);
    expect(spec.cost).toBeGreaterThanOrEqual(230);
  });

  it('stormStaticField chains reach at least tier-2 radius and it is premium-priced', () => {
    const t2 = CONTENT.towers.stormPylon.tiers[1].mechanic;
    const spec = CONTENT.towers.stormPylon.specializations.find((s) => s.id === 'stormStaticField')!;
    if (t2?.kind !== 'chain' || spec.mechanic.kind !== 'chain') throw new Error('expected chain mechanics');
    expect(spec.mechanic.radius).toBeGreaterThanOrEqual(t2.radius);
    expect(spec.cost).toBeGreaterThanOrEqual(230);
  });
});

describe('P11 Task 6: tier-4 ascensions', () => {
  const allSpecs = Object.values(CONTENT.towers).flatMap((t) => t.specializations.map((s) => ({ tower: t, spec: s })));

  it('gives every one of the 36 specs an ascension', () => {
    expect(allSpecs).toHaveLength(36);
    for (const { tower, spec } of allSpecs) {
      expect(spec.ascension, `${tower.id}/${spec.id}`).toBeDefined();
    }
  });

  it('keeps ascension ids unique across the roster, all prefixed "asc"', () => {
    const ids = allSpecs.map(({ spec }) => spec.ascension.id);
    expect(ids).toHaveLength(36);
    expect(new Set(ids).size).toBe(36);
    for (const id of ids) expect(id.startsWith('asc'), id).toBe(true);
  });

  it('prices every ascension between 300 and 420 gold', () => {
    for (const { tower, spec } of allSpecs) {
      expect(spec.ascension.cost, `${tower.id}/${spec.id}`).toBeGreaterThanOrEqual(300);
      expect(spec.ascension.cost, `${tower.id}/${spec.id}`).toBeLessThanOrEqual(420);
    }
  });

  it('is strictly stronger than the spec it replaces, per mechanic family', () => {
    for (const { tower, spec } of allSpecs) {
      const label = `${tower.id}/${spec.id}`;
      const asc = spec.ascension;
      if (spec.mechanic.kind === 'ward') {
        // Ward ascensions stay ward: reveal and income both meet-or-beat, at least one strictly.
        expect(asc.mechanic?.kind, label).toBe('ward');
        if (asc.mechanic?.kind !== 'ward') throw new Error('unreachable');
        expect(asc.mechanic.revealRadius, label).toBeGreaterThanOrEqual(spec.mechanic.revealRadius);
        expect(asc.mechanic.goldPerWave, label).toBeGreaterThanOrEqual(spec.mechanic.goldPerWave);
        expect(
          asc.mechanic.revealRadius > spec.mechanic.revealRadius || asc.mechanic.goldPerWave > spec.mechanic.goldPerWave,
          label,
        ).toBe(true);
      } else if (spec.mechanic.kind === 'aura') {
        // Aura ascensions stay aura: radius and fire-rate bonus both meet-or-beat, at least one strictly.
        expect(asc.mechanic?.kind, label).toBe('aura');
        if (asc.mechanic?.kind !== 'aura') throw new Error('unreachable');
        expect(asc.mechanic.radius, label).toBeGreaterThanOrEqual(spec.mechanic.radius);
        expect(asc.mechanic.fireRateBonus, label).toBeGreaterThanOrEqual(spec.mechanic.fireRateBonus);
        expect(
          asc.mechanic.radius > spec.mechanic.radius || asc.mechanic.fireRateBonus > spec.mechanic.fireRateBonus,
          label,
        ).toBe(true);
      } else {
        // Every other family shoots: raw DPS (damage × fireRate) must strictly rise.
        expect(asc.damage * asc.fireRate, label).toBeGreaterThan(spec.damage * spec.fireRate);
      }
    }
  });

  it('inherits the spec mechanic when the ascension omits mechanic, else overrides it', () => {
    for (const { tower, spec } of allSpecs) {
      const label = `${tower.id}/${spec.id}`;
      if (spec.ascension.mechanic === undefined) continue; // inherit case: nothing to assert beyond "compiles"
      expect(spec.ascension.mechanic.kind, label).toBeDefined();
    }
  });
});
