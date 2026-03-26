import { useState, useEffect, useRef } from "react";

// ── Configuração do grid automático ──────────────────────────────────────────
// Canvas landscape: 297mm × 210mm ≈ 1122px × 794px a 96dpi
// Canvas portrait:  210mm × 297mm ≈ 794px × 1122px
const CANVAS = {
  landscape: { w: 1122, h: 794 },
  portrait:  { w: 794,  h: 1122 },
};

const PADDING = 24;  // margem externa (px)
const GAP     = 12;  // espaço entre imagens (px)

/**
 * Calcula o layout de grid para N imagens.
 * Retorna array de { x, y, width, height } com um slot por posição.
 *
 *  1 imagem  → 1×1 (ocupa tudo)
 *  2 imagens → 2×1 (lado a lado)
 *  3–4       → 2×2
 *  5–6       → 3×2
 *  7–9       → 3×3
 *  10+       → 4×3
 */
function computeGrid(totalImages, orientation = "landscape") {
  const { w, h } = CANVAS[orientation] || CANVAS.landscape;

  const cols = totalImages <= 1 ? 1
             : totalImages <= 2 ? 2
             : totalImages <= 4 ? 2
             : totalImages <= 6 ? 3
             : totalImages <= 9 ? 3
             : 4;

  const rows = Math.ceil(totalImages / cols);

  const cellW = Math.floor((w - PADDING * 2 - GAP * (cols - 1)) / cols);
  const cellH = Math.floor((h - PADDING * 2 - GAP * (rows - 1)) / rows);

  const slots = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      slots.push({
        x:      PADDING + c * (cellW + GAP),
        y:      PADDING + r * (cellH + GAP),
        width:  cellW,
        height: cellH,
      });
    }
  }
  return slots;
}

/**
 * Ao adicionar uma nova imagem:
 *  1. Recalcula o grid para (imagens atuais + 1)
 *  2. Redistribui TODAS as imagens nos slots (mantém a ordem)
 *  3. A nova imagem ocupa o último slot
 *  4. Elementos de texto ficam intocados
 */
function snapToGrid(elements, newElement, orientation = "landscape") {
  const imageEls   = elements.filter(
    (el) => el.type === "image" || el.type === "external-image"
  );
  const textEls    = elements.filter(
    (el) => el.type !== "image" && el.type !== "external-image"
  );
  const totalImages = imageEls.length + 1;
  const slots       = computeGrid(totalImages, orientation);

  const updatedImages = imageEls.map((el, i) => ({
    ...el,
    x:      slots[i].x,
    y:      slots[i].y,
    width:  slots[i].width,
    height: slots[i].height,
  }));

  const lastSlot = slots[totalImages - 1];
  const snappedNew = {
    ...newElement,
    x:      lastSlot.x,
    y:      lastSlot.y,
    width:  lastSlot.width,
    height: lastSlot.height,
  };

  return [...textEls, ...updatedImages, snappedNew];
}

// ─────────────────────────────────────────────────────────────────────────────

