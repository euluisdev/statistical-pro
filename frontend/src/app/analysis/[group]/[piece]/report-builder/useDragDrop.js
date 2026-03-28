import { useEffect, useRef, useState } from "react";
import { useReportStore } from "./useReportStore";
import { snapDrop, CANVAS } from "./gridSnap";
import { computeSnapGuides } from "./snapGuides";
 
export function useDragDrop(canvasRef) {
  const [isDragging, setIsDragging] = useState(false);
 
  //actions do store
  const updateElement    = useReportStore((s) => s.updateElement);
  const addElement       = useReportStore((s) => s.addElement);
  const setSelectedId    = useReportStore((s) => s.setSelectedElementId);
  const setAlignGuides   = useReportStore((s) => s.setAlignGuides);     
  const clearAlignGuides = useReportStore((s) => s.clearAlignGuides);
 
  //refs para listeners globais (sem re-render)
  const isDraggingRef   = useRef(false);
  const isResizingRef   = useRef(false);
  const selectedRef     = useRef(null);
  const dragOffsetRef   = useRef({ x: 0, y: 0 });
  const resizeDirRef    = useRef(null);
 
  //refs para estado atual do store (sem subscrição)
  const storeRef = useRef(null);
  useEffect(() => {
    storeRef.current = useReportStore.getState;
  }, []);
 
  function getState() {
    return useReportStore.getState();
  }
 
  //helpers
  function getCanvasRect() {
    return canvasRef.current?.getBoundingClientRect() ?? { left: 0, top: 0 };
  }
 
  function getOthers(movingId) {
    const { pages, currentPageIndex } = getState();
    return (pages[currentPageIndex]?.elements ?? []).filter(
      (el) => el.id !== movingId && el.width && el.height
    );
  }
 
  // mouse down: seleciona + inicia drag
  function handleMouseDown(e, element) {
    if (e.target.tagName === "TEXTAREA" || e.target.tagName === "INPUT") return;
    e.stopPropagation();
 
    setSelectedId(element.id);
    selectedRef.current = element.id;
 
    const rect = getCanvasRect();
    const offset = {
      x: e.clientX - rect.left - element.x,
      y: e.clientY - rect.top  - element.y,
    };
    dragOffsetRef.current = offset;
    setIsDragging(true);
    isDraggingRef.current = true;
  }
 
  //duplo clique
  function handleDoubleClick(elementId) {
    setSelectedId(elementId);
    selectedRef.current = elementId;
  }
 
  //resize
  function handleResizeMouseDown(e, element, direction) {
    e.stopPropagation();
    e.preventDefault();
    setSelectedId(element.id);
    selectedRef.current  = element.id;
    resizeDirRef.current = direction;
    isResizingRef.current = true;
  }
 
  //mouse move global
  function handleMouseMove(e) {
    if (!canvasRef.current) return;
    const rect = getCanvasRect();
 
    // drag com snap de alinhamento
    if (isDraggingRef.current && selectedRef.current) {
      const rawX = e.clientX - rect.left - dragOffsetRef.current.x;
      const rawY = e.clientY - rect.top  - dragOffsetRef.current.y;
 
      const { pages, currentPageIndex, pageOrientation } = getState();
      const moving = pages[currentPageIndex]?.elements.find((el) => el.id === selectedRef.current);
      if (!moving) return;
 
      const candidate = { ...moving, x: rawX, y: rawY };
      const others    = getOthers(selectedRef.current);
      const canvasSize = CANVAS[pageOrientation] || CANVAS.landscape;
 
      const { snappedX, snappedY, guides } = computeSnapGuides(candidate, others, canvasSize);
 
      setAlignGuides(guides);
      updateElement(selectedRef.current, { x: snappedX, y: snappedY });
      return;
    }
 
    // resize
    if (isResizingRef.current && selectedRef.current) {
      const { pages, currentPageIndex } = getState();
      const element = pages[currentPageIndex]?.elements.find((el) => el.id === selectedRef.current);
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
        updates.x = element.x + element.width - nw; updates.width = nw;
        updates.height = Math.max(30, mouseY - element.y);
      } else if (dir === "ne") {
        updates.width = Math.max(60, mouseX - element.x);
        const nh = Math.max(30, element.y + element.height - mouseY);
        updates.y = element.y + element.height - nh; updates.height = nh;
      } else if (dir === "nw") {
        const nw = Math.max(60, element.x + element.width - mouseX);
        const nh = Math.max(30, element.y + element.height - mouseY);
        updates.x = element.x + element.width - nw;
        updates.y = element.y + element.height - nh;
        updates.width = nw; updates.height = nh;
      }
 
      updateElement(selectedRef.current, updates);
    }
  }
 
  //mouse up
  function handleMouseUp() {
    setIsDragging(false);
    isDraggingRef.current  = false;
    isResizingRef.current  = false;
    resizeDirRef.current   = null;
    clearAlignGuides();
  }
 
  // ── drag over / drop
  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }
 
  function handleDrop(e) {
    e.preventDefault();
    const rect   = getCanvasRect();
    const rawX   = e.clientX - rect.left;
    const rawY   = e.clientY - rect.top;
    const { gridLayout, pageOrientation } = getState();
    const snapped = snapDrop(rawX, rawY, gridLayout, pageOrientation);
 
    function push(el) { addElement({ ...el, ...snapped }); }
 
    const chartData = e.dataTransfer.getData("chart");
    if (chartData) {
      try { push({ id: `image-${Date.now()}`, type: "image", chart: JSON.parse(chartData) }); }
      catch (err) { console.error(err); }
      return;
    }
 
    const files = e.dataTransfer.files;
    if (files?.length > 0) {
      const file = files[0];
      if (!file.type.startsWith("image/")) { alert("Apenas imagens!"); return; }
      const reader = new FileReader();
      reader.onload = (ev) =>
        push({ id: `image-${Date.now()}`, type: "external-image", src: ev.target.result, filename: file.name });
      reader.readAsDataURL(file);
      return;
    }
 
    const html = e.dataTransfer.getData("text/html");
    const urlMatch = html.match(/src="([^"]+)"/);
    if (urlMatch?.[1]) {
      push({ id: `image-${Date.now()}`, type: "external-image", src: urlMatch[1], filename: urlMatch[1].split("/").pop() || "img" });
      return;
    }
 
    const url = e.dataTransfer.getData("text/plain");
    if (url && (url.startsWith("http") || url.startsWith("data:image"))) {
      push({ id: `image-${Date.now()}`, type: "external-image", src: url, filename: url.split("/").pop() || "img" });
    }
  }
 
  //listeners globais monta uma vez
  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup",   handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup",   handleMouseUp);
    };
  }, []);
 
  return {
    isDragging,
    handleMouseDown,
    handleDoubleClick,
    handleResizeMouseDown,
    handleDragOver,
    handleDrop,
  };
}   
 
 
 