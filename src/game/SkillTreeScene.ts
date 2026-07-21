import Phaser from 'phaser';
import { SKILL_TREE, TIER_REQUIREMENTS, type SkillNodeDef } from '../content/skilltree';
import {
  accountLevelForXp,
  availableMasteryPoints,
  availableSkillPoints,
  buyNode,
  masterNode,
  pointsSpentBelowTier,
} from './meta';
import { loadSave, writeSave, type SaveData } from './save';
import { UI, uiButton } from './ui';

const CARD_W = 380;
const CARD_H = 100;
const ROW_SPACING = 112;
const GRID_TOP = 130;

/** True if `tier` gates on more points spent in lower tiers than `save` currently has. */
function tierIsLocked(save: SaveData, tier: 1 | 2 | 3 | 4): boolean {
  return tier > 1 && pointsSpentBelowTier(save, tier as 2 | 3 | 4) < TIER_REQUIREMENTS[tier as 2 | 3 | 4];
}

/**
 * Skill tree v2: a four-tab strip (one page per tier) over the card grid,
 * points HUD, click-to-buy, and a master button on masterable owned nodes.
 * State model: the scene holds the save; every successful purchase writes it
 * to storage and redraws the active page (cheap at ≤11 cards). Failures flash
 * the card (carry-list fix — no more silent no-ops). Tabs rebuild inside
 * draw() so their lock icons refresh immediately after a purchase.
 */
export class SkillTreeScene extends Phaser.Scene {
  private save!: SaveData;
  private root!: Phaser.GameObjects.Container;
  private activeTier: 1 | 2 | 3 | 4 = 1;
  /** Card top-left corners by node id — lets deny feedback flash the right card. */
  private cardPos = new Map<string, { x: number; y: number }>();

  constructor() {
    super('SkillTree');
  }

  create(): void {
    this.save = loadSave();
    const { width } = this.scale;
    this.cameras.main.setBackgroundColor(0x0e1216);
    this.add.text(width / 2, 36, 'Skill Tree', { fontSize: '32px', color: UI.text }).setOrigin(0.5);
    uiButton(this, width - 16, 12, '◀ Levels', UI.btn, 16)
      .setOrigin(1, 0)
      .on('pointerdown', () => this.scene.start('LevelSelect'));
    this.root = this.add.container(0, 0);
    this.draw();
  }

  /** Rebuild the tab strip + active tier's page from this.save. */
  private draw(): void {
    this.root.removeAll(true);
    this.cardPos.clear();
    this.root.add(
      this.add
        .text(
          this.scale.width / 2,
          72,
          `Account Level ${accountLevelForXp(this.save.xp)}    ` +
            `Skill Points: ${availableSkillPoints(this.save)}    Mastery Points: ${availableMasteryPoints(this.save)}`,
          { fontSize: '17px', color: UI.gold },
        )
        .setOrigin(0.5),
    );

    ([1, 2, 3, 4] as const).forEach((tier) => {
      const locked = tierIsLocked(this.save, tier);
      const label = `Tier ${tier}${locked ? ' 🔒' : ''}`;
      this.root.add(
        uiButton(this, 40 + (tier - 1) * 130, 96, label, tier === this.activeTier ? UI.btnGood : UI.btn, 15).on(
          'pointerdown',
          () => {
            this.activeTier = tier;
            this.draw();
          },
        ),
      );
    });

    const nodes = SKILL_TREE.filter((n) => n.tier === this.activeTier);
    nodes.forEach((node, i) => this.nodeCard(node, 40 + (i % 3) * 400, GRID_TOP + Math.floor(i / 3) * ROW_SPACING));
  }

  private nodeCard(node: SkillNodeDef, x: number, y: number): void {
    this.cardPos.set(node.id, { x, y });
    const ranks = this.save.spentSkillPoints[node.id] ?? 0;
    const mastered = this.save.masteredNodes.includes(node.id);
    const tierLocked = tierIsLocked(this.save, node.tier);
    const canBuy = !tierLocked && ranks < node.maxRanks && availableSkillPoints(this.save) >= node.costPerRank;
    const pips = '●'.repeat(ranks) + '○'.repeat(node.maxRanks - ranks);
    const desc = mastered && node.mastery ? node.mastery.desc : node.desc;

    // Card chrome: the stroke tells the state — gold mastered, green owned, dim locked.
    const stroke = mastered ? 0xcaa84a : ranks > 0 ? 0x3f6a4a : tierLocked ? 0x232a33 : UI.panelStroke;
    const bg = this.add
      .rectangle(x, y, CARD_W, CARD_H, tierLocked ? UI.cardLocked : UI.card, 1)
      .setOrigin(0, 0)
      .setStrokeStyle(mastered || ranks > 0 ? 2 : 1, stroke, 1);
    const title = this.add.text(x + 12, y + 8, `${node.name}  ${pips}${mastered ? '  ★ mastered' : ''}`, {
      fontSize: '16px',
      color: tierLocked ? UI.faint : mastered ? UI.gold : UI.text,
    });
    const body = this.add.text(x + 12, y + 32, desc, {
      fontSize: '12px',
      color: tierLocked ? UI.faint : UI.dim,
      wordWrap: { width: CARD_W - 24 },
    });
    this.root.add([bg, title, body]);

    // Fixed button row at the card bottom: buy sits left; master is RIGHT-ALIGNED
    // (origin 1,0 at the card's right edge) — the two can no longer overlap
    // each other or the description (carry-list fix).
    if (canBuy) {
      this.root.add(
        uiButton(
          this,
          x + 12,
          y + 68,
          ranks === 0 ? `Learn (${node.costPerRank} SP)` : `Rank up (${node.costPerRank} SP)`,
          UI.btnGood,
          13,
        ).on('pointerdown', () => this.buy(node.id)),
      );
    } else if (tierLocked) {
      this.root.add(
        this.add.text(x + 12, y + 72, `Requires ${TIER_REQUIREMENTS[node.tier as 2 | 3 | 4]} points spent in lower tiers`, {
          fontSize: '12px',
          color: UI.faint,
        }),
      );
    }
    if (node.mastery && ranks > 0 && !mastered && availableMasteryPoints(this.save) >= 1) {
      this.root.add(
        uiButton(this, x + CARD_W - 12, y + 68, '★ Master (1 MP)', UI.btnGold, 13)
          .setOrigin(1, 0)
          .on('pointerdown', () => this.master(node.id)),
      );
    }
  }

  private buy(nodeId: string): void {
    const result = buyNode(this.save, nodeId);
    if (!result.ok) {
      this.flashDeny(nodeId); // carry-list fix: rejected actions flash instead of silently no-oping
      return;
    }
    this.save = result.save;
    writeSave(this.save);
    this.draw();
  }

  private master(nodeId: string): void {
    const result = masterNode(this.save, nodeId);
    if (!result.ok) {
      this.flashDeny(nodeId);
      return;
    }
    this.save = result.save;
    writeSave(this.save);
    this.draw();
  }

  /** Brief red flash over a card: the action was rejected (not enough points, maxed, …). */
  private flashDeny(nodeId: string): void {
    const pos = this.cardPos.get(nodeId);
    if (!pos) return;
    const flash = this.add
      .rectangle(pos.x, pos.y, CARD_W, CARD_H, 0xe05a5a, 0.18)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0xe05a5a, 0.9);
    this.tweens.add({ targets: flash, alpha: 0, duration: 320, onComplete: () => flash.destroy() });
  }
}
