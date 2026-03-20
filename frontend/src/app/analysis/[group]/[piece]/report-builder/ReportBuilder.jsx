"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Download, FileText, RotateCw, Save, FolderOpen, Check, Loader } from "lucide-react";
import { useParams } from "next/navigation";
import styles from "./reportbuilder.module.css";

import LibrarySidebar from "./LibrarySidebar";
import PagesSidebar from "./PagesSidebar";
import FormatToolbar from "./FormatToolbar";
import CanvasElement from "./CanvasElement";
import ReportsList from "./ReportsList";
import { useDragDrop } from "./useDragDrop";

export default function ReportBuilder() {
  const [currentJobId, setCurrentJobId] = useState(null);
  const [availableCharts, setAvailableCharts] = useState([]);
  const [pages, setPages] = useState([{ id: 1, elements: [] }]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageOrientation, setPageOrientation] = useState("landscape");
  const [reportName, setReportName] = useState("Relatório sem título");
  const [showReportsList, setShowReportsList] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // null | 'saved' | 'error'
  const canvasRef = useRef(null);
  const saveTimer = useRef(null); // mesmo padrão das outras pages

  const { group, piece } = useParams();
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
    handleDrop,
  } = useDragDrop(canvasRef, pages, currentPageIndex, setPages);

  // ── 1. carrega layout ao montar — mesmo padrão do useEffect das outras pages
  useEffect(() => {
    if (!group || !piece) return;
    fetch(`${API}/reportbuilder/${group}/${piece}/layout`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d || !d.pages) return; // {} = canvas vazio, ignora
        setPages(d.pages);
        if (d.pageOrientation) setPageOrientation(d.pageOrientation);
        if (d.reportName) setReportName(d.reportName);
      })
      .catch(() => {});
  }, [group, piece]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedJobId = localStorage.getItem("current_jobid");
      setCurrentJobId(storedJobId);
      if (storedJobId) loadJobCharts(storedJobId);
    }
  }, []);

  // ── 2. auto-save com debounce — exatamente como persistLayout das outras pages
  const persistLayout = useCallback(
    (newPages, newOrientation, newName) => {
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        fetch(`${API}/reportbuilder/${group}/${piece}/layout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pages: newPages,
            pageOrientation: newOrientation,
            reportName: newName,
          }),
        })
          .then((r) => {
            if (r.ok) {
              setSaveStatus("saved");
              setTimeout(() => setSaveStatus(null), 3000);
            }
          })
          .catch(() => {});
      }, 800);
    },
    [group, piece, API]
  );

  // dispara auto-save sempre que pages ou orientação mudar
  useEffect(() => {
    if (!group || !piece) return;
    persistLayout(pages, pageOrientation, reportName);
  }, [pages, pageOrientation]);

  // ── charts do job ─────────────────────────────────────────────────────────
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

  // ── carregar snapshot da lista ────────────────────────────────────────────
  function handleLoadSnapshot(data) {
    if (!data) return;
    if (data.pages) setPages(data.pages);
    if (data.pageOrientation) setPageOrientation(data.pageOrientation);
    if (data.reportName) setReportName(data.reportName);
    setCurrentPageIndex(0);
    setSelectedElement(null);
  }

  // ── páginas ───────────────────────────────────────────────────────────────
  function addNewPage() {
    const newPages = [...pages, { id: Date.now(), elements: [] }];
    setPages(newPages);
    setCurrentPageIndex(newPages.length - 1);
  }

  function deletePage(index) {
    if (pages.length === 1) {
      alert("Você precisa ter pelo menos uma página!");
      return;
    }
    const newPages = pages.filter((_, i) => i !== index);
    setPages(newPages);
    if (currentPageIndex >= newPages.length) setCurrentPageIndex(newPages.length - 1);
  }

  function duplicatePage(index) {
    const newPages = [...pages];
    newPages.splice(index + 1, 0, {
      id: Date.now(),
      elements: JSON.parse(JSON.stringify(pages[index].elements)),
    });
    setPages(newPages);
  }

  // ── elementos ─────────────────────────────────────────────────────────────
  function addTextBox() {
    const el = {
      id: `text-${Date.now()}`, type: "text",
      content: "Digite aqui...",
      x: 100, y: 100, width: 300, height: 100,
      fontSize: 16, fontWeight: "normal", fontStyle: "normal",
      textDecoration: "none", color: "#000000",
    };
    const newPages = [...pages];
    newPages[currentPageIndex].elements.push(el);
    setPages(newPages);
    setSelectedElement(el.id);
  }

  function deleteElement(elementId) {
    const newPages = [...pages];
    newPages[currentPageIndex].elements = newPages[currentPageIndex].elements.filter(
      (el) => el.id !== elementId
    );
    setPages(newPages);
    setSelectedElement(null);
  }

  function duplicateElement(elementId) {
    const element = currentPage.elements.find((el) => el.id === elementId);
    if (!element) return;
    const newPages = [...pages];
    newPages[currentPageIndex].elements.push({
      ...JSON.parse(JSON.stringify(element)),
      id: `${element.type}-${Date.now()}`,
      x: element.x + 20, y: element.y + 20,
    });
    setPages(newPages);
  }

  // ── export PDF ────────────────────────────────────────────────────────────
  async function exportToPDF() {
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({
        orientation: pageOrientation === "landscape" ? "l" : "p",
        unit: "mm", format: "a4",
      });
      for (let i = 0; i < pages.length; i++) {
        setCurrentPageIndex(i);
        await new Promise((r) => setTimeout(r, 100));
        const img = await html2canvas(canvasRef.current, {
          scale: 2, useCORS: true, logging: false,
        });
        if (i > 0) pdf.addPage();
        pdf.addImage(img.toDataURL("image/png"), "PNG", 0, 0,
          pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight()
        );
      }
      pdf.save(`relatorio_${piece}_${Date.now()}.pdf`);
    } catch (err) {
      console.error("Erro ao exportar PDF:", err);
      alert("❌ Erro ao exportar PDF.");
    }
  }

  function toggleOrientation() {
    setPageOrientation((p) => (p === "landscape" ? "portrait" : "landscape"));
  }

  function handleDragStart(e, chart) {
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("chart", JSON.stringify(chart));
  }

  const selectedElementData = currentPage.elements.find((el) => el.id === selectedElement);

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
      {/* modal de snapshots */}
      {showReportsList && (
        <ReportsList
          group={group}
          conjunto={piece}
          API={API}
          currentState={{ pages, pageOrientation, reportName }}
          onLoad={handleLoadSnapshot}
          onClose={() => setShowReportsList(false)}
        />
      )}

      <LibrarySidebar
        currentJobId={currentJobId}
        availableCharts={availableCharts}
        loading={loading}
        onAddTextBox={addTextBox}
        onDragStart={handleDragStart}
      />

      <div className={styles.mainArea}>
        <div className={styles.toolbar}>
          {/* nome editável */}
          <input
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            onBlur={() => persistLayout(pages, pageOrientation, reportName)}
            style={{
              border: "none", background: "transparent",
              fontSize: "1rem", fontWeight: 600, color: "#2d3748",
              outline: "none", maxWidth: "240px", cursor: "text",
            }}
            placeholder="Nome do relatório"
          />

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <FormatToolbar element={selectedElementData} onUpdate={updateElement} />

            <div style={{ height: "30px", width: "1px", background: "#e2e8f0" }} />

            <button onClick={toggleOrientation} style={btnSecondary}>
              <RotateCw size={16} />
              {pageOrientation === "landscape" ? "Paisagem" : "Retrato"}
            </button>

            <button onClick={() => setShowReportsList(true)} style={btnSecondary}>
              <FolderOpen size={16} />
              Versões
            </button>

            {/* indicador de auto-save */}
            {saveStatus === "saved" && (
              <span style={{ fontSize: "0.78rem", color: "#68d391", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <Check size={13} /> Salvo
              </span>
            )}
          </div>

          <button onClick={exportToPDF} className={styles.exportButton}>
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
              height: pageOrientation === "landscape" ? "210mm" : "297mm",
            }}
            onClick={(e) => { if (e.target === e.currentTarget) setSelectedElement(null); }}
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

const btnSecondary = {
  padding: "0.45rem 0.9rem", background: "#edf2f7",
  border: "none", borderRadius: "6px", cursor: "pointer",
  fontSize: "0.85rem", fontWeight: 500,
  display: "flex", alignItems: "center", gap: "0.4rem", color: "#4a5568",
};