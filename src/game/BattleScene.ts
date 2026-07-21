import Phaser from 'phaser';
import { CAMPAIGN, CONTENT } from '../content';
import { MINOR_NODE_COSTS, MINOR_NODE_IDS } from '../content/economy';
import { DT, TOWER_RADIUS } from '../sim/constants';
import { axialToWorld, hexCorners, hexKey } from '../sim/hex';
import { Simulation, effectiveSpeed } from '../sim/simulation';
import type { MinorNodeId, SimEvent, TargetingMode, TowerState } from '../sim/types';
import { hashString, mulberry32 } from '../art/rand';
import { BIOMES, biomeForLevel, type BiomePalette } from '../art/biomes';
import { ensureArtBaked, specTexKey, towerTexKey, enemyTexKey, bossTexKey, FX_DOT_KEY, FX_SPARK_KEY } from './artBake';
import { ascTexKey } from '../art/ascensionSprites';
import { FxPool } from './fxPool';
import { edgeRimQuad, wallEdges } from './boardDecor';
import { BATTLE_BACKDROP_LAYOUT, paintBackdrop } from './backdrop';
import type { AttackElement, ElementId } from '../content/elements';
import { ELEMENT_ACCENTS } from '../art/sprites';
import { audio, toggleMute } from './audio';
import { recordWin, unlockedLevelCount } from './campaign';
import { ENDLESS_LOOKAHEAD, baseEnemyId, endlessContent, extendEndlessLevel, makeEndlessLevel, type EndlessLevel } from '../content/endless';
import { extendRainbowLevel, makeRainbowLevel, rainbowBiome, rainbowContent } from '../content/rainbow';
import { RAINBOW_LEVEL } from '../content/levels/rainbow';
import type { LevelDef } from '../content/types';
import { accountLevelForXp, applyAttempt, applyEndlessAttempt, buildModifiers, recordEndlessRunStart, unlockedTowers } from './meta';
import { music, toggleMusic } from './music';
import { loadSave, writeSave } from './save';
import { UI, cssColor, uiButton, uiPanel } from './ui';

const COLORS = {
  enemyHp: 0x3ddc68,
};

// P11: bosses (art-direction §Bosses) render above every other enemy on the board.
const BOSS_DEPTH = 10;
const BOSS_HP_BAR_WIDTH = 48; // on-sprite bar; regular enemies use 24
const ENEMY_HP_BAR_WIDTH = 24;

// ONE source for element accents (art doc): the sprite ramps' light tones.
const ELEMENT_COLORS = ELEMENT_ACCENTS;

const STATUS_COLORS = {
  burn: 0xff8c3a,
  poison: 0x7bd94a,
  slow: 0x9adfff,
  vulnerability: 0xd94ad9,
  shield: 0xffe9a8, // P13: boss shield window — radiant gold, brighter than the DoT tints
};

const NODE_LABELS: Record<MinorNodeId, string> = { damage: 'DMG', range: 'RNG', rate: 'ROF' };
const TARGETING_CYCLE: TargetingMode[] = ['first', 'last', 'strong', 'weak'];

export class BattleScene extends Phaser.Scene {
  private sim!: Simulation;
  private accumulator = 0;
  /** Sim-speed multiplier (1×/2×/3×). Render-side only — the sim never sees it. */
  private speed = 1;
  private speedBtns: Phaser.GameObjects.Text[] = [];
  private enemySprites = new Map<number, Phaser.GameObjects.Container>();
  /** Pooled tracer line pairs + one shared burst emitter per (texture, tint) — see fxPool.ts. */
  private tracerPool!: FxPool<{ glow: Phaser.GameObjects.Line; core: Phaser.GameObjects.Line }>;
  private burstEmitters = new Map<string, Phaser.GameObjects.Particles.ParticleEmitter>();
  private board!: Phaser.GameObjects.Container;
  private hudGold!: Phaser.GameObjects.Text;
  private hudLives!: Phaser.GameObjects.Text;
  private hudWave!: Phaser.GameObjects.Text;
  private hudCountdown!: Phaser.GameObjects.Text;
  private waveButton!: Phaser.GameObjects.Text;
  private undoBtn!: Phaser.GameObjects.Text;
  private overlayShown = false;
  private towerSprites = new Map<number, Phaser.GameObjects.Container>();
  private auraRings = new Map<number, Phaser.GameObjects.Arc>();
  private paletteCards = new Map<string, { card: Phaser.GameObjects.Container; bg: Phaser.GameObjects.Rectangle }>();
  private selectedTowerTypeId = 'watchSentry';
  private selectedTowerId: number | null = null;
  private panelBg!: Phaser.GameObjects.Rectangle;
  private panelText!: Phaser.GameObjects.Text;
  private panelUpgradeBtn!: Phaser.GameObjects.Text;
  private panelSpecBtns: Phaser.GameObjects.Text[] = [];
  private panelNodeBtns = new Map<MinorNodeId, Phaser.GameObjects.Text>();
  private panelTargetBtn!: Phaser.GameObjects.Text;
  private panelSellBtn!: Phaser.GameObjects.Text;
  private rangeRing!: Phaser.GameObjects.Arc;
  /** Pending-placement (ghost) state: a tower type while a ghost is on the board, else null. */
  private pendingType: string | null = null;
  private pendingPos = { x: 0, y: 0 };
  private ghost!: Phaser.GameObjects.Container; // [0] range ring, [1] footprint ring, [2] tower image
  private confirmBtn!: Phaser.GameObjects.Text;
  private cancelBtn!: Phaser.GameObjects.Text;
  private levelIndex = 0;
  /** True once any enemy leaked this attempt — feeds the no-leak mastery check. */
  private leaked = false;
  /** From the save's skill tree via buildModifiers — drives the spec-button lock UI. */
  private specsUnlocked = false;
  /** From the save's skill tree via buildModifiers — drives the ascend-button lock UI. */
  private ascensionsUnlocked = false;
  private panelAscendBtn!: Phaser.GameObjects.Text;
  /** Top-of-screen boss HP bar (distinct from the 48px on-sprite bar) — one boss at a time in P11 content. */
  private bossBar: { root: Phaser.GameObjects.Container; fill: Phaser.GameObjects.Rectangle; bossId: number } | null = null;
  /** Endless free-play mode (spec §9): generated scaling waves, defeat-only ending. */
  private endless = false;
  private endlessBase: LevelDef | null = null;
  private endlessLevel: EndlessLevel | null = null;
  private endlessBestAtStart = 0;
  /** Rainbow Mode (spec §9, P15): endless on RAINBOW_LEVEL with a per-wave biome cycle. */
  private rainbow = false;
  /** Screen-space backdrop objects (sky/ridges/motes) — rebuilt per Rainbow wave. */
  private backdrop!: Phaser.GameObjects.Container;
  /** Board terrain paint (ground/grit/walls/deco) — board child 0, rebuilt per Rainbow wave. */
  private terrain!: Phaser.GameObjects.Container;

  constructor() {
    super('Battle');
  }

  init(data: { levelIndex?: number; endless?: boolean; rainbow?: boolean }): void {
    this.levelIndex = data.levelIndex ?? 0;
    this.rainbow = data.rainbow === true;
    this.endless = data.endless === true || this.rainbow; // Rainbow IS an endless run
  }

