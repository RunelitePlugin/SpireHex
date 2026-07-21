# SpireHex

Hex-grid tower defense. Phaser 3 + TypeScript + Vite, with a deterministic
headless simulation core.

## Develop

- `npm install`
- `npm run dev` — dev server (open the printed URL in any browser)
- `npm test` — headless test suite: simulation + content validation (Vitest)
- `npm run build` — production build to `dist/`
- `npm run balance` — deterministic balance report: scripted winnability
  margins and 36-pairing opening corpora for the multi-path levels (seed 1;
  the same harness the regression tests run, so report numbers ARE the
  locked test numbers)

## Architecture

- `src/sim/` — deterministic game logic, no Phaser imports, 30 Hz fixed tick
  (enforced by `tests/architecture/simPurity.test.ts`)
- `src/game/` — Phaser rendering & input, procedural sprite baking, Web
  Audio SFX synthesis
- `src/content/` — all balance/content data: elements matrix, towers (6, one
  per element, each with 2 tier upgrades), enemies, levels

## Current state (through Phase 7 — the campaign slice is complete)

- Six elements in opposed pairs (fire↔frost, nature↔storm, radiant↔shadow)
  with a 6×6 damage matrix in `src/content/elements.ts`
- Element mechanics: burn, slow, poison spread, chain, armor-pierce +
  stealth targeting, percent-HP + vulnerability
- Enemy archetypes: armored, fast, swarm, stealth
- Towers: 2 tier upgrades, then a choice of 4 exclusive specializations per
  tower (24 total) — including the Duskfire fire/shadow hybrid (alternates
  element every shot) and the Radiant Beacon aura support (never fires,
  hastens towers in radius)
- Free-spend minor nodes (+damage/+range/+fire rate, 3 ranks each), selling
  at 70% of total investment, per-tower targeting priorities
  (first/last/strong/weak)
- In battle: place, select, upgrade, specialize, node up, retarget, or sell
  through the tower panel
- A 10-level campaign: the game boots into the **campaign select** — win a
  level to unlock the next. Progress now persists across reloads (see the
  meta-progression/save bullets below).
- In battle, "◀ Levels" returns to the select screen. After the first
  wave, later waves auto-start on a countdown; press **Space** (or the
  on-screen button) to call the wave early for bonus gold (~3g per
  second skipped, shown live on the button).
- Multi-path maps (levels 7, 8, 10) spawn enemies on multiple roads at
  once; wave entries choose their road via `pathIndex`.
- Authoring note: levels live in `src/content/levels/`; paths are
  offset-coordinate tables passed to `offsetPath` using rook moves only
  (see `src/content/levelUtils.ts`).
- Meta-progression now persists across sessions: the game boots into
  **campaign select**, showing an account level/XP bar and skill/mastery
  point totals. Every battle attempt (win or lose) earns XP from kill
  bounties, with a one-time first-clear bonus per level; account level-ups
  grant skill points, and two once-per-level mastery achievements (an
  18+-lives clear and a zero-leak clear) grant mastery points.
- **✦ Skill Tree** (from the select screen): spend skill points on tier-1
  nodes (unlock the Thorn Totem/Storm Pylon/Umbra Monolith towers, extra
  starting gold, per-wave life regen, faster early-call bonus) and, once 3
  tier-1 points are spent, tier-2 nodes (unlock tower specializations,
  per-element damage boosts). Mastery points upgrade an owned node's effect
  in place (e.g. Prospecting's +20 starting gold/rank becomes +30/rank
  mastered). Skill choices fold into plain-data `SimModifiers` passed into
  the `Simulation` constructor — the sim never reads the skill tree
  directly.
- Progress is saved to `localStorage` (`spirehex-save-v1`, versioned JSON)
  after every attempt: unlocked levels, XP, first-clears, mastery flags,
  and skill purchases all survive a reload. A missing, corrupt, or
  foreign-shaped save always falls back to a fresh profile rather than
  crashing.
- **Real look, procedurally generated:** the game no longer runs on
  placeholder shapes. Towers, tier upgrades, all 24 specializations, and
  every enemy archetype are lightly pixelated sprites baked at boot from
  string grids (`src/art/`) — nearest-neighbor scaled ×3, one baked
  outline, top-left lighting, element-tinted accents — composed once per
  texture key and cached, never redrawn per frame. Terrain is flat vector
  hex fills with seeded per-level tone/scatter/road decoration (identical
  on every visit, `Math.random` banned from render code). Combat renders
  per-element tracers, impact/death particle bursts, aura/range rings, and
  status-effect underglow. UI chrome (panels, buttons, palette cards) is
  unified through `src/game/ui.ts`. `docs/art-direction.md` is the binding
  palette/shape/VFX spec every asset conforms to; `/#gallery` (dev-only)
  renders every tower/tier/spec/enemy/fx texture side by side for review.

- **Sound, no assets:** every core action is audible — tower placement, one
  firing voice per element family, impacts, deaths, the leak alarm, wave
  horns, victory/defeat stingers, and UI clicks — all synthesized at play
  time from data recipes through the raw Web Audio API (`src/game/audio.ts`,
  Phaser-free and headless-inert so the deterministic sim and tests never
  hear it). Audio unlocks on the first click/keypress per browser autoplay
  policy; the 🔊/🔇 toggle persists in the save.
- **Balance locked by evidence:** the deterministic sim doubles as a balance
  instrument (`npm run balance`). Phase 7 used it to retune level 8's real
  difficulty spikes (measured, not guessed — flat gold bumps were disproven:
  9/36 opening pairings won before and after; softening the wave 3–5
  armor/speed ramp and the finale's stealth column lifted it to 16/36 with a
  10/20-life script margin), to make level 2's element-matchup lesson bite
  (a wrong-element build now finishes at 11/20 lives; correct play still
  clears 20/20), and to lock every measured margin as a regression floor —
  winnability floors, lesson bounds, flavor thresholds, and economy outcome
  assertions all cite the same dated batch-run evidence in comments.