export function useDragDrop(
  canvasRef,
  pages,
  currentPageIndex,
  setPages,
  pageOrientation = "landscape"   // ← novo parâmetro
) {
  const [selectedElement, setSelectedElement] = useState(null);
  const [isDragging, setIsDragging]           = useState(false);
  const [isResizing, setIsResizing]           = useState(false);
  const [resizeDirection, setResizeDirection] = useState(null);
  const [dragOffset, setDragOffset]           = useState({ x: 0, y: 0 });

  const isDraggingRef   = useRef(false);
  const isResizingRef   = useRef(false);
  const selectedRef     = useRef(null);
  const dragOffsetRef   = useRef({ x: 0, y: 0 });
  const resizeDirRef    = useRef(null);
  const pagesRef        = useRef(pages);
  const currentIdxRef   = useRef(currentPageIndex);
  const orientationRef  = useRef(pageOrientation);

  useEffect(() => { pagesRef.current      = pages;             }, [pages]);
  useEffect(() => { currentIdxRef.current = currentPageIndex;  }, [currentPageIndex]);
  useEffect(() => { orientationRef.current = pageOrientation;  }, [pageOrientation]);

  // ── atualiza elemento ─────────────────────────────────────────────────────
  function updateElement(elementId, updates) {
    const newPages = [...pagesRef.current];
    const idx = newPages[currentIdxRef.current].elements.findIndex(
      (el) => el.id === elementId
    );
    if (idx !== -1) {
      newPages[currentIdxRef.current].elements[idx] = {
        ...newPages[currentIdxRef.current].elements[idx],
        ...updates,
      };
      setPages(newPages);
    }
  }

  // ── clique simples: seleciona + inicia drag ───────────────────────────────
  function handleMouseDown(e, element) {
    if (e.target.tagName === "TEXTAREA" || e.target.tagName === "INPUT") return;
    e.stopPropagation();

    setSelectedElement(element.id);
    selectedRef.current = element.id;

    const rect = canvasRef.current.getBoundingClientRect();
    const offset = {
      x: e.clientX - rect.left - element.x,
      y: e.clientY - rect.top  - element.y,
    };
    setDragOffset(offset);
    dragOffsetRef.current = offset;
    setIsDragging(true);
    isDraggingRef.current = true;
  }

  function handleDoubleClick(elementId) {
    setSelectedElement(elementId);
    selectedRef.current = elementId;
  }

  // ── resize ────────────────────────────────────────────────────────────────
  function handleResizeMouseDown(e, element, direction) {
    e.stopPropagation();
    e.preventDefault();
    setSelectedElement(element.id);
    selectedRef.current  = element.id;
    setResizeDirection(direction);
    resizeDirRef.current = direction;
    setIsResizing(true);
    isResizingRef.current = true;
  }

  // ── mouse move global ─────────────────────────────────────────────────────
  function handleMouseMove(e) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    if (isDraggingRef.current && selectedRef.current) {
      updateElement(selectedRef.current, {
        x: e.clientX - rect.left - dragOffsetRef.current.x,
        y: e.clientY - rect.top  - dragOffsetRef.current.y,
      });
      return;
    }

    if (isResizingRef.current && selectedRef.current) {
      const element = pagesRef.current[currentIdxRef.current].elements.find(
        (el) => el.id === selectedRef.current
      );
      if (!element) return;

      const dir    = resizeDirRef.current;
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      let updates  = {};

      if (dir === "se") {
        updates.width  = Math.max(60, mouseX - element.x);
        updates.height = Math.max(30, mouseY - element.y);
      } else if (dir === "sw") {
        const nw = Math.max(60, element.x + element.width - mouseX);
        updates  = { x: element.x + element.width - nw, width: nw,
                     height: Math.max(30, mouseY - element.y) };
      } else if (dir === "ne") {
        const nh = Math.max(30, element.y + element.height - mouseY);
        updates  = { width: Math.max(60, mouseX - element.x),
                     y: element.y + element.height - nh, height: nh };
      } else if (dir === "nw") {
        const nw = Math.max(60, element.x + element.width  - mouseX);
        const nh = Math.max(30, element.y + element.height - mouseY);
        updates  = { x: element.x + element.width  - nw,
                     y: element.y + element.height - nh,
                     width: nw, height: nh };
      }
      updateElement(selectedRef.current, updates);
    }
  }

  // ── mouse up global ───────────────────────────────────────────────────────
  function handleMouseUp() {
    setIsDragging(false);     isDraggingRef.current  = false;
    setIsResizing(false);     isResizingRef.current  = false;
    setResizeDirection(null); resizeDirRef.current   = null;
  }

  // ── drag over ─────────────────────────────────────────────────────────────
  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }

  // ── drop com snap grid ────────────────────────────────────────────────────
  function handleDrop(e) {
    e.preventDefault();

    const canvas = canvasRef.current;
    const rect   = canvas.getBoundingClientRect();
    const freeX  = Math.max(0, e.clientX - rect.left - 250);
    const freeY  = Math.max(0, e.clientY - rect.top  - 175);

    const orientation    = orientationRef.current;
    const currentEls     = pagesRef.current[currentIdxRef.current].elements;

    function applySnap(newEl) {
      const newPages = [...pagesRef.current];
      newPages[currentIdxRef.current].elements = snapToGrid(
        pagesRef.current[currentIdxRef.current].elements,
        newEl,
        orientation
      );
      setPages(newPages);
    }

    // 1. imagem da biblioteca
    const chartData = e.dataTransfer.getData("chart");
    if (chartData) {
      try {
        const chart = JSON.parse(chartData);
        applySnap({
          id: `image-${Date.now()}`, type: "image", chart,
          x: freeX, y: freeY, width: 500, height: 350,
        });
        return;
      } catch (err) {
        console.error("Erro ao adicionar imagem da biblioteca:", err);
      }
    }

    // 2. arquivo do computador
    const files = e.dataTransfer.files;
    if (files?.length > 0) {
      const file = files[0];
      if (!file.type.startsWith("image/")) {
        alert("Por favor, arraste apenas arquivos de imagem!");
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        applySnap({
          id: `image-${Date.now()}`, type: "external-image",
          src: ev.target.result, filename: file.name,
          x: freeX, y: freeY, width: 500, height: 350,
        });
      };
      reader.readAsDataURL(file);
      return;
    }

    // 3. URL via HTML
    const html     = e.dataTransfer.getData("text/html");
    const urlMatch = html.match(/src="([^"]+)"/);
    if (urlMatch?.[1]) {
      applySnap({
        id: `image-${Date.now()}`, type: "external-image",
        src: urlMatch[1],
        filename: urlMatch[1].split("/").pop() || "imagem-externa",
        x: freeX, y: freeY, width: 500, height: 350,
      });
      return;
    }

    // 4. URL texto simples
    const url = e.dataTransfer.getData("text/plain");
    if (url && (url.startsWith("http") || url.startsWith("data:image"))) {
      applySnap({
        id: `image-${Date.now()}`, type: "external-image",
        src: url,
        filename: url.split("/").pop() || "imagem-externa",
        x: freeX, y: freeY, width: 500, height: 350,
      });
    }
  }

  // ── listeners globais ─────────────────────────────────────────────────────
  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup",   handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup",   handleMouseUp);
    };
  }, []);

  return {
    selectedElement,
    setSelectedElement,
    isDragging,
    updateElement,
    handleMouseDown,
    handleDoubleClick,
    handleResizeMouseDown,
    handleDragOver,
    handleDrop,
  };
}   

