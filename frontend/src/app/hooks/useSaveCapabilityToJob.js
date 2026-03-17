// useSaveCapabilityToJob.js
// Corrige captura de páginas com display:none tornando-as visíveis fora da tela

import { useState, useEffect, useRef, useCallback } from "react";

const PAGE_NAME = "Capability";

// Aguarda todas as <img> dentro do elemento carregarem
async function waitForImages(el) {
  const imgs = Array.from(el.querySelectorAll("img"));
  if (imgs.length === 0) return;
  await Promise.all(
    imgs.map(
      (img) =>
        new Promise((resolve) => {
          if (img.complete && img.naturalWidth > 0) { resolve(); return; }
          img.addEventListener("load", resolve, { once: true });
          img.addEventListener("error", resolve, { once: true });
          setTimeout(resolve, 5000);
        })
    )
  );
}

export function useSaveCapabilityToJob() {
  const [currentJobId, setCurrentJobId] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const pageRefsMap = useRef({});
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentJobId(localStorage.getItem("current_jobid"));
    }
  }, []);

  const registerPageRef = useCallback((pageIndex, el) => {
    if (el) {
      pageRefsMap.current[pageIndex] = el;
    } else {
      delete pageRefsMap.current[pageIndex];
    }
  }, []);

  const triggerSave = useCallback(async (group, piece) => {
    if (!currentJobId) {
      alert("⚠️ Nenhum Job ativo! Crie um Job na página inicial primeiro.");
      return;
    }

    const indices = Object.keys(pageRefsMap.current)
      .map(Number)
      .sort((a, b) => a - b);

    if (indices.length === 0) {
      alert("⚠️ Nenhuma página disponível para capturar.");
      return;
    }

    setSaveLoading(true);

    let html2canvas;
    try {
      html2canvas = (await import("html2canvas")).default;
    } catch {
      alert("❌ Dependência html2canvas não encontrada.\nnpm install html2canvas");
      setSaveLoading(false);
      return;
    }

    const results = [];
    const failures = [];

    for (const pageIndex of indices) {
      const el = pageRefsMap.current[pageIndex];
      if (!el) continue;

      // Guarda o wrapper pai (div com display:none para páginas inativas)
      const wrapper = el.parentElement;
      const wasHidden = wrapper && wrapper.style.display === "none";

      try {
        // ── Torna a página visível fora da tela para o html2canvas capturar ──
        if (wasHidden) {
          wrapper.style.display = "block";
          wrapper.style.position = "fixed";
          wrapper.style.top = "-99999px";
          wrapper.style.left = "-99999px";
          wrapper.style.visibility = "hidden"; // visível para o layout, invisível ao user
          wrapper.style.zIndex = "-1";
        }

        // Aguarda imagens carregarem
        await waitForImages(el);

        // Dois frames para layout estabilizar com a visibilidade restaurada
        await new Promise((r) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setTimeout(r, 80);
            });
          });
        });

        // Captura
        const canvas = await html2canvas(el, {
          scale: 3,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#e8e8e4",
          logging: false,
          imageTimeout: 15000,
          scrollX: 0,
          scrollY: 0,
          onclone: (clonedDoc) => {
            clonedDoc.querySelectorAll("[class*='canvasBgHint']").forEach(n => n.remove());
            clonedDoc.querySelectorAll("[class*='connDot']").forEach(n => n.remove());
            clonedDoc.querySelectorAll("[class*='pageNum']").forEach(n => n.remove());
          }
        });

        // Verifica dimensões antes de tentar getImageData
        if (canvas.width === 0 || canvas.height === 0) {
          throw new Error(`Canvas com dimensão zero (${canvas.width}×${canvas.height}) — página pode estar oculta`);
        }

        const imageData = canvas.toDataURL("image/png", 1.0);
        const chartType = `CAP_page${pageIndex + 1}`;

        const response = await fetch(
          `${API}/jobs/job/${currentJobId}/save-chart`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              group,
              piece,
              page_name: PAGE_NAME,
              chart_type: chartType,
              image_data: imageData,
            }),
          }
        );

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errText}`);
        }

        const result = await response.json();
        results.push({ pageIndex, filename: result.filename, structure: result.structure });

      } catch (err) {
        console.error(`Erro ao salvar página ${pageIndex + 1}:`, err);
        failures.push({ pageIndex, error: err.message });

      } finally {
        // ── Sempre restaura o estado original do wrapper ─────────────────────
        if (wasHidden) {
          wrapper.style.display = "block";
          wrapper.style.position = "fixed";
          wrapper.style.top = "-99999px";
          wrapper.style.left = "-99999px";
          wrapper.style.visibility = "hidden";
          wrapper.style.zIndex = "-1";

          // força recalculo do layout
          wrapper.offsetHeight;
        }
      }
    }

    setSaveLoading(false);

    if (failures.length === 0) {
      const fileList = results.map((r) => `  • ${r.structure}`).join("\n");
      alert(`✅ ${results.length} página(s) salva(s)!\n\n${fileList}`);
    } else {
      const okList = results.map((r) => `  ✓ Pág. ${r.pageIndex + 1}`).join("\n");
      const failList = failures.map((f) => `  ✗ Pág. ${f.pageIndex + 1}: ${f.error}`).join("\n");
      alert(
        `Salvas (${results.length}):\n${okList || "  nenhuma"}\n\n` +
        `Falhas (${failures.length}):\n${failList}`
      );
    }

    return { results, failures };
  }, [currentJobId, API]);

  return {
    currentJobId,
    saveLoading,
    registerPageRef,
    triggerSave,
  };
}