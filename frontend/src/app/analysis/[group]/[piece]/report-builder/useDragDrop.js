import { useState, useEffect } from "react";

export function useDragDrop(canvasRef, pages, currentPageIndex, setPages) {
  const [selectedElement, setSelectedElement] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const currentPage = pages[currentPageIndex];

  function updateElement(elementId, updates) {
    const newPages = [...pages];
    const elementIndex = newPages[currentPageIndex].elements.findIndex(
      el => el.id === elementId
    );
    if (elementIndex !== -1) {
      newPages[currentPageIndex].elements[elementIndex] = {
        ...newPages[currentPageIndex].elements[elementIndex],
        ...updates
      };
      setPages(newPages);
    }
  }

  function handleMouseDown(e, element) {
    if (e.target.tagName === "TEXTAREA") return;
    
    e.stopPropagation();
    
    // Não muda seleção ao arrastar
    if (!selectedElement || selectedElement !== element.id) {
      return; // Só permite arrastar se já estiver selecionado
    }
    
    setIsDragging(true);
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    setDragOffset({
      x: e.clientX - rect.left - element.x,
      y: e.clientY - rect.top - element.y
    });
  }

  function handleDoubleClick(elementId) {
    // Se já está selecionado, desseleciona
    if (selectedElement === elementId) {
      setSelectedElement(null);
    } else {
      // Caso contrário, seleciona
      setSelectedElement(elementId);
    }
  }

  function handleMouseMove(e) {
    if (!isDragging || !selectedElement) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;

    updateElement(selectedElement, { x, y });
  }

  function handleMouseUp() {
    setIsDragging(false);
    setIsResizing(false);
  }

  function handleResizeMouseDown(e, element) {
    e.stopPropagation();
    setIsResizing(true);
    setSelectedElement(element.id);
  }

  function handleResizeMove(e) {
    if (!isResizing || !selectedElement) return;

    const element = currentPage.elements.find(el => el.id === selectedElement);
    if (!element) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    const width = Math.max(100, e.clientX - rect.left - element.x);
    const height = Math.max(50, e.clientY - rect.top - element.y);

    updateElement(selectedElement, { width, height });
  }

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

    // Tenta pegar imagem da biblioteca
    const chartData = e.dataTransfer.getData("chart");
    if (chartData) {
      try {
        const chart = JSON.parse(chartData);
        const newElement = {
          id: `image-${Date.now()}`,
          type: "image",
          chart: chart,
          x: Math.max(0, x),
          y: Math.max(0, y),
          width: 500,
          height: 350
        };

        const newPages = [...pages];
        newPages[currentPageIndex].elements.push(newElement);
        setPages(newPages);
        return;
      } catch (err) {
        console.error("Erro ao adicionar imagem da biblioteca:", err);
      }
    }

    // Tenta pegar arquivo do computador
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      if (!file.type.startsWith('image/')) {
        alert('Por favor, arraste apenas arquivos de imagem!');
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
          height: 350
        };

        const newPages = [...pages];
        newPages[currentPageIndex].elements.push(newElement);
        setPages(newPages);
      };
      reader.readAsDataURL(file);
      return;
    }

    // Tenta pegar URL de imagem
    const html = e.dataTransfer.getData('text/html');
    const urlMatch = html.match(/src="([^"]+)"/);
    
    if (urlMatch && urlMatch[1]) {
      const imageUrl = urlMatch[1];
      
      const newElement = {
        id: `image-${Date.now()}`,
        type: "external-image",
        src: imageUrl,
        filename: imageUrl.split('/').pop() || 'imagem-externa',
        x: Math.max(0, x),
        y: Math.max(0, y),
        width: 500,
        height: 350
      };

      const newPages = [...pages];
      newPages[currentPageIndex].elements.push(newElement);
      setPages(newPages);
      return;
    }

    // Tenta URL de texto simples
    const url = e.dataTransfer.getData('text/plain');
    if (url && (url.startsWith('http') || url.startsWith('data:image'))) {
      const newElement = {
        id: `image-${Date.now()}`,
        type: "external-image",
        src: url,
        filename: url.split('/').pop() || 'imagem-externa',
        x: Math.max(0, x),
        y: Math.max(0, y),
        width: 500,
        height: 350
      };

      const newPages = [...pages];
      newPages[currentPageIndex].elements.push(newElement);
      setPages(newPages);
    }
  }

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else if (isResizing) {
      window.addEventListener("mousemove", handleResizeMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousemove", handleResizeMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isResizing, selectedElement, dragOffset]);

  return {
    selectedElement,
    setSelectedElement,
    isDragging,
    updateElement,
    handleMouseDown,
    handleDoubleClick,
    handleResizeMouseDown,
    handleDragOver,
    handleDrop
  };
} 
   
 
