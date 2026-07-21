import Phaser from 'phaser';
import { CONTENT } from '../content';
import { BIOME_BOSS } from '../content/biomeRoster';
import { ELEMENT_ACCENTS } from '../art/sprites';
import { audio, toggleMute } from './audio';
import { biomePages, defaultBiomePage, unlockedLevelCount } from './campaign';
import { accountLevelForXp, availableMasteryPoints, availableSkillPoints, rainbowUnlocked, totalXpForLevel } from './meta';
import { music, toggleMusic } from './music';
import { loadSave } from './save';
import { RAINBOW_LEVEL } from '../content/levels/rainbow';
import { cssColor, UI, uiButton, uiPanel } from './ui';

/** Campaign menu (entry scene): account strip on top, two columns of five level cards below. */
export class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super('LevelSelect');
  }

  create(data: { page?: number } = {}): void {
    const { width } = this.scale;
    music.play('title');
    music.setIntensity(1);
    const save = loadSave();
    this.cameras.main.setBackgroundColor(0x0e1216);
    this.add.text(width / 2, 38, 'SpireHex — Campaign', { fontSize: '36px', color: UI.text }).setOrigin(0.5);

    // Account strip: level, XP bar toward the next level, spendable points.
    uiPanel(this, width / 2 - 270, 60, 540, 64);
    const accountLevel = accountLevelForXp(save.xp);
    const into = save.xp - totalXpForLevel(accountLevel);
    const span = totalXpForLevel(accountLevel + 1) - totalXpForLevel(accountLevel);
    this.add
      .text(width / 2, 74, `Account Level ${accountLevel}  —  ${into} / ${span} XP`, {
        fontSize: '15px',
        color: UI.accent,
      })
      .setOrigin(0.5);
    this.add.rectangle(width / 2, 92, 320, 10, 0x0b0f14).setOrigin(0.5).setStrokeStyle(1, UI.panelStroke, 1);
    if (into > 0) {
      this.add
        .rectangle(width / 2 - 159, 92, Math.max(2, Math.round(318 * (into / span))), 8, 0x9fc2e8)
        .setOrigin(0, 0.5);
    }
    this.add
      .text(width / 2, 110, `Skill Points: ${availableSkillPoints(save)}    Mastery Points: ${availableMasteryPoints(save)}`, {
        fontSize: '13px',
        color: UI.gold,
      })
      .setOrigin(0.5);

    uiButton(this, width - 16, 16, '✦ Skill Tree', UI.btnSpec, 18)
      .setOrigin(1, 0)
      .on('pointerdown', () => this.scene.start('SkillTree'));

    const sfxBtn = uiButton(this, width - 16, 56, audio.muted ? '🔇 SFX off' : '🔊 SFX on', UI.btn, 14)
      .setOrigin(1, 0)
      .on('pointerdown', () => sfxBtn.setText(toggleMute() ? '🔇 SFX off' : '🔊 SFX on'));
    const musicBtn = uiButton(this, width - 16, 88, music.muted ? '♪ Music off' : '♪ Music on', UI.btn, 14)
      .setOrigin(1, 0)
      .on('pointerdown', () => musicBtn.setText(toggleMusic() ? '♪ Music off' : '♪ Music on'));
    // iOS caveat (spec §8 carried ticket): hardware silent switch mutes web audio.
    this.add
      .text(width - 16, 122, 'iPhone silent? Flip the ring switch for sound.', { fontSize: '11px', color: UI.faint })
      .setOrigin(1, 0);

    // Biome pager (P12): one page per biome, built for six. ‹/› restart the scene.
    const unlocked = unlockedLevelCount();
    const pages = biomePages();
    const pageIndex = Math.min(Math.max(data.page ?? defaultBiomePage(unlocked), 0), pages.length - 1);
    const page = pages[pageIndex];
    const accent = ELEMENT_ACCENTS[CONTENT.enemies[BIOME_BOSS[page.biome]].element];
    this.add
      .text(width / 2, 132, `${page.title}  (${pageIndex + 1}/${pages.length})`, { fontSize: '18px', color: cssColor(accent) })
      .setOrigin(0.5);
    if (pageIndex > 0) {
      uiButton(this, width / 2 - 250, 132, '‹', UI.btn, 18)
        .setOrigin(0.5)
        .on('pointerdown', () => {
          audio.play('click');
          this.scene.restart({ page: pageIndex - 1 });
        });
    }
    if (pageIndex < pages.length - 1) {
      uiButton(this, width / 2 + 250, 132, '›', UI.btn, 18)
        .setOrigin(0.5)
        .on('pointerdown', () => {
          audio.play('click');
          this.scene.restart({ page: pageIndex + 1 });
        });
    }

    // Ten level cards per page, two columns of five — height 98/pitch 106 since P12 pager.
    page.levels.forEach(({ level, index }, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = width / 2 + (col === 0 ? -320 : 20);
      const y = 156 + row * 106;
      const isUnlocked = index < unlocked;
      const bg = this.add
        .rectangle(x, y, 300, 98, isUnlocked ? UI.card : UI.cardLocked, 1)
        .setOrigin(0, 0)
        .setStrokeStyle(1, isUnlocked ? UI.panelStroke : 0x1c232c, 1);
      this.add.text(x + 14, y + 10, `${String(index + 1).padStart(2, '0')}  ${level.name}`, {
        fontSize: '17px',
        color: isUnlocked ? UI.text : UI.faint,
      });
      this.add.text(x + 14, y + 38, level.blurb, {
        fontSize: '13px',
        color: isUnlocked ? UI.dim : UI.faint,
        wordWrap: { width: 272 },
      });
      if (level.hint !== undefined) {
        // Debut-level hint (spec §6): one small unobtrusive line, info accent.
        this.add.text(x + 14, y + 72, `Hint: ${level.hint}`, {
          fontSize: '10px',
          color: isUnlocked ? UI.accent : UI.faint,
          wordWrap: { width: 272 },
        });
      }
      if (isUnlocked) {
        bg.setInteractive({ useHandCursor: true })
          .on('pointerover', () => bg.setStrokeStyle(2, 0x9fc2e8, 1))
          .on('pointerout', () => bg.setStrokeStyle(1, UI.panelStroke, 1))
          .on('pointerdown', () => {
            audio.play('click');
            this.scene.start('Battle', { levelIndex: index });
          });
        // Endless unlock (spec §9): beaten = firstClears, NOT unlockedLevels —
        // recordWin caps at CAMPAIGN.length, which would hide the final level's clear.
        if (save.firstClears.includes(level.id)) {
          const best = save.endless[level.id]?.bestWave ?? 0;
          uiButton(this, x + 286, y + 10, best > 0 ? `∞ ${best}` : '∞ Endless', UI.btnSpec, 12)
            .setOrigin(1, 0)
            .on('pointerdown', () => this.scene.start('Battle', { levelIndex: index, endless: true }));
        }
      } else {
        this.add.text(x + 286, y + 10, '🔒', { fontSize: '16px', color: UI.faint }).setOrigin(1, 0);
        bg.setAlpha(0.6);
      }
    });

    // Rainbow Mode (spec §9, P15): the final unlock — every campaign level cleared.
    // Shown on every page (locked-dim until earned) so the goal is always visible.
    if (rainbowUnlocked(save)) {
      const best = save.endless[RAINBOW_LEVEL.id]?.bestWave ?? 0;
      uiButton(this, width / 2, 698, best > 0 ? `🌈 Rainbow Mode ∞  best ${best}` : '🌈 Rainbow Mode ∞', UI.btnSpec, 15)
        .setOrigin(0.5)
        .on('pointerdown', () => {
          audio.play('click');
          this.scene.start('Battle', { rainbow: true });
        });
    } else {
      this.add
        .text(width / 2, 698, '🌈 Rainbow Mode — clear all six biomes to unlock', { fontSize: '12px', color: UI.faint })
        .setOrigin(0.5);
    }
  }
}
