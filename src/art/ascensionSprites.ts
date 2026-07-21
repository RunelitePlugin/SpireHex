import { accentRemap, composeGrid, specSpriteGrid, type SpriteGrid } from './sprites';
import { SPEC_VARIANTS } from './specSprites';

/**
 * P11 ascension art (docs/art-direction.md §Ascension escalation law): one
 * dramatic full-height frame per ARCHETYPE, composed over the spec sprite.
 * tierSprites.ts P11 NOTE resolved: ascensions got their own module with
 * full-grid freedom via composition instead of a third escalation index.
 */
export type AscensionArchetype = 'heavy' | 'rapid' | 'long' | 'support';

const E = '....................';

const FRAMES: Record<AscensionArchetype, SpriteGrid> = {
  // Bulwark: massive shoulder ramparts flanking the whole body.
  heavy: [
    'og................go',
    'olg..............glo',
    'olmg............gmlo',
    'ossg............gsso',
    '.og..............go.',
    ...Array.from({ length: 10 }, () => E),
    '.g................g.',
    ...Array.from({ length: 4 }, () => E),
  ],
  // Spark crown: a storm of muzzle glints over the crown, cascading down both flanks.
  rapid: [
    '...g....g..g....g...',
    '..glg..glgglg..glg..',
    '...g....g..g....g...',
    '.g..................',
    '..................g.',
    '.g..................',
    '..................g.',
    '.g..................',
    '..................g.',
    '.g..................',
    '..................g.',
    '.g..................',
    '..................g.',
    '..g..............g..',
    '...g............g...',
    '....g..........g....',
    ...Array.from({ length: 4 }, () => E),
  ],
  // Beacon spire: a towering sight-beacon rising past the frame top, on a wide glowing mast.
  long: [
    '.........gg.........',
    '........glmg........',
    '.......glmmdg.......',
    '........glmg........',
    '.........gg.........',
    '.........gg.........',
    '.........gg.........',
    '.........gg.........',
    '........lggl........',
    '.......l....l.......',
    '.......l....l.......',
    '.......l....l.......',
    '......gl....lg......',
    '......gl....lg......',
    '.......l....l.......',
    '.......l....l.......',
    ...Array.from({ length: 4 }, () => E),
  ],
  // Halo: a grand double orbit ring around the upper body.
  support: [
    '......gggggggg......',
    '....gg........gg....',
    '...g............g...',
    '...g............g...',
    '....gg........gg....',
    '......gggggggg......',
    E,
    '.....llllllllll.....',
    '....l..........l....',
    '....l..........l....',
    '....l..........l....',
    '....l..........l....',
    '....l..........l....',
    '.....llllllllll.....',
    E,
    E,
    ...Array.from({ length: 4 }, () => E),
  ],
};

/** Archetype per ascension, keyed by SPEC id (all 36 — content test enforces coverage). */
export const ASCENSION_ARCHETYPE: Record<string, AscensionArchetype> = {
  // ember / frost / thorn / storm / sun / umbra
  emberMagmaMortar: 'heavy', emberFlamelash: 'rapid', emberMeteorCaller: 'long', emberDuskfire: 'support',
  frostDeepFreeze: 'heavy', frostGlacierCore: 'heavy', frostNova: 'support', frostPermafrost: 'rapid',
  thornPlaguebearer: 'support', thornBriarheart: 'heavy', thornVerdantWard: 'long', thornRoots: 'heavy',
  stormTempestCoil: 'support', stormThunderlance: 'long', stormStaticField: 'rapid', stormOvercharge: 'heavy',
  sunBeacon: 'support', sunLance: 'long', sunZenithRay: 'rapid', sunJudgement: 'heavy',
  umbraReapersMark: 'heavy', umbraHexweaver: 'support', umbraVoidSpike: 'heavy', umbraNightfall: 'rapid',
  // neutral
  sentryGatling: 'rapid', sentryLongshot: 'long', sentryMarksman: 'heavy', sentryOverdrive: 'rapid',
  mortarColossus: 'heavy', mortarClusterRain: 'support', mortarLongarm: 'long', mortarQuake: 'heavy',
  wardenGoldgaze: 'support', wardenFarbeacon: 'long', wardenWarBanner: 'support', wardenVigil: 'support',
};

/** Ascended sprite: spec sprite + archetype frame (accent-remapped like its spec). */
export function ascensionSpriteGrid(towerId: string, specId: string): SpriteGrid {
  const archetype = ASCENSION_ARCHETYPE[specId];
  if (archetype === undefined) throw new Error(`no ascension archetype for '${specId}'`);
  const variant = SPEC_VARIANTS[specId];
  const frame = variant?.accent !== undefined ? accentRemap(FRAMES[archetype]) : FRAMES[archetype];
  return composeGrid(specSpriteGrid(towerId, specId), frame);
}

export const ascTexKey = (specId: string): string => `asc-${specId}`;
