import Phaser from 'phaser';
import { ENEMY_GRIDS } from '../art/enemySprites';
import { ELEMENT_ACCENTS } from '../art/sprites';
import { CONTENT } from '../content';
import { ensureArtBaked, enemyTexKey, FX_DOT_KEY, FX_SPARK_KEY, specTexKey, towerTexKey } from './artBake';
import { cssColor, UI } from './ui';

/**
 * DEV-ONLY sprite gallery (open /#gallery on the dev server): every baked
 * tower tier, specialization variant, enemy, and fx texture side by side for
 * art review against docs/art-direction.md. Not registered in prod builds.
 */
export class GalleryScene extends Phaser.Scene {
  constructor() {
    super('Gallery');
  }

  create(): void {
    ensureArtBaked(this);
    this.cameras.main.setBackgroundColor(0x0e1216);
    this.add.text(16, 12, 'SpireHex sprite gallery (dev)', { fontSize: '20px', color: UI.text });
    this.add.text(16, 38, 'towers: base / T1 / T2 / four specializations', { fontSize: '12px', color: UI.dim });

    const towers = Object.values(CONTENT.towers);
    towers.forEach((def, i) => {
      const y = 100 + i * 96;
      this.add.text(16, y - 8, def.name, { fontSize: '14px', color: cssColor(ELEMENT_ACCENTS[def.element]) });
      for (let tier = 0; tier <= 2; tier++) {
        this.add.image(200 + tier * 72, y, towerTexKey(def.id, tier));
        this.add.text(200 + tier * 72, y + 34, `T${tier}`, { fontSize: '10px', color: UI.dim }).setOrigin(0.5, 0);
      }
      def.specializations.forEach((spec, k) => {
        const x = 470 + k * 120;
        this.add.image(x, y, specTexKey(spec.id));
        this.add.text(x, y + 34, spec.name, { fontSize: '10px', color: UI.dim }).setOrigin(0.5, 0);
      });
    });

    const ey = 100 + towers.length * 96;
    this.add.text(16, ey - 8, 'Enemies / FX', { fontSize: '14px', color: UI.accent });
    Object.keys(ENEMY_GRIDS).forEach((id, i) => {
      const x = 200 + (i % 10) * 90;
      const y = ey + Math.floor(i / 10) * 64;
      this.add.image(x, y, enemyTexKey(id));
      this.add.text(x, y + 24, CONTENT.enemies[id].name, { fontSize: '10px', color: UI.dim }).setOrigin(0.5, 0);
    });
    this.add.image(1150, ey + 64, FX_DOT_KEY);
    this.add.image(1190, ey + 64, FX_SPARK_KEY);
  }
}
