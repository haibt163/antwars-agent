/**
 * The live `view.cells` map is one encoded string, not an array:
 * `{width,height,encoding,foodRadix,data}` (2026-11-10 wire). This decodes it to
 * the per-cell objects the opener reads: `{tileX,tileY,food,ants}` for every cell
 * that has food or ants.
 *
 * Token grammar, from the reply's own `encoding`: base36
 * `p[,queenColony[,queenHp]][:ants]` separated by `;`; `d = floor(p/foodRadix)`,
 * `food = p - d*foodRadix`, `i += d` per token and per `p*n` repeat,
 * `x = i % width`, `y = floor(i / width)`; ants `antId.k` with `k = hp * 6 + kind`,
 * `colony = kind % 2` and caste soldier at `kind >= 4`, worker at `kind >= 2`.
 * An older array reply passes through unchanged.
 */
export function readCells(cells) {
  if (Array.isArray(cells)) return cells;
  const data = cells?.data;
  if (typeof data !== "string" || data === "") return [];
  const width = Number(cells.width) > 0 ? Number(cells.width) : 128;
  const radix = Number(cells.foodRadix) > 0 ? Number(cells.foodRadix) : 1;
  const decoded = [];
  let i = 0;
  for (const token of data.split(";")) {
    const [head, antPart] = token.split(":");
    const [pStr] = head.split(",");
    if (pStr === undefined || pStr === "") continue;
    const star = pStr.indexOf("*");
    const p = Number.parseInt(star < 0 ? pStr : pStr.slice(0, star), 36);
    if (!Number.isFinite(p)) continue;
    const repeats = star < 0 ? 1 : Math.max(1, Number.parseInt(pStr.slice(star + 1), 36) || 1);
    const d = Math.floor(p / radix);
    const food = p - d * radix;
    for (let r = 0; r < repeats; r += 1) {
      i += d;
      const ants = r === repeats - 1 && antPart
        ? antPart.split("/").filter(Boolean).map((entry) => {
          const [id, k] = entry.split(".");
          const kk = Number.parseInt(k, 36);
          const type = kk % 6;
          return { antId: Number.parseInt(id, 36), hp: Math.floor(kk / 6), colony: type % 2,
            caste: type >= 4 ? "soldier" : type >= 2 ? "worker" : "none" };
        })
        : [];
      if (food > 0 || ants.length > 0) decoded.push({ tileX: i % width, tileY: Math.floor(i / width), food, ants });
    }
  }
  return decoded;
}
