"use client";
 
import { useState, useMemo } from "react";
import { Type, ChevronRight, ChevronDown, Folder, FolderOpen, Image } from "lucide-react";
import styles from "./reportbuilder.module.css";
 
// ── monta árvore a partir do array plano de charts ────────────────────────────
// estrutura: conjunto → piece → page_type → [charts]
function buildTree(charts) {
  const tree = {};
  for (const chart of charts) {
    const conjunto = chart.group ?? "—";         // ex: CONJUNTO_5980
    const piece    = chart.piece ?? "—";         // ex: 53327786
    const pageType = chart.page_type ?? "—";     // ex: cg, controlchart...
 
    tree[conjunto] ??= {};
    tree[conjunto][piece] ??= {};
    tree[conjunto][piece][pageType] ??= [];
    tree[conjunto][piece][pageType].push(chart);
  }
  return tree;
}
 
// ── nó genérico colapsável ────────────────────────────────────────────────────
function TreeNode({ label, icon: Icon, iconOpen: IconOpen, depth = 0, defaultOpen = false, children, badge }) {
  const [open, setOpen] = useState(defaultOpen);
  const IconComp = open && IconOpen ? IconOpen : Icon;
 
  return (
    <div>
      <div
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.35rem",
          padding: `0.3rem 0.5rem 0.3rem ${0.5 + depth * 0.9}rem`,
          cursor: "pointer",
          borderRadius: "5px",
          userSelect: "none",
          fontSize: depth === 0 ? "0.8rem" : "0.78rem",
          fontWeight: depth === 0 ? 600 : depth === 1 ? 500 : 400,
          color: depth === 0 ? "#2d3748" : "#4a5568",
          transition: "background 0.12s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#edf2f7")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        {open
          ? <ChevronDown size={12} style={{ flexShrink: 0, color: "#a0aec0" }} />
          : <ChevronRight size={12} style={{ flexShrink: 0, color: "#a0aec0" }} />
        }
        <IconComp size={13} style={{ flexShrink: 0, color: depth === 0 ? "#4299e1" : depth === 1 ? "#68d391" : "#f6ad55" }} />
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {label}
        </span>
        {badge != null && (
          <span style={{ fontSize: "0.68rem", background: "#e2e8f0", color: "#718096", borderRadius: "999px", padding: "0 0.4rem", flexShrink: 0 }}>
            {badge}
          </span>
        )}
      </div>
      {open && <div>{children}</div>}
    </div>
  );
}
 
// ── item de imagem (draggável) ────────────────────────────────────────────────
function ChartLeaf({ chart, depth, onDragStart, API }) {
  const [hovered, setHovered] = useState(false);
  const [preview, setPreview] = useState(false);
 
  return (
    <div style={{ position: "relative" }}>
      <div
        draggable
        onDragStart={(e) => onDragStart(e, chart)}
        onMouseEnter={() => { setHovered(true); setPreview(true); }}
        onMouseLeave={() => { setHovered(false); setPreview(false); }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.35rem",
          padding: `0.28rem 0.5rem 0.28rem ${0.5 + depth * 0.9}rem`,
          cursor: "grab",
          borderRadius: "5px",
          fontSize: "0.73rem",
          color: "#4a5568",
          background: hovered ? "#ebf8ff" : "transparent",
          border: hovered ? "1px solid #bee3f8" : "1px solid transparent",
          transition: "all 0.1s",
          userSelect: "none",
        }}
      >
        <Image size={11} style={{ flexShrink: 0, color: "#4299e1" }} />
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
          {chart.filename}
        </span>
      </div>
 
      {/* preview ao hover */}
      {preview && (
        <div style={{
          position: "fixed",
          left: "270px",
          zIndex: 9999,
          background: "white",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          padding: "6px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          pointerEvents: "none",
          width: "200px",
        }}>
          <img
            src={`${API}${chart.url}`}
            alt={chart.filename}
            style={{ width: "100%", height: "auto", borderRadius: "4px", display: "block" }}
            crossOrigin="anonymous"
          />
          <p style={{ margin: "4px 0 0", fontSize: "0.68rem", color: "#718096", textAlign: "center", wordBreak: "break-all" }}>
            {chart.page_type} / {chart.piece}
          </p>
        </div>
      )}
    </div>
  );
}
 
