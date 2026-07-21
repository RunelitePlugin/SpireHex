import { ELEMENT_MATRIX, type AttackElement, type ElementId } from '../content/elements';

/**
 * Damage of a single direct hit.
 * Order: element multiplier first, then flat armor (skipped for armor-piercing hits),
 * floored at 1 so every hit always matters.
 */
export function computeHitDamage(
  base: number,
  attacker: AttackElement,
  defender: ElementId,
  armor: number,
  ignoreArmor: boolean,
): number {
  const scaled = base * ELEMENT_MATRIX[attacker][defender];
  return Math.max(1, ignoreArmor ? scaled : scaled - armor);
}
