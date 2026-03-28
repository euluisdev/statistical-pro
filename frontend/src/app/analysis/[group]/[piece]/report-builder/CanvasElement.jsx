import { useState, useRef, memo, useCallback } from "react";
import { Copy, Trash2 } from "lucide-react";
import { useReportStore } from "./useReportStore";
import styles from "./reportbuilder.module.css";

function CanvasElement({ elementId, isSelected, API }) {
  //subscreve s´ó ao elemento específico selector preciso
  const element = useReportStore(
    (s) => s.pages[s.currentPageIndex]?.elements.find((el) => el.id === elementId)
  );

  //actions do store
  const updateElement = useReportStore((s) => s.updateElement);
  const deleteElement = useReportStore((s) => s.deleteElement);
  const duplicateElement = useReportStore((s) => s.duplicateElement);
  const handleMouseDown = useReportStore((s) => s._handleMouseDown); //injetado pelo useDragDrop via store
  const handleDoubleClick = useReportStore((s) => s._handleDoubleClick);
  const handleResizeMouseDown = useReportStore((s) => s._handleResizeMouseDown);

  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef(null);

  //sem element
  if (!element) return null;

  function handleElementMouseDown(e) {
    if (isEditing) { e.stopPropagation(); return; }
    handleMouseDown(e, element);
  }

  function handleElementDoubleClick(e) {
    if (element.type !== "text") return;
    e.stopPropagation();
    setIsEditing(true);
    requestAnimationFrame(() => textareaRef.current?.focus());
  }

  const textStyle = {
    fontSize: `${element.fontSize}px`,
    fontWeight: element.fontWeight,
    fontStyle: element.fontStyle,
    textDecoration: element.textDecoration,
    color: element.color,
    textAlign: element.textAlign || "left",
    lineHeight: "1.4",
    fontFamily: "inherit",
    width: "100%", height: "100%",
    padding: "8px", margin: 0,
    boxSizing: "border-box",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    backgroundColor: element.backgroundColor || "transparent",
    transition: "background-color 0.1s ease",
  };

  const renderImage = () => {
    const src = element.type === "image" ? `${API}${element.chart.url}` : element.src;
    const filename = element.type === "image" ? element.chart.filename : element.filename;
    return (
      <>
        <img
          src={src} alt={filename}
          className={styles.image}
          draggable={false}
          crossOrigin="anonymous"
          onError={(e) => {
            e.target.style.display = "none";
            e.target.parentElement.innerHTML +=
              `<div style="padding:1rem;color:red;text-align:center;">❌ ${filename}</div>`;
          }}
        />
        {isSelected && renderActions()}
      </>
    );
  };

  const renderText = () => (
    <>
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={element.content}
          onChange={(e) => updateElement(element.id, { content: e.target.value })}
          onBlur={() => setIsEditing(false)}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          style={{ ...textStyle, border: "none", outline: "none", backgroundColor: element.backgroundColor || "transparent", resize: "none", display: "block", overflow: "hidden" }}
        />
      ) : (
        <div style={{ ...textStyle, overflow: "hidden", display: "block" }}>
          {element.content}
        </div>
      )}
      {isSelected && renderActions()}
    </>
  );

  const renderActions = () => (
    <>
      {["nw", "ne", "sw", "se"].map((dir) => (
        <div
          key={dir}
          onMouseDown={(e) => { e.stopPropagation(); handleResizeMouseDown(e, element, dir); }}
          className={`${styles.resizeHandle} ${styles[dir]}`}
        />
      ))}
      <div className={styles.elementActions}>
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); duplicateElement(element.id); }}
          className={`${styles.actionButton} ${styles.duplicateButton}`}
        >
          <Copy size={14} />
        </button>
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); deleteElement(element.id); }}
          className={`${styles.actionButton} ${styles.deleteButton}`}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </>
  );

  return (
    <div
      onMouseDown={handleElementMouseDown}
      onDoubleClick={handleElementDoubleClick}
      className={styles.canvasElement}
      style={{
        left: `${element.x}px`,
        top: `${element.y}px`,
        width: `${element.width}px`,
        height: element.type === "text" ? `${element.height}px` : "auto",
        outline: isSelected
          ? isEditing ? "1.5px solid #4299e1" : "1.5px dashed #000"
          : "none",
        cursor: isEditing ? "text" : isSelected ? "move" : "pointer",
      }}
    >
      {(element.type === "image" || element.type === "external-image") && renderImage()}
      {element.type === "text" && renderText()}
    </div>
  );
}

//memo compara apenas id e isSelected — o elemento interno
//é buscado direto do store com selector preciso
function areEqual(prev, next) {
  return prev.elementId === next.elementId && prev.isSelected === next.isSelected;
}

export default memo(CanvasElement, areEqual);


