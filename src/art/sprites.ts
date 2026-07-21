import type { AttackElement } from '../content/elements';
import { SPEC_VARIANTS } from './specSprites';
import { TIER_ESCALATIONS } from './tierSprites';

/**
 * Pixel sprites as string grids: each string is one row, each character one
 * pixel, resolved through a palette at bake time (src/game/artBake.ts).
 * This module is PURE DATA + palette logic — no Phaser, no canvas, no sim —
 * so it runs headless under Vitest (tripwired in tests/architecture).
 *
 * Grid keys (docs/art-direction.md):
 *   '.' transparent   'o' outline   's' dark stone   'S' mid stone   'w' light stone
 *   'd'/'m'/'l'/'g'   element ramp: dark / mid / light / glow
 *   'D'/'M'/'L'/'G'   accent-element ramp (produced by accentRemap — never hand-authored)
 */
export type SpriteGrid = readonly string[];
export type SpritePalette = Readonly<Record<string, string>>;

export const OUTLINE = '#0d1017';
export const STONE_COLORS: SpritePalette = { s: '#2e3542', S: '#4a5468', w: '#8b98b0' };

export interface ElementRamp {
  readonly d: string;
  readonly m: string;
  readonly l: string;
  readonly g: string;
}

export const ELEMENT_RAMPS: Record<AttackElement, ElementRamp> = {
  fire:    { d: '#7a2d12', m: '#b8491e', l: '#e07b39', g: '#ffc46b' },
  frost:   { d: '#1d5a74', m: '#3a93b8', l: '#5fc7e8', g: '#c8f0ff' },
  nature:  { d: '#2a6231', m: '#43974a', l: '#63c464', g: '#b4e89a' },
  storm:   { d: '#453a8f', m: '#6a5bc7', l: '#8f7ff2', g: '#d3c8ff' },
  radiant: { d: '#8a6a1f', m: '#c4a13a', l: '#f0d06a', g: '#fff2b8' },
  shadow:  { d: '#471d66', m: '#7a35b0', l: '#9a4ad9', g: '#d9a8ff' },
  // P11 neutral: forged bronze-steel — warm but unsaturated, never mistakable for an element.
  neutral: { d: '#4a4238', m: '#6e6252', l: '#9a8b72', g: '#d8c9a8' },
};

/** The ramp's light tone as a Phaser color number — THE source for element accents in UI/VFX. */
export const ELEMENT_ACCENTS = Object.fromEntries(
  (Object.keys(ELEMENT_RAMPS) as AttackElement[]).map((e) => [e, parseInt(ELEMENT_RAMPS[e].l.slice(1), 16)]),
) as Record<AttackElement, number>;

export function paletteFor(element: AttackElement, accent?: AttackElement): SpritePalette {
  const r = ELEMENT_RAMPS[element];
  const p: Record<string, string> = { o: OUTLINE, ...STONE_COLORS, d: r.d, m: r.m, l: r.l, g: r.g };
  if (accent !== undefined) {
    const a = ELEMENT_RAMPS[accent];
    p.D = a.d;
    p.M = a.m;
    p.L = a.l;
    p.G = a.g;
  }
  return p;
}

/** Overlay pixels replace base pixels; '.' in the overlay preserves the base. Dimensions must match. */
export function composeGrid(base: SpriteGrid, overlay: SpriteGrid): SpriteGrid {
  if (overlay.length !== base.length) throw new Error('composeGrid: row count mismatch');
  return base.map((row, y) => {
    const over = overlay[y];
    if (over.length !== row.length) throw new Error(`composeGrid: row ${y} width mismatch`);
    let out = '';
    for (let x = 0; x < row.length; x++) out += over[x] === '.' ? row[x] : over[x];
    return out;
  });
}

/** Remap an overlay's element keys (d/m/l/g → D/M/L/G) so it bakes in the ACCENT element's ramp. */
export function accentRemap(overlay: SpriteGrid): SpriteGrid {
  const map: Record<string, string> = { d: 'D', m: 'M', l: 'L', g: 'G' };
  return overlay.map((row) => row.replace(/[dmlg]/g, (ch) => map[ch]));
}

/** Shared stone plinth (rows 16–19): every tower stands on it — see docs/art-direction.md. */
const PLINTH: SpriteGrid = [
  '...owSSSSSSssssso...',
  '...owSSSSSSssssso...',
  '...oossssssssssoo...',
  '....oooooooooooo....',
];

