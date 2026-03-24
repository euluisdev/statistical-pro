import { useState, useEffect, useRef } from "react";

export function useDragDrop(canvasRef, pages, currentPageIndex, setPages) {
  const [selectedElement, setSelectedElement] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  //refs para ter acesso ao valor atual dentro dos listeners globais
  const isDraggingRef = useRef(false);
  const isResizingRef = useRef(false);
  const selectedRef = useRef(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const resizeDirRef = useRef(null);

  const currentPage = pages[currentPageIndex];
  const pagesRef = useRef(pages);
  const currentPageIndexRef = useRef(currentPageIndex);

  useEffect(() => { pagesRef.current = pages; }, [pages]);
  useEffect(() => { currentPageIndexRef.current = currentPageIndex; }, [currentPageIndex]);

  //update element
  function updateElement(elementId, updates) {
    const newPages = [...pagesRef.current];
    const idx = newPages[currentPageIndexRef.current].elements.findIndex(
      (el) => el.id === elementId
    );
    if (idx !== -1) {
      newPages[currentPageIndexRef.current].elements[idx] = {
        ...newPages[currentPageIndexRef.current].elements[idx],
        ...updates,
      };
      setPages(newPages);
    }
  }

  //clique simples no elemento select e começa drag 
  function handleMouseDown(e, element) {
    //ignora se veio de textarea modo edição de texto
    if (e.target.tagName === "TEXTAREA" || e.target.tagName === "INPUT") return;

    e.stopPropagation();

    //seleciona o elemento
    setSelectedElement(element.id);
    selectedRef.current = element.id;

    //prepara drag
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const offset = {
      x: e.clientX - rect.left - element.x,
      y: e.clientY - rect.top - element.y,
    };
    setDragOffset(offset);
    dragOffsetRef.current = offset;

    setIsDragging(true);
    isDraggingRef.current = true;
  }

  //duplo clique: usado pelo CanvasElement para entrar em modo edição
  //o CanvasElement gerencia o estado isEditing internamente
  function handleDoubleClick(elementId) {
    setSelectedElement(elementId);
    selectedRef.current = elementId;
  }

  //resize
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

  //mouse move global
  function handleMouseMove(e) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    if (isDraggingRef.current && selectedRef.current) {
      const x = e.clientX - rect.left - dragOffsetRef.current.x;
      const y = e.clientY - rect.top - dragOffsetRef.current.y;
      updateElement(selectedRef.current, { x, y });
      return;
    }

    if (isResizingRef.current && selectedRef.current) {
      const pages = pagesRef.current;
      const idx = currentPageIndexRef.current;
      const element = pages[idx].elements.find((el) => el.id === selectedRef.current);
      if (!element) return;

      const dir = resizeDirRef.current;
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      let updates = {};

      if (dir === "se") {
        updates.width = Math.max(60, mouseX - element.x);
        updates.height = Math.max(30, mouseY - element.y);
      } else if (dir === "sw") {
        const newWidth = Math.max(60, element.x + element.width - mouseX);
        updates.x = element.x + element.width - newWidth;
        updates.width = newWidth;
        updates.height = Math.max(30, mouseY - element.y);
      } else if (dir === "ne") {
        updates.width = Math.max(60, mouseX - element.x);
        const newHeight = Math.max(30, element.y + element.height - mouseY);
        updates.y = element.y + element.height - newHeight;
        updates.height = newHeight;
      } else if (dir === "nw") {
        const newWidth = Math.max(60, element.x + element.width - mouseX);
        const newHeight = Math.max(30, element.y + element.height - mouseY);
        updates.x = element.x + element.width - newWidth;
        updates.y = element.y + element.height - newHeight;
        updates.width = newWidth;
        updates.height = newHeight;
      }

      updateElement(selectedRef.current, updates);
    }
  }

  //mouse up global
  function handleMouseUp() {
    setIsDragging(false);
    isDraggingRef.current = false;
    setIsResizing(false);
    isResizingRef.current = false;
    setResizeDirection(null);
    resizeDirRef.current = null;
  }

  //clique no canvas vazio desseleciona
  //chamado pelo onclick do canvas no ReportBuilder quando e.target === e.currenttarget
  //drag & drop arquivos externos
  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }

  function handleDrop(e) {
    e.preventDefault();

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - 250;
    const y = e.clientY - rect.top - 175;

    //imagem da biblioteca
    const chartData = e.dataTransfer.getData("chart");
    if (chartData) {
      try {
        const chart = JSON.parse(chartData);
        const newElement = {
          id: `image-${Date.now()}`,
          type: "image",
          chart,
          x: Math.max(0, x),
          y: Math.max(0, y),
          width: 500,
          height: 350,
        };
        const newPages = [...pagesRef.current];
        newPages[currentPageIndexRef.current].elements.push(newElement);
        setPages(newPages);
        return;
      } catch (err) {
        console.error("Erro ao adicionar imagem da biblioteca:", err);
      }
    }

    //arquivo do computador
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (!file.type.startsWith("image/")) {
        alert("Por favor, arraste apenas arquivos de imagem!");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const newElement = {
          id: `image-${Date.now()}`,
          type: "external-image",
          src: event.target.result,
          filename: file.name,
          x: Math.max(0, x),
          y: Math.max(0, y),
          width: 500,
          height: 350,
        };
        const newPages = [...pagesRef.current];
        newPages[currentPageIndexRef.current].elements.push(newElement);
        setPages(newPages);
      };
      reader.readAsDataURL(file);
      return;
    }

    //URL via HTML
    const html = e.dataTransfer.getData("text/html");
    const urlMatch = html.match(/src="([^"]+)"/);
    if (urlMatch?.[1]) {
      const newElement = {
        id: `image-${Date.now()}`,
        type: "external-image",
        src: urlMatch[1],
        filename: urlMatch[1].split("/").pop() || "imagem-externa",
        x: Math.max(0, x),
        y: Math.max(0, y),
        width: 500,
        height: 350,
      };
      const newPages = [...pagesRef.current];
      newPages[currentPageIndexRef.current].elements.push(newElement);
      setPages(newPages);
      return;
    }

    //URL texto simples
    const url = e.dataTransfer.getData("text/plain");
    if (url && (url.startsWith("http") || url.startsWith("data:image"))) {
      const newElement = {
        id: `image-${Date.now()}`,
        type: "external-image",
        src: url,
        filename: url.split("/").pop() || "imagem-externa",
        x: Math.max(0, x),
        y: Math.max(0, y),
        width: 500,
        height: 350,
      };
      const newPages = [...pagesRef.current];
      newPages[currentPageIndexRef.current].elements.push(newElement);
      setPages(newPages);
    }
  }

  //listeners globais
  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []); //monta uma vez — usa refs para dados atuais

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

