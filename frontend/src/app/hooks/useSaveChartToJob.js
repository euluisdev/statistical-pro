import { useState, useEffect } from "react";
import html2canvas from "html2canvas";

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

  function waitForImages(container) {
    const images = Array.from(container.querySelectorAll("img"));

    return Promise.all(
      images.map((img) => {
        if (img.complete) return Promise.resolve();

        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      })
    );
  }

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

  const saveDomChart = async (containerRef, group, piece, chartName) => {
    setSaveLoading(true);
    try {
      const container = containerRef.current;
      if (!container) throw new Error("Container não encontrado");

      const images = Array.from(container.querySelectorAll("img"));

      await Promise.all(
        images.map((img, index) => {
          return new Promise((resolve) => {
            if (!img.src || img.src.startsWith("data:")) {
              resolve();
              return;
            }

            //Força crossorigin antes de qualquer recarga
            if (img.crossOrigin !== "anonymous") {
              img.crossOrigin = "anonymous";
            }

            if (img.complete && img.naturalWidth > 0) {
              resolve();
              return;
            }

            //Recarrega a imG forçando CORS
            const originalSrc = img.src;
            img.src = "";                    // limpa
            img.src = originalSrc + (originalSrc.includes("?") ? "&" : "?") + `t=${Date.now()}`;

            img.onload = () => {
              console.log(`Imagem ${index + 1} carregada com sucesso`);
              resolve();
            };

            img.onerror = (err) => {
              console.warn(`Falha ao carregar imagem ${index + 1}:`, img.src);
              resolve(); // não trava o processo todo
            };

            setTimeout(resolve, 8000);
          });
        })
      );

      const canvas = await html2canvas(container, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        logging: true,        
        imageTimeout: 20000,
        backgroundColor: "#ffffff",
        removeContainer: true,
      });

      const imageData = canvas.toDataURL("image/png", 1.0);

      const response = await fetch(`${API}/jobs/job/${currentJobId}/save-chart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group,
          piece,
          page_type: pageType,
          chart_name: chartName,
          image_data: imageData
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro do servidor: ${errorText}`);
      }

      const result = await response.json();
      console.log("Gráfico DOM salvo:", result);
      return result;

    } catch (err) {
      console.error("Erro ao salvar DOM com html2canvas:", err);
      alert(`❌ Erro ao capturar imagens: ${err.message}`);
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
    saveDomChart,
    closeSaveModal: () => setShowSaveModal(false)
  };
}