export const TOWER_GRIDS: Record<string, SpriteGrid> = {
  // Fire: tapering stone spire crowned by a living flame.
  emberSpire: [
    '.........gg.........',
    '........gllg........',
    '.......gllmmg.......',
    '.......glmmdg.......',
    '........omdo........',
    '........owSo........',
    '.......owSsso.......',
    '.......owSsso.......',
    '......owSmSsso......',
    '......owSmSsso......',
    '......owSSssso......',
    '.....owSSmSssso.....',
    '.....owSSSSssso.....',
    '.....owSSSSssso.....',
    '....owSSSSSsssso....',
    '....owSSSSssssso....',
    ...PLINTH,
  ],
  // Frost: faceted ice crystal — light facet left, dark facet right, inner glints.
  frostObelisk: [
    '.........gg.........',
    '........oglo........',
    '.......ogllmo.......',
    '.......ollmmo.......',
    '......ogllmmdo......',
    '......olllmmdo......',
    '.....oglllmmddo.....',
    '.....olllmmmddo.....',
    '.....olllmmmddo.....',
    '.....ollgmmmddo.....',
    '.....olllmmmddo.....',
    '.....olllmmmddo.....',
    '.....ollmmmdddo.....',
    '.....ollmmmdddo.....',
    '.....olmmmddddo.....',
    '.....oommmdddoo.....',
    ...PLINTH,
  ],
  // Nature: carved totem pole with glowing thorn spikes and a green eye band.
  thornTotem: [
    '.........oo.........',
    '........ommo........',
    '.......olmmdo.......',
    '.......owSsso.......',
    '.....glowSssolg.....',
    '....gllowSssollg....',
    '.......owggso.......',
    '.......owSsso.......',
    '.....glowSssolg.....',
    '....gllowSssollg....',
    '.......owmmso.......',
    '.......owSsso.......',
    '.....glowSssolg.....',
    '.......owSsso.......',
    '......owSSssso......',
    '.....owSSSSssso.....',
    ...PLINTH,
  ],
  // Storm: twin violet prongs cradling a crackling orb.
  stormPylon: [
    '....oo........oo....',
    '...olmo......olmo...',
    '...olmo..gg..olmo...',
    '...olmo.gllg.olmo...',
    '...olmo.glmg.olmo...',
    '...olmo..gg..olmo...',
    '...olmmo....ommdo...',
    '....olmmo..ommdo....',
    '.....olmmoommdo.....',
    '......owSSssdo......',
    '......owSmSsso......',
    '......owSSssso......',
    '.....owSSmSssso.....',
    '.....owSSSSssso.....',
    '....owSSSSSsssso....',
    '....owSSSSssssso....',
    ...PLINTH,
  ],
  // Radiant: golden sun disc on a shrine pedestal flanked by twin pillars.
  sunShrine: [
    '.......oggggo.......',
    '......ogllllgo......',
    '.....oglllllmgo.....',
    '.....ogllllmmgo.....',
    '.....ogllmmmmgo.....',
    '.....oglmmmmdgo.....',
    '......ogmmmdgo......',
    '.......oggggo.......',
    '........owSo........',
    '........owSo........',
    '....oo..owSo..oo....',
    '...owso.owSo.osso...',
    '...owSooowSoooSso...',
    '....owSSSSSSssso....',
    '....owSSSSSSssso....',
    '....owSSSSssssso....',
    ...PLINTH,
  ],
  // Shadow: broad slab with a glowing violet rune-crack.
  umbraMonolith: [
    '......oooooooo......',
    '.....owSSSsssso.....',
    '....owSSSSssssso....',
    '....owSSSgSsssso....',
    '....owSSSggsssso....',
    '....owSSSSgsssso....',
    '....owSSSggsssso....',
    '....owSSSgSsssso....',
    '....owSSggSsssso....',
    '....owmSSggsssso....',
    '....owSSSSgsssso....',
    '....owSSSgSmssso....',
    '....owSSSggsssso....',
    '....owSSSSssssso....',
    '....owSSSSssssso....',
    '....owSSSSssssso....',
    ...PLINTH,
  ],
  // Neutral: a timber watchtower — cabin, eye-slit, crossbow arm (fieldworks, not monolith).
  watchSentry: [
    '........oo..........',
    '.......olmo.........',
    '......olllmo........',
    '.....ogllmmdo.......',
    '.....osssssso.......',
    '.....owSggSso.......',
    '.....owSggSso.......',
    '.....owSSSsso.......',
    '......osssso........',
    '......olm.do........',
    '......ol...do.......',
    '.....olm...mdo......',
    '.....ol.....do......',
    '....olm.....mdo.....',
    '....owSSSSSSsso.....',
    '....owSSSSSSsso.....',
    ...PLINTH,
  ],
  // Neutral: a squat bronze mortar — glowing muzzle ring over a heavy stone carriage.
  boulderMortar: [
    '....................',
    '.......ooooo........',
    '......olllmmo.......',
    '.....olggggmdo......',
    '.....olg..gmdo......',
    '.....olg..gmdo......',
    '.....ollggmmdo......',
    '.....ollmmmddo......',
    '......ollmmdo.......',
    '......ossssso.......',
    '.....owSSSSsso......',
    '....owSSmmSssso.....',
    '....owSSmmSssso.....',
    '...owSSSSSSsssso....',
    '...owSSSSSSsssso....',
    '...oossssssssssoo...',
    ...PLINTH,
  ],
  // Neutral: a beacon pylon — caged lantern glow on a bronze mast (glow un-outlined).
  wardenBeacon: [
    '.........gg.........',
    '........gggg........',
    '.......og..go.......',
    '.......o.gg.o.......',
    '.......o.gg.o.......',
    '.......og..go.......',
    '........ollo........',
    '........olmo........',
    '........olmo........',
    '........omdo........',
    '........omdo........',
    '.......oSmmso.......',
    '.......oSmmso.......',
    '......owSmmSso......',
    '......owSSSsso......',
    '.....owSSSSssso.....',
    ...PLINTH,
  ],
};

