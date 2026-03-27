const THRESHOLD = 6; //px distância para ativar o snap

/**
 * Calcula guias ativas e posição snapped para um elemento sendo arrastado.
 *
 * @param {object} moving   - elemento atual { x, y, width, height }
 * @param {array}  others   - todos os outros elementos da página
 * @param {object} canvas   - { w, h } dimensões do canvas em px
 * @returns {{ snappedX, snappedY, guides }}
 *   guides = array de { orientation:'h'|'v', position, start, end }
 */
export function computeSnapGuides(moving, others, canvas) {
  const guides = [];

  // pontos de referência do elemento em movimento
  const mL = moving.x;
  const mR = moving.x + moving.width;
  const mCX = moving.x + moving.width / 2;
  const mT = moving.y;
  const mB = moving.y + moving.height;
  const mCY = moving.y + moving.height / 2;

  let snappedX = moving.x;
  let snappedY = moving.y;

  // referências fixas: bordas do canvas
  const canvasRefs = {
    vLines: [0, canvas.w / 2, canvas.w],
    hLines: [0, canvas.h / 2, canvas.h],
  };

  //alvo outros elementos
  const targets = [
    //cada elemento vira 3 linhas V - esq, centro, dir e 3 H top, centro, bot
    ...others.map((el) => ({
      vLines: [el.x, el.x + el.width / 2, el.x + el.width],
      hLines: [el.y, el.y + el.height / 2, el.y + el.height],
      x: el.x, y: el.y, w: el.width, h: el.height,
    })),
    //bordas do canvas como referência tb
    {
      vLines: canvasRefs.vLines,
      hLines: canvasRefs.hLines,
      x: 0, y: 0, w: canvas.w, h: canvas.h,
    },
  ];

  //snap vertical linhas V — controlam X
  let bestDX = THRESHOLD + 1;

  for (const t of targets) {
    for (const tX of t.vLines) {
      // testa esquerda do moving contra tX
      const dL = Math.abs(mL - tX);
      if (dL < bestDX) {
        bestDX = dL;
        snappedX = tX;
      }
      // testa centro do moving contra tX
      const dCX = Math.abs(mCX - tX);
      if (dCX < bestDX) {
        bestDX = dCX;
        snappedX = tX - moving.width / 2;
      }
      // testa direita do moving contra tX
      const dR = Math.abs(mR - tX);
      if (dR < bestDX) {
        bestDX = dR;
        snappedX = tX - moving.width;
      }
    }
  }

  //snap horizontal - linhas H — controlam Y
  let bestDY = THRESHOLD + 1;

  for (const t of targets) {
    for (const tY of t.hLines) {
      const dT = Math.abs(mT - tY);
      if (dT < bestDY) {
        bestDY = dT;
        snappedY = tY;
      }
      const dCY = Math.abs(mCY - tY);
      if (dCY < bestDY) {
        bestDY = dCY;
        snappedY = tY - moving.height / 2;
      }
      const dB = Math.abs(mB - tY);
      if (dB < bestDY) {
        bestDY = dB;
        snappedY = tY - moving.height;
      }
    }
  }

  //gera linhas guia visuais com base na posição snap
  const sL  = snappedX;
  const sR  = snappedX + moving.width;
  const sCX = snappedX + moving.width / 2;
  const sT  = snappedY;
  const sB  = snappedY + moving.height;
  const sCY = snappedY + moving.height / 2;

  for (const t of targets) {
    for (const tX of t.vLines) {
      if (Math.abs(sL - tX) < 1 || Math.abs(sCX - tX) < 1 || Math.abs(sR - tX) < 1) {
        // linha vertical na posição tX
        if (!guides.find((g) => g.orientation === "v" && Math.abs(g.position - tX) < 1)) {
          guides.push({
            orientation: "v",
            position: tX,
            start: Math.min(sT, t.y ?? 0),
            end: Math.max(sB, (t.y ?? 0) + (t.h ?? canvas.h)),
          });
        }
      }
    }
    for (const tY of t.hLines) {
      if (Math.abs(sT - tY) < 1 || Math.abs(sCY - tY) < 1 || Math.abs(sB - tY) < 1) {
        if (!guides.find((g) => g.orientation === "h" && Math.abs(g.position - tY) < 1)) {
          guides.push({
            orientation: "h",
            position: tY,
            start: Math.min(sL, t.x ?? 0),
            end: Math.max(sR, (t.x ?? 0) + (t.w ?? canvas.w)),
          });
        }
      }
    }
  }

  return { snappedX, snappedY, guides };
}  
 
 