  create(): void {
    ensureArtBaked(this);
    this.enemySprites.clear();
    this.accumulator = 0;
    this.overlayShown = false;
    this.towerSprites.clear();
    this.auraRings.clear();
    this.paletteCards.clear();
    this.panelSpecBtns = [];
    this.panelNodeBtns.clear();
    this.speedBtns = [];
    this.selectedTowerTypeId = 'watchSentry';
    this.selectedTowerId = null;
    this.leaked = false;
    this.bossBar = null; // scene restarts reuse the field; the old root belongs to the destroyed scene
    // Meta-progression flows in as plain data: the save's skill tree becomes SimModifiers.
    const save = loadSave();
    const mods = buildModifiers(save);
    this.specsUnlocked = mods.specializationsUnlocked === true;
    this.ascensionsUnlocked = mods.ascensionsUnlocked === true;
    const baseLevel = this.rainbow ? RAINBOW_LEVEL : CAMPAIGN[this.levelIndex];
    if (this.endless) {
      // Attempt counter persists BEFORE play: run N is reproducible forever from (levelId, N).
      const started = recordEndlessRunStart(save, baseLevel.id);
      writeSave(started.save);
      this.endlessBase = baseLevel;
      this.endlessBestAtStart = save.endless[baseLevel.id]?.bestWave ?? 0;
      this.endlessLevel = this.rainbow ? makeRainbowLevel(started.attempt) : makeEndlessLevel(baseLevel, started.attempt);
      // Sim seed stays 1 (campaign convention): per-run variety lives in the wave DATA.
      this.sim = new Simulation(this.endlessLevel, this.rainbow ? rainbowContent() : endlessContent(baseLevel), 1, mods);
    } else {
      this.endlessBase = null;
      this.endlessLevel = null;
      this.sim = new Simulation(baseLevel, CONTENT, 1, mods);
    }
    music.play(this.rainbow ? rainbowBiome(0) : biomeForLevel(CAMPAIGN[this.levelIndex].id).id);
    this.drawBackground(); // behind everything: the board container is created after
    this.board = this.add.container(0, 0);
    this.burstEmitters.clear();
    this.tracerPool = new FxPool(
      () => {
        const glow = this.add.line(0, 0, 0, 0, 0, 0, 0xffffff, 0.25).setOrigin(0, 0).setVisible(false);
        const core = this.add.line(0, 0, 0, 0, 0, 0, 0xffffff, 1).setOrigin(0, 0).setVisible(false);
        this.board.add([glow, core]);
        return { glow, core };
      },
      (t) => {
        t.glow.setVisible(false);
        t.core.setVisible(false);
      },
    );
    this.drawBoard();
    this.centerBoard();
    const onResize = () => this.centerBoard();
    this.scale.on('resize', onResize);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.scale.off('resize', onResize));

    // HUD block: chrome panel behind the resource readouts.
    uiPanel(this, 8, 6, 196, 118).setScrollFactor(0);
    this.hudGold = this.add.text(20, 14, '', { fontSize: '20px', color: UI.gold }).setScrollFactor(0);
    this.hudLives = this.add.text(20, 42, '', { fontSize: '20px', color: UI.good }).setScrollFactor(0);
    this.hudWave = this.add.text(20, 70, '', { fontSize: '20px', color: UI.accent }).setScrollFactor(0);
    this.hudCountdown = this.add.text(20, 98, '', { fontSize: '16px', color: UI.gold }).setScrollFactor(0);
    const level = this.rainbow ? RAINBOW_LEVEL : CAMPAIGN[this.levelIndex];
    this.add
      .text(this.scale.width / 2, 12, this.rainbow ? `∞ — ${RAINBOW_LEVEL.name} — Rainbow` : `${String(this.levelIndex + 1).padStart(2, '0')} — ${level.name}${this.endless ? ' — Endless' : ''}`, {
        fontSize: '18px',
        color: UI.dim,
        backgroundColor: cssColor(UI.panel),
        padding: { x: 14, y: 5 },
      })
      .setOrigin(0.5, 0);
    uiButton(this, this.scale.width - 16, 12, '◀ Levels', UI.btn, 16)
      .setOrigin(1, 0)
      .on('pointerdown', () => this.scene.start('LevelSelect'));
    this.waveButton = uiButton(this, this.scale.width - 16, this.scale.height - 16, '▶ Start Wave [Space]', UI.btnGood, 22)
      .setOrigin(1, 1)
      .on('pointerdown', () => this.startWave());
    this.input.keyboard?.on('keydown-SPACE', () => this.startWave());
    this.undoBtn = uiButton(this, this.scale.width - 16, this.scale.height - 64, '↩ Undo', UI.btn, 18)
      .setOrigin(1, 1)
      .on('pointerdown', () => this.sim.applyCommand({ type: 'undo' })); // sim rejects safely when stale

    const muteBtn = uiButton(this, this.scale.width - 16, 48, audio.muted ? '🔇' : '🔊', UI.btn, 16)
      .setOrigin(1, 0)
      .on('pointerdown', () => muteBtn.setText(toggleMute() ? '🔇' : '🔊'));
    const musicBtn = uiButton(this, this.scale.width - 60, 48, music.muted ? '♪✕' : '♪', UI.btn, 16)
      .setOrigin(1, 0)
      .on('pointerdown', () => musicBtn.setText(toggleMusic() ? '♪✕' : '♪'));

    // Speed controls: multiple fixed sim ticks per render frame (spec §2).
    // Same row as the mute toggles (y 48), left of them — y 84 would collide with
    // the tower info panel, whose chrome starts at y 90 (uiPanel call, line ~155).
    [1, 2, 3].forEach((s, i) => {
      const btn = uiButton(this, this.scale.width - 104 - (2 - i) * 56, 48, `${s}×`, UI.btn, 16)
        .setOrigin(1, 0)
        .on('pointerdown', () => this.setSpeed(s));
      this.speedBtns.push(btn);
    });
    this.setSpeed(1); // fields survive scene restarts — reset explicitly

