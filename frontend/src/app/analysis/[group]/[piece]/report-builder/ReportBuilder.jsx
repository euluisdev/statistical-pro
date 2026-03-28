"use client";
 
import { useEffect, useRef, useCallback } from "react";
import { Download, FileText, RotateCw, FolderOpen, Check } from "lucide-react";
import { useParams } from "next/navigation";
import styles from "./reportbuilder.module.css";
 
// store
import { useReportStore, selectCurrentPage, selectSelectedId, selectAlignGuides, selectGridLayout, selectIsDragOver, selectPageOrientation, selectReportName, selectPageCount, selectCurrentIndex } from "./useReportStore";
 
// componentes
import LibrarySidebar from "./LibrarySidebar";
import PagesSidebar   from "./PagesSidebar";
import FormatToolbar  from "./FormatToolbar";
import CanvasElement  from "./CanvasElement";
import ReportsList    from "./ReportsList";
import GridSelector   from "./GridSelector";
import GridOverlay    from "./GridOverlay";
import AlignmentGuides from "./AlignmentGuides";
import { useDragDrop } from "./useDragDrop";
import { useState } from "react";
 
export default function ReportBuilder() {
  const canvasRef  = useRef(null);
  const saveTimer  = useRef(null);
  const { group, piece } = useParams();
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
 
  // ── store — cada selector é preciso, só re-renderiza quando o slice muda ──
  const currentPage    = useReportStore(selectCurrentPage);
  const selectedId     = useReportStore(selectSelectedId);
  const alignGuides    = useReportStore(selectAlignGuides);
  const gridLayout     = useReportStore(selectGridLayout);
  const isDragOver     = useReportStore(selectIsDragOver);
  const pageOrientation= useReportStore(selectPageOrientation);
  const reportName     = useReportStore(selectReportName);
  const pageCount      = useReportStore(selectPageCount);
  const currentIndex   = useReportStore(selectCurrentIndex);
  const pages          = useReportStore((s) => s.pages); // necessário para persistência e PDF
 
  // actions
  const loadState         = useReportStore((s) => s.loadState);
  const setSelectedId     = useReportStore((s) => s.setSelectedElementId);
  const setPageOrientation= useReportStore((s) => s.setPageOrientation);
  const setReportName     = useReportStore((s) => s.setReportName);
  const setCurrentIndex   = useReportStore((s) => s.setCurrentPageIndex);
  const setIsDragOver     = useReportStore((s) => s.setIsDragOver);
  const setGridLayout     = useReportStore((s) => s.setGridLayout);
  const addPage           = useReportStore((s) => s.addPage);
  const deletePage        = useReportStore((s) => s.deletePage);
  const duplicatePage     = useReportStore((s) => s.duplicatePage);
  const addTextBox        = useReportStore((s) => s.addTextBox);
  const updateElement     = useReportStore((s) => s.updateElement);
 
  // ui local (não precisa de store)
  const [currentJobId, setCurrentJobId]   = useState(null);
  const [availableCharts, setAvailableCharts] = useState([]);
  const [loading, setLoading]             = useState(false);
  const [showReportsList, setShowReportsList] = useState(false);
  const [saveStatus, setSaveStatus]       = useState(null);
 
  // ── drag & drop ───────────────────────────────────────────────────────────
  const {
    isDragging,
    handleMouseDown,
    handleDoubleClick,
    handleResizeMouseDown,
    handleDragOver,
    handleDrop,
  } = useDragDrop(canvasRef);
 
  // injeta handlers no store para que CanvasElement acesse sem prop drilling
  useEffect(() => {
    useReportStore.setState({
      _handleMouseDown:     handleMouseDown,
      _handleDoubleClick:   handleDoubleClick,
      _handleResizeMouseDown: handleResizeMouseDown,
    });
  }, [handleMouseDown, handleDoubleClick, handleResizeMouseDown]);
 
  // ── carrega layout ao montar ──────────────────────────────────────────────
  useEffect(() => {
    if (!group) return;
    fetch(`${API}/reportbuilder/${group}/layout`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d?.pages) loadState(d); })
      .catch(() => {});
  }, [group]);
 
  useEffect(() => {
    if (typeof window === "undefined") return;
    const jobId = localStorage.getItem("current_jobid");
    setCurrentJobId(jobId);
    if (jobId) loadJobCharts(jobId);
  }, []);
 
  // ── auto-save com debounce ────────────────────────────────────────────────
  const persistLayout = useCallback(() => {
    if (!group) return;
    const { pages, pageOrientation, reportName } = useReportStore.getState();
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      fetch(`${API}/reportbuilder/${group}/layout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pages, pageOrientation, reportName }),
      })
        .then((r) => { if (r.ok) { setSaveStatus("saved"); setTimeout(() => setSaveStatus(null), 3000); } })
        .catch(() => {});
    }, 800);
  }, [group, API]);
 
  // subscreve ao store para disparar auto-save sem re-render do componente
  useEffect(() => {
    const unsub = useReportStore.subscribe(
      (s) => s.pages,
      () => persistLayout()
    );
    return () => unsub();
  }, [persistLayout]);
 
  // ── carregar snapshot
  function handleLoadSnapshot(data) {
    if (data) loadState(data);
  }
 
  // ── charts do job
  async function loadJobCharts(jobId) {
    setLoading(true);
    try {
      const res = await fetch(`${API}/jobs/job/${jobId}/charts`);
      if (res.ok) setAvailableCharts((await res.json()).charts ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }
 
  //export PDF
  async function exportToPDF() {
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF }   = await import("jspdf");
      const { pages, pageOrientation } = useReportStore.getState();
      const pdf = new jsPDF({ orientation: pageOrientation === "landscape" ? "l" : "p", unit: "mm", format: "a4" });
 
      for (let i = 0; i < pages.length; i++) {
        setCurrentIndex(i);
        await new Promise((r) => setTimeout(r, 120));
        const img = await html2canvas(canvasRef.current, { scale: 2, useCORS: true, logging: false });
        if (i > 0) pdf.addPage();
        pdf.addImage(img.toDataURL("image/png"), "PNG", 0, 0,
          pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
      }
      pdf.save(`relatorio_${piece}_${Date.now()}.pdf`);
    } catch (e) { console.error(e); alert("❌ Erro ao exportar PDF."); }
  }
 
  //drag start da library
  function handleDragStart(e, chart) {
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("chart", JSON.stringify(chart));
  }
 
  //elemento selecionado para FormatToolbar
  const selectedElementData = currentPage.elements.find((el) => el.id === selectedId);
 
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
      {showReportsList && (
        <ReportsList
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
        {/*toolbar*/}
        <div className={styles.toolbar}>
          <input
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            onBlur={persistLayout}
            style={{ border: "none", background: "transparent", fontSize: "1rem", fontWeight: 600, color: "#2d3748", outline: "none", maxWidth: "240px", cursor: "text" }}
            placeholder="Nome do relatório"
          />
 
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <FormatToolbar element={selectedElementData} onUpdate={updateElement} />
            <div style={{ height: "30px", width: "1px", background: "#e2e8f0" }} />
 
            <button onClick={() => setPageOrientation(pageOrientation === "landscape" ? "portrait" : "landscape")} style={btnSecondary}>
              <RotateCw size={16} />
              {pageOrientation === "landscape" ? "Paisagem" : "Retrato"}
            </button>
 
            <GridSelector value={gridLayout} onChange={setGridLayout} />
 
            <button onClick={() => setShowReportsList(true)} style={btnSecondary}>
              <FolderOpen size={16} />
              Versões
            </button>
 
            {saveStatus === "saved" && (
              <span style={{ fontSize: "0.78rem", color: "#68d391", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <Check size={13} /> Salvo
              </span>
            )}
          </div>
 
          <button onClick={exportToPDF} className={styles.exportButton}>
            <Download size={16} /> PDF
          </button>
        </div>
 
        {/*canvas area */}
        <div className={styles.canvasArea}>
          <div
            ref={canvasRef}
            className={styles.canvas}
            style={{
              cursor: isDragging ? "grabbing" : "default",
              width:  pageOrientation === "landscape" ? "297mm" : "210mm",
              height: pageOrientation === "landscape" ? "210mm" : "297mm",
              position: "relative",
            }}
            onClick={(e) => { if (e.target === e.currentTarget) setSelectedId(null); }}
            onDragOver={(e) => { handleDragOver(e); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e)   => { setIsDragOver(false); handleDrop(e); }}
          >
            <GridOverlay
              gridLayout={gridLayout}
              pageOrientation={pageOrientation}
              visible={isDragOver}
            />
            <AlignmentGuides
              guides={alignGuides}
              canvasW={pageOrientation === "landscape" ? 1122 : 794}
              canvasH={pageOrientation === "landscape" ? 794  : 1122}
            />
 
            {/* renderiza só os elementos da página atual */}
            {currentPage.elements.map((el) => (
              <CanvasElement
                key={el.id}
                elementId={el.id} //so o id e não o objeto inteiro
                isSelected={selectedId === el.id}
                API={API}
              />
            ))}
          </div>
        </div>
      </div>
 
      <PagesSidebar
        pages={pages}
        currentPageIndex={currentIndex}
        currentJobId={currentJobId}
        API={API}
        onPageSelect={setCurrentIndex}
        onAddPage={addPage}
        onDuplicatePage={duplicatePage}
        onDeletePage={(i) => {
          if (pages.length === 1) { alert("Você precisa ter pelo menos uma página!"); return; }
          deletePage(i);
        }}
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
 
 
 
