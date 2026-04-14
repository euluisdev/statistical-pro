// useSaveActionPlanToJob.js
// Usa onclone do html2canvas para corrigir writing-mode no DOM clonado,
// sem tocar no DOM original. Resolução scale:4.

import { useState, useEffect } from "react";

const A4_H_PX   = 794;
const SCALE     = 4;
const PAGE_TYPE = "ActionPlan";

async function waitForImages(el) {
  const imgs = Array.from(el.querySelectorAll("img"));
  if (!imgs.length) return;
  await Promise.all(
    imgs.map((img) =>
      new Promise((resolve) => {
        if (img.complete && img.naturalWidth > 0) { resolve(); return; }
        img.addEventListener("load",  resolve, { once: true });
        img.addEventListener("error", resolve, { once: true });
        setTimeout(resolve, 5000);
      })
    )
  );
}

/**
 * Chamado pelo html2canvas com o documento clonado.
 * Substitui writing-mode por um span rotacionado via transform,
 * que o html2canvas renderiza corretamente.
 */
function fixClonedDoc(clonedDoc) {
  // Pega todos os elementos no clone que têm writing-mode vertical
  const all = clonedDoc.querySelectorAll("*");

  all.forEach((node) => {
    const cs = window.getComputedStyle(node);
    const wm = cs.writingMode || cs.getPropertyValue("writing-mode") || "";

    if (!wm || wm === "horizontal-tb") return;

    // Lê o texto e dimensões originais
    const text    = node.textContent?.trim() ?? "";
    const height  = node.offsetHeight || 80;
    const width   = node.offsetWidth  || 24;

    // Limpa o conteúdo do nó clonado
    node.innerHTML = "";

    // Remove writing-mode
    node.style.writingMode      = "horizontal-tb";
    node.style.textOrientation  = "mixed";
    node.style.overflow         = "visible";
    node.style.position         = "relative";

    // Cria um span com rotate que simula o texto vertical
    const span = clonedDoc.createElement("span");
    span.textContent = text;
    span.style.cssText = `
      display: inline-block;
      white-space: nowrap;
      font-size: inherit;
      font-weight: inherit;
      color: inherit;
      transform: rotate(-90deg);
      transform-origin: center center;
      position: absolute;
      top: 50%;
      left: 50%;
      translate: -50% -50%;
    `;

    node.appendChild(span);
  });
}

export function useSaveActionPlanToJob() {
  const [currentJobId, setCurrentJobId] = useState(null);
  const [saveLoading,  setSaveLoading]  = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentJobId(localStorage.getItem("current_jobid"));
    }
  }, []);

  const triggerSave = async (tableRef, group, piece) => {
    if (!currentJobId) {
      alert("⚠️ Nenhum Job ativo! Crie um Job na página inicial primeiro.");
      return;
    }

    const el = tableRef?.current;
    if (!el) {
      alert("⚠️ Tabela não encontrada para capturar.");
      return;
    }

    setSaveLoading(true);

    let html2canvas;
    try {
      html2canvas = (await import("html2canvas")).default;
    } catch {
      alert("❌ html2canvas não encontrado.\nnpm install html2canvas");
      setSaveLoading(false);
      return;
    }

    try {
      await waitForImages(el);
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

      const fullCanvas = await html2canvas(el, {
        scale:           SCALE,
        useCORS:         true,
        allowTaint:      true,
        backgroundColor: "#ffffff",
        logging:         false,
        imageTimeout:    15000,
        width:           el.scrollWidth,
        height:          el.scrollHeight,
        windowWidth:     el.scrollWidth,
        windowHeight:    el.scrollHeight,
        // ── Corrige texto vertical no clone antes de renderizar ────────
        onclone: (clonedDoc) => {
          fixClonedDoc(clonedDoc);
        },
      });

      const totalW           = fullCanvas.width;
      const totalH           = fullCanvas.height;
      const pageHeightScaled = A4_H_PX * SCALE;
      const totalPages       = Math.ceil(totalH / pageHeightScaled);

      const results  = [];
      const failures = [];

      for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
        try {
          const srcY   = pageIdx * pageHeightScaled;
          const sliceH = Math.min(pageHeightScaled, totalH - srcY);

          const pageCanvas        = document.createElement("canvas");
          pageCanvas.width        = totalW;
          pageCanvas.height       = sliceH;
          const ctx               = pageCanvas.getContext("2d");
          ctx.fillStyle           = "#ffffff";
          ctx.fillRect(0, 0, totalW, sliceH);
          ctx.drawImage(fullCanvas, 0, srcY, totalW, sliceH, 0, 0, totalW, sliceH);

          const imageData = pageCanvas.toDataURL("image/png", 1.0);
          const chartType = totalPages === 1
            ? `AP_${piece}`
            : `AP_${piece}_page${pageIdx + 1}`;

          const response = await fetch(
            `${API}/jobs/job/${currentJobId}/save-chart`,
            {
              method:  "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                group,
                piece,
                page_type:  PAGE_TYPE,
                chart_name: chartType,
                image_data: imageData,
              }),
            }
          );

          if (!response.ok) {
            const errText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errText}`);
          }

          const result = await response.json();
          results.push({ page: pageIdx + 1, filename: result.filename });

        } catch (err) {
          console.error(`Erro ao salvar folha ${pageIdx + 1}:`, err);
          failures.push({ page: pageIdx + 1, error: err.message });
        }
      }

      if (failures.length === 0) {
        const list = results.map((r) => `  • ${r.filename}`).join("\n");
        alert(`✅ ${results.length} folha(s) salva(s)!\n\n${list}`);
      } else {
        const ok   = results.map((r)  => `  ✓ Folha ${r.page}`).join("\n");
        const fail = failures.map((f) => `  ✗ Folha ${f.page}: ${f.error}`).join("\n");
        alert(`Salvas (${results.length}):\n${ok || "  nenhuma"}\n\nFalhas (${failures.length}):\n${fail}`);
      }

      return { results, failures };

    } catch (err) {
      console.error("Erro geral:", err);
      alert(`❌ Erro ao capturar: ${err.message}`);
    } finally {
      setSaveLoading(false);
    }
  };

  return { currentJobId, saveLoading, triggerSave };
}