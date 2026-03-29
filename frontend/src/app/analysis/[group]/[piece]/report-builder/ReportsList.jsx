"use client";

import { useEffect, useState } from "react";
import { FileText, Trash2, FolderOpen, X, Clock, Save } from "lucide-react";
import { useParams } from "next/navigation";

function fmt(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function ReportsList({ API, currentState, onLoad, onClose }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingName, setSavingName] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const { group } = useParams(); // [group] da rota analysis/[group]/[piece]
  // piece é ignorado aqui — o relatório pertence ao conjunto inteiro

  async function fetchList() {
    setLoading(true);
    try {
      const r = await fetch(`${API}/reportbuilder/${group}/list`);
      if (r.ok) setReports(await r.json());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchList(); }, []);

  async function handleSaveSnapshot() {
    const name = savingName.trim();
    if (!name) return;
    setSaving(true);
    try {
      await fetch(
        `${API}/reportbuilder/${group}/list/${encodeURIComponent(name)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(currentState),
        }
      );
      setSavingName("");
      fetchList();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(name) {
    if (!confirm(`Excluir "${name}"?`)) return;
    setDeleting(name);
    await fetch(
      `${API}/reportbuilder/${group}/list/${encodeURIComponent(name)}`,
      { method: "DELETE" }
    );
    setDeleting(null);
    fetchList();
  }

  async function handleLoad(name) {
    const r = await fetch(
      `${API}/reportbuilder/${group}/list/${encodeURIComponent(name)}`
    );
    if (!r.ok) return alert("Erro ao carregar.");
    const data = await r.json();
    onLoad(data);
    onClose();
  }

  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={header}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <FileText size={20} color="#4f6ef7" />
            <h2 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 600 }}>
              Relatórios salvos
            </h2>
          </div>
          <button onClick={onClose} style={iconBtn}><X size={18} /></button>
        </div>

        <div style={saveRow}>
          <input
            value={savingName}
            onChange={(e) => setSavingName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSaveSnapshot()}
            placeholder="Nome do snapshot (ex: Versão final)"
            style={input}
          />
          <button
            onClick={handleSaveSnapshot}
            disabled={saving || !savingName.trim()}
            style={btnPrimary}
          >
            <Save size={14} />
            {saving ? "Salvando…" : "Salvar atual"}
          </button>
        </div>

        <div style={body}>
          {loading && <p style={hint}>Carregando…</p>}
          {!loading && reports.length === 0 && (
            <div style={emptyState}>
              <FileText size={40} color="#cbd5e0" />
              <p>Nenhum relatório salvo ainda.</p>
            </div>
          )}
          {!loading && reports.map((r) => (
            <div key={r.name} style={card}>
              <div style={cardLeft}>
                <strong style={{ fontSize: "0.9rem" }}>{r.reportName || r.name}</strong>
                <span style={meta}>
                  <Clock size={11} />
                  {fmt(r.updated_at)} · {r.page_count} pág.
                </span>
              </div>
              <div style={cardActions}>
                <button style={btnLoad} onClick={() => handleLoad(r.name)}>
                  <FolderOpen size={13} /> Abrir
                </button>
                <button
                  style={btnDelete}
                  onClick={() => handleDelete(r.name)}
                  disabled={deleting === r.name}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const overlay = {
  position: "fixed", inset: 0,
  background: "rgba(0,0,0,0.45)",
  display: "flex", alignItems: "center", justifyContent: "center",
  zIndex: 1000,
};
const modal = {
  background: "#fff", borderRadius: "12px",
  width: "min(520px, 95vw)", maxHeight: "80vh",
  display: "flex", flexDirection: "column",
  boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
};
const header = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  padding: "1rem 1.25rem", borderBottom: "1px solid #e2e8f0",
};
const saveRow = {
  display: "flex", gap: "0.5rem",
  padding: "0.85rem 1.25rem", borderBottom: "1px solid #e2e8f0",
};
const body = {
  padding: "0.85rem 1.25rem", overflowY: "auto",
  display: "flex", flexDirection: "column", gap: "0.6rem",
};
const emptyState = {
  display: "flex", flexDirection: "column",
  alignItems: "center", gap: "0.4rem",
  color: "#a0aec0", padding: "1.5rem 0",
};
const card = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  padding: "0.7rem 0.9rem", border: "1px solid #e2e8f0",
  borderRadius: "8px", gap: "1rem",
};
const cardLeft = { display: "flex", flexDirection: "column", gap: "0.2rem", flex: 1 };
const cardActions = { display: "flex", gap: "0.35rem", flexShrink: 0 };
const meta = {
  display: "flex", alignItems: "center", gap: "0.25rem",
  fontSize: "0.75rem", color: "#718096",
};
const hint = { color: "#888", textAlign: "center", fontSize: "0.85rem" };
const iconBtn = {
  background: "none", border: "none", cursor: "pointer", color: "#718096",
  display: "flex", alignItems: "center",
};
const input = {
  flex: 1, padding: "0.45rem 0.75rem",
  border: "1px solid #e2e8f0", borderRadius: "6px",
  fontSize: "0.85rem", outline: "none",
};
const base = {
  border: "none", borderRadius: "6px",
  padding: "0.4rem 0.7rem", cursor: "pointer",
  display: "flex", alignItems: "center", gap: "0.3rem",
  fontSize: "0.8rem", fontWeight: 500,
};
const btnPrimary = { ...base, background: "#4f6ef7", color: "#fff" };
const btnLoad = { ...base, background: "#ebf4ff", color: "#3182ce" };
const btnDelete = { ...base, background: "#fff5f5", color: "#e53e3e" };  
 
 
 