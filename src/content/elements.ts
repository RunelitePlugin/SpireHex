export type ElementId = 'fire' | 'frost' | 'nature' | 'storm' | 'radiant' | 'shadow';

/** P11: towers may also be element-less. Enemies are ALWAYS one of the six ElementIds. */
export type AttackElement = ElementId | 'neutral';

export const ELEMENT_IDS: readonly ElementId[] = ['fire', 'frost', 'nature', 'storm', 'radiant', 'shadow'];
export const ATTACK_ELEMENT_IDS: readonly AttackElement[] = [...ELEMENT_IDS, 'neutral'];

/** Opposed pairs: fire↔frost, nature↔storm, radiant↔shadow. Neutral opposes nothing. */
export const OPPOSED: Record<ElementId, ElementId> = Object.freeze({
  fire: 'frost',
  frost: 'fire',
  nature: 'storm',
  storm: 'nature',
  radiant: 'shadow',
  shadow: 'radiant',
});

/**
 * ELEMENT_MATRIX[attacker][defender] → damage multiplier. 7 attacker rows × 6
 * defender columns. Baseline 1.0; opposed 1.5; own element 0.5; neutral 1.0
 * against everything (reliable, never optimal — spec §4).
 */
export const ELEMENT_MATRIX: Record<AttackElement, Record<ElementId, number>> = Object.freeze({
  fire:    Object.freeze({ fire: 0.5, frost: 1.5, nature: 1.0, storm: 1.0, radiant: 1.0, shadow: 1.0 }),
  frost:   Object.freeze({ fire: 1.5, frost: 0.5, nature: 1.0, storm: 1.0, radiant: 1.0, shadow: 1.0 }),
  nature:  Object.freeze({ fire: 1.0, frost: 1.0, nature: 0.5, storm: 1.5, radiant: 1.0, shadow: 1.0 }),
  storm:   Object.freeze({ fire: 1.0, frost: 1.0, nature: 1.5, storm: 0.5, radiant: 1.0, shadow: 1.0 }),
  radiant: Object.freeze({ fire: 1.0, frost: 1.0, nature: 1.0, storm: 1.0, radiant: 0.5, shadow: 1.5 }),
  shadow:  Object.freeze({ fire: 1.0, frost: 1.0, nature: 1.0, storm: 1.0, radiant: 1.5, shadow: 0.5 }),
  neutral: Object.freeze({ fire: 1.0, frost: 1.0, nature: 1.0, storm: 1.0, radiant: 1.0, shadow: 1.0 }),
});
