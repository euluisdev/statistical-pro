"use client";

import { memo } from "react";
import styles from "./capability.module.css";

function ConnectorOverlay({ cards, canvasW, canvasH }) {
  return (
    <svg className={styles.connectorSvg} width={canvasW} height={canvasH}>
      {cards.map((c) => {
        const cardW = 260;
        const cardH = 20 + c.axes.length * 22;
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

export default memo(ConnectorOverlay);
 
 
 