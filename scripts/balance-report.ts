/**
 * Deterministic balance report (Phase 7). Run: `npm run balance`.
 * Full-level batch runs over the winnability builds and the opening corpora —
 * the evidence base for every content retune. Numbers are exact (seed 1):
 * a changed number without a content change is a regression, full stop.
 */
import { performance } from 'node:perf_hooks';
import { LEVELS } from '../src/content';
import { BIOME_FOR_LEVEL_CONTENT } from '../src/content/biomeRoster';
import {
  OPENING_FOLLOWUPS,
  OPENING_HEXES,
  WINNABILITY_BUILDS,
  openingCorpus,
  runSteps,
  summarize,
} from '../tests/balance/harness';
import {
  ENDLESS_MINIMAL_BUILD,
  ENDLESS_NEUTRAL_MINIMAL_BUILD,
  ENDLESS_NEUTRAL_REFERENCE_BUILD,
  ENDLESS_REFERENCE_BUILD,
  P12_ENDLESS_L11_MIN,
  P12_ENDLESS_L11_REF,
  P12_ENDLESS_L21_MIN,
  P12_ENDLESS_L21_REF,
  runEndlessProbe,
  P15_RAINBOW_MIN,
  P15_RAINBOW_REF,
  runRainbowProbe,
} from '../tests/balance/endlessHarness';
import {
  L20_ROADLINE,
  P12_OPENING_FOLLOWUPS,
  P12_OPENING_HEXES,
  P12_OPENING_TYPES_FROST,
  P12_OPENING_TYPES_VERDANT,
  P12_WINNABILITY_BUILDS,
} from '../tests/balance/p12Builds';
import {
  P13_OPENING_TYPES_STORM, P13_STORM_FOLLOWUPS, P13_STORM_OPENING_HEXES,
  P13_STORM_WINNABILITY, L40_GATECASTLE,
} from '../tests/balance/p13StormBuilds';
import {
  P13_OPENING_TYPES_RADIANT, P13_RADIANT_FOLLOWUPS, P13_RADIANT_OPENING_HEXES,
  P13_RADIANT_WINNABILITY, L50_NOSLOW,
} from '../tests/balance/p13RadiantBuilds';
import {
  L60_DARKCASTLE, L60_NOPIERCE, P14_OPENING_TYPES_UMBRAL, P14_UMBRAL_FOLLOWUPS,
  P14_UMBRAL_OPENING_HEXES, P14_UMBRAL_WINNABILITY,
} from '../tests/balance/p14UmbralBuilds';
import {
  P13_ENDLESS_L31_MIN, P13_ENDLESS_L31_REF, P13_ENDLESS_L41_MIN, P13_ENDLESS_L41_REF,
  P14_ENDLESS_L51_MIN, P14_ENDLESS_L51_REF,
} from '../tests/balance/endlessHarness';

console.log('== scripted winnability margins (seed 1) ==');
for (const levelId of Object.keys(WINNABILITY_BUILDS)) {
  const t0 = performance.now();
  const { sim, ticks } = runSteps(LEVELS[levelId], WINNABILITY_BUILDS[levelId]);
  const ms = performance.now() - t0;
  console.log(
    `${levelId}: ${sim.status} lives=${sim.lives}/20 gold=${sim.gold} | ` +
      `${ticks} ticks in ${ms.toFixed(0)}ms (${Math.round(ticks / (ms / 1000))} ticks/s headless; realtime needs 30)`,
  );
}

console.log('\n== opening corpora (9 north/south neutral-triad pairings + fixed follow-up spine) ==');
for (const levelId of ['level07', 'level08'] as const) {
  const { north, south } = OPENING_HEXES[levelId];
  const results = openingCorpus(LEVELS[levelId], north, south, OPENING_FOLLOWUPS[levelId]);
  console.log(`${levelId}: ${summarize(results)}`);
}

console.log('\n== endless probe (level01, element reference/minimal builds, seed 1) ==');
for (const attempt of [1, 2, 3]) {
  const r = runEndlessProbe(ENDLESS_REFERENCE_BUILD, attempt);
  console.log(`ref attempt ${attempt}: cleared ${r.wavesCleared} waves (${r.status}) in ${r.ticks} ticks`);
}
{
  const r = runEndlessProbe(ENDLESS_MINIMAL_BUILD, 1);
  console.log(`minimal: cleared ${r.wavesCleared} waves (${r.status}) in ${r.ticks} ticks`);
}

