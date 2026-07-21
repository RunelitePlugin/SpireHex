import { readdirSync, readFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import { describe, expect, it } from 'vitest';

// The deterministic core must stay renderer-free: no Phaser, no src/game imports.
const ROOTS = ['src/sim', 'src/content'];

const PHASER_RULES: Array<{ pattern: RegExp; why: string }> = [
  { pattern: /from\s+['"]phaser['"]/, why: 'imports phaser' },
  { pattern: /import\s+['"]phaser['"]/, why: 'side-effect imports phaser' },
  { pattern: /require\(\s*['"]phaser['"]\s*\)/, why: 'requires phaser' },
  { pattern: /import\s*\(\s*['"]phaser/, why: 'dynamically imports phaser' },
  { pattern: /from\s+['"]phaser\//, why: 'imports a phaser subpath' },
  { pattern: /require\s*\(\s*['"]phaser\//, why: 'requires a phaser subpath' },
];

const CORE_RULES: Array<{ pattern: RegExp; why: string }> = [
  ...PHASER_RULES,
  { pattern: /from\s+['"][^'"]*\/game\//, why: 'imports from src/game' },
  { pattern: /localStorage/, why: 'touches localStorage (persistence belongs in src/game/save.ts)' },
  { pattern: /from\s+['"][^'"]*\/art\//, why: 'imports from src/art (the core must not depend on render data)' },
];

const CHECKED_EXTENSIONS = new Set(['.ts', '.tsx', '.mts', '.cts']);

function tsFilesUnder(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...tsFilesUnder(full));
    else if (CHECKED_EXTENSIONS.has(extname(entry.name))) out.push(full);
  }
  return out;
}

describe('sim purity', () => {
  const files = ROOTS.flatMap((root) => tsFilesUnder(join(process.cwd(), root)));

  it('finds source files to check (guards against a silently-empty scan)', () => {
    expect(files.length).toBeGreaterThan(5);
  });

  it('never imports phaser, src/game, or localStorage from src/sim or src/content', () => {
    for (const file of files) {
      const text = readFileSync(file, 'utf8');
      for (const { pattern, why } of CORE_RULES) {
        expect(pattern.test(text), `${file} ${why}`).toBe(false);
      }
    }
  });
});

describe('meta layer purity', () => {
  // Phaser-free plain TS in src/game — these must stay loadable in node tests.
  const META_FILES = [
    'src/game/campaign.ts',
    'src/game/meta.ts',
    'src/game/save.ts',
    'src/game/audio.ts',
    'src/game/music.ts',
    'src/game/boardDecor.ts',
    'src/game/fxPool.ts',
  ];

  it('campaign/meta/save never import phaser', () => {
    for (const rel of META_FILES) {
      const text = readFileSync(join(process.cwd(), rel), 'utf8');
      for (const { pattern, why } of PHASER_RULES) {
        expect(pattern.test(text), `${rel} ${why}`).toBe(false);
      }
    }
  });
});

describe('game layer purity', () => {
  // src/game is Phaser scene/render code — decoration must use the seeded PRNG
  // (src/sim's rng), not JS's Math.random, or replays and tests stop being
  // deterministic. No legitimate use of Math.random exists under src/game.
  const GAME_RULES: Array<{ pattern: RegExp; why: string }> = [
    { pattern: /Math\.random/, why: 'uses Math.random (render decoration must use the seeded PRNG)' },
  ];

  const gameFiles = tsFilesUnder(join(process.cwd(), 'src/game'));

  it('finds game source files to check', () => {
    expect(gameFiles.length).toBeGreaterThan(0);
  });

  it('src/game never uses Math.random', () => {
    for (const file of gameFiles) {
      const text = readFileSync(file, 'utf8');
      for (const { pattern, why } of GAME_RULES) {
        expect(pattern.test(text), `${file} ${why}`).toBe(false);
      }
    }
  });
});

describe('art layer purity', () => {
  // src/art is render-layer DATA: plain TS, headless-testable, deterministic.
  const ART_RULES: Array<{ pattern: RegExp; why: string }> = [
    ...PHASER_RULES,
    { pattern: /from\s+['"][^'"]*\/game\//, why: 'imports from src/game (bake code lives there, not here)' },
    { pattern: /from\s+['"][^'"]*\/sim\//, why: 'imports from src/sim (art keys off content ids only)' },
    { pattern: /Math\.random/, why: 'uses Math.random (render decoration must use the seeded PRNG)' },
    { pattern: /localStorage/, why: 'touches localStorage' },
  ];

  const artFiles = tsFilesUnder(join(process.cwd(), 'src/art'));

  it('finds art source files to check', () => {
    expect(artFiles.length).toBeGreaterThan(0);
  });

  it('src/art never imports phaser, src/game, src/sim, Math.random, or localStorage', () => {
    for (const file of artFiles) {
      const text = readFileSync(file, 'utf8');
      for (const { pattern, why } of ART_RULES) {
        expect(pattern.test(text), `${file} ${why}`).toBe(false);
      }
    }
  });
});
