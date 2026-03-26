export const CANVAS = {  //dimensões do canvas em px-96dpi
  landscape: { w: 1122, h: 794 },
  portrait:  { w: 794,  h: 1122 },
};

// Padding interno do canvas (margem das bordas)
const PAD = 24; // px

/**
 * Layouts disponíveis
 * cols × rows = numero de celulas
 * O label aparece no seletor da toolbar
 */
export const GRID_LAYOUTS = [
  { id: "free",  label: "Livre",  cols: 0, rows: 0 }, // sem snap
  { id: "1x1",   label: "1 × 1", cols: 1, rows: 1 },
  { id: "2x1",   label: "2 × 1", cols: 2, rows: 1 },
  { id: "1x2",   label: "1 × 2", cols: 1, rows: 2 },
  { id: "2x2",   label: "2 × 2", cols: 2, rows: 2 },
  { id: "3x2",   label: "3 × 2", cols: 3, rows: 2 },
  { id: "3x3",   label: "3 × 3", cols: 3, rows: 3 },
  { id: "4x2",   label: "4 × 2", cols: 4, rows: 2 },
];

const GAP = 10; //espaço entre células em px

/**
 * Calcula as células de uma grade para um dado canvas e layout.
 * Retorna array de { col, row, x, y, width, height }
 */
export function computeCells(orientation, cols, rows) {
  if (!cols || !rows) return [];
  const { w, h } = CANVAS[orientation] || CANVAS.landscape;

  const totalW = w - PAD * 2;
  const totalH = h - PAD * 2;

  const cellW = (totalW - GAP * (cols - 1)) / cols;
  const cellH = (totalH - GAP * (rows - 1)) / rows;

  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push({
        col: c,
        row: r,
        x: PAD + c * (cellW + GAP),
        y: PAD + r * (cellH + GAP),
        width: Math.round(cellW),
        height: Math.round(cellH),
      });
    }
  }
  return cells;
}

/**
 * Dado um ponto (dropX, dropY) no canvas, retorna a célula mais próxima.
 * Se não houver grade ativa (free), retorna null.
 */
export function nearestCell(dropX, dropY, cells) {
  if (!cells || cells.length === 0) return null;

  let best = null;
  let bestDist = Infinity;

  for (const cell of cells) {
    const cx = cell.x + cell.width / 2;
    const cy = cell.y + cell.height / 2;
    const dist = Math.hypot(dropX - cx, dropY - cy);
    if (dist < bestDist) {
      bestDist = dist;
      best = cell;
    }
  }
  return best;
}

/**
 * Retorna { x, y, width, height } para uma imagem solta em (dropX, dropY).
 * Se gridLayout === "free", usa posição livre com tamanho padrão.
 */
export function snapDrop(dropX, dropY, gridLayout, orientation) {
  if (!gridLayout || gridLayout === "free") {
    return { x: Math.max(0, dropX), y: Math.max(0, dropY), width: 500, height: 350 };
  }

  const layout = GRID_LAYOUTS.find((l) => l.id === gridLayout);
  if (!layout || !layout.cols) {
    return { x: Math.max(0, dropX), y: Math.max(0, dropY), width: 500, height: 350 };
  }

  const cells = computeCells(orientation, layout.cols, layout.rows);
  const cell = nearestCell(dropX, dropY, cells);
  if (!cell) return { x: Math.max(0, dropX), y: Math.max(0, dropY), width: 500, height: 350 };

  return { x: cell.x, y: cell.y, width: cell.width, height: cell.height };
}  
 
 