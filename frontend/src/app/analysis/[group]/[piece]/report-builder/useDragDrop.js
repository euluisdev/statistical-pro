import { useState, useEffect, useRef } from "react";
import { snapDrop } from "./gridSnap";
import { computeSnapGuides } from "./snapGuides";
import { CANVAS } from "./gridSnap";

export function useDragDrop(canvasRef, pages, currentPageIndex, setPages, gridLayout, pageOrientation) {
  const [selectedElement, setSelectedElement] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [alignGuides, setAlignGuides] = useState([]); // ← linhas roxas

  // refs para listeners globais
  const isDraggingRef = useRef(false);
  const isResizingRef = useRef(false);
  const selectedRef = useRef(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const resizeDirRef = useRef(null);
  const pagesRef = useRef(pages);
  const currentPageIdxRef = useRef(currentPageIndex);
  const gridLayoutRef = useRef(gridLayout);
  const pageOrientationRef = useRef(pageOrientation);

  useEffect(() => { pagesRef.current = pages; }, [pages]);
  useEffect(() => { currentPageIdxRef.current = currentPageIndex; }, [currentPageIndex]);
  useEffect(() => { gridLayoutRef.current = gridLayout; }, [gridLayout]);
  useEffect(() => { pageOrientationRef.current = pageOrientation; }, [pageOrientation]);

  //helpers
  function getCanvasSize() {
    const orient = pageOrientationRef.current || "landscape";
    return CANVAS[orient] || CANVAS.landscape;
  }

  function getOthers(movingId) {
    const page = pagesRef.current[currentPageIdxRef.current];
    return page.elements.filter((el) => el.id !== movingId && el.width && el.height);
  }

  function updateElement(elementId, updates) {
    const newPages = [...pagesRef.current];
    const idx = newPages[currentPageIdxRef.current].elements.findIndex(
      (el) => el.id === elementId
    );
    if (idx !== -1) {
      newPages[currentPageIdxRef.current].elements[idx] = {
        ...newPages[currentPageIdxRef.current].elements[idx],
        ...updates,
      };
      setPages(newPages);
    }
  }

  // ── mouse down: seleciona + inicia drag ──────────────────────────────────
  function handleMouseDown(e, element) {
    if (e.target.tagName === "TEXTAREA" || e.target.tagName === "INPUT") return;
    e.stopPropagation();

    setSelectedElement(element.id);
    selectedRef.current = element.id;

    const rect = canvasRef.current.getBoundingClientRect();
    const offset = {
      x: e.clientX - rect.left - element.x,
      y: e.clientY - rect.top - element.y,
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
    selectedRef.current = element.id;
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

    // ── drag com snap de alinhamento ────────────────────────────────────────
    if (isDraggingRef.current && selectedRef.current) {
      const rawX = e.clientX - rect.left - dragOffsetRef.current.x;
      const rawY = e.clientY - rect.top - dragOffsetRef.current.y;

      // elemento atual (tamanho ainda não muda no drag)
      const page = pagesRef.current[currentPageIdxRef.current];
      const moving = page.elements.find((el) => el.id === selectedRef.current);
      if (!moving) return;

      const candidate = { ...moving, x: rawX, y: rawY };
      const others = getOthers(selectedRef.current);
      const canvas2d = getCanvasSize();

      const { snappedX, snappedY, guides } = computeSnapGuides(candidate, others, canvas2d);

      setAlignGuides(guides);
      updateElement(selectedRef.current, { x: snappedX, y: snappedY });
      return;
    }

    // ── resize (sem snap de alinhamento) ────────────────────────────────────
    if (isResizingRef.current && selectedRef.current) {
      const page = pagesRef.current[currentPageIdxRef.current];
      const element = page.elements.find((el) => el.id === selectedRef.current);
      if (!element) return;

      const dir = resizeDirRef.current;
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      let updates = {};

      if (dir === "se") {
        updates.width = Math.max(60, mouseX - element.x);
        updates.height = Math.max(30, mouseY - element.y);
      } else if (dir === "sw") {
        const nw = Math.max(60, element.x + element.width - mouseX);
        updates.x = element.x + element.width - nw;
        updates.width = nw;
        updates.height = Math.max(30, mouseY - element.y);
      } else if (dir === "ne") {
        updates.width = Math.max(60, mouseX - element.x);
        const nh = Math.max(30, element.y + element.height - mouseY);
        updates.y = element.y + element.height - nh;
        updates.height = nh;
      } else if (dir === "nw") {
        const nw = Math.max(60, element.x + element.width - mouseX);
        const nh = Math.max(30, element.y + element.height - mouseY);
        updates.x = element.x + element.width - nw;
        updates.y = element.y + element.height - nh;
        updates.width = nw;
        updates.height = nh;
      }

      updateElement(selectedRef.current, updates);
    }
  }

  // ── mouse up: limpa tudo ──────────────────────────────────────────────────
  function handleMouseUp() {
    setIsDragging(false);
    isDraggingRef.current = false;
    setIsResizing(false);
    isResizingRef.current = false;
    setResizeDirection(null);
    resizeDirRef.current = null;
    setAlignGuides([]);      // ← remove linhas roxas ao soltar
  }

  // ── drag & drop da biblioteca ─────────────────────────────────────────────
  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }

  function handleDrop(e) {
    e.preventDefault();

    const rect = canvasRef.current.getBoundingClientRect();
    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;

    const snapped = snapDrop(rawX, rawY, gridLayoutRef.current, pageOrientationRef.current);

    function addElement(el) {
      const newPages = [...pagesRef.current];
      newPages[currentPageIdxRef.current].elements.push(el);
      setPages(newPages);
    }

    // imagem da biblioteca
    const chartData = e.dataTransfer.getData("chart");
    if (chartData) {
      try {
        addElement({ id: `image-${Date.now()}`, type: "image", chart: JSON.parse(chartData), ...snapped });
      } catch (err) { console.error(err); }
      return;
    }

    // arquivo local
    const files = e.dataTransfer.files;
    if (files?.length > 0) {
      const file = files[0];
      if (!file.type.startsWith("image/")) { alert("Apenas imagens!"); return; }
      const reader = new FileReader();
      reader.onload = (ev) =>
        addElement({ id: `image-${Date.now()}`, type: "external-image", src: ev.target.result, filename: file.name, ...snapped });
      reader.readAsDataURL(file);
      return;
    }

    // URL via HTML
    const html = e.dataTransfer.getData("text/html");
    const urlMatch = html.match(/src="([^"]+)"/);
    if (urlMatch?.[1]) {
      addElement({ id: `image-${Date.now()}`, type: "external-image", src: urlMatch[1], filename: urlMatch[1].split("/").pop() || "img", ...snapped });
      return;
    }

    // URL texto simples
    const url = e.dataTransfer.getData("text/plain");
    if (url && (url.startsWith("http") || url.startsWith("data:image"))) {
      addElement({ id: `image-${Date.now()}`, type: "external-image", src: url, filename: url.split("/").pop() || "img", ...snapped });
    }
  }

  // ── listeners globais (uma vez) ───────────────────────────────────────────
  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return {
    selectedElement,
    setSelectedElement,
    isDragging,
    alignGuides,       // ← novo: passa para o canvas renderizar
    updateElement,
    handleMouseDown,
    handleDoubleClick,
    handleResizeMouseDown,
    handleDragOver,
    handleDrop,
  };
}