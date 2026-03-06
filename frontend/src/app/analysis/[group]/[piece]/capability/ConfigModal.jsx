"use client";

import { useState, useEffect } from "react";
import styles from "./capability.module.css";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ConfigModal({ group, piece, totalPages, onClose, onApply }) {
  const [points,     setPoints]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [numPages,   setNumPages]   = useState(totalPages ?? 1);
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

          {/* Coluna esquerda — pontos */}
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
                                  onClick={() =>
                                    active
                                      ? removeAxis(pt.id, axd.axis)
                                      : setAxisPage(pt.id, axd.axis, 0)
                                  }
                                >
                                  {axd.axis}
                                </button>
                                {active && (
                                  <select
                                    className={styles.pageSelect}
                                    value={curPage}
                                    onChange={(e) =>
                                      setAxisPage(pt.id, axd.axis, parseInt(e.target.value))
                                    }
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

          {/* Coluna direita — configurações */}
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
              {Object.values(selections).every(
                (v) => !v || !Object.keys(v?.axes ?? {}).length
              ) && (
                <div className={styles.emptyMsg}>Nenhum eixo selecionado</div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.cancelBtn}   onClick={onClose}>Cancelar</button>
          <button className={styles.generateBtn} onClick={handleApply}>Gerar Relatório</button>
        </div>

      </div>
    </div>
  );
}  
 
 