import type { ContentDb, LevelDef } from './types';
import { ENEMIES } from './enemies';
import { TOWERS } from './towers';
import { LEVEL01 } from './levels/level01';
import { LEVEL02 } from './levels/level02';
import { LEVEL03 } from './levels/level03';
import { LEVEL04 } from './levels/level04';
import { LEVEL05 } from './levels/level05';
import { LEVEL06 } from './levels/level06';
import { LEVEL07 } from './levels/level07';
import { LEVEL08 } from './levels/level08';
import { LEVEL09 } from './levels/level09';
import { LEVEL10 } from './levels/level10';
import { LEVEL11 } from './levels/level11';
import { LEVEL12 } from './levels/level12';
import { LEVEL13 } from './levels/level13';
import { LEVEL14 } from './levels/level14';
import { LEVEL15 } from './levels/level15';
import { LEVEL16 } from './levels/level16';
import { LEVEL17 } from './levels/level17';
import { LEVEL18 } from './levels/level18';
import { LEVEL19 } from './levels/level19';
import { LEVEL20 } from './levels/level20';
import { LEVEL21 } from './levels/level21';
import { LEVEL22 } from './levels/level22';
import { LEVEL23 } from './levels/level23';
import { LEVEL24 } from './levels/level24';
import { LEVEL25 } from './levels/level25';
import { LEVEL26 } from './levels/level26';
import { LEVEL27 } from './levels/level27';
import { LEVEL28 } from './levels/level28';
import { LEVEL29 } from './levels/level29';
import { LEVEL30 } from './levels/level30';
import { LEVEL31 } from './levels/level31';
import { LEVEL32 } from './levels/level32';
import { LEVEL33 } from './levels/level33';
import { LEVEL34 } from './levels/level34';
import { LEVEL35 } from './levels/level35';
import { LEVEL36 } from './levels/level36';
import { LEVEL37 } from './levels/level37';
import { LEVEL38 } from './levels/level38';
import { LEVEL39 } from './levels/level39';
import { LEVEL40 } from './levels/level40';
import { LEVEL41 } from './levels/level41';
import { LEVEL42 } from './levels/level42';
import { LEVEL43 } from './levels/level43';
import { LEVEL44 } from './levels/level44';
import { LEVEL45 } from './levels/level45';
import { LEVEL46 } from './levels/level46';
import { LEVEL47 } from './levels/level47';
import { LEVEL48 } from './levels/level48';
import { LEVEL49 } from './levels/level49';
import { LEVEL50 } from './levels/level50';
import { LEVEL51 } from './levels/level51';
import { LEVEL52 } from './levels/level52';
import { LEVEL53 } from './levels/level53';
import { LEVEL54 } from './levels/level54';
import { LEVEL55 } from './levels/level55';
import { LEVEL56 } from './levels/level56';
import { LEVEL57 } from './levels/level57';
import { LEVEL58 } from './levels/level58';
import { LEVEL59 } from './levels/level59';
import { LEVEL60 } from './levels/level60';
import { deepFreeze } from './freeze';

export const CONTENT: ContentDb = deepFreeze({ enemies: ENEMIES, towers: TOWERS });

/** The campaign in play order. LEVELS is derived from it — register new levels HERE. */
export const CAMPAIGN: readonly LevelDef[] = deepFreeze([
  LEVEL01, LEVEL02, LEVEL03, LEVEL04, LEVEL05, LEVEL06, LEVEL07, LEVEL08, LEVEL09, LEVEL10,
  LEVEL11, LEVEL12, LEVEL13, LEVEL14, LEVEL15, LEVEL16, LEVEL17, LEVEL18, LEVEL19, LEVEL20,
  LEVEL21, LEVEL22, LEVEL23, LEVEL24, LEVEL25, LEVEL26, LEVEL27, LEVEL28, LEVEL29, LEVEL30,
  LEVEL31, LEVEL32, LEVEL33, LEVEL34, LEVEL35, LEVEL36, LEVEL37, LEVEL38, LEVEL39, LEVEL40,
  LEVEL41, LEVEL42, LEVEL43, LEVEL44, LEVEL45, LEVEL46, LEVEL47, LEVEL48, LEVEL49, LEVEL50,
  LEVEL51, LEVEL52, LEVEL53, LEVEL54, LEVEL55, LEVEL56, LEVEL57, LEVEL58, LEVEL59, LEVEL60,
]);

export const LEVELS: Record<string, LevelDef> = deepFreeze(
  Object.fromEntries(CAMPAIGN.map((l) => [l.id, l])),
);
