import { useState, useEffect } from "react";

export function useSaveChartToJob(pageType = "general") {
  const [currentJobId, setCurrentJobId] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedJobId = localStorage.getItem("current_jobid");
      setCurrentJobId(storedJobId);
    }
  }, []);

  const openSaveModal = () => {
    if (!currentJobId) {
      alert("⚠️ Nenhum Job ativo! Crie um Job na página inicial primeiro.");
      return;
    }
    setShowSaveModal(true);
  };

  const saveChart = async (plotRef, group, piece, chartName = "CG") => {
    setSaveLoading(true);

    try {
      const gd = plotRef.current?.el;

      if (!gd) {
        throw new Error("Gráfico não encontrado");
      }

      const Plotly = (await import("plotly.js-dist-min")).default;

      const imageData = await Plotly.toImage(gd, {
        format: "png",
        width: 1600,
        height: 970,
        scale: 6
      });

      console.log("Enviando imagem para o backend...");
      console.log("JobID:", currentJobId);
      console.log("Group:", group);
      console.log("Piece:", piece);
      console.log("Page Type:", pageType);
      console.log("Chart Name:", chartName);

      const response = await fetch(
        `${API}/jobs/job/${currentJobId}/save-chart`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            group,
            piece,
            page_type: pageType,
            chart_name: chartName,
            image_data: imageData
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erro do servidor:", errorText);
        throw new Error(`Erro ao salvar gráfico: ${response.status}`);
      }

      const result = await response.json();

      alert(`✓ Gráfico salvo com sucesso!\n📁 ${result.filename}`);

      setShowSaveModal(false);
      return result;

    } catch (err) {
      console.error("Erro ao salvar gráfico:", err);
      alert(`❌ Erro ao salvar gráfico: ${err.message}`);
      throw err;
    } finally {
      setSaveLoading(false);
    }
  };

  return {
    currentJobId,
    showSaveModal,
    saveLoading,
    openSaveModal,
    saveChart,
    closeSaveModal: () => setShowSaveModal(false)
  };
}