/**
 * Per-biome palettes (docs/art-direction.md §Biome palettes). Scenes read
 * terrain/background colors ONLY from here. P9 ships the system with Ember
 * Wastes; P12–14 add the other five biomes by extending BiomeId + BIOMES and
 * `src/content/biomeRoster.ts`. Pure data — headless, phaser-free (tripwired).
 */
import { BIOME_FOR_LEVEL_CONTENT, type BiomeId } from '../content/biomeRoster';
export type { BiomeId };

export interface BiomeBackground {
  /** Vertical sky bands, top → horizon. */
  readonly skyBands: readonly number[];
  /** Ridge silhouette fills, far first (parallax: near layer drifts faster). */
  readonly ridges: readonly [number, number];
  /** Drifting mote color (embers / snow / spores per biome). */
  readonly mote: number;
}

export interface BiomePalette {
  readonly id: BiomeId;
  readonly groundTones: readonly [number, number, number];
  readonly gridLine: number;
  /** Top-left hex edge light (art doc lighting rule). */
  readonly edgeLight: number;
  readonly pathFill: number;
  readonly pathSpeckle: number;
  readonly pathEmber: number;
  /** Carved rim wall face (inset into path hexes). */
  readonly cliffFace: number;
  /** Lit cap line on left/up-facing rim edges. */
  readonly cliffTop: number;
  readonly decoTuft: number;
  readonly decoStone: number;
  readonly decoStoneDark: number;
  readonly decoSpark: number;
  readonly background: BiomeBackground;
}

export const BIOMES: Record<BiomeId, BiomePalette> = {
  ember: {
    id: 'ember',
    groundTones: [0x241c15, 0x2a2118, 0x30261b],
    gridLine: 0x191310,
    edgeLight: 0x4a3a28,
    pathFill: 0x453827,
    pathSpeckle: 0x6b5a3d,
    pathEmber: 0xe07b39,
    cliffFace: 0x171310,
    cliffTop: 0x5c472e,
    decoTuft: 0x4a3a24,
    decoStone: 0x3d3a36,
    decoStoneDark: 0x2e2b28,
    decoSpark: 0xe07b39,
    background: {
      skyBands: [0x0b0e13, 0x0f0f13, 0x141013, 0x1a1310],
      ridges: [0x1a1411, 0x221a14],
      mote: 0xffc46b,
    },
  },
  frost: {
    id: 'frost',
    groundTones: [0x141c24, 0x18222b, 0x1c2833],
    gridLine: 0x0e141b,
    edgeLight: 0x2e4256,
    pathFill: 0x33475a,
    pathSpeckle: 0x53718a,
    pathEmber: 0x5fc7e8,
    cliffFace: 0x0c1218,
    cliffTop: 0x476076,
    decoTuft: 0x2c4050,
    decoStone: 0x3a4552,
    decoStoneDark: 0x2a323d,
    decoSpark: 0x5fc7e8,
    background: {
      skyBands: [0x0a0f16, 0x0d1420, 0x101a28, 0x142230],
      ridges: [0x121a24, 0x18242f],
      mote: 0xc8f0ff,
    },
  },
  verdant: {
    id: 'verdant',
    groundTones: [0x15211a, 0x19271e, 0x1d2d22],
    gridLine: 0x0f1712,
    edgeLight: 0x33503c,
    pathFill: 0x40402a,
    pathSpeckle: 0x6b6242,
    pathEmber: 0x63c464,
    cliffFace: 0x101812,
    cliffTop: 0x4a6a4a,
    decoTuft: 0x2f5232,
    decoStone: 0x39443c,
    decoStoneDark: 0x2a332c,
    decoSpark: 0x63c464,
    background: {
      skyBands: [0x0a1210, 0x0c1712, 0x0f1d15, 0x122417],
      ridges: [0x131d16, 0x192a1c],
      mote: 0xb4e89a,
    },
  },
  storm: {
    id: 'storm',
    groundTones: [0x1a1a26, 0x1f2030, 0x24263a],
    gridLine: 0x121320,
    edgeLight: 0x3a3e5e,
    pathFill: 0x3c3f56,
    pathSpeckle: 0x5d6284,
    pathEmber: 0xd8c95a,
    cliffFace: 0x101120,
    cliffTop: 0x565c80,
    decoTuft: 0x343a58,
    decoStone: 0x3f4254,
    decoStoneDark: 0x2e3040,
    decoSpark: 0xd8c95a,
    background: {
      skyBands: [0x0b0c16, 0x0f101f, 0x131527, 0x181a30],
      ridges: [0x14152a, 0x1b1d36],
      mote: 0xf3e58a,
    },
  },
  radiant: {
    id: 'radiant',
    groundTones: [0x262019, 0x2d261d, 0x342c21],
    gridLine: 0x1a1611,
    edgeLight: 0x5e4f30,
    pathFill: 0x51452c,
    pathSpeckle: 0x7d6c45,
    pathEmber: 0xf2d98c,
    cliffFace: 0x1c1710,
    cliffTop: 0x776137,
    decoTuft: 0x54481f,
    decoStone: 0x4a4438,
    decoStoneDark: 0x38332a,
    decoSpark: 0xf2d98c,
    background: {
      skyBands: [0x120f0c, 0x1a140d, 0x241a0f, 0x2f2212],
      ridges: [0x1f1810, 0x2a2015],
      mote: 0xffe9a8,
    },
  },
  umbral: {
    id: 'umbral',
    groundTones: [0x16121e, 0x1a1526, 0x1f192e],
    gridLine: 0x0e0b16,
    edgeLight: 0x35294e,
    pathFill: 0x322a44,
    pathSpeckle: 0x554a72,
    pathEmber: 0xb289e0,
    cliffFace: 0x0c0914,
    cliffTop: 0x4c3f68,
    decoTuft: 0x2a2140,
    decoStone: 0x342e46,
    decoStoneDark: 0x252036,
    decoSpark: 0xb289e0,
    background: {
      skyBands: [0x080611, 0x0c0917, 0x100c1f, 0x141028],
      ridges: [0x120e20, 0x18132b],
      mote: 0xcaa6f0,
    },
  },
};

/** Level → biome keying now lives content-side (P11); palettes remain art-side. */
export const BIOME_FOR_LEVEL: Record<string, BiomeId> = BIOME_FOR_LEVEL_CONTENT;

export function biomeForLevel(levelId: string): BiomePalette {
  // Endless variants ('<base>-endless', see endless.ts) inherit the base
  // level's biome — without this, every endless board painted ember ground.
  const baseId = levelId.endsWith('-endless') ? levelId.slice(0, -'-endless'.length) : levelId;
  return BIOMES[BIOME_FOR_LEVEL[baseId] ?? 'ember'];
}
