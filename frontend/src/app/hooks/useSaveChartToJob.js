import { useState, useEffect } from "react";

export function useSaveChartToJob() {
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

  const saveChart = async (plotRef, group, piece, chartType = "CG") => {
    setSaveLoading(true);

    try {
      const gd = plotRef.current?.el;

      if (!gd) {
        throw new Error("Gráfico não encontrado");
      }

      //import Plotly dinamicamente
      const Plotly = (await import("plotly.js-dist-min")).default;

      // Export PNG use Plotly.toImage
      const imageData = await Plotly.toImage(gd, {
        format: "png",
        width: 1400,
        height: 800,
        scale: 4
      });

      console.log("Enviando imagem para o backend...");
      console.log("JobID:", currentJobId);
      console.log("Group:", group);
      console.log("Piece:", piece);
      console.log("Chart Type:", chartType);

      //send to backend
      const response = await fetch( 
        `${API}/jobs/job/${currentJobId}/save-chart`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            group: group, 
            piece: piece,
            chart_type: chartType,
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
      console.log("Resultado:", result);

      alert(`✓ Gráfico ${chartType} salvo com sucesso!\n📁 ${result.filename}`);
       
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
 
 