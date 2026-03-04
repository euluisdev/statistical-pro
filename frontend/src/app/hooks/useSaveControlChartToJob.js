import { useState, useEffect, useRef } from "react";

export function useSaveControlChartToJob() {
  const [currentJobId, setCurrentJobId] = useState(null);
  const [saveLoading, setSaveLoading]   = useState(false);

  const chartRefsMap = useRef({});
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentJobId(localStorage.getItem("current_jobid"));
    }
  }, []);

  const registerChartRef = (pointId, axis, el) => {
    if (!pointId) return;
    if (el) {
      if (!chartRefsMap.current[pointId]) chartRefsMap.current[pointId] = {};
      chartRefsMap.current[pointId][axis] = el;
    } else {
      if (chartRefsMap.current[pointId]) {
        delete chartRefsMap.current[pointId][axis];
        if (Object.keys(chartRefsMap.current[pointId]).length === 0) {
          delete chartRefsMap.current[pointId];
        }
      }
    }
  };

  /*print todos os pontos e salva 1 PNG por ponto no jobid ativo*/
  const triggerSave = async (group, piece) => {
    if (!currentJobId) {
      alert("⚠️ Nenhum Job ativo! Crie um Job na página inicial primeiro.");
      return;
    }

    const points = Object.keys(chartRefsMap.current);
    if (points.length === 0) {
      alert("⚠️ Nenhum gráfico disponível para capturar.");
      return;
    }
    setSaveLoading(true);

    let html2canvas;
    try {
      html2canvas = (await import("html2canvas")).default;
    } catch {
      alert("❌ Dependência html2canvas não encontrada.");
      setSaveLoading(false);
      return;
    }

    const results  = [];
    const failures = [];

    for (const pointId of points) {
      const axesMap = chartRefsMap.current[pointId]; 
      const axisEls = Object.entries(axesMap);     

      if (axisEls.length === 0) continue;

      try {
        //monta um container temporário com todos os eixos do ponto 
        //garante que todos os eixos fiquem no mesmo file png
        const wrapper = document.createElement("div");
        wrapper.style.cssText = `
          position: fixed;
          top: -9999px;
          left: -9999px;
          background: #f5f5f5;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 0;
          width: fit-content;
        `;

        //clona cada chartRow para não alterar o DOM original
        const clones = axisEls.map(([, el]) => {
          const clone = el.cloneNode(true);
          clone.style.marginBottom = "0";
          return clone;
        });

        clones.forEach((c) => wrapper.appendChild(c));
        document.body.appendChild(wrapper);

        //pequeno delay para o DOM renderizar os clones
        await new Promise((r) => setTimeout(r, 80));

        //print alta qualidade
        const canvas = await html2canvas(wrapper, {
          scale:              4,     
          useCORS:            true,
          allowTaint:         true,
          backgroundColor:    "white",
          logging:            false,
          imageTimeout:       0,
          removeContainer:    true,
        });

        document.body.removeChild(wrapper);

        //converte p/ base64 PNG
        const imageData = canvas.toDataURL("image/png", 1.0);

        //nome do gráfico para o back
        const safePoint = pointId.replace(/[^a-zA-Z0-9]/g, "_");
        const chartType = `CC_${group}_${piece}_${safePoint}`;

        //send to the backend
        const response = await fetch(
          `${API}/jobs/job/${currentJobId}/save-chart`,
          {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              group,
              piece,
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
        results.push({ pointId, filename: result.filename });

      } catch (err) {
        console.error(`Erro ao salvar ponto ${pointId}:`, err);
        failures.push({ pointId, error: err.message });
      }
    }

    setSaveLoading(false);

    //feedback final
    if (failures.length === 0) {
      const fileList = results.map((r) => `  • ${r.filename}`).join("\n");
      alert(`✅ ${results.length} gráfico(s) salvo(s) com sucesso!\n\n${fileList}`);
    } else {
      const okList   = results.map((r)   => `  ✓ ${r.pointId}`).join("\n");
      const failList = failures.map((f)  => `  ✗ ${f.pointId}: ${f.error}`).join("\n");
      alert(
        `Salvos (${results.length}):\n${okList || "  nenhum"}\n\n` +
        `Falhas (${failures.length}):\n${failList}`
      );
    }

    return { results, failures };
  };

  return {
    currentJobId,
    saveLoading,
    registerChartRef,
    triggerSave,
  };
}  
 
 
 