    // Tower palette: one card per unlocked tower — sprite icon, name, cost, element-stroked.
    const CARD_W = 86;
    const CARD_H = 78;
    let px = 16;
    const available = new Set(unlockedTowers(save)); // locked towers simply don't appear
    for (const def of Object.values(CONTENT.towers)) {
      if (!available.has(def.id)) continue;
      const bg = this.add
        .rectangle(0, 0, CARD_W, CARD_H, UI.card, 0.95)
        .setStrokeStyle(2, ELEMENT_COLORS[def.element], 0.9)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          audio.play('click');
          this.selectedTowerTypeId = def.id;
          if (this.pendingType !== null) this.beginPlacement(this.pendingPos); // retexture the pending ghost in place
        });
      const icon = this.add.image(0, -12, towerTexKey(def.id, 0)).setScale(0.6);
      const name = this.add
        .text(0, 18, def.name.split(' ')[0], { fontSize: '11px', color: UI.text })
        .setOrigin(0.5);
      const cost = this.add.text(0, 30, `${def.cost}g`, { fontSize: '11px', color: UI.gold }).setOrigin(0.5);
      const card = this.add.container(px + CARD_W / 2, this.scale.height - 16 - CARD_H / 2, [bg, icon, name, cost]);
      this.paletteCards.set(def.id, { card, bg });
      px += CARD_W + 8;
    }

    this.rangeRing = this.add.circle(0, 0, 10, 0xffffff, 0.04).setStrokeStyle(2, 0xffffff, 0.55).setVisible(false);
    this.board.add(this.rangeRing);

    // Placement ghost (spec §2): range ring + footprint ring + translucent sprite.
    this.pendingType = null;
    const ghostRange = this.add.circle(0, 0, 10, 0xffffff, 0.04).setStrokeStyle(2, 0xffffff, 0.55);
    const ghostFoot = this.add.circle(0, 0, TOWER_RADIUS, 0xffffff, 0.08).setStrokeStyle(1, 0xffffff, 0.4);
    const ghostImg = this.add.image(0, 0, towerTexKey(this.selectedTowerTypeId, 0)).setOrigin(0.5, 0.85).setAlpha(0.65);
    this.ghost = this.add.container(0, 0, [ghostRange, ghostFoot, ghostImg]).setVisible(false);
    this.board.add(this.ghost);
    this.confirmBtn = uiButton(this, this.scale.width / 2 - 44, this.scale.height - 110, '✓ Place', UI.btnGood, 22)
      .setOrigin(1, 0.5)
      .on('pointerdown', () => this.confirmPlacement())
      .setVisible(false);
    this.cancelBtn = uiButton(this, this.scale.width / 2 + 44, this.scale.height - 110, '✗ Cancel', UI.btnDanger, 22)
      .setOrigin(0, 0.5)
      .on('pointerdown', () => this.cancelPlacement())
      .setVisible(false);
    this.input.keyboard?.on('keydown-ESC', () => this.cancelPlacement());
    this.input.mouse?.disableContextMenu(); // right-click is a cancel, not a browser menu

    // Tower info panel.
    const panelX = this.scale.width - 288;
    this.panelBg = uiPanel(this, this.scale.width - 296, 90, 280, 408).setVisible(false);
    this.panelText = this.add
      .text(panelX, 100, '', { fontSize: '15px', color: UI.text, wordWrap: { width: 256 } })
      .setVisible(false);
    this.panelTargetBtn = uiButton(this, panelX, 158, '', UI.btn, 15)
      .on('pointerdown', () => this.cycleTargeting())
      .setVisible(false);
    this.panelUpgradeBtn = uiButton(this, panelX, 192, '', UI.btnGood, 16)
      .on('pointerdown', () => {
        if (this.selectedTowerId !== null) {
          this.sim.applyCommand({ type: 'upgradeTower', towerId: this.selectedTowerId });
        }
      })
      .setVisible(false);
    // Tier-4 capstone (P11 Task 6): same slot as the upgrade button — the two
    // are mutually exclusive (upgrade shows below max tier; ascend shows once
    // a spec is chosen, until ascended).
    this.panelAscendBtn = uiButton(this, panelX, 192, '', UI.btnSpec, 16)
      .on('pointerdown', () => {
        if (this.selectedTowerId !== null) {
          this.sim.applyCommand({ type: 'ascendTower', towerId: this.selectedTowerId });
        }
      })
      .setVisible(false);
    for (let i = 0; i < 4; i++) {
      const btn = uiButton(this, panelX, 192 + i * 34, '', UI.btnSpec, 14)
        .on('pointerdown', () => this.chooseSpec(i))
        .setVisible(false);
      this.panelSpecBtns.push(btn);
    }
    MINOR_NODE_IDS.forEach((node, i) => {
      const btn = uiButton(this, panelX, 336 + i * 30, '', UI.btn, 14)
        .on('pointerdown', () => {
          if (this.selectedTowerId !== null) {
            this.sim.applyCommand({ type: 'buyMinorNode', towerId: this.selectedTowerId, node });
          }
        })
        .setVisible(false);
      this.panelNodeBtns.set(node, btn);
    });
    this.panelSellBtn = uiButton(this, panelX, 440, '', UI.btnDanger, 15)
      .on('pointerdown', () => this.sellSelected())
      .setVisible(false);

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer, over: unknown[]) => {
      if (over.length > 0) return; // clicked a UI element
      if (pointer.rightButtonDown()) {
        this.cancelPlacement();
        return;
      }
      const p = this.boardPoint(pointer.worldX, pointer.worldY);
      const clicked = this.pickTowerAt(p);
      if (clicked) {
        this.selectedTowerId = clicked.id;
        this.cancelPlacement();
        return;
      }
      this.selectedTowerId = null;
      this.beginPlacement(p); // no gold moves — the sim is only commanded on ✓
    });
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      // Drag to fine-tune: while the button/finger is down, the ghost follows.
      if (this.pendingType !== null && pointer.isDown && !pointer.rightButtonDown()) {
        this.movePlacement(this.boardPoint(pointer.worldX, pointer.worldY));
      }
    });
    this.updateHud();
    // Hints teach campaign debuts; endless re-uses beaten maps, so skip the banner there.
    if (!this.endless && level.hint !== undefined) this.showHintBanner(level.hint); // added last: renders above the HUD
  }

  /**
   * Debut-level hint banner (spec §6): quiet, top-center, fades after ~6s,
   * ANY tap dismisses, never blocks input (the panel is a plain rectangle —
   * not interactive — and the scene-level pointerdown listener does not
   * consume events; placement/selection handlers run regardless).
   */
  private showHintBanner(hint: string): void {
    const text = this.add
      .text(this.scale.width / 2, 56, hint, {
        fontSize: '15px', color: UI.accent, align: 'center', wordWrap: { width: 560 },
      })
      .setOrigin(0.5, 0);
    const b = text.getBounds();
    const panel = uiPanel(this, b.x - 14, b.y - 8, b.width + 28, b.height + 16, 0.85);
    text.setDepth(1); // above its own panel (which is created after the text to measure it)
    let dismissed = false;
    const dismiss = () => {
      if (dismissed) return;
      dismissed = true;
      this.input.off('pointerdown', dismiss);
      this.tweens.add({
        targets: [panel, text], alpha: 0, duration: 400,
        onComplete: () => { panel.destroy(); text.destroy(); },
      });
    };
    this.time.delayedCall(6000, dismiss);
    this.input.on('pointerdown', dismiss);
  }

  /**
   * Parallax backdrop (spec §7): sky bands, two flat ridge silhouettes
   * drifting at different speeds, rising motes. Screen-space (never added to
   * the board container), seeded per level, deliberately cheap: three
   * Graphics fills + 14 circles + a handful of infinite tweens.
   */
  private drawBackground(): void {
    // Rainbow starts on the cycle's first biome; recycleRainbowVisuals repaints per wave.
    const biome = this.rainbow ? BIOMES[rainbowBiome(0)] : biomeForLevel(CAMPAIGN[this.levelIndex].id);
    this.backdrop = this.add.container(0, 0);
    paintBackdrop(this, biome, `${this.rainbow ? 'rainbow' : CAMPAIGN[this.levelIndex].id}:bg`, BATTLE_BACKDROP_LAYOUT, this.backdrop);
  }

  /**
   * P15 Rainbow: wave `wave` opens — shift the world to its biome. Music first
   * (same-id play() is a no-op), then rebuild the backdrop and terrain paints
   * in place. Tweens are killed per child BEFORE destroy (motes/ridges run
   * infinite tweens — without the kill they would leak in the TweenManager);
   * the containers keep their display-list slots, so z-order (backdrop under
   * board, terrain under towers/enemies/tracers) is preserved by construction.
   */
  private recycleRainbowVisuals(wave: number): void {
    const biome = BIOMES[rainbowBiome(wave)];
    music.play(biome.id);
    for (const child of this.backdrop.list) this.tweens.killTweensOf(child);
    this.backdrop.removeAll(true);
    paintBackdrop(this, biome, `rainbow:${biome.id}:bg`, BATTLE_BACKDROP_LAYOUT, this.backdrop);
    this.terrain.removeAll(true);
    this.paintTerrain(biome);
  }

  private drawBoard(): void {
    this.terrain = this.add.container(0, 0);
    this.board.add(this.terrain); // board child 0: repaints stay under towers/enemies/tracers
    this.paintTerrain(this.rainbow ? BIOMES[rainbowBiome(0)] : biomeForLevel(this.sim.level.id));
  }

  private paintTerrain(biome: BiomePalette): void {
    const level = this.sim.level;
    const pathKeys = new Set(level.pathHexes.map(hexKey));
    // Render-only decoration randomness, seeded from the level id: every visit
    // to a level looks identical, and the sim never sees this stream.
    const rng = mulberry32(hashString(level.id));
    const g = this.add.graphics();
    for (const hex of level.hexes) {
      const isPath = pathKeys.has(hexKey(hex));
      const corners = hexCorners(axialToWorld(hex));
      const tone = biome.groundTones[Math.floor(rng() * biome.groundTones.length)]; // consumed even for path hexes: keeps the stream stable
      g.fillStyle(isPath ? biome.pathFill : tone, 1);
      g.lineStyle(1, biome.gridLine, 0.9);
      g.beginPath();
      g.moveTo(corners[0].x, corners[0].y);
      for (let i = 1; i < 6; i++) g.lineTo(corners[i].x, corners[i].y);
      g.closePath();
      g.fillPath();
      g.strokePath();
      if (!isPath) {
        // Top-left light: corners[3]→[4]→[5] are the lower-left, upper-left, and top corners.
        g.lineStyle(2, biome.edgeLight, 0.55);
        g.beginPath();
        g.moveTo(corners[3].x, corners[3].y);
        g.lineTo(corners[4].x, corners[4].y);
        g.lineTo(corners[5].x, corners[5].y);
        g.strokePath();
      }
    }
    // Path texture (replaces the painted road): trodden grit + rare ember flecks.
    const grit = this.add.graphics();
    for (const hex of level.pathHexes) {
      const c = axialToWorld(hex);
      for (let i = 0; i < 6; i++) {
        const dx = (rng() - 0.5) * 52;
        const dy = (rng() - 0.5) * 44;
        if (rng() < 0.18) {
          grit.fillStyle(biome.pathEmber, 0.9);
          grit.fillCircle(c.x + dx, c.y + dy, 1.5);
        } else {
          grit.fillStyle(biome.pathSpeckle, 0.6);
          grit.fillCircle(c.x + dx, c.y + dy, 2);
        }
      }
    }
    // Carved rim walls (spec §7): every path-hex edge not shared with another
    // path hex gets a cliff face inset INTO the path, capped by a lit line on
    // left/up-facing edges. VISUAL ONLY — derived from pathHexes at draw time;
    // placement validity and the enemy spline never read this.
    const walls = this.add.graphics();
    for (const { hex, edge } of wallEdges(level.pathHexes)) {
      const quad = edgeRimQuad(hex, edge, 9);
      walls.fillStyle(biome.cliffFace, 1);
      walls.fillPoints([...quad], true);
      walls.lineStyle(2, edge >= 3 ? biome.cliffTop : biome.cliffFace, 1);
      walls.lineBetween(quad[0].x, quad[0].y, quad[1].x, quad[1].y);
    }
    // Deterministic scenery scatter on open ground: dry tufts, stones, ember sparks.
    const deco = this.add.graphics();
    for (const hex of level.hexes) {
      if (pathKeys.has(hexKey(hex))) continue;
      const roll = rng();
      if (roll >= 0.3) continue;
      const c = axialToWorld(hex);
      const dx = (rng() - 0.5) * 28;
      const dy = (rng() - 0.5) * 24;
      if (roll < 0.12) {
        deco.lineStyle(1, biome.decoTuft, 0.9);
        deco.beginPath(); deco.moveTo(c.x + dx - 3, c.y + dy + 3); deco.lineTo(c.x + dx - 4, c.y + dy - 3); deco.strokePath();
        deco.beginPath(); deco.moveTo(c.x + dx, c.y + dy + 3); deco.lineTo(c.x + dx, c.y + dy - 5); deco.strokePath();
        deco.beginPath(); deco.moveTo(c.x + dx + 3, c.y + dy + 3); deco.lineTo(c.x + dx + 4, c.y + dy - 2); deco.strokePath();
      } else if (roll < 0.24) {
        deco.fillStyle(biome.decoStone, 1);
        deco.fillCircle(c.x + dx, c.y + dy, 3);
        deco.fillStyle(biome.decoStoneDark, 1);
        deco.fillCircle(c.x + dx + 5, c.y + dy + 3, 2);
      } else {
        deco.fillStyle(biome.decoSpark, 0.5);
        deco.fillCircle(c.x + dx, c.y + dy, 2);
      }
    }
    this.terrain.add([g, grit, walls, deco]);
  }

  private centerBoard(): void {
    const level = this.sim.level;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const hex of level.hexes) {
      const p = axialToWorld(hex);
      minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
    }
    this.board.x = (this.scale.width - (maxX - minX)) / 2 - minX;
    this.board.y = (this.scale.height - (maxY - minY)) / 2 - minY;
  }

  /** Convert a screen/pointer position to board-space world coordinates. */
  boardPoint(x: number, y: number): { x: number; y: number } {
    return { x: x - this.board.x, y: y - this.board.y };
  }

  /**
   * Shared per-(texture, tint) burst emitters — explode() reuses instead of
   * allocating per event. NOTE (P10 review carry, documented P15): the FIRST
   * caller per (texture, tint) key bakes its cfg into the shared emitter;
   * later calls with a different cfg reuse the original silently. Today each
   * call site keeps exactly one cfg per texture (death bursts on FX_DOT_KEY,
   * impact sparks on FX_SPARK_KEY) — keep it that way, or key by cfg too.
   */
  private burst(
    tex: string,
    color: number,
    cfg: { speed: [number, number]; lifespan: [number, number]; scaleStart: number },
    count: number,
    x: number,
    y: number,
  ): void {
    const key = `${tex}:${color}`;
    let em = this.burstEmitters.get(key);
    if (!em) {
      em = this.add.particles(0, 0, tex, {
        speed: { min: cfg.speed[0], max: cfg.speed[1] },
        lifespan: { min: cfg.lifespan[0], max: cfg.lifespan[1] },
        scale: { start: cfg.scaleStart, end: 0 },
        tint: color,
        emitting: false,
      });
      this.board.add(em);
      this.burstEmitters.set(key, em);
    }
    this.board.bringToTop(em); // reused objects must still render over later-added sprites
    em.explode(count, x, y);
  }

  /** The tower whose circular footprint contains the point — nearest wins on overlap-free maps. */
  private pickTowerAt(p: { x: number; y: number }): TowerState | undefined {
    let best: { tower: TowerState; dist: number } | undefined;
    for (const t of this.sim.towers) {
      const dist = Math.hypot(t.pos.x - p.x, t.pos.y - p.y);
      if (dist <= TOWER_RADIUS && (!best || dist < best.dist)) best = { tower: t, dist };
    }
    return best?.tower;
  }

  private setSpeed(s: number): void {
    this.speed = s;
    this.speedBtns.forEach((btn, i) => btn.setAlpha(i + 1 === s ? 1 : 0.45)); // active state
  }

  update(_time: number, delta: number): void {
    // speed× sim-seconds per real second; clamp keeps a backgrounded tab from bursting on return.
    this.accumulator += (Math.min(delta, 250) / 1000) * this.speed;
    while (this.accumulator >= DT) {
      this.accumulator -= DT;
      this.handleEvents(this.sim.tick());
    }
    this.renderEnemies();
    this.updateBossBar();
    this.updateHud();
  }

  /**
   * Top-of-screen boss HP bar (art-direction §Bosses) — distinct from the
   * 48px on-sprite bar (T13), which stays put over the boss itself. One boss
   * at a time in P11 content, so a single instance suffices.
   */
  private showBossBar(enemyId: number, name: string): void {
    if (this.bossBar) return;
    const w = 420;
    const back = this.add.rectangle(0, 0, w, 14, 0x1a1010, 0.9).setOrigin(0.5, 0).setStrokeStyle(1, 0x6b2f2f, 1);
    const fill = this.add.rectangle(-w / 2 + 1, 1, w - 2, 12, 0xe07b39, 1).setOrigin(0, 0);
    const label = this.add.text(0, -18, name, { fontSize: '15px', color: '#e8eef4' }).setOrigin(0.5, 0);
    const root = this.add.container(this.scale.width / 2, 46, [label, back, fill]).setScrollFactor(0).setDepth(50);
    this.bossBar = { root, fill, bossId: enemyId };
  }

  /** Tracks the live boss's hp fraction; tears the bar down once the boss dies or leaks. */
  private updateBossBar(): void {
    if (!this.bossBar) return;
    const enemy = this.sim.enemies.find((e) => e.id === this.bossBar!.bossId);
    if (!enemy || !enemy.alive) {
      this.bossBar.root.destroy();
      this.bossBar = null;
      return;
    }
    this.bossBar.fill.width = (420 - 2) * Math.max(0, enemy.hp / enemy.maxHp);
  }

  private startWave(): void {
    this.sim.applyCommand({ type: 'startWave' });
  }

  private cycleTargeting(): void {
    if (this.selectedTowerId === null) return;
    const tower = this.sim.towers.find((t) => t.id === this.selectedTowerId);
    if (!tower) return;
    const next = TARGETING_CYCLE[(TARGETING_CYCLE.indexOf(tower.targeting) + 1) % TARGETING_CYCLE.length];
    this.sim.applyCommand({ type: 'setTargeting', towerId: tower.id, mode: next });
  }

  private chooseSpec(index: number): void {
    if (!this.specsUnlocked) return; // skill-gated; the sim would reject anyway
    if (this.selectedTowerId === null) return;
    const tower = this.sim.towers.find((t) => t.id === this.selectedTowerId);
    if (!tower) return;
    const spec = CONTENT.towers[tower.typeId].specializations[index];
    this.sim.applyCommand({ type: 'chooseSpecialization', towerId: tower.id, specId: spec.id });
  }

  private sellSelected(): void {
    if (this.selectedTowerId === null) return;
    this.sim.applyCommand({ type: 'sellTower', towerId: this.selectedTowerId });
    this.selectedTowerId = null; // selling deselects
  }

  private beginPlacement(p: { x: number; y: number }): void {
    this.pendingType = this.selectedTowerTypeId;
    const def = CONTENT.towers[this.pendingType];
    (this.ghost.list[2] as Phaser.GameObjects.Image).setTexture(towerTexKey(def.id, 0));
    // Wards report range: 0 (they never shoot) — a zero ghost ring reads as a bug, so
    // fall back to the reveal radius, the stat that actually matters for placement.
    const ghostRadius = def.mechanic.kind === 'ward' ? def.mechanic.revealRadius : def.range;
    (this.ghost.list[0] as Phaser.GameObjects.Arc).setRadius(Math.max(ghostRadius, 1));
    this.movePlacement(p);
    this.ghost.setVisible(true);
    this.confirmBtn.setVisible(true);
    this.cancelBtn.setVisible(true);
  }

  private movePlacement(p: { x: number; y: number }): void {
    if (this.pendingType === null) return;
    this.pendingPos = { x: p.x, y: p.y };
    this.ghost.setPosition(p.x, p.y);
    this.refreshGhostValidity();
  }

  /** Green = the sim would accept a confirm right now (incl. gold); red = it would reject. */
  private refreshGhostValidity(): void {
    if (this.pendingType === null) return;
    const ok = this.sim.validatePlacement(this.pendingType, this.pendingPos).ok;
    const color = ok ? 0x3ddc68 : 0xe05555;
    (this.ghost.list[0] as Phaser.GameObjects.Arc).setStrokeStyle(2, color, 0.55).setFillStyle(color, 0.04);
    (this.ghost.list[1] as Phaser.GameObjects.Arc).setStrokeStyle(1, color, 0.6).setFillStyle(color, 0.08);
    (this.ghost.list[2] as Phaser.GameObjects.Image).setTint(ok ? 0xffffff : 0xff8888);
    this.confirmBtn.setAlpha(ok ? 1 : 0.4);
  }

  private confirmPlacement(): void {
    if (this.pendingType === null) return;
    const res = this.sim.applyCommand({
      type: 'placeTower', towerTypeId: this.pendingType, pos: { x: this.pendingPos.x, y: this.pendingPos.y },
    });
    if (res.ok) this.cancelPlacement(); // gold left just now, on confirm — never earlier
    // rejected: the ghost stays red so the player adjusts or cancels
  }

  private cancelPlacement(): void {
    this.pendingType = null;
    this.ghost.setVisible(false);
    this.confirmBtn.setVisible(false);
    this.cancelBtn.setVisible(false);
  }

  private updateHud(): void {
    // Music intensity: calm while building, +lead in combat, +hat under swarm pressure.
    const alive = this.sim.enemies.reduce((n, e) => n + (e.alive ? 1 : 0), 0);
    music.setIntensity(this.sim.status === 'combat' ? (alive >= 12 ? 2 : 1) : 0);
    this.hudGold.setText(`Gold: ${this.sim.gold}`);
    this.hudLives.setText(`Lives: ${this.sim.lives}`);
    if (this.endless) {
      this.hudWave.setText(`Wave: ${this.sim.waveIndex + 1} ∞  best ${this.endlessBestAtStart}`);
    } else {
      const total = this.sim.level.waves.length;
      this.hudWave.setText(`Wave: ${Math.min(this.sim.waveIndex + 1, total)} / ${total}`);
    }
    const gameOver = this.sim.status === 'won' || this.sim.status === 'lost';
    this.waveButton.setVisible(this.sim.status === 'building');
    this.undoBtn.setVisible(!gameOver);
    this.undoBtn.setAlpha(this.sim.canUndo ? 1 : 0.4); // disabled look between records
    if (this.sim.countdown !== null) {
      // Between waves: the button is an early call showing the live bonus...
      this.waveButton.setText(`⏩ Call Wave  +${this.sim.earlyCallBonus()}g  [Space]`);
      // ...and the countdown line shows the auto-start timer.
      this.hudCountdown.setText(`Next wave in ${Math.ceil(this.sim.countdown)}s`).setVisible(true);
    } else {
      this.waveButton.setText('▶ Start Wave [Space]');
      this.hudCountdown.setVisible(false);
    }
    this.refreshPalette();
    this.updatePanel();
    this.refreshGhostValidity();
  }

  private refreshPalette(): void {
    for (const [id, entry] of this.paletteCards) {
      const def = CONTENT.towers[id];
      const selected = id === this.selectedTowerTypeId;
      // Selected card pops with a white stroke; unaffordable cards dim.
      entry.bg.setStrokeStyle(selected ? 3 : 2, selected ? 0xffffff : ELEMENT_COLORS[def.element], 0.95);
      entry.card.setAlpha(this.sim.gold >= def.cost ? 1 : 0.4);
    }
  }

  private updatePanel(): void {
    const tower = this.selectedTowerId === null ? undefined : this.sim.towers.find((t) => t.id === this.selectedTowerId);
    const visible = tower !== undefined;
    // Commands reject once the level is over, so hide the buttons that would issue them rather than leave dead controls.
    const gameOver = this.sim.status === 'won' || this.sim.status === 'lost';
    this.panelBg.setVisible(visible);
    this.panelText.setVisible(visible);
    if (!tower) {
      this.panelTargetBtn.setVisible(false);
      this.panelSellBtn.setVisible(false);
      this.rangeRing.setVisible(false);
      this.panelUpgradeBtn.setVisible(false);
      this.panelAscendBtn.setVisible(false);
      for (const btn of this.panelSpecBtns) btn.setVisible(false);
      for (const btn of this.panelNodeBtns.values()) btn.setVisible(false);
      return;
    }
    const def = CONTENT.towers[tower.typeId];
    const stats = this.sim.statsFor(tower, def);
    const spec = tower.specId === null ? undefined : def.specializations.find((s) => s.id === tower.specId);
    const isAura = stats.mechanic.kind === 'aura';
    const isWard = stats.mechanic.kind === 'ward';

    // Carry-list fix: an aura tower never shoots — show its aura instead of Dmg 0.0/RoF,
    // and hide targeting + minor nodes (they would be a pure gold trap).
    const statLine =
      stats.mechanic.kind === 'aura'
        ? `Aura: ${stats.mechanic.radius} range, +${Math.round(stats.mechanic.fireRateBonus * 100)}% ally fire rate`
        : `Dmg ${stats.damage.toFixed(1)}  RoF ${stats.fireRate.toFixed(2)}/s`;
    this.panelText.setText(
      `${def.name}${spec ? ` — ${spec.name}` : ''}\n` +
        `Tier ${tower.tier}/${def.tiers.length}${spec ? ' ★' : ''}\n` +
        statLine,
    );
    this.panelTargetBtn.setVisible(!gameOver && !isAura);
    this.panelTargetBtn.setText(`Target: ${tower.targeting}`);
    this.panelSellBtn.setVisible(!gameOver);
    // The aura ring already shows coverage; a zero-radius range ring would just be a dot.
    this.rangeRing.setVisible(!gameOver && !isAura);

    // Below max tier: the tier upgrade button. At max tier, unspecialized: the four spec buttons.
    const next = tower.tier < def.tiers.length ? def.tiers[tower.tier] : undefined;
    this.panelUpgradeBtn.setVisible(next !== undefined && !gameOver);
    if (next) {
      this.panelUpgradeBtn.setText(`Upgrade (${next.cost}g)`);
      this.panelUpgradeBtn.setAlpha(this.sim.gold >= next.cost ? 1 : 0.4);
    }
    const showSpecs = next === undefined && spec === undefined && !gameOver;
    this.panelSpecBtns.forEach((btn, i) => {
      btn.setVisible(showSpecs);
      if (!showSpecs) return;
      const s = def.specializations[i];
      if (!this.specsUnlocked) {
        btn.setText(`${s.name} — locked (skill tree)`);
        btn.setAlpha(0.3);
        return;
      }
      btn.setText(`${s.name} (${s.cost}g)`);
      btn.setAlpha(this.sim.gold >= s.cost ? 1 : 0.4); // dimmed when unaffordable
    });

    // Tier-4 capstone (P11 Task 6): spec chosen, not yet ascended, and the save owns the ascensions node.
    const canAscend = spec !== undefined && !tower.ascended && this.ascensionsUnlocked && !gameOver;
    this.panelAscendBtn.setVisible(canAscend);
    if (canAscend) {
      const cost = spec!.ascension.cost;
      this.panelAscendBtn.setText(`Ascend (${cost}g)`);
      this.panelAscendBtn.setAlpha(this.sim.gold >= cost ? 1 : 0.4);
    }

    for (const [node, btn] of this.panelNodeBtns) {
      btn.setVisible(!gameOver && !isAura);
      const rank = tower.nodes[node];
      const cost = rank < MINOR_NODE_COSTS.length ? MINOR_NODE_COSTS[rank] : undefined;
      const pips = '●'.repeat(rank) + '○'.repeat(MINOR_NODE_COSTS.length - rank);
      btn.setText(`+${NODE_LABELS[node]} ${pips} ${cost !== undefined ? `${cost}g` : 'MAX'}`);
      btn.setAlpha(cost !== undefined && this.sim.gold >= cost ? 1 : 0.4);
    }

    this.panelSellBtn.setText(`Sell (+${Math.floor(this.sim.investedGold(tower) * this.sim.sellRefundRate())}g)`);
    this.rangeRing.setPosition(tower.pos.x, tower.pos.y);
    // Wards report range: 0 — show their actual reveal radius, in the info accent
    // (not the element accent) so it doesn't read as an attack range.
    const ringRadius = stats.mechanic.kind === 'ward' ? stats.mechanic.revealRadius : stats.range;
    const ringColor = isWard ? 0x9fc2e8 : ELEMENT_COLORS[def.element];
    this.rangeRing.setRadius(Math.max(ringRadius, 1));
    this.rangeRing.setFillStyle(ringColor, 0.04);
    this.rangeRing.setStrokeStyle(2, ringColor, 0.55);
  }

  private showOverlay(won: boolean): void {
    if (this.overlayShown) return;
    this.overlayShown = true;
    if (this.endless) {
      this.showEndlessOverlay(won);
      return;
    }
    if (won) recordWin(this.levelIndex); // unlock the next level the moment victory lands

    // Fold the attempt into the save: XP every attempt, first-clear/mastery on wins.
    const level = CAMPAIGN[this.levelIndex];
    const { save, summary } = applyAttempt(loadSave(), level.id, {
      won,
      goldEarned: this.sim.goldEarned,
      livesRemaining: this.sim.lives,
      leaked: this.leaked,
    });
    save.unlockedLevels = unlockedLevelCount(); // mirror the in-memory unlock state
    writeSave(save);

    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x0a0d11, 0.7);
    uiPanel(this, width / 2 - 260, height / 2 - 150, 520, 300, 0.96);
    this.add
      .text(width / 2, height / 2 - 110, won ? 'Victory!' : 'Defeat', {
        fontSize: '56px',
        color: won ? UI.good : UI.bad,
      })
      .setOrigin(0.5);

    const lines = [`+${summary.xpEarned} XP${summary.firstClear ? ' — first clear bonus!' : ''}`];
    if (summary.levelsGained > 0) {
      lines.push(
        `Account level ${accountLevelForXp(save.xp)}!  ` +
          `+${summary.levelsGained} skill point${summary.levelsGained === 1 ? '' : 's'}`,
      );
    }
    for (const award of summary.masteryEarned) {
      lines.push(award === 'noLeak' ? '+1 Mastery: No leaks!' : '+1 Mastery: 18+ lives!');
    }
    // P11 Task 8: a biome finale win unlocks that biome's element tower — flag it here,
    // and next visit to create() re-reads unlockedTowers(save), so the palette rebuilds itself.
    if (summary.towerUnlocked !== undefined) {
      lines.push(`NEW TOWER UNLOCKED: ${CONTENT.towers[summary.towerUnlocked].name}`);
    }
    this.add
      .text(width / 2, height / 2 - 50, lines.join('\n'), { fontSize: '19px', color: UI.gold, align: 'center' })
      .setOrigin(0.5, 0);
    if (summary.towerUnlocked !== undefined) {
      this.add.image(width / 2, height / 2 + 58, towerTexKey(summary.towerUnlocked, 0)).setScale(0.7);
    }

    const button = (x: number, label: string, onClick: () => void) =>
      uiButton(this, x, height / 2 + 90, label, UI.btn, 24).setOrigin(0.5).on('pointerdown', onClick);
    const hasNext = won && this.levelIndex + 1 < CAMPAIGN.length;
    if (hasNext) {
      button(width / 2 - 120, 'Next Level ▶', () => this.scene.restart({ levelIndex: this.levelIndex + 1 }));
    }
    if (!won) {
      button(width / 2 - 120, 'Retry [R]', () => this.scene.restart({ levelIndex: this.levelIndex }));
    }
    button(width / 2 + (won && !hasNext ? 0 : 120), 'Level Select', () => this.scene.start('LevelSelect'));
    // ALWAYS pass explicit data: a bare restart() would re-run init with {} and fall back to level 1.
    this.input.keyboard?.once('keydown-R', () => this.scene.restart({ levelIndex: this.levelIndex }));
  }

  /**
   * Endless run end (spec §9). Reachable only via defeat — the top-up makes
   * 'levelWon' unreachable — but `won` is handled defensively (counts the
   * in-progress wave as cleared). Records best wave; pays tapered XP; no
   * first-clear, no mastery, no campaign unlock.
   */
  private showEndlessOverlay(won: boolean): void {
    const cleared = won ? this.sim.waveIndex + 1 : this.sim.waveIndex;
    // Records key off the BASE id — a campaign level id, or 'rainbow' (same
    // save.endless map, no new save fields; 'rainbow' never collides with a
    // level id because CAMPAIGN ids are level01-level60).
    const levelId = this.endlessBase !== null ? this.endlessBase.id : CAMPAIGN[this.levelIndex].id;
    const before = loadSave();
    const levelBefore = accountLevelForXp(before.xp);
    const { save, summary } = applyEndlessAttempt(before, levelId, cleared);
    writeSave(save);

    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x0a0d11, 0.7);
    uiPanel(this, width / 2 - 260, height / 2 - 150, 520, 300, 0.96);
    this.add
      .text(width / 2, height / 2 - 110, 'Run Over', { fontSize: '56px', color: UI.accent })
      .setOrigin(0.5);
    const lines = [
      `Cleared ${cleared} wave${cleared === 1 ? '' : 's'}` +
        (summary.newRecord ? ' — NEW RECORD!' : `  (best ${summary.bestWave})`),
      `+${summary.xpEarned} XP`,
    ];
    const gained = accountLevelForXp(save.xp) - levelBefore;
    if (gained > 0) {
      lines.push(`Account level ${accountLevelForXp(save.xp)}!  +${gained} skill point${gained === 1 ? '' : 's'}`);
    }
    this.add
      .text(width / 2, height / 2 - 50, lines.join('\n'), { fontSize: '19px', color: UI.gold, align: 'center' })
      .setOrigin(0.5, 0);
    const button = (x: number, label: string, onClick: () => void) =>
      uiButton(this, x, height / 2 + 90, label, UI.btn, 24).setOrigin(0.5).on('pointerdown', onClick);
    button(width / 2 - 120, 'Retry [R]', () => this.scene.restart({ levelIndex: this.levelIndex, endless: true, rainbow: this.rainbow }));
    button(width / 2 + 120, 'Level Select', () => this.scene.start('LevelSelect'));
    this.input.keyboard?.once('keydown-R', () => this.scene.restart({ levelIndex: this.levelIndex, endless: true, rainbow: this.rainbow }));
  }

  protected handleEvents(events: SimEvent[]): void {
    for (const ev of events) {
      switch (ev.type) {
        case 'enemySpawned': {
          const def = this.sim.content.enemies[ev.typeId];
          const isBoss = def.boss !== undefined;
          const baseId = baseEnemyId(ev.typeId);
          const texKey = isBoss ? bossTexKey(baseId) : enemyTexKey(baseId);
          const barWidth = isBoss ? BOSS_HP_BAR_WIDTH : ENEMY_HP_BAR_WIDTH;
          const barY = isBoss ? -46 : -24; // clears the 80px boss sprite vs the 36px enemy sprite
          const glow = this.add.circle(0, 2, isBoss ? 34 : 15, 0xffffff, 0); // [0] status underglow (invisible until a status lands)
          const img = this.add.image(0, 0, texKey); // [1] pixel sprite
          const hpBack = this.add.rectangle(0, barY, barWidth + 2, 5, 0x10131a, 0.9); // [2]
          const hpBar = this.add.rectangle(-barWidth / 2, barY, barWidth, 3, COLORS.enemyHp).setOrigin(0, 0.5); // [3]
          const c = this.add.container(-100, -100, [glow, img, hpBack, hpBar]);
          c.setData('element', def.element); // Task 8's death burst reads this
          c.setData('hpBarWidth', barWidth); // [3]'s full-hp width — renderEnemies scales down from here
          if (isBoss) c.setDepth(BOSS_DEPTH); // bosses render above all other enemies
          this.board.add(c);
          this.enemySprites.set(ev.enemyId, c);
          if (def.stealth) c.setAlpha(0.35); // stealth: semi-transparent (renderEnemies re-derives this every frame)
          if (isBoss) this.showBossBar(ev.enemyId, def.name);
          break;
        }
        case 'enemyKilled': {
          audio.play('death');
          const sprite = this.enemySprites.get(ev.enemyId);
          if (sprite) {
            const element = (sprite.getData('element') ?? 'shadow') as ElementId;
            this.burst(FX_DOT_KEY, ELEMENT_COLORS[element], { speed: [30, 110], lifespan: [150, 320], scaleStart: 1 }, 8, sprite.x, sprite.y);
            sprite.destroy();
          }
          this.enemySprites.delete(ev.enemyId);
          break;
        }
        case 'enemyLeaked': {
          audio.play('leak');
          this.leaked = true; // spoils the no-leak mastery for this attempt
          this.enemySprites.get(ev.enemyId)?.destroy();
          this.enemySprites.delete(ev.enemyId);
          break;
        }
        case 'towerPlaced': {
          audio.play('place');
          const pos = ev.pos;
          // Index 0 child = the tower image. Origin 0.5/0.85 anchors the stone
          // plinth (grid rows 16–19) on the hex center.
          const img = this.add.image(0, 0, towerTexKey(ev.typeId, 0)).setOrigin(0.5, 0.85);
          const c = this.add.container(pos.x, pos.y, [img]);
          this.board.add(c);
          this.towerSprites.set(ev.towerId, c);
          break;
        }
        case 'towerUpgraded': {
          const sprite = this.towerSprites.get(ev.towerId);
          const tower = this.sim.towers.find((t) => t.id === ev.towerId);
          if (!sprite || !tower) break;
          // Tier gems/sigil are baked into the tier textures — just swap.
          (sprite.list[0] as Phaser.GameObjects.Image).setTexture(towerTexKey(tower.typeId, ev.tier));
          break;
        }
        case 'towerSold': {
          this.towerSprites.get(ev.towerId)?.destroy();
          this.towerSprites.delete(ev.towerId);
          this.auraRings.get(ev.towerId)?.destroy();
          this.auraRings.delete(ev.towerId);
          break;
        }
        case 'undoApplied': {
          if (ev.kind === 'place') {
            this.towerSprites.get(ev.towerId)?.destroy();
            this.towerSprites.delete(ev.towerId);
            this.auraRings.get(ev.towerId)?.destroy();
            this.auraRings.delete(ev.towerId);
            if (this.selectedTowerId === ev.towerId) this.selectedTowerId = null;
            break;
          }
          const tower = this.sim.towers.find((t) => t.id === ev.towerId);
          const sprite = this.towerSprites.get(ev.towerId);
          if (!tower || !sprite) break;
          if (ev.kind === 'upgrade' || ev.kind === 'spec') {
            // Back to the tier texture (spec undo drops the spec-variant sprite).
            (sprite.list[0] as Phaser.GameObjects.Image).setTexture(towerTexKey(tower.typeId, tower.tier));
          }
          if (ev.kind === 'spec') {
            this.auraRings.get(ev.towerId)?.destroy(); // a reverted Beacon loses its coverage ring
            this.auraRings.delete(ev.towerId);
          }
          if (ev.kind === 'ascend' && tower.specId !== null) {
            // Undoing an ascension drops back to the spec's composed sprite (specId survives — only ascended flips).
            (sprite.list[0] as Phaser.GameObjects.Image).setTexture(specTexKey(tower.specId));
          }
          break; // 'node' has no board visual; the panel re-reads state every frame
        }
        case 'specializationChosen': {
          const tower = this.sim.towers.find((t) => t.id === ev.towerId);
          if (!tower) break;
          const def = CONTENT.towers[tower.typeId];
          const stats = this.sim.statsFor(tower, def);
          // Aura towers show their coverage as a faint filled ring on the board.
          if (stats.mechanic.kind === 'aura') {
            const ring = this.add
              .circle(tower.pos.x, tower.pos.y, stats.mechanic.radius, ELEMENT_COLORS[def.element], 0.05)
              .setStrokeStyle(2, ELEMENT_COLORS[def.element], 0.45);
            this.board.add(ring);
            this.auraRings.set(ev.towerId, ring);
            this.tweens.add({ targets: ring, alpha: { from: 0.7, to: 1 }, duration: 1200, yoyo: true, repeat: -1 });
          }
          // The spec's unique composed sprite replaces the tier-2 texture (no more star marker).
          const sprite = this.towerSprites.get(ev.towerId);
          if (sprite) (sprite.list[0] as Phaser.GameObjects.Image).setTexture(specTexKey(ev.specId));
          break;
        }
        case 'towerFired': {
          const tower = this.sim.towers.find((t) => t.id === ev.towerId);
          const enemy = this.sim.enemies.find((e) => e.id === ev.enemyId);
          if (!tower || !enemy) break;
          const def = CONTENT.towers[tower.typeId];
          const stats = this.sim.statsFor(tower, def);
          let element: AttackElement = def.element;
          if (stats.mechanic.kind === 'dualElement') {
            // tower.shots already counts the shot that fired this event, so the
            // just-fired shot's element index is (shots - 1) % 2.
            element = stats.mechanic.elements[(tower.shots - 1) % 2];
          }
          const color = ELEMENT_COLORS[element];
          // One firing voice per element family (spec §9); impact rides along —
          // combat is hitscan, so fire and hit are the same instant. The engine's
          // MIN_REPLAY_GAP keeps multi-tower volleys from clipping into noise.
          audio.play(`fire-${element}`);
          audio.play('impact');
          const p = this.sim.enemyPos(enemy);
          const heavy = stats.fireRate < 1; // mortar-class shots read thicker (art doc)
          const sx = tower.pos.x;
          const sy = tower.pos.y - 24; // fire from the tower's crown, not its plinth
          const t = this.tracerPool.acquire();
          t.glow.setTo(sx, sy, p.x, p.y).setStrokeStyle(heavy ? 7 : 5, color, 0.25).setAlpha(1).setVisible(true);
          t.core.setTo(sx, sy, p.x, p.y).setStrokeStyle(heavy ? 3 : 1.5, color, 1).setAlpha(1).setVisible(true);
          // The old code added fresh lines per shot (always on top); pooled ones must be re-raised.
          this.board.bringToTop(t.glow);
          this.board.bringToTop(t.core);
          this.tweens.add({
            targets: [t.glow, t.core],
            alpha: 0,
            duration: 130,
            onComplete: () => this.tracerPool.release(t),
          });
          this.burst(FX_SPARK_KEY, color, { speed: [20, 80], lifespan: [100, 220], scaleStart: 1.2 }, 4, p.x, p.y);
          break;
        }
        case 'earlyCallBonus': {
          if (ev.gold <= 0) break;
          const pop = this.add
            .text(this.scale.width - 40, this.scale.height - 90, `+${ev.gold}g`, {
              fontSize: '26px', color: UI.gold,
            })
            .setOrigin(1, 1);
          this.tweens.add({ targets: pop, y: pop.y - 50, alpha: 0, duration: 900, onComplete: () => pop.destroy() });
          break;
        }
        case 'wardIncome': {
          // Same early-call floating-text pattern, popped just under the HUD gold/lives/wave
          // panel (which spans x 8–204, y 6–124) and drifting up over it as it fades.
          const pop = this.add
            .text(106, 132, `+${ev.gold}g wards`, { fontSize: '18px', color: UI.gold })
            .setOrigin(0.5, 0)
            .setScrollFactor(0);
          this.tweens.add({ targets: pop, y: pop.y - 40, alpha: 0, duration: 900, onComplete: () => pop.destroy() });
          break;
        }
        case 'bossAbility': {
          const enemy = this.sim.enemies.find((e) => e.id === ev.enemyId);
          if (!enemy) break;
          const p = this.sim.enemyPos(enemy);
          this.cameras.main.shake(120, 0.004);
          this.burst(FX_DOT_KEY, ELEMENT_COLORS[enemy.element], { speed: [40, 140], lifespan: [200, 400], scaleStart: 1.6 }, 16, p.x, p.y);
          break;
        }
        case 'towerAscended': {
          const sprite = this.towerSprites.get(ev.towerId);
          if (sprite) (sprite.list[0] as Phaser.GameObjects.Image).setTexture(ascTexKey(ev.specId));
          break;
        }
        case 'levelWon':
          audio.play('victory');
          this.showOverlay(true);
          break;
        case 'levelLost':
          audio.play('defeat');
          this.showOverlay(false);
          break;
        case 'waveStarted':
          audio.play('waveStart');
          // Endless: keep generated waves LOOKAHEAD ahead of the sim's win check,
          // so 'won' stays unreachable and the run can only end in defeat.
          if (this.endless && this.endlessLevel !== null && this.endlessBase !== null) {
            if (this.rainbow) {
              extendRainbowLevel(this.endlessLevel, ev.waveIndex + 1 + ENDLESS_LOOKAHEAD);
              // Wave 0 IS the create()-time paint (cycle[0]); shift from wave 1 on.
              if (ev.waveIndex > 0) this.recycleRainbowVisuals(ev.waveIndex);
            } else {
              extendEndlessLevel(this.endlessLevel, this.endlessBase, ev.waveIndex + 1 + ENDLESS_LOOKAHEAD);
            }
          }
          break;
        default:
          break;
      }
    }
  }

  private renderEnemies(): void {
    for (const enemy of this.sim.enemies) {
      const sprite = this.enemySprites.get(enemy.id);
      if (!sprite || !enemy.alive) continue;
      const p = this.sim.enemyPos(enemy, effectiveSpeed(enemy) * this.accumulator);
      sprite.setPosition(p.x, p.y);
      const fx = enemy.effects;
      // P14 (P11 carry-item closed): effective stealth = baked stealth OR an
      // active boss stealthPhase window — the Umbrageist fades mid-fight, and
      // any stealth enemy reads faint until a ward reveals it. Targeting is
      // sim-side (pierce sees through regardless); this alpha is presentation.
      const hidden = enemy.stealth || fx.stealthPhase !== undefined;
      sprite.alpha = hidden ? (this.sim.isRevealed(enemy) ? 0.7 : 0.35) : 1;
      const glow = sprite.list[0] as Phaser.GameObjects.Arc;
      const hpBar = sprite.list[3] as Phaser.GameObjects.Rectangle;
      const hpBarWidth = (sprite.getData('hpBarWidth') as number | undefined) ?? ENEMY_HP_BAR_WIDTH;
      hpBar.width = hpBarWidth * Math.max(0, enemy.hp / enemy.maxHp);
      const status =
        fx.shield ? STATUS_COLORS.shield
        : fx.burn ? STATUS_COLORS.burn
        : fx.poison ? STATUS_COLORS.poison
        : fx.slow ? STATUS_COLORS.slow
        : fx.vulnerability ? STATUS_COLORS.vulnerability
        : undefined;
      if (status !== undefined) glow.setFillStyle(status, fx.shield ? 0.6 : 0.35);
      else glow.setFillStyle(0xffffff, 0);
    }
  }

  get simulation(): Simulation {
    return this.sim;
  }
}
