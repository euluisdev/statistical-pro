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
    const src =
      element.type === "image"
        ? `${API}${element.chart.url}`
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
    {isSelected ? (
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
          color: element.color,
          lineHeight: "1.2"
        }}
      />
    ) : (
      <div
        className={styles.textRender}
        style={{
          fontSize: `${element.fontSize}px`,
          fontWeight: element.fontWeight,
          fontStyle: element.fontStyle,
          textDecoration: element.textDecoration,
          color: element.color,
          lineHeight: "1.2",
          whiteSpace: "pre-wrap",
          width: "100%",
          height: "100%"
        }}
      >
        {element.content}
      </div>
    )}

    {isSelected && renderActions()}
  </>
);

  const renderActions = () => (
    <>
      <div
        onMouseDown={(e) => onResizeMouseDown(e, element, "nw")}
        className={`${styles.resizeHandle} ${styles.nw}`}
      />
      <div
        onMouseDown={(e) => onResizeMouseDown(e, element, "ne")}
        className={`${styles.resizeHandle} ${styles.ne}`}
      />
      <div
        onMouseDown={(e) => onResizeMouseDown(e, element, "sw")}
        className={`${styles.resizeHandle} ${styles.sw}`}
      />
      <div
        onMouseDown={(e) => onResizeMouseDown(e, element, "se")}
        className={`${styles.resizeHandle} ${styles.se}`}
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
        border: isSelected ? "1.5px dashed #000" : "1.5px solid transparent",
        cursor: isSelected ? "move" : "pointer",
        boxShadow: isSelected ? "0 0 0 1px rgba(66, 153, 225, 0.02)" : "none"
      }}
    >
      {(element.type === "image" || element.type === "external-image") && renderImage()}
      {element.type === "text" && renderText()}
    </div>
  );
}