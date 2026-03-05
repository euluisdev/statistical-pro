"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import styles from "./capability.module.css";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

//helpers
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const uid   = () => Math.random().toString(36).slice(2, 9);

//colour logic for CP/CPK 
function cellColor(val) {
  if (val == null) return "";
  const n = parseFloat(val);
  if (n >= 1.33) return styles.cellGreen;
  if (n >= 1.0)  return styles.cellYellow;
  return styles.cellRed;
}
function xmedColor(val, tol) {
  //yellow if |xmed| > 50% of tol
  if (val == null || tol == null) return "";
  return Math.abs(parseFloat(val)) > Math.abs(parseFloat(tol)) * 0.5
    ? styles.cellYellow : styles.cellGreen;
}

// Point card (the draggable table)
function PointCard({ card, locked, onDrag, onConnectorDrag, selected, onSelect }) {
  const { id, point, axes, x, y, connectorX, connectorY } = card;
  const dragStart = useRef(null);

  const handleMouseDown = (e) => {
    if (locked) return;
    e.stopPropagation();
    onSelect(id);
    dragStart.current = { mx: e.clientX, my: e.clientY, ox: x, oy: y };
    const move = (ev) => {
      const dx = ev.clientX - dragStart.current.mx;
      const dy = ev.clientY - dragStart.current.my;
      onDrag(id, dragStart.current.ox + dx, dragStart.current.oy + dy);
    };
    const up = () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  // connector dot drag
  const connDragStart = useRef(null);
  const handleConnMouseDown = (e) => {
    if (locked) return;
    e.stopPropagation();
    connDragStart.current = { mx: e.clientX, my: e.clientY, ox: connectorX, oy: connectorY };
    const move = (ev) => {
      const dx = ev.clientX - connDragStart.current.mx;
      const dy = ev.clientY - connDragStart.current.my;
      onConnectorDrag(id, connDragStart.current.ox + dx, connDragStart.current.oy + dy);
    };
    const up = () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  const fmt = (v) => v == null ? "—" : parseFloat(v).toFixed(2).replace(".", ",");

  return (
    <div
      className={`${styles.card} ${selected && !locked ? styles.cardSelected : ""}`}
      style={{ left: x, top: y }}
      onMouseDown={handleMouseDown}
    >
      {/* Connector line drawn in SVG overlay — anchor dot on card */}
      <div
        className={`${styles.connDot} ${locked ? styles.connDotLocked : ""}`}
        onMouseDown={handleConnMouseDown}
        title="Arraste para mover o ponto de conexão"
      />

      {/* Card header */}
      <div className={styles.cardHeader}>
        <span className={styles.cardIcon}>⊕</span>
        <span className={styles.cardTitle}>{point}</span>
        <span className={styles.cardSubtitle}>AUTOSIGMA</span>
      </div>

      {/* Table */}
      <table className={styles.cardTable}>
        <thead>
          <tr>
            <th>Ax</th><th>CP</th><th>CPK</th><th>XMED</th><th>RANGE</th><th>TOLERANCE</th>
          </tr>
        </thead>
        <tbody>
          {axes.map((ax) => (
            <tr key={ax.axis}>
              <td className={styles.axisCell}>{ax.axis}</td>
              <td className={cellColor(ax.cp)}>{fmt(ax.cp)}</td>
              <td className={cellColor(ax.cpk)}>{fmt(ax.cpk)}</td>
              <td className={xmedColor(ax.xmed, ax.tol_minus)}>{fmt(ax.xmed)}</td>
              <td>{fmt(ax.range)}</td>
              <td className={styles.tolCell}>{ax.tolerance ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Canvas SVG overlay (connector lines) ────────────────────────────────────
function ConnectorOverlay({ cards, canvasW, canvasH }) {
  return (
    <svg className={styles.connectorSvg} width={canvasW} height={canvasH}>
      {cards.map((c) => {
        // line from card centre-left to connectorX/Y
        const cardW = 260, cardH = 20 + c.axes.length * 22;
        const cx = c.x + cardW / 2;
        const cy = c.y + cardH / 2;
        return (
          <line
            key={c.id}
            x1={cx} y1={cy}
            x2={c.connectorX} y2={c.connectorY}
            stroke="#222" strokeWidth="1.2"
            markerEnd="url(#dot)"
          />
        );
      })}
      <defs>
        <marker id="dot" markerWidth="4" markerHeight="4" refX="2" refY="2">
          <circle cx="2" cy="2" r="1.8" fill="#222" />
        </marker>
      </defs>
    </svg>
  );
}

// ─── Single canvas page ───────────────────────────────────────────────────────
const CANVAS_W = 960, CANVAS_H = 660;

function CanvasPage({ pageIndex, cards, locked, bgImage, onDrop,
                      onCardDrag, onConnectorDrag, selectedCardId, onSelectCard }) {
  const canvasRef = useRef(null);

  // drag-over for image drop
  const handleDragOver = (e) => { if (!locked) e.preventDefault(); };
  const handleDrop = (e) => {
    if (locked) return;
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => onDrop(pageIndex, ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      ref={canvasRef}
      className={styles.canvas}
      style={{ width: CANVAS_W, height: CANVAS_H }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Background image */}
      {bgImage && (
        <img src={bgImage} className={styles.canvasBg} alt="peça" draggable={false} />
      )}
      {!bgImage && (
        <div className={styles.canvasBgHint}>
          {locked ? "Sem imagem" : "⬇ Arraste a imagem da peça aqui"}
        </div>
      )}

      {/* Connector lines */}
      <ConnectorOverlay cards={cards} canvasW={CANVAS_W} canvasH={CANVAS_H} />

      {/* Cards */}
      {cards.map((card) => (
        <PointCard
          key={card.id}
          card={card}
          locked={locked}
          onDrag={onCardDrag}
          onConnectorDrag={onConnectorDrag}
          selected={selectedCardId === card.id}
          onSelect={onSelectCard}
        />
      ))}

      {/* Page number */}
      <div className={styles.pageNum}>Pág. {pageIndex + 1}</div>
    </div>
  );
}

// ─── Config Modal ─────────────────────────────────────────────────────────────
function ConfigModal({ group, piece, totalPages, onClose, onApply }) {
  const [points,    setPoints]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [numPages,  setNumPages]  = useState(totalPages ?? 1);
  // selections: { pointId: { axes: { X: pageIdx, Y: pageIdx, ... } } }
  const [selections, setSelections] = useState({});

  useEffect(() => {
    fetch(`${API}/pieces/${group}/${piece}/capability-points`)
      .then((r) => { if (!r.ok) throw new Error(`Erro ${r.status}`); return r.json(); })
      .then((d) => { setPoints(d.points); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [group, piece]);

  const togglePoint = (ptId) =>
    setSelections((prev) => ({ ...prev, [ptId]: prev[ptId] ? undefined : { axes: {} } }));

  const setAxisPage = (ptId, axis, pageIdx) =>
    setSelections((prev) => ({
      ...prev,
      [ptId]: { ...prev[ptId], axes: { ...(prev[ptId]?.axes ?? {}), [axis]: pageIdx } },
    }));

  const removeAxis = (ptId, axis) =>
    setSelections((prev) => {
      const axes = { ...(prev[ptId]?.axes ?? {}) };
      delete axes[axis];
      return { ...prev, [ptId]: { ...prev[ptId], axes } };
    });

  const handleApply = () => {
    const result = [];
    for (const [ptId, sel] of Object.entries(selections)) {
      if (!sel) continue;
      const axesArr = Object.entries(sel.axes ?? {})
        .filter(([, pg]) => pg != null)
        .map(([axis, pageIdx]) => {
          const pt  = points.find((p) => p.id === ptId);
          const axd = pt?.axes?.find((a) => a.axis === axis) ?? {};
          return { axis, pageIdx, ...axd };
        });
      if (axesArr.length === 0) continue;
      result.push({ pointId: ptId, axes: axesArr });
    }
    onApply({ numPages, selections: result });
    onClose();
  };

  const pages = Array.from({ length: numPages }, (_, i) => i);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Configurar Capability Report</h3>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.modalBody}>
          {/* Coluna esquerda: pontos */}
          <div className={styles.modalCol} style={{ flex: 2 }}>
            <div className={styles.modalColTitle}>Pontos de Medição</div>
            {loading && <div className={styles.loadingMsg}>Carregando…</div>}
            {error   && <div className={styles.errorMsg}>Erro: {error}</div>}
            {!loading && !error && (
              <div className={styles.pointList}>
                {points.map((pt) => {
                  const open = !!selections[pt.id];
                  return (
                    <div key={pt.id}
                      className={`${styles.pointItem} ${open ? styles.pointSelected : ""}`}>
                      <div className={styles.pointHeader} onClick={() => togglePoint(pt.id)}>
                        <span className={styles.pointCheck}>{open ? "▼" : "▶"}</span>
                        <span className={styles.pointLabel}>{pt.id}</span>
                        <span className={styles.pointType}>{pt.tipo}</span>
                      </div>
                      {open && (
                        <div className={styles.axisPageGrid}>
                          {pt.axes?.map((axd) => {
                            const curPage = selections[pt.id]?.axes?.[axd.axis];
                            const active  = curPage != null;
                            return (
                              <div key={axd.axis} className={styles.axisPageRow}>
                                <button
                                  className={`${styles.axisBtn} ${active ? styles.axisBtnActive : ""}`}
                                  onClick={() => active ? removeAxis(pt.id, axd.axis) : setAxisPage(pt.id, axd.axis, 0)}
                                >
                                  {axd.axis}
                                </button>
                                {active && (
                                  <select
                                    className={styles.pageSelect}
                                    value={curPage}
                                    onChange={(e) => setAxisPage(pt.id, axd.axis, parseInt(e.target.value))}
                                  >
                                    {pages.map((pg) => (
                                      <option key={pg} value={pg}>Pág. {pg + 1}</option>
                                    ))}
                                  </select>
                                )}
                                {active && (
                                  <span className={styles.axisStats}>
                                    CP {axd.cp?.toFixed(2) ?? "—"} | CPK {axd.cpk?.toFixed(2) ?? "—"}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Coluna direita: configurações gerais */}
          <div className={styles.modalCol} style={{ flex: 1, minWidth: 200 }}>
            <div className={styles.modalColTitle}>Configurações</div>

            <div className={styles.configBlock}>
              <label className={styles.configLabel}>Nº de Páginas</label>
              <div className={styles.pageCountRow}>
                <button className={styles.pgBtn}
                  onClick={() => setNumPages((n) => Math.max(1, n - 1))}>−</button>
                <span className={styles.pgCount}>{numPages}</span>
                <button className={styles.pgBtn}
                  onClick={() => setNumPages((n) => Math.min(10, n + 1))}>+</button>
              </div>
            </div>

            <div className={styles.configBlock}>
              <div className={styles.configLabel}>Resumo</div>
              {Object.entries(selections)
                .filter(([, v]) => v && Object.keys(v.axes ?? {}).length > 0)
                .map(([ptId, sel]) => (
                  <div key={ptId} className={styles.summaryRow}>
                    <span className={styles.summaryPoint}>{ptId}</span>
                    <span className={styles.summaryAxes}>
                      {Object.entries(sel.axes ?? {}).map(([ax, pg]) => (
                        <span key={ax} className={styles.axisTag}>
                          {ax}→P{pg + 1}
                        </span>
                      ))}
                    </span>
                  </div>
                ))}
              {Object.values(selections).every((v) => !v || !Object.keys(v?.axes ?? {}).length) && (
                <div className={styles.emptyMsg}>Nenhum eixo selecionado</div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancelar</button>
          <button className={styles.generateBtn} onClick={handleApply}>Gerar Relatório</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CapabilityPage({ params }) {
  const { group, piece } = params;
  const router = useRouter();

  const [modalOpen,   setModalOpen]   = useState(false);
  const [locked,      setLocked]      = useState(false);
  const [pages,       setPages]       = useState([]);      // array of pages
  const [activePage,  setActivePage]  = useState(0);
  const [selectedCard, setSelectedCard] = useState(null);

  // Carrega estado salvo do backend ao montar
  useEffect(() => {
    fetch(`${API}/pieces/${group}/${piece}/capability-layout`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (d?.pages) { setPages(d.pages); setLocked(d.locked ?? false); }
      })
      .catch(() => {});
  }, [group, piece]);

  // Persiste estado no backend (debounced)
  const saveTimer = useRef(null);
  const persistLayout = useCallback((newPages, newLocked) => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      fetch(`${API}/pieces/${group}/${piece}/capability-layout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pages: newPages, locked: newLocked }),
      }).catch(() => {});
    }, 800);
  }, [group, piece]);

  // Gera o relatório a partir das seleções do modal
  const handleApply = ({ numPages, selections }) => {
    // Build pages array: each page has cards[] and bgImage
    const newPages = Array.from({ length: numPages }, (_, pi) => {
      const existingPage = pages[pi] ?? {};
      const cards = selections
        .filter((s) => s.axes.some((a) => a.pageIdx === pi))
        .map((s) => {
          // Check if card already exists (preserve position)
          const existing = existingPage.cards?.find((c) => c.point === s.pointId);
          const spreadX  = 40 + (selections.indexOf(s) % 4) * 270;
          const spreadY  = 40 + Math.floor(selections.indexOf(s) / 4) * 140;
          return {
            id:          existing?.id ?? uid(),
            point:       s.pointId,
            axes:        s.axes.filter((a) => a.pageIdx === pi),
            x:           existing?.x ?? spreadX,
            y:           existing?.y ?? spreadY,
            connectorX:  existing?.connectorX ?? (spreadX + 130),
            connectorY:  existing?.connectorY ?? (spreadY - 40),
          };
        });
      return { cards, bgImage: existingPage.bgImage ?? null };
    });
    setPages(newPages);
    setActivePage(0);
    persistLayout(newPages, locked);
  };

  const updatePages = (newPages) => {
    setPages(newPages);
    persistLayout(newPages, locked);
  };

  const handleCardDrag = (cardId, nx, ny) => {
    if (locked) return;
    setPages((prev) => {
      const next = prev.map((pg, pi) => {
        if (pi !== activePage) return pg;
        return { ...pg, cards: pg.cards.map((c) =>
          c.id === cardId
            ? { ...c, x: clamp(nx, 0, CANVAS_W - 260), y: clamp(ny, 0, CANVAS_H - 80) }
            : c
        )};
      });
      persistLayout(next, locked);
      return next;
    });
  };

  const handleConnectorDrag = (cardId, nx, ny) => {
    if (locked) return;
    setPages((prev) => {
      const next = prev.map((pg, pi) => {
        if (pi !== activePage) return pg;
        return { ...pg, cards: pg.cards.map((c) =>
          c.id === cardId
            ? { ...c, connectorX: clamp(nx, 0, CANVAS_W), connectorY: clamp(ny, 0, CANVAS_H) }
            : c
        )};
      });
      persistLayout(next, locked);
      return next;
    });
  };

  const handleImageDrop = (pageIdx, dataUrl) => {
    if (locked) return;
    setPages((prev) => {
      const next = prev.map((pg, i) => i === pageIdx ? { ...pg, bgImage: dataUrl } : pg);
      persistLayout(next, locked);
      return next;
    });
  };

  const toggleLock = () => {
    const next = !locked;
    setLocked(next);
    persistLayout(pages, next);
  };

  const currentPage = pages[activePage];

  return (
    <div className={styles.pageBackground}>
      <div className={styles.container}>

        {/* ── Toolbar ─────────────────────────────────────── */}
        <div className={styles.toolbar}>
          <button className={styles.backBtn} onClick={() => router.push("/")}>← Voltar</button>

          <div className={styles.toolbarCenter}>
            <span className={styles.toolbarTitle}>CAPABILITY REPORT</span>
            <span className={styles.toolbarSub}>{group} / {piece}</span>
          </div>

          <div className={styles.toolbarRight}>
            {/* Lock button */}
            <button
              className={`${styles.lockBtn} ${locked ? styles.lockBtnLocked : styles.lockBtnOpen}`}
              onClick={toggleLock}
              title={locked ? "Relatório travado — clique para editar" : "Clique para travar o relatório"}
            >
              {locked ? "🔒 Travado" : "🔓 Editando"}
            </button>

            <button className={styles.openBtn} onClick={() => setModalOpen(true)}>
              ⚙ Configurar
            </button>
          </div>
        </div>

        {/* ── Page tabs ───────────────────────────────────── */}
        {pages.length > 0 && (
          <div className={styles.pageTabs}>
            {pages.map((_, i) => (
              <button
                key={i}
                className={`${styles.pageTab} ${i === activePage ? styles.pageTabActive : ""}`}
                onClick={() => setActivePage(i)}
              >
                Página {i + 1}
              </button>
            ))}
          </div>
        )}

        {/* ── Canvas area ─────────────────────────────────── */}
        {pages.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📊</div>
            <p>Clique em <strong>⚙ Configurar</strong> para montar o relatório</p>
          </div>
        ) : currentPage ? (
          <div className={styles.canvasWrapper}>
            {/* Image upload button (when not locked) */}
            {!locked && (
              <label className={styles.imgUploadBtn} title="Ou arraste uma imagem direto no canvas">
                🖼 Importar Imagem
                <input type="file" accept="image/*" style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => handleImageDrop(activePage, ev.target.result);
                    reader.readAsDataURL(file);
                  }}
                />
              </label>
            )}

            <CanvasPage
              pageIndex={activePage}
              cards={currentPage.cards ?? []}
              locked={locked}
              bgImage={currentPage.bgImage}
              onDrop={handleImageDrop}
              onCardDrag={handleCardDrag}
              onConnectorDrag={handleConnectorDrag}
              selectedCardId={selectedCard}
              onSelectCard={setSelectedCard}
            />

            {!locked && (
              <div className={styles.canvasHint}>
                💡 Arraste as tabelinhas e os pontos de conexão (•) para posicioná-los.
                Arraste uma imagem da peça para o canvas.
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/*modal */}
      {modalOpen && (
        <ConfigModal
          group={group}
          piece={piece}
          totalPages={pages.length || 1}
          onClose={() => setModalOpen(false)}
          onApply={handleApply}
        />
      )}
    </div>
  );
}  
 
 
 