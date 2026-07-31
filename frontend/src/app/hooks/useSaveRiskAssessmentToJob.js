"use client";

import { useState, useEffect } from "react";
import html2canvas from "html2canvas";
import { useToast } from "@/app/components/providers/ToastProvider";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function useSaveRiskAssessmentToJob() {
  const [currentJobId, setCurrentJobId] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentJobId(localStorage.getItem("current_jobid"));
    }
  }, []);

  async function waitForImages(container) {
    const images = Array.from(container.querySelectorAll("img"));

    await Promise.all(
      images.map((img) => {
        return new Promise((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve();
            return;
          }

          img.onload = resolve;
          img.onerror = resolve;

          //this evita travar caso alguma imagem nunca carregue
          setTimeout(resolve, 4000);
        });
      })
    );
  }

  const triggerSave = async (containerRef, group, piece) => {
    if (!currentJobId) {
      showToast("⚠️ Nenhum Job ativo.");
      return;
    }

    setSaveLoading(true);

    try {
      const container = containerRef.current;

      if (!container) {
        throw new Error("Container da página não encontrado.");
      }

      //aguarda todas as imagens carregarem
      await waitForImages(container);

      const canvas = await html2canvas(container, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        imageTimeout: 20000,
        removeContainer: true,
      });

      const imageData = canvas.toDataURL("image/png", 1.0);

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
            page_type: "riskassessment",
            chart_name: "RA",
            image_data: imageData,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const result = await response.json();

      showToast(
        `✓ Risk Assessment salvo!\n${result.filename}`,
        "success"
      );

      return result;
    } catch (err) {
      console.error(err);

      showToast(
        `❌ ${err.message}`,
        "error"
      );

      throw err;
    } finally {
      setSaveLoading(false);
    }
  };

  return {
    currentJobId,
    saveLoading,
    triggerSave,
  };
};  
 
 
 