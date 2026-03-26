import { useMemo } from "react";
import { computeCells, GRID_LAYOUTS } from "./gridSnap";
 
export default function GridOverlay({ gridLayout, pageOrientation, visible }) {
  const cells = useMemo(() => {
    if (!visible || !gridLayout || gridLayout === "free") return [];
    const layout = GRID_LAYOUTS.find((l) => l.id === gridLayout);
    if (!layout?.cols) return [];
    return computeCells(pageOrientation || "landscape", layout.cols, layout.rows);
  }, [visible, gridLayout, pageOrientation]);
 
  if (!visible || cells.length === 0) return null;
 
  return (
    <>
      {cells.map((cell, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: cell.x,
            top: cell.y,
            width: cell.width,
            height: cell.height,
            border: "2px dashed #4299e1",
            borderRadius: "4px",
            backgroundColor: "rgba(66, 153, 225, 0.06)",
            pointerEvents: "none",
            boxSizing: "border-box",
            transition: "opacity 0.15s",
          }}
        />
      ))}
    </>
  );
}  
 
 