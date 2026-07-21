export const TICK_RATE = 30;
export const DT = 1 / TICK_RATE;
export const HEX_SIZE = 48;

/**
 * Free-placement footprint radius (Phase 8). Derived from hex geometry:
 * < inradius (√3/2·HEX_SIZE ≈ 41.57) so every open hex center is always legal,
 * and 2·radius < pitch (√3·HEX_SIZE ≈ 83.14) so adjacent hex centers stay
 * co-placeable — every pre-P8 scripted build migrates unchanged. Packing is
 * ≈8% denser than one-per-hex ((83.14/80)²), inside the spec's "roughly
 * matches" band. Pinned by tests/sim/hex.geometry.test.ts.
 */
export const TOWER_RADIUS = 40;
