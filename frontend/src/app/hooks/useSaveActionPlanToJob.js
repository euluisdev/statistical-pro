// useSaveActionPlanToJob.js - versão estável FINAL

import { useState, useEffect } from "react";

const A4_H_PX = 794;
const SCALE = 5;
const PAGE_TYPE = "ActionPlan";

async function waitForImages(el) {
  const imgs = Array.from(el.querySelectorAll("img"));
  if (!imgs.length) return;

  await Promise.all(
    imgs.map(
      (img) =>
        new Promise((resolve) => {
          if (img.complete && img.naturalWidth > 0) resolve();
          else {
            img.addEventListener("load", resolve, { once: true });
            img.addEventListener("error", resolve, { once: true });
            setTimeout(resolve, 8000);
          }
        })
    )
  );
}

export function useSaveActionPlanToJob() {
  const [currentJobId, setCurrentJobId] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentJobId(localStorage.getItem("current_jobid"));
    }
  }, []);

  const triggerSave = async (tableRef, group, piece) => {
    if (!currentJobId) {
      alert("⚠️ Nenhum Job ativo!");
      return;
    }

    const el = tableRef?.current;
    if (!el) {
      alert("⚠️ Tabela não encontrada.");
      return;
    }

    setSaveLoading(true);

    try {
      const html2canvas = (await import("html2canvas")).default;

      await waitForImages(el);
      await new Promise((r) =>
        requestAnimationFrame(() => requestAnimationFrame(r))
      );

      const rect = el.getBoundingClientRect();

      // ===== WRAPPER ESTÁVEL =====
      const wrapper = document.createElement("div");
      wrapper.style.position = "fixed";
      wrapper.style.top = "-9999px";
      wrapper.style.left = "-9999px";
      wrapper.style.background = "white";
      wrapper.style.width = `${rect.width}px`;
      wrapper.style.padding = "0";
      wrapper.style.margin = "0";

      // ===== CLONE =====
      const clone = el.cloneNode(true);

      clone.style.width = `${rect.width}px`;
      clone.style.boxSizing = "border-box";

      // 🔥 FIX PRINCIPAL: trava layout da tabela
      const table = clone.querySelector("table");
      if (table) {
        table.style.tableLayout = "fixed";
        table.style.width = "100%";
      }

      // ===== CONGELA TODAS AS CÉLULAS =====
      const originalCells = el.querySelectorAll("th, td");
      const clonedCells = clone.querySelectorAll("th, td");

      originalCells.forEach((cell, i) => {
        const r = cell.getBoundingClientRect();
        const cloneCell = clonedCells[i];
        if (!cloneCell) return;

        const w = r.width;
        const h = r.height;

        cloneCell.style.width = `${w}px`;
        cloneCell.style.minWidth = `${w}px`;
        cloneCell.style.maxWidth = `${w}px`;

        cloneCell.style.height = `${h}px`;
        cloneCell.style.minHeight = `${h}px`;
        cloneCell.style.maxHeight = `${h}px`;

        cloneCell.style.boxSizing = "border-box";
        cloneCell.style.overflow = "hidden";
      });

      // 🔥 FIX TEXTO VERTICAL (CRÍTICO)
      clone.querySelectorAll(".verticalText").forEach((el) => {
        el.style.writingMode = "horizontal-tb";
        el.style.transform = "rotate(-90deg)";
        el.style.transformOrigin = "center";
        el.style.display = "inline-block";
        el.style.whiteSpace = "nowrap";
      });

      wrapper.appendChild(clone);
      document.body.appendChild(wrapper);

      await new Promise((r) => setTimeout(r, 200));

      // ===== CAPTURA =====
      const fullCanvas = await html2canvas(wrapper, {
        scale: SCALE,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        imageTimeout: 15000,
      });

      document.body.removeChild(wrapper);

      // ===== PAGINAÇÃO =====
      const totalW = fullCanvas.width;
      const totalH = fullCanvas.height;
      const pageHeightScaled = A4_H_PX * SCALE;
      const totalPages = Math.ceil(totalH / pageHeightScaled);

      const results = [];
      const failures = [];

      for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
        try {
          const srcY = pageIdx * pageHeightScaled;
          const sliceH = Math.min(pageHeightScaled, totalH - srcY);

          const pc = document.createElement("canvas");
          pc.width = totalW;
          pc.height = sliceH;

          const ctx = pc.getContext("2d");
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, totalW, sliceH);

          ctx.drawImage(
            fullCanvas,
            0,
            srcY,
            totalW,
            sliceH,
            0,
            0,
            totalW,
            sliceH
          );

          const imageData = pc.toDataURL("image/png", 1.0);

          const chartType =
            totalPages === 1
              ? `AP_${piece}`
              : `AP_${piece}_page${pageIdx + 1}`;

          const res = await fetch(
            `${API}/jobs/job/${currentJobId}/save-chart`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                group,
                piece,
                page_type: PAGE_TYPE,
                chart_name: chartType,
                image_data: imageData,
              }),
            }
          );

          if (!res.ok) throw new Error(`HTTP ${res.status}`);

          const result = await res.json();
          results.push(result);
        } catch (err) {
          failures.push(err);
        }
      }

      if (failures.length === 0) {
        alert(`✅ ${results.length} página(s) salva(s)!`);
      } else {
        alert(`⚠️ Algumas páginas falharam (${failures.length})`);
      }
    } catch (err) {
      console.error(err);
      alert(`❌ Erro: ${err.message}`);
    } finally {
      setSaveLoading(false);
    }
  };

  return { currentJobId, saveLoading, triggerSave };
}