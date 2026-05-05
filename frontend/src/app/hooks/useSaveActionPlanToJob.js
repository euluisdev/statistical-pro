import { useState, useEffect } from "react";
//backend renderiza a página real com Chromium e retorna os PNGs prontos.
//chama o backend (Playwright) para printar

const PAGE_TYPE = "ActionPlan";

export function useSaveActionPlanToJob() {
  const [currentJobId, setCurrentJobId] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  //URL base do frontend | backend precisa abrir esta URL com playwright
  const FRONTEND = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentJobId(localStorage.getItem("current_jobid"));
    }
  }, []);

  /**
   * triggerSave
   * @param {string} group  — ex: "CONJUNTO_5980"
   * @param {string} piece  — ex: "53327786"
   *
   *backend navega diretamente na URL
   */
  const triggerSave = async (group, piece) => {
    if (!currentJobId) {
      alert("⚠️ Nenhum Job ativo! Crie um Job na página inicial primeiro.");
      return;
    }

    setSaveLoading(true);

    try {
      //URL da page do action plan que o playwright vai abrir
      const pageUrl = `${FRONTEND}/action-plan/${group}/${piece}`;

      const response = await fetch(
        `${API}/jobs/job/${currentJobId}/screenshot-action-plan`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            page_url: pageUrl,
            group,
            piece,
            wait_for: "#action-plan-table",   //seletor do id para a tabela
            zoom: 1.0,
          }),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errText}`);
      }

      const data = await response.json();
      const files = data.files ?? [];

      const fileList = files.map((f) => `  • ${f.filename}`).join("\n");
      alert(`✅ ${files.length} folha(s) salva(s)!\n\n${fileList}`);

      return data;

    } catch (err) {
      console.error("Erro ao salvar Action Plan:", err);
      alert(`❌ Erro ao salvar: ${err.message}`);
    } finally {
      setSaveLoading(false);
    }
  };

  return { currentJobId, saveLoading, triggerSave };
}


