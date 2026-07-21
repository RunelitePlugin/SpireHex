import Phaser from 'phaser';
import { BIOMES } from '../art/biomes';
import { hashString, mulberry32 } from '../art/rand';
import { OUTLINE } from '../art/sprites';
import { offsetToAxial } from '../content/levelUtils';
import { axialToWorld, hexCorners } from '../sim/hex';
import { ensureArtBaked, towerTexKey } from './artBake';
import { paintMotes, paintSkyAndRidges, TITLE_BACKDROP_LAYOUT } from './backdrop';
import { music } from './music';
import { UI, uiButton } from './ui';

/**
 * Title screen (spec §7): procedural ember-hex vista in the game's own
 * terrain language, wordmark, menu. Registered FIRST in main.ts — Phaser
 * auto-starts only scenes[0]. Gesture-unlock friendly by construction: the
 * global capture listeners in main.ts prime audio on the first click here.
 */
export class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create(): void {
    ensureArtBaked(this);
    music.play('title');
    music.setIntensity(1);
    const { width, height } = this.scale;
    const biome = BIOMES.ember;
    const rng = mulberry32(hashString('spirehex:title'));

    // Backdrop: same band/ridge/mote painter as the battle backdrop (src/game/backdrop.ts),
    // sharing one rng stream with the vista below so the draw order (and every random
    // value) is unchanged from the pre-extraction TitleScene.
    paintSkyAndRidges(this, biome, rng, TITLE_BACKDROP_LAYOUT);

    // Hex vista: three rows of ember terrain along the bottom, middle row a path.
    const vista = this.add.container(0, 0);
    const hexes = [];
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 16; col++) hexes.push(offsetToAxial(col, row));
    }
    const g = this.add.graphics();
    for (const hex of hexes) {
      const isPath = hex.r === 1;
      const corners = hexCorners(axialToWorld(hex));
      const tone = biome.groundTones[Math.floor(rng() * biome.groundTones.length)];
      // Path row one tint step brighter than battle (pathSpeckle, not pathFill) so the
      // road reads at title-screen scale (P9 carry, Task 17 step 3).
      g.fillStyle(isPath ? biome.pathSpeckle : tone, 1);
      g.lineStyle(1, biome.gridLine, 0.9);
      g.beginPath();
      g.moveTo(corners[0].x, corners[0].y);
      for (let i = 1; i < 6; i++) g.lineTo(corners[i].x, corners[i].y);
      g.closePath();
      g.fillPath();
      g.strokePath();
    }
    vista.add(g);
    // Landmark spires on the back row (baked textures; art doc anchor 0.5/0.85).
    // P15 polish (P10-carried): columns 3/10/13, not 3/8/13 — the center spire
    // sat directly under the menu button column and peeked between the buttons.
    ['emberSpire', 'sunShrine', 'umbraMonolith'].forEach((towerId, i) => {
      const p = axialToWorld(offsetToAxial([3, 10, 13][i], 0));
      const img = this.add.image(p.x, p.y, towerTexKey(towerId, 2)).setOrigin(0.5, 0.85);
      vista.add(img);
      this.tweens.add({
        targets: img, y: p.y - 3, duration: 2600 + i * 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
    });
    let minX = Infinity;
    let maxX = -Infinity;
    for (const hex of hexes) {
      const p = axialToWorld(hex);
      minX = Math.min(minX, p.x);
      maxX = Math.max(maxX, p.x);
    }
    vista.x = (width - (maxX - minX)) / 2 - minX;
    vista.y = height - 200;

    // Rising ember motes over the whole frame — drawn last (on top of the vista),
    // continuing the same rng stream the sky/ridge pass started.
    paintMotes(this, biome, rng, TITLE_BACKDROP_LAYOUT);

    // Wordmark (art doc §Title): fire accent + baked-outline stroke at UI scale.
    const title = this.add
      .text(width / 2, 180, 'SpireHex', { fontSize: '96px', fontStyle: 'bold', color: '#e07b39' })
      .setOrigin(0.5);
    title.setStroke(OUTLINE, 10);
    title.setLetterSpacing(4);
    this.add
      .text(width / 2, 252, 'Hold the road. Raise the spires.', { fontSize: '18px', color: UI.dim })
      .setOrigin(0.5);

    uiButton(this, width / 2, 400, '▶  Campaign', UI.btnGood, 26)
      .setOrigin(0.5)
      .on('pointerdown', () => this.scene.start('LevelSelect'));
    // Free Play entry: endless runs start from the ∞ button on each beaten level card.
    uiButton(this, width / 2, 464, '∞  Free Play', UI.btn, 22)
      .setOrigin(0.5)
      .on('pointerdown', () => this.scene.start('LevelSelect'));
    uiButton(this, width / 2, 528, '✦  Skill Tree', UI.btnSpec, 22)
      .setOrigin(0.5)
      .on('pointerdown', () => this.scene.start('SkillTree'));
  }
}