console.log('\n== endless probe (level01, NEUTRAL reference/minimal builds, seed 1) ==');
for (const attempt of [1, 2, 3]) {
  const r = runEndlessProbe(ENDLESS_NEUTRAL_REFERENCE_BUILD, attempt);
  console.log(`NEUTRAL ref attempt ${attempt}: cleared ${r.wavesCleared} waves (${r.status}) in ${r.ticks} ticks`);
}
{
  const r = runEndlessProbe(ENDLESS_NEUTRAL_MINIMAL_BUILD, 1);
  console.log(`NEUTRAL minimal: cleared ${r.wavesCleared} waves (${r.status}) in ${r.ticks} ticks`);
}

console.log('\n== P12 endless probe (level11 frost family, seed 1) ==');
for (const attempt of [1, 2, 3]) {
  const r = runEndlessProbe(P12_ENDLESS_L11_REF, attempt, 10);
  console.log(`ref attempt ${attempt}: cleared ${r.wavesCleared} waves (${r.status}) in ${r.ticks} ticks`);
}
{
  const r = runEndlessProbe(P12_ENDLESS_L11_MIN, 1, 10);
  console.log(`minimal: cleared ${r.wavesCleared} waves (${r.status}) in ${r.ticks} ticks`);
}

console.log('\n== P12 endless probe (level21 verdant family, seed 1) ==');
for (const attempt of [1, 2, 3]) {
  const r = runEndlessProbe(P12_ENDLESS_L21_REF, attempt, 20);
  console.log(`ref attempt ${attempt}: cleared ${r.wavesCleared} waves (${r.status}) in ${r.ticks} ticks`);
}
{
  const r = runEndlessProbe(P12_ENDLESS_L21_MIN, 1, 20);
  console.log(`minimal: cleared ${r.wavesCleared} waves (${r.status}) in ${r.ticks} ticks`);
}

console.log('\n== P12 winnability margins (biome-legal pools, seed 1) ==');
for (const levelId of Object.keys(P12_WINNABILITY_BUILDS)) {
  const { sim, ticks } = runSteps(LEVELS[levelId], P12_WINNABILITY_BUILDS[levelId]);
  console.log(`${levelId}: ${sim.status} lives=${sim.lives}/20 gold=${sim.gold} | ${ticks} ticks`);
}
{
  // The freeze-lesson counterpoint (plan evidence table): same firepower, spread
  // down the road instead of gated at the exit — survives, but never kills the boss.
  const { sim, ticks } = runSteps(LEVELS.level20, L20_ROADLINE);
  console.log(`level20 (road-line lesson): ${sim.status} lives=${sim.lives}/20 gold=${sim.gold} | ${ticks} ticks`);
}

console.log('\n== P12 opening corpora (biome-legal pools, fixed follow-up spine) ==');
for (const levelId of Object.keys(P12_OPENING_HEXES)) {
  const { north, south } = P12_OPENING_HEXES[levelId];
  // Pool by biome registry, not id ordering — self-maintaining if id formats ever change.
  const types = BIOME_FOR_LEVEL_CONTENT[levelId] === 'frost' ? P12_OPENING_TYPES_FROST : P12_OPENING_TYPES_VERDANT;
  const results = openingCorpus(LEVELS[levelId], north, south, P12_OPENING_FOLLOWUPS[levelId], types);
  console.log(`${levelId}: ${summarize(results)}`);
}

console.log('\n== P13 endless probe (level31 storm family, seed 1) ==');
for (const attempt of [1, 2, 3]) {
  const r = runEndlessProbe(P13_ENDLESS_L31_REF, attempt, 30);
  console.log(`ref attempt ${attempt}: cleared ${r.wavesCleared} waves (${r.status}) in ${r.ticks} ticks`);
}
{
  const r = runEndlessProbe(P13_ENDLESS_L31_MIN, 1, 30);
  console.log(`minimal: cleared ${r.wavesCleared} waves (${r.status}) in ${r.ticks} ticks`);
}

console.log('\n== P13 endless probe (level41 radiant family, seed 1) ==');
for (const attempt of [1, 2, 3]) {
  const r = runEndlessProbe(P13_ENDLESS_L41_REF, attempt, 40);
  console.log(`ref attempt ${attempt}: cleared ${r.wavesCleared} waves (${r.status}) in ${r.ticks} ticks`);
}
{
  const r = runEndlessProbe(P13_ENDLESS_L41_MIN, 1, 40);
  console.log(`minimal: cleared ${r.wavesCleared} waves (${r.status}) in ${r.ticks} ticks`);
}

