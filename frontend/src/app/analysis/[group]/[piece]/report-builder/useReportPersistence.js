import { useRef, useCallback, useState } from "react";
 
export function useReportPersistence(group, conjunto, API) {
  const saveTimer = useRef(null);
  const [lastSaved, setLastSaved] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
 
  // ── auto-save com debounce (igual ao persistLayout das outras pages) ───────
  const persistLayout = useCallback(
    (pages, pageOrientation, reportName) => {
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        setIsSaving(true);
        fetch(`${API}/reportbuilder/${group}/${conjunto}/layout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pages, pageOrientation, reportName }),
        })
          .then((r) => {
            if (r.ok) setLastSaved(new Date());
          })
          .catch(() => {})
          .finally(() => setIsSaving(false));
      }, 800); // mesmo debounce das outras pages
    },
    [group, conjunto, API]
  );
 
  // ── carrega layout ao montar (igual ao useEffect das outras pages) ─────────
  const loadLayout = useCallback(async () => {
    const r = await fetch(`${API}/reportbuilder/${group}/${conjunto}/layout`);
    if (!r.ok) return null;
    const d = await r.json();
    // retorna null se vier {} (canvas ainda vazio)
    return d && d.pages ? d : null;
  }, [group, conjunto, API]);
 
  // ── lista snapshots nomeados ──────────────────────────────────────────────
  const listReports = useCallback(async () => {
    const r = await fetch(`${API}/reportbuilder/${group}/${conjunto}/list`);
    if (!r.ok) return [];
    return r.json();
  }, [group, conjunto, API]);
 
  // ── salva snapshot nomeado ────────────────────────────────────────────────
  const saveNamedReport = useCallback(
    async (name, pages, pageOrientation, reportName) => {
      const r = await fetch(
        `${API}/reportbuilder/${group}/${conjunto}/list/${encodeURIComponent(name)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pages, pageOrientation, reportName }),
        }
      );
      if (!r.ok) throw new Error("Erro ao salvar snapshot.");
      return r.json();
    },
    [group, conjunto, API]
  );
 
  // ── carrega snapshot nomeado ──────────────────────────────────────────────
  const loadNamedReport = useCallback(
    async (name) => {
      const r = await fetch(
        `${API}/reportbuilder/${group}/${conjunto}/list/${encodeURIComponent(name)}`
      );
      if (!r.ok) throw new Error("Report não encontrado.");
      return r.json();
    },
    [group, conjunto, API]
  );
 
  // ── deleta snapshot nomeado ───────────────────────────────────────────────
  const deleteReport = useCallback(
    async (name) => {
      await fetch(
        `${API}/reportbuilder/${group}/${conjunto}/list/${encodeURIComponent(name)}`,
        { method: "DELETE" }
      );
    },
    [group, conjunto, API]
  );
 
  return {
    persistLayout,
    loadLayout,
    listReports,
    saveNamedReport,
    loadNamedReport,
    deleteReport,
    lastSaved,
    isSaving,
  };
}  
 
 
