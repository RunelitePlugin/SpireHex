import { describe, expect, it } from 'vitest';
import { Simulation } from '../../src/sim/simulation';
import type { TowerDef } from '../../src/content/types';
import { enemyDef, makeContent, placeCmd, runTicks, specDef, straightLevel, towerDef } from './helpers';

const ATTACK_HEX = { q: 2, r: -1 };
const AURA_HEX = { q: 3, r: -1 };   // ≈83.1 units from ATTACK_HEX
const AURA_HEX_2 = { q: 1, r: -1 }; // ≈83.1 units on the other side

function auraTower(radius: number, fireRateBonus: number, id = 'auraTower'): TowerDef {
  return towerDef({ id, mechanic: { kind: 'aura', radius, fireRateBonus } });
}

function simWith(towers: TowerDef[]): Simulation {
  return new Simulation(straightLevel(), makeContent(towers, [enemyDef()]), 1);
}

describe('aura mechanic', () => {
  it('multiplies a neighbor tower fire rate by (1 + bonus)', () => {
    const sim = simWith([towerDef(), auraTower(200, 0.5)]);
    sim.applyCommand(placeCmd('testTower', ATTACK_HEX));
    sim.applyCommand(placeCmd('auraTower', AURA_HEX));
    expect(sim.statsFor(sim.towers[0]).fireRate).toBe(1.5); // 1 × (1 + 0.5)
  });

  it('multiple auras compose multiplicatively', () => {
    const sim = simWith([towerDef(), auraTower(200, 0.5), auraTower(200, 0.25, 'auraTower2')]);
    sim.applyCommand(placeCmd('testTower', ATTACK_HEX));
    sim.applyCommand(placeCmd('auraTower', AURA_HEX));
    sim.applyCommand(placeCmd('auraTower2', AURA_HEX_2));
    expect(sim.statsFor(sim.towers[0]).fireRate).toBe(1.875); // 1 × 1.5 × 1.25
  });

  it('does not buff itself and does not reach beyond its radius', () => {
    const sim = simWith([towerDef(), auraTower(50, 0.5)]); // 50 < 83.1: neighbor out of reach
    sim.applyCommand(placeCmd('testTower', ATTACK_HEX));
    sim.applyCommand(placeCmd('auraTower', AURA_HEX));
    expect(sim.statsFor(sim.towers[0]).fireRate).toBe(1);
    expect(sim.statsFor(sim.towers[1]).fireRate).toBe(1); // aura never buffs itself
  });

  it('an aura tower never fires, even with enemies in range', () => {
    const sim = simWith([auraTower(200, 0.5)]);
    sim.applyCommand(placeCmd('auraTower', ATTACK_HEX));
    sim.applyCommand({ type: 'startWave' });
    const events = runTicks(sim, 60);
    expect(events.filter((e) => e.type === 'towerFired')).toHaveLength(0);
    expect(sim.enemies[0].hp).toBe(100);
  });

  it('a spec-granted aura works through the resolution pipeline', () => {
    const support = towerDef({
      id: 'support',
      specializations: [
        specDef({ id: 'beacon', mechanic: { kind: 'aura', radius: 200, fireRateBonus: 0.3 } }),
        specDef({ id: 'b' }), specDef({ id: 'c' }), specDef({ id: 'd' }),
      ],
    });
    const sim = simWith([towerDef(), support]);
    sim.applyCommand(placeCmd('testTower', ATTACK_HEX));
    sim.applyCommand(placeCmd('support', AURA_HEX));
    sim.towers[1].tier = 2;
    sim.towers[1].specId = 'beacon';
    expect(sim.statsFor(sim.towers[0]).fireRate).toBeCloseTo(1.3, 9);
  });

  it('selling the aura tower drops the buff on the next statsFor call (live rescan, not cached)', () => {
    const sim = simWith([towerDef(), auraTower(200, 0.5)]);
    sim.applyCommand(placeCmd('testTower', ATTACK_HEX));
    sim.applyCommand(placeCmd('auraTower', AURA_HEX));
    expect(sim.statsFor(sim.towers[0]).fireRate).toBe(1.5); // buffed while the aura tower stands
    const auraTowerId = sim.towers[1].id;
    sim.applyCommand({ type: 'sellTower', towerId: auraTowerId });
    expect(sim.statsFor(sim.towers[0]).fireRate).toBe(1); // back to unbuffed once the aura is gone
  });

  it('actually speeds up firing: a buffed tower gets a second shot sooner', () => {
    // fireRate 0.05 → 20 s cooldown unbuffed (1 shot in 15 s); ×1.5 → 13.33 s (2 shots).
    const buffed = simWith([towerDef({ fireRate: 0.05 }), auraTower(200, 0.5)]);
    buffed.applyCommand(placeCmd('testTower', ATTACK_HEX));
    buffed.applyCommand(placeCmd('auraTower', AURA_HEX));
    buffed.applyCommand({ type: 'startWave' });
    const shots = runTicks(buffed, 450).filter((e) => e.type === 'towerFired');
    expect(shots).toHaveLength(2);
  });
});
