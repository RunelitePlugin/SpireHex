import Phaser from 'phaser';
import type { BiomePalette } from '../art/biomes';
import { hashString, mulberry32 } from '../art/rand';

/**
 * Shared parallax backdrop painter (spec §7), extracted P11-carry from P9:
 * BattleScene.drawBackground and the TitleScene vista independently painted
 * the identical sky-band/ridge/mote language. P12-14 biomes get new
 * backdrops by adding BiomePalette entries, not new painters.
 *
 * Layout knobs (ridge height, mote density/altitude) are the only axis the
 * two call sites ever diverged on — BattleScene and the title vista each get
 * a named `BackdropLayout` constant below so both keep their exact original
 * numbers through the extraction.
 */
export interface BackdropLayout {
  /** Ridge silhouette base height, as a fraction of screen height: base + layer*step. */
  readonly ridgeBaseYBase: number;
  readonly ridgeBaseYStep: number;
  readonly moteCount: number;
  /** Mote vertical spawn range, as a fraction of screen height: base + rng()*span. */
  readonly moteYBase: number;
  readonly moteYSpan: number;
}

/** BattleScene's original constants (spec §7 as authored in P9). */
export const BATTLE_BACKDROP_LAYOUT: BackdropLayout = {
  ridgeBaseYBase: 0.34,
  ridgeBaseYStep: 0.14,
  moteCount: 14,
  moteYBase: 0.35,
  moteYSpan: 0.6,
};

/** The title vista's original constants (denser, higher mote field). */
export const TITLE_BACKDROP_LAYOUT: BackdropLayout = {
  ridgeBaseYBase: 0.4,
  ridgeBaseYStep: 0.12,
  moteCount: 18,
  moteYBase: 0.3,
  moteYSpan: 0.65,
};

type Rng = () => number;

/** Paint sky bands + two parallax-drifting ridge silhouettes into `scene`.
 * Screen-space, seeded via `rng`. Returns the ridge layers (far first) so a
 * caller could retarget the parallax tween or overlay content between the
 * ridges and the mote pass (the title vista's hex terrain sits here). */
export function paintSkyAndRidges(
  scene: Phaser.Scene,
  palette: BiomePalette,
  rng: Rng,
  layout: BackdropLayout = BATTLE_BACKDROP_LAYOUT,
  into?: Phaser.GameObjects.Container,
): { far: Phaser.GameObjects.Graphics; near: Phaser.GameObjects.Graphics } {
  const { width, height } = scene.scale;
  const sky = scene.add.graphics();
  into?.add(sky);
  const bandH = Math.ceil(height / palette.background.skyBands.length);
  palette.background.skyBands.forEach((color, i) => {
    sky.fillStyle(color, 1);
    sky.fillRect(0, i * bandH, width, bandH + 1);
  });
  const layers: Phaser.GameObjects.Graphics[] = [];
  palette.background.ridges.forEach((color, layer) => {
    const ridge = scene.add.graphics();
    ridge.fillStyle(color, 1);
    const baseY = height * (layout.ridgeBaseYBase + layer * layout.ridgeBaseYStep);
    const pts: { x: number; y: number }[] = [{ x: -80, y: height }];
    let x = -80;
    while (x < width + 80) {
      const w = 70 + rng() * 110;
      const peak = baseY - rng() * 80;
      pts.push({ x: x + w * 0.35, y: peak });
      pts.push({ x: x + w * 0.65, y: peak + 6 }); // flat-shouldered mesas, not alps (art doc)
      x += w;
      pts.push({ x, y: baseY });
    }
    pts.push({ x: width + 80, y: height });
    ridge.fillPoints(pts, true);
    into?.add(ridge);
    // Parallax read: the near layer drifts farther and faster than the far one.
    scene.tweens.add({
      targets: ridge,
      x: { from: -6 * (layer + 1), to: 6 * (layer + 1) },
      duration: 30000 - layer * 10000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    layers.push(ridge);
  });
  const [far, near] = layers;
  return { far, near };
}

/** Paint rising motes (embers/snow/spores per biome) over the whole frame,
 * seeded via `rng`. Screen-space; drawn on top of anything already added to
 * `scene` (call after any mid-backdrop content, e.g. the title vista). */
export function paintMotes(
  scene: Phaser.Scene,
  palette: BiomePalette,
  rng: Rng,
  layout: BackdropLayout = BATTLE_BACKDROP_LAYOUT,
  into?: Phaser.GameObjects.Container,
): void {
  const { width, height } = scene.scale;
  for (let i = 0; i < layout.moteCount; i++) {
    const mote = scene.add.circle(
      rng() * width, height * (layout.moteYBase + rng() * layout.moteYSpan),
      1 + rng() * 1.5, palette.background.mote, 0.25 + rng() * 0.3,
    );
    into?.add(mote);
    scene.tweens.add({
      targets: mote,
      y: mote.y - 70 - rng() * 90,
      alpha: 0,
      duration: 8000 + rng() * 6000,
      delay: rng() * 5000,
      repeat: -1,
    });
  }
}

/** Paint the full biome parallax backdrop (sky bands, far/near ridges, rising
 * motes) into `scene` in one call — the common case (BattleScene, which has
 * nothing to sandwich between the ridges and the motes). Scenes that need to
 * paint content between the ridge and mote passes (the title vista's hex
 * terrain) should call `paintSkyAndRidges` and `paintMotes` directly with a
 * shared rng so the draw order and random stream stay exactly as authored. */
export function paintBackdrop(
  scene: Phaser.Scene,
  palette: BiomePalette,
  seedKey: string,
  layout: BackdropLayout = BATTLE_BACKDROP_LAYOUT,
  into?: Phaser.GameObjects.Container,
): { far: Phaser.GameObjects.Graphics; near: Phaser.GameObjects.Graphics } {
  const rng = mulberry32(hashString(seedKey));
  const layers = paintSkyAndRidges(scene, palette, rng, layout, into);
  paintMotes(scene, palette, rng, layout, into);
  return layers;
}
