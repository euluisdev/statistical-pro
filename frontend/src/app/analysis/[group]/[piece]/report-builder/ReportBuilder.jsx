"use client";

import { useState, useEffect, useRef } from "react";
import { Download, FileText, RotateCw, ZoomIn, ZoomOut } from "lucide-react";
import styles from "./reportbuilder.module.css";

import LibrarySidebar from "./LibrarySidebar";
import PagesSidebar from "./PagesSidebar";
import FormatToolbar from "./FormatToolbar";
import CanvasElement from "./CanvasElement";
import { useDragDrop } from "./useDragDrop";

export default function ReportBuilder() {
  const [currentJobId, setCurrentJobId] = useState(null);
  const [availableCharts, setAvailableCharts] = useState([]);
  const [pages, setPages] = useState([{ id: 1, elements: [] }]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageOrientation, setPageOrientation] = useState("landscape"); // landscape ou portrait
  const canvasRef = useRef(null);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const currentPage = pages[currentPageIndex];

  const {
    selectedElement,
    setSelectedElement,
    isDragging,
    updateElement,
    handleMouseDown,
    handleDoubleClick,
    handleResizeMouseDown,
    handleDragOver,
    handleDrop
  } = useDragDrop(canvasRef, pages, currentPageIndex, setPages);

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

  async function exportToPDF() {
    try {
      // Importa html2canvas e jsPDF dinamicamente
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const pdf = new jsPDF({
        orientation: pageOrientation === "landscape" ? "l" : "p",
        unit: "mm",
        format: "a4"
      });

      for (let i = 0; i < pages.length; i++) {
        // Temporariamente muda para a página
        setCurrentPageIndex(i);
        
        // Aguarda um pouco para renderizar
        await new Promise(resolve => setTimeout(resolve, 100));

        const canvas = canvasRef.current;
        const canvasImage = await html2canvas(canvas, {
          scale: 2,
          useCORS: true,
          logging: false
        });

        const imgData = canvasImage.toDataURL('image/png');
        
        if (i > 0) {
          pdf.addPage();
        }

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      }

      pdf.save(`relatorio_${currentJobId?.slice(0, 8)}_${Date.now()}.pdf`);
      alert('✓ PDF exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      alert('❌ Erro ao exportar PDF. Verifique o console para mais detalhes.');
    }
  }

  function toggleOrientation() {
    setPageOrientation(prev => prev === "landscape" ? "portrait" : "landscape");
  }

  function handleDragStart(e, chart) {
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("chart", JSON.stringify(chart));
  }

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
      <LibrarySidebar
        currentJobId={currentJobId}
        availableCharts={availableCharts}
        loading={loading}
        onAddTextBox={addTextBox}
        onDragStart={handleDragStart}
      />

      <div className={styles.mainArea}>
        <div className={styles.toolbar}>
          <h1 className={styles.toolbarTitle}>Montagem de Relatório</h1>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <FormatToolbar 
              element={selectedElementData}
              onUpdate={updateElement}
            />
            
            <div style={{ 
              height: "30px", 
              width: "1px", 
              backgroundColor: "#e2e8f0" 
            }} />

            <button
              onClick={toggleOrientation}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#edf2f7",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.85rem",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                color: "#4a5568"
              }}
              title={`Mudar para ${pageOrientation === "landscape" ? "retrato" : "paisagem"}`}
            >
              <RotateCw size={16} />
              {pageOrientation === "landscape" ? "Paisagem" : "Retrato"}
            </button>
          </div>

          <button 
            onClick={exportToPDF} 
            className={styles.exportButton}
          >
            <Download size={16} />
            Exportar PDF
          </button>
        </div>

        <div className={styles.canvasArea}>
          <div
            ref={canvasRef}
            className={styles.canvas}
            style={{ 
              cursor: isDragging ? "grabbing" : "default",
              width: pageOrientation === "landscape" ? "297mm" : "210mm",
              height: pageOrientation === "landscape" ? "210mm" : "297mm"
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setSelectedElement(null);
              }
            }}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {currentPage.elements.map((element) => (
              <CanvasElement
                key={element.id}
                element={element}
                isSelected={selectedElement === element.id}
                currentJobId={currentJobId}
                API={API}
                onMouseDown={handleMouseDown}
                onDoubleClick={handleDoubleClick}
                onResizeMouseDown={handleResizeMouseDown}
                onUpdate={updateElement}
                onDuplicate={duplicateElement}
                onDelete={deleteElement}
              />
            ))}
          </div>
        </div>
      </div>

      <PagesSidebar
        pages={pages}
        currentPageIndex={currentPageIndex}
        currentJobId={currentJobId}
        API={API}
        onPageSelect={setCurrentPageIndex}
        onAddPage={addNewPage}
        onDuplicatePage={duplicatePage}
        onDeletePage={deletePage}
      />
    </div>
  );
}  
 
