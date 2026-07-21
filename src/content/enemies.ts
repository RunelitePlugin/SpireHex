import type { EnemyDef } from './types';
import { deepFreeze } from './freeze';

export const ENEMIES: Record<string, EnemyDef> = deepFreeze({
  // The originals. P8 pacing rescale: LIGHT bounties halved (5→3, 6→3, 2→1)
  // because light counts doubled — income per wave stays ≈ baseline. Heavies
  // (stoneshell, duskstalker) keep counts AND bounties: doubling 2-life leakers
  // was measured to collapse level08 to 0/20 (see the P8 plan evidence table).
  gloomling: { id: 'gloomling', name: 'Gloomling', hp: 40, speed: 60, bounty: 3, livesCost: 1, element: 'shadow', armor: 0 },
  // Armored: shrugs flat damage off its bark plates; storm (vs nature) or radiant pierce crack it.
  stoneshell: { id: 'stoneshell', name: 'Stoneshell', hp: 140, speed: 38, bounty: 12, livesCost: 2, element: 'nature', armor: 5 },
  // Fast: a streaking mote of flame — frost towers both out-damage (1.5x) and slow it.
  cinderwisp: { id: 'cinderwisp', name: 'Cinderwisp', hp: 30, speed: 115, bounty: 3, livesCost: 1, element: 'fire', armor: 0 },
  // Swarm: cheap icy chaff that arrives in bulk — chain and burn splash chew through it.
  frostmite: { id: 'frostmite', name: 'Frostmite', hp: 14, speed: 75, bounty: 1, livesCost: 1, element: 'frost', armor: 0 },
  // Stealth: only radiant (pierce) towers can target it.
  duskstalker: { id: 'duskstalker', name: 'Duskstalker', hp: 100, speed: 55, bounty: 15, livesCost: 2, element: 'shadow', armor: 2, stealth: true },

  // ---- P12 Frostfell family (biome 2, levels 11-20). The player enters with
  // the earned Ember Spire (fire 1.5x vs frost) plus the neutral triad, so
  // frost bodies run tougher than their biome-1 counterparts.
  // Swarm: powder-snow chaff — a step up from frostmite in bulk and count.
  driftmote: { id: 'driftmote', name: 'Driftmote', hp: 24, speed: 80, bounty: 1, livesCost: 1, element: 'frost', armor: 0 },
  // Fast: a sprinting shard-wolf — fire melts it, neutrals struggle to track it.
  icefang: { id: 'icefang', name: 'Icefang', hp: 56, speed: 120, bounty: 3, livesCost: 1, element: 'frost', armor: 0 },
  // Armored: a glacier-plated crawler; armor 8 blunts splash falloff hits.
  glacierback: { id: 'glacierback', name: 'Glacierback', hp: 300, speed: 34, bounty: 16, livesCost: 2, element: 'frost', armor: 8 },
  // Stealth: a blizzard phantom — wardens (or radiant, later) reveal it.
  rimewraith: { id: 'rimewraith', name: 'Rimewraith', hp: 170, speed: 50, bounty: 18, livesCost: 2, element: 'frost', armor: 2, stealth: true },
  // Bruiser (new role this biome): unarmored mass — raw hp instead of plates.
  frostbrand: { id: 'frostbrand', name: 'Frostbrand', hp: 420, speed: 44, bounty: 20, livesCost: 2, element: 'frost', armor: 0 },

  // ---- P12 Verdant Deep family (biome 3, levels 21-30). No 1.5x answer exists
  // yet (storm unlocks in biome 4), so nature bodies lean on the frost tower's
  // slow utility and tighter play rather than bigger multipliers.
  // Swarm: fungal chaff that arrives in sheets.
  sporeling: { id: 'sporeling', name: 'Sporeling', hp: 24, speed: 78, bounty: 1, livesCost: 1, element: 'nature', armor: 0 },
  // Fast: a bounding briar-hound with a bark hide.
  thornhound: { id: 'thornhound', name: 'Thornhound', hp: 60, speed: 115, bounty: 4, livesCost: 1, element: 'nature', armor: 1 },
  // Armored: living bark over heartwood — the toughest plates yet.
  barkhide: { id: 'barkhide', name: 'Barkhide', hp: 240, speed: 30, bounty: 20, livesCost: 2, element: 'nature', armor: 8 },
  // Stealth: a dappled shade slipping between the trunks.
  gladeshade: { id: 'gladeshade', name: 'Gladeshade', hp: 150, speed: 52, bounty: 22, livesCost: 2, element: 'nature', armor: 3, stealth: true },
  // Bruiser: a swamp-heavy colossus; 3-life leaks make ignoring it expensive.
  mirehulk: { id: 'mirehulk', name: 'Mirehulk', hp: 360, speed: 40, bounty: 26, livesCost: 3, element: 'nature', armor: 2 },

  // ---- P13 Storm Reach family (biome 4, levels 31-40). The player enters with
  // the earned Thorn Totem (nature 1.5x vs storm) plus ember/frost and the
  // neutral triad — storm bodies run tougher AND faster (the biome's flavor is
  // speed; every role outpaces its frost/verdant counterpart).
  // Swarm: crackling static chaff that arrives in rolling sheets.
  sparkmote: { id: 'sparkmote', name: 'Sparkmote', hp: 30, speed: 90, bounty: 1, livesCost: 1, element: 'storm', armor: 0 },
  // Fast: a wind-runner — the fastest non-boss in the game; slows are the answer.
  galestrider: { id: 'galestrider', name: 'Galestrider', hp: 66, speed: 130, bounty: 4, livesCost: 1, element: 'storm', armor: 0 },
  // Armored: a storm-bison sheathed in fulgurite plates — the heaviest armor yet.
  thunderhide: { id: 'thunderhide', name: 'Thunderhide', hp: 340, speed: 36, bounty: 22, livesCost: 2, element: 'storm', armor: 9 },
  // Stealth: a squall phantom walking inside its own mist — and quick about it.
  mistwalker: { id: 'mistwalker', name: 'Mistwalker', hp: 190, speed: 60, bounty: 24, livesCost: 2, element: 'storm', armor: 2, stealth: true },
  // Bruiser: a walking thunderhead of packed galewind — raw mass at speed.
  stormbrute: { id: 'stormbrute', name: 'Stormbrute', hp: 460, speed: 46, bounty: 28, livesCost: 2, element: 'storm', armor: 0 },

  // ---- P13 Radiant Summits family (biome 5, levels 41-50). No 1.5x answer
  // exists yet (shadow unlocks in biome 6), so radiant bodies lean on the
  // player's four-element toolkit (slow, poison spread, chain) — the biome's
  // flavor is light and SHIELDS: heavy plates, dazzling stealth, 3-life mass.
  // Swarm: drifting flecks of hard light.
  lumenmote: { id: 'lumenmote', name: 'Lumenmote', hp: 32, speed: 84, bounty: 1, livesCost: 1, element: 'radiant', armor: 0 },
  // Fast: a streak of sunrise — chain lightning tracks what bolts cannot.
  raywisp: { id: 'raywisp', name: 'Raywisp', hp: 76, speed: 125, bounty: 4, livesCost: 1, element: 'radiant', armor: 0 },
  // Armored: a mirror-shield phalanx of one — armor 10, the hardest plates in the game.
  aegisbearer: { id: 'aegisbearer', name: 'Aegisbearer', hp: 360, speed: 32, bounty: 24, livesCost: 2, element: 'radiant', armor: 10 },
  // Stealth: a seraph wrapped in blinding veils — too bright to look at.
  veilseraph: { id: 'veilseraph', name: 'Veilseraph', hp: 210, speed: 54, bounty: 26, livesCost: 2, element: 'radiant', armor: 3, stealth: true },
  // Bruiser: a grazing colossus of molten daylight; 3-life leaks punish neglect.
  sungrazer: { id: 'sungrazer', name: 'Sungrazer', hp: 520, speed: 42, bounty: 30, livesCost: 3, element: 'radiant', armor: 2 },

  // ---- P14 Umbral Depths family (biome 6, levels 51-60). The campaign
  // finale biome. The player enters with the earned Sun Shrine (radiant 1.5x
  // vs shadow — pierce also sees through stealth), mirroring biome 2's
  // enter-with-the-counter pattern. The biome's flavor is DARKNESS: the
  // heaviest stealth pressure in the game, and the toughest bodies.
  // Swarm: flecks of living dark that pour in from the walls.
  voidmote: { id: 'voidmote', name: 'Voidmote', hp: 36, speed: 88, bounty: 1, livesCost: 1, element: 'shadow', armor: 0 },
  // Fast: a night-flier on silent wings — chill it or chain it.
  gloomwing: { id: 'gloomwing', name: 'Gloomwing', hp: 84, speed: 128, bounty: 4, livesCost: 1, element: 'shadow', armor: 0 },
  // Armored: a hollow carapace packed with dark — plates match the Aegisbearer's.
  umbrahusk: { id: 'umbrahusk', name: 'Umbra Husk', hp: 430, speed: 32, bounty: 26, livesCost: 2, element: 'shadow', armor: 10 },
  // Stealth: the game's toughest stealth walker — wards or radiant pierce see it.
  nullwraith: { id: 'nullwraith', name: 'Nullwraith', hp: 240, speed: 56, bounty: 28, livesCost: 2, element: 'shadow', armor: 3, stealth: true },
  // Bruiser: a walking abyss of teeth; 3-life leaks end runs.
  dreadmaw: { id: 'dreadmaw', name: 'Dreadmaw', hp: 560, speed: 40, bounty: 32, livesCost: 3, element: 'shadow', armor: 2 },

  // ---- P11 bosses (spec §5). One per biome finale. Multi-life leaks, heavy bounties.
  // Flame wisp: the Cinderlord's split spawn; also fielded as level10 escorts.
  flamewisp: { id: 'flamewisp', name: 'Flame Wisp', hp: 70, speed: 95, bounty: 4, livesCost: 1, element: 'fire', armor: 0 },
  // BALANCE-LOCKED (P11 prototype): hp 3000 is the measured knee — the focused
  // scripted build kills it with 10/20 lives; an unfocused build survives the
  // 5-life leak at 4-9. Splits at 66%/33% into 5 then 7 wisps.
  cinderlord: {
    id: 'cinderlord', name: 'The Cinderlord', hp: 3000, speed: 30, bounty: 200, livesCost: 5,
    element: 'fire', armor: 4,
    boss: { abilities: [
      { trigger: { kind: 'hpThreshold', pct: 0.66 }, effect: { kind: 'split', spawnId: 'flamewisp', count: 5 } },
      { trigger: { kind: 'hpThreshold', pct: 0.33 }, effect: { kind: 'split', spawnId: 'flamewisp', count: 7 } },
    ] },
  },
  // BALANCE-LOCKED (P12 prototype): hp 3800 is the measured knee — the gate-castle
  // scripted build kills it at 14/20; a road-line build leaks it (each freeze catches
  // the towers the boss is walking past) yet survives at 9/20. Freeze 210/220/75
  // replaced the P11 provisional 240/180/60, which never punished clustering.
  rimelord: {
    id: 'rimelord', name: 'The Rimelord', hp: 3800, speed: 26, bounty: 260, livesCost: 5,
    element: 'frost', armor: 6,
    boss: { abilities: [
      { trigger: { kind: 'timer', periodTicks: 210 }, effect: { kind: 'freezeTowers', radius: 220, durationTicks: 75 } },
    ] },
  },
  // BALANCE-LOCKED (P12 prototype): hp 4600 — at 5200+ the boss healed out on the
  // exit doorstep (regen 40/s beats out-of-range dps); the winnability build's exit
  // Marksman kills at 16/20, the unfocused build leak-tanks at 13/20. Adds are the
  // biome's own swarm (P11 fielded a stoneshell placeholder).
  verdantheart: {
    id: 'verdantheart', name: 'The Verdantheart', hp: 4600, speed: 24, bounty: 280, livesCost: 5,
    element: 'nature', armor: 3,
    boss: { abilities: [
      { trigger: { kind: 'timer', periodTicks: 30 }, effect: { kind: 'regen', amount: 40 } },
      { trigger: { kind: 'hpThreshold', pct: 0.75 }, effect: { kind: 'spawnAdds', spawnId: 'sporeling', count: 6 } },
      { trigger: { kind: 'hpThreshold', pct: 0.5 }, effect: { kind: 'spawnAdds', spawnId: 'sporeling', count: 6 } },
      { trigger: { kind: 'hpThreshold', pct: 0.25 }, effect: { kind: 'spawnAdds', spawnId: 'sporeling', count: 8 } },
    ] },
  },
  // BALANCE-LOCKED (P13 prototype): hp 3400 sits BELOW the Rimelord's 3800 on
  // purpose — the "blink tax": timer blinks advance pathDist directly, cannot be
  // slowed, and cut road exposure ~40%. The freeze-gate scripted build kills it
  // at 14/20; the same castle without its Deep Freeze pair leaks it at 543 hp.
  // Blink 180/130 replaced the P11 provisional 150/120.
  tempestcaller: {
    id: 'tempestcaller', name: 'The Tempestcaller', hp: 3400, speed: 30, bounty: 300, livesCost: 5,
    element: 'storm', armor: 2,
    boss: { abilities: [
      { trigger: { kind: 'timer', periodTicks: 180 }, effect: { kind: 'blink', distance: 130 } },
    ] },
  },
  // BALANCE-LOCKED (P13 prototype): hp 6200, shield 60/180 ticks (33% immune
  // uptime; P11 provisional 5600/45 superseded). Shield windows PAUSE DoT timers
  // (simulation.ts:735) — burn/poison resume with time remaining, NOT purged, so
  // DoT builds keep nearly full value and this hp accounts for it. The Deep-Freeze
  // outlast build kills at 14/20 through 14 shield windows; the same build without
  // slow leaks it at 3047 hp — vs a WALKING boss, slow recovers ~3000 hp of
  // exposure (vs ~840 vs the blinker: the finales teach opposite toolkit ends).
  luminarch: {
    id: 'luminarch', name: 'The Luminarch', hp: 6200, speed: 26, bounty: 320, livesCost: 5,
    element: 'radiant', armor: 3,
    boss: { abilities: [
      { trigger: { kind: 'timer', periodTicks: 180 }, effect: { kind: 'shield', durationTicks: 60 } },
    ] },
  },
  // BALANCE-LOCKED (P14 prototype): hp 6000 sits BELOW the Luminarch's 6200 on
  // purpose — the "darkness tax" is asymmetric. Measured at seed 1: the boss's
  // 10 stealth windows deny ~1196 hp of boss damage to a burst-targeting castle
  // (it leaks the boss at 2047 hp) and the two curses deny ~382 more, while a
  // pierce/DoT castle loses almost nothing (pierce targets through stealth;
  // DoT applied while visible keeps ticking). The reveal castle kills it at
  // 15/20; the identical castle with its one pierce tower swapped for neutral
  // burst survives at 6/20 but CANNOT kill; a castle with no reveal at all
  // LOSES outright. stealthPhase 210/60 and curseTowers 200/0.5/90 retained
  // from P11 — measured real and priced into the hp (provisional 5400 superseded).
  umbrageist: {
    id: 'umbrageist', name: 'The Umbrageist', hp: 6000, speed: 30, bounty: 300, livesCost: 5,
    element: 'shadow', armor: 2,
    boss: { abilities: [
      { trigger: { kind: 'timer', periodTicks: 210 }, effect: { kind: 'stealthPhase', durationTicks: 60 } },
      { trigger: { kind: 'hpThreshold', pct: 0.66 }, effect: { kind: 'curseTowers', radius: 200, damageFactor: 0.5, durationTicks: 90 } },
      { trigger: { kind: 'hpThreshold', pct: 0.33 }, effect: { kind: 'curseTowers', radius: 200, damageFactor: 0.5, durationTicks: 90 } },
    ] },
  },
});
