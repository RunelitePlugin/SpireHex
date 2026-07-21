# SpireHex Art Direction

Status: binding for Phase 6+. Every generated or sourced asset must conform.

## Pillars

1. **Modern vector fantasy world.** Clean geometric hex terrain, flat fills with
   subtle layered shading. No gradients-per-pixel, no rubber/Bloons cartoon look,
   no gloss. Mood: dark fantasy — deep forest and slate, warm earthen road.
2. **Lightly pixelated actors.** Towers and enemies are pixel sprites (string
   grids baked at ×3 nearest-neighbor) so they read as distinct handcrafted
   pieces against the smooth vector world.
3. **Element color is language.** Six accent ramps carry meaning everywhere:
   sprites, tracers, particles, rings, UI markers. Nothing else gets saturated color.

## Palette

### World (biome-neutral)

| Role | Hex |
|---|---|
| Page/board background | `#0e1216` |

Ground, path, wall, and decoration colors are PER-BIOME as of Phase 9 — see
"Biome palettes" below. The painted winding road is retired: paths are
hex-native (tinted path hexes + carved rim walls). The v1 forest/road values
(`#1b241e`-family ground, `#8a7350` road) are superseded.

### Biome palettes

One palette record per biome, defined in `src/art/biomes.ts` — scenes read
colors ONLY from there (never inline hex literals for terrain). Six biomes
ship across P9–P14; P9 establishes the system with **Ember Wastes** (biome 1,
levels 01–10 until the P11 conversion re-keys them).

Rules for every biome:
- Ground = three seeded tones (flat fills, per-hex variation, top-left edge light).
- Path hexes = a clearly distinct trodden tint + seeded grit/fleck texture. No
  painted overlay roads.
- Carved rim walls: every path-hex edge not shared with another path hex gets a
  cliff face inset ~9px INTO the path hex, with a lit cap line on left/up-facing
  edges (k=3,4,5) — the road reads as a channel carved through raised terrain.
  Walls are pure render decoration derived from `pathHexes`; never gameplay.
- Background = vertical sky bands + two flat ridge silhouettes (flat-shouldered
  "hex mesa" skylines, not alpine peaks) drifting at different speeds
  (parallax), + rising element-tinted motes. All seeded; all cheap.

**Ember Wastes (biome 1):**

| Role | Hex |
|---|---|
| Ground tones (seeded per hex) | `#241c15` / `#2a2118` / `#30261b` |
| Hex grid line | `#191310` |
| Hex top-left edge light | `#4a3a28` |
| Path hex fill | `#453827` |
| Path grit speckle | `#6b5a3d` |
| Path ember fleck | `#e07b39` (fire `l`) |
| Cliff face (rim wall) | `#171310` |
| Cliff cap (lit edge) | `#5c472e` |
| Deco: dry tuft | `#4a3a24` |
| Deco: stone / dark stone | `#3d3a36` / `#2e2b28` |
| Deco: ember spark | `#e07b39` (alpha 0.5) |
| Sky bands (top→horizon) | `#0b0e13` / `#0f0f13` / `#141013` / `#1a1310` |
| Ridges (far/near) | `#1a1411` / `#221a14` |
| Motes | `#ffc46b` (fire `g`) |

**Frostfell (biome 2):** cold slate blues, snow motes, an ice-sheet road.

| Role | Hex |
|---|---|
| Ground tones (seeded per hex) | `#141c24` / `#18222b` / `#1c2833` |
| Hex grid line | `#0e141b` |
| Hex top-left edge light | `#2e4256` |
| Path hex fill | `#33475a` |
| Path grit speckle | `#53718a` |
| Path fleck | `#5fc7e8` (frost `l`) |
| Cliff face / cliff cap | `#0c1218` / `#476076` |
| Deco: frosted tuft | `#2c4050` |
| Deco: stone / dark stone | `#3a4552` / `#2a323d` |
| Deco: ice spark | `#5fc7e8` (alpha 0.5) |
| Sky bands (top→horizon) | `#0a0f16` / `#0d1420` / `#101a28` / `#142230` |
| Ridges (far/near) | `#121a24` / `#18242f` |
| Motes (snow) | `#c8f0ff` (frost `g`) |

**Verdant Deep (biome 3):** deep forest greens, spore motes, a loam trail.

