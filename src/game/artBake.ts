import Phaser from 'phaser';
import { CONTENT } from '../content';
import {
  FX_DOT,
  FX_PALETTE,
  FX_SPARK,
  paletteFor,
  specSpriteGrid,
  towerSpriteGrid,
  type SpriteGrid,
  type SpritePalette,
} from '../art/sprites';
import { SPEC_VARIANTS } from '../art/specSprites';
import { ascensionSpriteGrid, ascTexKey } from '../art/ascensionSprites';
import { ENEMY_GRIDS } from '../art/enemySprites';
import { BOSS_GRIDS, BOSS_SPRITE_SCALE } from '../art/bossSprites';

/** Nearest-neighbor upscale factor: 20×20 grids become 60px sprites. */
export const SPRITE_SCALE = 3;

export const towerTexKey = (towerId: string, tier: number): string => `tw-${towerId}-${tier}`;
export const specTexKey = (specId: string): string => `spec-${specId}`;
export const enemyTexKey = (enemyId: string): string => `en-${enemyId}`;
export const bossTexKey = (enemyId: string): string => `boss-${enemyId}`;
export const FX_DOT_KEY = 'fx-dot';
export const FX_SPARK_KEY = 'fx-spark';

/**
 * Render one string grid into a canvas texture, scale×scale filled rects per
 * pixel (explicit nearest-neighbor — no smoothing anywhere). Idempotent: an
 * existing key is left untouched. Defaults to SPRITE_SCALE (towers/enemies);
 * bosses bake at BOSS_SPRITE_SCALE (src/art/bossSprites.ts).
 */
export function bakeGridTexture(
  textures: Phaser.Textures.TextureManager,
  key: string,
  grid: SpriteGrid,
  palette: SpritePalette,
  scale = SPRITE_SCALE,
): void {
  if (textures.exists(key)) return;
  const canvas = textures.createCanvas(key, grid[0].length * scale, grid.length * scale);
  if (canvas === null) return; // defensive: createCanvas only fails on key collision
  const ctx = canvas.context;
  grid.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const char = row[x];
      if (char === '.') continue;
      const color = palette[char];
      if (color === undefined) throw new Error(`bake ${key}: no palette entry for '${char}'`);
      ctx.fillStyle = color;
      ctx.fillRect(x * scale, y * scale, scale, scale);
    }
  });
  canvas.refresh();
  canvas.setFilter(Phaser.Textures.FilterMode.NEAREST); // stay crisp under any scaling
}

/**
 * Bake every sprite texture once per Phaser.Game. Idempotent — call it at the
 * top of any scene create() that renders sprites. Extended by Tasks 6–7 with
 * specialization and enemy textures.
 */
export function ensureArtBaked(scene: Phaser.Scene): void {
  const t = scene.textures;
  for (const def of Object.values(CONTENT.towers)) {
    for (let tier = 0; tier <= 2; tier++) {
      bakeGridTexture(t, towerTexKey(def.id, tier), towerSpriteGrid(def.id, tier), paletteFor(def.element));
    }
    for (const spec of def.specializations) {
      const accent = SPEC_VARIANTS[spec.id]?.accent;
      bakeGridTexture(t, specTexKey(spec.id), specSpriteGrid(def.id, spec.id), paletteFor(def.element, accent));
      bakeGridTexture(t, ascTexKey(spec.id), ascensionSpriteGrid(def.id, spec.id), paletteFor(def.element, accent));
    }
  }
  for (const [id, grid] of Object.entries(ENEMY_GRIDS)) {
    bakeGridTexture(t, enemyTexKey(id), grid, paletteFor(CONTENT.enemies[id].element));
  }
  for (const [id, grid] of Object.entries(BOSS_GRIDS)) {
    bakeGridTexture(t, bossTexKey(id), grid, paletteFor(CONTENT.enemies[id].element), BOSS_SPRITE_SCALE);
  }
  bakeGridTexture(t, FX_DOT_KEY, FX_DOT, FX_PALETTE);
  bakeGridTexture(t, FX_SPARK_KEY, FX_SPARK, FX_PALETTE);
}
