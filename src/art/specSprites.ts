import type { AttackElement } from '../content/elements';
import type { SpriteGrid } from './sprites';

/**
 * Accessory overlays composited onto each tower's TIER-2 sprite (see
 * specSpriteGrid in sprites.ts). Overlays are authored in base keys
 * (o/s/S/w/d/m/l/g); setting `accent` re-ramps the element keys to that
 * element at compose time (accentRemap) — used by hybrid/off-element specs.
 * Conventions: docs/art-direction.md §Specializations.
 */
export interface SpecVariant {
  readonly overlay: SpriteGrid;
  readonly accent?: AttackElement;
}

const E = '....................';

export const SPEC_VARIANTS: Record<string, SpecVariant> = {
  // ── Ember Spire ────────────────────────────────────────────────────────────
  // Heavy: the flame crown is replaced by a wide mortar barrel with a magma mouth.
  emberMagmaMortar: {
    overlay: [
      '......oooooooo......',
      '.....owsdggdsso.....',
      '.....owsddddsso.....',
      '.....owssssssso.....',
      '......owssssso......',
      E, E, E, E, E, E, E, E, E, E, E, E, E, E, E,
    ],
  },
  // Rapid: twin flame nozzles flanking the crown.
  emberFlamelash: {
    overlay: [
      E,
      E,
      '.....gg......gg.....',
      '.....ol......lo.....',
      '.....os......so.....',
      '.....oo......oo.....',
      E, E, E, E, E, E, E, E, E, E, E, E, E, E,
    ],
  },
  // Support: three orbiting meteor motes above the flame.
  emberMeteorCaller: {
    overlay: [
      '...g................',
      '...............gm...',
      E,
      '....gm..............',
      E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E,
    ],
  },
  // Hybrid: dual shadow-flame crown — drawn in the SHADOW ramp via accent.
  emberDuskfire: {
    accent: 'shadow',
    overlay: [
      '....g..........g....',
      '....lg........gl....',
      '....mlg......glm....',
      '.....ml......lm.....',
      '.....dm......md.....',
      E, E, E, E, E, E, E, E, E, E, E, E, E, E, E,
    ],
  },

  // ── Frost Obelisk ──────────────────────────────────────────────────────────
  // Heavy slow: huge lateral ice spikes grown from the crystal's flanks.
  frostDeepFreeze: {
    overlay: [
      E, E, E, E, E, E, E, E, E,
      '..g..............g..',
      '..lg............gl..',
      '..mlg..........glm..',
      '..mml..........lmm..',
      '...mml........lmm...',
      '...dmm........mmd...',
      '....dm........md....',
      E, E, E, E,
    ],
  },
  // Heavy: blocky ice crown widened above the crystal's tip.
  frostGlacierCore: {
    overlay: [
      '......oggggggo......',
      '.....ollllllllo.....',
      '.....ommmmmmmmo.....',
      '......oddddddo......',
      E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E,
    ],
  },
  // AoE transform: a ring of orbiting glints around the whole crystal.
  frostNova: {
    overlay: [
      E,
      '......g......g......',
      '....g..........g....',
      E,
      '..g..............g..',
      E,
      '.g................g.',
      E,
      '.g................g.',
      E,
      '..g..............g..',
      E,
      '....g..........g....',
      E, E, E, E, E, E, E,
    ],
  },
  // Long-range: thin glowing beam rod rising above the crystal.
  frostPermafrost: {
    overlay: [
      '.........gg.........',
      '.........gg.........',
      '.........gg.........',
      '.........gg.........',
      '.........gg.........',
      '.........gg.........',
      E, E, E, E, E, E, E, E, E, E, E, E, E, E,
    ],
  },

  // ── Thorn Totem ────────────────────────────────────────────────────────────
  // Epidemic: glowing spore sacs hanging from the totem's flanks.
  thornPlaguebearer: {
    overlay: [
      E, E, E, E, E, E, E, E, E, E,
      '.....o........o.....',
      '....omo......omo....',
      '....ommo....ommo....',
      '....ogmo....omgo....',
      '.....oo......oo.....',
      E, E, E, E, E,
    ],
  },
  // Heavy: thick briar wrap bulging around the shaft.
  thornBriarheart: {
    overlay: [
      E, E, E, E, E, E, E,
      '......m......m......',
      '.....mm......mm.....',
      '.....dd......dd.....',
      '......m......m......',
      '.....mm......mm.....',
      '.....dd......dd.....',
      '......m......m......',
      E, E, E, E, E, E,
    ],
  },
  // Long-range: tall vine scope rising above the head.
  thornVerdantWard: {
    overlay: [
      '........gllg........',
      '.........mm.........',
      '.........mm.........',
      '.........dd.........',
      '.........oo.........',
      E, E, E, E, E, E, E, E, E, E, E, E, E, E, E,
    ],
  },
  // Transform: root tendrils spilling over the plinth edges.
  thornRoots: {
    overlay: [
      E, E, E, E, E, E, E, E, E, E, E, E, E, E,
      '..m..............m..',
      '.dm..............md.',
      'dm................md',
      'd..................d',
      E, E,
    ],
  },

  // ── Storm Pylon ────────────────────────────────────────────────────────────
  // More chains: coil rings encircling both prongs.
  stormTempestCoil: {
    overlay: [
      E, E,
      '..g....g....g....g..',
      E,
      '..g....g....g....g..',
      E,
      '..g....g....g....g..',
      E, E, E, E, E, E, E, E, E, E, E, E, E,
    ],
  },
  // Single-target transform: the orb becomes one long lance of light.
  stormThunderlance: {
    overlay: [
      '.........gg.........',
      '.........gg.........',
      '.........lg.........',
      '.........lg.........',
      '.........lg.........',
      '.........lg.........',
      '.........lg.........',
      '.........lg.........',
      '.........lg.........',
      E, E, E, E, E, E, E, E, E, E, E,
    ],
  },
  // Rapid: crackling spark motes scattered beside the prongs.
  stormStaticField: {
    overlay: [
      E,
      '.g..................',
      '..................g.',
      '.g......g...........',
      '...........g......g.',
      '.g..................',
      '..................g.',
      E, E, E, E, E, E, E, E, E, E, E, E, E,
    ],
  },
  // Heavy: widened glowing crown joining the prongs.
  stormOvercharge: {
    overlay: [
      '...oggggggggggggo...',
      '...ollllllllllllo...',
      '...ommmmmmmmmmmmo...',
      E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E,
    ],
  },

  // ── Sun Shrine ─────────────────────────────────────────────────────────────
  // THE aura support: a grand halo encircling the sun disc.
  sunBeacon: {
    overlay: [
      '....g..........g....',
      '...g............g...',
      '..g..............g..',
      '..g..............g..',
      '..g..............g..',
      '..g..............g..',
      '...g............g...',
      '....g..........g....',
      '.....g........g.....',
      E, E, E, E, E, E, E, E, E, E, E,
    ],
  },
  // Long-range: radiant lance rod running through the disc's core.
  sunLance: {
    overlay: [
      '.........gg.........',
      '.........gg.........',
      '.........gg.........',
      '.........gg.........',
      '.........gg.........',
      '.........gg.........',
      '.........gg.........',
      E, E, E, E, E, E, E, E, E, E, E, E, E,
    ],
  },
  // Rapid: twin prism shards flanking the pedestal.
  sunZenithRay: {
    overlay: [
      E, E, E, E, E, E, E, E, E,
      '..g..............g..',
      '.lg..............gl.',
      '.ml..............lm.',
      '..o..............o..',
      E, E, E, E, E, E, E,
    ],
  },
  // Heavy: radiant crown spikes flanking the disc rim.
  sunJudgement: {
    overlay: [
      '.....g........g.....',
      '....om.........mo...',
      '....d...........d...',
      E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E,
    ],
  },

  // ── Umbra Monolith ─────────────────────────────────────────────────────────
  // Boss-killer: a glowing crescent scythe arcing over the slab.
  umbraReapersMark: {
    overlay: [
      '....gggggggggg......',
      '...gmm......mmg.....',
      '...gm..........g....',
      '...g................',
      E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E,
    ],
  },
  // Support/debuff: floating hex rings beside the slab.
  umbraHexweaver: {
    overlay: [
      E, E, E, E,
      '..g..............g..',
      '.g.g............g.g.',
      '..g..............g..',
      '..m..............m..',
      '.m.m............m.m.',
      '..m..............m..',
      E, E, E, E, E, E, E, E, E, E,
    ],
  },
  // Heavy: void spike jutting from the slab top.
  umbraVoidSpike: {
    overlay: [
      '.........gg.........',
      '........lggl........',
      '.......mlgglm.......',
      '......dmlgglmd......',
      E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E,
    ],
  },
  // Rapid: twin dusk bolts hovering at the shoulders.
  umbraNightfall: {
    overlay: [
      E,
      '....g..........g....',
      '.....l........l.....',
      '....m..........m....',
      '.....d........d.....',
      E, E, E, E, E, E, E, E, E, E, E, E, E, E, E,
    ],
  },

  // ── Watch Sentry ───────────────────────────────────────────────────────────
  // Rapid: twin bolt nozzles.
  sentryGatling: {
    overlay: [
      ...Array.from({ length: 2 }, () => E),
      '....oo........oo....',
      '...olmo......olmo...',
      '...olmo......olmo...',
      '....oo........oo....',
      ...Array.from({ length: 14 }, () => E),
    ],
  },
  // Long-range: a tall sight-rod above the roof.
  sentryLongshot: {
    overlay: [
      '.........ol.........',
      '.........ol.........',
      '.........ol.........',
      '.........og.........',
      ...Array.from({ length: 16 }, () => E),
    ],
  },
  // Heavy: a reinforced stone crown.
  sentryMarksman: {
    overlay: [
      '.....oooooooooo.....',
      '....owwSSSSSSsso....',
      '....osssssssssso....',
      ...Array.from({ length: 17 }, () => E),
    ],
  },
  // Unique: crackling overdrive sparks at the eaves.
  sentryOverdrive: {
    overlay: [
      ...Array.from({ length: 5 }, () => E),
      '....g..........g....',
      '...ggg........ggg...',
      '....g..........g....',
      ...Array.from({ length: 12 }, () => E),
    ],
  },

  // ── Boulder Mortar ─────────────────────────────────────────────────────────
  // Heavy: the barrel crowned with a colossal collar.
  mortarColossus: {
    overlay: [
      '.....ooooooooo......',
      '....olllmmmmddo.....',
      '....olggggggmdo.....',
      ...Array.from({ length: 17 }, () => E),
    ],
  },
  // Unique: a triple-barrel cluster rack.
  mortarClusterRain: {
    overlay: [
      '...oo....oo....oo...',
      '..olmo..olmo..olmo..',
      '..ogdo..ogdo..ogdo..',
      '...oo....oo....oo...',
      ...Array.from({ length: 16 }, () => E),
    ],
  },
  // Long-range: an extended rifled barrel rod.
  mortarLongarm: {
    overlay: [
      '.........olm........',
      '.........olm........',
      '.........olm........',
      '.........ogg........',
      ...Array.from({ length: 16 }, () => E),
    ],
  },
  // Unique: ground-spike stabilizers at the base.
  mortarQuake: {
    overlay: [
      ...Array.from({ length: 12 }, () => E),
      '..g..g........g..g..',
      '.og..go......og..go.',
      ...Array.from({ length: 6 }, () => E),
    ],
  },

  // ── Warden Beacon ──────────────────────────────────────────────────────────
  // Unique: the lantern becomes a golden orb.
  wardenGoldgaze: {
    overlay: [
      '........gggg........',
      '.......glllmg.......',
      '.......gllmmg.......',
      '........gggg........',
      ...Array.from({ length: 16 }, () => E),
    ],
  },
  // Long-range: a far-signal antenna above the cage.
  wardenFarbeacon: {
    overlay: [
      '.........g..........',
      '........ggg.........',
      '.........g..........',
      '.........o..........',
      '.........o..........',
      ...Array.from({ length: 15 }, () => E),
    ],
  },
  // Support: a war banner streams from the mast.
  wardenWarBanner: {
    overlay: [
      ...Array.from({ length: 2 }, () => E),
      '......ommllg........',
      '......ommllg........',
      '......ommlg.........',
      '......o.............',
      ...Array.from({ length: 14 }, () => E),
    ],
  },
  // Support: floating watch-glints orbit the lantern.
  wardenVigil: {
    overlay: [
      E,
      '.....gg......gg.....',
      '....g..........g....',
      '.....gg......gg.....',
      ...Array.from({ length: 16 }, () => E),
    ],
  },
};
