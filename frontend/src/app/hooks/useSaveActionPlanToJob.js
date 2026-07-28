//fluxo:
//busca todos os planos da peça
//calcula as "fatias" de planos por altura acumulada - sem cortar seq
//para cada fatia, chama o backend passando start/end na URL
//backend abre a URL de print, tira screenshot, salva png
//a lib playwright é apenas um fotógrafo — não manipula DOM

import { useState, useEffect } from "react";

//altura máxima útil por página em px, na escala do browser
const MAX_PAGE_HEIGHT = 1000;

const API      = process.env.NEXT_PUBLIC_API_URL      || "http://localhost:8000";
const FRONTEND = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";

export function useSaveActionPlanToJob() {
  const [currentJobId, setCurrentJobId] = useState(null);
  const [saveLoading,  setSaveLoading]  = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined")
      setCurrentJobId(localStorage.getItem("current_jobid"));
  }, []);

  //calcula altura estimada de cada plano - antes de abrir a playwright
  //estimativa simples: header ~50px + cada row ~38px
  //não precisa ser exata — apenas boa o suficiente para não estourar a folha
  function estimatePlanHeight(plan) {
    const rowsH = (plan.rows?.length ?? 1) * 38;
    return rowsH + 4;   // 4px de margem entre planos
  }

  //divide planos em fatias sem cortar nenhum plano no meio
  function buildPageSlices(plans) {
    const HEADER_H = 80;   //altura aproximada do thead
    const slices   = [];   //cada item: start: idx, end: idx
    let pageH      = HEADER_H;
    let pageStart  = 0;

    plans.forEach((plan, idx) => {
      const planH = estimatePlanHeight(plan);

      if (idx > pageStart && pageH + planH > MAX_PAGE_HEIGHT) {
        //fecha a página atual sem incluir este plano
        slices.push({ start: pageStart, end: idx - 1 });
        pageStart = idx;
        pageH     = HEADER_H + planH;
      } else {
        pageH += planH;
      }
    });

    //ultima page
    if (pageStart < plans.length) {
      slices.push({ start: pageStart, end: plans.length - 1 });
    }

    return slices;
  }

  //dispara o print
  const triggerSave = async (group, piece) => {
    if (!currentJobId) {
      alert("⚠️ Nenhum Job ativo!");
      return;
    }

    setSaveLoading(true);

    try {
      //busca todos os planos para calcular as fatias
      const plansRes = await fetch(`${API}/pieces/${group}/${piece}/action-plans`);
      if (!plansRes.ok) throw new Error("Erro ao buscar planos");
      const { plans = [] } = await plansRes.json();

      if (plans.length === 0) {
        alert("⚠️ Nenhum plano de ação para capturar.");
        return;
      }

      const sorted = [...plans].sort((a, b) => a.seq - b.seq);
      const slices = buildPageSlices(sorted);

      const allFiles = [];

      //para cada fatia, chama o backend com a URL de print correspondente
      for (let i = 0; i < slices.length; i++) {
        const { start, end } = slices[i];

        //URL da rota de print isolada
        const printUrl = `${FRONTEND}/analysis/${group}/${piece}/action-plan/print?start=${start}&end=${end}`;

        const res = await fetch(
          `${API}/jobs/job/${currentJobId}/screenshot-action-plan`,
          {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              page_url:   printUrl,
              group,
              piece,
              page_index: i,          //backend usa para nomear o arquivo
              total_pages: slices.length,
            }),
          }
        );

        if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);

        const data = await res.json();
        allFiles.push(...(data.files ?? []));
      }

      alert(
        `✅ ${allFiles.length} folha(s) salva(s)!\n` +
        allFiles.map((f) => `  • ${f.filename}`).join("\n")
      );

      return { files: allFiles };

    } catch (err) {
      console.error("Erro ao salvar Action Plan:", err);
      alert(`❌ ${err.message}`);
    } finally {
      setSaveLoading(false);
    }
  };

  return { currentJobId, saveLoading, triggerSave };
}  
 
 