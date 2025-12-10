"use client";

import { useState, useEffect, useRef } from "react";
import { 
  X, Download, FileText, Plus, Trash2, Bold, Italic, 
  Underline, Type, Copy, Layers
} from "lucide-react";
import styles from "./reportbuilder.module.css";

export default function ReportBuilder() {
  const [currentJobId, setCurrentJobId] = useState(null);
  const [availableCharts, setAvailableCharts] = useState([]);
  const [pages, setPages] = useState([{ id: 1, elements: [] }]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [selectedElement, setSelectedElement] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef(null);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const currentPage = pages[currentPageIndex];

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedJobId = localStorage.getItem("current_jobid");
      setCurrentJobId(storedJobId);
      if (storedJobId) loadJobCharts(storedJobId);
    }
  }, []);

  async function loadJobCharts(jobId) {
    setLoading(true);
    try {
      const res = await fetch(`${API}/jobs/job/${jobId}/charts`);
      if (res.ok) {
        const data = await res.json();
        setAvailableCharts(data.charts || []);
      }
    } catch (err) {
      console.error("Erro ao carregar gráficos:", err);
    } finally {
      setLoading(false);
    }
  }

  function addNewPage() {
    const newPage = { id: Date.now(), elements: [] };
    setPages([...pages, newPage]);
    setCurrentPageIndex(pages.length);
  }

  function deletePage(index) {
    if (pages.length === 1) {
      alert("Você precisa ter pelo menos uma página!");
      return;
    }
    const newPages = pages.filter((_, i) => i !== index);
    setPages(newPages);
    if (currentPageIndex >= newPages.length) {
      setCurrentPageIndex(newPages.length - 1);
    }
  }

  function duplicatePage(index) {
    const pageToDuplicate = pages[index];
    const newPage = {
      id: Date.now(),
      elements: JSON.parse(JSON.stringify(pageToDuplicate.elements))
    };
    const newPages = [...pages];
    newPages.splice(index + 1, 0, newPage);
    setPages(newPages);
  }

  function addTextBox() {
    const newElement = {
      id: `text-${Date.now()}`,
      type: "text",
      content: "Digite aqui...",
      x: 100,
      y: 100,
      width: 300,
      height: 100,
      fontSize: 16,
      fontWeight: "normal",
      fontStyle: "normal",
      textDecoration: "none",
      color: "#000000"
    };
    
    const newPages = [...pages];
    newPages[currentPageIndex].elements.push(newElement);
    setPages(newPages);
    setSelectedElement(newElement.id);
  }

  function deleteElement(elementId) {
    const newPages = [...pages];
    newPages[currentPageIndex].elements = newPages[currentPageIndex].elements.filter(
      el => el.id !== elementId
    );
    setPages(newPages);
    setSelectedElement(null);
  }

  function duplicateElement(elementId) {
    const element = currentPage.elements.find(el => el.id === elementId);
    if (!element) return;

    const newElement = {
      ...JSON.parse(JSON.stringify(element)),
      id: `${element.type}-${Date.now()}`,
      x: element.x + 20,
      y: element.y + 20
    };

    const newPages = [...pages];
    newPages[currentPageIndex].elements.push(newElement);
    setPages(newPages);
  }

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
    setSelectedElement(element.id);
    setIsDragging(true);
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    setDragOffset({
      x: e.clientX - rect.left - element.x,
      y: e.clientY - rect.top - element.y
    });
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

  // Drag and Drop da biblioteca para o canvas
  function handleDragStart(e, chart) {
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("chart", JSON.stringify(chart));
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
      
      // Verifica se é imagem
      if (!file.type.startsWith('image/')) {
        alert('Por favor, arraste apenas arquivos de imagem!');
        return;
      }

      // Lê o arquivo como base64
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

    // Tenta pegar URL de imagem (drag de outra aba/site)
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

  const selectedElementData = currentPage.elements.find(el => el.id === selectedElement);

  if (!currentJobId) {
    return (
      <div className={styles.emptyState}>
        <FileText size={64} color="#cbd5e0" />
        <h2>Nenhum Job Ativo</h2>
        <p>Crie um Job na página inicial para começar.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Sidebar Esquerda */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h3 className={styles.sidebarTitle}>📚 Biblioteca de Assets</h3>
          <p className={styles.sidebarSubtitle}>Job: {currentJobId?.slice(0, 8)}...</p>
        </div>

        <div className={styles.librarySection}>
          <button onClick={addTextBox} className={styles.addTextButton}>
            <Type size={16} />
            Nova Caixa de Texto
          </button>
        </div>

        <div className={styles.libraryContent}>
          <h4 className={styles.libraryTitle}>
            Imagens Salvas ({availableCharts.length})
          </h4>

          {loading ? (
            <p style={{ color: "#718096", fontSize: "0.85rem" }}>Carregando...</p>
          ) : availableCharts.length === 0 ? (
            <p style={{ color: "#a0aec0", fontSize: "0.8rem", lineHeight: "1.4" }}>
              Nenhuma imagem. Salve gráficos nas páginas de análise.
            </p>
          ) : (
            <div>
              {availableCharts.map((chart, idx) => (
                <div
                  key={idx}
                  draggable
                  onDragStart={(e) => handleDragStart(e, chart)}
                  className={styles.chartItem}
                >
                  📊 {chart.filename}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Área Central */}
      <div className={styles.mainArea}>
        {/* Toolbar */}
        <div className={styles.toolbar}>
          <h1 className={styles.toolbarTitle}>📄 Montagem de Relatório</h1>

          {selectedElementData && selectedElementData.type === "text" && (
            <div className={styles.formatToolbar}>
              <select
                value={selectedElementData.fontSize}
                onChange={(e) => updateElement(selectedElement, { fontSize: Number(e.target.value) })}
                className={styles.fontSizeSelect}
              >
                {[10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48].map(size => (
                  <option key={size} value={size}>{size}px</option>
                ))}
              </select>

              <button
                onClick={() => updateElement(selectedElement, {
                  fontWeight: selectedElementData.fontWeight === "bold" ? "normal" : "bold"
                })}
                className={styles.formatButton}
                style={{
                  backgroundColor: selectedElementData.fontWeight === "bold" ? "#4299e1" : "#edf2f7",
                  color: selectedElementData.fontWeight === "bold" ? "white" : "#4a5568"
                }}
              >
                <Bold size={16} />
              </button>

              <button
                onClick={() => updateElement(selectedElement, {
                  fontStyle: selectedElementData.fontStyle === "italic" ? "normal" : "italic"
                })}
                className={styles.formatButton}
                style={{
                  backgroundColor: selectedElementData.fontStyle === "italic" ? "#4299e1" : "#edf2f7",
                  color: selectedElementData.fontStyle === "italic" ? "white" : "#4a5568"
                }}
              >
                <Italic size={16} />
              </button>

              <button
                onClick={() => updateElement(selectedElement, {
                  textDecoration: selectedElementData.textDecoration === "underline" ? "none" : "underline"
                })}
                className={styles.formatButton}
                style={{
                  backgroundColor: selectedElementData.textDecoration === "underline" ? "#4299e1" : "#edf2f7",
                  color: selectedElementData.textDecoration === "underline" ? "white" : "#4a5568"
                }}
              >
                <Underline size={16} />
              </button>

              <input
                type="color"
                value={selectedElementData.color}
                onChange={(e) => updateElement(selectedElement, { color: e.target.value })}
                className={styles.colorPicker}
              />
            </div>
          )}

          <button onClick={() => alert("Exportação em desenvolvimento")} className={styles.exportButton}>
            <Download size={16} />
            Exportar PDF
          </button>
        </div>

        {/* Canvas */}
        <div className={styles.canvasArea}>
          <div
            ref={canvasRef}
            className={styles.canvas}
            style={{ cursor: isDragging ? "grabbing" : "default" }}
            onClick={() => setSelectedElement(null)}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {currentPage.elements.map((element) => (
              <div
                key={element.id}
                onMouseDown={(e) => handleMouseDown(e, element)}
                className={styles.canvasElement}
                style={{
                  left: `${element.x}px`,
                  top: `${element.y}px`,
                  width: `${element.width}px`,
                  height: element.type === "text" ? `${element.height}px` : "auto",
                  border: selectedElement === element.id ? "2px solid #4299e1" : "1px dashed transparent",
                  cursor: isDragging ? "grabbing" : "move"
                }}
              >
                {element.type === "image" && (
                  <>
                    <img
                      src={`${API}/static/jobs/${currentJobId}/${element.chart.group}/${element.chart.filename}`}
                      alt={element.chart.filename}
                      className={styles.image}
                      draggable={false}
                      onError={(e) => {
                        console.error("Erro ao carregar imagem:", element.chart);
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML += `<div style="padding: 1rem; color: red; text-align: center;">❌ Erro ao carregar: ${element.chart.filename}</div>`;
                      }}
                    />
                    {selectedElement === element.id && (
                      <>
                        <div
                          onMouseDown={(e) => handleResizeMouseDown(e, element)}
                          className={styles.resizeHandle}
                        />
                        <div className={styles.elementActions}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              duplicateElement(element.id);
                            }}
                            className={`${styles.actionButton} ${styles.duplicateButton}`}
                          >
                            <Copy size={14} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteElement(element.id);
                            }}
                            className={`${styles.actionButton} ${styles.deleteButton}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </>
                    )}
                  </>
                )}

                {element.type === "external-image" && (
                  <>
                    <img
                      src={element.src}
                      alt={element.filename}
                      className={styles.image}
                      draggable={false}
                      onError={(e) => {
                        console.error("Erro ao carregar imagem externa:", element.filename);
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML += `<div style="padding: 1rem; color: red; text-align: center;">❌ Erro ao carregar: ${element.filename}</div>`;
                      }}
                    />
                    {selectedElement === element.id && (
                      <>
                        <div
                          onMouseDown={(e) => handleResizeMouseDown(e, element)}
                          className={styles.resizeHandle}
                        />
                        <div className={styles.elementActions}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              duplicateElement(element.id);
                            }}
                            className={`${styles.actionButton} ${styles.duplicateButton}`}
                          >
                            <Copy size={14} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteElement(element.id);
                            }}
                            className={`${styles.actionButton} ${styles.deleteButton}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </>
                    )}
                  </>
                )}

                {element.type === "text" && (
                  <>
                    <textarea
                      value={element.content}
                      onChange={(e) => updateElement(element.id, { content: e.target.value })}
                      onClick={(e) => e.stopPropagation()}
                      className={styles.textarea}
                      style={{
                        fontSize: `${element.fontSize}px`,
                        fontWeight: element.fontWeight,
                        fontStyle: element.fontStyle,
                        textDecoration: element.textDecoration,
                        color: element.color
                      }}
                    />
                    {selectedElement === element.id && (
                      <>
                        <div
                          onMouseDown={(e) => handleResizeMouseDown(e, element)}
                          className={styles.resizeHandle}
                        />
                        <div className={styles.elementActions}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              duplicateElement(element.id);
                            }}
                            className={`${styles.actionButton} ${styles.duplicateButton}`}
                          >
                            <Copy size={14} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteElement(element.id);
                            }}
                            className={`${styles.actionButton} ${styles.deleteButton}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar Direita - Páginas */}
      <div className={styles.pagesSidebar}>
        <div className={styles.pagesHeader}>
          <h3 className={styles.pagesTitle}>
            <Layers size={16} style={{ verticalAlign: "middle", marginRight: "0.3rem" }} />
            Páginas
          </h3>
          <button onClick={addNewPage} className={styles.addPageButton}>
            <Plus size={16} />
          </button>
        </div>

        <div className={styles.pagesContent}>
          {pages.map((page, index) => (
            <div
              key={page.id}
              onClick={() => setCurrentPageIndex(index)}
              className={styles.pageItem}
              style={{
                border: currentPageIndex === index ? "2px solid #4299e1" : "1px solid #e2e8f0",
                backgroundColor: currentPageIndex === index ? "#ebf8ff" : "white"
              }}
            >
              <div className={styles.pagePreview}>
                <div className={styles.pagePreviewContent}>
                  {page.elements.map((el) => (
                    <div
                      key={el.id}
                      className={styles.pagePreviewElement}
                      style={{
                        left: `${el.x}px`,
                        top: `${el.y}px`,
                        width: `${el.width}px`,
                        height: el.type === "text" ? `${el.height}px` : "auto",
                        backgroundColor: el.type === "text" ? "#e2e8f0" : "transparent"
                      }}
                    >
                      {el.type === "image" && (
                        <img
                          src={`${API}/static/jobs/${currentJobId}/${el.chart.group}/${el.chart.filename}`}
                          alt=""
                          style={{ width: "100%", height: "auto" }}
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      )}
                      {el.type === "external-image" && (
                        <img
                          src={el.src}
                          alt=""
                          style={{ width: "100%", height: "auto" }}
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.pageInfo}>
                <span className={styles.pageNumber}>Página {index + 1}</span>
                <div className={styles.pageActions}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicatePage(index);
                    }}
                    className={styles.pageActionButton}
                    style={{ backgroundColor: "#edf2f7" }}
                  >
                    <Copy size={12} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePage(index);
                    }}
                    className={styles.pageActionButton}
                    style={{ backgroundColor: "#fed7d7" }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 
