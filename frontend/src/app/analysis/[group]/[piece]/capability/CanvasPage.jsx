"use client";
 
import { useRef, memo } from "react";
import styles from "./capability.module.css";
import PointCard from "./PointCard";
import ConnectorOverlay from "./ConnectorOverlay";
 
export const CANVAS_W = 1165;
export const CANVAS_H = 660;
 
const CanvasPage = memo(function CanvasPage({
  pageIndex,
  cards,
  locked,
  bgImage,
  onDrop,
  onCardDrag,
  onConnectorDrag,
  selectedCardId,
  onSelectCard,
}) {
  const canvasRef = useRef(null);
 
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
      {bgImage ? (
        <img src={bgImage} className={styles.canvasBg} alt="peça" draggable={false} />
      ) : (
        <div className={styles.canvasBgHint}>
          {locked ? "Sem imagem" : "⬇ Arraste a imagem da peça aqui"}
        </div>
      )}
 
      <ConnectorOverlay cards={cards} canvasW={CANVAS_W} canvasH={CANVAS_H} />
 
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
 
      <div className={styles.pageNum}>Pág. {pageIndex + 1}</div>
    </div>
  );
});
 
export default CanvasPage;  
 
 