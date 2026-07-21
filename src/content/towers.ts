import type { TowerDef } from './types';
import { deepFreeze } from './freeze';

// P8 pacing rescale: every fireRate ×2 (except sunBeacon's dead placeholder —
// aura towers never shoot) and every burn/poison dps ×2 so DoT identity keeps
// pace with direct DPS. Rate-independent knobs (slow/chain/curse/aura params,
// damage, range, cost) untouched (measured pre/post pacing table in the phase-8 balance notes).
export const TOWERS: Record<string, TowerDef> = deepFreeze({
  emberSpire: {
    id: 'emberSpire', name: 'Ember Spire', element: 'fire',
    cost: 100, range: 150, damage: 12, fireRate: 3,
    mechanic: { kind: 'burn', dps: 12, duration: 3 },
    tiers: [
      { cost: 80, damage: 18, range: 160, fireRate: 3.2, mechanic: { kind: 'burn', dps: 20, duration: 3 } },
      { cost: 160, damage: 26, range: 170, fireRate: 3.6, mechanic: { kind: 'burn', dps: 32, duration: 4 } },
    ],
    specializations: [
      // Artillery: huge slow shells, long reach.
      { id: 'emberMagmaMortar', name: 'Magma Mortar', cost: 240, damage: 90, range: 230, fireRate: 1,
        mechanic: { kind: 'burn', dps: 40, duration: 4 },
        ascension: { id: 'ascCalderaEngine', name: 'Caldera Engine', cost: 380, damage: 160, range: 250, fireRate: 1.1,
          mechanic: { kind: 'burn', dps: 70, duration: 4 } } },
      // Flamethrower: point-blank shredder, burn refreshed constantly.
      { id: 'emberFlamelash', name: 'Flamelash', cost: 200, damage: 9, range: 130, fireRate: 12,
        mechanic: { kind: 'burn', dps: 48, duration: 2 },
        ascension: { id: 'ascInfernoLash', name: 'Inferno Lash', cost: 340, damage: 14, range: 140, fireRate: 16,
          mechanic: { kind: 'burn', dps: 90, duration: 2 } } },
      // Meteor caller: heavy hits, ferocious burn.
      { id: 'emberMeteorCaller', name: 'Meteor Caller', cost: 220, damage: 40, range: 180, fireRate: 2.4,
        mechanic: { kind: 'burn', dps: 80, duration: 3 },
        ascension: { id: 'ascStarfallCrown', name: 'Starfall Crown', cost: 400, damage: 70, range: 200, fireRate: 2.6,
          mechanic: { kind: 'burn', dps: 140, duration: 3 } } },
      // THE dual-element hybrid: alternates fire and shadow every shot.
      { id: 'emberDuskfire', name: 'Duskfire', cost: 260, damage: 34, range: 175, fireRate: 3.8,
        mechanic: { kind: 'dualElement', elements: ['fire', 'shadow'] },
        ascension: { id: 'ascEclipsePyre', name: 'Eclipse Pyre', cost: 420, damage: 55, range: 185, fireRate: 4.2 } },
    ],
  },
  frostObelisk: {
    id: 'frostObelisk', name: 'Frost Obelisk', element: 'frost',
    cost: 90, range: 140, damage: 8, fireRate: 2.4,
    mechanic: { kind: 'slow', factor: 0.6, duration: 1.5 },
    tiers: [
      { cost: 70, damage: 12, range: 150, fireRate: 2.6, mechanic: { kind: 'slow', factor: 0.5, duration: 2 } },
      { cost: 140, damage: 17, range: 160, fireRate: 2.8, mechanic: { kind: 'slow', factor: 0.4, duration: 2.5 } },
    ],
    specializations: [
      // Deeper slow: enemies crawl at 20% speed.
      { id: 'frostDeepFreeze', name: 'Deep Freeze', cost: 190, damage: 20, range: 165, fireRate: 2.8,
        mechanic: { kind: 'slow', factor: 0.2, duration: 3 },
        ascension: { id: 'ascAbsoluteZero', name: 'Absolute Zero', cost: 360, damage: 34, range: 175, fireRate: 3.0,
          mechanic: { kind: 'slow', factor: 0.12, duration: 3.5 } } },
      // Heavy single hits, milder chill.
      { id: 'frostGlacierCore', name: 'Glacier Core', cost: 230, damage: 46, range: 160, fireRate: 1.8,
        mechanic: { kind: 'slow', factor: 0.5, duration: 2 },
        ascension: { id: 'ascGlacialTitan', name: 'Glacial Titan', cost: 380, damage: 85, range: 170, fireRate: 2.0 } },
      // AoE nova transform: frost arcs between packed enemies (chain).
      { id: 'frostNova', name: 'Frost Nova', cost: 220, damage: 24, range: 150, fireRate: 2.6,
        mechanic: { kind: 'chain', targets: 5, radius: 100, falloff: 0.75 },
        ascension: { id: 'ascWhiteoutNova', name: 'Whiteout Nova', cost: 390, damage: 40, range: 160, fireRate: 2.8,
          mechanic: { kind: 'chain', targets: 7, radius: 130, falloff: 0.8 } } },
      // Rapid chill applicator with long reach.
      { id: 'frostPermafrost', name: 'Permafrost Beam', cost: 180, damage: 10, range: 175, fireRate: 7,
        mechanic: { kind: 'slow', factor: 0.35, duration: 1.5 },
        ascension: { id: 'ascPermafrostLattice', name: 'Permafrost Lattice', cost: 340, damage: 16, range: 190, fireRate: 9,
          mechanic: { kind: 'slow', factor: 0.3, duration: 2 } } },
    ],
  },
  thornTotem: {
    id: 'thornTotem', name: 'Thorn Totem', element: 'nature',
    cost: 110, range: 130, damage: 9, fireRate: 2,
    mechanic: { kind: 'poison', dps: 14, duration: 4, spreadRadius: 100 },
    tiers: [
      { cost: 85, damage: 13, range: 140, fireRate: 2.2, mechanic: { kind: 'poison', dps: 22, duration: 4, spreadRadius: 110 } },
      { cost: 170, damage: 19, range: 150, fireRate: 2.4, mechanic: { kind: 'poison', dps: 32, duration: 5, spreadRadius: 130 } },
    ],
    specializations: [
      // Epidemic poison: hotter, longer, spreads much further on death.
      { id: 'thornPlaguebearer', name: 'Plaguebearer', cost: 210, damage: 22, range: 155, fireRate: 2.4,
        mechanic: { kind: 'poison', dps: 60, duration: 6, spreadRadius: 170 },
        ascension: { id: 'ascPandemicHeart', name: 'Pandemic Heart', cost: 400, damage: 34, range: 165, fireRate: 2.6,
          mechanic: { kind: 'poison', dps: 110, duration: 6, spreadRadius: 220 } } },
      // Raw piercing thorns: big direct damage, poison as a garnish.
      { id: 'thornBriarheart', name: 'Briarheart', cost: 230, damage: 52, range: 145, fireRate: 2,
        mechanic: { kind: 'poison', dps: 36, duration: 4, spreadRadius: 130 },
        ascension: { id: 'ascBriarColossus', name: 'Briar Colossus', cost: 380, damage: 90, range: 155, fireRate: 2.2,
          mechanic: { kind: 'poison', dps: 60, duration: 4, spreadRadius: 150 } } },
      // Long-range sniper vines.
      { id: 'thornVerdantWard', name: 'Verdant Ward', cost: 200, damage: 34, range: 230, fireRate: 1.6,
        mechanic: { kind: 'poison', dps: 40, duration: 5, spreadRadius: 140 },
        ascension: { id: 'ascWorldrootEye', name: 'Worldroot Eye', cost: 360, damage: 55, range: 260, fireRate: 1.8,
          mechanic: { kind: 'poison', dps: 70, duration: 5, spreadRadius: 160 } } },
      // Roots transform: nature's other signature — grasping roots that slow hard.
      { id: 'thornRoots', name: 'Strangling Roots', cost: 190, damage: 24, range: 150, fireRate: 2.8,
        mechanic: { kind: 'slow', factor: 0.3, duration: 2 },
        ascension: { id: 'ascStranglegrove', name: 'Stranglegrove', cost: 350, damage: 38, range: 160, fireRate: 3.0,
          mechanic: { kind: 'slow', factor: 0.22, duration: 2.5 } } },
    ],
  },
  stormPylon: {
    id: 'stormPylon', name: 'Storm Pylon', element: 'storm',
    cost: 120, range: 160, damage: 11, fireRate: 2.2,
    mechanic: { kind: 'chain', targets: 2, radius: 120, falloff: 0.6 },
    tiers: [
      { cost: 95, damage: 16, range: 170, fireRate: 2.4, mechanic: { kind: 'chain', targets: 3, radius: 130, falloff: 0.65 } },
      { cost: 190, damage: 23, range: 180, fireRate: 2.6, mechanic: { kind: 'chain', targets: 4, radius: 140, falloff: 0.7 } },
    ],
    specializations: [
      // More chains: seven arcs with barely any falloff.
      { id: 'stormTempestCoil', name: 'Tempest Coil', cost: 240, damage: 26, range: 185, fireRate: 2.6,
        mechanic: { kind: 'chain', targets: 7, radius: 170, falloff: 0.85 },
        ascension: { id: 'ascMaelstromCoil', name: 'Maelstrom Coil', cost: 400, damage: 42, range: 195, fireRate: 2.8,
          mechanic: { kind: 'chain', targets: 9, radius: 190, falloff: 0.9 } } },
      // Single-target burst transform: one colossal bolt, no chains.
      { id: 'stormThunderlance', name: 'Thunderlance', cost: 230, damage: 85, range: 200, fireRate: 1.8,
        mechanic: { kind: 'none' },
        ascension: { id: 'ascHeavensLance', name: "Heaven's Lance", cost: 390, damage: 150, range: 220, fireRate: 2.0 } },
      // Crackling rapid fire with tier-2-reach short chains.
      { id: 'stormStaticField', name: 'Static Field', cost: 230, damage: 12, range: 160, fireRate: 6,
        mechanic: { kind: 'chain', targets: 3, radius: 140, falloff: 0.65 },
        ascension: { id: 'ascIonStorm', name: 'Ion Storm', cost: 360, damage: 18, range: 170, fireRate: 8,
          mechanic: { kind: 'chain', targets: 4, radius: 150, falloff: 0.7 } } },
      // All-around overload.
      { id: 'stormOvercharge', name: 'Overcharge', cost: 210, damage: 40, range: 190, fireRate: 3,
        mechanic: { kind: 'chain', targets: 4, radius: 150, falloff: 0.75 },
        ascension: { id: 'ascOverlordCore', name: 'Overlord Core', cost: 380, damage: 65, range: 200, fireRate: 3.4,
          mechanic: { kind: 'chain', targets: 5, radius: 160, falloff: 0.8 } } },
    ],
  },
  sunShrine: {
    id: 'sunShrine', name: 'Sun Shrine', element: 'radiant',
    cost: 110, range: 150, damage: 12, fireRate: 2.6,
    mechanic: { kind: 'pierce' },
    // No tier mechanic overrides: pierce carries through both tiers (stat upgrades only).
    tiers: [
      { cost: 85, damage: 18, range: 160, fireRate: 2.8 },
      { cost: 170, damage: 26, range: 170, fireRate: 3 },
    ],
    specializations: [
      // THE aura support: stops shooting entirely, hastens every tower within 200 units by 30%.
      { id: 'sunBeacon', name: 'Radiant Beacon', cost: 220, damage: 0, range: 0, fireRate: 0, // never shoots — aura support; 0 is honest (P8 note closed)
        mechanic: { kind: 'aura', radius: 200, fireRateBonus: 0.3 },
        ascension: { id: 'ascDawnCitadel', name: 'Dawn Citadel', cost: 380, damage: 0, range: 0, fireRate: 0,
          mechanic: { kind: 'aura', radius: 260, fireRateBonus: 0.45 } } },
      // Piercing sniper: enormous reach.
      { id: 'sunLance', name: 'Sunlance', cost: 240, damage: 70, range: 260, fireRate: 1.4,
        mechanic: { kind: 'pierce' },
        ascension: { id: 'ascSolarLance', name: 'Solar Lance', cost: 390, damage: 115, range: 290, fireRate: 1.6 } },
      // Rapid-fire pierce for swarm shredding.
      { id: 'sunZenithRay', name: 'Zenith Ray', cost: 230, damage: 16, range: 180, fireRate: 6.4,
        mechanic: { kind: 'pierce' },
        ascension: { id: 'ascZenithCascade', name: 'Zenith Cascade', cost: 370, damage: 26, range: 190, fireRate: 8.5 } },
      // Straight upgrade: heavy piercing judgement.
      { id: 'sunJudgement', name: 'Judgement', cost: 250, damage: 44, range: 190, fireRate: 3,
        mechanic: { kind: 'pierce' },
        ascension: { id: 'ascFinalJudgement', name: 'Final Judgement', cost: 400, damage: 75, range: 200, fireRate: 3.4 } },
    ],
  },
  umbraMonolith: {
    id: 'umbraMonolith', name: 'Umbra Monolith', element: 'shadow',
    cost: 130, range: 140, damage: 9, fireRate: 2,
    mechanic: { kind: 'curse', currentHpPct: 0.05, vulnMultiplier: 1.2, vulnDuration: 3 },
    tiers: [
      { cost: 100, damage: 13, range: 150, fireRate: 2.2, mechanic: { kind: 'curse', currentHpPct: 0.07, vulnMultiplier: 1.3, vulnDuration: 3 } },
      { cost: 200, damage: 18, range: 160, fireRate: 2.4, mechanic: { kind: 'curse', currentHpPct: 0.1, vulnMultiplier: 1.4, vulnDuration: 4 } },
    ],
    specializations: [
      // Boss-killer: savage percent-of-current-hp bites.
      { id: 'umbraReapersMark', name: "Reaper's Mark", cost: 250, damage: 20, range: 165, fireRate: 2.2,
        mechanic: { kind: 'curse', currentHpPct: 0.18, vulnMultiplier: 1.5, vulnDuration: 4 },
        ascension: { id: 'ascDeathsHerald', name: "Death's Herald", cost: 420, damage: 32, range: 175, fireRate: 2.6,
          mechanic: { kind: 'curse', currentHpPct: 0.24, vulnMultiplier: 1.6, vulnDuration: 4 } } },
      // Debuff support: modest damage, ruinous 1.8× vulnerability for allies to exploit.
      { id: 'umbraHexweaver', name: 'Hexweaver', cost: 210, damage: 14, range: 175, fireRate: 3.2,
        mechanic: { kind: 'curse', currentHpPct: 0.08, vulnMultiplier: 1.8, vulnDuration: 5 },
        ascension: { id: 'ascWovenNight', name: 'Woven Night', cost: 380, damage: 22, range: 185, fireRate: 3.6,
          mechanic: { kind: 'curse', currentHpPct: 0.1, vulnMultiplier: 2.2, vulnDuration: 5 } } },
      // Raw void damage.
      { id: 'umbraVoidSpike', name: 'Void Spike', cost: 230, damage: 55, range: 160, fireRate: 1.8,
        mechanic: { kind: 'curse', currentHpPct: 0.06, vulnMultiplier: 1.3, vulnDuration: 3 },
        ascension: { id: 'ascVoidMonarch', name: 'Void Monarch', cost: 390, damage: 95, range: 170, fireRate: 2.0,
          mechanic: { kind: 'curse', currentHpPct: 0.08, vulnMultiplier: 1.35, vulnDuration: 3 } } },
      // Fast stacking dusk bolts: raw DPS toned down, curse restored above tier 2 on every axis.
      { id: 'umbraNightfall', name: 'Nightfall', cost: 230, damage: 10, range: 170, fireRate: 4.4,
        mechanic: { kind: 'curse', currentHpPct: 0.11, vulnMultiplier: 1.45, vulnDuration: 4 },
        ascension: { id: 'ascMidnightReign', name: 'Midnight Reign', cost: 380, damage: 16, range: 180, fireRate: 5.2,
          mechanic: { kind: 'curse', currentHpPct: 0.13, vulnMultiplier: 1.5, vulnDuration: 4 } } },
    ],
  },
  // ---- P11 neutral starters (spec §4). Prices are prototype-locked: the
  // economy landings (spec at waves 4/3/2 on levels 02-04) and every campaign
  // margin were measured against EXACTLY these numbers. Evidence: P11 plan.
  watchSentry: {
    id: 'watchSentry', name: 'Watch Sentry', element: 'neutral',
    cost: 70, range: 150, damage: 8, fireRate: 4,
    mechanic: { kind: 'none' },
    tiers: [
      { cost: 60, damage: 12, range: 160, fireRate: 4.4 },
      { cost: 120, damage: 18, range: 170, fireRate: 4.8 },
    ],
    specializations: [
      // Rapid: a wall of small bolts for chaff.
      { id: 'sentryGatling', name: 'Gatling Post', cost: 200, damage: 10, range: 160, fireRate: 11,
        mechanic: { kind: 'none' },
        ascension: { id: 'ascStormOfBolts', name: 'Storm of Bolts', cost: 340, damage: 14, range: 170, fireRate: 15 } },
      // Long-range: whole-board overwatch.
      { id: 'sentryLongshot', name: 'Longshot Perch', cost: 210, damage: 48, range: 270, fireRate: 1.6,
        mechanic: { kind: 'none' },
        ascension: { id: 'ascHorizonPiercer', name: 'Horizon Piercer', cost: 350, damage: 80, range: 320, fireRate: 1.7 } },
      // Heavy: single big bolts that shrug armor by sheer size.
      { id: 'sentryMarksman', name: 'Marksman Nest', cost: 230, damage: 85, range: 200, fireRate: 1.6,
        mechanic: { kind: 'none' },
        ascension: { id: 'ascDeadeyeCitadel', name: 'Deadeye Citadel', cost: 380, damage: 150, range: 210, fireRate: 1.7 } },
      // Balanced overdrive.
      { id: 'sentryOverdrive', name: 'Overdrive Turret', cost: 220, damage: 22, range: 180, fireRate: 5.5,
        mechanic: { kind: 'none' },
        ascension: { id: 'ascOverclockedBastion', name: 'Overclocked Bastion', cost: 360, damage: 36, range: 190, fireRate: 6.5 } },
    ],
  },
  boulderMortar: {
    id: 'boulderMortar', name: 'Boulder Mortar', element: 'neutral',
    cost: 120, range: 170, damage: 30, fireRate: 0.8,
    mechanic: { kind: 'splash', radius: 60, falloff: 0.5 },
    tiers: [
      { cost: 90, damage: 46, range: 180, fireRate: 0.9, mechanic: { kind: 'splash', radius: 70, falloff: 0.5 } },
      { cost: 180, damage: 66, range: 190, fireRate: 1.0, mechanic: { kind: 'splash', radius: 80, falloff: 0.55 } },
    ],
    specializations: [
      // Heavy: one colossal shell.
      { id: 'mortarColossus', name: 'Colossus Mortar', cost: 240, damage: 130, range: 200, fireRate: 0.6,
        mechanic: { kind: 'splash', radius: 90, falloff: 0.6 },
        ascension: { id: 'ascWorldbreaker', name: 'Worldbreaker', cost: 400, damage: 220, range: 210, fireRate: 0.65,
          mechanic: { kind: 'splash', radius: 100, falloff: 0.65 } } },
      // Swarm eraser: huge blast, gentle falloff.
      { id: 'mortarClusterRain', name: 'Cluster Rain', cost: 220, damage: 36, range: 180, fireRate: 1.2,
        mechanic: { kind: 'splash', radius: 120, falloff: 0.7 },
        ascension: { id: 'ascMeteorCarpet', name: 'Meteor Carpet', cost: 390, damage: 55, range: 190, fireRate: 1.35,
          mechanic: { kind: 'splash', radius: 140, falloff: 0.75 } } },
      // Long-range siege.
      { id: 'mortarLongarm', name: 'Longarm Battery', cost: 210, damage: 70, range: 260, fireRate: 0.8,
        mechanic: { kind: 'splash', radius: 80, falloff: 0.5 },
        ascension: { id: 'ascLeviathanGun', name: 'Leviathan Gun', cost: 370, damage: 115, range: 300, fireRate: 0.85,
          mechanic: { kind: 'splash', radius: 90, falloff: 0.55 } } },
      // Rapid thumper.
      { id: 'mortarQuake', name: 'Quake Thumper', cost: 190, damage: 30, range: 170, fireRate: 2.0,
        mechanic: { kind: 'splash', radius: 70, falloff: 0.5 },
        ascension: { id: 'ascTectonicHammer', name: 'Tectonic Hammer', cost: 350, damage: 48, range: 180, fireRate: 2.2,
          mechanic: { kind: 'splash', radius: 80, falloff: 0.55 } } },
    ],
  },
  wardenBeacon: {
    id: 'wardenBeacon', name: 'Warden Beacon', element: 'neutral',
    cost: 90, range: 0, damage: 0, fireRate: 0, // never shoots — ward support
    mechanic: { kind: 'ward', revealRadius: 140, goldPerWave: 15 },
    tiers: [
      { cost: 70, damage: 0, range: 0, fireRate: 0, mechanic: { kind: 'ward', revealRadius: 170, goldPerWave: 25 } },
      { cost: 150, damage: 0, range: 0, fireRate: 0, mechanic: { kind: 'ward', revealRadius: 200, goldPerWave: 40 } },
    ],
    specializations: [
      // Economy: a golden idol that pays for the war.
      { id: 'wardenGoldgaze', name: 'Goldgaze Idol', cost: 180, damage: 0, range: 0, fireRate: 0,
        mechanic: { kind: 'ward', revealRadius: 200, goldPerWave: 80 },
        ascension: { id: 'ascMidasThrone', name: 'Midas Throne', cost: 360, damage: 0, range: 0, fireRate: 0,
          mechanic: { kind: 'ward', revealRadius: 220, goldPerWave: 140 } } },
      // Reveal: half the board holds no shadows.
      { id: 'wardenFarbeacon', name: 'Farbeacon', cost: 190, damage: 0, range: 0, fireRate: 0,
        mechanic: { kind: 'ward', revealRadius: 340, goldPerWave: 40 },
        ascension: { id: 'ascAllseeingSpire', name: 'All-Seeing Spire', cost: 340, damage: 0, range: 0, fireRate: 0,
          mechanic: { kind: 'ward', revealRadius: 500, goldPerWave: 70 } } },
      // Support transform: the neutral aura option (fire-rate banner).
      { id: 'wardenWarBanner', name: 'War Banner', cost: 220, damage: 0, range: 0, fireRate: 0,
        mechanic: { kind: 'aura', radius: 200, fireRateBonus: 0.25 },
        ascension: { id: 'ascWarlordStandard', name: 'Warlord Standard', cost: 400, damage: 0, range: 0, fireRate: 0,
          mechanic: { kind: 'aura', radius: 260, fireRateBonus: 0.4 } } },
      // Balanced vigil.
      { id: 'wardenVigil', name: 'Vigil Spire', cost: 200, damage: 0, range: 0, fireRate: 0,
        mechanic: { kind: 'ward', revealRadius: 240, goldPerWave: 55 },
        ascension: { id: 'ascEternalVigil', name: 'Eternal Vigil', cost: 370, damage: 0, range: 0, fireRate: 0,
          mechanic: { kind: 'ward', revealRadius: 300, goldPerWave: 95 } } },
    ],
  },
});