| Role | Hex |
|---|---|
| Ground tones (seeded per hex) | `#15211a` / `#19271e` / `#1d2d22` |
| Hex grid line | `#0f1712` |
| Hex top-left edge light | `#33503c` |
| Path hex fill | `#40402a` |
| Path grit speckle | `#6b6242` |
| Path fleck | `#63c464` (nature `l`) |
| Cliff face / cliff cap | `#101812` / `#4a6a4a` |
| Deco: fern tuft | `#2f5232` |
| Deco: stone / dark stone | `#39443c` / `#2a332c` |
| Deco: spore glimmer | `#63c464` (alpha 0.5) |
| Sky bands (top→horizon) | `#0a1210` / `#0c1712` / `#0f1d15` / `#122417` |
| Ridges (far/near) | `#131d16` / `#192a1c` |
| Motes (spores) | `#b4e89a` (nature `g`) |

**Storm Reach (biome 4):** indigo storm-slate, charged gold flecks, a conduit road.

| Role | Hex |
|---|---|
| Ground tones (seeded per hex) | `#1a1a26` / `#1f2030` / `#24263a` |
| Hex grid line | `#121320` |
| Hex top-left edge light | `#3a3e5e` |
| Path hex fill | `#3c3f56` |
| Path grit speckle | `#5d6284` |
| Path fleck | `#d8c95a` |
| Cliff face / cliff cap | `#101120` / `#565c80` |
| Deco: wind-bent tuft | `#343a58` |
| Deco: stone / dark stone | `#3f4254` / `#2e3040` |
| Deco: static spark | `#d8c95a` (alpha 0.5) |
| Sky bands (top→horizon) | `#0b0c16` / `#0f101f` / `#131527` / `#181a30` |
| Ridges (far/near) | `#14152a` / `#1b1d36` |
| Motes (charged sparks) | `#f3e58a` |

**Radiant Summits (biome 5):** sun-warmed summit gold, dawn-lit sky, a gilded stair road.

| Role | Hex |
|---|---|
| Ground tones (seeded per hex) | `#262019` / `#2d261d` / `#342c21` |
| Hex grid line | `#1a1611` |
| Hex top-left edge light | `#5e4f30` |
| Path hex fill | `#51452c` |
| Path grit speckle | `#7d6c45` |
| Path fleck | `#f2d98c` |
| Cliff face / cliff cap | `#1c1710` / `#776137` |
| Deco: sun-dried tuft | `#54481f` |
| Deco: stone / dark stone | `#4a4438` / `#38332a` |
| Deco: light glimmer | `#f2d98c` (alpha 0.5) |
| Sky bands (top→horizon) | `#120f0c` / `#1a140d` / `#241a0f` / `#2f2212` |
| Ridges (far/near) | `#1f1810` / `#2a2015` |
| Motes (daylight motes) | `#ffe9a8` |

**Umbral Depths (biome 6):** abyssal violet-black, pale witchlight flecks, a buried road.

| Role | Hex |
|---|---|
| Ground tones (seeded per hex) | `#16121e` / `#1a1526` / `#1f192e` |
| Hex grid line | `#0e0b16` |
| Hex top-left edge light | `#35294e` |
| Path hex fill | `#322a44` |
| Path grit speckle | `#554a72` |
| Path fleck | `#b289e0` |
| Cliff face / cliff cap | `#0c0914` / `#4c3f68` |
| Deco: withered tuft | `#2a2140` |
| Deco: stone / dark stone | `#342e46` / `#252036` |
| Deco: witchlight glint | `#b289e0` (alpha 0.5) |
| Sky bands (top→horizon) | `#080611` / `#0c0917` / `#100c1f` / `#141028` |
| Ridges (far/near) | `#120e20` / `#18132b` |
| Motes (drifting witchlights) | `#caa6f0` |

### Sprite neutrals

| Key | Role | Hex |
|---|---|---|
| `o` | Baked outline (1px, every silhouette) | `#0d1017` |
| `s` | Dark stone | `#2e3542` |
| `S` | Mid stone | `#4a5468` |
| `w` | Light stone (top-left-lit facets) | `#8b98b0` |

### Element ramps (`d` dark / `m` mid / `l` light-accent / `g` glow)

