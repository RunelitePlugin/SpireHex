import { hexKey, type Axial } from '../sim/hex';

export function offsetToAxial(col: number, row: number): Axial {
  return { q: col - Math.floor(row / 2), r: row };
}

export function rectHexes(cols: number, rows: number): Axial[] {
  const hexes: Axial[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      hexes.push(offsetToAxial(col, row));
    }
  }
  return hexes;
}

/**
 * Author a road as offset (col,row) pairs. RULE: consecutive pairs must differ by
 * ±1 col OR ±1 row (rook moves) — in this offset scheme those are always
 * hex-adjacent, so the campaign adjacency test passes by construction.
 * (Diagonal offset steps are parity-dependent; do not use them.)
 */
export function offsetPath(colsRows: ReadonlyArray<readonly [number, number]>): Axial[] {
  return colsRows.map(([c, r]) => offsetToAxial(c, r));
}

/** Union of several hex chains with duplicates removed — LevelDef.pathHexes for multi-path maps. */
export function uniqueHexes(chains: Axial[][]): Axial[] {
  const seen = new Set<string>();
  const out: Axial[] = [];
  for (const chain of chains) {
    for (const h of chain) {
      const k = hexKey(h);
      if (!seen.has(k)) {
        seen.add(k);
        out.push(h);
      }
    }
  }
  return out;
}
