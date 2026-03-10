"use client";

import { memo, useRef } from "react";
import styles from "./capability.module.css";
import { cellColor, xmedColor } from "./CellColor";

const fmt = (v) => v == null ? "—" : parseFloat(v).toFixed(2).replace(".", ",");

function PointCard({ card, locked, onDrag, onConnectorDrag, selected, onSelect }) {
  const { id, point, axes, x, y, connectorX, connectorY } = card;

  const dragStart = useRef(null);
  const connDragStart = useRef(null);

  const dragFrame = useRef(null);
  const connFrame = useRef(null);

  //card drag
  const handleMouseDown = (e) => {
    if (locked) return;

    e.stopPropagation();
    onSelect(id);

    dragStart.current = { mx: e.clientX, my: e.clientY, ox: x, oy: y };

    const move = (ev) => {

      if (dragFrame.current) {
        cancelAnimationFrame(dragFrame.current);
      }

      dragFrame.current = requestAnimationFrame(() => {
        const dx = ev.clientX - dragStart.current.mx;
        const dy = ev.clientY - dragStart.current.my;

        onDrag(
          id,
          dragStart.current.ox + dx,
          dragStart.current.oy + dy
        );
      });

    };

    const up = () => {
      if (dragFrame.current) {
        cancelAnimationFrame(dragFrame.current);
      }

      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  //connector dot drag
  const handleConnMouseDown = (e) => {
    if (locked) return;

    e.stopPropagation();

    connDragStart.current = {
      mx: e.clientX,
      my: e.clientY,
      ox: connectorX,
      oy: connectorY
    };

    const move = (ev) => {

      if (connFrame.current) {
        cancelAnimationFrame(connFrame.current);
      }

      connFrame.current = requestAnimationFrame(() => {
        const dx = ev.clientX - connDragStart.current.mx;
        const dy = ev.clientY - connDragStart.current.my;

        onConnectorDrag(
          id,
          connDragStart.current.ox + dx,
          connDragStart.current.oy + dy
        );
      });

    };

    const up = () => {
      if (connFrame.current) {
        cancelAnimationFrame(connFrame.current);
      }

      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  return (
    <div
      className={`${styles.card} ${selected && !locked ? styles.cardSelected : ""}`}
      style={{ left: x, top: y }}
      onMouseDown={handleMouseDown}
    >
      {/*connector anchor dot*/}
      <div
        className={`${styles.connDot} ${locked ? styles.connDotLocked : ""}`}
        onMouseDown={handleConnMouseDown}
        title="Arraste para mover o ponto de conexão"
      />

      {/*header */}
      <div className={styles.cardHeader}>
        <span className={styles.cardIcon}>⊕</span>
        <span className={styles.cardTitle}>{point}</span>
        <span className={styles.cardSubtitle}>AUTOSIGMA</span>
      </div>

      {/*table */}
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

export default memo(PointCard);


