// useSaveActionPlanToJob.js — minimalista

import { useState, useEffect } from "react";

export function useSaveActionPlanToJob() {
  const [currentJobId, setCurrentJobId] = useState(null);
  const [saveLoading,  setSaveLoading]  = useState(false);

  const API      = process.env.NEXT_PUBLIC_API_URL      || "http://localhost:8000";
  const FRONTEND = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";

  useEffect(() => {
    if (typeof window !== "undefined")
      setCurrentJobId(localStorage.getItem("current_jobid"));
  }, []);

  const triggerSave = async (group, piece) => {
    if (!currentJobId) {
      alert("⚠️ Nenhum Job ativo!");
      return;
    }

    setSaveLoading(true);
    try {
      const res = await fetch(
        `${API}/jobs/job/${currentJobId}/screenshot-action-plan`,
        {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            page_url: `${FRONTEND}/analysis/${group}/${piece}/action-plan`, 
            group,
            piece,
          }),
        }
      );

      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);

      const data  = await res.json();
      const files = data.files ?? [];
      alert(`✅ ${files.length} folha(s) salva(s)!\n${files.map(f => `  • ${f.filename}`).join("\n")}`);
      return data;

    } catch (err) {
      alert(`❌ ${err.message}`);
    } finally {
      setSaveLoading(false);
    }
  };

  return { currentJobId, saveLoading, triggerSave };
}