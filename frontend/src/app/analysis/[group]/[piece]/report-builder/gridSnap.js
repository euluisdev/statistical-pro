export const CANVAS = {
  landscape: { w: 1122, h: 794 },
  portrait:  { w: 794,  h: 1122 },
};

const PAD    = 24;  // margem lateral e inferior
const GAP    = 10;  // espaço entre células

//area reservada para cabeçalho + logo
//tamanho real do cabeçalho
export const HEADER = 120; // px

export const GRID_LAYOUTS = [
  { id: "free", label: "Livre",  cols: 0, rows: 0 },
  { id: "1x1",  label: "1 × 1", cols: 1, rows: 1 },
  { id: "2x1",  label: "2 × 1", cols: 2, rows: 1 },
  { id: "1x2",  label: "1 × 2", cols: 1, rows: 2 },
  { id: "2x2",  label: "2 × 2", cols: 2, rows: 2 },
  { id: "3x2",  label: "3 × 2", cols: 3, rows: 2 },
  { id: "3x3",  label: "3 × 3", cols: 3, rows: 3 },
  { id: "4x2",  label: "4 × 2", cols: 4, rows: 2 },
];

/**
 * Calcula células da grade respeitando o HEADER no topo.
 * A área utilizável começa em y = HEADER e vai até a borda inferior - PAD.
 */
export function computeCells(orientation, cols, rows) {
  if (!cols || !rows) return [];
  const { w, h } = CANVAS[orientation] || CANVAS.landscape;

  const areaX = PAD;
  const areaY = HEADER;                   //começa abaixo do cabeçalho
  const areaW = w - PAD * 2;
  const areaH = h - HEADER - PAD;         //altura restante após o cabeçalho

  const cellW = (areaW - GAP * (cols - 1)) / cols;
  const cellH = (areaH - GAP * (rows - 1)) / rows;

  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push({
        col: c, row: r,
        x: Math.round(areaX + c * (cellW + GAP)),
        y: Math.round(areaY + r * (cellH + GAP)),
        width:  Math.round(cellW),
        height: Math.round(cellH),
      });
    }
  }
  return cells;
}

//celula mais próxima do ponto de drop
export function nearestCell(dropX, dropY, cells) {
  if (!cells?.length) return null;
  let best = null, bestDist = Infinity;
  for (const cell of cells) {
    const dist = Math.hypot(dropX - (cell.x + cell.width / 2), dropY - (cell.y + cell.height / 2));
    if (dist < bestDist) { bestDist = dist; best = cell; }
  }
  return best;
}

//posição/tamanho final após snap
export function snapDrop(dropX, dropY, gridLayout, orientation) {
  if (!gridLayout || gridLayout === "free") {
    return { x: Math.max(0, dropX), y: Math.max(0, dropY), width: 500, height: 350 };
  }
  const layout = GRID_LAYOUTS.find((l) => l.id === gridLayout);
  if (!layout?.cols) {
    return { x: Math.max(0, dropX), y: Math.max(0, dropY), width: 500, height: 350 };
  }
  const cells = computeCells(orientation, layout.cols, layout.rows);
  const cell  = nearestCell(dropX, dropY, cells);
  if (!cell) return { x: Math.max(0, dropX), y: Math.max(0, dropY), width: 500, height: 350 };
  return { x: cell.x, y: cell.y, width: cell.width, height: cell.height };
} 
 
 