| Element | d | m | l (UI accent) | g |
|---|---|---|---|---|
| fire | `#7a2d12` | `#b8491e` | `#e07b39` | `#ffc46b` |
| frost | `#1d5a74` | `#3a93b8` | `#5fc7e8` | `#c8f0ff` |
| nature | `#2a6231` | `#43974a` | `#63c464` | `#b4e89a` |
| storm | `#453a8f` | `#6a5bc7` | `#8f7ff2` | `#d3c8ff` |
| radiant | `#8a6a1f` | `#c4a13a` | `#f0d06a` | `#fff2b8` |
| shadow | `#471d66` | `#7a35b0` | `#9a4ad9` | `#d9a8ff` |
| neutral | `#4a4238` | `#6e6252` | `#9a8b72` | `#d8c9a8` |

The `l` tone doubles as THE element accent for UI/VFX (`ELEMENT_ACCENTS`).

### UI chrome

| Role | Hex |
|---|---|
| Panel fill | `#141a22` (alpha ~0.92) |
| Panel stroke | `#2c3a4a` |
| Neutral button | `#243140` |
| Confirm/upgrade button | `#2e5d3a` |
| Danger (sell/retry) | `#6b2f2f` |
| Specialization purple | `#4a3a66` |
| Mastery gold button | `#4a3a14` |
| Card fill | `#1a222c`, locked `#14181e` |
| Text | `#e8eef4`, dim `#8fa3b8`, faint `#5a6673` |
| Gold text | `#ffd97a`, good `#7ae0a3`, bad `#e07a7a`, info `#9fc2e8` |

## Shape language & sprite rules

- **Resolution:** towers 20×20, enemies 12×12, fx dots 5×5/3×3. Baked at
  `SPRITE_SCALE = 3` (nearest-neighbor) → 60px towers, 36px enemies.
- **Outline:** every silhouette carries a baked 1px `o` outline. No outline on
  pure-glow pixels (flames, halos) — glow reads as light, not matter.
- **Lighting:** light comes from the TOP-LEFT. `w`/`l` tones face up/left,
  `s`/`d` tones face down/right. Terrain hexes echo this with a top-left edge light.
- **Tower anatomy:** every tower stands on the SHARED STONE PLINTH occupying
  grid columns 3–16, rows 16–18, with a row-19 shadow line. Bodies are centered
  on columns 9–10 and never exceed rows 0–15. This guarantees tier overlays land
  on solid pixels for all towers.
- **Tier escalation (P9):** every upgrade step must read as a DRAMATIC change
  at battle zoom (playtest: gems alone were too subtle). Each tower has
  per-tower escalation overlays in `src/art/tierSprites.ts`, composed
  cumulatively: tier 1 = the tower's crown/apex grows (bigger flame, taller
  crystal, wider antlers…); tier 2 additionally gains flanking structures or a
  glow web (braziers, side shards, arc bridges…). The shared plinth gems
  (columns 5/14, rows 16–17) and tier-2 sigil (columns 9–10) remain on top as
  the tier "badge". Escalation overlays never touch rows 16–19 (plinth + gems
  own them) and must change ≥ 12 pixels per step (unit-tested). P11 ascensions
  add a third, full-transformation stage per specialization — see the
  Ascension escalation law below (its own module, not an extension of
  `TIER_ESCALATIONS`).
- **Ascension escalation law (P11):** an ascended sprite composes a
  full-height ARCHETYPE FRAME over the spec sprite, one frame per archetype —
  **heavy** (bulwark: shoulder ramparts flanking the whole body), **rapid**
  (spark crown: a storm of muzzle glints over the crown cascading down both
  flanks), **long-range** (beacon spire: a towering sight-beacon rising past
  the frame top on a wide glowing mast), **support** (halo: a grand double
  orbit ring around the upper body) — assigned per spec in
  `src/art/ascensionSprites.ts`'s `ASCENSION_ARCHETYPE`. The composed sprite
  must change **≥ 24 pixels** vs the spec sprite it ascends from — this
  EXCEEDS the tier law's ≥ 12 floor, because spec §4 calls the ascension the
  "most dramatic" transformation in the chain (unit-tested). Frames draw in
  the tower's own ramp (or the spec's accent ramp, via `accentRemap`, for
  hybrid/off-element specs) and never touch rows 16–19 — the plinth stays the
  spec sprite's, untouched (unit-tested). Distinctness across all 36
  ascensions is inherited from the spec layer beneath and unit-tested directly.
