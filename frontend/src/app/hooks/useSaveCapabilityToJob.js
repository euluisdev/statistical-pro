import { useState, useEffect } from "react";

export function useSaveCapabilityToJob(pages, CanvasPage) {

  const [currentJobId, setCurrentJobId] = useState(null);
  const [saveLoading, setSaveLoading]   = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentJobId(localStorage.getItem("current_jobid"));
    }
  }, []);

  const triggerSave = async (group, piece) => {

    if (!CanvasPage) {
      console.error("CanvasPage está undefined. Verifique o import.");
      alert("Erro interno: CanvasPage não encontrado.");
      return;
    }

    if (!currentJobId) {
      alert("⚠️ Nenhum Job ativo!");
      return;
    }

    if (!pages || pages.length === 0) {
      alert("⚠️ Nenhuma página para capturar.");
      return;
    }

    setSaveLoading(true);

    let html2canvas;
    try {
      html2canvas = (await import("html2canvas")).default;
    } catch (err) {
      console.error(err);
      alert("❌ html2canvas não encontrado.");
      setSaveLoading(false);
      return;
    }

    const results = [];
    const failures = [];

    for (let i = 0; i < pages.length; i++) {

      try {

        // container invisível
        const wrapper = document.createElement("div");
        wrapper.style.cssText = `
          position: fixed;
          top: -9999px;
          left: -9999px;
          width: 1600px;
          background: white;
        `;

        document.body.appendChild(wrapper);

        // root para render React
        const rootEl = document.createElement("div");
        wrapper.appendChild(rootEl);

        const { createRoot } = await import("react-dom/client");
        const React = await import("react");

        const rootReact = createRoot(rootEl);

        // renderiza a página
        rootReact.render(
          React.createElement(CanvasPage, {
            pageIndex: i,
            cards: pages[i].cards ?? [],
            locked: true,
            bgImage: pages[i].bgImage
          })
        );

        // aguarda render
        await new Promise((r) => setTimeout(r, 200));

        // captura imagem
        const canvas = await html2canvas(wrapper, {
          scale: 4,
          backgroundColor: "white",
          useCORS: true,
          logging: false
        });

        // limpa DOM
        rootReact.unmount();
        document.body.removeChild(wrapper);

        const imageData = canvas.toDataURL("image/png", 1.0);

        const chartType = `CAP_${group}_${piece}_page${String(i + 1).padStart(2, "0")}_${Date.now()}`;

        // envia pro backend
        const response = await fetch(
          `${API}/jobs/job/${currentJobId}/save-chart`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              group,
              piece,
              chart_type: chartType,
              page_type: "capability",
              image_data: imageData
            })
          }
        );

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errText}`);
        }

        const result = await response.json();

        results.push({
          page: i + 1,
          filename: result.filename
        });

      } catch (err) {
        console.error(`Erro capturando página ${i + 1}:`, err);
        failures.push({
          page: i + 1,
          error: err.message
        });
      }
    }

    setSaveLoading(false);

    // feedback final
    if (failures.length === 0) {
      const fileList = results.map(r => `  • ${r.filename}`).join("\n");
      alert(`✅ ${results.length} página(s) salva(s)!\n\n${fileList}`);
    } else {
      const okList   = results.map(r => `  ✓ Página ${r.page}`).join("\n");
      const failList = failures.map(f => `  ✗ Página ${f.page}: ${f.error}`).join("\n");

      alert(
        `Salvas (${results.length}):\n${okList || "  nenhuma"}\n\n` +
        `Falhas (${failures.length}):\n${failList}`
      );
    }

    return { results, failures };
  };

  return {
    triggerSave,
    saveLoading,
    currentJobId
  };
}