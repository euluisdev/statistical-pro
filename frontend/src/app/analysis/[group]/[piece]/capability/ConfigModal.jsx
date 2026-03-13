"use client";
 
import { useState, useEffect, useCallback, memo } from "react";
import styles from "./capability.module.css";
 
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
 
//sub-componente memoizado: linha de eixo + select de page
const AxisRow = memo(function AxisRow({ axd, active, curPage, pages, onToggle, onChangePage }) {
  return (
    <div className={styles.axisPageRow}>
      <button
        className={`${styles.axisBtn} ${active ? styles.axisBtnActive : ""}`}
        onClick={onToggle}
      >
        {axd.axis}
      </button>
      {active && (
        <select
          className={styles.pageSelect}
          value={curPage}
          onChange={(e) => onChangePage(parseInt(e.target.value))}
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
});
 
//sub-componente memoizado - item de ponto na lista
const PointItem = memo(function PointItem({ pt, open, selection, pages, onToggle, onAxisToggle, onAxisPage }) {
  return (
    <div className={`${styles.pointItem} ${open ? styles.pointSelected : ""}`}>
      <div className={styles.pointHeader} onClick={() => onToggle(pt.id)}>
        <span className={styles.pointCheck}>{open ? "▼" : "▶"}</span>
        <span className={styles.pointLabel}>{pt.id}</span>
        <span className={styles.pointType}>{pt.tipo}</span>
      </div>
      {open && (
        <div className={styles.axisPageGrid}>
          {pt.axes?.map((axd) => {
            const curPage = selection?.axes?.[axd.axis];
            const active  = curPage != null;
            return (
              <AxisRow
                key={axd.axis}
                axd={axd}
                active={active}
                curPage={curPage ?? 0}
                pages={pages}
                onToggle={() => onAxisToggle(pt.id, axd.axis, active)}
                onChangePage={(pg) => onAxisPage(pt.id, axd.axis, pg)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
});
 
//modal principal
export default function ConfigModal({
  group,
  piece,
  totalPages,
  //state anterior
  previousSelections,
  previousNumPages,
  onClose,
  onApply,
}) {
  const [points,     setPoints]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [numPages,   setNumPages]   = useState(previousNumPages ?? totalPages ?? 1);
 
  //here I restauro seleções anteriores se existirem - senão começa vazio default
  const [selections, setSelections] = useState(previousSelections ?? {});
 
  useEffect(() => {
    fetch(`${API}/pieces/${group}/${piece}/capability-points`)
      .then((r) => { if (!r.ok) throw new Error(`Erro ${r.status}`); return r.json(); })
      .then((d) => { setPoints(d.points); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [group, piece]);
 
  const togglePoint = useCallback((ptId) =>
    setSelections((prev) => ({
      ...prev,
      [ptId]: prev[ptId] ? undefined : { axes: {} },
    })), []);
 
  const handleAxisToggle = useCallback((ptId, axis, isActive) => {
    if (isActive) {
      //remove eixo
      setSelections((prev) => {
        const axes = { ...(prev[ptId]?.axes ?? {}) };
        delete axes[axis];
        return { ...prev, [ptId]: { ...prev[ptId], axes } };
      });
    } else {
      //adiciona eixo na página 0
      setSelections((prev) => ({
        ...prev,
        [ptId]: {
          ...prev[ptId],
          axes: { ...(prev[ptId]?.axes ?? {}), [axis]: 0 },
        },
      }));
    }
  }, []);
 
  const handleAxisPage = useCallback((ptId, axis, pageIdx) =>
    setSelections((prev) => ({
      ...prev,
      [ptId]: {
        ...prev[ptId],
        axes: { ...(prev[ptId]?.axes ?? {}), [axis]: pageIdx },
      },
    })), []);
 
  const handleApply = useCallback(() => {
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
    onApply({ numPages, selections: result, rawSelections: selections });
    onClose();
  }, [selections, points, numPages, onApply, onClose]);
 
  const pages = Array.from({ length: numPages }, (_, i) => i);
 
  const hasAnySelection = Object.values(selections).some(
    (v) => v && Object.keys(v?.axes ?? {}).length > 0
  );
 
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
 
        <div className={styles.modalHeader}>
          <h3>Configurar Capability Report</h3>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
 
        <div className={styles.modalBody}>
 
          {/*coluna esquerda — pontos */}
          <div className={styles.modalCol} style={{ flex: 2 }}>
            <div className={styles.modalColTitle}>Pontos de Medição</div>
            {loading && <div className={styles.loadingMsg}>Carregando…</div>}
            {error   && <div className={styles.errorMsg}>Erro: {error}</div>}
            {!loading && !error && (
              <div className={styles.pointList}>
                {points.map((pt) => (
                  <PointItem
                    key={pt.id}
                    pt={pt}
                    open={!!selections[pt.id]}
                    selection={selections[pt.id]}
                    pages={pages}
                    onToggle={togglePoint}
                    onAxisToggle={handleAxisToggle}
                    onAxisPage={handleAxisPage}
                  />
                ))}
              </div>
            )}
          </div>
 
          {/*coluna direita — configurações */}
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
              {!hasAnySelection && (
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
 
 