console.log('\n== P13 winnability margins (biome-legal pools, seed 1) ==');
for (const levelId of [...Object.keys(P13_STORM_WINNABILITY), ...Object.keys(P13_RADIANT_WINNABILITY)]) {
  // Membership, not id-ordering — can never desync from the tables it indexes.
  const builds = levelId in P13_STORM_WINNABILITY ? P13_STORM_WINNABILITY : P13_RADIANT_WINNABILITY;
  const { sim, ticks } = runSteps(LEVELS[levelId], builds[levelId]);
  console.log(`${levelId}: ${sim.status} lives=${sim.lives}/20 gold=${sim.gold} | ${ticks} ticks`);
}
{
  // The blink-lesson counterpoint: the same exit castle minus its Deep Freeze pair.
  const { sim, ticks } = runSteps(LEVELS.level40, L40_GATECASTLE);
  console.log(`level40 (bare-gate lesson): ${sim.status} lives=${sim.lives}/20 gold=${sim.gold} | ${ticks} ticks`);
}
{
  // The shield-lesson counterpoint: the same castle with NO slow.
  const { sim, ticks } = runSteps(LEVELS.level50, L50_NOSLOW);
  console.log(`level50 (no-slow lesson): ${sim.status} lives=${sim.lives}/20 gold=${sim.gold} | ${ticks} ticks`);
}

console.log('\n== P13 opening corpora (biome-legal pools, fixed follow-up spine) ==');
for (const levelId of Object.keys(P13_STORM_OPENING_HEXES)) {
  const { north, south } = P13_STORM_OPENING_HEXES[levelId];
  const results = openingCorpus(LEVELS[levelId], north, south, P13_STORM_FOLLOWUPS[levelId], P13_OPENING_TYPES_STORM);
  console.log(`${levelId}: ${summarize(results)}`);
}
for (const levelId of Object.keys(P13_RADIANT_OPENING_HEXES)) {
  const { north, south } = P13_RADIANT_OPENING_HEXES[levelId];
  const results = openingCorpus(LEVELS[levelId], north, south, P13_RADIANT_FOLLOWUPS[levelId], P13_OPENING_TYPES_RADIANT);
  console.log(`${levelId}: ${summarize(results)}`);
}

console.log('\n== P14 winnability margins (biome-6 pool, seed 1) ==');
for (const levelId of Object.keys(P14_UMBRAL_WINNABILITY)) {
  const { sim, ticks } = runSteps(LEVELS[levelId], P14_UMBRAL_WINNABILITY[levelId]);
  console.log(`${levelId}: ${sim.status} lives=${sim.lives}/20 gold=${sim.gold} | ${ticks} ticks`);
}
{
  const { sim } = runSteps(LEVELS.level60, L60_NOPIERCE);
  console.log(`level60 (no-pierce lesson): ${sim.status} lives=${sim.lives}/20 | boss leaks (see lock test)`);
  const dark = runSteps(LEVELS.level60, L60_DARKCASTLE);
  console.log(`level60 (dark-castle lesson): ${dark.sim.status} lives=${dark.sim.lives}/20 | reveal is survival`);
}

console.log('\n== P14 opening corpora (biome-6 pool, fixed follow-up spine) ==');
for (const levelId of Object.keys(P14_UMBRAL_OPENING_HEXES)) {
  const { north, south } = P14_UMBRAL_OPENING_HEXES[levelId];
  const results = openingCorpus(LEVELS[levelId], north, south, P14_UMBRAL_FOLLOWUPS[levelId], P14_OPENING_TYPES_UMBRAL);
  console.log(`${levelId}: ${summarize(results)}`);
}

console.log('\n== P14 endless probe (level51 umbral family, seed 1) ==');
for (const attempt of [1, 2, 3]) {
  const r = runEndlessProbe(P14_ENDLESS_L51_REF, attempt, 50);
  console.log(`ref attempt ${attempt}: waves=${r.wavesCleared} status=${r.status}`);
}
{
  const r = runEndlessProbe(P14_ENDLESS_L51_MIN, 1, 50);
  console.log(`minimal: waves=${r.wavesCleared} status=${r.status}`);
}

console.log('\n== P15 Rainbow Mode probe (six-family wave cycle, seed 1) ==');
for (const attempt of [1, 2, 3]) {
  const r = runRainbowProbe(P15_RAINBOW_REF, attempt);
  console.log(`ref attempt ${attempt}: waves=${r.wavesCleared} status=${r.status}`);
}
{
  const r = runRainbowProbe(P15_RAINBOW_MIN, 1);
  console.log(`minimal: waves=${r.wavesCleared} status=${r.status}`);
}
