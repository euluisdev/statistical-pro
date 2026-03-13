"use client";
 
import { useRef, useCallback, memo } from "react";
import styles from "./capability.module.css";
import { cellColor, xmedColor } from "./CellColor";
 
const fmt = (v) => v == null ? "—" : parseFloat(v).toFixed(2).replace(".", ",");
 
const PointCard = memo(function PointCard({
  card, locked, onDrag, onConnectorDrag, selected, onSelect,
}) {
  const { id, point, axes, x, y, connectorX, connectorY } = card;
 
  //card drag with requestAnimationFrame 
  const dragState = useRef(null);
  const rafId     = useRef(null);
 
  const handleMouseDown = useCallback((e) => {
    if (locked) return;
    e.stopPropagation();
    onSelect(id);
    dragState.current = { mx: e.clientX, my: e.clientY, ox: x, oy: y };
 
    const move = (ev) => {
      if (!dragState.current) return;
      //here I cancelo frame anterior para não acumular chamadas
      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        const dx = ev.clientX - dragState.current.mx;
        const dy = ev.clientY - dragState.current.my;
        onDrag(id, dragState.current.ox + dx, dragState.current.oy + dy);
      });
    };
 
    const up = () => {
      dragState.current = null;
      if (rafId.current) cancelAnimationFrame(rafId.current);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
 
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  }, [locked, id, x, y, onDrag, onSelect]);
 
  //connector dot drag with rAF
  const connState  = useRef(null);
  const connRafId  = useRef(null);
 
  const handleConnMouseDown = useCallback((e) => {
    if (locked) return;
    e.stopPropagation();
    connState.current = { mx: e.clientX, my: e.clientY, ox: connectorX, oy: connectorY };
 
    const move = (ev) => {
      if (!connState.current) return;
      if (connRafId.current) cancelAnimationFrame(connRafId.current);
      connRafId.current = requestAnimationFrame(() => {
        const dx = ev.clientX - connState.current.mx;
        const dy = ev.clientY - connState.current.my;
        onConnectorDrag(id, connState.current.ox + dx, connState.current.oy + dy);
      });
    };
 
    const up = () => {
      connState.current = null;
      if (connRafId.current) cancelAnimationFrame(connRafId.current);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
 
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  }, [locked, id, connectorX, connectorY, onConnectorDrag]);
 
  return (
    <div
      className={`${styles.card} ${selected && !locked ? styles.cardSelected : ""}`}
      style={{ left: x, top: y }}
      onMouseDown={handleMouseDown}
    >
      <div
        className={`${styles.connDot} ${locked ? styles.connDotLocked : ""}`}
        onMouseDown={handleConnMouseDown}
        title="Arraste para mover o ponto de conexão"
      />
 
      <div className={styles.cardHeader}>
        <span className={styles.cardIcon}>⊕</span>
        <span className={styles.cardTitle}>{point}</span>
        <span className={styles.cardSubtitle}>AUTOSIGMA</span>
      </div>
 
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
});
 
export default PointCard;

