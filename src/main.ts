import Phaser from 'phaser';
import { CAMPAIGN } from './content';
import { audio, type AudioEngine } from './game/audio';
import { BattleScene } from './game/BattleScene';
import { LevelSelectScene } from './game/LevelSelectScene';
import { SkillTreeScene } from './game/SkillTreeScene';
import { TitleScene } from './game/TitleScene';
import { recordWin, restoreProgress, unlockedLevelCount } from './game/campaign';
import { music, type MusicEngine } from './game/music';
import { loadSave, writeSave } from './game/save';

declare global {
  interface Window {
    game: Phaser.Game;
    /** Dev-only: mark a level won to unlock the next (verification shortcut). */
    devWin?: (levelIndex: number) => void;
    /** Dev-only: the audio engine, exposed for WebAudio state assertions. */
    spirehexAudio?: AudioEngine;
    /** Dev-only: the music engine, exposed for sequencer state assertions. */
    spirehexMusic?: MusicEngine;
  }
}

// Restore campaign unlocks and audio settings from the local save BEFORE any scene reads them.
const bootSave = loadSave();
restoreProgress(bootSave.unlockedLevels);
audio.muted = bootSave.settings.muted;
music.muted = bootSave.settings.musicMuted;
// Browser autoplay policy: an AudioContext may only start inside a user gesture.
// One-shot CAPTURE listeners run before any scene handler, so the very first
// click/keypress both unlocks audio AND can already be heard.
window.addEventListener('pointerdown', () => audio.unlock(), { once: true, capture: true });
window.addEventListener('keydown', () => audio.unlock(), { once: true, capture: true });
// iOS Safari: touchend is the canonical audio-unlock gesture — pointerdown alone
// is not always gesture-grade there (P8 spec §8; playtest found silent phones).
window.addEventListener('touchend', () => audio.unlock(), { once: true, capture: true });
// Returning to the tab/app resumes a context iOS parked as 'interrupted'
// (call, Siri, app switch). resume() never CREATES a context, so this listener
// is safe outside user gestures and never steals the unlock from the trio above.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') audio.resume();
});
// The music pump timer runs from boot; every pump is a no-op until the
// gesture unlock flips the shared context to 'running'.
music.start();

// Title first: it is the entry screen (Phaser auto-starts only scenes[0]; the
// rest just register). The dev-only sprite gallery is never part of this
// static list — see the dynamic import below — so a production build never
// pulls GalleryScene (or its art-review-only imports) into the bundle.
const scenes: Phaser.Types.Scenes.SceneType[] = [TitleScene, LevelSelectScene, SkillTreeScene, BattleScene];

window.game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'app',
  width: 1280,
  height: 720,
  backgroundColor: '#0e1216',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: scenes,
});

if (import.meta.env.DEV) {
  // /#gallery boots the sprite gallery instead of the level select screen; a
  // plain dev URL just registers it. P6-deferred hardening: never touch the
  // scene manager before it has booted. isRunning only flips true AFTER the
  // READY emit (Game.start follows texturesReady's emit), and the SceneManager
  // subscribes its bootQueue to READY at construction — before our listener —
  // so either branch guarantees scenes exist when we resolve. (Game.isBooted
  // is the WRONG gate: it's set synchronously during construction, pre-READY.)
  const isGallery = window.location.hash === '#gallery';
  const booted = new Promise<void>((resolve) => {
    if (window.game.isRunning) resolve();
    else window.game.events.once(Phaser.Core.Events.READY, () => resolve());
  });
  void Promise.all([import('./game/GalleryScene'), booted]).then(([{ GalleryScene }]) => {
    if (isGallery) window.game.scene.stop('Title');
    window.game.scene.add('Gallery', GalleryScene, isGallery);
  });
}

if (import.meta.env.DEV) {
  window.devWin = (levelIndex: number) => {
    if (levelIndex >= 0 && levelIndex < CAMPAIGN.length) {
      recordWin(levelIndex);
      const save = loadSave();
      save.unlockedLevels = unlockedLevelCount();
      const id = CAMPAIGN[levelIndex].id;
      // Dev shortcut counts as beaten (endless unlock). Forfeits that level's
      // one-time first-clear XP bonus by design — it is a verification tool.
      if (!save.firstClears.includes(id)) save.firstClears.push(id);
      writeSave(save); // dev unlocks persist like real ones
    }
  };
}

if (import.meta.env.DEV) {
  window.spirehexAudio = audio; // verification hook: contextState + played counter
  window.spirehexMusic = music; // verification hook: sequencer state assertions
}