// ── componente principal ──────────────────────────────────────────────────────
export default function LibrarySidebar({
  currentJobId,
  availableCharts,
  loading,
  onAddTextBox,
  onDragStart,
  API,
}) {
  const [search, setSearch] = useState("");
 
  const filtered = useMemo(() => {
    if (!search.trim()) return availableCharts;
    const q = search.toLowerCase();
    return availableCharts.filter(
      (c) =>
        c.filename?.toLowerCase().includes(q) ||
        c.piece?.toLowerCase().includes(q) ||
        c.page_type?.toLowerCase().includes(q) ||
        c.group?.toLowerCase().includes(q)
    );
  }, [availableCharts, search]);
 
  const tree = useMemo(() => buildTree(filtered), [filtered]);
  const totalConjuntos = Object.keys(tree).length;
 
  return (
    <div className={styles.sidebar}>
      {/* header */}
      <div className={styles.sidebarHeader}>
        <h3 className={styles.sidebarTitle}>📚 Biblioteca de Imagens</h3>
        <p className={styles.sidebarSubtitle}>Job: {currentJobId?.slice(0, 18)}…</p>
      </div>
 
      {/* botão texto */}
      <div className={styles.librarySection}>
        <button onClick={onAddTextBox} className={styles.addTextButton}>
          <Type size={16} />
          Nova Caixa de Texto
        </button>
      </div>
 
      {/* busca */}
      <div style={{ padding: "0.5rem 0.75rem", borderBottom: "1px solid #e2e8f0" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar imagem..."
          style={{
            width: "100%",
            padding: "0.35rem 0.6rem",
            border: "1px solid #e2e8f0",
            borderRadius: "6px",
            fontSize: "0.78rem",
            outline: "none",
            boxSizing: "border-box",
            color: "#2d3748",
          }}
        />
      </div>
 
      {/* árvore */}
      <div className={styles.libraryContent} style={{ padding: "0.5rem 0.25rem" }}>
        {loading && (
          <p style={{ color: "#718096", fontSize: "0.82rem", padding: "0.5rem" }}>Carregando...</p>
        )}
 
        {!loading && availableCharts.length === 0 && (
          <p style={{ color: "#a0aec0", fontSize: "0.78rem", lineHeight: "1.5", padding: "0.5rem" }}>
            Nenhuma imagem. Salve gráficos nas páginas de análise.
          </p>
        )}
 
        {!loading && availableCharts.length > 0 && filtered.length === 0 && (
          <p style={{ color: "#a0aec0", fontSize: "0.78rem", padding: "0.5rem" }}>
            Nenhum resultado para "{search}".
          </p>
        )}
 
        {!loading &&
          Object.entries(tree).map(([conjunto, pieces]) => {
            const totalConjunto = Object.values(pieces)
              .flatMap((pt) => Object.values(pt))
              .flat().length;
 
            return (
              <TreeNode
                key={conjunto}
                label={conjunto}
                icon={Folder}
                iconOpen={FolderOpen}
                depth={0}
                defaultOpen={totalConjuntos === 1}
                badge={totalConjunto}
              >
                {Object.entries(pieces).map(([piece, pageTypes]) => {
                  const totalPiece = Object.values(pageTypes).flat().length;
 
                  return (
                    <TreeNode
                      key={piece}
                      label={piece}
                      icon={Folder}
                      iconOpen={FolderOpen}
                      depth={1}
                      badge={totalPiece}
                    >
                      {Object.entries(pageTypes).map(([pageType, charts]) => (
                        <TreeNode
                          key={pageType}
                          label={pageType}
                          icon={Folder}
                          iconOpen={FolderOpen}
                          depth={2}
                          badge={charts.length}
                        >
                          {charts.map((chart, i) => (
                            <ChartLeaf
                              key={i}
                              chart={chart}
                              depth={3}
                              onDragStart={onDragStart}
                              API={API}
                            />
                          ))}
                        </TreeNode>
                      ))}
                    </TreeNode>
                  );
                })}
              </TreeNode>
            );
          })}
      </div>
    </div>
  );
}  
 
 
 