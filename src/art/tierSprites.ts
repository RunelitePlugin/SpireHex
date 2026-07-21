import type { SpriteGrid } from './sprites';

/**
 * Per-tower tier escalation overlays (P9, docs/art-direction.md §Tier
 * escalation). Composed CUMULATIVELY by towerSpriteGrid: base → [0] at
 * tier ≥ 1 → +[1] at tier 2 → shared gem/sigil badges on top.
 * Index 0: the crown/apex grows. Index 1: flanking structures / glow web.
 * Rows 16–19 are reserved (plinth + gems) and must stay empty (tested).
 *
 * P11 ASCENSION NOTE (resolved): tier-4 ascensions live in their own module,
 * `src/art/ascensionSprites.ts` — one ARCHETYPE frame (heavy/rapid/long/
 * support) per spec, composed over `specSpriteGrid` via `ascensionSpriteGrid`.
 * This record stays tier-only; ascensions never extend it by index.
 */
const E = '....................';

export const TIER_ESCALATIONS: Record<string, readonly [SpriteGrid, SpriteGrid]> = {
  // Fire: T1 the living flame doubles in size; T2 twin shoulder braziers.
  emberSpire: [
    [
      '........gggg........',
      '.......gllllg.......',
      '......gllllmmg......',
      '......glllmmdg......',
      '.......glmmdg.......',
      '........omdo........',
      E, E, E, E, E, E, E, E, E, E, E, E, E, E,
    ],
    [
      E, E, E, E, E, E, E,
      '....g..........g....',
      '...ogg........ggo...',
      '...olmo......omlo...',
      '...osso......osso...',
      '....oo........oo....',
      E, E, E, E, E, E, E, E,
    ],
  ],
  // Frost: T1 taller/wider apex + inner glint band; T2 twin floating side shards.
  frostObelisk: [
    [
      '........gggg........',
      '.......ogllmo.......',
      '......ogllmmo.......',
      '......olllmmdo......',
      E, E, E, E,
      '.....olgmlmgddo.....',
      '.....ollgmmgddo.....',
      E, E, E, E, E, E, E, E, E, E,
    ],
    [
      E, E, E, E, E,
      '..g..............g..',
      '.olg............glo.',
      '.olmg..........gmlo.',
      '.olmg..........gmlo.',
      '..omg..........gmo..',
      '...o............o...',
      E, E, E, E, E, E, E, E, E,
    ],
  ],
  // Nature: T1 thorn spikes double + budding horns; T2 full antler crown + second eye band glows.
  thornTotem: [
    [
      '.......om..mo.......',
      E, E, E,
      '...gg..........gg...',
      '..gg............gg..',
      E, E,
      '...gg..........gg...',
      '..gg............gg..',
      E, E,
      '...gg..........gg...',
      E, E, E, E, E, E, E,
    ],
    [
      '.....gm......mg.....',
      '......mo....om......',
      '.......mo..om.......',
      E, E, E,
      '......oggggggo......',
      E, E, E,
      '.......owggso.......',
      E, E, E, E, E, E, E, E, E,
    ],
  ],
  // Storm: T1 the orb swells between the prongs; T2 arc sparks bridge the tips + base discharge.
  stormPylon: [
    [
      E,
      '.........gg.........',
      '........gllg........',
      '.......glllmg.......',
      '.......gllmmg.......',
      '........gmmg........',
      E, E, E, E, E, E, E, E, E, E, E, E, E, E,
    ],
    [
      '.....gg......gg.....',
      '......g......g......',
      E, E, E, E,
      '..gg............gg..',
      '..g..............g..',
      E, E, E, E, E, E, E, E, E, E, E, E,
    ],
  ],
  // Radiant: T1 a ring of radiating spokes; T2 disc corona + pillar flames.
  sunShrine: [
    [
      '....g..gggggg..g....',
      E,
      '...g............g...',
      E,
      '..g..............g..',
      E,
      '...g............g...',
      E,
      '....g..........g....',
      E, E, E, E, E, E, E, E, E, E, E,
    ],
    [
      '......gggggggg......',
      '.....g........g.....',
      E, E, E, E, E, E, E,
      '...gg..........gg...',
      '...gl..........lg...',
      E, E, E, E, E, E, E, E, E,
    ],
  ],
  // Shadow: T1 the rune-crack blazes into a web; T2 crown horns + orbiting void glints.
  umbraMonolith: [
    [
      E, E, E,
      '........gggg........',
      E,
      '.......gggg.........',
      E,
      '........gggg........',
      E,
      '.......gggg.........',
      E,
      '........gggg........',
      E,
      '.......ggg..........',
      E, E, E, E, E, E,
    ],
    [
      '.....og......go.....',
      '.....g........g.....',
      '..g..............g..',
      E,
      '.og..............go.',
      E,
      '.og..............go.',
      E,
      '.og..............go.',
      E,
      '..g..............g..',
      E, E, E, E, E, E, E, E, E,
    ],
  ],
  // Neutral sentry: T1 twin-roof watch platform; T2 flanking buttress arms.
  watchSentry: [
    [
      '.......oo.oo........',
      '......olmolmo.......',
      '.....olllmlllo......',
      '....ogllmmllmdo.....',
      '....ossssssssso.....',
      ...Array.from({ length: 15 }, () => E),
    ],
    [
      ...Array.from({ length: 8 }, () => E),
      '...og........go.....',
      '...olm......mlo.....',
      '...oss......sso.....',
      '....o........o......',
      ...Array.from({ length: 8 }, () => E),
    ],
  ],
  // Neutral mortar: T1 the barrel lengthens; T2 flanking shell racks.
  boulderMortar: [
    [
      '......oooooo........',
      '.....olllmmmo.......',
      '....olgggggmdo......',
      '....olg...gmdo......',
      ...Array.from({ length: 16 }, () => E),
    ],
    [
      ...Array.from({ length: 9 }, () => E),
      '..oo............oo..',
      '.olmo..........omdo.',
      '.olmo..........omdo.',
      '.osso..........osso.',
      '..oo............oo..',
      ...Array.from({ length: 6 }, () => E),
    ],
  ],
  // Neutral warden: T1 the lantern blazes wider; T2 twin side torches.
  wardenBeacon: [
    [
      '........gggg........',
      '.......gggggg.......',
      '......og....go......',
      '......o..gg..o......',
      '......o.gggg.o......',
      '......o..gg..o......',
      '......og....go......',
      ...Array.from({ length: 13 }, () => E),
    ],
    [
      ...Array.from({ length: 5 }, () => E),
      '...g............g...',
      '..ogo..........ogo..',
      '..olo..........olo..',
      '..omo..........omo..',
      '...o............o...',
      ...Array.from({ length: 10 }, () => E),
    ],
  ],
};
