"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useParams } from "next/navigation";

// mesma pasta do ReportBuilder.jsx, um nível acima (report-builder/print → report-builder)
import {
  useReportStore,
  selectCurrentPage,
  selectPageOrientation,
  selectCurrentIndex,
} from "../useReportStore";
import CanvasElement from "../CanvasElement";

export default function PrintReport() {
  const { group } = useParams();
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const loadState = useReportStore((s) => s.loadState);
  const currentPage = useReportStore(selectCurrentPage);
  const orientation = useReportStore(selectPageOrientation);
  const currentIndex = useReportStore(selectCurrentIndex);

  const [container, setContainer] = useState(null);
  const [ready, setReady] = useState(false);

  // container direto no <body>, fora de qualquer layout
  useEffect(() => {
    const el = document.createElement("div");
    el.id = "print-root";
    document.body.appendChild(el);
    setContainer(el);
    return () => el.remove();
  }, []);

  // carrega o layout salvo no backend
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

  if (!container) return null;

  const landscape = orientation === "landscape";

  return createPortal(
    <>
      <style>{`
        @page { size: ${landscape ? "297mm 210mm" : "210mm 297mm"}; margin: 0; }
        * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }

        /* na tela (teste no navegador): cobre tudo com a folha branca */
        #print-root {
          position: fixed; top: 0; left: 0;
          z-index: 2147483647;
          background: #fff;
          overflow: auto;
          width: 100vw; height: 100vh;
        }

        @media print {
          /* esconde TUDO que não seja a folha: navbar, sidebars, next, etc. */
          body > *:not(#print-root) { display: none !important; }
          html, body {
            margin: 0 !important; padding: 0 !important;
            background: #fff !important;
            height: auto !important; overflow: visible !important;
          }
          #print-root {
            position: static !important;
            width: auto !important; height: auto !important;
            overflow: visible !important;
          }
        }
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
    </>,
    container
  );
}  
 
 