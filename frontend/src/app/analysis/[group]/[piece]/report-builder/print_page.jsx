"use client";
 
/**
 * Rota de impressão — usada SOMENTE pelo Playwright.
 *
 * - Carrega o layout salvo no backend
 * - Renderiza uma página por vez (a que o backend pedir via window.__setPage)
 */
 
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  useReportStore,
  selectCurrentPage,
  selectPageOrientation,
  selectCurrentIndex,
} from "./useReportStore";
import CanvasElement  from "./CanvasElement";
 
export default function PrintReport() {
  const { group } = useParams();
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
 
  const loadState = useReportStore((s) => s.loadState);
  const currentPage = useReportStore(selectCurrentPage);
  const orientation = useReportStore(selectPageOrientation);
  const currentIndex = useReportStore(selectCurrentIndex);
 
  const [ready, setReady] = useState(false);
 
  useEffect(() => {
    if (!group) return;
    let cancelled = false;
 
    fetch(`${API}/reportbuilder/${group}/layout`, { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error(`layout HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => {
        if (cancelled) return;
        loadState(d);
 
        const st = useReportStore.getState();
        window.__pageCount = st.pages.length;
        window.__orientation = st.pageOrientation;
        window.__setPage = (i) => useReportStore.getState().setCurrentPageIndex(i);
 
        setReady(true);
      })
      .catch((e) => {
        window.__reportError = String(e);
        console.error(e);
      });
 
    return () => {
      cancelled = true;
    };
  }, [group]);
 
  const landscape = orientation === "landscape";
 
  return (
    <>
      <style>{`
        @page { size: ${landscape ? "297mm 210mm" : "210mm 297mm"}; margin: 0; }
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          background: #fff !important;
          overflow: hidden !important;
        }
        * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      `}</style>
 
      <div
        id="print-canvas"
        data-ready={ready ? "true" : "false"}
        data-page={currentIndex}
        style={{
          width: landscape ? "297mm" : "210mm",
          height: landscape ? "210mm" : "297mm",
          position: "relative",
          overflow: "hidden",
          background: "#fff",
          pointerEvents: "none",
        }}
      >
        {ready &&
          currentPage.elements.map((el) => (
            <CanvasElement key={el.id} elementId={el.id} isSelected={false} API={API} />
          ))}
      </div>
    </>
  );
}
   
 
 
 