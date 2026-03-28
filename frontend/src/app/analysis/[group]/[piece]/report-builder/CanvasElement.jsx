import { useState, useRef, memo } from "react";
import { Copy, Trash2 } from "lucide-react";
import styles from "./reportbuilder.module.css";

function CanvasElement({
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
  // ── modo de edição de texto (duplo clique = edita, clique fora = move) ────
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef(null);

  function handleElementMouseDown(e) {
    if (isEditing) {
      // dentro do modo de edição, não propaga para o drag
      e.stopPropagation();
      return;
    }
    onMouseDown(e, element);
  }

  function handleElementDoubleClick(e) {
    if (element.type !== "text") return;
    e.stopPropagation();
    setIsEditing(true);
    // foca no textarea após render
    setTimeout(() => textareaRef.current?.focus(), 0);
  }

  function handleTextareaBlur() {
    setIsEditing(false);
  }

  // ── estilos de texto compartilhados entre div e textarea ─────────────────
  const textStyle = {
    fontSize: `${element.fontSize}px`,
    fontWeight: element.fontWeight,
    fontStyle: element.fontStyle,
    textDecoration: element.textDecoration,
    color: element.color,
    textAlign: element.textAlign || "left",
    lineHeight: "1.4",
    fontFamily: "inherit",
    // garante que div e textarea ocupam exatamente o mesmo espaço
    width: "100%",
    height: "100%",
    padding: "8px",
    margin: 0,
    boxSizing: "border-box",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  };

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
            e.target.style.display = "none";
            e.target.parentElement.innerHTML += `<div style="padding:1rem;color:red;text-align:center;">❌ Erro ao carregar: ${filename}</div>`;
          }}
        />
        {isSelected && renderActions()}
      </>
    );
  };

  const renderText = () => (
    <>
      {isEditing ? (
        // ── modo edição: textarea transparente, mesmos estilos do div ──────
        <textarea
          ref={textareaRef}
          value={element.content}
          onChange={(e) => onUpdate(element.id, { content: e.target.value })}
          onBlur={handleTextareaBlur}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            ...textStyle,
            border: "none",
            outline: "none",
            background: "transparent",
            resize: "none",
            display: "block",
            overflow: "hidden",
          }}
        />
      ) : (
        // ── modo visualização: div com mesmos estilos exatos ─────────────
        <div style={{ ...textStyle, overflow: "hidden", display: "block" }}>
          {element.content}
        </div>
      )}

      {/* handles e botões só aparecem quando selecionado (não depende de isEditing) */}
      {isSelected && renderActions()}
    </>
  );

  const renderActions = () => (
    <>
      {/* resize handles nos 4 cantos */}
      <div onMouseDown={(e) => { e.stopPropagation(); onResizeMouseDown(e, element, "nw"); }} className={`${styles.resizeHandle} ${styles.nw}`} />
      <div onMouseDown={(e) => { e.stopPropagation(); onResizeMouseDown(e, element, "ne"); }} className={`${styles.resizeHandle} ${styles.ne}`} />
      <div onMouseDown={(e) => { e.stopPropagation(); onResizeMouseDown(e, element, "sw"); }} className={`${styles.resizeHandle} ${styles.sw}`} />
      <div onMouseDown={(e) => { e.stopPropagation(); onResizeMouseDown(e, element, "se"); }} className={`${styles.resizeHandle} ${styles.se}`} />

      {/* botões de ação */}
      <div className={styles.elementActions}>
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onDuplicate(element.id); }}
          className={`${styles.actionButton} ${styles.duplicateButton}`}
        >
          <Copy size={14} />
        </button>
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onDelete(element.id); }}
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
          ? isEditing
            ? "1.5px solid #4299e1"   // azul sólido = modo edição
            : "1.5px dashed #000"     // preto tracejado = selecionado/movendo
          : "none",
        cursor: isEditing ? "text" : isSelected ? "move" : "pointer",
      }}
    >
      {(element.type === "image" || element.type === "external-image") && renderImage()}
      {element.type === "text" && renderText()}
    </div>
  );
}  
 
function areEqual(prev, next) {
  return (
    prev.isSelected === next.isSelected &&
    prev.element === next.element
  );
}

export default memo(CanvasElement, areEqual);
 