const EMPTY_ROW = '....................';

/**
 * Tier embellishments composited onto the shared plinth (art doc: gems at
 * columns 5/14 rows 16–17; tier 2 adds the center sigil at columns 9–10).
 * Index 0 = tier 1 overlay, index 1 = tier 2 overlay (includes the gems).
 */
export const TIER_OVERLAYS: readonly [SpriteGrid, SpriteGrid] = [
  [
    ...Array.from({ length: 16 }, () => EMPTY_ROW),
    '.....g........g.....',
    '.....g........g.....',
    EMPTY_ROW,
    EMPTY_ROW,
  ],
  [
    ...Array.from({ length: 16 }, () => EMPTY_ROW),
    '.....g...gg...g.....',
    '.....g...gg...g.....',
    EMPTY_ROW,
    EMPTY_ROW,
  ],
];

/** Base sprite for a tower at a given tier (0 = unupgraded, 1, 2). Escalation overlays compose beneath the shared gem/sigil badges. */
export function towerSpriteGrid(towerId: string, tier: number): SpriteGrid {
  const base = TOWER_GRIDS[towerId];
  if (base === undefined) throw new Error(`no sprite grid for tower '${towerId}'`);
  if (tier <= 0) return base;
  const esc = TIER_ESCALATIONS[towerId];
  if (esc === undefined) throw new Error(`no tier escalation for tower '${towerId}'`);
  let grid = composeGrid(base, esc[0]);
  if (tier >= 2) grid = composeGrid(grid, esc[1]);
  return composeGrid(grid, TIER_OVERLAYS[Math.min(tier, 2) - 1]);
}

/** Particle textures: white, tinted per element at emit time. */
export const FX_PALETTE: SpritePalette = { w: '#ffffff' };

export const FX_DOT: SpriteGrid = [
  '.www.',
  'wwwww',
  'wwwww',
  'wwwww',
  '.www.',
];

export const FX_SPARK: SpriteGrid = [
  '.w.',
  'www',
  '.w.',
];

/** Composed sprite for a specialized tower: tier-2 base + the spec's accessory overlay. */
export function specSpriteGrid(towerId: string, specId: string): SpriteGrid {
  const variant = SPEC_VARIANTS[specId];
  if (variant === undefined) throw new Error(`no spec variant for '${specId}'`);
  const overlay = variant.accent !== undefined ? accentRemap(variant.overlay) : variant.overlay;
  return composeGrid(towerSpriteGrid(towerId, 2), overlay);
}
