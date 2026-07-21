import Phaser from 'phaser';
import { audio } from './audio';

/** Shared UI chrome — colors from docs/art-direction.md §UI. Scenes-only module (may import Phaser). */
export const UI = {
  panel: 0x141a22,
  panelStroke: 0x2c3a4a,
  btn: 0x243140,
  btnGood: 0x2e5d3a,
  btnDanger: 0x6b2f2f,
  btnSpec: 0x4a3a66,
  btnGold: 0x4a3a14,
  card: 0x1a222c,
  cardLocked: 0x14181e,
  text: '#e8eef4',
  dim: '#8fa3b8',
  faint: '#5a6673',
  gold: '#ffd97a',
  good: '#7ae0a3',
  bad: '#e07a7a',
  accent: '#9fc2e8',
} as const;

export function cssColor(c: number): string {
  return '#' + c.toString(16).padStart(6, '0');
}

/** Per-channel lighten for hover states. */
export function lighten(color: number, factor = 1.3): number {
  const r = Math.min(255, Math.round(((color >> 16) & 0xff) * factor));
  const g = Math.min(255, Math.round(((color >> 8) & 0xff) * factor));
  const b = Math.min(255, Math.round((color & 0xff) * factor));
  return (r << 16) | (g << 8) | b;
}

/** Standard chrome panel: fill + 1px stroke, origin top-left. */
export function uiPanel(
  scene: Phaser.Scene,
  x: number,
  y: number,
  w: number,
  h: number,
  alpha = 0.92,
): Phaser.GameObjects.Rectangle {
  return scene.add.rectangle(x, y, w, h, UI.panel, alpha).setOrigin(0, 0).setStrokeStyle(1, UI.panelStroke, 1);
}

/** Standard text button with hover lighten. Chain .on('pointerdown', …) and origin/position tweaks. */
export function uiButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  bg: number,
  fontSize = 15,
): Phaser.GameObjects.Text {
  const btn = scene.add
    .text(x, y, label, {
      fontSize: `${fontSize}px`,
      color: UI.text,
      backgroundColor: cssColor(bg),
      padding: { x: 10, y: 6 },
    })
    .setInteractive({ useHandCursor: true });
  btn.on('pointerdown', () => audio.play('click'));
  btn.on('pointerover', () => btn.setBackgroundColor(cssColor(lighten(bg))));
  btn.on('pointerout', () => btn.setBackgroundColor(cssColor(bg)));
  return btn;
}
