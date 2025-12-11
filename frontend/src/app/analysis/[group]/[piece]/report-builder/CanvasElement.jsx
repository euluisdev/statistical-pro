import { Copy, Trash2 } from "lucide-react";
import styles from "./reportbuilder.module.css";

export default function CanvasElement({
  element,
  isSelected,
  currentJobId,
  API,
  onMouseDown,
  onDoubleClick,
  onResizeMouseDown,
  onUpdate,
  onDuplicate,
  onDelete
}) {
  
  const renderImage = () => {
    const src = element.type === "image" 
      ? `${API}/static/jobs/${currentJobId}/${element.chart.group}/${element.chart.filename}`
      : element.src;
    
    const filename = element.type === "image" ? element.chart.filename : element.filename;

    return (
      <>
        <img
          src={src}
          alt={filename}
          className={styles.image}
          draggable={false}
          crossOrigin="anonymous"
          onError={(e) => {
            console.error("Erro ao carregar imagem:", filename);
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML += `<div style="padding: 1rem; color: red; text-align: center;">❌ Erro ao carregar: ${filename}</div>`;
          }}
        />
        {isSelected && renderActions()}
      </>
    );
  };

  const renderText = () => (
    <>
      <textarea
        value={element.content}
        onChange={(e) => onUpdate(element.id, { content: e.target.value })}
        onClick={(e) => e.stopPropagation()}
        className={styles.textarea}
        style={{
          fontSize: `${element.fontSize}px`,
          fontWeight: element.fontWeight,
          fontStyle: element.fontStyle,
          textDecoration: element.textDecoration,
          color: element.color
        }}
      />
      {isSelected && renderActions()}
    </>
  );

  const renderActions = () => (
    <>
      <div
        onMouseDown={(e) => onResizeMouseDown(e, element)}
        className={styles.resizeHandle}
      />
      <div className={styles.elementActions}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate(element.id);
          }}
          className={`${styles.actionButton} ${styles.duplicateButton}`}
        >
          <Copy size={14} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(element.id);
          }}
          className={`${styles.actionButton} ${styles.deleteButton}`}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </>
  );

  return (
    <div
      onMouseDown={(e) => onMouseDown(e, element)}
      onDoubleClick={() => onDoubleClick(element.id)}
      className={styles.canvasElement}
      style={{
        left: `${element.x}px`,
        top: `${element.y}px`,
        width: `${element.width}px`,
        height: element.type === "text" ? `${element.height}px` : "auto",
        border: isSelected ? "2px solid #4299e1" : "2px solid transparent",
        cursor: isSelected ? "move" : "pointer",
        boxShadow: isSelected ? "0 0 0 1px rgba(66, 153, 225, 0.3)" : "none"
      }}
    >
      {(element.type === "image" || element.type === "external-image") && renderImage()}
      {element.type === "text" && renderText()}
    </div>
  );
}