import type { MinorNodeId } from '../sim/types';
import { deepFreeze } from './freeze';

/** Gold cost of a minor node's NEXT rank, indexed by its current rank (3 ranks max). */
export const MINOR_NODE_COSTS: readonly number[] = deepFreeze([40, 60, 80]);

/** Per-rank multiplicative stat bonus for each minor node type (+10% damage, +8% range, +8% fire rate). */
export const MINOR_NODE_BONUS: Readonly<Record<MinorNodeId, number>> = deepFreeze({
  damage: 0.1,
  range: 0.08,
  rate: 0.08,
});

/** Stable iteration order for the three node types (UI rows, invested-gold sums). */
export const MINOR_NODE_IDS: readonly MinorNodeId[] = deepFreeze(['damage', 'range', 'rate']);

/** Selling refunds this fraction of TOTAL invested gold (base + tiers + spec + nodes), floored. */
export const SELL_REFUND_RATE = 0.7;