- **Neutral shape language (P11):** neutral towers are FIELDWORKS, not
  monoliths — engineering silhouettes (watchtower, mortar barrel, beacon
  pylon), drawn in the bronze-steel `neutral` ramp (`#4a4238`/`#6e6252`/
  `#9a8b72`/`#d8c9a8`, see the ramp table above), with more stone and timber
  mass than glow. Glow is reserved for the warden lantern and muzzle accents.
- **Specializations:** each of the 36 specs composites an accessory overlay onto
  the tier-2 sprite. Overlays follow four archetype conventions —
  **Heavy** (widened crown/reinforcement), **Rapid** (twin small
  prongs/nozzles), **Long-range** (tall thin rod/antenna above the body),
  **Support/Debuff** (floating ring or orbiting motes) — plus one unique motif
  each. Hybrid/off-element specs draw their overlay in the ACCENT element's ramp
  (e.g. Duskfire's shadow flames). Every composed spec sprite must be pairwise
  distinct (unit-tested).
- **Enemies:** archetype-first silhouettes — armored = wide + stone plates,
  swarm = tiny body, fast = sleek flame dart, stealth = hooded wisp rendered at
  alpha 0.35. Element ramp of the enemy's own element.
- **Bosses (P11):** 20×20 grids (`src/art/bossSprites.ts`), baked at
  `BOSS_SPRITE_SCALE = 4` → 80px, the largest actors in the game (towers 60px,
  enemies 36px). Silhouettes must dominate: full-frame mass (≥ 120
  non-transparent pixels, unit-tested — enemies average ~50), plus a readable
  "crown" motif unique per element — flame crown (Cinderlord), ice crest
  (Rimelord), bark shell/heartwood cage (Verdantheart), storm horns
  (Tempestcaller), halo ring (Luminarch), hood (Umbrageist). Element ramp of
  the boss's own element; `o` outline on matter, glow (`g`) left un-outlined
  as with all pure-light pixels. Bosses render above all other enemies on the
  board and carry a 48px on-sprite HP bar in addition to the Task 15 top-bar.

## VFX rules

- **Tracers:** two lines per shot — glow (element accent, alpha 0.25, width 5;
  7 for heavy sub-1/s towers) under a core (alpha 1, width 1.5; 3 heavy), both
  fading out in ~130ms. Dual-element towers alternate tracer color per shot.
- **Impacts:** 4-particle `fx-spark` burst at the hit point, tinted by the
  shot's element. **Deaths:** 8-particle `fx-dot` burst tinted by the ENEMY's element.
- **Rings:** range ring = element accent stroke (alpha ~0.55) + faint fill
  (0.04). Aura ring = element accent stroke 0.45 + fill 0.05 with a slow alpha
  pulse. Status underglow on enemies: burn `#ff8c3a`, poison `#7bd94a`,
  slow `#9adfff`, vulnerability `#d94ad9` at alpha 0.35.
- Decorative randomness (hex tones, scatter, pebbles) is SEEDED from the level
  id — identical every visit. `Math.random` is banned in render decoration.

## UI rules

- Panels: fill + 1px stroke from the chrome table; square corners; no drop shadows.
- Buttons: filled Text buttons with hover lighten (~+30% per channel), hand cursor.
- One accent color per widget; gold reserved for currency/mastery, element
  accents reserved for element identity.
- Sprite icons in UI use the baked textures (never re-drawn shapes).
- **Title screen:** procedural ember-hex vista (game terrain language + baked
  tower sprites), drifting motes. Wordmark: "SpireHex", 96px bold, fire accent
  `#e07b39` with a 10px `#0d1017` stroke (the baked-outline color at UI scale)
  — the one sanctioned use of an element accent as brand color. Menu buttons
  use standard chrome. No gradients, no drop shadows. Title music arrives P10;
  the hook point stays silent.
- **Level hints:** shown ONLY on levels that debut an enemy type (spec §6).
  Level card: one small line, 10px, info accent `#9fc2e8`, prefixed `Hint: `.
  Battle: quiet top-center chrome panel, 15px, fades out after ~6s, any tap
  dismisses, never a modal, never blocks input. Hint text ≤ 60 chars, one line.
